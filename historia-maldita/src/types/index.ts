export interface Player {
  id: string;
  name: string;
  order: number;
  totalSips: number;
  temporaryStatuses: string[];
}

export interface TemporaryRule {
  id: string;
  ruleText: string;
  durationRounds: number;
  target: 'all' | 'player' | string; // player id or 'all'
  createdAtRound: number;
}

export interface DrinkPenalty {
  playerName: string;
  sips: number;
}

export interface RoundResult {
  resultText: string;
  drinks: DrinkPenalty[];
  newRules: Omit<TemporaryRule, 'id' | 'createdAtRound'>[];
}

export interface SceneData {
  sceneText: string;
  choices: string[];
}

export type GameIntensity = 'leve' | 'média' | 'pesada';
export type GameDuration = 'curta' | 'média' | 'longa';
export type GameState = 'setup' | 'playing' | 'result' | 'finished';
export type GameMode = 'classic' | 'story'; // classic = modo original, story = modo história com lugar

export interface StoryTurn {
  round: number;
  playerName: string;
  sceneText: string;
  choiceMade: string;
  resultText: string;
  affectedPlayers: string[]; // quem foi afetado nessa rodada
}

export interface StorySession {
  id: string;
  players: Player[];
  location: string;
  locationDescription: string; // descrição gerada pela LLM
  currentRound: number;
  currentPlayerIndex: number;
  intensity: GameIntensity;
  totalRounds: number;
  activeRules: TemporaryRule[];
  history: StoryTurn[];
  gameState: GameState;
  currentScene: SceneData | null;
  currentResult: RoundResult | null;
  // contexto compartilhado — o que aconteceu no ambiente que todos sentem
  sharedContext: string;
}

export interface HistoryEntry {
  round: number;
  playerName: string;
  sceneText: string;
  choiceMade: string;
  resultText: string;
}

export interface GameSession {
  id: string;
  players: Player[];
  currentRound: number;
  currentPlayerIndex: number;
  intensity: GameIntensity;
  duration: GameDuration;
  totalRounds: number;
  activeRules: TemporaryRule[];
  recentHistory: HistoryEntry[];
  gameState: GameState;
  currentScene: SceneData | null;
  currentResult: RoundResult | null;
}
