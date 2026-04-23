import { useEffect, useRef, useState } from 'react'
import PlayCanvas from './PlayCanvas'
import StatePanel from './StatePanel'
import { startPlay, stopPlay } from '../api/play'

interface Props {
  runId: string
}

export default function InlinePlay({ runId }: Props) {
  const [started, setStarted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [state, setState] = useState<Record<string, unknown> | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    startPlay(runId)
      .then(() => { if (mountedRef.current) setStarted(true) })
      .catch((e) => { if (mountedRef.current) setError(String(e)) })

    // Browser-close fires stop explicitly. React cleanup does NOT, because
    // StrictMode double-mount in dev would otherwise stop the session
    // out from under the remounting component. Parent handles the explicit
    // stop when the user switches back to Normal mode; WS disconnect +
    // 30s idle auto-stop on the server handle every other path.
    const onUnload = () => { stopPlay(runId).catch(() => {}) }
    window.addEventListener('beforeunload', onUnload)

    return () => {
      mountedRef.current = false
      window.removeEventListener('beforeunload', onUnload)
    }
  }, [runId])

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '480px 1fr', gap: 18 }}>
      <div>
        <div style={{
          width: 480, height: 320, background: '#000',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {error ? (
            <div style={{ color: '#f88', padding: 12, fontFamily: 'monospace', fontSize: 12 }}>
              Failed to start: {error}
            </div>
          ) : !started ? (
            <div style={{ color: '#888', fontFamily: 'monospace' }}>Starting…</div>
          ) : (
            <PlayCanvas
              runId={runId}
              onClosed={() => {
                if (mountedRef.current) setError('connection closed')
              }}
              onState={setState}
            />
          )}
        </div>
        <div style={{
          marginTop: 8, fontSize: 11, color: 'var(--text-muted)',
          fontFamily: 'monospace',
        }}>
          Arrows: D-pad &middot; Z: B &middot; X: A &middot; A/S: L/R &middot; Enter: Start &middot; Shift: Select &middot; Space: hold for 4× fast-forward
        </div>
      </div>
      <StatePanel state={state} />
    </div>
  )
}
