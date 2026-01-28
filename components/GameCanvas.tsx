import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GameState, Player, Orb, Platform, Question } from '../types';
import {
  GRAVITY,
  FRICTION,
  MOVE_SPEED,
  JUMP_FORCE,
  WORLD_WIDTH,
  DESIGN_HEIGHT,
  PLATFORM_DATA,
  ORB_DATA,
  CHECKPOINTS,
  LIGHT_SOURCES,
  TEMPLE_COLORS,
  GOAL_X,
  GOAL_Y_OFFSET,
  PLAYER_LIGHT_RADIUS,
  QUESTIONS,
  REVIEW_QUESTIONS,
  REQUIRED_TOOL_IDS,
  NPC_CONFIG
} from '../constants';
import { generateSpriteUrl } from '../utils/assetGenerator';
import QuizModal from './QuizModal';
import LoreModal from './LoreModal';
import { submitScore as submitLeaderboardScore } from '../api/leaderboard';

// Import shared rendering library (Early 2000s Graphics Refresh)
import {
  setSmoothing,
  drawDropShadow,
  drawDynamicShadow,
  drawBloom,
  drawCollectibleGlow,
  drawVignette,
  createScreenShake,
  updateScreenShake,
  ParticleSystem,
  createLandingDust,
  createJumpDust,
  createCollectionBurst,
  createCheckpointEffect,
  applyEnhancedLighting,
  drawTorchSmoke,
  generateStarField,
  renderStarField,
  createSquashStretch,
  applyLandingSquash,
  applyJumpStretch,
  updateSquashStretch,
  getHoverOffset,
  drawSpriteGlow,
  drawGlintEffect,
  TransitionManager,
  ScorePopupManager,
  ENHANCED_COLORS,
  withAlpha,
  type ScreenShake,
  type StarField,
} from '@shared/rendering';

type GameCanvasProps = {
  userId?: string | null;
  userName?: string | null;
  rank?: string | null;
  initiationDate?: string | null;
  isGrandOfficer?: boolean | null;
};

