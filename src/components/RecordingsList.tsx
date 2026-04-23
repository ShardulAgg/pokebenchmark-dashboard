import { useEffect, useState } from 'react'
import { listRecordings, type Recording } from '../api/recordings'

interface Props {
  runId: string
  refreshKey?: number
}

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function fmtMtime(mtime: number): string {
  return new Date(mtime * 1000).toLocaleString()
}

export default function RecordingsList({ runId, refreshKey }: Props) {
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = () =>
      listRecordings(runId)
        .then((r) => { if (!cancelled) setRecordings(r) })
        .catch((e) => { if (!cancelled) setError(String(e)) })
    load()
    const id = setInterval(load, 5000)
    return () => { cancelled = true; clearInterval(id) }
  }, [runId, refreshKey])

  if (error) {
    return (
      <div style={{ color: 'var(--danger)', fontFamily: 'monospace', fontSize: 12 }}>
        Failed to load recordings: {error}
      </div>
    )
  }

  if (recordings.length === 0) {
    return (
      <div style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: 12 }}>
        No recordings yet. Recordings are captured while a WS play session is active.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {recordings.map((r) => (
        <div key={r.filename} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-muted)' }}>
            {r.filename} &middot; {fmtSize(r.size_bytes)} &middot; {fmtMtime(r.mtime)}
          </div>
          <video
            controls
            preload="metadata"
            src={r.url}
            style={{ width: 480, height: 320, background: '#000', imageRendering: 'pixelated' }}
          />
        </div>
      ))}
    </div>
  )
}
