import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../api/client'
import type { Skill, SkillScope } from '../types'

const ALL_SCOPES: SkillScope[] = ['common', 'firered', 'emerald']

export default function Skills() {
  const { gameId } = useParams<{ gameId?: string }>()
  const initialScope: SkillScope = (gameId as SkillScope) ?? 'common'
  const [scope, setScope] = useState<SkillScope>(initialScope)
  const [skills, setSkills] = useState<Skill[]>([])
  const [selected, setSelected] = useState<Skill | null>(null)
  const [editName, setEditName] = useState('')
  const [editContent, setEditContent] = useState('')
  const [isNew, setIsNew] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = () => {
    api.listSkills(scope)
      .then(setSkills)
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load'))
  }

  useEffect(load, [scope])

  const openSkill = (s: Skill) => {
    setSelected(s)
    setEditName(s.name)
    setEditContent(s.content)
    setIsNew(false)
  }

  const openNew = () => {
    setSelected(null)
    setEditName('')
    setEditContent('# New Skill\n\nDescribe the operational knowledge here.\n')
    setIsNew(true)
  }

  const save = async () => {
    if (!editName.trim()) {
      setError('Name is required')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await api.saveSkill(scope, editName.trim(), editContent)
      load()
      setIsNew(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!selected) return
    if (!confirm(`Delete skill "${selected.name}"?`)) return
    try {
      await api.deleteSkill(selected.scope, selected.name)
      setSelected(null)
      setEditName('')
      setEditContent('')
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  const inputStyle: React.CSSProperties = {
    background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6,
    padding: '7px 10px', color: 'var(--text)', fontSize: 13, width: '100%',
  }

  return (
    <div>
      <h1 style={{ margin: '0 0 20px', fontSize: 22, fontWeight: 700 }}>Skills</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16, height: 'calc(100vh - 160px)' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 12, overflow: 'auto' }}>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Scope</label>
            <select
              style={inputStyle}
              value={scope}
              onChange={e => setScope(e.target.value as SkillScope)}
            >
              {ALL_SCOPES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button
            onClick={openNew}
            style={{
              width: '100%', background: 'var(--accent)', color: '#fff', border: 'none',
              borderRadius: 6, padding: '7px 10px', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', marginBottom: 10,
            }}
          >
            + New Skill
          </button>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, margin: '10px 0 6px' }}>
            {skills.length} skill{skills.length !== 1 ? 's' : ''}
          </div>
          {skills.map(s => (
            <button
              key={s.name}
              onClick={() => openSkill(s)}
              style={{
                width: '100%', textAlign: 'left',
                background: selected?.name === s.name && !isNew ? 'var(--border)' : 'transparent',
                color: 'var(--text)',
                border: 'none', borderRadius: 6, padding: '8px 10px',
                fontSize: 13, cursor: 'pointer', marginBottom: 2,
              }}
            >
              {s.name}
            </button>
          ))}
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column' }}>
          {error && <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{error}</div>}
          {(selected || isNew) ? (
            <>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
                <label style={{ fontSize: 11, color: 'var(--text-muted)' }}>Name:</label>
                <input
                  style={{ ...inputStyle, flex: 1, maxWidth: 320 }}
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  disabled={!isNew}
                />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>.md in /{scope}</span>
              </div>
              <textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                style={{
                  flex: 1,
                  background: 'var(--bg)', border: '1px solid var(--border)',
                  borderRadius: 6, padding: 12, color: 'var(--text)',
                  fontFamily: 'monospace', fontSize: 13, lineHeight: 1.5,
                  resize: 'none', minHeight: 400,
                }}
              />
              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <button
                  onClick={save}
                  disabled={saving}
                  style={{
                    background: 'var(--accent)', color: '#fff', border: 'none',
                    borderRadius: 6, padding: '8px 18px', fontWeight: 600, fontSize: 13,
                    cursor: 'pointer', opacity: saving ? 0.6 : 1,
                  }}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                {!isNew && selected && (
                  <button
                    onClick={remove}
                    style={{
                      background: 'transparent', color: 'var(--danger)',
                      border: '1px solid var(--danger)',
                      borderRadius: 6, padding: '8px 18px', fontWeight: 600, fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Select a skill or create a new one.</p>
          )}
        </div>
      </div>
    </div>
  )
}
