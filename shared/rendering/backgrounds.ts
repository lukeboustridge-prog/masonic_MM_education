// Shared Background & Atmosphere System
// Early 2000s Graphics Refresh - Parallax, Fog, Stars

import { ParallaxLayer, StarField, AtmosphericEffect } from './types';
import { withAlpha, ENHANCED_COLORS, getLinearGradient, getRadialGradient } from './colors';

// ============================================
// PARALLAX SYSTEM
// ============================================

export class ParallaxManager {
  private layers: ParallaxLayer[] = [];

  /**
   * Add a parallax layer
   */
  addLayer(layer: ParallaxLayer): void {
    this.layers.push(layer);
    // Sort by scroll factor (furthest first)
    this.layers.sort((a, b) => a.scrollFactor - b.scrollFactor);
  }

  /**
   * Remove a layer by name
   */
  removeLayer(name: string): void {
    this.layers = this.layers.filter(l => l.name !== name);
  }

  /**
   * Render all layers
   */
  render(
    ctx: CanvasRenderingContext2D,
    cameraX: number,
    cameraY: number,
    viewWidth: number,
    viewHeight: number,
    frameTime: number
  ): void {
    for (const layer of this.layers) {
      ctx.save();

      // Apply parallax offset
      const parallaxX = cameraX * layer.scrollFactor;
      const parallaxY = cameraY * layer.scrollFactor + layer.yOffset;

      ctx.translate(-parallaxX, -parallaxY);

      layer.renderFn(ctx, cameraX, cameraY, viewWidth, viewHeight, frameTime);

      ctx.restore();
    }
  }
}

// ============================================
// STAR FIELD RENDERING
// ============================================

/**
 * Generate star field data
 */
export function generateStarField(
  worldWidth: number,
  worldHeight: number,
  density: number = 0.0015
): StarField[] {
  const stars: StarField[] = [];
  const cellSize = 200;

  for (let x = 0; x < worldWidth + cellSize; x += cellSize) {
    for (let y = -800; y < worldHeight + 400; y += cellSize) {
      // Pseudo-random based on position
      const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      const val = n - Math.floor(n);

      if (val > 1 - density * 1000) {
        const brightness = 0.3 + val * 0.7;
        const color: 'white' | 'blue' | 'gold' =
          val > 0.95 ? 'gold' : val > 0.9 ? 'blue' : 'white';

        stars.push({
          x: x + (val * 100) % 150,
          y: y + ((val * 1000) % 150),
          size: val * 2.5 + 0.5,
          phase: val * 10,
          brightness,
          color,
          twinkleSpeed: 0.5 + val * 1.5,
        });
      }
    }
  }

  return stars;
}

/**
 * Render star field with twinkling
 */
