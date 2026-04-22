import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import PlayCanvas from '../components/PlayCanvas'
import { startPlay, stopPlay } from '../api/play'

export default function Play() {
  const { runId = '' } = useParams<{ runId: string }>()
  const [started, setStarted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    startPlay(runId)
      .then(() => { if (!cancelled) setStarted(true) })
      .catch((e) => { if (!cancelled) setError(String(e)) })

    const onUnload = () => { stopPlay(runId).catch(() => {}) }
    window.addEventListener('beforeunload', onUnload)

    return () => {
      cancelled = true
      window.removeEventListener('beforeunload', onUnload)
      stopPlay(runId).catch(() => {})
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
          <PlayCanvas runId={runId} onClosed={() => setError('connection closed')} />
        </div>
      )}
    </div>
  )
}
