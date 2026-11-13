import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { tracks } from '../content/index.js'
import { api } from './api.js'

const Ctx = createContext(null)
export const useStore = () => useContext(Ctx)

const empty = { profile: null, progress: [], quiz: [], projects: [], certs: [] }

export function StoreProvider({ children }) {
  const [user, setUser] = useState(undefined) // undefined = still checking
  const [data, setData] = useState(empty)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    try {
      setData(await api.myData())
      setError('')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoaded(true)
    }
  }, [])

  useEffect(() => {
    api.currentUser().then(setUser)
    return api.onAuth(setUser)
  }, [])

  useEffect(() => {
    if (user) refresh()
    else if (user === null) {
      setData(empty)
      setLoaded(false)
    }
  }, [user?.id, refresh])

  const value = useMemo(() => {
    const byItem = Object.fromEntries(data.progress.map((p) => [p.item_id, p]))
    const status = (track) => {
      const done = track.challenges.filter((c) => byItem[c.id]?.completed).length
      const attempts = data.quiz.filter((q) => q.track_id === track.id)
      const project = data.projects.find((p) => p.track_id === track.id) || null
      const cert = data.certs.find((c) => c.track_id === track.id) || null
      const quizPassed = attempts.some((q) => q.passed)
      const allDone = done === track.challenges.length
      const next = track.challenges.find((c) => !byItem[c.id]?.completed) || null
      return {
        done, total: track.challenges.length, allDone, attempts, quizPassed, project, cert, next,
        best: attempts.reduce((m, q) => Math.max(m, q.score), 0),
        canClaim: allDone && quizPassed && project?.status === 'approved' && !cert,
        // 4 steps toward a certificate: challenges, quiz, project, claim
        percent: Math.round(((done / track.challenges.length) * 70) + (quizPassed ? 15 : 0) + (project?.status === 'approved' ? 15 : 0)),
      }
    }
    // The most recently touched unfinished challenge, for "Continue".
    const recent = [...data.progress].sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''))[0]
    let resume = null
    if (recent) {
      const t = tracks.find((x) => x.id === recent.track_id)
      const c = t && (t.challenges.find((x) => x.id === recent.item_id && !byItem[x.id]?.completed) || status(t).next)
      if (t && c) resume = { track: t, challenge: c }
    }
    return {
      user, ...data, loaded, error, byItem, status, resume, refresh,
      isInstructor: data.profile?.role === 'instructor',
      /** Optimistic local update, then save. */
      async saveProgress(trackId, itemId, code, completed) {
        setData((d) => {
          const old = d.progress.find((p) => p.item_id === itemId)
          const row = { ...old, item_id: itemId, track_id: trackId, code, completed: !!(old?.completed || completed), updated_at: new Date().toISOString() }
          return { ...d, progress: [...d.progress.filter((p) => p.item_id !== itemId), row] }
        })
        await api.saveProgress(trackId, itemId, code, completed)
      },
    }
  }, [user, data, loaded, error, refresh])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
