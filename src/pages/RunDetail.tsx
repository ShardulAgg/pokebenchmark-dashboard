import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../api/client'
import { LiveConnection } from '../api/websocket'
import { stopPlay } from '../api/play'
import type { Run, Decision, LiveUpdate } from '../types'
import GameStream from '../components/GameStream'
import StatePanel from '../components/StatePanel'
import DecisionLog from '../components/DecisionLog'
import ManualControls from '../components/ManualControls'
import InlinePlay from '../components/InlinePlay'
import RecordingsList from '../components/RecordingsList'

export default function RunDetail() {
  const { runId } = useParams<{ runId: string }>()
  const [run, setRun] = useState<Run | null>(null)
  const [frame, setFrame] = useState<string | null>(null)
  const [state, setState] = useState<Record<string, unknown> | null>(null)
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [error, setError] = useState<string | null>(null)
  const [stopping, setStopping] = useState(false)
  const [mode, setMode] = useState<'normal' | 'ws'>('normal')
  const [switching, setSwitching] = useState(false)
  const liveRef = useRef<LiveConnection | null>(null)

  const switchTo = async (newMode: 'normal' | 'ws') => {
    if (newMode === mode || !run) return
    setSwitching(true)
    try {
      if (mode === 'ws') {
        // Stop the active play session before unmounting so the next /press
        // call from ManualControls doesn't trip the 409 conflict guard.
        await stopPlay(run.id).catch(() => {})
      }
      setMode(newMode)
    } finally {
      setSwitching(false)
    }
  }

  useEffect(() => {
    if (!runId) return
    api.getRun(runId)
      .then(r => {
        setRun(r)
        if (r.status === 'running' || r.status === 'pending') {
          liveRef.current = new LiveConnection(runId, (update: LiveUpdate) => {
            if (update.frame) setFrame(update.frame)
            if (update.state) setState(update.state)
            if (update.decision) setDecisions(prev => [...prev, update.decision!])
            if (update.status) setRun(prev => prev ? { ...prev, status: update.status! } : prev)
          })
        }
      })
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load run'))

    return () => {
      liveRef.current?.close()
      liveRef.current = null
    }
  }, [runId])

  const handleStop = async () => {
    if (!runId) return
    setStopping(true)
    try {
      await api.stopRun(runId)
      liveRef.current?.close()
      setRun(prev => prev ? { ...prev, status: 'stopped' } : prev)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to stop run')
    } finally {
      setStopping(false)
    }
  }

  if (error) return <div style={{ color: 'var(--danger)' }}>{error}</div>
  if (!run) return <div style={{ color: 'var(--text-muted)' }}>Loading...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
            {run.game}
          </h1>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            {run.id} &middot; {run.model_provider}/{run.model_name} &middot; {run.input_mode}
          </div>
        </div>
        {(run.status === 'running' || run.status === 'pending') && (
          <button
            onClick={handleStop}
            disabled={stopping}
            style={{
              background: 'var(--danger)',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '8px 18px',
              fontWeight: 600,
              fontSize: 13,
              opacity: stopping ? 0.6 : 1,
              cursor: stopping ? 'not-allowed' : 'pointer',
            }}
          >
            {stopping ? 'Stopping...' : 'Stop Run'}
          </button>
        )}
      </div>

      {run.model_provider === 'manual' ? (
        (run.status === 'running' || run.status === 'pending') ? (
          <>
            <div style={{ display: 'flex', gap: 0, marginBottom: 12 }}>
              <button
                type="button"
                onClick={() => switchTo('normal')}
                disabled={switching}
                style={{
                  padding: '6px 14px',
                  fontFamily: 'monospace',
                  cursor: switching ? 'not-allowed' : 'pointer',
                  border: '1px solid var(--border)',
                  borderRight: 'none',
                  borderRadius: '4px 0 0 4px',
                  background: mode === 'normal' ? 'var(--accent)' : 'var(--bg)',
                  color: mode === 'normal' ? '#fff' : 'var(--text)',
                  opacity: switching ? 0.6 : 1,
                }}
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() => switchTo('ws')}
                disabled={switching}
                style={{
                  padding: '6px 14px',
                  fontFamily: 'monospace',
                  cursor: switching ? 'not-allowed' : 'pointer',
                  border: '1px solid var(--border)',
                  borderRadius: '0 4px 4px 0',
                  background: mode === 'ws' ? 'var(--accent)' : 'var(--bg)',
                  color: mode === 'ws' ? '#fff' : 'var(--text)',
                  opacity: switching ? 0.6 : 1,
                }}
              >
                WS 60fps
              </button>
            </div>
            {mode === 'normal' ? (
              <ManualControls runId={run.id} game={run.game} />
            ) : (
              <InlinePlay runId={run.id} />
            )}
          </>
        ) : (
          <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
            This manual run is {run.status}. Controls are disabled.
          </div>
        )
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <GameStream frameHex={frame} />
            <StatePanel state={state} />
          </div>
          <div style={{ height: '100%' }}>
            <DecisionLog decisions={decisions} />
          </div>
        </div>
      )}

      <div style={{ marginTop: 28 }}>
        <h2 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600 }}>Recordings</h2>
        <RecordingsList runId={run.id} />
      </div>
    </div>
  )
}
