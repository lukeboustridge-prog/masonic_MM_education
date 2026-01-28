// Shared Screen Transitions & UI Effects
// Early 2000s Graphics Refresh - Polish Effects

import { ScreenTransition } from './types';
import { withAlpha, ENHANCED_COLORS, lerpColor } from './colors';
import { Easing } from './sprites';

// ============================================
// TRANSITION MANAGER
// ============================================

export class TransitionManager {
  private activeTransition: ScreenTransition | null = null;
  private onComplete: (() => void) | null = null;

  /**
   * Start a new transition
   */
  start(
    type: ScreenTransition['type'],
    duration: number,
    options: {
      color?: string;
      intensity?: number;
      onComplete?: () => void;
    } = {}
  ): void {
    this.activeTransition = {
      type,
      progress: 0,
      duration,
      startTime: Date.now(),
      color: options.color,
      intensity: options.intensity,
    };
    this.onComplete = options.onComplete || null;
  }

  /**
   * Fade to black
   */
  fadeOut(duration: number = 500, onComplete?: () => void): void {
    this.start('fade', duration, { color: '#000000', onComplete });
  }

  /**
   * Fade from black
   */
  fadeIn(duration: number = 500, onComplete?: () => void): void {
    this.activeTransition = {
      type: 'fade',
      progress: 1, // Start full black
      duration,
      startTime: Date.now(),
      color: '#000000',
    };
    this.onComplete = onComplete || null;
  }

  /**
   * Flash effect (white flash on checkpoint, etc.)
   */
  flash(duration: number = 200, color: string = '#ffffff', intensity: number = 0.6): void {
    this.start('flash', duration, { color, intensity });
  }

  /**
   * Update transition state
   */
  update(): void {
    if (!this.activeTransition) return;

    const elapsed = Date.now() - this.activeTransition.startTime;
    const rawProgress = Math.min(1, elapsed / this.activeTransition.duration);

    // Determine progress direction based on transition type
    if (this.activeTransition.type === 'fade' && this.activeTransition.progress === 1) {
      // Fade in (started at 1, going to 0)
      this.activeTransition.progress = 1 - Easing.easeOutQuad(rawProgress);
    } else {
      // Fade out or flash (started at 0, going to 1)
      this.activeTransition.progress = Easing.easeOutQuad(rawProgress);
    }

    // Check completion
    if (rawProgress >= 1) {
      const callback = this.onComplete;
      this.activeTransition = null;
      this.onComplete = null;
      if (callback) callback();
    }
  }

  /**
   * Render transition overlay
   */
  render(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    if (!this.activeTransition) return;

    const { type, progress, color, intensity } = this.activeTransition;

    ctx.save();

    if (type === 'fade') {
      ctx.fillStyle = withAlpha(color || '#000000', progress);
      ctx.fillRect(0, 0, width, height);
    } else if (type === 'flash') {
      // Flash peaks at middle then fades
      const flashCurve = progress < 0.3
        ? progress / 0.3
        : 1 - ((progress - 0.3) / 0.7);
      const alpha = flashCurve * (intensity || 0.5);

      ctx.fillStyle = withAlpha(color || '#ffffff', alpha);
      ctx.fillRect(0, 0, width, height);
    }

    ctx.restore();
  }

  /**
   * Check if a transition is active
   */
  isActive(): boolean {
    return this.activeTransition !== null;
  }

  /**
   * Force clear transition
   */
  clear(): void {
    this.activeTransition = null;
    this.onComplete = null;
  }
}

// ============================================
// UI BUTTON EFFECTS
// ============================================

export interface ButtonStyle {
  background: string;
  backgroundHover: string;
  border: string;
  borderHover: string;
  text: string;
  shadow: string;
  bevelLight: string;
  bevelDark: string;
}

export const DEFAULT_BUTTON_STYLE: ButtonStyle = {
  background: ENHANCED_COLORS.STONE_MID,
  backgroundHover: ENHANCED_COLORS.STONE_LIGHT,
  border: ENHANCED_COLORS.STONE_DARK,
  borderHover: ENHANCED_COLORS.GOLD,
  text: '#ffffff',
  shadow: 'rgba(0, 0, 0, 0.4)',
  bevelLight: 'rgba(255, 255, 255, 0.2)',
  bevelDark: 'rgba(0, 0, 0, 0.3)',
};

/**
 * Draw a beveled button (early 2000s style)
 */
