/* ═══════════════════════════════════════════════════════════
   Fire-spark logo reveal + ember bursts.
   The emblem's own pixels become the particle map: sparks ignite
   from the bottom up (fire rises), settle into the glowing mark,
   then the doors open. Runs once, on its own canvas, additive.
   ═══════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* pre-rendered glow sprite (radial gradient) for cheap additive draws */
  function makeSprite(size, inner, outer) {
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const g = c.getContext("2d").createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    g.addColorStop(0, inner);
    g.addColorStop(0.4, outer);
    g.addColorStop(1, "rgba(0,0,0,0)");
    const ctx = c.getContext("2d");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    return c;
  }
  const SPRITE_HOT = makeSprite(24, "rgba(255,244,214,1)", "rgba(233,196,85,0.55)");
  const SPRITE_EMBER = makeSprite(16, "rgba(233,196,85,0.95)", "rgba(196,140,30,0.4)");

  /* ── the door-logo tracer ── */
  window.HBHSparks = {
    /* draws the logo in sparks on `canvas`, sized to `box` px.
       resolves when the mark is fully lit */
    trace(canvas, box, imgSrc) {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          // sample opaque pixels into a point cloud
          const S = 148; // sample grid
          const off = document.createElement("canvas");
          off.width = off.height = S;
          const octx = off.getContext("2d", { willReadFrequently: true });
          const ar = img.height / img.width;
          octx.drawImage(img, 0, (S - S * ar) / 2, S, S * ar);
          const data = octx.getImageData(0, 0, S, S).data;
          const pts = [];
          for (let y = 0; y < S; y++) {
            for (let x = 0; x < S; x++) {
              const i = (y * S + x) * 4;
              if (data[i + 3] > 120) {
                pts.push({
                  x: (x + 0.5) / S, y: (y + 0.5) / S,
                  // fire rises: lower pixels ignite first, with shimmer
                  order: (1 - y / S) + Math.random() * 0.22,
                  phase: Math.random() * Math.PI * 2,
                  size: 0.7 + Math.random() * 0.8,
                });
              }
            }
          }
          pts.sort((a, b) => a.order - b.order);
          pts.forEach((p, i) => (p.t = i / pts.length));

          const dpr = Math.min(devicePixelRatio, 2);
          canvas.width = box * dpr;
          canvas.height = box * dpr;
          const ctx = canvas.getContext("2d");
          ctx.scale(dpr, dpr);

          // stray rising sparks that escape while tracing
          const strays = [];
          const DURATION = 1900; // trace time
          const HOLD = 420;      // full-mark glow before resolving
          const t0 = performance.now();
          let done = false;

          (function frame(now) {
            const el = now - t0;
            const progress = Math.min(1, el / DURATION);
            ctx.clearRect(0, 0, box, box);
            ctx.globalCompositeOperation = "lighter";

            for (const p of pts) {
              if (p.t > progress) break;
              const age = progress - p.t;
              const flick = 0.72 + 0.28 * Math.sin(now * 0.011 + p.phase);
              const px = p.x * box, py = p.y * box;
              if (age < 0.06) {
                // newborn spark: hot and slightly larger
                const s = 10 * p.size;
                ctx.globalAlpha = flick;
                ctx.drawImage(SPRITE_HOT, px - s/2, py - s/2, s, s);
                if (Math.random() < 0.05) {
                  strays.push({ x: px, y: py, vx: (Math.random()-0.5)*0.5,
                    vy: -0.6 - Math.random()*0.9, life: 1 });
                }
              } else {
                const s = 5.2 * p.size;
                ctx.globalAlpha = 0.55 * flick + 0.35;
                ctx.drawImage(SPRITE_EMBER, px - s/2, py - s/2, s, s);
              }
            }
            // strays drift up and die
            for (let i = strays.length - 1; i >= 0; i--) {
              const s = strays[i];
              s.x += s.vx; s.y += s.vy; s.vy *= 0.985; s.life -= 0.018;
              if (s.life <= 0) { strays.splice(i, 1); continue; }
              ctx.globalAlpha = s.life * 0.8;
              const sz = 4 + s.life * 4;
              ctx.drawImage(SPRITE_HOT, s.x - sz/2, s.y - sz/2, sz, sz);
            }
            ctx.globalAlpha = 1;

            if (progress >= 1 && !done) { done = true; setTimeout(resolve, HOLD); }
            if (el < DURATION + HOLD + 600) requestAnimationFrame(frame);
          })(t0);
        };
        img.onerror = resolve;
        img.src = imgSrc;
      });
    },

    /* small one-shot ember burst at (x, y) in viewport px */
    burst(x, y) {
      if (reduceMotion) return;
      const c = document.createElement("canvas");
      const R = 120;
      c.width = c.height = R * 2;
      c.style.cssText =
        `position:fixed;left:${x - R}px;top:${y - R}px;width:${R*2}px;height:${R*2}px;` +
        "pointer-events:none;z-index:220;";
      document.body.appendChild(c);
      const ctx = c.getContext("2d");
      ctx.globalCompositeOperation = "lighter";
      const parts = Array.from({ length: 14 }, () => {
        const a = Math.random() * Math.PI * 2;
        const v = 1.4 + Math.random() * 2.6;
        return { x: R, y: R, vx: Math.cos(a)*v, vy: Math.sin(a)*v - 1.2, life: 1 };
      });
      (function frame() {
        ctx.clearRect(0, 0, R*2, R*2);
        let alive = false;
        for (const p of parts) {
          p.x += p.vx; p.y += p.vy; p.vy += 0.07; p.life -= 0.035;
          if (p.life <= 0) continue;
          alive = true;
          ctx.globalAlpha = p.life;
          const s = 3 + p.life * 6;
          ctx.drawImage(p.life > 0.6 ? SPRITE_HOT : SPRITE_EMBER, p.x - s/2, p.y - s/2, s, s);
        }
        if (alive) requestAnimationFrame(frame);
        else c.remove();
      })();
    },
  };
})();
