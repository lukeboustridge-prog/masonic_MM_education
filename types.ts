export type GameState = 'START' | 'PLAYING' | 'PAUSED' | 'GRAVE' | 'VICTORY';

export interface Question {
  id: number;
  text: string;
  answers: string[];
  correctAnswer: string;
  explanation?: string;
  category?: 'review' | 'ritual' | 'working_tools';
}

export interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type PlatformType = 'floor' | 'platform' | 'rubble' | 'gate' | 'grave' | 'stair';

export interface Player extends Entity {
  vx: number;
  vy: number;
  isGrounded: boolean;
  facing: 1 | -1;
  jumpCount: number;
  coyoteTimer: number;
}

export interface Platform extends Entity {
  color: string;
  type?: PlatformType;
}

export interface Orb {
  id: number;
  x: number;
  y: number;
  radius: number;
  active: boolean;
  questionId?: number;
  name: string;
  spriteKey: string;
  blurb: string;
  points?: number;
}

export interface OrbDefinition {
  id: number;
  x: number;
  yOffset: number;
  radius: number;
  questionId?: number;
  name: string;
  spriteKey: string;
  blurb: string;
  points?: number;
}

export interface Enemy {
  x: number;
  y: number;
  minX: number;
  maxX: number;
  speed: number;
  type: 'Jubela' | 'Jubelo' | 'Jubelum';
}

export interface EnemyDefinition {
  x: number;
  yOffset: number;
  minX: number;
  maxX: number;
  speed: number;
  type: 'Jubela' | 'Jubelo' | 'Jubelum';
}

export interface LightSource {
  x: number;
  yOffset: number;
  radius: number;
  intensity: number;
  color: string;
}
