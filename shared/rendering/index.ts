// Shared Rendering Library for Masonic Educational Games
// Early 2000s Graphics Refresh
//
// This library provides enhanced rendering utilities that can be
// imported by all three Masonic games (EA, FC, MM) for consistent
// visual polish and reduced code duplication.

// ============================================
// TYPE EXPORTS
// ============================================

export type {
  // Particle System
  Particle,
  ParticleType,
  ParticleEmitter,

  // Lighting
  LightSource,
  AmbientOcclusion,

  // Backgrounds
  ParallaxLayer,
  StarField,
  AtmosphericEffect,

  // Screen Effects
  ScreenTransition,
  ScreenShake,

  // Sprites
  SpriteEffects,
  AnimationState,

  // Colors
  ColorPalette,
  GradientStop,
  CachedGradient,

  // Rendering
  RenderContext,
  RenderStats,
} from './types';

// ============================================
// COLOR UTILITIES
// ============================================

export {
  // Enhanced color palette
  ENHANCED_COLORS,

  // Gradient utilities
  getLinearGradient,
  getRadialGradient,

  // Color manipulation
  hexToRgb,
  rgbToHex,
  lerpColor,
  withAlpha,
  lighten,
  darken,

  // Presets
  GRADIENT_PRESETS,
  ROOM_TEMPERATURES,
} from './colors';

export type { RoomColorTemperature } from './colors';

// ============================================
// VISUAL EFFECTS
// ============================================

export {
  // Smoothing
  setSmoothing,

  // Drop Shadows
  drawDropShadow,
  drawDynamicShadow,

  // Bloom / Glow
  drawBloom,
  drawCollectibleGlow,

  // Screen Shake
  updateScreenShake,
  createScreenShake,

  // Vignette
  drawVignette,

  // Screen Transitions
  createFadeTransition,
  createFlashTransition,
  updateTransition,
  drawTransition,

  // Ambient Occlusion
  drawCornerAO,
  drawDepthDarkening,

  // Motion Effects
  drawMotionBlur,
  drawAfterimage,
} from './effects';

export type { DropShadowOptions, BloomOptions } from './effects';

// ============================================
// PARTICLE SYSTEM
// ============================================

export {
  ParticleSystem,

  // Preset Effects
  createLandingDust,
  createJumpDust,
  createCollectionBurst,
  createCheckpointEffect,
  createTorchEmitter,
  createQuizFeedback,
  createLightDustEmitter,
} from './particles';

// ============================================
// LIGHTING SYSTEM
// ============================================

export {
  // Noise for flicker
  flickerNoise,

  // Main lighting function
  applyEnhancedLighting,

  // Ambient Occlusion
  applyAmbientOcclusion,

  // Light source factories
  createCandleLight,
  createTorchLight,
  createCelestialLight,
  createGoldenLight,

  // Special effects
  drawGodRays,
  drawTorchSmoke,
} from './lighting';

export type { EnhancedLightOptions, GodRayOptions } from './lighting';

// ============================================
// BACKGROUNDS & ATMOSPHERE
// ============================================

export {
  // Parallax
  ParallaxManager,

  // Star Field
  generateStarField,
  renderStarField,

  // Atmospheric Effects
  renderFog,
  renderHeatShimmer,
  renderDepthFog,

  // Background Elements
  drawDistantWall,
  drawDistantArchway,

  // Celestial
  drawConstellation,
  CONSTELLATIONS,
  drawNightSky,
} from './backgrounds';

// ============================================
// SPRITE ENHANCEMENTS
// ============================================

export {
  // Easing Functions
  Easing,

  // Squash & Stretch
  createSquashStretch,
  applyLandingSquash,
  applyJumpStretch,
  updateSquashStretch,
  applySquashStretchTransform,

  // Breathing / Idle
  getBreathingOffset,
  getHoverOffset,

  // Facing Direction
  createFacingState,
  setFacingDirection,
  updateFacingState,
  getFacingScale,

  // Walk Cycle
  createWalkCycle,
  updateWalkCycle,
  getWalkCycleOffsets,

  // Glow Effects
  drawSpriteGlow,
  drawGlintEffect,

  // Position History
  PositionHistory,

  // Velocity Smoothing
  createVelocitySmoothing,
  updateSmoothedVelocity,
} from './sprites';

export type {
  SquashStretchState,
  FacingState,
  WalkCycleState,
  VelocitySmoothing,
} from './sprites';

// ============================================
// SCREEN TRANSITIONS & UI
// ============================================

export {
  // Transition Manager
  TransitionManager,

  // Button Rendering
  drawBeveledButton,
  DEFAULT_BUTTON_STYLE,

  // Score Popups
  ScorePopupManager,

  // Special Effects
  drawVictoryCelebration,
  drawGameOverEffect,

  // Progress Indicators
  drawProgressBar,

  // Camera
  createCameraState,
  updateCamera,
  setCameraTarget,
} from './transitions';

export type {
  ButtonStyle,
  ScorePopup,
  CameraState,
} from './transitions';

// ============================================
// CONVENIENCE RE-EXPORTS
// ============================================

// Common color values for quick access
export const Colors = {
  gold: '#d4af37',
  goldBright: '#ffd700',
  candleGlow: '#ffb347',
  torchGlow: '#ff8c00',
  starlight: '#aabbff',
  stoneDark: '#2d2a26',
  stoneMid: '#4a4540',
  stoneLight: '#6b6560',
  success: '#4ade80',
  error: '#f87171',
};

// Default settings for common use cases
export const Defaults = {
  maxParticles: 100,
  screenShakeDecay: 0.9,
  cameraSmoothing: 0.1,
  fadeTransitionDuration: 500,
  flashTransitionDuration: 200,
  bloomLayers: 3,
  flickerIntensity: 0.15,
};
