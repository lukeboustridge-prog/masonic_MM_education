// Shared Color Palette & Gradient Utilities
// Early 2000s Graphics Refresh - Richer Colors

import { GradientStop, CachedGradient } from './types';

// ============================================
// ENHANCED TEMPLE COLOR PALETTE
// ============================================

export const ENHANCED_COLORS = {
  // Stone Colors - Richer tones with more depth
  STONE_DARKEST: '#1f1d1a',
  STONE_DARK: '#2d2a26',
  STONE_MID: '#4a4540',
  STONE_LIGHT: '#6b6560',
  STONE_ACCENT: '#8b8580',
  STONE_HIGHLIGHT: '#a5a095',

  // Warm Light Colors
  CANDLE_GLOW: '#ffb347',
  CANDLE_CORE: '#fff4e0',
  TORCH_GLOW: '#ff8c00',
  TORCH_CORE: '#ffcc66',
  AMBIENT_WARM: '#3d3428',
  FIRE_RED: '#ff4500',

  // Gold Tones - More variation
  GOLD_DARK: '#b8860b',
  GOLD: '#d4af37',
  GOLD_BRIGHT: '#ffd700',
  GOLD_PALE: '#f0e68c',
  GOLD_WHITE: '#fffacd',

  // Royal Blues - Temple atmosphere
  ROYAL_BLUE_DARK: '#0d1f3c',
  ROYAL_BLUE: '#1e3a5f',
  ROYAL_BLUE_LIGHT: '#2e5a8f',
  CELESTIAL_BLUE: '#4a7ab0',

  // Mosaic Floor
  MOSAIC_WHITE: '#e8e4df',
  MOSAIC_BLACK: '#1a1a1a',
  MOSAIC_CREAM: '#f5f5dc',

  // Sky & Atmosphere
  CEILING_DARK: '#1a1510',
  NIGHT_SKY: '#0d1117',
  NIGHT_DEEP: '#050810',
  STARLIGHT: '#aabbff',
  MOONLIGHT: '#c8d4ff',

  // Particle Colors
  SPARK_GOLD: '#ffd700',
  SPARK_WHITE: '#ffffff',
  EMBER_ORANGE: '#ff6b35',
  EMBER_RED: '#dc143c',
  DUST_LIGHT: '#c9b896',
  DUST_DARK: '#8b7355',

  // UI Colors
  SUCCESS_GREEN: '#4ade80',
  ERROR_RED: '#f87171',
  WARNING_AMBER: '#fbbf24',
};

// ============================================
// GRADIENT FACTORY FUNCTIONS
// ============================================

// Cache for gradient objects to avoid recreation each frame
const gradientCache = new Map<string, CachedGradient>();
const CACHE_MAX_AGE = 5000; // 5 seconds

/**
 * Get or create a cached linear gradient
 */
export function getLinearGradient(
  ctx: CanvasRenderingContext2D,
  id: string,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  stops: GradientStop[]
): CanvasGradient {
  const cacheKey = `linear_${id}_${x0}_${y0}_${x1}_${y1}`;
  const now = Date.now();

  // Check cache
  const cached = gradientCache.get(cacheKey);
  if (cached && now - cached.lastUsed < CACHE_MAX_AGE) {
    cached.lastUsed = now;
    return cached.gradient;
  }

  // Create new gradient
  const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
  for (const stop of stops) {
    gradient.addColorStop(stop.offset, stop.color);
  }

  // Cache it
  gradientCache.set(cacheKey, { id: cacheKey, gradient, lastUsed: now });

  // Cleanup old entries
  if (gradientCache.size > 100) {
    cleanGradientCache(now);
  }

  return gradient;
}

/**
 * Get or create a cached radial gradient
 */
export function getRadialGradient(
  ctx: CanvasRenderingContext2D,
  id: string,
  x0: number,
  y0: number,
  r0: number,
  x1: number,
  y1: number,
  r1: number,
  stops: GradientStop[]
): CanvasGradient {
  const cacheKey = `radial_${id}_${x0}_${y0}_${r0}_${x1}_${y1}_${r1}`;
  const now = Date.now();

  // Check cache
  const cached = gradientCache.get(cacheKey);
  if (cached && now - cached.lastUsed < CACHE_MAX_AGE) {
    cached.lastUsed = now;
    return cached.gradient;
  }

  // Create new gradient
  const gradient = ctx.createRadialGradient(x0, y0, r0, x1, y1, r1);
  for (const stop of stops) {
    gradient.addColorStop(stop.offset, stop.color);
  }

  // Cache it
  gradientCache.set(cacheKey, { id: cacheKey, gradient, lastUsed: now });

  return gradient;
}

function cleanGradientCache(now: number): void {
  for (const [key, value] of gradientCache.entries()) {
    if (now - value.lastUsed > CACHE_MAX_AGE) {
      gradientCache.delete(key);
    }
  }
}

// ============================================
// COLOR INTERPOLATION UTILITIES
// ============================================

/**
 * Parse hex color to RGB components
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convert RGB to hex string
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => Math.round(x).toString(16).padStart(2, '0')).join('');
}

/**
 * Interpolate between two colors
 */
export function lerpColor(color1: string, color2: string, t: number): string {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);
  if (!c1 || !c2) return color1;

  const r = c1.r + (c2.r - c1.r) * t;
  const g = c1.g + (c2.g - c1.g) * t;
  const b = c1.b + (c2.b - c1.b) * t;

  return rgbToHex(r, g, b);
}

/**
 * Add alpha to hex color
 */
