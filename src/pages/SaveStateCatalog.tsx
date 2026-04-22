import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { SaveState } from '../types'
import SaveStateCard from '../components/SaveStateCard'

export default function SaveStateCatalog() {
  const [saveStates, setSaveStates] = useState<SaveState[]>([])
  const [curatedOnly, setCuratedOnly] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.listSaveStates(curatedOnly ? { curated_only: true } : undefined)
      .then(setSaveStates)
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load'))
  }, [curatedOnly])

  return (
    <div>
      <h1 style={{ margin: '0 0 20px', fontSize: 22, fontWeight: 700 }}>Save States</h1>
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 20,
          fontSize: 13,
          cursor: 'pointer',
          color: 'var(--text)',
        }}
      >
        <input
          type="checkbox"
          checked={curatedOnly}
          onChange={e => setCuratedOnly(e.target.checked)}
          style={{ width: 15, height: 15, accentColor: 'var(--accent)' }}
        />
        Show curated only
      </label>
      {error && <div style={{ color: 'var(--danger)', marginBottom: 12 }}>{error}</div>}
      {saveStates.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No save states found.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {saveStates.map(s => <SaveStateCard key={s.id} saveState={s} />)}
        </div>
      )}
    </div>
  )
}
