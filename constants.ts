import { Question, OrbDefinition, PlatformType, EnemyDefinition, LightSource } from './types';

export const TEMPLE_COLORS = {
  INDIGO: '#1b2440',
  BLACK: '#0b0f1a',
  SILVER: '#c0c7d1',
  GOLD: '#c8a24a',
  ASH: '#3b3f4a',
  MOURNING: '#121521',
  CANDLE: '#f1c97a',
  SHADOW: '#0a0d14'
};

export const GRAVITY = 0.45;
export const FRICTION = 0.84;
export const MOVE_SPEED = 4.6;
export const JUMP_FORCE = -11.5;

export const WORLD_WIDTH = 5200;
export const WORLD_HEIGHT = 1200;

export const DESIGN_HEIGHT = 360;

export const PLAYER_LIGHT_RADIUS = 120;

export const LIGHT_SOURCES: LightSource[] = [
  { x: 220, yOffset: -40, radius: 160, intensity: 0.6, color: TEMPLE_COLORS.GOLD },
  { x: 980, yOffset: -30, radius: 140, intensity: 0.55, color: TEMPLE_COLORS.GOLD },
  { x: 1680, yOffset: -140, radius: 160, intensity: 0.55, color: TEMPLE_COLORS.GOLD },
  { x: 2320, yOffset: 140, radius: 200, intensity: 0.5, color: TEMPLE_COLORS.GOLD },
  { x: 3050, yOffset: -20, radius: 170, intensity: 0.6, color: TEMPLE_COLORS.GOLD },
  { x: 4100, yOffset: -140, radius: 170, intensity: 0.55, color: TEMPLE_COLORS.GOLD },
  { x: 4700, yOffset: -40, radius: 180, intensity: 0.7, color: TEMPLE_COLORS.GOLD }
];

export const CHECKPOINTS = [
  { x: 140, yOffset: 0 },
  { x: 1100, yOffset: 0 },
  { x: 1950, yOffset: -240 },
  { x: 2600, yOffset: 120 },
  { x: 3200, yOffset: 0 },
  { x: 4200, yOffset: -140 }
];

