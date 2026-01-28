// Shared Visual Effects - Shadows, Bloom, Screen Effects
// Early 2000s Graphics Refresh

import { ScreenShake, ScreenTransition, SpriteEffects } from './types';
import { withAlpha, ENHANCED_COLORS, getRadialGradient, GRADIENT_PRESETS } from './colors';

// ============================================
// SMOOTHING HELPERS
// ============================================

/**
 * Toggle image smoothing on context
 * Enable for backgrounds/lighting, disable for sprites
 */
export function setSmoothing(ctx: CanvasRenderingContext2D, enabled: boolean): void {
  ctx.imageSmoothingEnabled = enabled;
  // Legacy browser support
  (ctx as any).mozImageSmoothingEnabled = enabled;
  (ctx as any).webkitImageSmoothingEnabled = enabled;
  (ctx as any).msImageSmoothingEnabled = enabled;
}

// ============================================
// DROP SHADOW SYSTEM
// ============================================

export interface DropShadowOptions {
  offsetX?: number;
  offsetY?: number;
  blur?: number;
  opacity?: number;
  color?: string;
  ellipse?: boolean;  // Use ellipse shape (for characters)
}

const DEFAULT_SHADOW: Required<DropShadowOptions> = {
  offsetX: 0,
  offsetY: 4,
  blur: 8,
  opacity: 0.3,
  color: '#000000',
  ellipse: true,
};

/**
 * Draw a drop shadow beneath an object
 */
export function drawDropShadow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  options: DropShadowOptions = {}
): void {
  const opts = { ...DEFAULT_SHADOW, ...options };

  ctx.save();

  const shadowX = x + width / 2 + opts.offsetX;
  const shadowY = y + height + opts.offsetY;
  const shadowWidth = width * 0.8;
  const shadowHeight = opts.blur * 0.5;

  if (opts.ellipse) {
    // Elliptical shadow (better for characters)
    const gradient = ctx.createRadialGradient(
      shadowX, shadowY, 0,
      shadowX, shadowY, shadowWidth / 2
    );
    gradient.addColorStop(0, withAlpha(opts.color, opts.opacity));
    gradient.addColorStop(0.5, withAlpha(opts.color, opts.opacity * 0.5));
    gradient.addColorStop(1, withAlpha(opts.color, 0));

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(shadowX, shadowY, shadowWidth / 2, shadowHeight, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Rectangular shadow with blur
    const gradient = ctx.createRadialGradient(
      shadowX, shadowY, 0,
      shadowX, shadowY, Math.max(shadowWidth, shadowHeight)
    );
    gradient.addColorStop(0, withAlpha(opts.color, opts.opacity));
    gradient.addColorStop(1, withAlpha(opts.color, 0));

    ctx.fillStyle = gradient;
    ctx.fillRect(
      shadowX - shadowWidth / 2,
      shadowY - shadowHeight / 2,
      shadowWidth,
      shadowHeight
    );
  }

  ctx.restore();
}

/**
 * Draw shadow for a moving/jumping character
 * Shadow shrinks when character is higher
 */
export function drawDynamicShadow(
  ctx: CanvasRenderingContext2D,
  x: number,
  groundY: number,
  width: number,
  currentY: number,
  options: DropShadowOptions = {}
): void {
  const heightAboveGround = groundY - currentY;
  const maxHeight = 200; // Maximum height for shadow scaling

  // Scale shadow based on height (smaller when higher)
  const scale = Math.max(0.2, 1 - heightAboveGround / maxHeight);
  const opacity = (options.opacity ?? DEFAULT_SHADOW.opacity) * scale;

  drawDropShadow(ctx, x, groundY - 4, width * scale, 0, {
    ...options,
    opacity,
    blur: (options.blur ?? DEFAULT_SHADOW.blur) * scale,
  });
}

// ============================================
// BLOOM / GLOW EFFECTS
// ============================================

export interface BloomOptions {
  radius: number;
  intensity: number;
  color: string;
  layers?: number;    // Number of glow rings
  pulse?: boolean;
  pulseSpeed?: number;
  pulseAmount?: number;
}

/**
 * Draw a soft bloom/glow effect
 */
export function drawBloom(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  options: BloomOptions,
  frameTime: number = 0
): void {
  const {
    radius,
    intensity,
    color,
    layers = 3,
    pulse = false,
    pulseSpeed = 500,
    pulseAmount = 0.2,
  } = options;

  ctx.save();

  // Calculate pulse modifier
  let pulseMod = 1;
  if (pulse) {
    pulseMod = 1 + Math.sin(frameTime / pulseSpeed) * pulseAmount;
  }

  const effectiveRadius = radius * pulseMod;

  // Draw multiple layers for soft bloom
  for (let i = layers; i > 0; i--) {
    const layerRadius = effectiveRadius * (i / layers);
    const layerIntensity = intensity * (1 - (i - 1) / layers) * 0.5;

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, layerRadius);
    gradient.addColorStop(0, withAlpha(color, layerIntensity));
    gradient.addColorStop(0.5, withAlpha(color, layerIntensity * 0.5));
    gradient.addColorStop(1, withAlpha(color, 0));

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, layerRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Draw collectible sparkle effect
 */
export function drawCollectibleGlow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  frameTime: number
): void {
  const pulse = Math.sin(frameTime / 400) * 0.3 + 0.7;

  // Outer glow
  drawBloom(ctx, x, y, {
    radius: radius * 2.5,
    intensity: 0.3 * pulse,
    color: ENHANCED_COLORS.GOLD_BRIGHT,
    layers: 3,
  });

  // Inner bright core
  drawBloom(ctx, x, y, {
    radius: radius * 1.2,
    intensity: 0.6 * pulse,
    color: ENHANCED_COLORS.GOLD_WHITE,
    layers: 2,
  });

  // Sparkle points
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(frameTime / 1000);

  const sparkleCount = 4;
  ctx.strokeStyle = withAlpha(ENHANCED_COLORS.SPARK_WHITE, 0.8 * pulse);
  ctx.lineWidth = 1.5;

  for (let i = 0; i < sparkleCount; i++) {
    const angle = (i / sparkleCount) * Math.PI * 2;
    const innerR = radius * 0.8;
    const outerR = radius * 1.5 * pulse;

    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * innerR, Math.sin(angle) * innerR);
    ctx.lineTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR);
    ctx.stroke();
  }

  ctx.restore();
}

