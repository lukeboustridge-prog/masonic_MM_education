// Shared Particle System
// Early 2000s Graphics Refresh - Enhanced Particles

import { Particle, ParticleType, ParticleEmitter } from './types';
import { withAlpha, ENHANCED_COLORS } from './colors';

// ============================================
// PARTICLE CONFIGURATION
// ============================================

const PARTICLE_CONFIGS: Record<ParticleType, Partial<Particle>> = {
  dust: {
    gravity: 0.02,
    friction: 0.98,
    color: ENHANCED_COLORS.DUST_LIGHT,
    trail: false,
  },
  sparkle: {
    gravity: -0.01, // Float upward
    friction: 0.99,
    color: ENHANCED_COLORS.SPARK_GOLD,
    trail: false,
    rotation: 0,
    rotationSpeed: 0.1,
  },
  ember: {
    gravity: -0.03, // Rise like heat
    friction: 0.97,
    color: ENHANCED_COLORS.EMBER_ORANGE,
    trail: true,
  },
  collection: {
    gravity: 0,
    friction: 0.95,
    color: ENHANCED_COLORS.GOLD_BRIGHT,
    trail: true,
  },
  checkpoint: {
    gravity: -0.02,
    friction: 0.96,
    color: ENHANCED_COLORS.GOLD_WHITE,
    trail: false,
  },
  star: {
    gravity: 0,
    friction: 0.99,
    color: ENHANCED_COLORS.STARLIGHT,
    trail: false,
  },
  quiz_correct: {
    gravity: -0.02,
    friction: 0.97,
    color: ENHANCED_COLORS.SUCCESS_GREEN,
    trail: false,
  },
  quiz_wrong: {
    gravity: 0.05,
    friction: 0.95,
    color: ENHANCED_COLORS.ERROR_RED,
    trail: false,
  },
};

// ============================================
// PARTICLE SYSTEM CLASS
// ============================================

export class ParticleSystem {
  private particles: Particle[] = [];
  private emitters: ParticleEmitter[] = [];
  private maxParticles: number;

  constructor(maxParticles: number = 100) {
    this.maxParticles = maxParticles;
  }