export const PLATFORM_DATA: Array<{
  x: number;
  yOffset: number;
  width: number;
  height: number;
  color: string;
  type?: PlatformType;
}> = [
  { x: 0, yOffset: 0, width: 900, height: 90, color: TEMPLE_COLORS.INDIGO, type: 'floor' },
  { x: 1020, yOffset: 0, width: 620, height: 90, color: TEMPLE_COLORS.INDIGO, type: 'floor' },
  { x: 1700, yOffset: 0, width: 280, height: 90, color: TEMPLE_COLORS.INDIGO, type: 'floor' },
  { x: 2800, yOffset: 0, width: 620, height: 90, color: TEMPLE_COLORS.INDIGO, type: 'floor' },
  { x: 3600, yOffset: 0, width: 520, height: 90, color: TEMPLE_COLORS.INDIGO, type: 'floor' },
  { x: 4500, yOffset: 0, width: 520, height: 90, color: TEMPLE_COLORS.INDIGO, type: 'floor' },

  { x: 200, yOffset: -60, width: 90, height: 16, color: TEMPLE_COLORS.ASH, type: 'rubble' },
  { x: 360, yOffset: -120, width: 110, height: 16, color: TEMPLE_COLORS.ASH, type: 'rubble' },
  { x: 520, yOffset: -70, width: 90, height: 16, color: TEMPLE_COLORS.ASH, type: 'rubble' },
  { x: 700, yOffset: -140, width: 120, height: 16, color: TEMPLE_COLORS.ASH, type: 'rubble' },

  { x: 1500, yOffset: -40, width: 120, height: 16, color: TEMPLE_COLORS.SILVER, type: 'stair' },
  { x: 1600, yOffset: -90, width: 120, height: 16, color: TEMPLE_COLORS.SILVER, type: 'stair' },
  { x: 1700, yOffset: -140, width: 120, height: 16, color: TEMPLE_COLORS.SILVER, type: 'stair' },
  { x: 1800, yOffset: -190, width: 120, height: 16, color: TEMPLE_COLORS.SILVER, type: 'stair' },
  { x: 1900, yOffset: -240, width: 140, height: 16, color: TEMPLE_COLORS.SILVER, type: 'stair' },
  { x: 2020, yOffset: -260, width: 220, height: 20, color: TEMPLE_COLORS.SILVER, type: 'platform' },

  { x: 2200, yOffset: 200, width: 520, height: 90, color: TEMPLE_COLORS.MOURNING, type: 'grave' },
  { x: 2320, yOffset: 140, width: 120, height: 16, color: TEMPLE_COLORS.ASH, type: 'platform' },
  { x: 2450, yOffset: 90, width: 120, height: 16, color: TEMPLE_COLORS.ASH, type: 'platform' },
  { x: 2580, yOffset: 40, width: 120, height: 16, color: TEMPLE_COLORS.ASH, type: 'platform' },
  { x: 2720, yOffset: 0, width: 140, height: 16, color: TEMPLE_COLORS.ASH, type: 'platform' },

  { x: 3000, yOffset: -60, width: 140, height: 16, color: TEMPLE_COLORS.SILVER, type: 'stair' },
  { x: 3120, yOffset: -110, width: 140, height: 16, color: TEMPLE_COLORS.SILVER, type: 'stair' },
  { x: 3260, yOffset: -160, width: 160, height: 16, color: TEMPLE_COLORS.SILVER, type: 'stair' },

  { x: 3700, yOffset: -70, width: 200, height: 16, color: TEMPLE_COLORS.ASH, type: 'platform' },
  { x: 3950, yOffset: -130, width: 200, height: 16, color: TEMPLE_COLORS.ASH, type: 'platform' },
  { x: 4200, yOffset: -70, width: 200, height: 16, color: TEMPLE_COLORS.ASH, type: 'platform' },
  { x: 4400, yOffset: -170, width: 220, height: 16, color: TEMPLE_COLORS.ASH, type: 'platform' },

  { x: 4700, yOffset: -40, width: 200, height: 18, color: TEMPLE_COLORS.GOLD, type: 'platform' }
];

export const GOAL_X = 4800;
export const GOAL_Y_OFFSET = -40;

export const REVIEW_QUESTIONS: Question[] = [
  {
    id: 1,
    text: 'What are the working tools of a Master Mason?',
    answers: [
      'The Skirret, the Pencil, and the Compasses.',
      'The Square, the Level, and the Plumb Rule.',
      'The 24 inch gauge and the common gavel.'
    ],
    correctAnswer: 'The Skirret, the Pencil, and the Compasses.',
    category: 'review'
  },
  {
    id: 2,
    text: 'To what do the working tools of a Master Mason allude?',
    answers: [
      'To morality and the Divine Creator.',
      'To the Middle Chamber and its wages.',
      'To the pillars of Strength and Establishment.'
    ],
    correctAnswer: 'To morality and the Divine Creator.',
    category: 'review'
  },
  {
    id: 3,
    text: 'What are the ornaments of a Master Mason Lodge?',
    answers: [
      'The Porch, the Dormer, and the Square Pavement.',
      'The Mosaic Pavement, the Blazing Star, and the Border.',
      'The Pillars, the Winding Staircase, and the Middle Chamber.'
    ],
    correctAnswer: 'The Porch, the Dormer, and the Square Pavement.',
    category: 'review'
  },
  {
    id: 4,
    text: 'How many constitute a Lodge of Master Masons?',
    answers: [
      'Three.',
      'Five.',
      'Seven.'
    ],
    correctAnswer: 'Three.',
    category: 'review'
  },
  {
    id: 5,
    text: 'What are the Five Points of Fellowship?',
    answers: [
      'Hand to hand, foot to foot, knee to knee, breast to breast, hand over back.',
      'Hand to hand, arm to arm, knee to knee, cheek to cheek, hand over heart.',
      'Hand to hand, foot to foot, knee to knee, shoulder to shoulder, hand over head.'
    ],
    correctAnswer: 'Hand to hand, foot to foot, knee to knee, breast to breast, hand over back.',
    category: 'review'
  }
];

