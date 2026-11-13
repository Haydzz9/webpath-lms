# WebPath LMS

A freeCodeCamp-style learning platform for **CSAE 104 · Web Programming**.
Students sign up with their school email, solve auto-graded coding challenges
in the browser, pass a quiz, submit a project, and earn a certificate for each
of seven languages: HTML, CSS, JavaScript, React, Node.js, MongoDB, PostgreSQL.

- **Front end:** React 18 + Vite (static site; host it anywhere)
- **Accounts and data:** Supabase (Auth + PostgreSQL with Row Level Security)
- **Grading:** runs in the student's browser inside a sandboxed iframe;
  PostgreSQL challenges run on PGlite (real Postgres compiled to WebAssembly)

## 1. Try it now (demo mode, no setup)

```bash
npm install
npm run dev
```

Open the printed address. With no Supabase keys, the app runs in **demo mode**:
accounts and progress are stored in that browser only. Tick "Make this an
instructor account" on the sign-up form to see the instructor dashboard.

## 2. Go live with Supabase (about 15 minutes)

1. Create a free project at supabase.com.
2. **SQL Editor** → paste and run `supabase/schema.sql`, then `supabase/tracks.sql`.
3. **Project Settings → API** → copy the Project URL and the `anon` public key
   into a new `.env` file (copy `.env.example`).
4. **Authentication → URL Configuration** → set *Site URL* to where the app
   will be hosted (step 3 below).
5. **Authentication → Sign In / Providers → Email**: decide on "Confirm email".
   Supabase's built-in mailer only sends a few emails per hour, so for a whole
   class signing up at once either add your own SMTP (Authentication → Emails)
   or turn confirmation off for sign-up day and back on afterwards.
6. `npm run dev`, sign up with your own school email, then make yourself the
   instructor in the SQL Editor:

   ```sql
   update public.profiles set role = 'instructor' where email = 'you@dmmmsu.edu.ph';
   ```

Only `@dmmmsu.edu.ph` addresses can register. That rule is enforced in the
database (`handle_new_user` in `schema.sql`) and mirrored in `src/config.js`;
change both to allow another domain.

## 3. Deploy

`npm run build` produces a static site in `dist/`. The keys in `.env` are baked
in at build time (the anon key is designed to be public; Row Level Security is
what protects the data).

- **Vercel / Netlify:** import the repository, build command `npm run build`,
  output folder `dist`, and add the two `VITE_SUPABASE_*` environment variables.
- **GitHub Pages:** build locally and publish the `dist/` folder (for example
  with the `gh-pages` package). No rewrite rules are needed; the app uses
  hash URLs.

## How a certificate is earned

| Step | Checked by |
| --- | --- |
| All coding challenges in the track | Automatic tests in the browser |
| Quiz at 75% or better (retakes allowed, reshuffled) | Automatic |
| Certification project (GitHub or live link) | **You**, in Instructor → Project reviews |
| Certificate | Issued by the database function `claim_certificate`, which re-checks all three |

Each certificate has a public link (`/#/certificate/<id>`) that anyone can open
to verify it, and prints to A4 landscape / PDF.

## Editing and adding content

Everything students see is plain JavaScript data in `src/content/`, one file
per track: `challenges` (instructions, starting code, tests), `quiz` (the
**first** choice is the correct one; choices are shuffled on screen) and
`project`. Reference solutions are in `solutions/`.

After any content change:

```bash
npm run verify       # runs every solution and every seed through the grader in Chrome
npm run tracks-sql   # regenerates supabase/tracks.sql; run it again in the SQL Editor
```

`verify` confirms each solution passes all tests, each starting code does not,
and that quiz choices are similar in length.

Names, sections, the pass mark and the certificate signatory are in `src/config.js`.

## Good to know

- **Solutions and tests are in the source.** Keep the GitHub repository
  private, or delete `solutions/` before making it public.
- **Challenge and quiz grading happens in the browser**, as on freeCodeCamp. A
  determined student could mark a challenge complete without solving it. The
  instructor-approved project is the step that cannot be faked, which is why a
  certificate requires it. For graded exams, run quizzes supervised in the lab.
- **Node.js and MongoDB challenges run on in-browser simulations** (`require`
  supports `fs`, `path`, `events`, `http`, `express`; the `db` object supports
  the common mongosh methods through the mingo query engine). Real servers and
  MongoDB Atlas are exercised in the certification projects.
- The database side (sign-up rule, row security, certificate rules) was tested
  on a local PostgreSQL, not against a live Supabase project. Run through
  sign-up → challenge → quiz → project → approve → claim once after setup.

## Project map

```
src/content/      tracks: challenges, quizzes, projects
src/sandbox/      code that runs inside the grading iframe (bundled to public/sandbox)
src/runner/       starts the iframe / PGlite and collects results
src/lib/          Supabase data layer, demo-mode data layer, app state
src/pages/        screens
supabase/         schema.sql (tables, security, functions), tracks.sql
solutions/        reference solutions used by `npm run verify`
```