// ============================================
// SCREEN EFFECTS
// ============================================

/**
 * Apply screen shake with easing
 */
export function updateScreenShake(shake: ScreenShake, deltaTime: number): ScreenShake {
  if (!shake.active || shake.intensity <= 0.1) {
    return { ...shake, x: 0, y: 0, active: false };
  }

  // Random offset based on intensity
  const angle = Math.random() * Math.PI * 2;
  const magnitude = shake.intensity * (0.5 + Math.random() * 0.5);

  return {
    x: Math.cos(angle) * magnitude,
    y: Math.sin(angle) * magnitude,
    intensity: shake.intensity * shake.decay,
    decay: shake.decay,
    active: shake.intensity > 0.1,
  };
}

/**
 * Create a new screen shake
 */
export function createScreenShake(intensity: number, decay: number = 0.9): ScreenShake {
  return {
    x: 0,
    y: 0,
    intensity,
    decay,
    active: true,
  };
}

/**
 * Apply vignette effect to screen edges
 */
export function drawVignette(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  intensity: number = 0.4
): void {
  ctx.save();

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.max(width, height) * 0.7;

  const gradient = ctx.createRadialGradient(
    centerX, centerY, radius * 0.3,
    centerX, centerY, radius
  );
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(0.8, withAlpha('#000000', intensity * 0.3));
  gradient.addColorStop(1, withAlpha('#000000', intensity));

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.restore();
}

// ============================================
// SCREEN TRANSITIONS
// ============================================

/**
 * Create a fade transition
 */
export function createFadeTransition(
  type: 'in' | 'out',
  duration: number,
  color: string = '#000000'
): ScreenTransition {
  return {
    type: 'fade',
    progress: type === 'in' ? 1 : 0,
    duration,
    startTime: Date.now(),
    color,
  };
}

/**
 * Create a flash transition (for checkpoint, correct answer, etc.)
 */
export function createFlashTransition(
  duration: number = 200,
  color: string = '#ffffff'
): ScreenTransition {
  return {
    type: 'flash',
    progress: 0,
    duration,
    startTime: Date.now(),
    color,
    intensity: 0.5,
  };
}

