// Shared Rendering Types for Masonic Educational Games
// Early 2000s Graphics Refresh - Type Definitions

// ============================================
// PARTICLE SYSTEM TYPES
// ============================================

export type ParticleType =
  | 'dust'           // Ground dust on landing/movement
  | 'sparkle'        // Collectible shimmer
  | 'ember'          // Torch/fire particles
  | 'collection'     // Burst on collecting item
  | 'checkpoint'     // Checkpoint activation
  | 'star'           // Celestial area particles
  | 'quiz_correct'   // Correct answer celebration
  | 'quiz_wrong';    // Wrong answer feedback

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  type: ParticleType;
  color: string;
  alpha: number;
  gravity: number;
  friction: number;
  fadeIn?: number;   // Frames to fade in (0-1)
  rotation?: number;
  rotationSpeed?: number;
  trail?: boolean;   // Leave trail behind
}

export interface ParticleEmitter {
  x: number;
  y: number;
  type: ParticleType;
  rate: number;           // Particles per second
  spread: number;         // Angle spread in radians
  direction: number;      // Base direction in radians
  speedMin: number;
  speedMax: number;
  lifeMin: number;
  lifeMax: number;
  sizeMin: number;
  sizeMax: number;
  colors: string[];
  active: boolean;
}

// ============================================
// LIGHTING SYSTEM TYPES
// ============================================

export interface LightSource {
  x: number;
  y: number;
  radius: number;
  intensity: number;      // 0-1
  color: string;
  flicker?: boolean;      // Enable flicker animation
  flickerSpeed?: number;  // Flicker frequency
  flickerAmount?: number; // Flicker intensity variation
  pulseSpeed?: number;    // Radius pulse speed
  pulseAmount?: number;   // Radius pulse amount
}

export interface AmbientOcclusion {
  corners: boolean;       // Darken wall/floor corners
  vignette: boolean;      // Screen edge darkening
  vignetteIntensity: number;
  depthDarkening: boolean; // Darken based on Y position
}

// ============================================
// BACKGROUND & PARALLAX TYPES
// ============================================

export interface ParallaxLayer {
  name: string;
  scrollFactor: number;   // 0 = static, 1 = full scroll
  yOffset: number;        // Vertical offset
  renderFn: (
    ctx: CanvasRenderingContext2D,
    cameraX: number,
    cameraY: number,
    viewWidth: number,
    viewHeight: number,
    frameTime: number
  ) => void;
}

export interface StarField {
  x: number;
  y: number;
  size: number;
  phase: number;
  brightness: number;
  color: 'white' | 'blue' | 'gold';
  twinkleSpeed: number;
}

export interface AtmosphericEffect {
  type: 'fog' | 'haze' | 'heat_shimmer' | 'god_rays';
  intensity: number;
  color: string;
  bounds?: { x: number; y: number; width: number; height: number };
}

// ============================================
// SCREEN EFFECTS TYPES
// ============================================

export interface ScreenTransition {
  type: 'fade' | 'flash' | 'shake';
  progress: number;       // 0-1
  duration: number;       // ms
  startTime: number;
  color?: string;
  intensity?: number;
}

export interface ScreenShake {
  x: number;
  y: number;
  intensity: number;
  decay: number;
  active: boolean;
}

// ============================================
// SPRITE ENHANCEMENT TYPES
// ============================================

export interface SpriteEffects {
  dropShadow?: {
    offsetX: number;
    offsetY: number;
    blur: number;
    opacity: number;
    color: string;
  };
  glow?: {
    radius: number;
    color: string;
    intensity: number;
    pulse?: boolean;
    pulseSpeed?: number;
  };
  motionBlur?: {
    enabled: boolean;
    samples: number;
    strength: number;
  };
  afterimage?: {
    enabled: boolean;
    count: number;
    spacing: number;
    fadeRate: number;
  };
}

export interface AnimationState {
  frame: number;
  elapsed: number;
  playing: boolean;
  loop: boolean;
  speed: number;
}

// ============================================
// COLOR & GRADIENT TYPES
// ============================================

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  highlight: string;
  shadow: string;
  background: string;
}

export interface GradientStop {
  offset: number;
  color: string;
}

export interface CachedGradient {
  id: string;
  gradient: CanvasGradient;
  lastUsed: number;
}

// ============================================
// RENDERING CONTEXT HELPERS
// ============================================

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  cameraX: number;
  cameraY: number;
  viewWidth: number;
  viewHeight: number;
  scaleRatio: number;
  frameTime: number;
  deltaTime: number;
}

export interface RenderStats {
  particles: number;
  lights: number;
  drawCalls: number;
  frameTime: number;
}
