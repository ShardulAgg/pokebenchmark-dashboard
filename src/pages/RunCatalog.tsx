import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Run, RunStatus, GameName } from '../types'
import RunCard from '../components/RunCard'

const ALL_STATUSES: RunStatus[] = ['pending', 'running', 'completed', 'failed', 'stopped']
const ALL_GAMES: GameName[] = ['firered', 'emerald']

const selectStyle: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 6,
  padding: '6px 10px',
  color: 'var(--text)',
  fontSize: 13,
}

export default function RunCatalog() {
  const [runs, setRuns] = useState<Run[]>([])
  const [error, setError] = useState<string | null>(null)
  const [filterGame, setFilterGame] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    api.listRuns()
      .then(setRuns)
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load'))
  }, [])

  const filtered = runs.filter(r => {
    if (filterGame !== 'all' && r.game !== filterGame) return false
    if (filterStatus !== 'all' && r.status !== filterStatus) return false
    return true
  })

  return (
    <div>
      <h1 style={{ margin: '0 0 20px', fontSize: 22, fontWeight: 700 }}>Runs</h1>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <select style={selectStyle} value={filterGame} onChange={e => setFilterGame(e.target.value)}>
          <option value="all">All Games</option>
          {ALL_GAMES.map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <select style={selectStyle} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          {ALL_STATUSES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      {error && <div style={{ color: 'var(--danger)', marginBottom: 12 }}>{error}</div>}
      {filtered.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No runs found.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {filtered.map(r => <RunCard key={r.id} run={r} />)}
        </div>
      )}
    </div>
  )
}