  /**
   * Update all particles
   */
  update(deltaTime: number): void {
    // Update emitters
    for (const emitter of this.emitters) {
      if (emitter.active) {
        this.updateEmitter(emitter, deltaTime);
      }
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      // Apply physics
      p.vx *= p.friction;
      p.vy *= p.friction;
      p.vy += p.gravity;

      p.x += p.vx * deltaTime * 0.06; // Normalize to ~60fps
      p.y += p.vy * deltaTime * 0.06;

      // Update rotation
      if (p.rotation !== undefined && p.rotationSpeed !== undefined) {
        p.rotation += p.rotationSpeed * deltaTime * 0.06;
      }

      // Update life
      p.life -= deltaTime;

      // Update alpha based on life
      const lifeRatio = p.life / p.maxLife;
      if (p.fadeIn !== undefined && lifeRatio > 1 - p.fadeIn) {
        // Fade in
        p.alpha = (1 - lifeRatio) / p.fadeIn;
      } else {
        // Fade out in last 30% of life
        p.alpha = Math.min(1, lifeRatio / 0.3);
      }

      // Remove dead particles
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private updateEmitter(emitter: ParticleEmitter, deltaTime: number): void {
    const particlesToSpawn = emitter.rate * (deltaTime / 1000);
    const wholeParticles = Math.floor(particlesToSpawn);
    const fractional = particlesToSpawn - wholeParticles;

    // Spawn whole particles
    for (let i = 0; i < wholeParticles; i++) {
      this.spawnFromEmitter(emitter);
    }

    // Probabilistically spawn fractional particle
    if (Math.random() < fractional) {
      this.spawnFromEmitter(emitter);
    }
  }

  private spawnFromEmitter(emitter: ParticleEmitter): void {
    if (this.particles.length >= this.maxParticles) return;

    const angle = emitter.direction + (Math.random() - 0.5) * emitter.spread;
    const speed = emitter.speedMin + Math.random() * (emitter.speedMax - emitter.speedMin);
    const life = emitter.lifeMin + Math.random() * (emitter.lifeMax - emitter.lifeMin);
    const size = emitter.sizeMin + Math.random() * (emitter.sizeMax - emitter.sizeMin);
    const color = emitter.colors[Math.floor(Math.random() * emitter.colors.length)];

    this.spawn(emitter.x, emitter.y, emitter.type, {
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life,
      maxLife: life,
      size,
      color,
    });
  }

  /**
   * Spawn a single particle
   */
  spawn(
    x: number,
    y: number,
    type: ParticleType,
    overrides: Partial<Particle> = {}
  ): void {
    if (this.particles.length >= this.maxParticles) return;

    const config = PARTICLE_CONFIGS[type];
    const particle: Particle = {
      x,
      y,
      vx: 0,
      vy: 0,
      life: 1000,
      maxLife: 1000,
      size: 3,
      type,
      color: config.color || '#ffffff',
      alpha: 1,
      gravity: config.gravity || 0,
      friction: config.friction || 0.98,
      trail: config.trail,
      rotation: config.rotation,
      rotationSpeed: config.rotationSpeed,
      ...overrides,
    };

    this.particles.push(particle);
  }

  /**
   * Create a burst of particles (e.g., on collection)
   */
  burst(
    x: number,
    y: number,
    type: ParticleType,
    count: number,
    options: {
      speedMin?: number;
      speedMax?: number;
      lifeMin?: number;
      lifeMax?: number;
      sizeMin?: number;
      sizeMax?: number;
      colors?: string[];
      spread?: number;
      direction?: number;
    } = {}
  ): void {
    const {
      speedMin = 1,
      speedMax = 4,
      lifeMin = 300,
      lifeMax = 800,
      sizeMin = 2,
      sizeMax = 5,
      colors = [PARTICLE_CONFIGS[type].color || '#ffffff'],
      spread = Math.PI * 2,
      direction = -Math.PI / 2, // Default upward
    } = options;

    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;

      const angle = direction + (Math.random() - 0.5) * spread;
      const speed = speedMin + Math.random() * (speedMax - speedMin);
      const life = lifeMin + Math.random() * (lifeMax - lifeMin);
      const size = sizeMin + Math.random() * (sizeMax - sizeMin);
      const color = colors[Math.floor(Math.random() * colors.length)];

      this.spawn(x, y, type, {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life,
        maxLife: life,
        size,
        color,
      });
    }
  }

  /**
   * Add a continuous emitter
   */
  addEmitter(emitter: ParticleEmitter): number {
    this.emitters.push(emitter);
    return this.emitters.length - 1;
  }

  /**
   * Remove an emitter
   */
  removeEmitter(index: number): void {
    if (index >= 0 && index < this.emitters.length) {
      this.emitters.splice(index, 1);
    }
  }

  /**
   * Toggle emitter active state
   */
  setEmitterActive(index: number, active: boolean): void {
    if (index >= 0 && index < this.emitters.length) {
      this.emitters[index].active = active;
    }
  }

  /**
   * Clear all particles
   */
  clear(): void {
    this.particles = [];
  }

  /**
   * Get particle count
   */
  getCount(): number {
    return this.particles.length;
  }

  /**
   * Render all particles
   */
  render(
    ctx: CanvasRenderingContext2D,
    cameraX: number,
    cameraY: number,
    viewWidth: number,
    viewHeight: number
  ): void {
    ctx.save();

    for (const p of this.particles) {
      // Cull off-screen particles
      if (
        p.x < cameraX - 20 ||
        p.x > cameraX + viewWidth + 20 ||
        p.y < cameraY - 20 ||
        p.y > cameraY + viewHeight + 20
      ) {
        continue;
      }

      this.renderParticle(ctx, p);
    }

    ctx.restore();
  }

  private renderParticle(ctx: CanvasRenderingContext2D, p: Particle): void {
    ctx.save();

    // Apply rotation if present
    if (p.rotation !== undefined) {
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.translate(-p.x, -p.y);
    }

    // Draw trail if enabled
    if (p.trail && Math.abs(p.vx) + Math.abs(p.vy) > 0.5) {
      const trailLength = Math.sqrt(p.vx * p.vx + p.vy * p.vy) * 3;
      const gradient = ctx.createLinearGradient(
        p.x,
        p.y,
        p.x - p.vx * trailLength,
        p.y - p.vy * trailLength
      );
      gradient.addColorStop(0, withAlpha(p.color, p.alpha * 0.5));
      gradient.addColorStop(1, withAlpha(p.color, 0));

      ctx.strokeStyle = gradient;
      ctx.lineWidth = p.size * 0.5;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - p.vx * trailLength, p.y - p.vy * trailLength);
      ctx.stroke();
    }

    // Draw particle based on type
    switch (p.type) {
      case 'sparkle':
        this.renderSparkle(ctx, p);
        break;
      case 'ember':
        this.renderEmber(ctx, p);
        break;
      case 'star':
        this.renderStar(ctx, p);
        break;
      default:
        this.renderCircle(ctx, p);
    }

    ctx.restore();
  }