export function withAlpha(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

/**
 * Lighten a color by percentage
 */
export function lighten(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const factor = 1 + percent / 100;
  const r = Math.min(255, rgb.r * factor);
  const g = Math.min(255, rgb.g * factor);
  const b = Math.min(255, rgb.b * factor);

  return rgbToHex(r, g, b);
}

/**
 * Darken a color by percentage
 */
export function darken(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const factor = 1 - percent / 100;
  const r = Math.max(0, rgb.r * factor);
  const g = Math.max(0, rgb.g * factor);
  const b = Math.max(0, rgb.b * factor);

  return rgbToHex(r, g, b);
}

// ============================================
// PRE-BUILT GRADIENT PRESETS
// ============================================

export const GRADIENT_PRESETS = {
  // Warm candle glow
  candleGlow: [
    { offset: 0, color: withAlpha(ENHANCED_COLORS.CANDLE_CORE, 0.8) },
    { offset: 0.3, color: withAlpha(ENHANCED_COLORS.CANDLE_GLOW, 0.5) },
    { offset: 0.7, color: withAlpha(ENHANCED_COLORS.TORCH_GLOW, 0.2) },
    { offset: 1, color: withAlpha(ENHANCED_COLORS.TORCH_GLOW, 0) },
  ],

  // Torch fire glow
  torchGlow: [
    { offset: 0, color: withAlpha(ENHANCED_COLORS.TORCH_CORE, 0.9) },
    { offset: 0.2, color: withAlpha(ENHANCED_COLORS.TORCH_GLOW, 0.6) },
    { offset: 0.5, color: withAlpha(ENHANCED_COLORS.FIRE_RED, 0.3) },
    { offset: 1, color: withAlpha(ENHANCED_COLORS.FIRE_RED, 0) },
  ],

  // Golden celestial glow
  goldenGlow: [
    { offset: 0, color: withAlpha(ENHANCED_COLORS.GOLD_WHITE, 0.9) },
    { offset: 0.3, color: withAlpha(ENHANCED_COLORS.GOLD_BRIGHT, 0.6) },
    { offset: 0.6, color: withAlpha(ENHANCED_COLORS.GOLD, 0.3) },
    { offset: 1, color: withAlpha(ENHANCED_COLORS.GOLD_DARK, 0) },
  ],

  // Starlight glow
  starlightGlow: [
    { offset: 0, color: withAlpha(ENHANCED_COLORS.SPARK_WHITE, 0.8) },
    { offset: 0.4, color: withAlpha(ENHANCED_COLORS.STARLIGHT, 0.4) },
    { offset: 1, color: withAlpha(ENHANCED_COLORS.CELESTIAL_BLUE, 0) },
  ],

  // Stone pillar shading
  pillarShading: [
    { offset: 0, color: ENHANCED_COLORS.STONE_MID },
    { offset: 0.2, color: ENHANCED_COLORS.STONE_LIGHT },
    { offset: 0.5, color: ENHANCED_COLORS.STONE_HIGHLIGHT },
    { offset: 0.8, color: ENHANCED_COLORS.STONE_LIGHT },
    { offset: 1, color: ENHANCED_COLORS.STONE_MID },
  ],

  // Vignette effect
  vignette: [
    { offset: 0, color: 'rgba(0, 0, 0, 0)' },
    { offset: 0.5, color: 'rgba(0, 0, 0, 0)' },
    { offset: 0.8, color: 'rgba(0, 0, 0, 0.2)' },
    { offset: 1, color: 'rgba(0, 0, 0, 0.5)' },
  ],

  // Night sky
  nightSky: [
    { offset: 0, color: ENHANCED_COLORS.NIGHT_SKY },
    { offset: 0.5, color: ENHANCED_COLORS.ROYAL_BLUE_DARK },
    { offset: 1, color: ENHANCED_COLORS.NIGHT_DEEP },
  ],
};

// ============================================
// ROOM-BASED COLOR TEMPERATURE
// ============================================

export interface RoomColorTemperature {
  ambientTint: string;
  lightIntensity: number;
  fogColor: string;
  fogDensity: number;
}

export const ROOM_TEMPERATURES: Record<string, RoomColorTemperature> = {
  preparation: {
    ambientTint: withAlpha(ENHANCED_COLORS.CANDLE_GLOW, 0.05),
    lightIntensity: 0.4,
    fogColor: withAlpha(ENHANCED_COLORS.AMBIENT_WARM, 0.1),
    fogDensity: 0.2,
  },
  lodge: {
    ambientTint: withAlpha(ENHANCED_COLORS.CANDLE_GLOW, 0.08),
    lightIntensity: 0.6,
    fogColor: withAlpha(ENHANCED_COLORS.AMBIENT_WARM, 0.08),
    fogDensity: 0.15,
  },
  mines: {
    ambientTint: withAlpha(ENHANCED_COLORS.TORCH_GLOW, 0.05),
    lightIntensity: 0.3,
    fogColor: withAlpha(ENHANCED_COLORS.STONE_DARKEST, 0.2),
    fogDensity: 0.4,
  },
  celestial: {
    ambientTint: withAlpha(ENHANCED_COLORS.STARLIGHT, 0.05),
    lightIntensity: 0.5,
    fogColor: withAlpha(ENHANCED_COLORS.CELESTIAL_BLUE, 0.05),
    fogDensity: 0.1,
  },
  east: {
    ambientTint: withAlpha(ENHANCED_COLORS.GOLD_BRIGHT, 0.1),
    lightIntensity: 0.9,
    fogColor: withAlpha(ENHANCED_COLORS.GOLD_PALE, 0.05),
    fogDensity: 0.05,
  },
};