export function drawBeveledButton(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  text: string,
  isHovered: boolean = false,
  isPressed: boolean = false,
  style: Partial<ButtonStyle> = {}
): void {
  const s = { ...DEFAULT_BUTTON_STYLE, ...style };
  const bevelSize = 2;
  const shadowOffset = isPressed ? 1 : 3;

  ctx.save();

  // Drop shadow
  ctx.fillStyle = s.shadow;
  ctx.fillRect(x + shadowOffset, y + shadowOffset, width, height);

  // Main button background
  const bgColor = isHovered ? s.backgroundHover : s.background;
  ctx.fillStyle = bgColor;
  ctx.fillRect(x, y, width, height);

  // Bevel highlight (top-left)
  if (!isPressed) {
    ctx.fillStyle = s.bevelLight;
    ctx.fillRect(x, y, width, bevelSize);
    ctx.fillRect(x, y, bevelSize, height);
  }

  // Bevel shadow (bottom-right)
  ctx.fillStyle = s.bevelDark;
  ctx.fillRect(x, y + height - bevelSize, width, bevelSize);
  ctx.fillRect(x + width - bevelSize, y, bevelSize, height);

  // Border
  ctx.strokeStyle = isHovered ? s.borderHover : s.border;
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, width, height);

  // Hover glow
  if (isHovered) {
    ctx.strokeStyle = withAlpha(ENHANCED_COLORS.GOLD, 0.5);
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 1, y - 1, width + 2, height + 2);
  }

  // Text
  ctx.fillStyle = s.text;
  ctx.font = 'bold 14px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Text shadow for depth
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillText(text, x + width / 2 + 1, y + height / 2 + 1 + (isPressed ? 1 : 0));
  ctx.fillStyle = s.text;
  ctx.fillText(text, x + width / 2, y + height / 2 + (isPressed ? 1 : 0));

  ctx.restore();
}

// ============================================
// SCORE / UI ANIMATIONS
// ============================================

export interface ScorePopup {
  x: number;
  y: number;
  value: number | string;
  startTime: number;
  duration: number;
  color: string;
}

export class ScorePopupManager {
  private popups: ScorePopup[] = [];

  /**
   * Add a new score popup
   */
  add(
    x: number,
    y: number,
    value: number | string,
    options: {
      duration?: number;
      color?: string;
    } = {}
  ): void {
    this.popups.push({
      x,
      y,
      value,
      startTime: Date.now(),
      duration: options.duration || 1000,
      color: options.color || ENHANCED_COLORS.GOLD_BRIGHT,
    });
  }

  /**
   * Add a "+X" score popup
   */
  addScore(x: number, y: number, points: number): void {
    this.add(x, y, `+${points}`, {
      color: points > 0 ? ENHANCED_COLORS.GOLD_BRIGHT : ENHANCED_COLORS.ERROR_RED,
    });
  }

  /**
   * Update and remove old popups
   */
  update(): void {
    const now = Date.now();
    this.popups = this.popups.filter(p => now - p.startTime < p.duration);
  }

  /**
   * Render all popups
   */
  render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    const now = Date.now();

    ctx.save();

    for (const popup of this.popups) {
      const elapsed = now - popup.startTime;
      const progress = elapsed / popup.duration;

      // Eased animation
      const easedProgress = Easing.easeOutCubic(progress);

      // Float upward and fade out
      const yOffset = easedProgress * 40;
      const alpha = 1 - progress;
      const scale = 1 + easedProgress * 0.3;

      const screenX = popup.x - cameraX;
      const screenY = popup.y - cameraY - yOffset;

      ctx.save();
      ctx.translate(screenX, screenY);
      ctx.scale(scale, scale);

      // Text shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.font = 'bold 16px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(popup.value), 1, 1);

      // Main text
      ctx.fillStyle = withAlpha(popup.color, alpha);
      ctx.fillText(String(popup.value), 0, 0);

      ctx.restore();
    }

    ctx.restore();
  }

  /**
   * Clear all popups
   */
  clear(): void {
    this.popups = [];
  }
}

// ============================================
// VICTORY / GAME OVER EFFECTS
// ============================================

/**
 * Draw victory celebration effect
 */
