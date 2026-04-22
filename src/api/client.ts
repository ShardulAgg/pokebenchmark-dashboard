import type {
  Run,
  SaveState,
  CreateRunRequest,
  CreateSaveStateRequest,
  Game,
  Skill,
  SkillScope,
} from '../types'

const BASE = '/api'

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API error ${res.status}: ${text}`)
  }
  return res.json() as Promise<T>
}

export const api = {
  health: () => request<{ status: string }>('/health'),

  listRuns: (params?: { game?: string; status?: string }) => {
    const qs = new URLSearchParams()
    if (params?.game) qs.set('game', params.game)
    if (params?.status) qs.set('status', params.status)
    const suffix = qs.toString() ? `?${qs.toString()}` : ''
    return request<Run[]>(`/runs/${suffix}`)
  },

  getRun: (runId: string) => request<Run>(`/runs/${runId}`),

  createRun: (body: CreateRunRequest) =>
    request<{ run_id: string; container_id: string | null; status: string }>('/runs/', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  stopRun: (runId: string) =>
    request<{ status: string }>(`/runs/${runId}/stop`, { method: 'POST' }),

  listSaveStates: (params?: { curated_only?: boolean; game?: string }) => {
    const qs = new URLSearchParams()
    if (params?.curated_only !== undefined) qs.set('curated_only', String(params.curated_only))
    if (params?.game) qs.set('game', params.game)
    const suffix = qs.toString() ? `?${qs.toString()}` : ''
    return request<SaveState[]>(`/catalog/save-states${suffix}`)
  },

  getSaveState: (id: string) => request<SaveState>(`/catalog/save-states/${id}`),

  createSaveState: (body: CreateSaveStateRequest) =>
    request<SaveState>('/catalog/save-states', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  listGames: () => request<Game[]>('/games/'),
  getGame: (id: string) => request<Game>(`/games/${id}`),

  listSkills: (scope?: SkillScope) => {
    const suffix = scope ? `?scope=${scope}` : ''
    return request<Skill[]>(`/skills/${suffix}`)
  },
  getSkill: (scope: SkillScope, name: string) =>
    request<Skill>(`/skills/${scope}/${name}`),
  saveSkill: (scope: SkillScope, name: string, content: string) =>
    request<Skill>(`/skills/${scope}/${name}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    }),
  deleteSkill: (scope: SkillScope, name: string) =>
    request<{ deleted: boolean }>(`/skills/${scope}/${name}`, { method: 'DELETE' }),
}
