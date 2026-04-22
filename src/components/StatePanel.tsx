interface Props {
  state: Record<string, unknown> | null
}

export default function StatePanel({ state }: Props) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: 16,
        overflow: 'auto',
        maxHeight: 320,
      }}
    >
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
        Game State
      </div>
      {state ? (
        <pre
          style={{
            margin: 0,
            fontSize: 12,
            color: 'var(--text)',
            fontFamily: "'Fira Code', 'Cascadia Code', monospace",
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}
        >
          {JSON.stringify(state, null, 2)}
        </pre>
      ) : (
        <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>No state data yet.</span>
      )}
    </div>
  )
}
