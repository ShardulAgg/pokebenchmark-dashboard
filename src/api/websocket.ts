import type { LiveUpdate } from '../types'

type UpdateCallback = (update: LiveUpdate) => void

export class LiveConnection {
  private ws: WebSocket | null = null
  private runId: string
  private callback: UpdateCallback
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private closed = false

  constructor(runId: string, callback: UpdateCallback) {
    this.runId = runId
    this.callback = callback
    this.connect()
  }

  private connect() {
    if (this.closed) return
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const url = `${proto}://${window.location.host}/ws/live/${this.runId}`
    this.ws = new WebSocket(url)

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const update = JSON.parse(event.data as string) as LiveUpdate
        this.callback(update)
      } catch {
        // ignore malformed messages
      }
    }

    this.ws.onclose = () => {
      if (!this.closed) {
        this.reconnectTimer = setTimeout(() => this.connect(), 2000)
      }
    }

    this.ws.onerror = () => {
      this.ws?.close()
    }
  }

  close() {
    this.closed = true
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.ws?.close()
  }
}
