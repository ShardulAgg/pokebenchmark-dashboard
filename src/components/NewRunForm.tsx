import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import type { CreateRunRequest, GameName, InputMode, ModelProvider, Skill, SkillScope } from '../types'

interface Props {
  onCreated?: () => void
  fixedGame?: GameName
}

const games: GameName[] = ['firered', 'emerald']
const providers: ModelProvider[] = ['claude', 'openai', 'gemini', 'ollama', 'manual']
const inputModes: InputMode[] = ['vision', 'text']

const inputStyle: React.CSSProperties = {
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: 6,
  padding: '7px 10px',
  color: 'var(--text)',
  fontSize: 13,
  width: '100%',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  color: 'var(--text-muted)',
  marginBottom: 4,
  fontWeight: 500,
}

const ROM_PATHS: Record<GameName, string> = {
  firered: '/app/roms/firered.gba',
  emerald: '/app/roms/emerald.gba',
}

export default function NewRunForm({ onCreated, fixedGame }: Props) {
  const navigate = useNavigate()
  const initialGame: GameName = fixedGame ?? 'firered'
  const [form, setForm] = useState<CreateRunRequest>({
    game: initialGame,
    model_provider: 'claude',
    model_name: '',
    input_mode: 'vision',
    rom_path: ROM_PATHS[initialGame],
    steps: 100,
  })
  const [apiKey, setApiKey] = useState('')
  const [commonSkills, setCommonSkills] = useState<Skill[]>([])
  const [gameSkills, setGameSkills] = useState<Skill[]>([])
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = <K extends keyof CreateRunRequest>(k: K, v: CreateRunRequest[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    api.listSkills('common').then(setCommonSkills).catch(() => setCommonSkills([]))
  }, [])

  useEffect(() => {
    api.listSkills(form.game as SkillScope).then(setGameSkills).catch(() => setGameSkills([]))
    setForm(f => ({ ...f, game: form.game, rom_path: ROM_PATHS[form.game] }))
    setSelectedSkills(new Set())
  }, [form.game])

  const toggleSkill = (key: string) => {
    setSelectedSkills(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const body: CreateRunRequest = {
        ...form,
        skill_files: Array.from(selectedSkills),
      }
      if (apiKey) body.api_key = apiKey
      const res = await api.createRun(body)
      onCreated?.()
      navigate(`/runs/${res.run_id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={submit}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '20px 22px',
        marginBottom: 24,
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
        New Run{fixedGame ? ` — ${fixedGame}` : ''}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 14,
          marginBottom: 16,
        }}
      >
        {!fixedGame && (
          <div>
            <label style={labelStyle}>Game</label>
            <select
              style={inputStyle}
              value={form.game}
              onChange={e => set('game', e.target.value as GameName)}
            >
              {games.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label style={labelStyle}>Provider</label>
          <select
            style={inputStyle}
            value={form.model_provider}
            onChange={e => set('model_provider', e.target.value as ModelProvider)}
          >
            {providers.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        {form.model_provider !== 'manual' && (
          <>
            <div>
              <label style={labelStyle}>Model</label>
              <input
                required
                style={inputStyle}
                value={form.model_name}
                onChange={e => set('model_name', e.target.value)}
                placeholder="e.g. claude-sonnet-4"
              />
            </div>
            <div>
              <label style={labelStyle}>API Key</label>
              <input
                type="password"
                style={inputStyle}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>Input Mode</label>
              <select
                style={inputStyle}
                value={form.input_mode}
                onChange={e => set('input_mode', e.target.value as InputMode)}
              >
                {inputModes.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Steps</label>
              <input
                required
                style={inputStyle}
                type="number"
                min={1}
                value={form.steps}
                onChange={e => set('steps', Number(e.target.value))}
              />
            </div>
          </>
        )}
        <div>
          <label style={labelStyle}>ROM Path</label>
          <input
            required
            style={inputStyle}
            value={form.rom_path}
            onChange={e => set('rom_path', e.target.value)}
          />
        </div>
      </div>

      {(commonSkills.length > 0 || gameSkills.length > 0) && (
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Skills ({selectedSkills.size} selected)</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {[...commonSkills, ...gameSkills].map(s => {
              const key = `${s.scope}/${s.name}`
              const on = selectedSkills.has(key)
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleSkill(key)}
                  style={{
                    background: on ? 'var(--accent)' : 'var(--bg)',
                    color: on ? '#fff' : 'var(--text)',
                    border: `1px solid ${on ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 6,
                    padding: '5px 10px',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ opacity: 0.6, marginRight: 4 }}>{s.scope}/</span>
                  {s.name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {error && (
        <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{error}</div>
      )}
      <button
        type="submit"
        disabled={loading}
        style={{
          background: 'var(--accent)',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          padding: '8px 20px',
          fontWeight: 600,
          fontSize: 13,
          opacity: loading ? 0.6 : 1,
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Starting...' : 'Start Run'}
      </button>
    </form>
  )
}