/**
 * Update transition progress
 */
export function updateTransition(transition: ScreenTransition): ScreenTransition | null {
  const elapsed = Date.now() - transition.startTime;
  const progress = Math.min(1, elapsed / transition.duration);

  if (progress >= 1) {
    return null; // Transition complete
  }

  return { ...transition, progress };
}

/**
 * Draw screen transition overlay
 */
export function drawTransition(
  ctx: CanvasRenderingContext2D,
  transition: ScreenTransition,
  width: number,
  height: number
): void {
  const elapsed = Date.now() - transition.startTime;
  let progress = Math.min(1, elapsed / transition.duration);

  ctx.save();

  if (transition.type === 'fade') {
    // Ease in/out
    progress = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    ctx.fillStyle = withAlpha(transition.color || '#000000', progress);
    ctx.fillRect(0, 0, width, height);
  } else if (transition.type === 'flash') {
    // Quick flash that fades
    const flashProgress = 1 - progress;
    const intensity = (transition.intensity || 0.5) * flashProgress;

    ctx.fillStyle = withAlpha(transition.color || '#ffffff', intensity);
    ctx.fillRect(0, 0, width, height);
  }

  ctx.restore();
}

// ============================================
// AMBIENT OCCLUSION HINTS
// ============================================

/**
 * Draw corner darkening where walls meet floors
 */
export function drawCornerAO(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  intensity: number = 0.3
): void {
  ctx.save();

  const aoSize = 20;

  // Bottom-left corner
  const blGrad = ctx.createRadialGradient(x, y + height, 0, x, y + height, aoSize);
  blGrad.addColorStop(0, withAlpha('#000000', intensity));
  blGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = blGrad;
  ctx.fillRect(x - aoSize, y + height - aoSize, aoSize * 2, aoSize * 2);

  // Bottom-right corner
  const brGrad = ctx.createRadialGradient(x + width, y + height, 0, x + width, y + height, aoSize);
  brGrad.addColorStop(0, withAlpha('#000000', intensity));
  brGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = brGrad;
  ctx.fillRect(x + width - aoSize, y + height - aoSize, aoSize * 2, aoSize * 2);

  ctx.restore();
}

/**
 * Draw depth-based darkening for caves/mines
 */
export function drawDepthDarkening(
  ctx: CanvasRenderingContext2D,
  y: number,
  width: number,
  height: number,
  baseY: number,
  maxDepth: number,
  intensity: number = 0.4
): void {
  const depth = Math.max(0, y - baseY);
  const depthRatio = Math.min(1, depth / maxDepth);
  const darkness = depthRatio * intensity;

  if (darkness > 0.01) {
    ctx.save();
    ctx.fillStyle = withAlpha('#000000', darkness);
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }
}

// ============================================
// MOTION EFFECTS
// ============================================

/**
 * Draw motion blur hint (speed lines)
 */
export function drawMotionBlur(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  velocityX: number,
  velocityY: number,
  intensity: number = 0.3
): void {
  const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
  if (speed < 3) return; // Only draw when moving fast

  ctx.save();

  const lineCount = Math.min(5, Math.floor(speed / 2));
  const lineLength = speed * 2;

  ctx.strokeStyle = withAlpha('#ffffff', intensity * (speed / 10));
  ctx.lineWidth = 1;

  for (let i = 0; i < lineCount; i++) {
    const offsetY = (i - lineCount / 2) * (height / lineCount);
    const startX = x + width / 2 - (velocityX > 0 ? lineLength : -lineLength);
    const startY = y + height / 2 + offsetY;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX + (velocityX > 0 ? -lineLength : lineLength) * 0.5, startY);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Draw afterimage trail for fast movement
 */
export function drawAfterimage(
  ctx: CanvasRenderingContext2D,
  positions: Array<{ x: number; y: number }>,
  width: number,
  height: number,
  color: string = '#ffffff'
): void {
  if (positions.length < 2) return;

  ctx.save();

  for (let i = 0; i < positions.length - 1; i++) {
    const pos = positions[i];
    const alpha = (i / positions.length) * 0.3;

    ctx.fillStyle = withAlpha(color, alpha);
    ctx.fillRect(pos.x, pos.y, width, height);
  }

  ctx.restore();
}
