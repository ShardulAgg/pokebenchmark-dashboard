import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { Game, Run, Skill, SaveState } from '../types'

interface GameStats {
  running: number
  total_runs: number
  skills: number
  save_states: number
}

export default function Games() {
  const [games, setGames] = useState<Game[]>([])
  const [stats, setStats] = useState<Record<string, GameStats>>({})
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      const gs = await api.listGames()
      setGames(gs)
      const entries = await Promise.all(gs.map(async g => {
        const [runs, skills, saves]: [Run[], Skill[], SaveState[]] = await Promise.all([
          api.listRuns({ game: g.id }),
          api.listSkills(g.id),
          api.listSaveStates({ game: g.id }),
        ])
        return [g.id, {
          running: runs.filter(r => r.status === 'running').length,
          total_runs: runs.length,
          skills: skills.length,
          save_states: saves.length,
        }] as const
      }))
      setStats(Object.fromEntries(entries))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    }
  }

  useEffect(() => {
    load()
    const t = setInterval(load, 5000)
    return () => clearInterval(t)
  }, [])

  return (
    <div>
      <h1 style={{ margin: '0 0 20px', fontSize: 22, fontWeight: 700 }}>Games</h1>
      {error && <div style={{ color: 'var(--danger)', marginBottom: 12 }}>{error}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {games.map(g => {
          const s = stats[g.id]
          return (
            <Link
              key={g.id}
              to={`/games/${g.id}`}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                overflow: 'hidden',
                textDecoration: 'none',
                color: 'var(--text)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'border-color 0.15s, transform 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--accent)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div style={{
                width: '100%',
                aspectRatio: '1 / 1',
                background: 'var(--bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative',
              }}>
                <img
                  src={g.image}
                  alt={g.name}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
                {s && s.running > 0 && (
                  <div style={{
                    position: 'absolute', top: 10, right: 10,
                    background: 'var(--success)', color: '#fff',
                    borderRadius: 20, padding: '4px 10px',
                    fontSize: 12, fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: '#fff', animation: 'pulse 1.5s infinite',
                    }} />
                    {s.running} live
                  </div>
                )}
              </div>
              <div style={{ padding: '14px 18px' }}>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{g.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
                  {g.platform} &middot; {g.region} &middot; {g.gym_count} gyms
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 12 }}>
                  {g.description}
                </div>
                {s && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                    <Stat label="Runs" value={s.total_runs} />
                    <Stat label="Running" value={s.running} highlight={s.running > 0} />
                    <Stat label="Skills" value={s.skills} />
                    <Stat label="Saves" value={s.save_states} />
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </div>
      <style>{`@keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.3 } }`}</style>
    </div>
  )
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 700, color: highlight ? 'var(--success)' : 'var(--text)' }}>{value}</div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
    </div>
  )
}
