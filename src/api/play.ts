export type GbaKey =
  | 'A' | 'B' | 'Select' | 'Start'
  | 'Right' | 'Left' | 'Up' | 'Down'
  | 'R' | 'L'

export const KEY_MAP: Record<string, GbaKey> = {
  ArrowUp: 'Up',
  ArrowDown: 'Down',
  ArrowLeft: 'Left',
  ArrowRight: 'Right',
  z: 'B',
  x: 'A',
  a: 'L',
  s: 'R',
  Enter: 'Start',
  Shift: 'Select',
}

export async function startPlay(runId: string): Promise<void> {
  const res = await fetch(`/api/play/${runId}/start`, { method: 'POST' })
  if (!res.ok) throw new Error(`startPlay ${res.status}: ${await res.text()}`)
}

export async function stopPlay(runId: string): Promise<{ frames: number }> {
  const res = await fetch(`/api/play/${runId}/stop`, { method: 'POST' })
  if (!res.ok) throw new Error(`stopPlay ${res.status}: ${await res.text()}`)
  return res.json()
}

export interface PlayConnection {
  readonly ws: WebSocket
  close(): void
  sendKeyDown(k: GbaKey): void
  sendKeyUp(k: GbaKey): void
  sendResetKeys(): void
}

export function openPlayConnection(
  runId: string,
  onFrame: (bitmap: ImageBitmap) => void,
  onClose: () => void,
): PlayConnection {
  const proto = location.protocol === 'https:' ? 'wss' : 'ws'
  const ws = new WebSocket(`${proto}://${location.host}/ws/play/${runId}`)
  ws.binaryType = 'blob'

  ws.addEventListener('message', async (e) => {
    if (e.data instanceof Blob) {
      try {
        const bmp = await createImageBitmap(e.data)
        onFrame(bmp)
      } catch {
        /* ignore decode errors on occasional corrupt frames */
      }
    }
  })

  ws.addEventListener('close', onClose)
  ws.addEventListener('error', onClose)

  const send = (obj: object) => {
    if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj))
  }

  return {
    ws,
    close: () => ws.close(),
    sendKeyDown: (k) => send({ t: 'down', k }),
    sendKeyUp: (k) => send({ t: 'up', k }),
    sendResetKeys: () => send({ t: 'reset_keys' }),
  }
}
