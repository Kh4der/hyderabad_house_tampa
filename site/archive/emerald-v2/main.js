/* Hyderabad Biryani House — interactions, menu, cart, checkout */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const money = (n) => "$" + n.toFixed(2);

  /* ── the doors open ── */
  const doors = $("#doors");
  if (doors) {
    const open = () => {
      doors.classList.add("is-open");
      setTimeout(() => doors.classList.add("is-gone"), reduceMotion ? 450 : 1250);
    };
    if (sessionStorage.getItem("hbh-doors-seen")) {
      setTimeout(open, 250);
    } else {
      sessionStorage.setItem("hbh-doors-seen", "1");
      setTimeout(open, 950);
    }
  }

  /* ── nav scrolled state (GSAP-driven, no scroll listener) ── */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    // browser scroll-restoration into a pinned zone corrupts trigger
    // measurements (negative starts). take scroll memory manual and
    // re-measure once everything (images, fonts, videos) has loaded.
    ScrollTrigger.clearScrollMemory("manual");
    window.addEventListener("load", () => ScrollTrigger.refresh());

    /* Lenis inertial smoothing, driven by GSAP's ticker so scroll,
       pins, and scrubs all share one clock */
    if (window.Lenis && !reduceMotion) {
      document.documentElement.style.scrollBehavior = "auto"; // no double-easing
      const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1.0 });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
      window.__lenis = lenis;
      // route anchor clicks through lenis for eased travel
      document.addEventListener("click", (e) => {
        const a = e.target.closest('a[href^="#"]');
        if (!a) return;
        const target = document.querySelector(a.getAttribute("href"));
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: -76, duration: 1.1 });
      });
    }
    ScrollTrigger.create({
      start: 10,
      onUpdate: (self) => $("#nav").classList.toggle("is-scrolled", self.scroll() > 10),
    });
  }

  /* ── ritual: pinned 3-step sequence scrubbing one film ── */
  const steps = $$(".ritual-step");
  const ritualVideo = $("#ritual-video");
  if (window.gsap && !reduceMotion && steps.length) {
    const setStep = (i) => steps.forEach((s, j) => s.classList.toggle("is-active", i === j));
    let vDur = 0;
    if (ritualVideo) {
      ritualVideo.addEventListener("loadedmetadata", () => { vDur = ritualVideo.duration; });
      ritualVideo.load();
    }
    // smoothed scrub: seeks are lerped AND rate-limited (max ~15 seeks/s).
    // every currentTime set forces a decode from the last keyframe, so
    // unthrottled seeking is what makes scroll drop frames
    let seekTarget = 0;
    let seekRaf = null;
    let lastSeekAt = 0;
    const seekLoop = () => {
      seekRaf = null;
      if (!vDur) return;
      const cur = ritualVideo.currentTime;
      const now = performance.now();
      if (Math.abs(seekTarget - cur) > 0.06) {
        if (now - lastSeekAt > 66) {
          ritualVideo.currentTime = cur + (seekTarget - cur) * 0.5;
          lastSeekAt = now;
        }
        seekRaf = requestAnimationFrame(seekLoop);
      }
    };
    ScrollTrigger.create({
      trigger: ".ritual",
      start: "top top",
      end: "+=2600",
      pin: ".ritual-pin",
      scrub: 0.7,
      anticipatePin: 1,
      onUpdate: (self) => {
        const p = self.progress;
        gsap.set("#ritual-bar", { scaleX: p }); // transform: no layout cost
        setStep(Math.min(2, Math.floor(p * 3)));
        if (ritualVideo && vDur) {
          seekTarget = Math.min(vDur - 0.05, p * vDur);
          if (!seekRaf) seekRaf = requestAnimationFrame(seekLoop);
        }
      },
    });
  } else {
    // reduced motion / no GSAP: stacked steps, film plays gently on view
    steps.forEach((s) => {
      s.classList.add("is-active");
      s.style.position = "relative";
      s.style.gridArea = "auto";
      s.style.marginBottom = "36px";
    });
    const bar = $("#ritual-bar");
    if (bar) bar.parentElement.style.display = "none";
    if (ritualVideo && !reduceMotion) {
      const io = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) { ritualVideo.loop = true; ritualVideo.play().catch(() => {}); io.disconnect(); }
      }, { threshold: 0.4 });
      io.observe(ritualVideo);
    }
  }

  /* ── story ambience: tandoor flames behind the story, only while visible ── */
  const storyBg = $("#story-bg");
  if (storyBg && !reduceMotion) {
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) storyBg.play().catch(() => {});
      else storyBg.pause();
    }, { threshold: 0.15 });
    io.observe(storyBg);
  }

  /* ── signature: horizontal pan (canonical: pin wrapper, scrub track) ── */
  const track = $("#signature-track");
  if (window.gsap && !reduceMotion && track && innerWidth > 820) {
    const distance = () => track.scrollWidth - innerWidth;
    gsap.to(track, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: ".signature",
        start: "top top",
        end: () => "+=" + distance(),
        pin: true,
        scrub: 0.8,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
  }

  /* ── menu data + rendering ── */
  let MENU = null;
  const grid = $("#menu-grid");
  const tabs = $("#menu-tabs");
  const initial = (name) => name.trim().charAt(0).toUpperCase();

  fetch("/api/menu")
    .then((r) => r.json())
    .then((data) => {
      MENU = data;
      buildTabs();
      renderCategory(0);
      wireSignatureAdds();
      // the grid just changed the page height: recompute every pin position,
      // otherwise pinned sections judder at stale offsets
      if (window.ScrollTrigger) requestAnimationFrame(() => ScrollTrigger.refresh());
      // bridge for the thali wheel and anything else outside this module
      const bySlug = {};
      MENU.categories.forEach((c) => c.items.forEach((i) => (bySlug[i.slug] = i)));
      window.HBH = {
        addBySlug(slug) {
          const item = bySlug[slug] ||
            Object.values(bySlug).find((i) => i.slug.includes(slug) || slug.includes(i.slug));
          if (item) addToCart(item.id);
        },
      };
    })
    .catch(() => {
      grid.innerHTML = '<p style="color:var(--muted)">The menu could not load. Refresh the page, or call (813) 988-2220 to order.</p>';
    });

  function buildTabs() {
    MENU.categories.forEach((c, i) => {
      const b = document.createElement("button");
      b.className = "tab" + (i === 0 ? " is-on" : "");
      b.role = "tab";
      b.textContent = c.name;
      b.addEventListener("click", () => {
        $$(".tab", tabs).forEach((t) => t.classList.remove("is-on"));
        b.classList.add("is-on");
        renderCategory(i);
      });
      tabs.appendChild(b);
    });
  }

  /* per-category showcase: plays /assets/video/menu/<slug>.mp4 beside the
     grid when that file exists; otherwise shows the category's best photo */
  const mediaVideo = $("#menu-video");
  const mediaImg = $("#menu-media-img");
  const mediaCap = $("#menu-media-cap");
  const catSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const videoCache = {};

  async function updateMenuMedia(cat) {
    if (!mediaVideo) return;
    const slug = catSlug(cat.name);
    const src = "/assets/video/menu/" + slug + ".mp4";
    if (!(slug in videoCache)) {
      try { videoCache[slug] = (await fetch(src, { method: "HEAD" })).ok; }
      catch (e) { videoCache[slug] = false; }
    }
    if (videoCache[slug]) {
      mediaImg.hidden = true;
      mediaVideo.src = src;
      mediaVideo.hidden = false;
      mediaVideo.play().catch(() => {});
      mediaCap.textContent = cat.name + ", from our kitchen";
    } else {
      mediaVideo.pause();
      mediaVideo.hidden = true;
      const withImg = cat.items.find((i) => i.image);
      if (withImg) {
        mediaImg.src = withImg.image;
        mediaImg.alt = withImg.name;
        mediaImg.hidden = false;
        mediaCap.textContent = withImg.name;
      } else {
        mediaImg.hidden = true;
        mediaCap.textContent = cat.name;
      }
    }
  }

  function renderCategory(idx) {
    const cat = MENU.categories[idx];
    updateMenuMedia(cat);
    grid.innerHTML = "";
    cat.items.forEach((item) => {
      const card = document.createElement("article");
      card.className = "dish" + (item.available ? "" : " is-out");
      card.innerHTML = `
        ${item.image
          ? `<div class="dish-media"><img class="dish-img" src="${item.image}" alt="${item.name}" loading="lazy" /></div>`
          : `<div class="dish-tile" aria-hidden="true">${initial(item.name)}</div>`}
        <div class="dish-body">
          <h3>${item.name}</h3>
          <p>${item.description || ""}</p>
          <div class="dish-row">
            <span class="price">${money(item.price)}</span>
            <button class="btn btn-add" data-id="${item.id}">
              ${item.available ? "Add" : "Sold out"}
            </button>
          </div>
        </div>`;
      grid.appendChild(card);
    });
    if (window.gsap && !reduceMotion) {
      gsap.fromTo(
        $$(".dish", grid),
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, stagger: 0.03, ease: "power2.out", clearProps: "all" }
      );
    }
  }

  /* door-split reveals on section imagery */
  function wireDoorReveals() {
    const targets = $$(".ritual-media, .story-photo");
    targets.forEach((t) => t.classList.add("door-reveal"));
    if (reduceMotion) { targets.forEach((t) => t.classList.add("is-revealed")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-revealed"); io.unobserve(e.target); }
      });
    }, { threshold: 0.35 });
    targets.forEach((t) => io.observe(t));
  }
  wireDoorReveals();

  /* spice index: staggered rise as it enters */
  if (window.gsap && window.ScrollTrigger && !reduceMotion) {
    gsap.fromTo(
      $$(".spice-index li"),
      { y: 26, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: "power3.out",
        scrollTrigger: { trigger: ".spice-index", start: "top 78%", once: true },
      }
    );
  }

  // signature slides: resolve slugs to menu ids once menu is loaded
  function wireSignatureAdds() {
    const bySlug = {};
    MENU.categories.forEach((c) => c.items.forEach((i) => (bySlug[i.slug] = i)));
    $$(".sig-slide[data-add]").forEach((slide) => {
      const wanted = slide.dataset.add;
      const item =
        bySlug[wanted] ||
        Object.values(bySlug).find((i) => i.slug.includes(wanted) || wanted.includes(i.slug));
      const btn = slide.querySelector(".btn-add");
      if (item && btn) btn.dataset.id = item.id;
      else if (btn) btn.remove();
    });
  }

  /* ── cart store ── */
  const CART_KEY = "hbh-cart-v1";
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch (e) { cart = []; }
  const saveCart = () => localStorage.setItem(CART_KEY, JSON.stringify(cart));

  function findItem(id) {
    let f = null;
    MENU && MENU.categories.forEach((c) => c.items.forEach((i) => { if (i.id === id) f = i; }));
    return f;
  }
  function addToCart(id) {
    const line = cart.find((l) => l.id === id);
    if (line) line.qty = Math.min(50, line.qty + 1);
    else cart.push({ id, qty: 1 });
    saveCart();
    syncCartUI();
    const item = findItem(id);
    toast(item ? item.name + " added" : "Added");
  }
  function setQty(id, qty) {
    const line = cart.find((l) => l.id === id);
    if (!line) return;
    line.qty = qty;
    if (line.qty <= 0) cart = cart.filter((l) => l !== line);
    saveCart();
    syncCartUI();
  }
  const cartCount = () => cart.reduce((s, l) => s + l.qty, 0);
  const cartSubtotal = () =>
    cart.reduce((s, l) => { const i = findItem(l.id); return s + (i ? i.price * l.qty : 0); }, 0);

  // delegated add buttons (menu grid + signature slides)
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-add");
    if (btn && btn.dataset.id) addToCart(btn.dataset.id);
  });

  /* ── drawer ── */
  const drawer = $("#cart-drawer");
  const scrim = $("#drawer-scrim");
  const views = {
    cart: $("#drawer-view-cart"),
    checkout: $("#drawer-view-checkout"),
    success: $("#drawer-view-success"),
  };
  let view = "cart";
  let lastFocus = null;

  function openDrawer(v) {
    showView(v || "cart");
    drawer.hidden = false;
    scrim.hidden = false;
    requestAnimationFrame(() => {
      drawer.classList.add("is-open");
      scrim.classList.add("is-open");
    });
    lastFocus = document.activeElement;
    $("#cart-close").focus();
    document.body.style.overflow = "hidden";
  }
  function closeDrawer() {
    drawer.classList.remove("is-open");
    scrim.classList.remove("is-open");
    document.body.style.overflow = "";
    setTimeout(() => { drawer.hidden = true; scrim.hidden = true; }, reduceMotion ? 0 : 330);
    if (lastFocus) lastFocus.focus();
  }
  function showView(v) {
    view = v;
    views.cart.hidden = v !== "cart";
    views.checkout.hidden = v !== "checkout";
    views.success.hidden = v !== "success";
    $("#drawer-foot").style.display = v === "success" ? "none" : "";
    $("#drawer-title").textContent =
      v === "cart" ? "Your order" : v === "checkout" ? "Checkout" : "Order placed";
    $("#cart-next").textContent = v === "cart" ? "Checkout" : "Place order";
    $("#cart-back").hidden = v !== "checkout";
    syncCartUI();
  }

  $("#cart-open").addEventListener("click", () => openDrawer("cart"));
  $("#cart-close").addEventListener("click", closeDrawer);
  scrim.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !drawer.hidden) closeDrawer();
  });
  $("#cart-browse").addEventListener("click", () => {
    closeDrawer();
    $("#menu").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  });
  $("#cart-back").addEventListener("click", () => showView("cart"));
  $("#success-done").addEventListener("click", () => {
    closeDrawer();
    $("#menu").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  });

  /* ── cart UI sync ── */
  function syncCartUI() {
    $("#cart-count").textContent = cartCount();

    const list = $("#cart-lines");
    list.innerHTML = "";
    cart.forEach((l) => {
      const item = findItem(l.id);
      if (!item) return;
      const li = document.createElement("li");
      li.className = "cart-line";
      li.innerHTML = `
        ${item.image
          ? `<img src="${item.image}" alt="" />`
          : `<div class="line-tile" aria-hidden="true">${initial(item.name)}</div>`}
        <div>
          <div class="line-name">${item.name}</div>
          <div class="line-price">${money(item.price)} each</div>
        </div>
        <div class="line-qty">
          <button class="qty-btn" data-dec aria-label="One less ${item.name}">−</button>
          <span>${l.qty}</span>
          <button class="qty-btn" data-inc aria-label="One more ${item.name}">+</button>
        </div>`;
      li.querySelector("[data-dec]").addEventListener("click", () => setQty(l.id, l.qty - 1));
      li.querySelector("[data-inc]").addEventListener("click", () => setQty(l.id, l.qty + 1));
      list.appendChild(li);
    });
    $("#cart-empty").style.display = cart.length ? "none" : "";

    const sub = cartSubtotal();
    const isCard = view === "checkout" && $('input[name="payment"]:checked')?.value === "card";
    const fee = isCard ? sub * 0.04 : 0;
    const tax = sub * 0.075;
    $("#t-sub").textContent = money(sub);
    $("#t-fee").textContent = money(fee);
    $("#t-fee-row").hidden = !isCard;
    $("#t-tax").textContent = money(tax);
    $("#t-total").textContent = money(sub + fee + tax);
    $("#cart-next").disabled = cart.length === 0;
    $("#cart-next").style.opacity = cart.length ? "" : "0.5";
  }

  $$('input[name="payment"]').forEach((r) => r.addEventListener("change", syncCartUI));

  /* ── pickup time options ── */
  function fillPickupTimes() {
    const sel = $("#f-time");
    sel.innerHTML = "";
    const optASAP = new Option("As soon as possible (20 to 30 min)", "ASAP");
    sel.add(optASAP);
    const now = new Date();
    const start = new Date(now.getTime() + 45 * 60000);
    start.setMinutes(Math.ceil(start.getMinutes() / 15) * 15, 0, 0);
    for (let i = 0; i < 16; i++) {
      const t = new Date(start.getTime() + i * 15 * 60000);
      const h = t.getHours();
      if (h < 11 || h >= 23) continue;
      const label = t.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      sel.add(new Option(label, label));
    }
  }

  /* ── checkout flow ── */
  $("#cart-next").addEventListener("click", async () => {
    if (view === "cart") {
      if (!cart.length) return;
      fillPickupTimes();
      showView("checkout");
      $("#f-name").focus();
      return;
    }
    // place order
    const name = $("#f-name").value.trim();
    const phone = $("#f-phone").value.trim();
    $("#err-name").textContent = name ? "" : "We need a name for the order.";
    $("#err-phone").textContent = /^[\d\s()+.-]{7,}$/.test(phone) ? "" : "Enter a valid phone number.";
    if (!name || !/^[\d\s()+.-]{7,}$/.test(phone)) return;

    const btn = $("#cart-next");
    btn.disabled = true;
    btn.textContent = "Placing…";
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, phone,
          pickupTime: $("#f-time").value,
          payment: $('input[name="payment"]:checked').value,
          notes: $("#f-notes").value.trim(),
          items: cart,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      cart = [];
      saveCart();
      $("#success-detail").textContent =
        data.id + ", " + money(data.total) + ", pickup " + data.pickupTime;
      showView("success");
    } catch (err) {
      toast(err.message);
    } finally {
      btn.disabled = false;
      btn.textContent = view === "cart" ? "Checkout" : "Place order";
    }
  });

  /* ── toast ── */
  let toastTimer = null;
  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-show"), 2200);
  }

  /* magnetic pull on primary buttons: tactile, subtle, transform-only */
  if (!reduceMotion) {
    $$(".btn-primary").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width / 2) / r.width;
        const dy = (e.clientY - r.top - r.height / 2) / r.height;
        btn.style.translate = `${dx * 6}px ${dy * 4}px`;
      });
      btn.addEventListener("pointerleave", () => { btn.style.translate = ""; });
    });
  }

  syncCartUI();
})();
