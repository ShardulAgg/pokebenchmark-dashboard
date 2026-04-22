import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { api } from '../api/client'
import type { Run } from '../types'

export default function Comparison() {
  const [runs, setRuns] = useState<Run[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.listRuns()
      .then(all => setRuns(all.filter(r => r.status === 'completed')))
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load'))
  }, [])

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectedRuns = runs.filter(r => selected.has(r.id))

  const chartData = selectedRuns.map(r => ({
    name: `${r.model_name.slice(0, 12)} (${r.id.slice(0, 8)})`,
    badges: r.final_badges,
    steps: r.steps_completed,
  }))

  return (
    <div>
      <h1 style={{ margin: '0 0 20px', fontSize: 22, fontWeight: 700 }}>Compare Runs</h1>
      {error && <div style={{ color: 'var(--danger)', marginBottom: 12 }}>{error}</div>}
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '16px 20px',
          marginBottom: 24,
        }}
      >
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, fontWeight: 600 }}>
          Select completed runs to compare (2 or more):
        </div>
        {runs.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No completed runs available.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {runs.map(r => (
              <label
                key={r.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  cursor: 'pointer',
                  fontSize: 13,
                  color: selected.has(r.id) ? 'var(--text)' : 'var(--text-muted)',
                }}
              >
                <input
                  type="checkbox"
                  checked={selected.has(r.id)}
                  onChange={() => toggle(r.id)}
                  style={{ width: 15, height: 15, accentColor: 'var(--accent)' }}
                />
                <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{r.id.slice(0, 12)}</span>
                <span>{r.game}</span>
                <span style={{ color: 'var(--text-muted)' }}>{r.model_provider}/{r.model_name}</span>
                <span>Badges: <b>{r.final_badges}</b></span>
                <span>Steps: <b>{r.steps_completed}</b></span>
              </label>
            ))}
          </div>
        )}
      </div>

      {selectedRuns.length >= 2 && (
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '20px',
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
            Badges Earned Comparison
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="name"
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                angle={-30}
                textAnchor="end"
              />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  color: 'var(--text)',
                }}
              />
              <Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: 12 }} />
              <Bar dataKey="badges" fill="var(--accent)" name="Badges Earned" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
