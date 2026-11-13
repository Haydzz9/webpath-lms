import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { config } from '../config.js'
import { api, isDemo } from '../lib/api.js'

export default function Auth({ mode }) {
  const signup = mode === 'signup'
  const navigate = useNavigate()
  const from = useLocation().state?.from || '/learn'
  const [f, setF] = useState({ email: '', password: '', fullName: '', studentNo: '', section: config.sections[0], demoInstructor: false })
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  async function submit(e) {
    e.preventDefault()
    setError('')
    const email = f.email.trim().toLowerCase()
    if (signup) {
      const domain = email.split('@')[1] || ''
      if (!config.allowedDomains.includes(domain))
        return setError(`Please use your school email (@${config.allowedDomains.join(' or @')}).`)
      if (f.password.length < 8) return setError('Use a password of at least 8 characters.')
      if (f.fullName.trim().length < 3) return setError('Enter your full name as it should appear on certificates.')
    }
    setBusy(true)
    try {
      if (signup) {
        const { needsConfirm } = await api.signUp({ ...f, email, fullName: f.fullName.trim(), studentNo: f.studentNo.trim() })
        if (needsConfirm) {
          setNotice('Account created. Check your school email for the confirmation link, then sign in.')
          return
        }
      } else {
        await api.signIn(email, f.password)
      }
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth card">
      <h1>{signup ? 'Create your account' : 'Welcome back'}</h1>
      <p className="muted">{signup ? `For students of ${config.course}.` : 'Sign in to continue where you left off.'}</p>
      {notice ? (
        <p className="notice">{notice}</p>
      ) : (
        <form onSubmit={submit}>
          {signup && (
            <>
              <label htmlFor="fullName">Full name</label>
              <input id="fullName" value={f.fullName} onChange={set('fullName')} placeholder="Juan A. Dela Cruz" required />
              <div className="two">
                <div>
                  <label htmlFor="studentNo">Student number</label>
                  <input id="studentNo" value={f.studentNo} onChange={set('studentNo')} />
                </div>
                <div>
                  <label htmlFor="section">Section</label>
                  <select id="section" value={f.section} onChange={set('section')}>
                    {config.sections.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}
          <label htmlFor="email">School email</label>
          <input id="email" type="email" value={f.email} onChange={set('email')} placeholder={`you@${config.allowedDomains[0]}`} required autoComplete="email" />
          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={f.password} onChange={set('password')} required autoComplete={signup ? 'new-password' : 'current-password'} />
          {signup && isDemo && (
            <label className="check">
              <input type="checkbox" checked={f.demoInstructor} onChange={set('demoInstructor')} /> Make this an instructor account (demo mode only)
            </label>
          )}
          {error && <p className="error" role="alert">{error}</p>}
          <button className="btn big full" disabled={busy}>{busy ? 'Please wait…' : signup ? 'Sign up' : 'Sign in'}</button>
        </form>
      )}
      <p className="muted small">
        {signup ? <>Already registered? <Link to="/login">Sign in</Link></> : <>New here? <Link to="/signup">Create an account</Link></>}
      </p>
    </div>
  )
}
