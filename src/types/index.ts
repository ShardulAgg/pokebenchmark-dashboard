export type RunStatus = 'pending' | 'running' | 'completed' | 'failed' | 'stopped';
export type InputMode = 'vision' | 'text';
export type GameName = 'firered' | 'emerald';
export type ModelProvider = 'claude' | 'openai' | 'gemini' | 'ollama' | 'manual';

export interface Run {
  id: string;
  game: GameName;
  model_provider: ModelProvider;
  model_name: string;
  input_mode: InputMode;
  skill_files: string;  // JSON-serialized list
  save_state_id: string | null;
  status: RunStatus;
  started_at: string;
  finished_at: string | null;
  steps_completed: number;
  final_badges: number;
  final_location: string;
  video_path: string | null;
  container_id: string | null;
}

export interface Decision {
  reasoning: string;
  action: string | null;
}

export interface SaveState {
  id: string;
  file_path: string;
  game: GameName;
  curated: boolean;
  timestamp: string;
  label: string | null;
  run_id: string | null;
  model_provider: string | null;
  model_name: string | null;
  badges: number;
  location: string;
  party_levels: string;
}

export interface LiveUpdate {
  type: 'frame' | 'state' | 'decision' | 'status';
  run_id?: string;
  frame?: string;       // hex-encoded PNG bytes
  state?: Record<string, unknown>;
  decision?: Decision;
  status?: RunStatus;
}

export interface CreateRunRequest {
  game: GameName;
  model_provider: ModelProvider;
  model_name: string;
  input_mode: InputMode;
  rom_path: string;
  api_key?: string;
  save_state_id?: string;
  skill_files?: string[];
  steps?: number;
}

export interface CreateSaveStateRequest {
  file_path: string;
  game: GameName;
  label?: string;
  curated?: boolean;
}

export interface Game {
  id: GameName;
  name: string;
  region: string;
  platform: string;
  image: string;
  description: string;
  gym_count: number;
}

export type SkillScope = 'common' | GameName;

export interface Skill {
  scope: SkillScope;
  name: string;
  content: string;
}