export function drawVictoryCelebration(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  frameTime: number,
  intensity: number = 1
): void {
  ctx.save();

  // Golden rays from center
  const centerX = width / 2;
  const centerY = height / 2;
  const rayCount = 12;
  const rotation = frameTime / 3000;

  ctx.translate(centerX, centerY);
  ctx.rotate(rotation);

  for (let i = 0; i < rayCount; i++) {
    const angle = (i / rayCount) * Math.PI * 2;
    const rayLength = Math.max(width, height);
    const rayWidth = 0.15;

    const gradient = ctx.createLinearGradient(0, 0, Math.cos(angle) * rayLength, Math.sin(angle) * rayLength);
    gradient.addColorStop(0, withAlpha(ENHANCED_COLORS.GOLD_BRIGHT, 0.3 * intensity));
    gradient.addColorStop(0.5, withAlpha(ENHANCED_COLORS.GOLD, 0.1 * intensity));
    gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(
      Math.cos(angle - rayWidth) * rayLength,
      Math.sin(angle - rayWidth) * rayLength
    );
    ctx.lineTo(
      Math.cos(angle + rayWidth) * rayLength,
      Math.sin(angle + rayWidth) * rayLength
    );
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
  }

  ctx.restore();

  // Shimmer overlay
  const shimmer = Math.sin(frameTime / 200) * 0.5 + 0.5;
  ctx.fillStyle = withAlpha(ENHANCED_COLORS.GOLD_WHITE, 0.05 * shimmer * intensity);
  ctx.fillRect(0, 0, width, height);
}

/**
 * Draw game over visual treatment
 */
export function drawGameOverEffect(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  progress: number // 0-1
): void {
  ctx.save();

  // Desaturation effect (simulate by darkening)
  const darkness = Easing.easeInQuad(progress) * 0.5;
  ctx.fillStyle = withAlpha('#000000', darkness);
  ctx.fillRect(0, 0, width, height);

  // Red vignette
  const vignetteIntensity = progress * 0.3;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.max(width, height) * 0.7;

  const gradient = ctx.createRadialGradient(
    centerX, centerY, radius * 0.3,
    centerX, centerY, radius
  );
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(1, withAlpha(ENHANCED_COLORS.ERROR_RED, vignetteIntensity));

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.restore();
}

// ============================================
// PROGRESS INDICATORS
// ============================================

/**
 * Draw animated progress bar
 */
export function drawProgressBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  progress: number, // 0-1
  frameTime: number
): void {
  ctx.save();

  // Background
  ctx.fillStyle = ENHANCED_COLORS.STONE_DARK;
  ctx.fillRect(x, y, width, height);

  // Border
  ctx.strokeStyle = ENHANCED_COLORS.STONE_LIGHT;
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, width, height);

  // Fill
  const fillWidth = (width - 4) * Math.min(1, progress);
  if (fillWidth > 0) {
    const gradient = ctx.createLinearGradient(x + 2, y, x + 2 + fillWidth, y);
    gradient.addColorStop(0, ENHANCED_COLORS.GOLD);
    gradient.addColorStop(0.5, ENHANCED_COLORS.GOLD_BRIGHT);
    gradient.addColorStop(1, ENHANCED_COLORS.GOLD);

    ctx.fillStyle = gradient;
    ctx.fillRect(x + 2, y + 2, fillWidth, height - 4);

    // Animated shine
    const shinePos = ((frameTime / 1000) % 1) * (fillWidth + 30) - 15;
    const shineGradient = ctx.createLinearGradient(x + 2 + shinePos - 15, y, x + 2 + shinePos + 15, y);
    shineGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
    shineGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
    shineGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = shineGradient;
    ctx.fillRect(x + 2, y + 2, fillWidth, height - 4);
  }

  ctx.restore();
}

// ============================================
// CAMERA SMOOTHING
// ============================================

export interface CameraState {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  smoothing: number; // 0-1, lower = smoother
  deadzone: { x: number; y: number }; // Deadzone around target
}

/**
 * Create camera state
 */
export function createCameraState(x: number = 0, y: number = 0): CameraState {
  return {
    x,
    y,
    targetX: x,
    targetY: y,
    smoothing: 0.1,
    deadzone: { x: 20, y: 10 },
  };
}

/**
 * Update camera position with smoothing
 */
export function updateCamera(state: CameraState): void {
  // Calculate distance to target
  const dx = state.targetX - state.x;
  const dy = state.targetY - state.y;

  // Apply deadzone
  const adjustedDX = Math.abs(dx) > state.deadzone.x
    ? dx - Math.sign(dx) * state.deadzone.x
    : 0;
  const adjustedDY = Math.abs(dy) > state.deadzone.y
    ? dy - Math.sign(dy) * state.deadzone.y
    : 0;

  // Smooth interpolation
  state.x += adjustedDX * state.smoothing;
  state.y += adjustedDY * state.smoothing;
}

/**
 * Set camera target (typically player position)
 */
export function setCameraTarget(
  state: CameraState,
  targetX: number,
  targetY: number
): void {
  state.targetX = targetX;
  state.targetY = targetY;
}
