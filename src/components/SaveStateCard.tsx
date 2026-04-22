import type { SaveState } from '../types'

interface Props {
  saveState: SaveState
}

export default function SaveStateCard({ saveState }: Props) {
  const date = new Date(saveState.timestamp).toLocaleString()

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '14px 18px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>{saveState.label ?? saveState.id.slice(0, 12)}</span>
        {saveState.curated && (
          <span
            style={{
              background: 'rgba(99,102,241,0.15)',
              color: 'var(--accent)',
              borderRadius: 12,
              padding: '2px 9px',
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            Curated
          </span>
        )}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
        {saveState.game}
      </div>
      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
        <span>Badges: <b style={{ color: 'var(--text)' }}>{saveState.badges}</b></span>
        <span>Location: <b style={{ color: 'var(--text)' }}>{saveState.location || '—'}</b></span>
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{date}</div>
      {saveState.party_levels && (
        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
          Party: {saveState.party_levels}
        </div>
      )}
    </div>
  )
}
