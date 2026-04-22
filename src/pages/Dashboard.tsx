import { useEffect, useState, useCallback } from 'react'
import { api } from '../api/client'
import type { Run } from '../types'
import RunCard from '../components/RunCard'
import NewRunForm from '../components/NewRunForm'

export default function Dashboard() {
  const [runs, setRuns] = useState<Run[]>([])
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const data = await api.listRuns()
      setRuns(data)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load runs')
    }
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, 5000)
    return () => clearInterval(id)
  }, [load])

  const active = runs.filter(r => r.status === 'running' || r.status === 'pending')
  const recent = runs.filter(r => r.status !== 'running' && r.status !== 'pending').slice(0, 20)

  return (
    <div>
      <h1 style={{ margin: '0 0 20px', fontSize: 22, fontWeight: 700 }}>Dashboard</h1>
      <NewRunForm onCreated={load} />
      {error && (
        <div style={{ color: 'var(--danger)', marginBottom: 16, fontSize: 13 }}>{error}</div>
      )}
      {active.length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <h2 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
            Active Runs
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {active.map(r => <RunCard key={r.id} run={r} />)}
          </div>
        </section>
      )}
      <section>
        <h2 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
          Recent Runs
        </h2>
        {recent.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No completed runs yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {recent.map(r => <RunCard key={r.id} run={r} />)}
          </div>
        )}
      </section>
    </div>
  )
}
