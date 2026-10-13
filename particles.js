// Home page particle field: slow drift, pushed away by the pointer, linked near it.
(() => {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const darkScheme = matchMedia('(prefers-color-scheme: dark)');

  const REACH = 140;      // pointer influence radius, CSS px
  const LINK = 110;       // max distance for a link line
  const PUSH = 0.9;       // pointer repel strength
  const FRICTION = 0.94;
  const DRIFT = 0.05;     // random wander per frame

  let w = 0, h = 0, dpr = 1;
  let particles = [];
  let colors = {};
  const pointer = { x: -1e4, y: -1e4, active: false };
  let frame = 0;

  function readColors() {
    const css = getComputedStyle(document.documentElement);
    colors = {
      accent: css.getPropertyValue('--accent').trim(),
      muted: css.getPropertyValue('--muted').trim(),
    };
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.round(Math.min(160, (w * h) / 9000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: 1 + Math.random() * 2,
      accent: Math.random() < 0.35,
    }));
    if (reduceMotion.matches) draw();
  }

  function step() {
    for (const p of particles) {
      const dx = p.x - pointer.x;
      const dy = p.y - pointer.y;
      const d2 = dx * dx + dy * dy;
      if (pointer.active && d2 < REACH * REACH && d2 > 0.01) {
        const d = Math.sqrt(d2);
        const f = (1 - d / REACH) * PUSH;
        p.vx += (dx / d) * f;
        p.vy += (dy / d) * f;
      }
      p.vx = (p.vx + (Math.random() - 0.5) * DRIFT) * FRICTION;
      p.vy = (p.vy + (Math.random() - 0.5) * DRIFT) * FRICTION;
      // keep a minimum idle drift so the field never freezes
      if (Math.abs(p.vx) + Math.abs(p.vy) < 0.15) {
        p.vx += (Math.random() - 0.5) * 0.1;
        p.vy += (Math.random() - 0.5) * 0.1;
      }
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10; else if (p.y > h + 10) p.y = -10;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    // links only between particles near the pointer
    if (pointer.active) {
      const near = particles.filter(p => {
        const dx = p.x - pointer.x, dy = p.y - pointer.y;
        return dx * dx + dy * dy < (REACH * 1.6) ** 2;
      });
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1;
      for (let i = 0; i < near.length; i++) {
        for (let j = i + 1; j < near.length; j++) {
          const a = near[i], b = near[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK) {
            ctx.globalAlpha = (1 - d / LINK) * 0.45;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
    }

    for (const p of particles) {
      ctx.globalAlpha = p.accent ? 0.8 : 0.45;
      ctx.fillStyle = p.accent ? colors.accent : colors.muted;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function loop() {
    step();
    draw();
    frame = requestAnimationFrame(loop);
  }

  function start() {
    cancelAnimationFrame(frame);
    if (reduceMotion.matches || document.hidden) { draw(); return; }
    frame = requestAnimationFrame(loop);
  }

  function setPointer(e) {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.active = true;
  }
  function clearPointer() {
    pointer.active = false;
    pointer.x = pointer.y = -1e4;
  }

  window.addEventListener('pointermove', setPointer, { passive: true });
  window.addEventListener('pointerdown', setPointer, { passive: true });
  window.addEventListener('pointerup', e => { if (e.pointerType !== 'mouse') clearPointer(); });
  document.addEventListener('pointerleave', clearPointer);
  window.addEventListener('blur', clearPointer);
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', start);
  reduceMotion.addEventListener('change', start);
  darkScheme.addEventListener('change', () => { readColors(); draw(); });

  readColors();
  resize();
  start();
})();
