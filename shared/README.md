# Shared Rendering Library

Early 2000s Graphics Refresh for Masonic Educational Games

## Overview

This shared library provides enhanced rendering utilities for all three Masonic games (EA, FC, MM), upgrading the visual polish from a basic 1990s Canvas 2D look to an early 2000s aesthetic with smoother rendering, better lighting, enhanced particles, and improved visual feedback.

## Features

### Phase 1: Rendering Foundation
- **Selective Anti-Aliasing**: Enable smoothing for backgrounds/lighting, disable for crisp sprites
- **Drop Shadows**: Dynamic shadows beneath player, NPCs, and collectibles
- **Enhanced Gradients**: Cached gradient factory functions with color interpolation

### Phase 2: Lighting System
- **Soft Bloom Effects**: Multi-pass rendering with outer glow rings
- **Perlin-style Flicker**: Natural candle/torch flickering using noise functions
- **Color Bleeding**: Subtle color mixing between nearby light sources
- **Torch Smoke**: Animated smoke wisps near torch light sources
- **God Rays**: Light beam effects through archways

### Phase 3: Particle System
- **Particle Types**: dust, sparkle, ember, collection, checkpoint, star, quiz_correct, quiz_wrong
- **Physics**: Gravity, friction, trails, fade in/out
- **Preset Effects**: Landing dust, jump dust, collection burst, checkpoint celebration

### Phase 4: Backgrounds & Atmosphere
- **Parallax System**: Multi-layer background scrolling
- **Enhanced Star Field**: Twinkling stars with color variation
- **Fog/Haze**: Animated atmospheric fog
- **Depth Darkening**: Cave/mine depth-based darkening

### Phase 5: Sprite Enhancements
- **Squash & Stretch**: Landing and jump animations
- **Breathing/Hover**: NPC idle animations
- **Walk Cycle**: Smoothed leg swing with body bob
- **Collar Glint**: Sparkle effect on NPC jewels
- **Position History**: Afterimage trails for fast movement

### Phase 6: UI & Screen Effects
- **Screen Transitions**: Fade, flash effects
- **Screen Shake**: With easing and decay
- **Vignette**: Enhanced screen edge darkening
- **Score Popups**: Floating "+100" text
- **Victory Effects**: Golden ray celebration

### Phase 7: Color Palette
- **Enhanced Colors**: Richer stone, gold, and atmosphere tones
- **Room Temperature**: Area-specific color tinting
- **Gradient Presets**: Pre-built gradients for common effects

## Usage

### Import in Game Files

```typescript
import {
  // Effects
  setSmoothing,
  drawDropShadow,
  drawBloom,
  drawVignette,

  // Particles
  ParticleSystem,
  createLandingDust,
  createCollectionBurst,

  // Lighting
  applyEnhancedLighting,

  // Colors
  ENHANCED_COLORS,
  withAlpha,
} from '@shared/rendering';
```

### Initialize Systems

```typescript
// In component refs
const particleSystemRef = useRef<ParticleSystem>(new ParticleSystem(100));
const transitionManagerRef = useRef<TransitionManager>(new TransitionManager());
const squashStretchRef = useRef(createSquashStretch());

// In game loop
particleSystemRef.current.update(deltaTime);
transitionManagerRef.current.update();
updateSquashStretch(squashStretchRef.current);
```

### Apply Effects in Render Loop

```typescript
// Enable smoothing for backgrounds
setSmoothing(ctx, true);
drawBackground(ctx);

// Disable for sprites
setSmoothing(ctx, false);
drawSprites(ctx);

// Re-enable for effects
setSmoothing(ctx, true);

// Render particles
particleSystemRef.current.render(ctx, cameraX, cameraY, viewW, viewH);

// Apply lighting
applyEnhancedLighting(ctx, lights, cameraX, cameraY, viewW, viewH, frameTime);

// Screen effects
drawVignette(ctx, width, height, 0.45);
transitionManagerRef.current.render(ctx, width, height);
```

## File Structure

```
shared/
├── rendering/
│   ├── index.ts        # Main exports
│   ├── types.ts        # TypeScript interfaces
│   ├── colors.ts       # Color palette & gradients
│   ├── effects.ts      # Shadows, bloom, screen effects
│   ├── particles.ts    # Particle system
│   ├── lighting.ts     # Enhanced lighting
│   ├── backgrounds.ts  # Parallax, stars, atmosphere
│   ├── sprites.ts      # Animation helpers
│   └── transitions.ts  # Screen transitions, UI
└── package.json
```

## Configuration

Each game needs these config updates:

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "paths": {
      "@shared/*": ["../shared/*"]
    }
  }
}
```

**vite.config.ts:**
```typescript
resolve: {
  alias: {
    '@shared': path.resolve(__dirname, '../shared'),
  }
}
```

## Performance Considerations

- Particle limit: 100 max (configurable)
- Gradient caching: 5-second TTL
- Off-screen culling for particles and lights
- Selective smoothing toggle per render pass

## Browser Support

- Canvas 2D API (no WebGL required)
- ES2022 target
- Works on desktop and mobile
