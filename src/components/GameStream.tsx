import { useEffect, useRef } from 'react'

interface Props {
  frameHex: string | null
}

export default function GameStream({ frameHex }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!frameHex || !canvasRef.current) return

    // Convert hex string to Uint8Array
    const bytes = new Uint8Array(frameHex.length / 2)
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(frameHex.slice(i * 2, i * 2 + 2), 16)
    }

    const blob = new Blob([bytes], { type: 'image/png' })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)
    }
    img.src = url
  }, [frameHex])

  return (
    <div
      style={{
        background: '#000',
        borderRadius: 8,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 144,
        border: '1px solid var(--border)',
      }}
    >
      {frameHex ? (
        <canvas
          ref={canvasRef}
          style={{ imageRendering: 'pixelated', width: '100%', height: 'auto', display: 'block' }}
        />
      ) : (
        <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          Waiting for frames...
        </span>
      )}
    </div>
  )
}
