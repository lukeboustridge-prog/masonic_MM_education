// Shared Enhanced Lighting System
// Early 2000s Graphics Refresh - Soft Glow & Bloom

import { LightSource, AmbientOcclusion } from './types';
import { withAlpha, ENHANCED_COLORS, hexToRgb, getRadialGradient, GRADIENT_PRESETS } from './colors';

// ============================================
// PERLIN-STYLE NOISE FOR FLICKER
// ============================================

// Simple pseudo-random noise for smooth flickering
const noiseCache = new Map<number, number>();

function noise(x: number): number {
  const xi = Math.floor(x);
  const cached = noiseCache.get(xi);
  if (cached !== undefined) return cached;

  // Simple hash function
  const n = Math.sin(xi * 12.9898) * 43758.5453;
  const value = n - Math.floor(n);
  noiseCache.set(xi, value);

  // Limit cache size
  if (noiseCache.size > 1000) {
    const firstKey = noiseCache.keys().next().value;
    if (firstKey !== undefined) noiseCache.delete(firstKey);
  }

  return value;
}

function smoothNoise(x: number): number {
  const xi = Math.floor(x);
  const t = x - xi;

  // Smooth interpolation
  const smoothT = t * t * (3 - 2 * t);

  return noise(xi) * (1 - smoothT) + noise(xi + 1) * smoothT;
}

/**
 * Multi-octave Perlin-style noise for natural flickering
 */
export function flickerNoise(time: number, speed: number = 1, octaves: number = 3): number {
  let value = 0;
  let amplitude = 1;
  let frequency = speed;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    value += smoothNoise(time * frequency) * amplitude;
    maxValue += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }

  return value / maxValue;
}

// ============================================
// ENHANCED LIGHTING APPLICATION
// ============================================

export interface EnhancedLightOptions {
  enableBloom: boolean;
  bloomLayers: number;
  enableColorBleeding: boolean;
  bleedRadius: number;
  enableFlicker: boolean;
  flickerIntensity: number;
}

const DEFAULT_LIGHT_OPTIONS: EnhancedLightOptions = {
  enableBloom: true,
  bloomLayers: 3,
  enableColorBleeding: true,
  bleedRadius: 50,
  enableFlicker: true,
  flickerIntensity: 0.15,
};

/**
 * Apply enhanced lighting with bloom and color bleeding
 */
export function applyEnhancedLighting(
  ctx: CanvasRenderingContext2D,
  lights: LightSource[],
  cameraX: number,
  cameraY: number,
  viewWidth: number,
  viewHeight: number,
  frameTime: number,
  options: Partial<EnhancedLightOptions> = {}
): void {
  const opts = { ...DEFAULT_LIGHT_OPTIONS, ...options };

  ctx.save();

  // Use screen blend mode for additive lighting
  ctx.globalCompositeOperation = 'screen';

  for (const light of lights) {
    // Cull off-screen lights
    const maxRadius = light.radius * 1.5;
    if (
      light.x < cameraX - maxRadius ||
      light.x > cameraX + viewWidth + maxRadius ||
      light.y < cameraY - maxRadius ||
      light.y > cameraY + viewHeight + maxRadius
    ) {
      continue;
    }

    // Calculate flicker modifiers
    let intensityMod = 1;
    let radiusMod = 1;

    if (opts.enableFlicker && light.flicker !== false) {
      const flickerSpeed = light.flickerSpeed || 0.01;
      const flickerAmount = light.flickerAmount || opts.flickerIntensity;

      // Use noise-based flickering for natural look
      intensityMod = 1 + (flickerNoise(frameTime * flickerSpeed, 1, 2) - 0.5) * flickerAmount * 2;
      radiusMod = 1 + (flickerNoise(frameTime * flickerSpeed * 0.7, 1, 2) - 0.5) * flickerAmount;
    }

    // Apply pulse if configured
    if (light.pulseSpeed && light.pulseAmount) {
      const pulse = Math.sin(frameTime / light.pulseSpeed) * light.pulseAmount;
      radiusMod *= 1 + pulse;
    }

    const effectiveIntensity = light.intensity * intensityMod;
    const effectiveRadius = light.radius * radiusMod;

    // Draw bloom layers
    if (opts.enableBloom) {
      drawLightBloom(ctx, light.x, light.y, effectiveRadius, effectiveIntensity, light.color, opts.bloomLayers);
    } else {
      drawSimpleLight(ctx, light.x, light.y, effectiveRadius, effectiveIntensity, light.color);
    }
  }

  // Color bleeding pass
  if (opts.enableColorBleeding && lights.length > 1) {
    applyColorBleeding(ctx, lights, cameraX, cameraY, viewWidth, viewHeight, opts.bleedRadius);
  }

  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();
}

/**
 * Draw light with bloom effect (multiple soft layers)
 */