  private renderCircle(ctx: CanvasRenderingContext2D, p: Particle): void {
    ctx.fillStyle = withAlpha(p.color, p.alpha);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderSparkle(ctx: CanvasRenderingContext2D, p: Particle): void {
    ctx.save();
    ctx.translate(p.x, p.y);

    // Draw 4-pointed star
    ctx.fillStyle = withAlpha(p.color, p.alpha);
    ctx.beginPath();

    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + (p.rotation || 0);
      const outerR = p.size * 1.5;
      const innerR = p.size * 0.4;

      if (i === 0) {
        ctx.moveTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR);
      } else {
        ctx.lineTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR);
      }

      const midAngle = angle + Math.PI / 4;
      ctx.lineTo(Math.cos(midAngle) * innerR, Math.sin(midAngle) * innerR);
    }

    ctx.closePath();
    ctx.fill();

    // Center glow
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
    glow.addColorStop(0, withAlpha('#ffffff', p.alpha * 0.8));
    glow.addColorStop(1, withAlpha(p.color, 0));
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, p.size, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private renderEmber(ctx: CanvasRenderingContext2D, p: Particle): void {
    // Outer glow
    const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
    glow.addColorStop(0, withAlpha(ENHANCED_COLORS.EMBER_ORANGE, p.alpha * 0.5));
    glow.addColorStop(0.5, withAlpha(ENHANCED_COLORS.EMBER_RED, p.alpha * 0.2));
    glow.addColorStop(1, withAlpha(ENHANCED_COLORS.EMBER_RED, 0));
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
    ctx.fill();

    // Hot core
    ctx.fillStyle = withAlpha('#ffffff', p.alpha * 0.9);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderStar(ctx: CanvasRenderingContext2D, p: Particle): void {
    // Soft glow
    const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
    glow.addColorStop(0, withAlpha(p.color, p.alpha * 0.6));
    glow.addColorStop(0.5, withAlpha(p.color, p.alpha * 0.2));
    glow.addColorStop(1, withAlpha(p.color, 0));
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
    ctx.fill();

    // Bright center
    ctx.fillStyle = withAlpha('#ffffff', p.alpha);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ============================================
// PARTICLE EFFECT PRESETS
// ============================================

/**
 * Create dust puff on landing
 */
export function createLandingDust(
  particles: ParticleSystem,
  x: number,
  y: number,
  intensity: number = 1
): void {
  const count = Math.floor(6 * intensity);
  particles.burst(x, y, 'dust', count, {
    speedMin: 0.5,
    speedMax: 2,
    lifeMin: 200,
    lifeMax: 500,
    sizeMin: 2,
    sizeMax: 4,
    colors: [ENHANCED_COLORS.DUST_LIGHT, ENHANCED_COLORS.DUST_DARK],
    spread: Math.PI,
    direction: -Math.PI / 2,
  });
}

/**
 * Create jump dust puff
 */
export function createJumpDust(
  particles: ParticleSystem,
  x: number,
  y: number
): void {
  particles.burst(x, y, 'dust', 4, {
    speedMin: 0.3,
    speedMax: 1.5,
    lifeMin: 150,
    lifeMax: 350,
    sizeMin: 1.5,
    sizeMax: 3,
    colors: [ENHANCED_COLORS.DUST_LIGHT],
    spread: Math.PI * 0.6,
    direction: Math.PI / 2, // Downward
  });
}

/**
 * Create collection burst effect
 */
export function createCollectionBurst(
  particles: ParticleSystem,
  x: number,
  y: number
): void {
  // Golden sparkles
  particles.burst(x, y, 'sparkle', 12, {
    speedMin: 2,
    speedMax: 5,
    lifeMin: 400,
    lifeMax: 800,
    sizeMin: 3,
    sizeMax: 6,
    colors: [
      ENHANCED_COLORS.GOLD_BRIGHT,
      ENHANCED_COLORS.GOLD,
      ENHANCED_COLORS.SPARK_WHITE,
    ],
    spread: Math.PI * 2,
    direction: 0,
  });

  // Rising particles
  particles.burst(x, y, 'collection', 8, {
    speedMin: 1,
    speedMax: 3,
    lifeMin: 500,
    lifeMax: 1000,
    sizeMin: 2,
    sizeMax: 4,
    colors: [ENHANCED_COLORS.GOLD_WHITE],
    spread: Math.PI * 0.5,
    direction: -Math.PI / 2,
  });
}

/**
 * Create checkpoint activation effect
 */
export function createCheckpointEffect(
  particles: ParticleSystem,
  x: number,
  y: number
): void {
  // Ring burst
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    particles.spawn(x, y, 'checkpoint', {
      vx: Math.cos(angle) * 3,
      vy: Math.sin(angle) * 3,
      life: 600,
      maxLife: 600,
      size: 4,
      color: ENHANCED_COLORS.GOLD_WHITE,
    });
  }

  // Rising sparkles
  particles.burst(x, y, 'sparkle', 10, {
    speedMin: 0.5,
    speedMax: 2,
    lifeMin: 600,
    lifeMax: 1000,
    sizeMin: 2,
    sizeMax: 5,
    colors: [ENHANCED_COLORS.GOLD_BRIGHT, ENHANCED_COLORS.SPARK_WHITE],
    spread: Math.PI * 0.5,
    direction: -Math.PI / 2,
  });
}

/**
 * Create torch ember emitter
 */
export function createTorchEmitter(x: number, y: number): ParticleEmitter {
  return {
    x,
    y,
    type: 'ember',
    rate: 3,
    spread: Math.PI * 0.3,
    direction: -Math.PI / 2,
    speedMin: 0.3,
    speedMax: 1,
    lifeMin: 500,
    lifeMax: 1200,
    sizeMin: 1,
    sizeMax: 3,
    colors: [
      ENHANCED_COLORS.EMBER_ORANGE,
      ENHANCED_COLORS.EMBER_RED,
      ENHANCED_COLORS.TORCH_GLOW,
    ],
    active: true,
  };
}

/**
 * Create quiz feedback effect
 */
export function createQuizFeedback(
  particles: ParticleSystem,
  x: number,
  y: number,
  correct: boolean
): void {
  const type = correct ? 'quiz_correct' : 'quiz_wrong';
  const colors = correct
    ? [ENHANCED_COLORS.SUCCESS_GREEN, '#90EE90', '#98FB98']
    : [ENHANCED_COLORS.ERROR_RED, '#FF6B6B', '#FF4444'];

  particles.burst(x, y, type, correct ? 15 : 8, {
    speedMin: correct ? 2 : 1,
    speedMax: correct ? 5 : 3,
    lifeMin: 400,
    lifeMax: 800,
    sizeMin: 3,
    sizeMax: 6,
    colors,
    spread: Math.PI * 2,
    direction: correct ? -Math.PI / 2 : Math.PI / 2,
  });
}

/**
 * Create dust motes in light beam
 */
export function createLightDustEmitter(
  x: number,
  y: number,
  width: number,
  height: number
): ParticleEmitter {
  return {
    x: x + width / 2,
    y: y + height / 2,
    type: 'dust',
    rate: 0.5,
    spread: Math.PI * 2,
    direction: 0,
    speedMin: 0.05,
    speedMax: 0.2,
    lifeMin: 2000,
    lifeMax: 4000,
    sizeMin: 1,
    sizeMax: 2,
    colors: [
      withAlpha(ENHANCED_COLORS.DUST_LIGHT, 0.3),
      withAlpha(ENHANCED_COLORS.SPARK_WHITE, 0.2),
    ],
    active: true,
  };
}
