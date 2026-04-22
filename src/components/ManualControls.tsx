import { useEffect, useRef, useState, useCallback } from 'react'
import type { SaveState } from '../types'
import { api } from '../api/client'

interface Props {
  runId: string
  game: string
}

const BUTTONS: { key: string; label: string }[] = [
  { key: 'up', label: '↑' },
  { key: 'down', label: '↓' },
  { key: 'left', label: '←' },
  { key: 'right', label: '→' },
  { key: 'A', label: 'A' },
  { key: 'B', label: 'B' },
  { key: 'L', label: 'L' },
  { key: 'R', label: 'R' },
  { key: 'start', label: 'Start' },
  { key: 'select', label: 'Select' },
]

const KEY_MAP: Record<string, string> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  z: 'B',
  x: 'A',
  a: 'L',
  s: 'R',
  Enter: 'start',
  Shift: 'select',
}

async function post(runId: string, path: string, body: unknown = {}) {
  const res = await fetch(`/api/runs/${runId}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

async function get(runId: string, path: string) {
  const res = await fetch(`/api/runs/${runId}${path}`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export default function ManualControls({ runId, game }: Props) {
  const [frameSrc, setFrameSrc] = useState<string | null>(null)
  const [gameState, setGameState] = useState<string>('')
  const [waitFrames, setWaitFrames] = useState(60)
  const [pressFrames, setPressFrames] = useState(6)
  const [saveLabel, setSaveLabel] = useState('')
  const [saveStates, setSaveStates] = useState<SaveState[]>([])
  const [error, setError] = useState<string | null>(null)
  const frameUrlRef = useRef<string | null>(null)

  const refreshFrame = useCallback(async () => {
    try {
      const res = await fetch(`/api/runs/${runId}/frame?t=${Date.now()}`)
      if (!res.ok) return
      const blob = await res.blob()
      if (frameUrlRef.current) URL.revokeObjectURL(frameUrlRef.current)
      const url = URL.createObjectURL(blob)
      frameUrlRef.current = url
      setFrameSrc(url)
      const st = await get(runId, '/state')
      setGameState(st.text)
    } catch {}
  }, [runId])

  const refreshSaves = useCallback(() => {
    api.listSaveStates({ game }).then(setSaveStates).catch(() => {})
  }, [game])

  useEffect(() => {
    refreshFrame()
    refreshSaves()
  }, [refreshFrame, refreshSaves])

  const press = useCallback(async (button: string) => {
    try {
      await post(runId, '/press', { button, frames: pressFrames })
      await refreshFrame()
    } catch (e) {
      setError(String(e))
    }
  }, [runId, pressFrames, refreshFrame])

  const advance = async () => {
    try {
      await post(runId, '/wait', { frames: waitFrames })
      await refreshFrame()
    } catch (e) {
      setError(String(e))
    }
  }

  const saveState = async () => {
    if (!saveLabel.trim()) {
      setError('Label required')
      return
    }
    try {
      await post(runId, '/save-state', { label: saveLabel.trim(), curated: true })
      setSaveLabel('')
      refreshSaves()
    } catch (e) {
      setError(String(e))
    }
  }

  const loadState = async (state_id: string) => {
    try {
      await post(runId, '/load-state', { state_id })
      await refreshFrame()
    } catch (e) {
      setError(String(e))
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const btn = KEY_MAP[e.key]
      if (btn) {
        e.preventDefault()
        press(btn)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [press])

  const inputStyle: React.CSSProperties = {
    background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6,
    padding: '7px 10px', color: 'var(--text)', fontSize: 13,
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
      <div>
        <div style={{ background: '#000', borderRadius: 8, padding: 10, display: 'inline-block', marginBottom: 16 }}>
          {frameSrc && (
            <img
              src={frameSrc}
              alt="game frame"
              style={{ width: 480, height: 320, imageRendering: 'pixelated', display: 'block' }}
            />
          )}
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 14, marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginBottom: 8 }}>
            Controls · arrows, Z=B, X=A, A=L, S=R, Enter=Start, Shift=Select
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
            {BUTTONS.map(b => (
              <button
                key={b.key}
                onClick={() => press(b.key)}
                style={{
                  background: 'var(--bg)', color: 'var(--text)',
                  border: '1px solid var(--border)', borderRadius: 6,
                  padding: '10px 0', fontSize: 14, fontWeight: 700,
                  cursor: 'pointer',
                }}
              >{b.label}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Press frames:</label>
            <input
              type="number" min={2} max={60}
              value={pressFrames}
              onChange={e => setPressFrames(Number(e.target.value) || 6)}
              style={{ ...inputStyle, width: 70 }}
            />
            <label style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 12 }}>Wait:</label>
            <input
              type="number" min={1}
              value={waitFrames}
              onChange={e => setWaitFrames(Number(e.target.value) || 60)}
              style={{ ...inputStyle, width: 70 }}
            />
            <button
              onClick={advance}
              style={{
                background: 'var(--bg)', color: 'var(--text)',
                border: '1px solid var(--border)', borderRadius: 6,
                padding: '7px 14px', fontSize: 12, cursor: 'pointer',
              }}
            >Advance</button>
          </div>
        </div>

        <pre style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 8, padding: 14, fontSize: 12, color: 'var(--text)',
          whiteSpace: 'pre-wrap', fontFamily: 'monospace', maxHeight: 240, overflow: 'auto',
        }}>{gameState || '(state not yet loaded)'}</pre>
      </div>

      <div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 14, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Save Current State</div>
          <input
            style={{ ...inputStyle, width: '100%', marginBottom: 10 }}
            placeholder="e.g. pre-brock, mt-moon-entrance"
            value={saveLabel}
            onChange={e => setSaveLabel(e.target.value)}
          />
          <button
            onClick={saveState}
            style={{
              width: '100%', background: 'var(--accent)', color: '#fff',
              border: 'none', borderRadius: 6, padding: '8px', fontWeight: 600,
              fontSize: 13, cursor: 'pointer',
            }}
          >+ Save as curated</button>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>
            Saved States ({saveStates.length})
          </div>
          {saveStates.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>None yet.</p>
          ) : (
            <div style={{ maxHeight: 400, overflow: 'auto' }}>
              {saveStates.map(s => (
                <div key={s.id} style={{
                  padding: '8px 10px', borderRadius: 6, background: 'var(--bg)',
                  marginBottom: 6, fontSize: 12,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text)' }}>{s.label ?? s.id.slice(0, 10)}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                      {s.location || '—'} · {s.badges} badges
                    </div>
                  </div>
                  <button
                    onClick={() => loadState(s.id)}
                    style={{
                      background: 'transparent', color: 'var(--accent)',
                      border: '1px solid var(--accent)', borderRadius: 4,
                      padding: '4px 10px', fontSize: 11, cursor: 'pointer',
                    }}
                  >Load</button>
                </div>
              ))}
            </div>
          )}
        </div>
        {error && <div style={{ color: 'var(--danger)', fontSize: 13, marginTop: 10 }}>{error}</div>}
      </div>
    </div>
  )
}
