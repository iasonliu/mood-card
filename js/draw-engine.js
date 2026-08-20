/* ─────────────────────────────────────────────────────────────
   MoodHand Procedural Hand-drawn Vector Stroke Engine
   ───────────────────────────────────────────────────────────── */

export function hashSeed(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^ (h >>> 16)) >>> 0;
}

export function mulberry32(a) {
  return function () {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const rngFrom = (str) => mulberry32(hashSeed(str));
export const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
export const jit = (rng, a) => (rng() - 0.5) * 2 * a;
export const lerp = (a, b, t) => a + (b - a) * t;

export function getComputedThemeColors() {
  const style = getComputedStyle(document.body);
  return {
    ink: style.getPropertyValue('--hw-ink').trim() || '#003E1F',
    accent: style.getPropertyValue('--hw-accent').trim() || '#53A548',
    accentInk: style.getPropertyValue('--hw-accent-ink').trim() || '#326E2A',
    paper: style.getPropertyValue('--hw-paper').trim() || '#FFFFFC',
  };
}

export function strokePts(ctx, rng, pts, o = {}) {
  const colors = getComputedThemeColors();
  const {
    w = 3.6,
    passes = 2,
    wob = 2.0,
    color = colors.ink,
    alpha = 0.94,
    close = false
  } = o;

  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (let p = 0; p < passes; p++) {
    ctx.globalAlpha = alpha * (p ? 0.48 : 1);
    ctx.lineWidth = Math.max(1.6, w * (0.86 + rng() * 0.28));

    const q = pts.map(pt => [pt[0] + jit(rng, wob), pt[1] + jit(rng, wob)]);
    ctx.beginPath();
    ctx.moveTo(q[0][0], q[0][1]);
    for (let i = 1; i < q.length; i++) {
      const a = q[i - 1], b = q[i];
      ctx.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
    }
    const last = q[q.length - 1];
    ctx.lineTo(last[0], last[1]);
    if (close) ctx.closePath();
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

export function ellipsePts(cx, cy, rx, ry, n = 18, a0 = 0, a1 = Math.PI * 2) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 + (a1 - a0) * i / n;
    pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  return pts;
}

export function polyFill(ctx, rng, pts, color, alpha = 1) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
}

export function blobFill(ctx, rng, cx, cy, rx, ry, color, alpha = 1) {
  const pts = ellipsePts(cx, cy, rx, ry, 16).map(p => [
    p[0] + jit(rng, rx * 0.06),
    p[1] + jit(rng, ry * 0.06)
  ]);
  polyFill(ctx, rng, pts, color, alpha);
}

export function line(ctx, rng, x0, y0, x1, y1, o = {}) {
  const pts = [];
  for (let i = 0; i <= 4; i++) pts.push([lerp(x0, x1, i / 4), lerp(y0, y1, i / 4)]);
  strokePts(ctx, rng, pts, o);
}

export function drawCloud(ctx, rng, x, y, r, colors) {
  const pts = ellipsePts(x, y, r * 0.45, r * 0.25, 12);
  polyFill(ctx, rng, pts, colors.paper);
  strokePts(ctx, rng, pts, { w: 1.8, close: true, color: colors.ink, alpha: 0.5 });
}

export function drawSpiralEye(ctx, rng, x, y, r, color) {
  const pts = [];
  const turns = 2.2;
  const segs = 20;
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const a = t * Math.PI * 2 * turns;
    const rr = r * t;
    pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]);
  }
  strokePts(ctx, rng, pts, { w: 2.2, color: color });
}

export function drawHeart(ctx, rng, x, y, size, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.3);
  ctx.bezierCurveTo(x, y - size * 0.5, x - size, y - size * 0.5, x - size, y + size * 0.3);
  ctx.bezierCurveTo(x - size, y + size * 0.8, x, y + size * 1.3, x, y + size * 1.5);
  ctx.bezierCurveTo(x, y + size * 1.3, x + size, y + size * 0.8, x + size, y + size * 0.3);
  ctx.bezierCurveTo(x + size, y - size * 0.5, x, y - size * 0.5, x, y + size * 0.3);
  ctx.fill();
}

export function drawHandDrawnStar(ctx, rng, x, y, r, colors) {
  const pts = [];
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4;
    const rad = i % 2 === 0 ? r : r * 0.45;
    pts.push([x + Math.cos(a) * rad, y + Math.sin(a) * rad]);
  }
  polyFill(ctx, rng, pts, '#f5d061');
  strokePts(ctx, rng, pts, { w: 1.8, close: true, color: colors.ink });
}
