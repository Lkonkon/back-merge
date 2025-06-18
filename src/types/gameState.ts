export interface Enemy {
  id: string;
  x: number;
  y: number;
  laneIndex: number;
  health: number;
}

export interface Tower {
  id: string;
  x: number;
  y: number;
  laneIndex: number;
  type: string;
  range: number;
  cost: number;
}

export interface GameState {
  enemies: Enemy[];
  towers: Tower[];
  barrierHealth: number;
  score: number;
  money: number;
  gameTime: number; // Tempo de jogo em segundos
  difficultyMultiplier: number; // Multiplicador de dificuldade
  lastDifficultyUpdate: number; // Último momento em que a dificuldade foi atualizada
}

const DIFFICULTY_UPDATE_INTERVAL = 30000; // 30 segundos
const DIFFICULTY_INCREASE_RATE = 0.2; // 20% de aumento
const BASE_ENEMY_HEALTH = 30; // Vida base
