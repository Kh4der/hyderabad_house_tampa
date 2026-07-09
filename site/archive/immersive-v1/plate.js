/* ═══════════════════════════════════════════════════════════
   The Thali Wheel — a lazy susan of real HBH plates.
   Drag to spin: real angular momentum, friction, sector snap.
   The dish facing the text is live: name, price, add button,
   and the room's glow re-theme to it.
   ═══════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const DISHES = [
    {
      name: "Chicken Dam Biryani", slug: "chicken-dam-biryani",
      line: "Slow-steamed basmati, bone-in chicken, fried onion.",
      price: 16, img: "/assets/plates/plate-chicken-dam-biryani.webp",
      glow: "#E8912D",
    },
    {
      name: "Mutton Dam Biryani", slug: "mutton-dam-biryani",
      line: "Tender lamb under saffron rice, sealed and steamed.",
      price: 18, img: "/assets/plates/plate-mutton-mandi.webp",
      glow: "#D3B33C",
    },
    {
      name: "Chicken Karachi Biryani", slug: "chicken-karachi-biryani",
      line: "Fine basmati, a hotter masala, a Karachi temper.",
      price: 18, img: "/assets/plates/plate-karachi-biryani.webp",
      glow: "#E8712D",
    },
    {
      name: "Tandoori Chicken", slug: "tandoori-chicken",
      line: "Clay-oven chicken, charred edges, saffron rice.",
      price: 12, img: "/assets/plates/plate-tandoori-chicken.webp",
      glow: "#D9482B",
    },
    {
      name: "Fish Fry, Whole", slug: "fish-fry-whole",
      line: "A whole fish, spiced and fried golden.",
      price: 22, img: "/assets/plates/plate-fish-mandi.webp",
      glow: "#C98F3B",
    },
  ];
  const N = DISHES.length;
  const SECTOR = 360 / N;
  const FOCUS = 180; // plate at focus points left, toward the text

  const susan = document.getElementById("susan");
  const platesWrap = document.getElementById("susan-plates");
  const nameEl = document.getElementById("wheel-name");
  const lineEl = document.getElementById("wheel-line");
  const priceEl = document.getElementById("wheel-price");
  const addBtn = document.getElementById("wheel-add");
  const navEl = document.getElementById("wheel-nav");
  const hint = document.getElementById("susan-hint");
  const hero = document.querySelector(".hero");
  if (!susan) return;

  /* build plates + nav */
  DISHES.forEach((d, i) => {
    const holder = document.createElement("div");
    holder.className = "susan-plate";
    holder.innerHTML = `<img src="${d.img}" alt="${d.name}" draggable="false" />`;
    platesWrap.appendChild(holder);

    const li = document.createElement("li");
    const b = document.createElement("button");
    b.textContent = d.name;
    b.addEventListener("click", () => spinTo(i));
    li.appendChild(b);
    navEl.appendChild(li);
  });
  const plateEls = Array.from(platesWrap.children);
  const navBtns = Array.from(navEl.querySelectorAll("button"));

  /* state */
  let angle = 0;
  let velocity = 0;
  let dragging = false;
  let snapping = false;
  let active = -1;
  let lastPointerAngle = 0;
  let lastTime = 0;
  let hintShown = true;

  const center = () => {
    const r = susan.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };
  const pointerAngle = (e) => {
    const c = center();
    return (Math.atan2(e.clientY - c.y, e.clientX - c.x) * 180) / Math.PI;
  };
  const norm = (a) => ((a % 360) + 360) % 360;

  function render() {
    plateEls.forEach((el, i) => {
      const a = angle + i * SECTOR;
      el.style.transform = `rotate(${a}deg) translate(var(--susan-r)) rotate(${-a}deg)`;
      const d = Math.abs(((norm(a - FOCUS) + 180) % 360) - 180);
      const near = Math.max(0, 1 - d / SECTOR);
      el.style.scale = String(0.82 + near * 0.34);
      el.style.zIndex = String(10 + Math.round(near * 10));
      el.style.opacity = String(0.55 + near * 0.45);
    });
    const idx = activeIndex();
    if (idx !== active) setActive(idx);
  }

  function activeIndex() {
    let best = 0, bestD = 1e9;
    for (let i = 0; i < N; i++) {
      const a = norm(angle + i * SECTOR);
      const d = Math.abs(((a - FOCUS + 540) % 360) - 180);
      if (d < bestD) { bestD = d; best = i; }
    }
    return best;
  }

  function setActive(i) {
    active = i;
    const d = DISHES[i];
    if (!reduceMotion && window.gsap) {
      gsap.fromTo(nameEl, { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: "power3.out" });
      gsap.fromTo(lineEl, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, delay: 0.05, ease: "power3.out" });
    }
    nameEl.textContent = d.name;
    lineEl.textContent = d.line;
    priceEl.textContent = "$" + d.price.toFixed(2);
    addBtn.dataset.slug = d.slug;
    navBtns.forEach((b, j) => b.classList.toggle("is-on", j === i));
    hero.style.setProperty("--dish-glow", d.glow);
  }

  function spinTo(i) {
    const target = FOCUS - i * SECTOR;
    const delta = ((target - angle) % 360 + 540) % 360 - 180;
    if (reduceMotion || !window.gsap) { angle = target; render(); return; }
    snapping = true;
    velocity = 0;
    const proxy = { a: angle };
    gsap.to(proxy, {
      a: angle + delta,
      duration: 0.85,
      ease: "back.out(1.1)",
      onUpdate: () => { angle = proxy.a; render(); },
      onComplete: () => { snapping = false; },
    });
  }

  /* drag physics */
  susan.addEventListener("pointerdown", (e) => {
    dragging = true;
    snapping = false;
    velocity = 0;
    lastPointerAngle = pointerAngle(e);
    lastTime = performance.now();
    susan.setPointerCapture(e.pointerId);
    susan.classList.add("is-grabbing");
    if (hintShown) { hint.style.opacity = "0"; hintShown = false; }
  });
  susan.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const a = pointerAngle(e);
    let delta = a - lastPointerAngle;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    angle += delta;
    const now = performance.now();
    const dt = Math.max(8, now - lastTime);
    velocity = (delta / dt) * 16.7;
    lastPointerAngle = a;
    lastTime = now;
    render();
  });
  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    susan.classList.remove("is-grabbing");
    velocity = Math.max(-14, Math.min(14, velocity));
  };
  susan.addEventListener("pointerup", endDrag);
  susan.addEventListener("pointercancel", endDrag);

  /* keyboard access */
  susan.tabIndex = 0;
  susan.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); spinTo((active + 1) % N); }
    if (e.key === "ArrowLeft") { e.preventDefault(); spinTo((active - 1 + N) % N); }
  });

  /* physics loop: momentum → friction → spring-snap to sector */
  function tick() {
    if (!dragging && !snapping) {
      if (Math.abs(velocity) > 0.02) {
        angle += velocity;
        velocity *= 0.965;
        render();
      } else {
        const idx = activeIndex();
        const target = FOCUS - idx * SECTOR;
        const delta = ((target - angle) % 360 + 540) % 360 - 180;
        if (Math.abs(delta) > 0.05) {
          angle += delta * 0.085;
          render();
        }
      }
    }
    requestAnimationFrame(tick);
  }

  render();
  setActive(activeIndex());
  if (!reduceMotion) {
    velocity = 0.5; // gentle first spin so the table reads as spinnable
    requestAnimationFrame(tick);
  } else if (hint) {
    hint.style.display = "none";
  }

  /* add-to-order via the menu map main.js exposes */
  addBtn.addEventListener("click", () => {
    if (window.HBH && window.HBH.addBySlug) window.HBH.addBySlug(addBtn.dataset.slug);
  });
})();
