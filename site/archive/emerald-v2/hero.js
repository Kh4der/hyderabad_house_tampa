/* ═══════════════════════════════════════════════════════════
   "Breaking the dum" — WebGL particle hero.
   A sealed handi (pot) built from ~11k glowing spice particles.
   Scrolling breaks the seal: particles rise into a steam vortex.
   Ember→saffron→cream palette lives only inside this canvas.
   ═══════════════════════════════════════════════════════════ */
import * as THREE from "three";

const canvas = document.getElementById("dum-canvas");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const COUNT = 5200;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 100);
camera.position.set(0, 1.1, 7.4);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
renderer.setClearColor(0x000000, 0);

/* ---------- particle targets ---------- */
// The handi: a lathe profile sampled into a point shell.
// radius profile r(t) for t 0..1 (base → lid knob)
function potRadius(t) {
  if (t < 0.08) return 1.15 * (t / 0.08) * 0.85 + 0.18;      // base curve up
  if (t < 0.55) return 1.15 + Math.sin((t - 0.08) / 0.47 * Math.PI) * 0.55; // belly
  if (t < 0.72) return 1.05 - (t - 0.55) * 2.4;               // shoulder into rim
  if (t < 0.80) return 0.72;                                  // rim / dough seal band
  if (t < 0.94) return 0.66 - (t - 0.80) * 2.2;               // lid dome
  return 0.16;                                                // knob
}
const POT_H = 2.6;

const potTarget = new Float32Array(COUNT * 3);
const plumeTarget = new Float32Array(COUNT * 3);
const seeds = new Float32Array(COUNT * 4);

for (let i = 0; i < COUNT; i++) {
  const t = Math.random();
  const a = Math.random() * Math.PI * 2;
  const r = potRadius(t) * (0.96 + Math.random() * 0.08);
  potTarget[i * 3]     = Math.cos(a) * r;
  potTarget[i * 3 + 1] = t * POT_H - POT_H * 0.62;
  potTarget[i * 3 + 2] = Math.sin(a) * r;

  // plume: helix column rising above, widening, with scatter
  const h = Math.random();
  const swirl = a + h * 6.0;
  const pr = 0.25 + h * 1.45 + Math.random() * 0.3;
  plumeTarget[i * 3]     = Math.cos(swirl) * pr;
  plumeTarget[i * 3 + 1] = h * 5.6 - 1.2;
  plumeTarget[i * 3 + 2] = Math.sin(swirl) * pr;

  seeds[i * 4]     = Math.random() * Math.PI * 2; // phase
  seeds[i * 4 + 1] = 0.5 + Math.random();         // speed
  seeds[i * 4 + 2] = Math.random();               // color mix
  seeds[i * 4 + 3] = 0.6 + Math.random() * 1.4;   // size
}

const geo = new THREE.BufferGeometry();
geo.setAttribute("position", new THREE.BufferAttribute(potTarget.slice(), 3));
geo.setAttribute("aPot", new THREE.BufferAttribute(potTarget, 3));
geo.setAttribute("aPlume", new THREE.BufferAttribute(plumeTarget, 3));
geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 4));

const uniforms = {
  uTime: { value: 0 },
  uOpen: { value: 0 },        // 0 sealed pot → 1 full steam vortex
  uPixelRatio: { value: Math.min(devicePixelRatio, 2) },
  uEmber: { value: new THREE.Color("#B98A1E") },
  uSaffron: { value: new THREE.Color("#D9B23C") },
  uCream: { value: new THREE.Color("#F6E9BE") },
};

