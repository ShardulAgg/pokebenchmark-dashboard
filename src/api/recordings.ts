export interface Recording {
  run_id: string
  filename: string
  url: string
  size_bytes: number
  mtime: number
}

export async function listRecordings(runId: string): Promise<Recording[]> {
  const res = await fetch(`/api/runs/${runId}/recordings`)
  if (!res.ok) throw new Error(`listRecordings ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return data.recordings ?? []
}