export function renderStarField(
  ctx: CanvasRenderingContext2D,
  stars: StarField[],
  cameraX: number,
  cameraY: number,
  viewWidth: number,
  viewHeight: number,
  frameTime: number,
  parallaxFactor: number = 0.1
): void {
  ctx.save();

  for (const star of stars) {
    // Apply parallax
    const starX = star.x - cameraX * parallaxFactor;
    const starY = star.y - cameraY * parallaxFactor;

    // Cull off-screen stars
    if (
      starX < -10 ||
      starX > viewWidth + 10 ||
      starY < -10 ||
      starY > viewHeight + 10
    ) {
      continue;
    }

    // Calculate twinkle
    const twinkle =
      Math.sin(frameTime / 800 * star.twinkleSpeed + star.phase) * 0.3 + 0.7;
    const effectiveBrightness = star.brightness * twinkle;

    // Star color
    let starColor: string;
    switch (star.color) {
      case 'gold':
        starColor = ENHANCED_COLORS.GOLD_BRIGHT;
        break;
      case 'blue':
        starColor = ENHANCED_COLORS.STARLIGHT;
        break;
      default:
        starColor = '#ffffff';
    }

    // Outer glow
    const glowSize = star.size * 3 * twinkle;
    const glowGrad = ctx.createRadialGradient(starX, starY, 0, starX, starY, glowSize);
    glowGrad.addColorStop(0, withAlpha(starColor, effectiveBrightness * 0.4));
    glowGrad.addColorStop(0.5, withAlpha(starColor, effectiveBrightness * 0.1));
    glowGrad.addColorStop(1, withAlpha(starColor, 0));
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(starX, starY, glowSize, 0, Math.PI * 2);
    ctx.fill();

    // Star core
    ctx.fillStyle = withAlpha('#ffffff', effectiveBrightness);
    ctx.beginPath();
    ctx.arc(starX, starY, star.size * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Bright stars get cross flare
    if (star.brightness > 0.8 && star.size > 1.5) {
      ctx.strokeStyle = withAlpha(starColor, effectiveBrightness * 0.5);
      ctx.lineWidth = 0.5;
      const flareSize = star.size * 2 * twinkle;

      ctx.beginPath();
      ctx.moveTo(starX - flareSize, starY);
      ctx.lineTo(starX + flareSize, starY);
      ctx.moveTo(starX, starY - flareSize);
      ctx.lineTo(starX, starY + flareSize);
      ctx.stroke();
    }
  }

  ctx.restore();
}

// ============================================
// ATMOSPHERIC EFFECTS
// ============================================

/**
 * Render fog/haze effect
 */
export function renderFog(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  density: number,
  frameTime: number
): void {
  ctx.save();

  // Animated fog layers
  const layers = 3;

  for (let i = 0; i < layers; i++) {
    const layerDensity = density * (1 - i * 0.2);
    const offset = Math.sin(frameTime / 3000 + i * 1.5) * 20;

    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    gradient.addColorStop(0, withAlpha(color, layerDensity * 0.8));
    gradient.addColorStop(0.3, withAlpha(color, layerDensity * 0.5));
    gradient.addColorStop(0.7, withAlpha(color, layerDensity * 0.3));
    gradient.addColorStop(1, withAlpha(color, 0));

    ctx.fillStyle = gradient;
    ctx.fillRect(x + offset, y, width, height);
  }

  ctx.restore();
}

/**
 * Render heat shimmer effect near torches
 */
export function renderHeatShimmer(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  frameTime: number,
  intensity: number = 0.3
): void {
  // Note: True heat shimmer requires pixel manipulation
  // This is a simplified visual approximation

  ctx.save();

  const waveCount = 5;
  const waveHeight = 3 * intensity;

  ctx.globalAlpha = 0.05;

  for (let i = 0; i < waveCount; i++) {
    const phase = frameTime / 200 + i * 0.5;
    const waveY = y + (i / waveCount) * height;
    const displacement = Math.sin(phase) * waveHeight;

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, waveY + displacement);

    for (let wx = 0; wx < width; wx += 10) {
      const localDisp = Math.sin(phase + wx * 0.05) * waveHeight;
      ctx.lineTo(x + wx, waveY + localDisp);
    }

    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Render depth fog for caves/mines
 */
export function renderDepthFog(
  ctx: CanvasRenderingContext2D,
  viewWidth: number,
  viewHeight: number,
  cameraY: number,
  baseY: number,
  maxDepth: number,
  color: string = '#1a1a1a',
  maxIntensity: number = 0.6
): void {
  const depth = Math.max(0, cameraY - baseY);
  const depthRatio = Math.min(1, depth / maxDepth);
  const intensity = depthRatio * maxIntensity;

  if (intensity < 0.01) return;

  ctx.save();

  // Gradient from bottom
  const gradient = ctx.createLinearGradient(0, 0, 0, viewHeight);
  gradient.addColorStop(0, withAlpha(color, intensity * 0.5));
  gradient.addColorStop(0.5, withAlpha(color, intensity * 0.7));
  gradient.addColorStop(1, withAlpha(color, intensity));

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, viewWidth, viewHeight);

  ctx.restore();
}

// ============================================
// BACKGROUND WALL PATTERNS
// ============================================

/**
 * Draw distant temple wall (parallax background)
 */
export function drawDistantWall(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  frameTime: number
): void {
  ctx.save();

  // Base wall color
  const wallGrad = ctx.createLinearGradient(x, y, x, y + height);
  wallGrad.addColorStop(0, ENHANCED_COLORS.STONE_DARKEST);
  wallGrad.addColorStop(0.3, ENHANCED_COLORS.STONE_DARK);
  wallGrad.addColorStop(0.7, ENHANCED_COLORS.STONE_DARK);
  wallGrad.addColorStop(1, ENHANCED_COLORS.STONE_DARKEST);

  ctx.fillStyle = wallGrad;
  ctx.fillRect(x, y, width, height);

  // Stone block pattern (subtle)
  ctx.globalAlpha = 0.2;
  ctx.strokeStyle = ENHANCED_COLORS.STONE_DARKEST;
  ctx.lineWidth = 1;

  const blockW = 80;
  const blockH = 40;

  for (let row = 0; row < height / blockH; row++) {
    const offset = (row % 2) * (blockW / 2);
    for (let col = -1; col < width / blockW + 1; col++) {
      const bx = x + col * blockW + offset;
      const by = y + row * blockH;

      ctx.strokeRect(bx, by, blockW, blockH);
    }
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}

/**
 * Draw decorative archway silhouette (far background)
 */
export function drawDistantArchway(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  ctx.save();

  ctx.fillStyle = withAlpha(ENHANCED_COLORS.STONE_DARKEST, 0.8);

  // Pillars
  const pillarWidth = width * 0.15;
  ctx.fillRect(x, y, pillarWidth, height);
  ctx.fillRect(x + width - pillarWidth, y, pillarWidth, height);

  // Arch
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + pillarWidth, y);
  ctx.quadraticCurveTo(x + width / 2, y - height * 0.2, x + width - pillarWidth, y);
  ctx.lineTo(x + width, y);
  ctx.lineTo(x + width, y - height * 0.3);
  ctx.quadraticCurveTo(x + width / 2, y - height * 0.5, x, y - height * 0.3);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

// ============================================
// CELESTIAL DECORATIONS
// ============================================

/**
 * Draw constellation pattern
 */
export function drawConstellation(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  points: Array<{ x: number; y: number }>,
  connections: Array<[number, number]>,
  frameTime: number
): void {
  ctx.save();

  const twinkle = Math.sin(frameTime / 1000) * 0.2 + 0.8;

  // Draw connection lines
  ctx.strokeStyle = withAlpha(ENHANCED_COLORS.STARLIGHT, 0.3 * twinkle);
  ctx.lineWidth = 1;

  for (const [from, to] of connections) {
    if (from < points.length && to < points.length) {
      ctx.beginPath();
      ctx.moveTo(x + points[from].x * scale, y + points[from].y * scale);
      ctx.lineTo(x + points[to].x * scale, y + points[to].y * scale);
      ctx.stroke();
    }
  }

  // Draw stars
  for (const point of points) {
    const starX = x + point.x * scale;
    const starY = y + point.y * scale;
    const starTwinkle = Math.sin(frameTime / 600 + point.x) * 0.3 + 0.7;

    // Glow
    const glow = ctx.createRadialGradient(starX, starY, 0, starX, starY, 6);
    glow.addColorStop(0, withAlpha('#ffffff', 0.8 * starTwinkle));
    glow.addColorStop(0.5, withAlpha(ENHANCED_COLORS.STARLIGHT, 0.3 * starTwinkle));
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(starX, starY, 6, 0, Math.PI * 2);
    ctx.fill();

    // Core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(starX, starY, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// Pre-defined constellations
export const CONSTELLATIONS = {
  // Square and Compasses (simplified)
  squareCompasses: {
    points: [
      { x: 0, y: 0 },
      { x: 20, y: 30 },
      { x: 40, y: 0 },
      { x: 10, y: 15 },
      { x: 30, y: 15 },
      { x: 20, y: -10 },
    ],
    connections: [
      [0, 1],
      [1, 2],
      [3, 4],
      [5, 3],
      [5, 4],
    ] as Array<[number, number]>,
  },

  // Triangle (All-Seeing Eye)
  triangle: {
    points: [
      { x: 20, y: 0 },
      { x: 0, y: 35 },
      { x: 40, y: 35 },
      { x: 20, y: 20 },
    ],
    connections: [
      [0, 1],
      [1, 2],
      [2, 0],
    ] as Array<[number, number]>,
  },

  // Pleiades (Seven Stars)
  pleiades: {
    points: [
      { x: 20, y: 0 },
      { x: 10, y: 10 },
      { x: 30, y: 8 },
      { x: 5, y: 20 },
      { x: 25, y: 18 },
      { x: 15, y: 25 },
      { x: 35, y: 22 },
    ],
    connections: [
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 4],
      [3, 5],
      [4, 6],
    ] as Array<[number, number]>,
  },
};

// ============================================
// SKY GRADIENT
// ============================================

/**
 * Draw night sky gradient with stars
 */
export function drawNightSky(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  horizonY: number,
  frameTime: number
): void {
  ctx.save();

  // Sky gradient
  const skyGrad = ctx.createLinearGradient(x, y, x, horizonY);
  skyGrad.addColorStop(0, ENHANCED_COLORS.NIGHT_DEEP);
  skyGrad.addColorStop(0.4, ENHANCED_COLORS.NIGHT_SKY);
  skyGrad.addColorStop(0.7, ENHANCED_COLORS.ROYAL_BLUE_DARK);
  skyGrad.addColorStop(1, withAlpha(ENHANCED_COLORS.ROYAL_BLUE, 0.5));

  ctx.fillStyle = skyGrad;
  ctx.fillRect(x, y, width, horizonY - y);

  ctx.restore();
}
