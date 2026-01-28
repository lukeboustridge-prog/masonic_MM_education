// Shared Sprite Enhancement Helpers
// Early 2000s Graphics Refresh - Sprite Polish

import { SpriteEffects, AnimationState } from './types';
import { withAlpha, ENHANCED_COLORS } from './colors';

// ============================================
// ANIMATION EASING FUNCTIONS
// ============================================

export const Easing = {
  // Linear (no easing)
  linear: (t: number): number => t,

  // Ease in (slow start)
  easeInQuad: (t: number): number => t * t,
  easeInCubic: (t: number): number => t * t * t,

  // Ease out (slow end)
  easeOutQuad: (t: number): number => t * (2 - t),
  easeOutCubic: (t: number): number => 1 - Math.pow(1 - t, 3),
  easeOutBack: (t: number): number => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },

  // Ease in-out
  easeInOutQuad: (t: number): number =>
    t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  easeInOutCubic: (t: number): number =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,

  // Bounce
  easeOutBounce: (t: number): number => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },

  // Elastic
  easeOutElastic: (t: number): number => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 :
      Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
};

// ============================================
// SQUASH & STRETCH
// ============================================

export interface SquashStretchState {
  scaleX: number;
  scaleY: number;
  targetScaleX: number;
  targetScaleY: number;
  recovery: number; // 0-1, how fast to return to normal
}

/**
 * Create initial squash/stretch state
 */
export function createSquashStretch(): SquashStretchState {
  return {
    scaleX: 1,
    scaleY: 1,
    targetScaleX: 1,
    targetScaleY: 1,
    recovery: 0.15,
  };
}

/**
 * Apply landing squash effect
 */
export function applyLandingSquash(
  state: SquashStretchState,
  impactVelocity: number,
  maxSquash: number = 0.3
): void {
  const squashAmount = Math.min(maxSquash, Math.abs(impactVelocity) / 20);
  state.scaleX = 1 + squashAmount * 0.5;
  state.scaleY = 1 - squashAmount;
}

/**
 * Apply jump stretch effect
 */
export function applyJumpStretch(state: SquashStretchState): void {
  state.scaleX = 0.85;
  state.scaleY = 1.15;
}

/**
 * Update squash/stretch (call each frame)
 */
export function updateSquashStretch(state: SquashStretchState): void {
  // Interpolate back to normal
  state.scaleX += (state.targetScaleX - state.scaleX) * state.recovery;
  state.scaleY += (state.targetScaleY - state.scaleY) * state.recovery;
}

/**
 * Apply squash/stretch transform to context
 */
export function applySquashStretchTransform(
  ctx: CanvasRenderingContext2D,
  state: SquashStretchState,
  pivotX: number,
  pivotY: number
): void {
  ctx.translate(pivotX, pivotY);
  ctx.scale(state.scaleX, state.scaleY);
  ctx.translate(-pivotX, -pivotY);
}

// ============================================
// BREATHING / IDLE ANIMATION
// ============================================

/**
 * Calculate breathing offset for idle animation
 */
export function getBreathingOffset(frameTime: number, speed: number = 2000): { x: number; y: number } {
  const breathCycle = frameTime / speed;
  return {
    x: 0,
    y: Math.sin(breathCycle * Math.PI * 2) * 1.5, // Subtle bob
  };
}

/**
 * Calculate NPC hover animation
 */
export function getHoverOffset(frameTime: number, speed: number = 1500): { x: number; y: number } {
  const hoverCycle = frameTime / speed;
  return {
    x: Math.sin(hoverCycle * Math.PI * 4) * 0.5, // Subtle sway
    y: Math.sin(hoverCycle * Math.PI * 2) * 2,   // Up/down bob
  };
}

// ============================================
// SMOOTH FACING DIRECTION
// ============================================

export interface FacingState {
  current: number;      // -1 or 1
  target: number;       // -1 or 1
  transition: number;   // 0-1
  transitionSpeed: number;
}

/**
 * Create facing state
 */
export function createFacingState(initial: number = 1): FacingState {
  return {
    current: initial,
    target: initial,
    transition: 1,
    transitionSpeed: 0.2,
  };
}

/**
 * Set new facing direction
 */
export function setFacingDirection(state: FacingState, direction: number): void {
  if (direction !== state.target) {
    state.target = direction;
    state.transition = 0;
  }
}

/**
 * Update facing state (call each frame)
 */
export function updateFacingState(state: FacingState): void {
  if (state.transition < 1) {
    state.transition += state.transitionSpeed;
    if (state.transition >= 1) {
      state.transition = 1;
      state.current = state.target;
    }
  }
}

/**
 * Get facing scale for rendering
 * Returns a scale that transitions through 0 (squish) when turning
 */
export function getFacingScale(state: FacingState): number {
  if (state.transition >= 1) {
    return state.current;
  }

  // Squish at midpoint of turn
  const squishPoint = 0.5;
  if (state.transition < squishPoint) {
    // Squishing from current direction
    const t = state.transition / squishPoint;
    return state.current * (1 - t);
  } else {
    // Expanding to target direction
    const t = (state.transition - squishPoint) / (1 - squishPoint);
    return state.target * t;
  }
}

// ============================================
// WALK CYCLE HELPERS
// ============================================

export interface WalkCycleState {
  phase: number;        // Current cycle phase (0-1)
  speed: number;        // Base speed
  amplitude: number;    // Leg swing amplitude
  armSwing: number;     // Arm swing amplitude
  bodyBob: number;      // Vertical bob amount
}

/**
 * Create walk cycle state
 */