const GameCanvas: React.FC<GameCanvasProps> = ({ userId, userName, rank, initiationDate, isGrandOfficer }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const userNameRef = useRef<string | null>(userName ?? null);
  const rankRef = useRef<string | null>(rank ?? null);
  const initiationDateRef = useRef<string | null>(initiationDate ?? null);
  const isGrandOfficerRef = useRef<boolean | null>(isGrandOfficer ?? null);
  const innerGuardGreetedRef = useRef(false);

  const [dimensions, setDimensions] = useState({
    w: typeof window !== 'undefined' ? (window.innerWidth || 800) : 800,
    h: typeof window !== 'undefined' ? (window.innerHeight || 600) : 600
  });

  const [gameState, setGameState] = useState<GameState>('START');
  const [modalState, setModalState] = useState<'NONE' | 'LORE' | 'QUIZ'>('NONE');
  const [activeOrb, setActiveOrb] = useState<Orb | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [graveQuestion, setGraveQuestion] = useState<Question | null>(null);
  const [graveAnswers, setGraveAnswers] = useState<string[]>([]);
  const [graveResult, setGraveResult] = useState<'correct' | 'incorrect' | null>(null);
  const [score, setScore] = useState(0);
  const [collectedIds, setCollectedIds] = useState<Set<number>>(new Set());
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState(userName ?? '');
  const [showNameInput, setShowNameInput] = useState(false);
  const [tempName, setTempName] = useState(userName ?? '');
  const [hasApron, setHasApron] = useState(false);
  const [isRestored, setIsRestored] = useState(false);

  const scoreRef = useRef(0);
  const collectedRef = useRef<Set<number>>(new Set());
  const seenLoreRef = useRef<Set<string>>(new Set());
  const keysRef = useRef<Record<string, boolean>>({});
  const jumpBufferRef = useRef(0);
  const lastCheckpointRef = useRef({ x: 60, y: DESIGN_HEIGHT - 140 });
  const cameraRef = useRef({ x: 0, y: 0 });
  const spritesRef = useRef<Record<string, HTMLImageElement>>({});
  const platformsRef = useRef<Platform[]>([]);
  const boundsRef = useRef({ minY: -200, maxY: 200 });

  const playerRef = useRef<Player>({
    x: 60,
    y: DESIGN_HEIGHT - 140,
    width: 30,
    height: 44,
    vx: 0,
    vy: 0,
    isGrounded: false,
    facing: 1,
    jumpCount: 0,
    coyoteTimer: 0
  });

  // === SHARED RENDERING LIBRARY REFS (Early 2000s Graphics Refresh) ===
  const particleSystemRef = useRef<ParticleSystem>(new ParticleSystem(100));
  const screenShakeStateRef = useRef<ScreenShake>({
    intensity: 0,
    duration: 0,
    elapsed: 0,
    offsetX: 0,
    offsetY: 0
  });
  const transitionManagerRef = useRef<TransitionManager>(new TransitionManager());
  const scorePopupManagerRef = useRef<ScorePopupManager>(new ScorePopupManager());
  const squashStretchRef = useRef(createSquashStretch());
  const wasGroundedRef = useRef(false);
  const prevVyRef = useRef(0);

  useEffect(() => {
    if (userName) {
      userNameRef.current = userName;
      setPlayerName(userName);
      setTempName(userName);
      setShowNameInput(false);
    }
    if (rank) {
      rankRef.current = rank;
    }
    if (initiationDate) {
      initiationDateRef.current = initiationDate;
    }
    if (typeof isGrandOfficer === 'boolean') {
      isGrandOfficerRef.current = isGrandOfficer;
    }
  }, [userName, rank, initiationDate, isGrandOfficer]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    collectedRef.current = collectedIds;
  }, [collectedIds]);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w > 0 && h > 0) setDimensions({ w, h });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const groundRefY = DESIGN_HEIGHT - 40;
    platformsRef.current = PLATFORM_DATA.map((p) => ({
      x: p.x,
      y: groundRefY + p.yOffset,
      width: p.width,
      height: p.height,
      color: p.color,
      type: p.type
    }));

    const minY = Math.min(...platformsRef.current.map((p) => p.y)) - 200;
    const maxY = Math.max(...platformsRef.current.map((p) => p.y + p.height)) - DESIGN_HEIGHT + 200;
    boundsRef.current = { minY, maxY };
  }, []);

  useEffect(() => {
    const keys = [
      'skirret',
      'pencil',
      'compasses',
      'acacia',
      'skull',
      'hourglass',
      'scythe',
      'dormer_window',
      'porch',
      'chair',
      'inner_guard',
      'senior_warden',
      'wm'
    ];

    keys.forEach((key) => {
      const img = new Image();
      img.src = generateSpriteUrl(key);
      spritesRef.current[key] = img;
    });
  }, []);

  const shuffleAnswers = (answers: string[]) => {
    const copy = [...answers];
    copy.sort(() => Math.random() - 0.5);
    return copy;
  };

  const pickGraveQuestion = () => {
    const selection = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
    return selection;
  };

  const drawPlayerSprite = (ctx: CanvasRenderingContext2D, p: Player, showApron: boolean, restored: boolean) => {
    ctx.save();
    ctx.translate(p.x + p.width / 2, p.y + p.height / 2);
    ctx.scale(p.facing, 1);

    const baseWalkSpeed = 120;
    const velocityFactor = Math.min(Math.abs(p.vx) / 5.5, 1.5);
    const walkSpeed = baseWalkSpeed / Math.max(velocityFactor, 0.5);
    const isMoving = Math.abs(p.vx) > 0.1;
    const walkCycle = Date.now() / walkSpeed;

    const legAmplitude = 4 + velocityFactor * 2;
    let leftLegOffset = 0;
    let rightLegOffset = 0;
    let bodyBob = 0;

    if (!p.isGrounded) {
      leftLegOffset = -4;
      rightLegOffset = 5;
    } else if (isMoving) {
      leftLegOffset = Math.sin(walkCycle) * legAmplitude;
      rightLegOffset = Math.sin(walkCycle + Math.PI) * legAmplitude;
      bodyBob = Math.abs(Math.sin(walkCycle * 2)) * 1.5;
    }

    ctx.translate(0, -bodyBob);

    ctx.fillStyle = '#fca5a5';
    ctx.beginPath();
    ctx.arc(0, -16, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(7, -20);
    ctx.bezierCurveTo(4, -27, -9, -27, -10, -20);
    ctx.lineTo(-10, -9);
    ctx.lineTo(-3, -9);
    ctx.lineTo(-3, -14);
    ctx.lineTo(7, -20);
    ctx.fill();

    if (!restored) {
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(2, -19, 6, 5);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(2, -19, 6, 5);
      ctx.beginPath();
      ctx.moveTo(2, -17);
      ctx.lineTo(-7, -17);
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-7, -10, 14, 20);

      ctx.fillStyle = '#fca5a5';
      ctx.fillRect(0, -8, 6, 6);

      ctx.fillStyle = '#fca5a5';
      ctx.fillRect(-9 + (isMoving ? leftLegOffset * 0.5 : 0), -8, 3, 14);

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(6 + (isMoving ? rightLegOffset * 0.5 : 0), -8, 3, 14);

      ctx.fillStyle = '#fca5a5';
      ctx.fillRect(-9 + (isMoving ? leftLegOffset * 0.5 : 0), 6, 3, 3);
      ctx.fillRect(6 + (isMoving ? rightLegOffset * 0.5 : 0), 6, 3, 3);

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-6 + leftLegOffset, 10, 5, 12);
      ctx.fillStyle = '#fca5a5';
      ctx.fillRect(-6 + leftLegOffset, 14, 5, 4);

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(1 + rightLegOffset, 10, 5, 12);

      ctx.fillStyle = '#000000';
      ctx.fillRect(-6 + leftLegOffset, 22, 4, 3);
      ctx.fillStyle = '#fca5a5';
      ctx.fillRect(-2 + leftLegOffset, 22, 3, 3);

      ctx.fillStyle = '#000000';
      ctx.fillRect(1 + rightLegOffset, 22, 7, 3);

      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(-4, -11);
      ctx.quadraticCurveTo(0, -7, 4, -11);
      ctx.stroke();

      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.arc(3, -9, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(3, -9);
      const ropeSwing = isMoving ? Math.sin(walkCycle) * 3 : 0;
      ctx.quadraticCurveTo(6, -2, 5 + ropeSwing, 8);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#000000';
      ctx.fillRect(4, -17, 2, 2);

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-7, -10, 14, 20);

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-4, -10);
      ctx.lineTo(4, -10);
      ctx.lineTo(0, 0);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(-1, -10);
      ctx.lineTo(1, -10);
      ctx.lineTo(0.5, -2);
      ctx.lineTo(-0.5, -2);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-6 + leftLegOffset, 10, 5, 12);
      ctx.fillRect(1 + rightLegOffset, 10, 5, 12);

      ctx.fillStyle = '#000000';
      ctx.fillRect(-6 + leftLegOffset, 22, 7, 3);
      ctx.fillRect(1 + rightLegOffset, 22, 7, 3);

      ctx.fillStyle = '#0f172a';
      const armAmplitude = 3 + velocityFactor * 1.5;
      const leftArmSwing = isMoving ? Math.sin(walkCycle + Math.PI) * armAmplitude : 0;
      const rightArmSwing = isMoving ? Math.sin(walkCycle) * armAmplitude : 0;

      ctx.fillRect(-9 + leftArmSwing, -8, 3, 14);
      ctx.fillRect(6 + rightArmSwing, -8, 3, 14);

      ctx.fillStyle = '#fca5a5';
      ctx.fillRect(-9 + leftArmSwing, 6, 3, 3);
      ctx.fillRect(6 + rightArmSwing, 6, 3, 3);
    }

    if (showApron && restored) {
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.fillRect(-7, 0, 14, 10);
      ctx.strokeRect(-7, 0, 14, 10);

      ctx.beginPath();
      ctx.moveTo(-7, 0);
      ctx.lineTo(7, 0);
      ctx.lineTo(0, 6);
      ctx.closePath();
      ctx.fillStyle = '#f8fafc';
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#7dd3fc';
      ctx.beginPath();
      ctx.arc(-4, 7, 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(4, 7, 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 2, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  };

  const resetPlayer = (x: number, y: number) => {
    const p = playerRef.current;
    p.x = x;
    p.y = y;
    p.vx = 0;
    p.vy = 0;
    p.isGrounded = false;
    p.jumpCount = 0;
    p.coyoteTimer = 0;
  };

  const resetGame = (toMenu: boolean) => {
    const groundRefY = DESIGN_HEIGHT - 40;
    resetPlayer(60, groundRefY - 100);
    cameraRef.current = { x: 0, y: 0 };
    lastCheckpointRef.current = { x: 60, y: groundRefY - 100 };
    innerGuardGreetedRef.current = false;
    collectedRef.current = new Set();
    seenLoreRef.current = new Set();
    setCollectedIds(new Set());
    scoreRef.current = 0;
    setScore(0);
    setActiveOrb(null);
    setActiveQuestion(null);
    setGraveQuestion(null);
    setGraveResult(null);
    setWarningMessage(null);
    setModalState('NONE');
    setHasApron(false);
    setIsRestored(false);
    setShowNameInput(false);
    setGameState(toMenu ? 'START' : 'PLAYING');
  };

  const respawnAtCheckpoint = () => {
    const cp = lastCheckpointRef.current;
    resetPlayer(cp.x, cp.y);
    setGameState('PLAYING');
    setGraveQuestion(null);
    setGraveResult(null);
  };

  const handleDeath = () => {
    if (gameState !== 'PLAYING') return;
    // Add death flash effect
    transitionManagerRef.current.flash(150, '#ff0000', 0.3);
    const question = pickGraveQuestion();
    setGraveQuestion(question);
    setGraveAnswers(shuffleAnswers(question.answers));
    setGraveResult(null);
    keysRef.current = {};
    playerRef.current.vx = 0;
    playerRef.current.vy = 0;
    setGameState('GRAVE');
  };

  const collectOrb = (orb: Orb) => {
    collectedRef.current.add(orb.id);
    setCollectedIds(new Set(collectedRef.current));
    const points = orb.points ?? 100;
    // Add collection burst particles and score popup
    const groundRefY = DESIGN_HEIGHT - 40;
    const orbY = orb.y || (groundRefY + ((orb as any).yOffset || 0));
    createCollectionBurst(particleSystemRef.current, orb.x, orbY);
    scorePopupManagerRef.current.addScore(orb.x, orbY - 30, points);
    setScore((prev) => {
      const next = prev + points;
      scoreRef.current = next;
      return next;
    });
    setActiveOrb(null);
    setActiveQuestion(null);
    setModalState('NONE');
  };

  const handleLoreContinue = () => {
    if (!activeOrb) {
      setModalState('NONE');
      return;
    }

    if (activeOrb.id === 999) {
      setHasApron(true);
      setIsRestored(true);
      setActiveOrb(null);
      setModalState('NONE');
      return;
    }

    seenLoreRef.current.add(activeOrb.spriteKey);

    if (activeOrb.questionId) {
      const question = REVIEW_QUESTIONS.find((q) => q.id === activeOrb.questionId);
      if (question) {
        setActiveQuestion(question);
        setModalState('QUIZ');
        return;
      }
    }

    collectOrb(activeOrb);
  };

  const handleQuizCorrect = () => {
    if (activeOrb) collectOrb(activeOrb);
  };

  const handleQuizIncorrect = () => {
    setActiveQuestion(null);
    setActiveOrb(null);
    setModalState('NONE');
    setWarningMessage('Fidelity falters. The tool remains in shadow.');
  };

  const handleNameSubmit = () => {
    if (tempName.trim()) {
      setPlayerName(tempName.trim());
      setShowNameInput(false);
    }
  };

  useEffect(() => {
    if (!warningMessage) return;
    const timer = window.setTimeout(() => setWarningMessage(null), 3000);
    return () => window.clearTimeout(timer);
  }, [warningMessage]);

  useEffect(() => {
    if (gameState !== 'GRAVE' || !graveQuestion) return;
    setGraveAnswers(shuffleAnswers(graveQuestion.answers));
    setGraveResult(null);
  }, [gameState, graveQuestion]);

  const executeJump = () => {
    const p = playerRef.current;
    if (p.isGrounded || p.coyoteTimer > 0) {
      // Create jump dust particles at player's feet
      createJumpDust(
        particleSystemRef.current,
        p.x + p.width / 2,
        p.y + p.height
      );
      p.vy = JUMP_FORCE;
      p.isGrounded = false;
      p.jumpCount = 1;
      p.coyoteTimer = 0;
      jumpBufferRef.current = 0;
    } else {
      jumpBufferRef.current = 6;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        if (gameState === 'PLAYING' && modalState === 'NONE') {
          setGameState('PAUSED');
        } else if (gameState === 'PAUSED') {
          setGameState('PLAYING');
        }
        return;
      }

      if (gameState === 'START' && e.code === 'Enter') {
        resetGame(false);
        return;
      }

      if (gameState !== 'PLAYING' || modalState !== 'NONE') return;

      if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) {
        executeJump();
      }

      keysRef.current[e.code] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
      if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) {
        if (playerRef.current.vy < 0) playerRef.current.vy *= 0.5;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, modalState]);

  const handleInputStart = (key: string) => (e: React.TouchEvent | React.MouseEvent) => {
    if (e.cancelable) e.preventDefault();
    if (gameState !== 'PLAYING' || modalState !== 'NONE') return;
    if (key === 'Space') executeJump();
    keysRef.current[key] = true;
  };

  const handleInputEnd = (key: string) => (e: React.TouchEvent | React.MouseEvent) => {
    if (e.cancelable) e.preventDefault();
    keysRef.current[key] = false;
    if (key === 'Space' && playerRef.current.vy < 0) playerRef.current.vy *= 0.5;
  };

  useEffect(() => {
    if (gameState !== 'PLAYING' || modalState !== 'NONE') return;

    let frameId: number;

    const loop = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { w, h } = dimensions;
      if (w === 0 || h === 0) return;

      const scaleRatio = h / DESIGN_HEIGHT;
      const viewW = w / scaleRatio;
      const viewH = DESIGN_HEIGHT;

      const player = playerRef.current;
      const keys = keysRef.current;
      const groundRefY = DESIGN_HEIGHT - 40;

      const platforms = platformsRef.current;
      const orbs: Orb[] = ORB_DATA.map((o) => ({
        ...o,
        x: o.x,
        y: groundRefY + o.yOffset,
        active: !collectedRef.current.has(o.id)
      }));

      if (keys['ArrowLeft'] || keys['KeyA']) {
        player.vx -= 0.8;
        player.facing = -1;
      }
      if (keys['ArrowRight'] || keys['KeyD']) {
        player.vx += 0.8;
        player.facing = 1;
      }

      if (player.vx > MOVE_SPEED) player.vx = MOVE_SPEED;
      if (player.vx < -MOVE_SPEED) player.vx = -MOVE_SPEED;

      player.vx *= FRICTION;
      if (Math.abs(player.vx) < 0.1) player.vx = 0;
      player.x += player.vx;

      player.vy += GRAVITY;
      player.y += player.vy;

      if (player.y > groundRefY + 520) {
        handleDeath();
        return;
      }

      for (const cp of CHECKPOINTS) {
        if (player.x > cp.x && cp.x > lastCheckpointRef.current.x) {
          lastCheckpointRef.current = {
            x: cp.x,
            y: groundRefY + cp.yOffset - player.height - 8
          };
          // Add checkpoint celebration particles and flash
          createCheckpointEffect(
            particleSystemRef.current,
            player.x + player.width / 2,
            player.y + player.height / 2
          );
          transitionManagerRef.current.flash(200, '#fbbf24', 0.2);
        }
      }

      if (player.x < 0) {
        player.x = 0;
        player.vx = 0;
      }
      if (player.x > WORLD_WIDTH - player.width) {
        player.x = WORLD_WIDTH - player.width;
        player.vx = 0;
      }

      player.isGrounded = false;
      for (const plat of platforms) {
        if (
          player.x < plat.x + plat.width &&
          player.x + player.width > plat.x &&
          player.y < plat.y + plat.height &&
          player.y + player.height > plat.y
        ) {
          const playerCenterX = player.x + player.width / 2;
          const playerCenterY = player.y + player.height / 2;
          const platCenterX = plat.x + plat.width / 2;
          const platCenterY = plat.y + plat.height / 2;

          const overlapX = (player.width + plat.width) / 2 - Math.abs(playerCenterX - platCenterX);
          const overlapY = (player.height + plat.height) / 2 - Math.abs(playerCenterY - platCenterY);

          if (overlapX < overlapY) {
            if (playerCenterX < platCenterX) {
              player.x = plat.x - player.width;
            } else {
              player.x = plat.x + plat.width;
            }
            player.vx = 0;
          } else {
            if (playerCenterY < platCenterY) {
              player.y = plat.y - player.height;
              player.isGrounded = true;
              player.vy = 0;
              player.jumpCount = 0;
            } else {
              player.y = plat.y + plat.height;
              player.vy = 0;
            }
          }
        }
      }

      if (player.isGrounded) player.coyoteTimer = 6;
      else if (player.coyoteTimer > 0) player.coyoteTimer -= 1;

      // === LANDING DETECTION FOR PARTICLES AND SQUASH/STRETCH ===
      const justLanded = player.isGrounded && !wasGroundedRef.current && prevVyRef.current > 2;
      if (justLanded) {
        const landingImpact = Math.min(prevVyRef.current / 15, 1);
        // Create landing dust particles
        createLandingDust(
          particleSystemRef.current,
          player.x + player.width / 2,
          player.y + player.height,
          landingImpact
        );
        // Apply squash effect based on landing impact
        applyLandingSquash(squashStretchRef.current, landingImpact);
      }
      wasGroundedRef.current = player.isGrounded;
      prevVyRef.current = player.vy;

      // Update squash/stretch animation
      updateSquashStretch(squashStretchRef.current);

      // Update particle system
      particleSystemRef.current.update(16.67);

      // Update transition manager
      transitionManagerRef.current.update();

      // Update score popups
      scorePopupManagerRef.current.update();

      if (player.isGrounded && jumpBufferRef.current > 0) {
        executeJump();
      }
      if (jumpBufferRef.current > 0) jumpBufferRef.current -= 1;

      // --- NPC INTERACTIONS ---
      const igX = NPC_CONFIG.INNER_GUARD.x;
      const resolvedName = userNameRef.current || playerName;
      const resolvedRank = rankRef.current;
      const resolvedInitiationDate = initiationDateRef.current;
      const resolvedIsGrandOfficer = isGrandOfficerRef.current;
      const hasIdentityDetails = Boolean(resolvedName && resolvedRank && resolvedInitiationDate);

      if (hasIdentityDetails) {
        if (!innerGuardGreetedRef.current && player.x > igX - 50) {
          innerGuardGreetedRef.current = true;
          player.vx = 0;
          keysRef.current = {};

          let response = `Whom have you there? Brother ${resolvedRank} ${resolvedName}, who was initiated on ${resolvedInitiationDate}. The Senior Warden awaits to invest you with the badge of a Master Mason.`;
          if (resolvedIsGrandOfficer === true) {
            response = `Whom have you there? A Grand Lodge Officer! I am honoured to admit you, ${resolvedName}. The Senior Warden awaits to invest you.`;
          } else if (resolvedIsGrandOfficer === false) {
            response = 'Whom have you there? You seek advancement in Freemasonry. The Senior Warden awaits to invest you with the badge of a Master Mason.';
          }

          const innerGuardOrbMock: Orb = {
            id: 997,
            x: 0,
            y: 0,
            radius: 0,
            active: true,
            name: 'Inner Guard',
            spriteKey: 'inner_guard',
            blurb: response
          };

          setActiveOrb(innerGuardOrbMock);
          setModalState('LORE');
          return;
        }
      } else {
        if (player.x > igX - 50) {
          player.x = igX - 50;
          player.vx = 0;
          keysRef.current = {};
          setShowNameInput(true);
        }
      }

      const swX = NPC_CONFIG.SENIOR_WARDEN.x;
      const swY = groundRefY + NPC_CONFIG.SENIOR_WARDEN.yOffset;
      if (!hasApron && innerGuardGreetedRef.current) {
        if (player.x > swX - 30) {
          player.x = swX - 30;
          player.vx = 0;
          keysRef.current = {};

          const swOrbMock: Orb = {
            id: 999,
            x: 0,
            y: 0,
            radius: 0,
            active: true,
            name: 'Senior Warden',
            spriteKey: 'senior_warden',
            blurb: 'Brother, I invest you with the badge of a Master Mason. Wear it with honour and constancy, that it may adorn a life of fidelity.'
          };

          setActiveOrb(swOrbMock);
          setModalState('LORE');
          return;
        }
      }

      for (const orb of orbs) {
        if (!orb.active) continue;
        const dx = player.x + player.width / 2 - orb.x;
        const dy = player.y + player.height / 2 - orb.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < orb.radius + player.width / 2 + 8) {
          setActiveOrb(orb);
          player.vx = 0;
          player.vy = 0;
          keysRef.current = {};
          if (seenLoreRef.current.has(orb.spriteKey)) {
            if (orb.questionId) {
              const question = REVIEW_QUESTIONS.find((q) => q.id === orb.questionId);
              if (question) {
                setActiveQuestion(question);
                setModalState('QUIZ');
              } else {
                collectOrb(orb);
              }
            } else {
              collectOrb(orb);
            }
          } else {
            setModalState('LORE');
          }
          return;
        }
      }

      const wmX = NPC_CONFIG.WORSHIPFUL_MASTER.x;
      const wmY = groundRefY + NPC_CONFIG.WORSHIPFUL_MASTER.yOffset;
      const nearGoal = Math.abs(player.x - wmX) < 40;
      const nearGoalY = Math.abs((player.y + player.height) - wmY) < 60;
      if (nearGoal && nearGoalY) {
        const hasTools = REQUIRED_TOOL_IDS.every((id) => collectedRef.current.has(id));
        if (hasTools) {
          const name = playerName.trim() || 'Mason';
          submitLeaderboardScore(name, scoreRef.current + 500, true, userId).catch(() => {});
          setGameState('VICTORY');
          return;
        }
        if (!warningMessage) {
          setWarningMessage('Worshipful Master: "The East is sealed. Recover the working tools first."');
        }
      }

      let targetCamX = player.x - viewW / 2 + player.width / 2;
      targetCamX = Math.max(0, Math.min(targetCamX, WORLD_WIDTH - viewW));
      let targetCamY = player.y - viewH / 2;
      targetCamY = Math.max(boundsRef.current.minY, Math.min(targetCamY, boundsRef.current.maxY));

      cameraRef.current.x += (targetCamX - cameraRef.current.x) * 0.12;
      cameraRef.current.y += (targetCamY - cameraRef.current.y) * 0.12;

      ctx.resetTransform();
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.scale(scaleRatio, scaleRatio);
      ctx.translate(-Math.floor(cameraRef.current.x), -Math.floor(cameraRef.current.y));

      const frameTime = Date.now();

      const bgGradient = ctx.createLinearGradient(cameraRef.current.x, cameraRef.current.y, cameraRef.current.x, cameraRef.current.y + viewH);
      bgGradient.addColorStop(0, '#0b0f1a');
      bgGradient.addColorStop(0.6, '#151a2b');
      bgGradient.addColorStop(1, '#050608');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(cameraRef.current.x, cameraRef.current.y, viewW, viewH);

      const porchImg = spritesRef.current['porch'];
      if (porchImg && porchImg.complete) {
        ctx.drawImage(porchImg, 120, groundRefY - 120, 96, 72);
      }

      const dormerImg = spritesRef.current['dormer_window'];
      if (dormerImg && dormerImg.complete) {
        ctx.drawImage(dormerImg, 3600, groundRefY - 180, 96, 72);
      }

      ctx.fillStyle = 'rgba(15, 18, 28, 0.45)';
      for (let i = 0; i < 5; i += 1) {
        const fogY = cameraRef.current.y + (i * 80) + (Math.sin(frameTime / 1000 + i) * 10);
        ctx.fillRect(cameraRef.current.x, fogY, viewW, 40);
      }

      platforms.forEach((plat) => {
        if (plat.type === 'floor') {
          ctx.fillStyle = plat.color;
          ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
          ctx.fillStyle = TEMPLE_COLORS.SILVER;
          ctx.fillRect(plat.x, plat.y, plat.width, 4);
        } else if (plat.type === 'grave') {
          ctx.fillStyle = TEMPLE_COLORS.SHADOW;
          ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
          ctx.strokeStyle = TEMPLE_COLORS.SILVER;
          ctx.lineWidth = 1;
          ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);
        } else if (plat.type === 'stair') {
          ctx.fillStyle = TEMPLE_COLORS.SILVER;
          ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
        } else if (plat.type === 'rubble') {
          ctx.fillStyle = TEMPLE_COLORS.ASH;
          ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
          ctx.fillStyle = TEMPLE_COLORS.BLACK;
          ctx.fillRect(plat.x + 4, plat.y + 4, plat.width - 8, plat.height - 8);
        } else {
          ctx.fillStyle = plat.color;
          ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
        }
      });

      const drawCandle = (x: number, y: number) => {
        ctx.fillStyle = TEMPLE_COLORS.CANDLE;
        ctx.fillRect(x - 2, y - 12, 4, 10);
        ctx.fillStyle = TEMPLE_COLORS.GOLD;
        ctx.beginPath();
        ctx.arc(x, y - 14, 3, 0, Math.PI * 2);
        ctx.fill();
      };

      LIGHT_SOURCES.forEach((light) => {
        drawCandle(light.x, groundRefY + light.yOffset);
      });

      orbs.forEach((orb) => {
        if (!orb.active) return;
        const img = spritesRef.current[orb.spriteKey];
        const floatOffset = Math.sin(frameTime / 400 + orb.id) * 4;
        const orbY = orb.y + floatOffset;
        const glow = ctx.createRadialGradient(orb.x, orbY, 0, orb.x, orbY, 26);
        glow.addColorStop(0, 'rgba(200, 162, 74, 0.6)');
        glow.addColorStop(1, 'rgba(200, 162, 74, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(orb.x, orbY, 26, 0, Math.PI * 2);
        ctx.fill();
        if (img && img.complete) {
          ctx.drawImage(img, orb.x - 16, orbY - 16, 32, 32);
        }
      });

      const drawNpc = (key: string, x: number, y: number) => {
        const img = spritesRef.current[key];
        if (img && img.complete && img.naturalHeight !== 0) {
          ctx.drawImage(img, x - 16, y - 44, 32, 44);
        } else {
          ctx.fillStyle = '#11131a';
          ctx.fillRect(x - 12, y - 40, 24, 40);
        }
      };

      drawNpc('inner_guard', igX, groundRefY + NPC_CONFIG.INNER_GUARD.yOffset);
      drawNpc('senior_warden', swX, swY);
      drawNpc('wm', wmX, wmY);

      const chairImg = spritesRef.current['chair'];
      if (chairImg && chairImg.complete) {
        ctx.drawImage(chairImg, GOAL_X - 24, groundRefY + GOAL_Y_OFFSET - 40, 48, 48);
      }

      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.82)';
      ctx.fillRect(cameraRef.current.x, cameraRef.current.y, viewW, viewH);

      ctx.globalCompositeOperation = 'destination-out';
      const drawLight = (x: number, y: number, radius: number) => {
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, 'rgba(0,0,0,1)');
        gradient.addColorStop(0.55, 'rgba(0,0,0,0.18)');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      };

      drawLight(player.x + player.width / 2, player.y + player.height / 2, PLAYER_LIGHT_RADIUS);
      LIGHT_SOURCES.forEach((light) => {
        drawLight(light.x, groundRefY + light.yOffset, light.radius);
      });

      ctx.restore();

      // Add torch smoke effects near light sources
      LIGHT_SOURCES.forEach((light) => {
        if (light.x > cameraRef.current.x - 50 && light.x < cameraRef.current.x + viewW + 50) {
          drawTorchSmoke(ctx, light.x, groundRefY + light.yOffset - 20, frameTime);
        }
      });

      const playerAuraX = player.x + player.width / 2;
      const playerAuraY = player.y + player.height / 2;
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const aura = ctx.createRadialGradient(playerAuraX, playerAuraY, 0, playerAuraX, playerAuraY, 28);
      aura.addColorStop(0, 'rgba(230,200,110,0.7)');
      aura.addColorStop(1, 'rgba(230,200,110,0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(playerAuraX, playerAuraY, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Render particles (dust, sparkles, etc.)
      particleSystemRef.current.render(ctx, cameraRef.current.x, cameraRef.current.y, viewW, viewH);

      // Render score popups
      scorePopupManagerRef.current.render(ctx, cameraRef.current.x, cameraRef.current.y);

      drawPlayerSprite(ctx, player, hasApron, isRestored);

      ctx.restore();

      // Enhanced vignette from shared library
      ctx.resetTransform();
      drawVignette(ctx, w, h, 0.5);

      // Render screen transitions (fade, flash effects)
      transitionManagerRef.current.render(ctx, w, h);

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    animationRef.current = frameId;
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [gameState, modalState, dimensions, userId, userName, warningMessage, playerName, hasApron, isRestored]);

  const toolStatus = useMemo(() => {
    return REQUIRED_TOOL_IDS.map((id) => ({
      id,
      collected: collectedIds.has(id)
    }));
  }, [collectedIds]);

  const graveIcons = [
    { key: 'skull', label: 'Skull' },
    { key: 'hourglass', label: 'Hourglass' },
    { key: 'scythe', label: 'Scythe' }
  ];

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        width={dimensions.w}
        height={dimensions.h}
        className="block"
        style={{ filter: gameState === 'GRAVE' ? 'sepia(0.75) saturate(0.7)' : 'none' }}
      />

      {gameState === 'START' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="mm-fade-in w-[92%] max-w-xl rounded-2xl border border-[#c8a24a]/50 bg-[#0b0f1a]/90 p-6 text-center shadow-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-[#c0c7d1]">Memento Mori</p>
            <h1 className="mm-display mm-glow mt-2 text-3xl md:text-4xl text-[#c8a24a]">Master Mason Education</h1>
            <p className="mt-4 text-base text-[#c0c7d1]">
              Darkness visible. Keep your integrity alight, face the ruffians, and accept the final lesson.
            </p>
            <div className="mt-6 flex flex-col gap-3 text-sm text-[#c0c7d1]">
              <p>Move: Arrow Keys or A/D</p>
              <p>Jump: Space or W</p>
              <p>Pause: Escape</p>
            </div>
            <button
              onClick={() => resetGame(false)}
              className="mt-6 w-full rounded-lg border border-[#c8a24a] bg-[#1b2440] py-3 text-sm font-bold uppercase tracking-widest text-[#c8a24a] transition hover:bg-[#243255]"
            >
              Begin the Vigil
            </button>
          </div>
        </div>
      )}

      {showNameInput && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-xl border border-[#c8a24a]/50 bg-[#0b0f1a]/95 p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 h-14 w-14 rounded-full border border-[#1b2440] bg-[#121726] p-3">
              <img src={generateSpriteUrl('inner_guard')} className="h-full w-full object-contain" alt="Inner Guard" />
            </div>
            <h3 className="mm-display text-lg text-[#c8a24a]">The Inner Guard Challenges You</h3>
            <p className="mt-2 text-sm text-[#c0c7d1]">“Whom have you there?”</p>
            <input
              type="text"
              placeholder="Enter your name"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="mt-5 w-full rounded-md border border-[#1b2440] bg-black/40 px-4 py-2 text-white focus:border-[#c8a24a] focus:outline-none"
            />
            <button
              onClick={handleNameSubmit}
              disabled={!tempName.trim()}
              className="mt-4 w-full rounded-lg border border-[#c8a24a] bg-[#1b2440] py-2 text-sm font-bold uppercase tracking-widest text-[#c8a24a] disabled:opacity-40"
            >
              Proceed
            </button>
          </div>
        </div>
      )}

      {warningMessage && (
        <div className="absolute top-6 left-1/2 z-30 -translate-x-1/2 rounded-lg border border-[#c8a24a]/60 bg-black/70 px-4 py-2 text-sm text-[#c8a24a] shadow-lg">
          {warningMessage}
        </div>
      )}

      {gameState === 'PLAYING' && modalState === 'NONE' && (
        <div className="absolute top-4 left-4 z-20 flex items-center gap-3 rounded-full border border-[#1b2440] bg-black/40 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#c0c7d1]">
          <span>Integrity</span>
          <div className="flex items-center gap-2">
            {toolStatus.map((tool) => (
              <img
                key={tool.id}
                src={generateSpriteUrl(tool.id === 1 ? 'skirret' : tool.id === 2 ? 'pencil' : 'compasses')}
                className={`h-6 w-6 ${tool.collected ? '' : 'opacity-30 grayscale'}`}
                alt="tool"
              />
            ))}
          </div>
          <span className="text-[#c8a24a]">{score}</span>
        </div>
      )}

      {gameState === 'PLAYING' && modalState === 'NONE' && (
        <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-end pb-4 px-4">
          <div className="flex justify-between items-end w-full select-none">
            <div className="flex gap-3 pointer-events-auto">
              <button
                className="w-14 h-14 rounded-full border border-white/10 bg-white/5 backdrop-blur active:scale-95"
                onMouseDown={handleInputStart('ArrowLeft')} onMouseUp={handleInputEnd('ArrowLeft')} onMouseLeave={handleInputEnd('ArrowLeft')}
                onTouchStart={handleInputStart('ArrowLeft')} onTouchEnd={handleInputEnd('ArrowLeft')}
              >
                <span className="text-lg text-white/70">&lt;</span>
              </button>
              <button
                className="w-14 h-14 rounded-full border border-white/10 bg-white/5 backdrop-blur active:scale-95"
                onMouseDown={handleInputStart('ArrowRight')} onMouseUp={handleInputEnd('ArrowRight')} onMouseLeave={handleInputEnd('ArrowRight')}
                onTouchStart={handleInputStart('ArrowRight')} onTouchEnd={handleInputEnd('ArrowRight')}
              >
                <span className="text-lg text-white/70">&gt;</span>
              </button>
            </div>
            <div className="pointer-events-auto">
              <button
                className="w-16 h-16 rounded-full border border-[#c8a24a]/40 bg-[#1b2440]/60 text-xs uppercase tracking-widest text-[#c8a24a] active:scale-95"
                onMouseDown={handleInputStart('Space')} onMouseUp={handleInputEnd('Space')} onMouseLeave={handleInputEnd('Space')}
                onTouchStart={handleInputStart('Space')} onTouchEnd={handleInputEnd('Space')}
              >
                Jump
              </button>
            </div>
          </div>
        </div>
      )}

      {modalState === 'LORE' && activeOrb && (
        <LoreModal orb={activeOrb} onNext={handleLoreContinue} />
      )}

      {modalState === 'QUIZ' && activeQuestion && (
        <QuizModal question={activeQuestion} onCorrect={handleQuizCorrect} onIncorrect={handleQuizIncorrect} />
      )}

      {gameState === 'GRAVE' && graveQuestion && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-[#c8a24a]/60 bg-[#0b0f1a]/95 p-6 text-center text-[#c0c7d1]">
            <p className="mm-display text-xs uppercase tracking-[0.35em] text-[#c8a24a]">Lodge of Sorrow</p>
            <h2 className="mt-3 text-2xl md:text-3xl text-[#c8a24a]">Darkness Visible</h2>
            <div className="mt-4 flex justify-center gap-4">
              {graveIcons.map((icon) => (
                <img
                  key={icon.key}
                  src={generateSpriteUrl(icon.key)}
                  alt={icon.label}
                  className="h-12 w-12"
                />
              ))}
            </div>
            <p className="mt-4 text-sm text-[#c0c7d1]">
              You have fallen into the grave. The Master's help will raise you back to labor—answer the ritual question.
            </p>
            <div className="mt-6 rounded-lg border border-[#1b2440] bg-black/40 p-4">
              <p className="text-sm uppercase tracking-[0.2em] text-[#c0c7d1]">Ritual Question</p>
              <p className="mt-2 text-lg text-white">{graveQuestion.text}</p>
            </div>

            {graveResult === null && (
              <div className="mt-6 grid gap-3">
                {graveAnswers.map((answer) => (
                  <button
                    key={answer}
                    onClick={() => {
                      if (!graveQuestion) return;
                      if (answer === graveQuestion.correctAnswer) {
                        setGraveResult('correct');
                      } else {
                        const name = playerName.trim() || 'Mason';
                        submitLeaderboardScore(name, scoreRef.current, false, userId).catch(() => {});
                        setGraveResult('incorrect');
                      }
                    }}
                    className="w-full rounded-lg border border-[#1b2440] bg-[#111525] px-4 py-3 text-left text-sm text-[#c0c7d1] transition hover:border-[#c8a24a]/70 hover:text-white"
                  >
                    {answer}
                  </button>
                ))}
              </div>
            )}

            {graveResult === 'correct' && (
              <div className="mt-6">
                <p className="text-sm uppercase tracking-[0.3em] text-[#c8a24a]">Raised</p>
                <button
                  onClick={respawnAtCheckpoint}
                  className="mt-3 w-full rounded-lg border border-[#c8a24a] bg-[#1b2440] py-3 text-sm uppercase tracking-widest text-[#c8a24a]"
                >
                  Return to the Work
                </button>
              </div>
            )}

            {graveResult === 'incorrect' && (
              <div className="mt-6">
                <p className="text-sm uppercase tracking-[0.3em] text-red-400">Buried</p>
                <button
                  onClick={() => resetGame(false)}
                  className="mt-3 w-full rounded-lg border border-red-500/60 bg-[#1b1418] py-3 text-sm uppercase tracking-widest text-red-300"
                >
                  Begin Again
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {gameState === 'PAUSED' && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-[#1b2440] bg-[#0b0f1a]/90 p-6 text-center">
            <h2 className="mm-display text-xl text-[#c8a24a]">Paused</h2>
            <p className="mt-2 text-sm text-[#c0c7d1]">Score: {score}</p>
            <div className="mt-6 space-y-3">
              <button
                onClick={() => setGameState('PLAYING')}
                className="w-full rounded-lg border border-[#c8a24a] bg-[#1b2440] py-3 text-sm uppercase tracking-widest text-[#c8a24a]"
              >
                Resume
              </button>
              <button
                onClick={() => resetGame(false)}
                className="w-full rounded-lg border border-[#1b2440] bg-black/40 py-3 text-sm uppercase tracking-widest text-[#c0c7d1]"
              >
                Restart
              </button>
              <button
                onClick={() => resetGame(true)}
                className="w-full rounded-lg border border-[#1b2440] bg-black/30 py-3 text-sm uppercase tracking-widest text-[#c0c7d1]"
              >
                Main Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {gameState === 'VICTORY' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-[#c8a24a] bg-[#0b0f1a]/95 p-8 text-center text-[#c0c7d1]">
            <p className="mm-display text-xs uppercase tracking-[0.35em] text-[#c8a24a]">The Empty Chair</p>
            <h2 className="mt-3 text-3xl text-[#c8a24a]">Vigil Complete</h2>
            <p className="mt-2 text-base">Brother {playerName || 'Mason'}, you have kept the faith through the trial.</p>
            <p className="mt-4 text-sm uppercase tracking-[0.25em] text-[#c0c7d1]">Final Score</p>
            <p className="mt-1 text-4xl text-[#c8a24a]">{score + 500}</p>
            <button
              onClick={() => resetGame(true)}
              className="mt-6 w-full rounded-lg border border-[#c8a24a] bg-[#1b2440] py-3 text-sm uppercase tracking-widest text-[#c8a24a]"
            >
              Return to Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameCanvas;
