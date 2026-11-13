-- WebPath LMS — database schema for Supabase (PostgreSQL)
-- Run this whole file once in Supabase > SQL Editor, then run tracks.sql.

-- ---------------------------------------------------------------- profiles
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text not null default '',
  student_no  text not null default '',
  section     text not null default '',
  role        text not null default 'student' check (role in ('student', 'instructor')),
  created_at  timestamptz not null default now()
);

create or replace function public.is_instructor()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'instructor');
$$;

-- Creates the profile row on sign-up and rejects emails outside the school domain.
-- To allow another domain, add it to the array below (and to src/config.js).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if split_part(lower(new.email), '@', 2) <> all (array['dmmmsu.edu.ph']) then
    raise exception 'Only DMMMSU email addresses can sign up.';
  end if;
  insert into profiles (id, email, full_name, student_no, section)
  values (
    new.id, lower(new.email),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'student_no', ''),
    coalesce(new.raw_user_meta_data->>'section', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------------ tracks
-- One row per language. challenge_count is what a certificate requires;
-- regenerate tracks.sql with `npm run tracks-sql` after adding challenges.
create table if not exists public.tracks (
  id              text primary key,
  title           text not null,
  challenge_count int  not null
);

-- ---------------------------------------------------------------- progress
-- One row per student per challenge. `code` is the student's latest draft,
-- which is how they pick up where they left off on any computer.
create table if not exists public.progress (
  user_id      uuid not null references public.profiles(id) on delete cascade,
  item_id      text not null,
  track_id     text not null,
  code         text not null default '',
  completed    boolean not null default false,
  completed_at timestamptz,
  updated_at   timestamptz not null default now(),
  primary key (user_id, item_id)
);
create index if not exists progress_track_idx on public.progress (track_id, completed);

-- ------------------------------------------------------------ quiz attempts
create table if not exists public.quiz_attempts (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  track_id   text not null,
  score      int  not null,
  total      int  not null,
  passed     boolean not null,
  created_at timestamptz not null default now()
);
create index if not exists quiz_user_idx on public.quiz_attempts (user_id, track_id);

-- ------------------------------------------------------ project submissions
create table if not exists public.project_submissions (
  user_id      uuid not null references public.profiles(id) on delete cascade,
  track_id     text not null,
  url          text not null,
  notes        text not null default '',
  status       text not null default 'pending'
               check (status in ('pending', 'approved', 'needs_revision')),
  feedback     text not null default '',
  reviewed_by  uuid references public.profiles(id),
  reviewed_at  timestamptz,
  submitted_at timestamptz not null default now(),
  primary key (user_id, track_id)
);

-- Students can submit and resubmit, but can never set their own status.
create or replace function public.guard_submission()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if is_instructor() then
    new.reviewed_by := auth.uid();
    new.reviewed_at := now();
    return new;
  end if;
  if tg_op = 'UPDATE' and old.status = 'approved' then
    raise exception 'This project is already approved.';
  end if;
  new.status := 'pending';
  new.reviewed_by := null;
  new.reviewed_at := null;
  new.submitted_at := now();
  if tg_op = 'UPDATE' then new.feedback := old.feedback; else new.feedback := ''; end if;
  return new;
end;
$$;

drop trigger if exists guard_submission on public.project_submissions;
create trigger guard_submission
  before insert or update on public.project_submissions
  for each row execute function public.guard_submission();

-- ------------------------------------------------------------ certificates
create table if not exists public.certificates (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  track_id   text not null references public.tracks(id),
  full_name  text not null,
  issued_at  timestamptz not null default now(),
  unique (user_id, track_id)
);

-- The only way a certificate is created. Checks all three requirements
-- on the server: every challenge done, quiz passed, project approved.
create or replace function public.claim_certificate(p_track text)
returns public.certificates language plpgsql security definer set search_path = public as $$
declare
  v_need int;
  v_done int;
  v_cert certificates;
begin
  select challenge_count into v_need from tracks where id = p_track;
  if v_need is null then raise exception 'Unknown track.'; end if;

  select count(*) into v_done from progress
   where user_id = auth.uid() and track_id = p_track and completed;
  if v_done < v_need then
    raise exception 'Finish all challenges first (% of % done).', v_done, v_need;
  end if;
  if not exists (select 1 from quiz_attempts
                  where user_id = auth.uid() and track_id = p_track and passed) then
    raise exception 'Pass the quiz first.';
  end if;
  if not exists (select 1 from project_submissions
                  where user_id = auth.uid() and track_id = p_track and status = 'approved') then
    raise exception 'Your project has not been approved yet.';
  end if;

  insert into certificates (user_id, track_id, full_name)
  select auth.uid(), p_track, full_name from profiles where id = auth.uid()
  on conflict (user_id, track_id) do nothing;

  select * into v_cert from certificates where user_id = auth.uid() and track_id = p_track;
  return v_cert;
end;
$$;

-- Public lookup used by the certificate page, so anyone with the link can verify it.
create or replace function public.verify_certificate(p_id uuid)
returns table (id uuid, full_name text, track_id text, issued_at timestamptz)
language sql stable security definer set search_path = public as $$
  select id, full_name, track_id, issued_at from certificates where id = p_id;
$$;

-- Per-student, per-track completed counts for the instructor dashboard.
create or replace function public.class_progress()
returns table (user_id uuid, track_id text, done bigint)
language plpgsql stable security definer set search_path = public as $$
begin
  if not is_instructor() then raise exception 'Instructors only.'; end if;
  return query
    select p.user_id, p.track_id, count(*) from progress p
     where p.completed group by p.user_id, p.track_id;
end;
$$;

-- ------------------------------------------------------ row level security
alter table public.profiles            enable row level security;
alter table public.tracks              enable row level security;
alter table public.progress            enable row level security;
alter table public.quiz_attempts       enable row level security;
alter table public.project_submissions enable row level security;
alter table public.certificates        enable row level security;

-- Explicit table privileges (RLS policies below still decide which rows).
grant select on public.tracks to anon, authenticated;
grant select on public.profiles, public.certificates to authenticated;
grant select, insert, update on public.progress, public.project_submissions to authenticated;
grant select, insert on public.quiz_attempts to authenticated;

create policy "own profile or instructor" on public.profiles
  for select using (id = auth.uid() or is_instructor());
create policy "update own profile" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());
-- Students may edit their details but never their role.
revoke update on public.profiles from authenticated, anon;
grant update (full_name, student_no, section) on public.profiles to authenticated;

