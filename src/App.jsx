import { Link, Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { config } from './config.js'
import { api, isDemo } from './lib/api.js'
import { useStore } from './lib/store.jsx'
import Auth from './pages/Auth.jsx'
import Certificate from './pages/Certificate.jsx'
import Challenge from './pages/Challenge.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Instructor from './pages/Instructor.jsx'
import Landing from './pages/Landing.jsx'
import Project from './pages/Project.jsx'
import Quiz from './pages/Quiz.jsx'
import Track from './pages/Track.jsx'

function Header() {
  const { user, profile, isInstructor } = useStore()
  const navigate = useNavigate()
  return (
    <header className="topbar no-print">
      <Link to={user ? '/learn' : '/'} className="brand">
        <span className="brand-mark">&lt;/&gt;</span> {config.appName}
      </Link>
      <nav>
        {user ? (
          <>
            <NavLink to="/learn">My learning</NavLink>
            {isInstructor && <NavLink to="/instructor">Instructor</NavLink>}
            <span className="who">{profile?.full_name || user.email}</span>
            <button className="btn ghost small" onClick={async () => { await api.signOut(); navigate('/') }}>
              Sign out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Sign in</NavLink>
            <Link to="/signup" className="btn small">Sign up</Link>
          </>
        )}
      </nav>
    </header>
  )
}

function Private({ children, instructor }) {
  const { user, loaded, error, isInstructor } = useStore()
  const location = useLocation()
  if (user === undefined) return <p className="center muted">Loading…</p>
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (!loaded) return <p className="center muted">Loading your progress…</p>
  if (error) return <p className="center error">Could not load your data: {error}</p>
  if (instructor && !isInstructor) return <Navigate to="/learn" replace />
  return children
}

export default function App() {
  const { user } = useStore()
  const wide = /^\/learn\/[^/]+\/(?!quiz$|project$)[^/]+$/.test(useLocation().pathname)
  return (
    <>
      <Header />
      {isDemo && (
        <div className="demo-bar no-print">
          Demo mode: accounts and progress are saved in this browser only. Add your Supabase keys to go live (see README).
        </div>
      )}
      <main className={wide ? 'page wide' : 'page'}>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/learn" replace /> : <Landing />} />
          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/signup" element={<Auth mode="signup" />} />
          <Route path="/certificate/:id" element={<Certificate />} />
          <Route path="/learn" element={<Private><Dashboard /></Private>} />
          <Route path="/learn/:trackId" element={<Private><Track /></Private>} />
          <Route path="/learn/:trackId/quiz" element={<Private><Quiz /></Private>} />
          <Route path="/learn/:trackId/project" element={<Private><Project /></Private>} />
          <Route path="/learn/:trackId/:challengeId" element={<Private><Challenge /></Private>} />
          <Route path="/instructor" element={<Private instructor><Instructor /></Private>} />
          <Route path="*" element={<p className="center">Page not found. <Link to="/">Go home</Link></p>} />
        </Routes>
      </main>
    </>
  )
}
