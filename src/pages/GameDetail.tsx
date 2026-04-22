import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api/client'
import type { Game, Skill, SaveState, Run, GameName, SkillScope } from '../types'
import SaveStateCard from '../components/SaveStateCard'
import RunCard from '../components/RunCard'
import NewRunForm from '../components/NewRunForm'

export default function GameDetail() {
  const { gameId } = useParams<{ gameId: string }>()
  const [game, setGame] = useState<Game | null>(null)
  const [skills, setSkills] = useState<Skill[]>([])
  const [saveStates, setSaveStates] = useState<SaveState[]>([])
  const [runs, setRuns] = useState<Run[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showNewRun, setShowNewRun] = useState(false)

  const loadAll = () => {
    if (!gameId) return
    api.getGame(gameId).then(setGame).catch(e => setError(String(e)))
    api.listSkills(gameId as SkillScope).then(setSkills).catch(() => {})
    api.listSaveStates({ game: gameId }).then(setSaveStates).catch(() => {})
    api.listRuns({ game: gameId }).then(setRuns).catch(() => {})
  }

  useEffect(() => {
    loadAll()
    const t = setInterval(loadAll, 5000)
    return () => clearInterval(t)
  }, [gameId])

  if (!game) {
    return (
      <div>
        {error ? <div style={{ color: 'var(--danger)' }}>{error}</div> : <div style={{ color: 'var(--text-muted)' }}>Loading...</div>}
      </div>
    )
  }

  const runningRuns = runs.filter(r => r.status === 'running' || r.status === 'pending')
  const pastRuns = runs.filter(r => r.status !== 'running' && r.status !== 'pending')

  return (
    <div>
      <div style={{ display: 'flex', gap: 24, marginBottom: 32, alignItems: 'flex-start' }}>
        <img
          src={game.image}
          alt={game.name}
          style={{ width: 180, height: 180, objectFit: 'contain', background: 'var(--surface)', borderRadius: 10, border: '1px solid var(--border)' }}
        />
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 700 }}>{game.name}</h1>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
            {game.platform} &middot; {game.region} &middot; {game.gym_count} gyms
          </div>
          <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, marginBottom: 16 }}>
            {game.description}
          </div>
          <button
            onClick={() => setShowNewRun(v => !v)}
            style={{
              background: showNewRun ? 'var(--border)' : 'var(--accent)',
              color: '#fff', border: 'none', borderRadius: 6,
              padding: '8px 20px', fontWeight: 600, fontSize: 13,
              cursor: 'pointer',
            }}
          >
            {showNewRun ? 'Cancel' : '+ Start New Run'}
          </button>
        </div>
      </div>

      {showNewRun && (
        <NewRunForm
          fixedGame={gameId as GameName}
          onCreated={() => { setShowNewRun(false); loadAll() }}
        />
      )}

      <Section title={`Currently Running (${runningRuns.length})`}>
        {runningRuns.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No runs in progress for this game.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
            {runningRuns.map(r => <RunCard key={r.id} run={r} />)}
          </div>
        )}
      </Section>

      <Section title={`Past Runs (${pastRuns.length})`} linkText={pastRuns.length > 6 ? 'See all' : undefined} linkTo="/runs">
        {pastRuns.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No completed runs for this game yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
            {pastRuns.slice(0, 6).map(r => <RunCard key={r.id} run={r} />)}
          </div>
        )}
      </Section>

      <Section title={`Skills for ${game.name} (${skills.length})`} linkText="Manage" linkTo={`/games/${gameId}/skills`}>
        {skills.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No skills yet for this game.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
            {skills.map(s => (
              <div key={`${s.scope}/${s.name}`} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.content.split('\n')[0].replace(/^#+ ?/, '').slice(0, 60)}</div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title={`Save States (${saveStates.length})`} linkText={saveStates.length > 6 ? 'See all' : undefined} linkTo="/save-states">
        {saveStates.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No save states for this game.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
            {saveStates.slice(0, 6).map(s => <SaveStateCard key={s.id} saveState={s} />)}
          </div>
        )}
      </Section>
    </div>
  )
}

function Section({ title, linkText, linkTo, children }: {
  title: string; linkText?: string; linkTo?: string; children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{title}</h2>
        {linkText && linkTo && <Link to={linkTo} style={{ fontSize: 13 }}>{linkText}</Link>}
      </div>
      {children}
    </div>
  )
}
