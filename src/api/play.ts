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
  sendSpeed(v: number): void
}

export function openPlayConnection(
  runId: string,
  onFrame: (bitmap: ImageBitmap) => void,
  onClose: () => void,
  onState?: (data: Record<string, unknown>) => void,
): PlayConnection {
  const proto = location.protocol === 'https:' ? 'wss' : 'ws'
  const ws = new WebSocket(`${proto}://${location.host}/ws/play/${runId}`)
  ws.binaryType = 'blob'

  // Track explicit-close so StrictMode double-invoke (which closes the
  // in-flight WS before handshake completes) doesn't surface as an error
  // to the parent. Server-side close still fires onClose.
  let explicitlyClosed = false

  ws.addEventListener('message', async (e) => {
    if (e.data instanceof Blob) {
      try {
        const bmp = await createImageBitmap(e.data)
        onFrame(bmp)
      } catch {
        /* ignore decode errors on occasional corrupt frames */
      }
    } else if (typeof e.data === 'string' && onState) {
      try {
        const msg = JSON.parse(e.data)
        if (msg?.t === 'state' && msg.data) onState(msg.data)
      } catch {
        /* malformed JSON — ignore */
      }
    }
  })

  const maybeNotifyClose = () => { if (!explicitlyClosed) onClose() }
  ws.addEventListener('close', maybeNotifyClose)
  ws.addEventListener('error', maybeNotifyClose)

  const send = (obj: object) => {
    if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj))
  }

  return {
    ws,
    close: () => { explicitlyClosed = true; ws.close() },
    sendKeyDown: (k) => send({ t: 'down', k }),
    sendKeyUp: (k) => send({ t: 'up', k }),
    sendResetKeys: () => send({ t: 'reset_keys' }),
    sendSpeed: (v) => send({ t: 'speed', v }),
  }
}

export const FAST_FORWARD_MULTIPLIER = 4
