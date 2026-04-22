import { useEffect, useRef } from 'react'
import type { Decision } from '../types'

interface Props {
  decisions: Decision[]
}

const actionColor: Record<string, string> = {
  up: 'var(--accent)',
  down: 'var(--accent)',
  left: 'var(--accent)',
  right: 'var(--accent)',
  a: 'var(--success)',
  b: 'var(--danger)',
  start: 'var(--warning)',
  select: 'var(--warning)',
}

export default function DecisionLog({ decisions }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [decisions.length])

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        overflow: 'auto',
        height: '100%',
        minHeight: 200,
        maxHeight: 560,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border)',
          fontSize: 11,
          color: 'var(--text-muted)',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: 1,
          position: 'sticky',
          top: 0,
          background: 'var(--surface)',
          zIndex: 1,
        }}
      >
        Decision Log
      </div>
      <div style={{ padding: '8px 0', flex: 1, overflow: 'auto' }}>
        {decisions.length === 0 ? (
          <div style={{ padding: '16px', color: 'var(--text-muted)', fontSize: 13 }}>
            No decisions yet.
          </div>
        ) : (
          decisions.map((d, i) => (
            <div
              key={i}
              style={{
                padding: '10px 16px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
              }}
            >
              <span
                style={{
                  color: 'var(--text-muted)',
                  fontSize: 11,
                  minWidth: 36,
                  paddingTop: 2,
                }}
              >
                #{i + 1}
              </span>
              <span
                style={{
                  background: d.action ? (actionColor[d.action.toLowerCase()] ?? 'var(--border)') : 'var(--border)',
                  color: '#fff',
                  borderRadius: 4,
                  padding: '1px 7px',
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  minWidth: 44,
                  textAlign: 'center',
                  alignSelf: 'flex-start',
                  marginTop: 1,
                  flexShrink: 0,
                }}
              >
                {d.action ?? '—'}
              </span>
              <span style={{ fontSize: 13, color: 'var(--text)', flex: 1, lineHeight: 1.5 }}>
                {d.reasoning}
              </span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