const material = new THREE.ShaderMaterial({
  uniforms,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  vertexShader: /* glsl */ `
    attribute vec3 aPot;
    attribute vec3 aPlume;
    attribute vec4 aSeed;
    uniform float uTime;
    uniform float uOpen;
    uniform float uPixelRatio;
    varying float vMix;
    varying float vFade;

    void main() {
      // each particle departs the pot at its own moment: staggered release
      float release = smoothstep(aSeed.z * 0.7, aSeed.z * 0.7 + 0.3, uOpen);
      vec3 p = mix(aPot, aPlume, release);

      // breathing while sealed, turbulence while rising
      float t = uTime * aSeed.y;
      p.x += sin(t + aSeed.x) * mix(0.02, 0.22, release);
      p.z += cos(t * 0.9 + aSeed.x * 2.0) * mix(0.02, 0.22, release);
      p.y += sin(t * 0.6 + aSeed.x) * mix(0.015, 0.3, release);

      // slow rotation of the whole cloud
      float rot = uTime * 0.05 + release * 1.2;
      float cs = cos(rot), sn = sin(rot);
      p.xz = mat2(cs, -sn, sn, cs) * p.xz;

      vMix = aSeed.z;
      vFade = 1.0 - release * 0.35;

      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_Position = projectionMatrix * mv;
      gl_PointSize = aSeed.w * uPixelRatio * (26.0 / -mv.z) * mix(1.0, 1.6, release);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform vec3 uEmber;
    uniform vec3 uSaffron;
    uniform vec3 uCream;
    varying float vMix;
    varying float vFade;

    void main() {
      vec2 uv = gl_PointCoord - 0.5;
      float d = length(uv);
      float glow = smoothstep(0.5, 0.0, d);
      glow = pow(glow, 2.2);
      vec3 col = vMix < 0.5
        ? mix(uEmber, uSaffron, vMix * 2.0)
        : mix(uSaffron, uCream, (vMix - 0.5) * 2.0);
      gl_FragColor = vec4(col, glow * 0.45 * vFade);
    }
  `,
});

const points = new THREE.Points(geo, material);
scene.add(points);

/* faint coal glow under the pot */
const glowGeo = new THREE.CircleGeometry(1.55, 40);
const glowMat = new THREE.MeshBasicMaterial({
  color: new THREE.Color("#A9821E"),
  transparent: true, opacity: 0.16,
  blending: THREE.AdditiveBlending, depthWrite: false,
});
const glow = new THREE.Mesh(glowGeo, glowMat);
glow.rotation.x = -Math.PI / 2;
glow.position.y = -1.75;
scene.add(glow);

/* ---------- sizing ---------- */
function resize() {
  const w = canvas.clientWidth || innerWidth;
  const h = canvas.clientHeight || innerHeight;
  renderer.setSize(w, h, false);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  camera.aspect = w / h;
  // pull camera back on narrow screens so the pot fits
  camera.position.z = camera.aspect < 0.8 ? 10.5 : 7.4;
  camera.updateProjectionMatrix();
}
resize();
addEventListener("resize", resize);

/* ---------- interaction ---------- */
let mouseX = 0, mouseY = 0;
if (!reduceMotion) {
  addEventListener("pointermove", (e) => {
    mouseX = (e.clientX / innerWidth - 0.5) * 2;
    mouseY = (e.clientY / innerHeight - 0.5) * 2;
  }, { passive: true });
}

// ambient mode: the steam stays mostly released behind the thali wheel,
// breathing slightly with time instead of scroll
let openTarget = 0.85;

/* ---------- loop ---------- */
const clock = new THREE.Clock();
let raf = null;
function frame() {
  const t = clock.getElapsedTime();
  uniforms.uTime.value = t;
  openTarget = 0.8 + Math.sin(t * 0.18) * 0.12;
  uniforms.uOpen.value += (openTarget - uniforms.uOpen.value) * 0.02;

  camera.position.x += (mouseX * 0.55 - camera.position.x) * 0.04;
  camera.position.y += (1.1 - mouseY * 0.4 - camera.position.y) * 0.04;
  camera.lookAt(0, 0.2, 0);

  glowMat.opacity = (0.12 + Math.sin(t * 2.1) * 0.03) * (1 - uniforms.uOpen.value * 0.9);

  renderer.render(scene, camera);
  raf = requestAnimationFrame(frame);
}

// steam sits behind the wheel, pushed right where the susan lives
points.position.x = 1.6;
glow.position.x = 1.6;

if (reduceMotion) {
  // static faint steam, one render, no loop
  uniforms.uOpen.value = 0.6;
  renderer.render(scene, camera);
} else {
  // pause when hero is off screen
  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && raf === null) {
      clock.start();
      raf = requestAnimationFrame(frame);
    } else if (!entry.isIntersecting && raf !== null) {
      cancelAnimationFrame(raf);
      raf = null;
    }
  }, { threshold: 0 });
  io.observe(canvas);
}
