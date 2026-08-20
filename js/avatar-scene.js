/* ─────────────────────────────────────────────────────────────
   MoodHand Avatar & Background Scene Renderer
   ───────────────────────────────────────────────────────────── */
import {
  rngFrom,
  jit,
  getComputedThemeColors,
  strokePts,
  ellipsePts,
  polyFill,
  blobFill,
  line,
  drawCloud,
  drawSpiralEye,
  drawHeart,
  drawHandDrawnStar
} from './draw-engine.js';
import { MOOD_DATABASE } from './config.js';

export const eggState = {
  isDizzy: false,
  isKoi: false,
  isHeart: false,
  specialKeyword: null
};

export function triggerEggBanner(text) {
  const eggBanner = document.getElementById('egg-banner');
  const eggBannerText = document.getElementById('egg-banner-text');
  if (!eggBanner || !eggBannerText) return;
  eggBannerText.textContent = text;
  eggBanner.classList.add('show');
  setTimeout(() => eggBanner.classList.remove('show'), 2800);
}

export function spawnSvgFx(type, count = 14) {
  const stageEl = document.getElementById('avatar-stage');
  if (!stageEl) return;
  const rect = stageEl.getBoundingClientRect();
  const startX = rect.left + rect.width / 2;
  const startY = rect.top + rect.height / 2;

  const SVG_SHAPES = {
    heart: `<svg viewBox="0 0 24 24" width="26" height="26" fill="#FF4757"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`,
    coin: `<svg viewBox="0 0 24 24" width="26" height="26" fill="#FFD700" stroke="#B87C14" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><text x="12" y="16" font-size="12" font-weight="bold" text-anchor="middle" fill="#B87C14">¥</text></svg>`,
    paw: `<svg viewBox="0 0 24 24" width="26" height="26" fill="#53A548"><ellipse cx="12" cy="15" rx="5" ry="4"/><circle cx="6.5" cy="9.5" r="2"/><circle cx="10" cy="7" r="2"/><circle cx="14" cy="7" r="2"/><circle cx="17.5" cy="9.5" r="2"/></svg>`,
    star: `<svg viewBox="0 0 24 24" width="26" height="26" fill="#FFD700" stroke="#B87C14" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    coffee: `<svg viewBox="0 0 24 24" width="26" height="26" fill="#8E6BB8" stroke="#3D261C" stroke-width="1.5"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/></svg>`
  };

  const template = SVG_SHAPES[type] || SVG_SHAPES.star;
  const fxOverlay = document.getElementById('fx-overlay');
  if (!fxOverlay) return;

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'fx-particle';
    el.innerHTML = template;

    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const dist1 = 25 + Math.random() * 40;
    const dist2 = 70 + Math.random() * 100;

    const dx1 = Math.cos(angle) * dist1;
    const dx2 = Math.cos(angle) * dist2;
    const rot1 = (Math.random() - 0.5) * 60 + 'deg';
    const rot2 = (Math.random() - 0.5) * 180 + 'deg';

    el.style.left = `${startX + (Math.random() - 0.5) * 30}px`;
    el.style.top = `${startY + (Math.random() - 0.5) * 30}px`;
    el.style.setProperty('--dx1', `${dx1}px`);
    el.style.setProperty('--dx2', `${dx2}px`);
    el.style.setProperty('--rot1', rot1);
    el.style.setProperty('--rot2', rot2);
    el.style.animationDelay = `${Math.random() * 0.12}s`;

    fxOverlay.appendChild(el);
    setTimeout(() => el.remove(), 1800);
  }
}

export function renderDoodleScene(canvas, seedStr, moodKey, animY = 0) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const rng = rngFrom(seedStr);
  const colors = getComputedThemeColors();
  const moodData = MOOD_DATABASE[moodKey] || MOOD_DATABASE.happy;

  // 1. 场景背景
  const sceneType = moodData.scene || 'nature';
  if (sceneType === 'bedroom') {
    const win = [[25, 30], [105, 30], [105, 110], [25, 110]];
    strokePts(ctx, rng, win, { w: 2.5, close: true, color: colors.ink, alpha: 0.6 });
    line(ctx, rng, 65, 30, 65, 110, { w: 1.8, color: colors.ink, alpha: 0.5 });
    line(ctx, rng, 25, 70, 105, 70, { w: 1.8, color: colors.ink, alpha: 0.5 });
    strokePts(ctx, rng, ellipsePts(78, 52, 11, 11, 10, 0.4, Math.PI * 1.5), { w: 2.2, color: '#E5A93B' });
    line(ctx, rng, W - 65, 120, W - 65, 70, { w: 2.5, color: colors.ink });
    const shade = [[W - 80, 70], [W - 50, 70], [W - 58, 48], [W - 72, 48]];
    polyFill(ctx, rng, shade, colors.accent, 0.35);
    strokePts(ctx, rng, shade, { w: 2.2, close: true, color: colors.ink });
  } else if (sceneType === 'coffeeshop') {
    line(ctx, rng, 15, 75, 115, 75, { w: 2.5, color: colors.ink });
    const pot = [[28, 75], [52, 75], [48, 100], [32, 100]];
    polyFill(ctx, rng, pot, colors.paper);
    strokePts(ctx, rng, pot, { w: 2, close: true, color: colors.ink });
    line(ctx, rng, 40, 75, 30, 58, { w: 2.2, color: colors.accent });
    line(ctx, rng, 40, 75, 50, 56, { w: 2.2, color: colors.accent });
    line(ctx, rng, 40, 75, 40, 50, { w: 2.2, color: colors.accent });
    const frame = [[W - 95, 30], [W - 35, 30], [W - 35, 85], [W - 95, 85]];
    strokePts(ctx, rng, frame, { w: 2.2, close: true, color: colors.ink, alpha: 0.6 });
    line(ctx, rng, W - 80, 58, W - 50, 58, { w: 1.8, color: colors.accent });
  } else if (sceneType === 'workdesk') {
    line(ctx, rng, 25, H - 75, W - 25, H - 75, { w: 2.5, color: colors.ink, alpha: 0.7 });
    const laptop = [[40, H - 75], [95, H - 75], [90, H - 115], [45, H - 115]];
    polyFill(ctx, rng, laptop, colors.accent, 0.25);
    strokePts(ctx, rng, laptop, { w: 2.2, close: true, color: colors.ink });
    line(ctx, rng, 32, H - 75, 102, H - 75, { w: 2.5, color: colors.ink });
    const book1 = [[W - 80, H - 75], [W - 35, H - 75], [W - 35, H - 87], [W - 80, H - 87]];
    strokePts(ctx, rng, book1, { w: 1.8, close: true, color: colors.ink });
  } else if (sceneType === 'rooftop') {
    drawHandDrawnStar(ctx, rng, 45, 38, 10, colors);
    drawHandDrawnStar(ctx, rng, W - 60, 42, 11, colors);
    drawCloud(ctx, rng, 40, 95, 45, colors);
    drawCloud(ctx, rng, W - 80, 100, 50, colors);
  } else {
    strokePts(ctx, rng, ellipsePts(48, 48, 18, 18, 12), { w: 2.5, close: true, color: '#E5A93B' });
    for (let a = 0; a < Math.PI * 2; a += 0.8) {
      line(ctx, rng, 48 + Math.cos(a) * 22, 48 + Math.sin(a) * 22, 48 + Math.cos(a) * 29, 48 + Math.sin(a) * 29, { w: 1.8, color: '#E5A93B' });
    }
    drawCloud(ctx, rng, W - 75, 55, 55, colors);
  }

  // 2. 主体小人
  const cx = W / 2;
  const cy = H / 2 + 5 + animY;
  const scale = 1.25;

  strokePts(ctx, rng, [
    [cx - 75 * scale, cy + 95],
    [cx - 15, cy + 97],
    [cx + 25, cy + 94],
    [cx + 75 * scale, cy + 96]
  ], { w: 3, wob: 2.0, color: colors.ink, alpha: 0.35 });

  const bodyW = (54 + jit(rng, 5)) * scale;
  const bodyH = (60 + jit(rng, 5)) * scale;
  const bodyTop = cy + 2;
  const outfitStyle = Math.floor(rng() * 4);

  const bodyPts = [
    [cx - bodyW * 0.72, bodyTop],
    [cx + bodyW * 0.72, bodyTop],
    [cx + bodyW * 0.92, bodyTop + bodyH],
    [cx - bodyW * 0.92, bodyTop + bodyH]
  ];

  polyFill(ctx, rng, bodyPts, colors.paper);
  polyFill(ctx, rng, bodyPts, colors.accent, eggState.isKoi ? 0.45 : 0.24);
  strokePts(ctx, rng, bodyPts, { w: 3.5, close: true, color: colors.ink });

  if (eggState.isKoi) {
    for (let y = bodyTop + 18; y < bodyTop + bodyH - 8; y += 15) {
      strokePts(ctx, rng, ellipsePts(cx, y, 16, 8, 6, 0, Math.PI), { w: 2.2, color: '#B87C14' });
    }
  } else if (outfitStyle === 0) {
    for (let y = bodyTop + 18; y < bodyTop + bodyH - 6; y += 18) {
      line(ctx, rng, cx - bodyW * 0.75, y, cx + bodyW * 0.75, y, { w: 2.2, color: colors.ink, alpha: 0.5 });
    }
  } else if (outfitStyle === 1) {
    line(ctx, rng, cx - 18, bodyTop, cx - 18, bodyTop + 32, { w: 2.8, color: colors.ink });
    line(ctx, rng, cx + 18, bodyTop, cx + 18, bodyTop + 32, { w: 2.8, color: colors.ink });
    const pocket = [
      [cx - 13, bodyTop + 30],
      [cx + 13, bodyTop + 30],
      [cx + 13, bodyTop + 50],
      [cx - 13, bodyTop + 50]
    ];
    polyFill(ctx, rng, pocket, colors.accent, 0.4);
    strokePts(ctx, rng, pocket, { w: 2.2, close: true, color: colors.ink });
  } else if (outfitStyle === 2) {
    strokePts(ctx, rng, [[cx - 8, bodyTop + 5], [cx + 8, bodyTop + 5], [cx, bodyTop + 13]], { w: 2.2, close: true, color: colors.ink });
    strokePts(ctx, rng, [[cx - 5, bodyTop + 13], [cx + 5, bodyTop + 13], [cx, bodyTop + 34]], { w: 2.2, close: true, color: colors.ink });
  } else {
    const pouch = [
      [cx - 22, bodyTop + 34],
      [cx + 22, bodyTop + 34],
      [cx + 18, bodyTop + 58],
      [cx - 18, bodyTop + 58]
    ];
    strokePts(ctx, rng, pouch, { w: 2.2, close: true, color: colors.ink });
  }

  // 腿与鞋
  const legY0 = bodyTop + bodyH;
  const legY1 = legY0 + 36;
  line(ctx, rng, cx - 24, legY0, cx - 27, legY1, { w: 3.8, color: colors.ink });
  blobFill(ctx, rng, cx - 35, legY1 + 4, 12, 7, colors.ink);
  line(ctx, rng, cx + 24, legY0, cx + 27, legY1, { w: 3.8, color: colors.ink });
  blobFill(ctx, rng, cx + 37, legY1 + 4, 12, 7, colors.ink);

  // 手臂
  const shoulderY = bodyTop + 10;

  if (eggState.specialKeyword === 'cat') {
    line(ctx, rng, cx - bodyW * 0.68, shoulderY, cx - 16, shoulderY + 32, { w: 3.5, color: colors.ink });
    line(ctx, rng, cx + bodyW * 0.68, shoulderY, cx + 16, shoulderY + 32, { w: 3.5, color: colors.ink });
    blobFill(ctx, rng, cx, shoulderY + 28, 16, 13, colors.accent, 0.75);
    strokePts(ctx, rng, ellipsePts(cx, shoulderY + 28, 16, 13, 12), { w: 2.5, close: true, color: colors.ink });
    polyFill(ctx, rng, [[cx - 12, shoulderY + 18], [cx - 6, shoulderY + 18], [cx - 10, shoulderY + 8]], colors.ink);
    polyFill(ctx, rng, [[cx + 12, shoulderY + 18], [cx + 6, shoulderY + 18], [cx + 10, shoulderY + 8]], colors.ink);
  } else if (eggState.specialKeyword === 'money' || eggState.isKoi) {
    line(ctx, rng, cx - bodyW * 0.68, shoulderY, cx - bodyW * 1.1, shoulderY - 28, { w: 3.5, color: colors.ink });
    line(ctx, rng, cx + bodyW * 0.68, shoulderY, cx + bodyW * 1.1, shoulderY - 28, { w: 3.5, color: colors.ink });
    drawHandDrawnStar(ctx, rng, cx + bodyW * 1.16, shoulderY - 42, 15, colors);
    line(ctx, rng, cx + bodyW * 1.1, shoulderY - 24, cx + bodyW * 1.16, shoulderY - 42, { w: 3, color: '#B87C14' });
  } else if (moodKey === 'happy') {
    line(ctx, rng, cx - bodyW * 0.68, shoulderY, cx - bodyW * 1.15, shoulderY - 36, { w: 3.5, color: colors.ink });
    line(ctx, rng, cx + bodyW * 0.68, shoulderY, cx + bodyW * 1.15, shoulderY - 36, { w: 3.5, color: colors.ink });
    const bx = cx + bodyW * 1.22, by = shoulderY - 65;
    line(ctx, rng, cx + bodyW * 1.15, shoulderY - 36, bx, by + 18, { w: 1.8, color: colors.ink });
    blobFill(ctx, rng, bx, by, 16, 20, colors.accent, 0.85);
    strokePts(ctx, rng, ellipsePts(bx, by, 16, 20, 14), { w: 2.4, close: true, color: colors.ink });
  } else if (moodKey === 'chill' || eggState.specialKeyword === 'coffee') {
    line(ctx, rng, cx - bodyW * 0.68, shoulderY, cx - bodyW * 0.95, shoulderY + 22, { w: 3.5, color: colors.ink });
    line(ctx, rng, cx - bodyW * 0.95, shoulderY + 22, cx - bodyW * 0.65, shoulderY + 42, { w: 3.5, color: colors.ink });
    line(ctx, rng, cx + bodyW * 0.68, shoulderY, cx + bodyW * 1.05, shoulderY + 18, { w: 3.5, color: colors.ink });
    const mx = cx + bodyW * 1.15, my = shoulderY + 18;
    const cup = [[mx - 7, my - 6], [mx + 7, my - 6], [mx + 5, my + 8], [mx - 5, my + 8]];
    polyFill(ctx, rng, cup, colors.paper);
    strokePts(ctx, rng, cup, { w: 2.2, close: true, color: colors.ink });
    line(ctx, rng, mx - 2, my - 8, mx - 2, my - 15, { w: 1.8, color: colors.accent });
    line(ctx, rng, mx + 2, my - 8, mx + 2, my - 15, { w: 1.8, color: colors.accent });
  } else if (moodKey === 'curious') {
    line(ctx, rng, cx - bodyW * 0.68, shoulderY, cx - bodyW * 0.85, shoulderY + 26, { w: 3.5, color: colors.ink });
    line(ctx, rng, cx - bodyW * 0.85, shoulderY + 26, cx - 12, shoulderY - 6, { w: 3.5, color: colors.ink });
    const lx = cx + bodyW * 0.95, ly = shoulderY + 10;
    line(ctx, rng, cx + bodyW * 0.68, shoulderY, lx, ly, { w: 3.5, color: colors.ink });
    strokePts(ctx, rng, ellipsePts(lx + 8, ly - 8, 11, 11, 12), { w: 2.4, close: true, color: colors.accent });
    line(ctx, rng, lx + 15, ly, lx + 23, ly + 8, { w: 3, color: colors.ink });
  } else if (moodKey === 'cozy') {
    line(ctx, rng, cx - bodyW * 0.68, shoulderY, cx - 13, shoulderY + 28, { w: 3.5, color: colors.ink });
    line(ctx, rng, cx + bodyW * 0.68, shoulderY, cx + 13, shoulderY + 28, { w: 3.5, color: colors.ink });
    blobFill(ctx, rng, cx, shoulderY + 26, 18, 12, colors.accent, 0.4);
    strokePts(ctx, rng, ellipsePts(cx, shoulderY + 26, 18, 12, 12), { w: 2.2, close: true, color: colors.ink });
  } else {
    line(ctx, rng, cx - bodyW * 0.68, shoulderY, cx - bodyW * 0.9, shoulderY + 36, { w: 3.5, color: colors.ink });
    line(ctx, rng, cx + bodyW * 0.68, shoulderY, cx + bodyW * 0.9, shoulderY + 36, { w: 3.5, color: colors.ink });
  }

  // 头部
  const headR = (42 + jit(rng, 3)) * scale;
  const headCY = cy - 56;
  blobFill(ctx, rng, cx, headCY, headR, headR * 0.96, colors.paper);
  strokePts(ctx, rng, ellipsePts(cx, headCY, headR, headR * 0.96, 16), { w: 3.6, close: true, color: colors.ink });

  blobFill(ctx, rng, cx - headR * 0.58, headCY + 14, 11, 7, '#f59e9e', 0.55);
  blobFill(ctx, rng, cx + headR * 0.58, headCY + 14, 11, 7, '#f59e9e', 0.55);

  // 发型
  const hairStyle = Math.floor(rng() * 7);
  if (eggState.specialKeyword === 'cat') {
    const earL = [[cx - headR * 0.7, headCY - headR * 0.6], [cx - headR * 0.3, headCY - headR * 0.9], [cx - headR * 0.8, headCY - headR * 1.15]];
    const earR = [[cx + headR * 0.7, headCY - headR * 0.6], [cx + headR * 0.3, headCY - headR * 0.9], [cx + headR * 0.8, headCY - headR * 1.15]];
    polyFill(ctx, rng, earL, colors.accent, 0.6);
    strokePts(ctx, rng, earL, { w: 3, close: true, color: colors.ink });
    polyFill(ctx, rng, earR, colors.accent, 0.6);
    strokePts(ctx, rng, earR, { w: 3, close: true, color: colors.ink });
  } else if (eggState.isKoi) {
    const crown = [
      [cx - 22, headCY - headR + 3],
      [cx + 22, headCY - headR + 3],
      [cx + 24, headCY - headR - 20],
      [cx + 11, headCY - headR - 9],
      [cx, headCY - headR - 24],
      [cx - 11, headCY - headR - 9],
      [cx - 24, headCY - headR - 20]
    ];
    polyFill(ctx, rng, crown, '#FFD700');
    strokePts(ctx, rng, crown, { w: 2.8, close: true, color: '#B87C14' });
  } else if (hairStyle === 0) {
    line(ctx, rng, cx, headCY - headR, cx - 11, headCY - headR - 26, { w: 3.5, color: colors.ink });
    line(ctx, rng, cx + 4, headCY - headR, cx + 15, headCY - headR - 22, { w: 3, color: colors.ink });
    blobFill(ctx, rng, cx - 13, headCY - headR - 26, 5, 4, colors.accent);
  } else if (hairStyle === 1) {
    const hairPts = ellipsePts(cx, headCY, headR * 1.04, headR * 1.04, 14, Math.PI * 0.88, Math.PI * 2.12);
    strokePts(ctx, rng, hairPts, { w: 4.8, color: colors.ink });
  } else if (hairStyle === 2) {
    for (let angle = Math.PI * 0.78; angle <= Math.PI * 2.22; angle += 0.28) {
      const hx = cx + Math.cos(angle) * (headR + 7);
      const hy = headCY + Math.sin(angle) * (headR + 7);
      blobFill(ctx, rng, hx, hy, 12, 12, colors.ink, 0.88);
    }
  } else if (hairStyle === 3) {
    const hatPts = [
      [cx - headR * 0.9, headCY - headR * 0.45],
      [cx + headR * 0.9, headCY - headR * 0.75],
      [cx + headR * 0.45, headCY - headR * 1.25],
      [cx - headR * 0.65, headCY - headR * 1.05]
    ];
    polyFill(ctx, rng, hatPts, colors.accent);
    strokePts(ctx, rng, hatPts, { w: 3, close: true, color: colors.ink });
    blobFill(ctx, rng, cx, headCY - headR * 1.2, 7, 7, colors.paper);
    strokePts(ctx, rng, ellipsePts(cx, headCY - headR * 1.2, 7, 7), { w: 2, close: true, color: colors.ink });
  } else if (hairStyle === 4) {
    blobFill(ctx, rng, cx - headR * 0.8, headCY - headR * 0.7, 13, 13, colors.ink, 0.88);
    blobFill(ctx, rng, cx + headR * 0.8, headCY - headR * 0.7, 13, 13, colors.ink, 0.88);
  } else if (hairStyle === 5) {
    const headBand = ellipsePts(cx, headCY, headR * 1.15, headR * 1.15, 12, Math.PI * 1.1, Math.PI * 1.9);
    strokePts(ctx, rng, headBand, { w: 3.8, color: colors.ink });
    blobFill(ctx, rng, cx - headR * 1.05, headCY + 2, 11, 16, colors.accent);
    strokePts(ctx, rng, ellipsePts(cx - headR * 1.05, headCY + 2, 11, 16, 8), { w: 2.2, close: true, color: colors.ink });
    blobFill(ctx, rng, cx + headR * 1.05, headCY + 2, 11, 16, colors.accent);
    strokePts(ctx, rng, ellipsePts(cx + headR * 1.05, headCY + 2, 11, 16, 8), { w: 2.2, close: true, color: colors.ink });
  } else {
    const knitCap = ellipsePts(cx, headCY - headR * 0.3, headR * 1.08, headR * 0.9, 14, Math.PI * 1.0, Math.PI * 2.0);
    polyFill(ctx, rng, knitCap, colors.accent);
    strokePts(ctx, rng, knitCap, { w: 3.2, color: colors.ink });
    blobFill(ctx, rng, cx, headCY - headR * 1.25, 8, 8, colors.paper);
    strokePts(ctx, rng, ellipsePts(cx, headCY - headR * 1.25, 8, 8), { w: 2, close: true, color: colors.ink });
  }

  // 眼睛与神态
  const eyeSpan = (15 + jit(rng, 2)) * scale;
  const eyeY = headCY + 2;

  if (eggState.isDizzy) {
    drawSpiralEye(ctx, rng, cx - eyeSpan, eyeY, 10, colors.ink);
    drawSpiralEye(ctx, rng, cx + eyeSpan, eyeY, 10, colors.ink);
    strokePts(ctx, rng, ellipsePts(cx, eyeY + 14, 10, 7, 8, 0, Math.PI), { w: 2.6, color: colors.ink });
    blobFill(ctx, rng, cx, eyeY + 20, 6, 8, '#ff6b6b');
    drawHandDrawnStar(ctx, rng, cx - 18, headCY - headR - 16, 9, colors);
    drawHandDrawnStar(ctx, rng, cx + 18, headCY - headR - 20, 10, colors);
  } else if (eggState.isHeart) {
    drawHeart(ctx, rng, cx - eyeSpan, eyeY, 10, '#ff4757');
    drawHeart(ctx, rng, cx + eyeSpan, eyeY, 10, '#ff4757');
    strokePts(ctx, rng, ellipsePts(cx, eyeY + 14, 11, 8, 6, 0.2, Math.PI - 0.2), { w: 2.8, color: colors.ink });
  } else if (moodKey === 'happy') {
    strokePts(ctx, rng, ellipsePts(cx - eyeSpan, eyeY, 10, 8, 6, Math.PI + 0.3, Math.PI * 2 - 0.3), { w: 3.2, color: colors.ink });
    strokePts(ctx, rng, ellipsePts(cx + eyeSpan, eyeY, 10, 8, 6, Math.PI + 0.3, Math.PI * 2 - 0.3), { w: 3.2, color: colors.ink });
    strokePts(ctx, rng, ellipsePts(cx, eyeY + 14, 12, 9, 8, 0.2, Math.PI - 0.2), { w: 2.8, close: true, color: colors.ink });
    blobFill(ctx, rng, cx, eyeY + 17, 8, 5, '#e06d6d');
  } else if (moodKey === 'tired') {
    line(ctx, rng, cx - eyeSpan - 9, eyeY, cx - eyeSpan + 9, eyeY, { w: 3.5, color: colors.ink });
    line(ctx, rng, cx + eyeSpan - 9, eyeY, cx + eyeSpan + 9, eyeY, { w: 3.5, color: colors.ink });
    line(ctx, rng, cx - 9, eyeY + 19, cx + 9, eyeY + 17, { w: 2.6, color: colors.ink });
  } else if (moodKey === 'rage') {
    line(ctx, rng, cx - eyeSpan - 9, eyeY - 5, cx - eyeSpan + 7, eyeY + 2, { w: 3.5, color: colors.ink });
    line(ctx, rng, cx + eyeSpan + 9, eyeY - 5, cx + eyeSpan - 7, eyeY + 2, { w: 3.5, color: colors.ink });
    const zx = cx - 10, zy = eyeY + 19;
    strokePts(ctx, rng, [[zx, zy], [zx+5, zy-3], [zx+10, zy+3], [zx+15, zy-3], [zx+20, zy]], { w: 2.6, color: colors.ink });
  } else if (moodKey === 'cozy') {
    strokePts(ctx, rng, ellipsePts(cx - eyeSpan, eyeY + 2, 9, 6, 6, 0.3, Math.PI - 0.3), { w: 2.8, color: colors.ink });
    strokePts(ctx, rng, ellipsePts(cx + eyeSpan, eyeY + 2, 9, 6, 6, 0.3, Math.PI - 0.3), { w: 2.8, color: colors.ink });
    strokePts(ctx, rng, ellipsePts(cx, eyeY + 14, 7, 4, 6, 0.3, Math.PI - 0.3), { w: 2.2, color: colors.ink });
  } else {
    blobFill(ctx, rng, cx - eyeSpan, eyeY, 6, 6, colors.ink);
    blobFill(ctx, rng, cx - eyeSpan - 2, eyeY - 2, 2, 2, '#fff');
    blobFill(ctx, rng, cx + eyeSpan, eyeY, 6, 6, colors.ink);
    blobFill(ctx, rng, cx + eyeSpan - 2, eyeY - 2, 2, 2, '#fff');
    strokePts(ctx, rng, ellipsePts(cx, eyeY + 14, 9, 6, 6, 0.3, Math.PI - 0.3), { w: 2.6, color: colors.ink });
  }

  // 3. 宠物伴侣 (卡皮巴拉/猫/狗)
  const petType = eggState.specialKeyword === 'cat' ? 'cat' : (moodData.pet || 'capybara');
  const petX = cx + 88;
  const petY = cy + 72;

  if (petType === 'capybara') {
    const capy = [[petX - 20, petY], [petX + 20, petY], [petX + 18, petY + 22], [petX - 18, petY + 22]];
    polyFill(ctx, rng, capy, '#A07855', 0.85);
    strokePts(ctx, rng, capy, { w: 2.4, close: true, color: colors.ink });
    blobFill(ctx, rng, petX - 8, petY + 6, 2.5, 2.5, colors.ink);
    blobFill(ctx, rng, petX, petY - 5, 5, 5, '#FF9800');
    strokePts(ctx, rng, ellipsePts(petX, petY - 5, 5, 5, 8), { w: 1.5, close: true, color: colors.ink });
    line(ctx, rng, petX, petY - 10, petX + 2, petY - 13, { w: 1.2, color: '#4CAF50' });
  } else if (petType === 'cat') {
    blobFill(ctx, rng, petX, petY + 8, 14, 11, colors.accent, 0.65);
    strokePts(ctx, rng, ellipsePts(petX, petY + 8, 14, 11, 10), { w: 2, close: true, color: colors.ink });
    polyFill(ctx, rng, [[petX - 10, petY], [petX - 4, petY], [petX - 8, petY - 6]], colors.ink);
    polyFill(ctx, rng, [[petX + 4, petY], [petX + 10, petY], [petX + 8, petY - 6]], colors.ink);
    line(ctx, rng, petX + 14, petY + 8, petX + 22, petY + 1, { w: 2, color: colors.ink });
  } else if (petType === 'dog') {
    blobFill(ctx, rng, petX, petY + 7, 13, 11, '#D7995B', 0.75);
    strokePts(ctx, rng, ellipsePts(petX, petY + 7, 13, 11, 10), { w: 2, close: true, color: colors.ink });
    blobFill(ctx, rng, petX - 6, petY + 5, 2, 2, colors.ink);
    blobFill(ctx, rng, petX + 6, petY + 5, 2, 2, colors.ink);
    line(ctx, rng, petX + 11, petY + 3, petX + 18, petY - 2, { w: 2.2, color: colors.ink });
  }
}