create policy "tracks readable" on public.tracks for select using (true);

create policy "read progress" on public.progress
  for select using (user_id = auth.uid() or is_instructor());
create policy "insert own progress" on public.progress
  for insert with check (user_id = auth.uid());
create policy "update own progress" on public.progress
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "read quiz attempts" on public.quiz_attempts
  for select using (user_id = auth.uid() or is_instructor());
create policy "insert own quiz attempt" on public.quiz_attempts
  for insert with check (user_id = auth.uid());

create policy "read submissions" on public.project_submissions
  for select using (user_id = auth.uid() or is_instructor());
create policy "insert own submission" on public.project_submissions
  for insert with check (user_id = auth.uid());
create policy "update submission" on public.project_submissions
  for update using (user_id = auth.uid() or is_instructor())
  with check (user_id = auth.uid() or is_instructor());

create policy "read certificates" on public.certificates
  for select using (user_id = auth.uid() or is_instructor());

grant execute on function public.verify_certificate(uuid) to anon, authenticated;
grant execute on function public.claim_certificate(text)  to authenticated;
grant execute on function public.class_progress()         to authenticated;

-- ------------------------------------------------- make yourself instructor
-- After you sign up in the app, run this once with your own email:
--   update public.profiles set role = 'instructor' where email = 'you@dmmmsu.edu.ph';
