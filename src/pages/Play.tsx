import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import PlayCanvas from '../components/PlayCanvas'
import { startPlay, stopPlay } from '../api/play'

export default function Play() {
  const { runId = '' } = useParams<{ runId: string }>()
  const [started, setStarted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    // Kick off start; track the promise so cleanup can wait for it before
    // calling stop. Otherwise a fast unmount (StrictMode or user closes
    // immediately) can land stop before start, leaving a zombie session.
    const startPromise = startPlay(runId)
      .then(() => { if (mountedRef.current) setStarted(true) })
      .catch((e) => { if (mountedRef.current) setError(String(e)) })

    const onUnload = () => { stopPlay(runId).catch(() => {}) }
    window.addEventListener('beforeunload', onUnload)

    return () => {
      mountedRef.current = false
      window.removeEventListener('beforeunload', onUnload)
      // Wait for start to resolve (or fail) before firing stop, so we
      // don't race past a session that is about to be created.
      startPromise.finally(() => { stopPlay(runId).catch(() => {}) })
    }
  }, [runId])

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#000',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {error ? (
        <div style={{ color: '#f88', padding: 24, fontFamily: 'monospace' }}>
          Failed to start: {error}
        </div>
      ) : !started ? (
        <div style={{ color: '#888', fontFamily: 'monospace' }}>Starting…</div>
      ) : (
        <div style={{
          width: 'min(100vw, calc(100vh * 1.5))',
          aspectRatio: '3 / 2',
        }}>
          <PlayCanvas
            runId={runId}
            onClosed={() => {
              if (mountedRef.current) setError('connection closed')
            }}
          />
        </div>
      )}
    </div>
  )
}
