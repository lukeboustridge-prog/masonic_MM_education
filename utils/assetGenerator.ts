const spriteCache: Record<string, string> = {};

const makeCanvas = (width: number, height: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.imageSmoothingEnabled = false;
  return { canvas, ctx };
};

const fillRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) => {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
};

const drawCircle = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
};

const drawShadowFigure = (ctx: CanvasRenderingContext2D, tool: 'plumb' | 'level' | 'maul') => {
  const cloak = '#11131a';
  const hood = '#1b1f2b';
  const metal = '#a3a7b0';
  const wood = '#4b3a2b';

  drawCircle(ctx, 16, 9, 7, hood);
  ctx.fillStyle = cloak;
  ctx.beginPath();
  ctx.moveTo(6, 14);
  ctx.lineTo(26, 14);
  ctx.lineTo(30, 44);
  ctx.lineTo(2, 44);
  ctx.closePath();
  ctx.fill();

  if (tool === 'plumb') {
    fillRect(ctx, 15, 16, 2, 18, metal);
    drawCircle(ctx, 16, 35, 3, metal);
  }
  if (tool === 'level') {
    fillRect(ctx, 9, 24, 14, 3, metal);
    fillRect(ctx, 14, 21, 4, 3, metal);
  }
  if (tool === 'maul') {
    fillRect(ctx, 18, 18, 3, 18, wood);
    fillRect(ctx, 12, 14, 12, 6, metal);
  }
};

// Officer sprites that should use actual image files from /public/sprites/
const OFFICER_SPRITE_FILES: Record<string, string> = {
  inner_guard: '/sprites/inner_guard.png',
  senior_warden: '/sprites/officer.png',
  worshipful_master: '/sprites/wm.png',
};