export const QUESTIONS: Question[] = [
  {
    id: 101,
    text: 'What is the peculiar object of the Third Degree?',
    answers: [
      'To teach us how to die and the knowledge of oneself.',
      'To reveal the hidden mysteries of nature and science.',
      'To explain the wages of the Middle Chamber.'
    ],
    correctAnswer: 'To teach us how to die and the knowledge of oneself.',
    category: 'ritual'
  },
  {
    id: 102,
    text: 'How were you prepared for the Third Degree?',
    answers: [
      'Both arms, both breasts, both knees bare, both heels slipshod.',
      'Both arms bare, left breast bare, right heel slipshod.',
      'Left arm and right knee bare, hoodwinked, with a cable tow twice around.'
    ],
    correctAnswer: 'Both arms, both breasts, both knees bare, both heels slipshod.',
    category: 'ritual'
  },
  {
    id: 103,
    text: 'What do the three steps consist of?',
    answers: [
      'The first three as if stepping over a grave.',
      'The three principal officers of a lodge.',
      'The three great supports of Masonry.'
    ],
    correctAnswer: 'The first three as if stepping over a grave.',
    category: 'ritual'
  },
  {
    id: 104,
    text: 'The Skirret points out',
    answers: [
      'The straight and undeviating line of conduct.',
      'The level of equality among mankind.',
      'The uprightness of life and actions.'
    ],
    correctAnswer: 'The straight and undeviating line of conduct.',
    category: 'working_tools'
  },
  {
    id: 105,
    text: 'The Pencil teaches us',
    answers: [
      'That our words and actions are recorded by the Almighty Architect.',
      'That time is measured in equal parts.',
      'That wisdom is gained through silence.'
    ],
    correctAnswer: 'That our words and actions are recorded by the Almighty Architect.',
    category: 'working_tools'
  },
  {
    id: 106,
    text: 'The Compasses remind us of',
    answers: [
      'Unerring and impartial justice.',
      'The limits of earthly desires.',
      'The equality of all men in the lodge.'
    ],
    correctAnswer: 'Unerring and impartial justice.',
    category: 'working_tools'
  }
];

export const ORB_DATA: OrbDefinition[] = [
  {
    id: 1,
    x: 1180,
    yOffset: -20,
    radius: 18,
    questionId: 1,
    name: 'Skirret',
    spriteKey: 'skirret',
    blurb: 'The Skirret draws the straight and undeviating line of conduct.',
    points: 150
  },
  {
    id: 2,
    x: 1880,
    yOffset: -220,
    radius: 18,
    questionId: 2,
    name: 'Pencil',
    spriteKey: 'pencil',
    blurb: 'The Pencil records our work in the Book of Life.',
    points: 150
  },
  {
    id: 3,
    x: 3120,
    yOffset: -20,
    radius: 18,
    questionId: 3,
    name: 'Compasses',
    spriteKey: 'compasses',
    blurb: 'The Compasses keep our passions within due bounds.',
    points: 150
  },
  {
    id: 4,
    x: 4150,
    yOffset: -150,
    radius: 18,
    name: 'Sprig of Acacia',
    spriteKey: 'acacia',
    blurb: 'The acacia marks the place of fidelity and hope beyond the grave.',
    points: 250
  }
];

export const REQUIRED_TOOL_IDS = [1, 2, 3];

export const ENEMY_DATA: EnemyDefinition[] = [
  { x: 1200, yOffset: 0, minX: 1050, maxX: 1500, speed: 1.1, type: 'Jubela' },
  { x: 1850, yOffset: -230, minX: 1700, maxX: 2050, speed: 0.9, type: 'Jubelo' },
  { x: 3100, yOffset: 0, minX: 2950, maxX: 3400, speed: 1.6, type: 'Jubelum' }
];
