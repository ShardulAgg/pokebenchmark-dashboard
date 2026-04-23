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

    startPlay(runId)
      .then(() => { if (mountedRef.current) setStarted(true) })
      .catch((e) => { if (mountedRef.current) setError(String(e)) })

    // Browser-close fires stop explicitly; React cleanup does NOT, because
    // StrictMode double-mount in dev would otherwise stop the session
    // out from under the remounting component. WS disconnect + 30s idle
    // auto-stop on the server handle the regular close path.
    const onUnload = () => { stopPlay(runId).catch(() => {}) }
    window.addEventListener('beforeunload', onUnload)

    return () => {
      mountedRef.current = false
      window.removeEventListener('beforeunload', onUnload)
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
