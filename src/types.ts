export interface GameState {
  barrierHealth: number;
  score: number;
  money: number;
  gameTime: number;
  difficultyMultiplier: number;
  enemies: Enemy[];
  towers: Tower[];
}

export interface Enemy {
  id: number;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  speed: number;
  laneIndex: number;
}

export interface Tower {
  id: number;
  x: number;
  y: number;
  level: number;
  damage: number;
  fireRate: number;
  range: number;
  cost: number;
  laneIndex: number;
}