export function createWalkCycle(): WalkCycleState {
  return {
    phase: 0,
    speed: 1,
    amplitude: 6,
    armSwing: 4,
    bodyBob: 2,
  };
}

/**
 * Update walk cycle based on velocity
 */
export function updateWalkCycle(
  state: WalkCycleState,
  velocityX: number,
  deltaTime: number
): void {
  const speed = Math.abs(velocityX);

  if (speed < 0.1) {
    // Not moving, gradually reset
    state.phase = state.phase * 0.9;
    return;
  }

  // Update phase based on speed
  const cycleSpeed = speed * 0.02 * state.speed;
  state.phase = (state.phase + cycleSpeed * deltaTime / 16.67) % 1;
}

/**
 * Get leg offsets for walk cycle
 */
export function getWalkCycleOffsets(state: WalkCycleState): {
  leftLeg: number;
  rightLeg: number;
  leftArm: number;
  rightArm: number;
  bodyY: number;
} {
  const cycleAngle = state.phase * Math.PI * 2;

  return {
    leftLeg: Math.sin(cycleAngle) * state.amplitude,
    rightLeg: Math.sin(cycleAngle + Math.PI) * state.amplitude,
    leftArm: Math.sin(cycleAngle + Math.PI) * state.armSwing,
    rightArm: Math.sin(cycleAngle) * state.armSwing,
    bodyY: Math.abs(Math.sin(cycleAngle * 2)) * state.bodyBob,
  };
}

// ============================================
// SPRITE GLOW EFFECT
// ============================================

/**
 * Draw glow effect behind sprite
 */
export function drawSpriteGlow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  intensity: number,
  frameTime: number,
  pulse: boolean = true
): void {
  ctx.save();

  let effectiveIntensity = intensity;
  if (pulse) {
    effectiveIntensity *= 0.7 + Math.sin(frameTime / 400) * 0.3;
  }

  const centerX = x + width / 2;
  const centerY = y + height / 2;
  const radius = Math.max(width, height) * 0.8;

  const gradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, radius
  );
  gradient.addColorStop(0, withAlpha(color, effectiveIntensity * 0.6));
  gradient.addColorStop(0.5, withAlpha(color, effectiveIntensity * 0.3));
  gradient.addColorStop(1, withAlpha(color, 0));

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radius, radius * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draw collar/jewel glint effect
 */
export function drawGlintEffect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  frameTime: number
): void {
  // Glint only appears occasionally
  const glintCycle = (frameTime / 2000) % 1;
  if (glintCycle > 0.1) return;

  ctx.save();

  const intensity = Math.sin(glintCycle / 0.1 * Math.PI);

  // Star-shaped glint
  ctx.fillStyle = withAlpha('#ffffff', intensity);

  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 - Math.PI / 4;
    const outerR = size;
    const innerR = size * 0.2;

    if (i === 0) {
      ctx.moveTo(x + Math.cos(angle) * outerR, y + Math.sin(angle) * outerR);
    } else {
      ctx.lineTo(x + Math.cos(angle) * outerR, y + Math.sin(angle) * outerR);
    }

    const midAngle = angle + Math.PI / 4;
    ctx.lineTo(x + Math.cos(midAngle) * innerR, y + Math.sin(midAngle) * innerR);
  }
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

// ============================================
// POSITION HISTORY FOR AFTERIMAGE
// ============================================

export class PositionHistory {
  private positions: Array<{ x: number; y: number; time: number }> = [];
  private maxAge: number;
  private maxCount: number;

  constructor(maxAge: number = 100, maxCount: number = 5) {
    this.maxAge = maxAge;
    this.maxCount = maxCount;
  }

  /**
   * Add a new position
   */
  add(x: number, y: number, time: number): void {
    this.positions.push({ x, y, time });

    // Remove old positions
    while (this.positions.length > this.maxCount) {
      this.positions.shift();
    }

    // Remove by age
    const cutoff = time - this.maxAge;
    this.positions = this.positions.filter(p => p.time > cutoff);
  }

  /**
   * Get positions for rendering afterimages
   */
  getPositions(): Array<{ x: number; y: number; alpha: number }> {
    if (this.positions.length < 2) return [];

    const now = this.positions[this.positions.length - 1].time;

    return this.positions.slice(0, -1).map((p, i) => ({
      x: p.x,
      y: p.y,
      alpha: (i / this.positions.length) * 0.3,
    }));
  }

  /**
   * Clear history
   */
  clear(): void {
    this.positions = [];
  }
}

// ============================================
// ACCELERATION / DECELERATION SMOOTHING
// ============================================

export interface VelocitySmoothing {
  currentVX: number;
  currentVY: number;
  targetVX: number;
  targetVY: number;
  acceleration: number;
  deceleration: number;
}

/**
 * Create velocity smoothing state
 */
export function createVelocitySmoothing(): VelocitySmoothing {
  return {
    currentVX: 0,
    currentVY: 0,
    targetVX: 0,
    targetVY: 0,
    acceleration: 0.3,
    deceleration: 0.2,
  };
}

/**
 * Update smoothed velocity
 */
export function updateSmoothedVelocity(state: VelocitySmoothing): void {
  // X axis
  if (Math.abs(state.targetVX) > Math.abs(state.currentVX)) {
    // Accelerating
    state.currentVX += (state.targetVX - state.currentVX) * state.acceleration;
  } else {
    // Decelerating
    state.currentVX += (state.targetVX - state.currentVX) * state.deceleration;
  }

  // Y axis
  state.currentVY += (state.targetVY - state.currentVY) * state.acceleration;
}