export const generateSpriteUrl = (key: string): string => {
  if (spriteCache[key]) return spriteCache[key];
  if (typeof document === 'undefined') return '';

  const resolvedKey = key === 'wm' ? 'worshipful_master' : key;

  // Use actual image files for officer sprites
  if (OFFICER_SPRITE_FILES[resolvedKey]) {
    const url = OFFICER_SPRITE_FILES[resolvedKey];
    spriteCache[key] = url;
    return url;
  }
  let width = 32;
  let height = 32;
  if (['player', 'jubela', 'jubelo', 'jubelum', 'inner_guard', 'senior_warden', 'worshipful_master'].includes(resolvedKey)) {
    width = 32;
    height = 48;
  }
  if (['dormer_window', 'porch'].includes(key)) {
    width = 64;
    height = 48;
  }
  if (key === 'chair') {
    width = 48;
    height = 48;
  }

  const created = makeCanvas(width, height);
  if (!created) return '';
  const { canvas, ctx } = created;

  const black = '#0b0f1a';
  const indigo = '#1b2440';
  const silver = '#c0c7d1';
  const gold = '#c8a24a';
  const blue = '#7dd3fc';
  const blueDark = '#38bdf8';
  const suit = '#0f172a';
  const flesh = '#f5b997';
  const white = '#f8fafc';

  switch (resolvedKey) {
    case 'player': {
      drawCircle(ctx, 16, 7, 6, flesh);
      fillRect(ctx, 10, 14, 12, 18, suit);
      fillRect(ctx, 8, 16, 4, 14, suit);
      fillRect(ctx, 20, 16, 4, 14, suit);
      fillRect(ctx, 12, 32, 6, 14, suit);
      fillRect(ctx, 18, 32, 6, 14, suit);
      fillRect(ctx, 10, 22, 12, 9, '#f8fafc');
      ctx.strokeStyle = blue;
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 22, 12, 9);
      drawCircle(ctx, 12, 30, 2, blue);
      drawCircle(ctx, 20, 30, 2, blue);
      drawCircle(ctx, 16, 24, 2, blue);
      break;
    }
    case 'jubela':
      drawShadowFigure(ctx, 'plumb');
      break;
    case 'jubelo':
      drawShadowFigure(ctx, 'level');
      break;
    case 'jubelum':
      drawShadowFigure(ctx, 'maul');
      break;
    case 'worshipful_master': {
      drawCircle(ctx, 16, 6, 6, flesh);
      fillRect(ctx, 10, 4, 3, 6, '#e2e8f0');
      fillRect(ctx, 19, 4, 3, 6, '#e2e8f0');

      fillRect(ctx, 8, 12, 16, 22, suit);
      fillRect(ctx, 9, 34, 6, 12, suit);
      fillRect(ctx, 17, 34, 6, 12, suit);
      fillRect(ctx, 8, 46, 7, 2, '#000000');
      fillRect(ctx, 17, 46, 7, 2, '#000000');

      fillRect(ctx, 5, 13, 3, 16, suit);
      fillRect(ctx, 24, 13, 3, 16, suit);
      fillRect(ctx, 5, 29, 3, 3, flesh);
      fillRect(ctx, 24, 29, 3, 3, flesh);

      ctx.strokeStyle = blue;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(11, 14);
      ctx.lineTo(16, 24);
      ctx.lineTo(21, 14);
      ctx.stroke();

      ctx.strokeStyle = silver;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(13, 24, 6, 6);

      fillRect(ctx, 9, 22, 14, 11, white);
      ctx.strokeStyle = blue;
      ctx.lineWidth = 2;
      ctx.strokeRect(9, 22, 14, 11);

      fillRect(ctx, 10, 24, 2, 5, silver);
      fillRect(ctx, 20, 24, 2, 5, silver);

      fillRect(ctx, 10, 30, 3, 1, silver);
      fillRect(ctx, 11, 29, 1, 2, silver);
      fillRect(ctx, 19, 30, 3, 1, silver);
      fillRect(ctx, 20, 29, 1, 2, silver);
      fillRect(ctx, 14, 24, 3, 1, silver);
      fillRect(ctx, 15, 23, 1, 2, silver);
      break;
    }
    case 'inner_guard':
    case 'senior_warden': {
      drawCircle(ctx, 16, 6, 6, flesh);

      ctx.fillStyle = resolvedKey === 'senior_warden' ? '#94a3b8' : '#78350f';
      ctx.beginPath();
      ctx.arc(16, 5, 6, Math.PI, 0);
      ctx.fill();

      fillRect(ctx, 8, 12, 16, 22, suit);
      fillRect(ctx, 9, 34, 6, 12, suit);
      fillRect(ctx, 17, 34, 6, 12, suit);
      fillRect(ctx, 8, 46, 7, 2, '#000000');
      fillRect(ctx, 17, 46, 7, 2, '#000000');

      fillRect(ctx, 5, 13, 3, 16, suit);
      fillRect(ctx, 24, 13, 3, 16, suit);
      fillRect(ctx, 5, 29, 3, 3, flesh);
      fillRect(ctx, 24, 29, 3, 3, flesh);

      ctx.strokeStyle = blue;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(11, 14);
      ctx.lineTo(16, 24);
      ctx.lineTo(21, 14);
      ctx.stroke();

      ctx.strokeStyle = silver;
      ctx.lineWidth = 1.5;
      if (resolvedKey === 'inner_guard') {
        ctx.beginPath();
        ctx.moveTo(14, 24);
        ctx.lineTo(18, 29);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(18, 24);
        ctx.lineTo(14, 29);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(13, 28);
        ctx.lineTo(19, 28);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(16, 28);
        ctx.lineTo(16, 25);
        ctx.stroke();
      }

      fillRect(ctx, 9, 22, 14, 11, white);
      ctx.strokeStyle = blue;
      ctx.lineWidth = 2;
      ctx.strokeRect(9, 22, 14, 11);

      fillRect(ctx, 10, 24, 2, 5, silver);
      fillRect(ctx, 20, 24, 2, 5, silver);

      drawCircle(ctx, 11, 30, 2, blue);
      drawCircle(ctx, 21, 30, 2, blue);
      drawCircle(ctx, 11, 30, 1, blueDark);
      drawCircle(ctx, 21, 30, 1, blueDark);
      break;
    }
    case 'skirret': {
      drawCircle(ctx, 16, 16, 6, gold);
      drawCircle(ctx, 16, 16, 3, silver);
      ctx.strokeStyle = silver;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(16, 16);
      ctx.lineTo(28, 26);
      ctx.stroke();
      break;
    }
    case 'pencil': {
      ctx.save();
      ctx.translate(16, 16);
      ctx.rotate(-0.6);
      fillRect(ctx, -10, -3, 20, 6, gold);
      fillRect(ctx, 6, -3, 4, 6, silver);
      ctx.fillStyle = black;
      ctx.beginPath();
      ctx.moveTo(-10, -3);
      ctx.lineTo(-14, 0);
      ctx.lineTo(-10, 3);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      break;
    }
    case 'compasses': {
      ctx.strokeStyle = silver;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(16, 6);
      ctx.lineTo(6, 26);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(16, 6);
      ctx.lineTo(26, 26);
      ctx.stroke();
      drawCircle(ctx, 16, 6, 3, gold);
      break;
    }
    case 'acacia': {
      ctx.strokeStyle = '#3f8f4a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(6, 26);
      ctx.lineTo(20, 10);
      ctx.stroke();
      drawCircle(ctx, 18, 12, 4, '#4ade80');
      drawCircle(ctx, 22, 16, 3, '#4ade80');
      drawCircle(ctx, 14, 18, 3, '#22c55e');
      break;
    }
    case 'skull': {
      drawCircle(ctx, 16, 12, 9, silver);
      drawCircle(ctx, 12, 12, 2, black);
      drawCircle(ctx, 20, 12, 2, black);
      fillRect(ctx, 14, 16, 4, 6, black);
      fillRect(ctx, 8, 24, 16, 6, silver);
      fillRect(ctx, 4, 26, 10, 4, silver);
      fillRect(ctx, 18, 26, 10, 4, silver);
      break;
    }
    case 'hourglass': {
      ctx.strokeStyle = silver;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(8, 6);
      ctx.lineTo(24, 6);
      ctx.lineTo(18, 14);
      ctx.lineTo(24, 22);
      ctx.lineTo(8, 22);
      ctx.lineTo(14, 14);
      ctx.closePath();
      ctx.stroke();
      fillRect(ctx, 12, 8, 8, 4, gold);
      fillRect(ctx, 12, 18, 8, 4, gold);
      break;
    }
    case 'scythe': {
      fillRect(ctx, 20, 6, 3, 22, '#654321');
      ctx.strokeStyle = silver;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(6, 10);
      ctx.quadraticCurveTo(20, 4, 26, 16);
      ctx.stroke();
      break;
    }
    case 'dormer_window': {
      fillRect(ctx, 6, 18, 52, 24, indigo);
      ctx.strokeStyle = gold;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(6, 18);
      ctx.lineTo(32, 6);
      ctx.lineTo(58, 18);
      ctx.closePath();
      ctx.stroke();
      fillRect(ctx, 14, 24, 16, 16, silver);
      fillRect(ctx, 34, 24, 16, 16, silver);
      break;
    }
    case 'porch': {
      fillRect(ctx, 4, 24, 56, 18, indigo);
      fillRect(ctx, 10, 10, 10, 14, silver);
      fillRect(ctx, 44, 10, 10, 14, silver);
      fillRect(ctx, 6, 6, 52, 6, gold);
      break;
    }
    case 'chair': {
      fillRect(ctx, 10, 8, 28, 26, indigo);
      fillRect(ctx, 12, 6, 24, 6, gold);
      fillRect(ctx, 10, 34, 6, 10, silver);
      fillRect(ctx, 32, 34, 6, 10, silver);
      break;
    }
    default:
      fillRect(ctx, 0, 0, width, height, '#ef4444');
  }

  const url = canvas.toDataURL();
  spriteCache[key] = url;
  return url;
};