function drawLightBloom(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  intensity: number,
  color: string,
  layers: number
): void {
  for (let i = layers; i > 0; i--) {
    const layerRadius = radius * (1 + (i - 1) * 0.3);
    const layerIntensity = intensity * (1 / i) * 0.5;

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, layerRadius);
    gradient.addColorStop(0, withAlpha(color, layerIntensity));
    gradient.addColorStop(0.3, withAlpha(color, layerIntensity * 0.6));
    gradient.addColorStop(0.6, withAlpha(color, layerIntensity * 0.3));
    gradient.addColorStop(1, withAlpha(color, 0));

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, layerRadius, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Draw simple light (fallback for performance)
 */
function drawSimpleLight(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  intensity: number,
  color: string
): void {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, withAlpha(color, intensity * 0.6));
  gradient.addColorStop(0.5, withAlpha(color, intensity * 0.3));
  gradient.addColorStop(1, withAlpha(color, 0));

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Apply subtle color bleeding between nearby lights
 */
function applyColorBleeding(
  ctx: CanvasRenderingContext2D,
  lights: LightSource[],
  cameraX: number,
  cameraY: number,
  viewWidth: number,
  viewHeight: number,
  bleedRadius: number
): void {
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = 0.1;

  for (let i = 0; i < lights.length; i++) {
    for (let j = i + 1; j < lights.length; j++) {
      const l1 = lights[i];
      const l2 = lights[j];

      const dx = l2.x - l1.x;
      const dy = l2.y - l1.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Only bleed if lights are close enough
      if (distance < l1.radius + l2.radius + bleedRadius) {
        const midX = (l1.x + l2.x) / 2;
        const midY = (l1.y + l2.y) / 2;

        // Mix colors
        const rgb1 = hexToRgb(l1.color);
        const rgb2 = hexToRgb(l2.color);

        if (rgb1 && rgb2) {
          const mixedColor = `rgb(${Math.floor((rgb1.r + rgb2.r) / 2)}, ${Math.floor((rgb1.g + rgb2.g) / 2)}, ${Math.floor((rgb1.b + rgb2.b) / 2)})`;

          const gradient = ctx.createRadialGradient(midX, midY, 0, midX, midY, bleedRadius);
          gradient.addColorStop(0, withAlpha(mixedColor, 0.3));
          gradient.addColorStop(1, withAlpha(mixedColor, 0));

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(midX, midY, bleedRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  ctx.globalAlpha = 1;
}

// ============================================
// AMBIENT OCCLUSION
// ============================================

/**
 * Apply ambient occlusion effects
 */
export function applyAmbientOcclusion(
  ctx: CanvasRenderingContext2D,
  ao: AmbientOcclusion,
  viewWidth: number,
  viewHeight: number,
  platforms: Array<{ x: number; y: number; width: number; height: number }>,
  cameraX: number,
  cameraY: number
): void {
  ctx.save();

  // Vignette effect
  if (ao.vignette) {
    const centerX = viewWidth / 2;
    const centerY = viewHeight / 2;
    const radius = Math.max(viewWidth, viewHeight) * 0.7;

    const gradient = ctx.createRadialGradient(
      centerX,
      centerY,
      radius * 0.4,
      centerX,
      centerY,
      radius
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(0.6, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, withAlpha('#000000', ao.vignetteIntensity));

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, viewWidth, viewHeight);
  }

  // Corner darkening on platforms
  if (ao.corners) {
    ctx.globalCompositeOperation = 'multiply';

    for (const platform of platforms) {
      // Transform to screen coordinates
      const screenX = platform.x - cameraX;
      const screenY = platform.y - cameraY;

      // Skip if off-screen
      if (
        screenX + platform.width < 0 ||
        screenX > viewWidth ||
        screenY + platform.height < 0 ||
        screenY > viewHeight
      ) {
        continue;
      }

      drawPlatformAO(ctx, screenX, screenY, platform.width, platform.height);
    }

    ctx.globalCompositeOperation = 'source-over';
  }

  ctx.restore();
}

/**
 * Draw ambient occlusion for a platform
 */
function drawPlatformAO(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  const aoSize = 15;
  const aoIntensity = 0.2;

  // Top edge shadow (light coming from above)
  const topGrad = ctx.createLinearGradient(x, y, x, y + aoSize);
  topGrad.addColorStop(0, withAlpha('#000000', aoIntensity));
  topGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = topGrad;
  ctx.fillRect(x, y, width, aoSize);

  // Corner shadows
  const cornerGrad = ctx.createRadialGradient(x, y, 0, x, y, aoSize);
  cornerGrad.addColorStop(0, withAlpha('#000000', aoIntensity * 1.5));
  cornerGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  // Top-left corner
  ctx.fillStyle = cornerGrad;
  ctx.beginPath();
  ctx.arc(x, y, aoSize, 0, Math.PI / 2);
  ctx.lineTo(x, y);
  ctx.fill();

  // Top-right corner
  const cornerGrad2 = ctx.createRadialGradient(x + width, y, 0, x + width, y, aoSize);
  cornerGrad2.addColorStop(0, withAlpha('#000000', aoIntensity * 1.5));
  cornerGrad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = cornerGrad2;
  ctx.beginPath();
  ctx.arc(x + width, y, aoSize, Math.PI / 2, Math.PI);
  ctx.lineTo(x + width, y);
  ctx.fill();
}

// ============================================
// DYNAMIC LIGHT FLICKERING
// ============================================

/**
 * Create a flickering candle light source
 */
export function createCandleLight(x: number, y: number, baseRadius: number = 120): LightSource {
  return {
    x,
    y,
    radius: baseRadius,
    intensity: 0.5,
    color: ENHANCED_COLORS.CANDLE_GLOW,
    flicker: true,
    flickerSpeed: 0.015,
    flickerAmount: 0.2,
    pulseSpeed: 800,
    pulseAmount: 0.05,
  };
}

/**
 * Create a torch light source
 */
export function createTorchLight(x: number, y: number, baseRadius: number = 150): LightSource {
  return {
    x,
    y,
    radius: baseRadius,
    intensity: 0.6,
    color: ENHANCED_COLORS.TORCH_GLOW,
    flicker: true,
    flickerSpeed: 0.02,
    flickerAmount: 0.25,
    pulseSpeed: 600,
    pulseAmount: 0.08,
  };
}

/**
 * Create a celestial/starlight source
 */
export function createCelestialLight(x: number, y: number, baseRadius: number = 180): LightSource {
  return {
    x,
    y,
    radius: baseRadius,
    intensity: 0.5,
    color: ENHANCED_COLORS.STARLIGHT,
    flicker: false,
    pulseSpeed: 2000,
    pulseAmount: 0.1,
  };
}

/**
 * Create a golden glow (for special items/areas)
 */
export function createGoldenLight(x: number, y: number, baseRadius: number = 160): LightSource {
  return {
    x,
    y,
    radius: baseRadius,
    intensity: 0.7,
    color: ENHANCED_COLORS.GOLD_BRIGHT,
    flicker: false,
    pulseSpeed: 1000,
    pulseAmount: 0.15,
  };
}

// ============================================
// GOD RAYS (LIGHT BEAMS)
// ============================================

export interface GodRayOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;        // Radians, 0 = straight down
  color: string;
  intensity: number;
  segments: number;     // Number of ray segments
}

/**
 * Draw simplified god rays (light beams through archways)
 */
export function drawGodRays(
  ctx: CanvasRenderingContext2D,
  options: GodRayOptions,
  frameTime: number
): void {
  const { x, y, width, height, angle, color, intensity, segments } = options;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Animate subtle shimmer
  const shimmer = Math.sin(frameTime / 1000) * 0.1 + 0.9;

  for (let i = 0; i < segments; i++) {
    const segmentX = (i / segments - 0.5) * width;
    const segmentWidth = width / segments * 0.8;
    const segmentIntensity = intensity * shimmer * (1 - Math.abs(i / segments - 0.5) * 0.5);

    const gradient = ctx.createLinearGradient(segmentX, 0, segmentX, height);
    gradient.addColorStop(0, withAlpha(color, segmentIntensity * 0.8));
    gradient.addColorStop(0.3, withAlpha(color, segmentIntensity * 0.5));
    gradient.addColorStop(0.7, withAlpha(color, segmentIntensity * 0.2));
    gradient.addColorStop(1, withAlpha(color, 0));

    ctx.fillStyle = gradient;
    ctx.fillRect(segmentX - segmentWidth / 2, 0, segmentWidth, height);
  }

  ctx.restore();
}

// ============================================
// TORCH SMOKE EFFECT
// ============================================

/**
 * Draw subtle smoke wisps near torches
 */
export function drawTorchSmoke(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  frameTime: number,
  intensity: number = 0.3
): void {
  ctx.save();

  const smokeCount = 3;

  for (let i = 0; i < smokeCount; i++) {
    const phase = frameTime / 2000 + i * 0.7;
    const rise = (phase % 1) * 50;
    const drift = Math.sin(phase * 3) * 10;
    const alpha = intensity * (1 - (phase % 1)) * 0.5;
    const size = 8 + (phase % 1) * 15;

    const smokeX = x + drift;
    const smokeY = y - 30 - rise;

    const gradient = ctx.createRadialGradient(smokeX, smokeY, 0, smokeX, smokeY, size);
    gradient.addColorStop(0, withAlpha('#888888', alpha * 0.5));
    gradient.addColorStop(0.5, withAlpha('#666666', alpha * 0.3));
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(smokeX, smokeY, size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
