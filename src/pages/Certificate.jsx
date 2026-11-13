import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { config } from '../config.js'
import { trackById } from '../content/index.js'
import { api } from '../lib/api.js'

// Public page: anyone with the link can confirm the certificate is genuine,
// because the details are read from the database, not from the URL.
export default function Certificate() {
  const { id } = useParams()
  const [cert, setCert] = useState(undefined)

  useEffect(() => {
    api.getCertificate(id).then(setCert).catch(() => setCert(null))
  }, [id])

  if (cert === undefined) return <p className="center muted">Checking certificate…</p>
  if (!cert)
    return (
      <div className="center">
        <h1>Certificate not found</h1>
        <p className="muted">No certificate exists with this ID. It may have been mistyped.</p>
        <Link to="/">Go to {config.appName}</Link>
      </div>
    )

  const track = trackById[cert.track_id]
  const date = new Date(cert.issued_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
  return (
    <div className="cert-wrap">
      <div className="cert-actions no-print">
        <span className="pill gold">Verified · issued by {config.appName}</span>
        <button className="btn" onClick={() => window.print()}>Print or save as PDF</button>
      </div>
      <article className="certificate" style={{ '--c': track?.color || '#0a7a5a' }}>
        <p className="cert-org">{config.institution}</p>
        <p className="cert-sub">{config.college} · {config.course}</p>
        <h1>Certificate of Mastery</h1>
        <p>This certifies that</p>
        <p className="cert-name">{cert.full_name}</p>
        <p>has completed every coding challenge, passed the concepts quiz and built an approved project in</p>
        <p className="cert-track">{track?.title || cert.track_id}</p>
        <div className="cert-foot">
          <div>
            <p className="line">{date}</p>
            <p className="cap">Date issued</p>
          </div>
          <div>
            <p className="line">{config.instructor}</p>
            <p className="cap">{config.instructorTitle}</p>
          </div>
        </div>
        <p className="cert-id">Certificate ID {cert.id} · verify at {window.location.href}</p>
      </article>
    </div>
  )
}
