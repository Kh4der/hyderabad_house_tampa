/* Hyderabad Biryani House — native-smooth build:
   no pinning, no scroll libraries, videos play (never scrubbed).
   Reveals = IntersectionObserver + CSS transitions only. */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const money = (n) => "$" + n.toFixed(2);
  const CART_KEY = "hbh-cart-v1";

  /* ── feature flags: Stripe online payment + PostHog analytics ── */
  const track = (event, props) => {
    if (window.posthog && window.posthog.capture) posthog.capture(event, props);
  };
  let orderingPaused = false;
  let pauseMessage = "";
  fetch("/api/config")
    .then((r) => r.json())
    .then((cfg) => {
      if (cfg.stripeEnabled) $("#pay-online").hidden = false;
      if (cfg.orderingOpen === false) {
        orderingPaused = true;
        pauseMessage = cfg.pauseMessage || "Online ordering is paused right now. Call (813) 988-2220 to order.";
        const banner = document.createElement("div");
        banner.className = "pause-banner";
        banner.setAttribute("role", "status");
        banner.textContent = pauseMessage;
        document.body.prepend(banner);
        document.body.classList.add("has-pause-banner");
      }
      if (cfg.posthogKey) {
        /* official PostHog snippet, keyed from the server */
        !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
        posthog.init(cfg.posthogKey, { api_host: cfg.posthogHost, person_profiles: "identified_only" });
      }
    })
    .catch(() => {});

  /* returning from Stripe Checkout: verify, thank, clean the URL */
  const params = new URLSearchParams(location.search);
  if (params.get("paid")) {
    const orderId = params.get("paid");
    fetch("/api/orders/" + encodeURIComponent(orderId) + "/verify-payment", { method: "POST" })
      .then((r) => r.json())
      .then((d) => {
        toast(d.paid
          ? "Payment received — order " + orderId + " is with the kitchen. See you soon!"
          : "We're confirming your payment for " + orderId + ". Call us if anything looks off.");
        track("order_paid_online", { order_id: orderId });
      })
      .catch(() => {});
    localStorage.removeItem(CART_KEY);
    history.replaceState(null, "", location.pathname);
  } else if (params.get("cancelled")) {
    setTimeout(() => toast("Payment cancelled — your order was not placed."), 400);
    history.replaceState(null, "", location.pathname);
  }

  /* ── the doors: sparks trace the emblem, then they open ── */
  const doors = $("#doors");
  if (doors) {
    const open = () => {
      doors.classList.add("is-open");
      setTimeout(() => doors.classList.add("is-gone"), reduceMotion ? 450 : 1250);
    };
    const canvas = $("#spark-canvas");
    const logo = $("#doors-logo");
    const seen = sessionStorage.getItem("hbh-doors-seen");
    sessionStorage.setItem("hbh-doors-seen", "1");

    if (!reduceMotion && !seen && window.HBHSparks && canvas) {
      // first visit: fire writes the mark, the mark glows, the doors part
      const box = canvas.parentElement.offsetWidth || 340;
      HBHSparks.trace(canvas, box, "/assets/logo/logo-mark.webp").then(() => {
        logo.classList.add("is-lit");
        canvas.style.transition = "opacity 0.7s";
        canvas.style.opacity = "0";
        setTimeout(open, 750);
      });
    } else {
      // repeat visit or reduced motion: quick entrance
      logo.classList.add("is-lit");
      setTimeout(open, reduceMotion ? 350 : 500);
    }
  }

  /* ── nav scrolled state: one passive listener, class toggle only ── */
  const nav = $("#nav");
  let navTick = false;
  addEventListener("scroll", () => {
    if (navTick) return;
    navTick = true;
    requestAnimationFrame(() => {
      nav.classList.toggle("is-scrolled", scrollY > 10);
      navTick = false;
    });
  }, { passive: true });

  /* ── gallery: infinite auto-drifting image rows (image-scroller style).
     seamless loop via one cloned set; pause on hover; drag to browse.
     runs only while on screen, transform-only. ── */
  const driftRows = $$(".drift");
  if (driftRows.length && !reduceMotion) {
    const rows = driftRows.map((el) => {
      // clone the set once for a seamless wrap
      const items = Array.from(el.children);
      items.forEach((f) => {
        const c = f.cloneNode(true);
        c.setAttribute("aria-hidden", "true");
        el.appendChild(c);
      });
      return {
        el,
        dir: +el.dataset.dir || -1,
        offset: 0,
        half: 0,
        paused: false,
        dragging: false,
        lastX: 0,
        vel: 0,
      };
    });
    const measure = () => rows.forEach((r) => { r.half = r.el.scrollWidth / 2; });
    addEventListener("resize", measure);
    addEventListener("load", measure);
    measure();

    let visible = false;
    const galIO = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
    galIO.observe(driftRows[0].parentElement);

    const SPEED = 26; // px per second
    let last = performance.now();
    (function tick(now) {
      const dt = Math.min(64, now - last) / 1000;
      last = now;
      if (visible) {
        for (const r of rows) {
          if (!r.half) continue;
          if (r.dragging) {
            // momentum is collected in pointermove
          } else if (r.paused) {
            r.vel *= 0.9;
          } else {
            // ease back toward cruise speed after a drag fling
            const cruise = SPEED * r.dir * -1;
            r.vel += (cruise - r.vel) * 0.04;
          }
          r.offset += r.vel * dt;
          // wrap seamlessly
          if (r.offset <= -r.half) r.offset += r.half;
          if (r.offset > 0) r.offset -= r.half;
          r.el.style.transform = `translate3d(${r.offset}px,0,0)`;
        }
      }
      requestAnimationFrame(tick);
    })(last);

    rows.forEach((r) => {
      r.vel = SPEED * r.dir * -1;
      r.el.addEventListener("pointerenter", () => { r.paused = true; });
      r.el.addEventListener("pointerleave", () => { r.paused = false; });
      r.el.addEventListener("pointerdown", (e) => {
        r.dragging = true;
        r.lastX = e.clientX;
        r.el.setPointerCapture(e.pointerId);
      });
      r.el.addEventListener("pointermove", (e) => {
        if (!r.dragging) return;
        const dx = e.clientX - r.lastX;
        r.lastX = e.clientX;
        r.offset += dx;
        r.vel = dx * 60; // fling velocity
      });
      const endDrag = () => { r.dragging = false; };
      r.el.addEventListener("pointerup", endDrag);
      r.el.addEventListener("pointercancel", endDrag);
    });
  }

  /* ── scroll reveals: class toggle, CSS does the animation ── */
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-in"); revealIO.unobserve(e.target); }
    });
  }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
  $$(".reveal").forEach((el) => revealIO.observe(el));

  /* ── video manager: every [data-autoplay] plays only while visible ── */
  const vidIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const v = e.target;
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    });
  }, { threshold: 0.25 });
  $$("video[data-autoplay]").forEach((v) => {
    if (reduceMotion) { v.removeAttribute("autoplay"); return; } // poster only
    vidIO.observe(v);
  });

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
    })
    .catch(() => {
      grid.innerHTML = '<p style="color:var(--muted)">The menu could not load. Refresh the page, or call (813) 988-2220 to order.</p>';
    });

  function buildTabs() {
    MENU.categories.forEach((c, i) => {
      const b = document.createElement("button");
      b.className = "tab" + (i === 0 ? " is-on" : "");
      b.textContent = c.name;
      b.addEventListener("click", () => {
        $$(".tab", tabs).forEach((t) => t.classList.remove("is-on"));
        b.classList.add("is-on");
        renderCategory(i);
      });
      tabs.appendChild(b);
    });
  }

  /* per-category showcase: plays /assets/video/menu/<slug>.mp4 when present */
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
    if (videoCache[slug] && !reduceMotion) {
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
    cat.items.forEach((item, n) => {
      const card = document.createElement("article");
      card.className = "dish reveal" + (item.available ? "" : " is-out");
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
      // stagger via transition-delay, then reveal on the next frame
      card.style.transitionDelay = Math.min(n * 28, 280) + "ms";
      requestAnimationFrame(() => requestAnimationFrame(() => card.classList.add("is-in")));
    });
  }

  function wireSignatureAdds() {
    const bySlug = {};
    MENU.categories.forEach((c) => c.items.forEach((i) => (bySlug[i.slug] = i)));
    $$(".snap-card[data-add]").forEach((cardEl) => {
      const wanted = cardEl.dataset.add;
      const item = bySlug[wanted] ||
        Object.values(bySlug).find((i) => i.slug.includes(wanted) || wanted.includes(i.slug));
      const btn = cardEl.querySelector(".btn-add");
      if (item && btn) btn.dataset.id = item.id;
      else if (btn) btn.remove();
    });
  }

  /* ── cart store ── */
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
    if (item) track("add_to_cart", { item: item.name, price: item.price });
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

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-add");
    if (btn && btn.dataset.id) {
      addToCart(btn.dataset.id);
      // a pinch of fire whenever food goes in the pot
      if (window.HBHSparks) {
        const r = btn.getBoundingClientRect();
        HBHSparks.burst(r.left + r.width / 2, r.top + r.height / 2);
      }
    }
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
    document.body.classList.add("drawer-open"); // toast moves clear of the CTA
  }
  function closeDrawer() {
    drawer.classList.remove("is-open");
    scrim.classList.remove("is-open");
    document.body.style.overflow = "";
    document.body.classList.remove("drawer-open");
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
    const pay = $('input[name="payment"]:checked')?.value;
    const isCard = view === "checkout" && (pay === "card" || pay === "online");
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

  /* ── pickup times: 15-min slots inside opening hours (11 AM – 11 PM) ── */
  function fillPickupTimes() {
    const sel = $("#f-time");
    sel.innerHTML = "";
    sel.add(new Option("As soon as possible (20 to 30 min)", "ASAP"));
    const start = new Date(Date.now() + 45 * 60000);
    start.setMinutes(Math.ceil(start.getMinutes() / 15) * 15, 0, 0);
    const open = new Date(start);
    open.setHours(11, 0, 0, 0);
    if (start < open) start.setTime(open.getTime()); // before opening: slots begin at 11 AM
    for (let i = 0; i < 16; i++) {
      const t = new Date(start.getTime() + i * 15 * 60000);
      if (t.getHours() >= 23) break;
      const label = t.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      sel.add(new Option(label, label));
    }
  }

  /* ── checkout ── */
  $("#cart-next").addEventListener("click", async () => {
    if (orderingPaused) { toast(pauseMessage); return; }
    if (view === "cart") {
      if (!cart.length) return;
      fillPickupTimes();
      showView("checkout");
      $("#f-name").focus();
      track("checkout_started", { items: cartCount(), subtotal: +cartSubtotal().toFixed(2) });
      return;
    }
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
      track("order_placed", {
        order_id: data.id, total: data.total,
        payment: $('input[name="payment"]:checked').value, items: cartCount(),
      });
      if (data.checkoutUrl) {
        /* online payment: hand off to Stripe Checkout; cart clears on return */
        location.href = data.checkoutUrl;
        return;
      }
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

  syncCartUI();
})();
