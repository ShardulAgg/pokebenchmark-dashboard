import { useEffect, useRef } from 'react'
import { KEY_MAP, openPlayConnection, type PlayConnection } from '../api/play'

interface Props {
  runId: string
  onClosed: () => void
  onState?: (data: Record<string, unknown>) => void
}

export default function PlayCanvas({ runId, onClosed, onState }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const connRef = useRef<PlayConnection | null>(null)
  const heldRef = useRef<Set<string>>(new Set())
  // Stabilize callback identity via refs so parent re-renders don't retrigger
  // this effect and tear down the WebSocket.
  const onClosedRef = useRef(onClosed)
  onClosedRef.current = onClosed
  const onStateRef = useRef(onState)
  onStateRef.current = onState

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const conn = openPlayConnection(
      runId,
      (bmp) => {
        ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height)
        bmp.close()
      },
      () => onClosedRef.current(),
      (data) => onStateRef.current?.(data),
    )
    connRef.current = conn

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return
      const k = KEY_MAP[e.key]
      if (!k) return
      e.preventDefault()
      if (heldRef.current.has(k)) return
      heldRef.current.add(k)
      conn.sendKeyDown(k)
    }
    const onKeyUp = (e: KeyboardEvent) => {
      const k = KEY_MAP[e.key]
      if (!k) return
      e.preventDefault()
      heldRef.current.delete(k)
      conn.sendKeyUp(k)
    }
    const onBlur = () => {
      heldRef.current.clear()
      conn.sendResetKeys()
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
      conn.close()
    }
  }, [runId])

  return (
    <canvas
      ref={canvasRef}
      width={240}
      height={160}
      style={{
        width: '100%',
        height: '100%',
        imageRendering: 'pixelated',
        background: '#000',
        display: 'block',
      }}
    />
  )
}
