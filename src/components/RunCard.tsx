import { Link } from 'react-router-dom'
import type { Run, RunStatus } from '../types'

interface Props {
  run: Run
}

const statusStyle: Record<RunStatus, { color: string; bg: string }> = {
  pending:   { color: 'var(--text-muted)', bg: 'rgba(139,143,163,0.15)' },
  running:   { color: 'var(--success)',    bg: 'rgba(34,197,94,0.15)'   },
  completed: { color: 'var(--accent)',     bg: 'rgba(99,102,241,0.15)'  },
  failed:    { color: 'var(--danger)',     bg: 'rgba(239,68,68,0.15)'   },
  stopped:   { color: 'var(--warning)',    bg: 'rgba(245,158,11,0.15)'  },
}

export default function RunCard({ run }: Props) {
  const s = statusStyle[run.status]
  return (
    <Link
      to={`/runs/${run.id}`}
      style={{
        display: 'block',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '14px 18px',
        textDecoration: 'none',
        color: 'var(--text)',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>
          {run.id.slice(0, 12)}
        </span>
        <span
          style={{
            ...s,
            padding: '2px 9px',
            borderRadius: 12,
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'capitalize',
          }}
        >
          {run.status}
        </span>
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
        {run.model_provider}/{run.model_name}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
        {run.game} &middot; {run.input_mode}
      </div>
      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
        <span>Steps: <b style={{ color: 'var(--text)' }}>{run.steps_completed}</b></span>
        <span>Badges: <b style={{ color: 'var(--text)' }}>{run.final_badges}</b></span>
        <span>Location: <b style={{ color: 'var(--text)' }}>{run.final_location || '—'}</b></span>
      </div>
    </Link>
  )
}
