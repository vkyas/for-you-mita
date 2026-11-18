/* ══════════════════════════════════════════════════════════════
   Ambient petals — a quiet field of falling rose petals,
   tiny sparkles, and a breath of floating hearts.
   ══════════════════════════════════════════════════════════════ */
export function createPetalField(canvas) {
  if (!canvas) return null;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(pointer: fine)');

  let W = window.innerWidth;
  let H = window.innerHeight;
  let DPR = Math.min(window.devicePixelRatio || 1, 2);
  let petals = [];
  let sparkles = [];
  let hearts = [];
  let burst = [];
  let raf = 0;
  let running = false;
  let lastTime = 0;
  let time = 0;

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const reduce = () => reduceQuery.matches;

  /* ── pre-rendered sprites (cheap on mobile) ──────────────── */
  function petalSprite(light, base, deep) {
    const S = 256;
    const c = document.createElement('canvas');
    c.width = S;
    c.height = S;
    const g = c.getContext('2d');
    g.translate(S / 2, S / 2);
    g.scale(2, 2);

    const fill = g.createLinearGradient(0, -58, 6, 58);
    fill.addColorStop(0, light);
    fill.addColorStop(0.48, base);
    fill.addColorStop(1, deep);

    g.beginPath();
    g.moveTo(0, -57);
    g.bezierCurveTo(40, -35, 51, 8, 23, 47);
    g.bezierCurveTo(11, 62, -10, 62, -22, 47);
    g.bezierCurveTo(-50, 8, -39, -35, 0, -57);
    g.closePath();
    g.fillStyle = fill;
    g.fill();

    g.strokeStyle = 'rgba(255, 246, 245, .32)';
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(-4, -45);
    g.bezierCurveTo(6, -18, 8, 16, -2, 46);
    g.stroke();

    g.strokeStyle = 'rgba(143, 67, 93, .12)';
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(0, -57);
    g.bezierCurveTo(40, -35, 51, 8, 23, 47);
    g.stroke();

    g.globalAlpha = 0.35;
    g.strokeStyle = '#FFFFFF';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(-18, -24);
    g.bezierCurveTo(-27, -2, -27, 20, -12, 37);
    g.stroke();
    return c;
  }

  function sparkSprite() {
    const S = 96;
    const c = document.createElement('canvas');
    c.width = S;
    c.height = S;
    const g = c.getContext('2d');
    g.translate(S / 2, S / 2);
    const glow = g.createRadialGradient(0, 0, 0, 0, 0, 44);
    glow.addColorStop(0, 'rgba(255, 251, 247, .95)');
    glow.addColorStop(0.25, 'rgba(255, 238, 240, .5)');
    glow.addColorStop(1, 'rgba(248, 200, 216, 0)');
    g.fillStyle = glow;
    g.beginPath();
    g.arc(0, 0, 44, 0, Math.PI * 2);
    g.fill();

    g.fillStyle = 'rgba(255, 253, 250, .95)';
    g.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const r = i % 2 === 0 ? 17 : 4.4;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.closePath();
    g.fill();
    return c;
  }

  function heartSprite() {
    const S = 96;
    const c = document.createElement('canvas');
    c.width = S;
    c.height = S;
    const g = c.getContext('2d');
    g.translate(S / 2, S / 2);
    g.scale(1.5, 1.5);
    g.strokeStyle = 'rgba(201, 138, 154, .85)';
    g.lineWidth = 1.4;
    g.beginPath();
    g.moveTo(0, 17);
    g.bezierCurveTo(-27, -1, -18, -21, -3, -13);
    g.bezierCurveTo(0, -11, 0, -11, 3, -13);
    g.bezierCurveTo(18, -21, 27, -1, 0, 17);
    g.stroke();
    return c;
  }

  const sprites = [
    petalSprite('#FDE6EC', '#F8C8D8', '#E7A8BE'),
    petalSprite('#F9CDD9', '#EF9FB6', '#C97691'),
    petalSprite('#FFF8F4', '#FBE5E3', '#EAC8C7')
  ];
  const spark = sparkSprite();
  const heart = heartSprite();

  /* ── field ───────────────────────────────────────────────── */
  function countForViewport() {
    return Math.min(24, Math.max(7, Math.round((W * H) / 68000)));
  }

  function makePetal(initial) {
    const size = 12 + Math.random() * 22;
    return {
      x: Math.random() * W,
      y: initial ? Math.random() * H : -size * 2 - Math.random() * H * 0.4,
      size,
      vy: 7 + Math.random() * 13,
      vx: (Math.random() - 0.5) * 5,
      sway: 4 + Math.random() * 11,
      swaySpeed: 0.25 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.7,
      alpha: 0.32 + Math.random() * 0.48,
      depth: 0.35 + Math.random() * 0.65,
      sprite: Math.floor(Math.random() * sprites.length),
      flip: Math.random() > 0.5 ? 1 : -1
    };
  }

  function initField() {
    const count = reduce() ? Math.min(8, countForViewport()) : countForViewport();
    petals = Array.from({ length: count }, () => makePetal(true));

    sparkles = Array.from({ length: Math.min(20, Math.round(count * 1.15)) }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      size: 1.6 + Math.random() * 3.2,
      phase: Math.random() * Math.PI * 2,
      speed: 0.35 + Math.random() * 0.8,
      depth: 0.3 + Math.random() * 0.7
    }));

    hearts = Array.from({ length: 3 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      size: 9 + Math.random() * 12,
      vy: 2 + Math.random() * 3,
      sway: 8 + Math.random() * 14,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.07 + Math.random() * 0.07
    }));
  }

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    initField();
    if (reduce()) draw(0);
  }

  /* ── drawing ─────────────────────────────────────────────── */
  function drawSprite(sprite, x, y, size, rotation, alpha, flip) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(flip || 1, 1);
    ctx.drawImage(sprite, -size / 2, -size / 2, size, size);
    ctx.restore();
  }

  function draw(dt) {
    ctx.clearRect(0, 0, W, H);
    const gentle = reduce();

    if (!gentle) {
      time += dt;
      pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * 2.2);
      pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * 2.2);
    }

    // far sparkles
    for (const s of sparkles) {
      const tw = gentle ? 0.55 : 0.25 + 0.45 * (0.5 + 0.5 * Math.sin(time * s.speed + s.phase));
      const px = s.x + pointer.x * s.depth * 9;
      const py = s.y + pointer.y * s.depth * 6;
      const size = s.size * (gentle ? 1 : 1 + 0.2 * Math.sin(time * s.speed + s.phase));
      ctx.save();
      ctx.globalAlpha = 0.3 * tw;
      ctx.drawImage(spark, px - size * 6, py - size * 6, size * 12, size * 12);
      ctx.restore();
    }

    // hearts drift upward, very quietly
    for (const h of hearts) {
      if (!gentle) {
        h.y -= h.vy * dt;
        h.x += Math.sin(time * 0.32 + h.phase) * h.sway * dt;
        if (h.y < -30) {
          h.y = H + 30;
          h.x = Math.random() * W;
        }
      }
      const px = h.x + pointer.x * 14;
      const py = h.y + pointer.y * 9;
      ctx.save();
      ctx.globalAlpha = h.alpha;
      ctx.translate(px, py);
      ctx.rotate(Math.sin(time * 0.25 + h.phase) * 0.16);
      ctx.drawImage(heart, -h.size / 2, -h.size / 2, h.size, h.size);
      ctx.restore();
    }

    // petals
    for (const p of petals) {
      if (!gentle) {
        p.y += p.vy * dt;
        p.x += (p.vx + Math.sin(p.phase + time * p.swaySpeed) * p.sway) * dt;
        p.rot += p.vr * dt;
        if (p.y > H + p.size) {
          const fresh = makePetal(false);
          Object.assign(p, fresh);
        }
        if (p.x < -70) p.x = W + 60;
        if (p.x > W + 70) p.x = -60;
      }
      const px = p.x + pointer.x * p.depth * 22;
      const py = p.y + pointer.y * p.depth * 15;
      const drift = Math.sin(time * p.swaySpeed + p.phase) * 0.08;
      drawSprite(sprites[p.sprite], px, py, p.size * 2.1, p.rot + drift, p.alpha, p.flip);
    }

    // celebration petals
    for (let i = burst.length - 1; i >= 0; i--) {
      const b = burst[i];
      b.life -= dt;
      if (b.life <= 0) {
        burst.splice(i, 1);
        continue;
      }
      b.vy += 34 * dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.rot += b.vr * dt;
      const fade = Math.min(1, b.life / 0.8);
      drawSprite(sprites[b.sprite], b.x, b.y, b.size * 2.1, b.rot, fade * 0.9, b.flip);
    }
  }

  /* ── animation loop ──────────────────────────────────────── */
  function frame(ts) {
    if (!running) return;
    const dt = lastTime ? Math.min(0.05, Math.max(0.001, (ts - lastTime) / 1000)) : 0.016;
    lastTime = ts;
    draw(dt);
    raf = window.requestAnimationFrame(frame);
  }

  function start() {
    if (running || reduce()) return;
    running = true;
    lastTime = 0;
    raf = window.requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    window.cancelAnimationFrame(raf);
  }

  const handleResize = () => {
    window.clearTimeout(resize._t);
    resize._t = window.setTimeout(resize, 140);
  };
  window.addEventListener('resize', handleResize);

  const handleVisibility = () => {
    if (document.hidden) stop();
    else start();
  };
  document.addEventListener('visibilitychange', handleVisibility);

  const handleMotionChange = () => {
    if (reduce()) {
      stop();
      draw(0);
    } else {
      start();
    }
  };

  const handlePointer = (e) => {
    pointer.tx = (e.clientX / W - 0.5) * 2;
    pointer.ty = (e.clientY / H - 0.5) * 2;
    document.body.classList.add('has-pointer');
    const glow = document.querySelector('.pointer-glow');
    if (glow) {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    }
  };
  if (finePointer.matches) {
    window.addEventListener('pointermove', handlePointer, { passive: true });
  }

  if (reduceQuery.addEventListener) {
    reduceQuery.addEventListener('change', handleMotionChange);
  }

  function celebrate(x, y) {
    if (reduce()) return;
    for (let i = 0; i < 16; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
      const speed = 40 + Math.random() * 120;
      burst.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 8 + Math.random() * 16,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 3,
        life: 1.8 + Math.random() * 1.2,
        sprite: Math.floor(Math.random() * sprites.length),
        flip: Math.random() > 0.5 ? 1 : -1
      });
    }
    start();
  }

  resize();
  if (reduce()) draw(0);
  else start();

  return {
    celebrate,
    destroy() {
      stop();
      window.clearTimeout(resize._t);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointer);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (reduceQuery.removeEventListener) {
        reduceQuery.removeEventListener('change', handleMotionChange);
      }
    }
  };
}
