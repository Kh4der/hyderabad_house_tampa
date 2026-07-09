/* HBH Kitchen dashboard — admin + employee roles */
(function () {
  "use strict";
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const money = (n) => "$" + (+n).toFixed(2);
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  let token = sessionStorage.getItem("hbh-admin-token") || null;
  let role = sessionStorage.getItem("hbh-admin-role") || null;
  let pollTimer = null;
  let allOrders = [];

  const api = (path, opts = {}) =>
    fetch(path, {
      ...opts,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
        ...(opts.headers || {}),
      },
    }).then(async (r) => {
      if (r.status === 401) { signOut(); throw new Error("Signed out"); }
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Request failed");
      return data;
    });

  /* ── gate ── */
  $("#gate-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: $("#pin").value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Wrong PIN");
      token = data.token;
      role = data.role;
      sessionStorage.setItem("hbh-admin-token", token);
      sessionStorage.setItem("hbh-admin-role", role);
      enter();
    } catch (err) {
      $("#gate-err").textContent = err.message;
      $("#pin").value = "";
      $("#pin").focus();
    }
  });

  function signOut() {
    token = null; role = null;
    sessionStorage.removeItem("hbh-admin-token");
    sessionStorage.removeItem("hbh-admin-role");
    clearInterval(pollTimer);
    $("#dash").hidden = true;
    $("#gate").hidden = false;
    $("#pin").focus();
  }
  $("#signout").addEventListener("click", signOut);

  function enter() {
    $("#gate").hidden = true;
    $("#dash").hidden = false;
    const isAdmin = role === "admin";
    $("#role-chip").textContent = isAdmin ? "Admin" : "Employee";
    $("#role-chip").classList.toggle("is-admin", isAdmin);
    $$(".admin-only").forEach((el) => (el.hidden = !isAdmin));
    refreshOrders();
    if (isAdmin) { loadMenu(); loadStats(); loadOrderingState(); }
    clearInterval(pollTimer);
    pollTimer = setInterval(refreshOrders, 4000);
  }

  /* ── new-order sound alert + tab flash ── */
  let soundOn = localStorage.getItem("hbh-sound") !== "off";
  const soundBtn = $("#sound-toggle");
  const syncSoundBtn = () => {
    soundBtn.textContent = soundOn ? "🔔" : "🔕";
    soundBtn.title = soundOn ? "Sound alerts on — click to mute" : "Sound alerts muted — click to enable";
  };
  syncSoundBtn();
  soundBtn.addEventListener("click", () => {
    soundOn = !soundOn;
    localStorage.setItem("hbh-sound", soundOn ? "on" : "off");
    syncSoundBtn();
    if (soundOn) chime();
  });

  let audioCtx = null;
  function chime() {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      [0, 0.18].forEach((delay, i) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = "sine";
        o.frequency.value = i ? 1318 : 880; // A5 then E6: a friendly ding-ding
        g.gain.setValueAtTime(0.0001, audioCtx.currentTime + delay);
        g.gain.exponentialRampToValueAtTime(0.22, audioCtx.currentTime + delay + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + delay + 0.5);
        o.connect(g).connect(audioCtx.destination);
        o.start(audioCtx.currentTime + delay);
        o.stop(audioCtx.currentTime + delay + 0.55);
      });
    } catch (e) {}
  }

  const baseTitle = document.title;
  let titleTimer = null;
  function announceNewOrder() {
    if (soundOn) chime();
    document.title = "● NEW ORDER — HBH Kitchen";
    clearTimeout(titleTimer);
    titleTimer = setTimeout(() => { document.title = baseTitle; }, 10000);
  }

  /* ── pause / resume online ordering (admin) ── */
  const orderingBtn = $("#ordering-toggle");
  let orderingOpen = true;
  function paintOrderingBtn() {
    orderingBtn.textContent = orderingOpen ? "Ordering: OPEN" : "Ordering: PAUSED";
    orderingBtn.classList.toggle("is-paused", !orderingOpen);
  }
  async function loadOrderingState() {
    try {
      const cfg = await fetch("/api/config").then((r) => r.json());
      orderingOpen = cfg.orderingOpen;
      paintOrderingBtn();
    } catch (e) {}
  }
  orderingBtn.addEventListener("click", async () => {
    const next = !orderingOpen;
    if (!next && !confirm("Pause online ordering? Customers will see a notice and won't be able to check out until you resume.")) return;
    try {
      const s = await api("/api/admin/settings", { method: "PATCH", body: JSON.stringify({ orderingOpen: next }) });
      orderingOpen = s.orderingOpen;
      paintOrderingBtn();
    } catch (err) { alert(err.message); }
  });

  /* ── panels ── */
  $$(".dtab").forEach((t) =>
    t.addEventListener("click", () => {
      $$(".dtab").forEach((x) => x.classList.remove("is-on"));
      t.classList.add("is-on");
      ["orders", "receipts", "menu", "sales"].forEach((p) => {
        $("#panel-" + p).hidden = t.dataset.panel !== p;
      });
      if (t.dataset.panel === "receipts") renderReceipts();
      if (t.dataset.panel === "sales") loadStats();
    })
  );

  /* ── orders board ── */
  const NEXT = { preparing: ["Mark ready", "ready"], ready: ["Picked up", "done"] };
  const PREV = { preparing: "new", ready: "preparing", done: "ready" };
  let knownNewIds = null; // for the new-order chime

  async function refreshOrders() {
    try { allOrders = await api("/api/admin/orders"); } catch (e) { return; }

    /* chime when an order we haven't seen lands in New */
    const newIds = allOrders.filter((o) => o.status === "new").map((o) => o.id);
    if (knownNewIds !== null && newIds.some((id) => !knownNewIds.includes(id))) announceNewOrder();
    knownNewIds = newIds;

    const today = new Date().toDateString();
    const boardable = allOrders.filter((o) => o.status !== "awaiting-payment" && !o.archived);
    const todays = allOrders.filter((o) =>
      new Date(o.placedAt).toDateString() === today && !["rejected", "awaiting-payment"].includes(o.status));
    $("#s-open").textContent = boardable.filter((o) => ["new", "preparing", "ready"].includes(o.status)).length;
    $("#s-today").textContent = todays.length;
    if (role === "admin") $("#s-revenue").textContent = money(todays.reduce((s, o) => s + o.total, 0));

    ["new", "preparing", "ready", "done"].forEach((st) => {
      const list = boardable.filter((o) => o.status === st);
      $("#n-" + st).textContent = list.length;
      const col = $("#col-" + st);
      col.innerHTML = "";
      list.slice(0, 100).forEach((o) => col.appendChild(orderCard(o)));
    });
    $("#clear-done").hidden = !boardable.some((o) => o.status === "done");

    if (!$("#panel-receipts").hidden) renderReceipts();
  }

  async function patchOrder(id, body) {
    try { await api("/api/admin/orders/" + encodeURIComponent(id), { method: "PATCH", body: JSON.stringify(body) }); }
    catch (e) {}
    refreshOrders();
  }
  const setStatus = (id, status, extra) => patchOrder(id, { status, ...(extra || {}) });

  $("#clear-done").addEventListener("click", async () => {
    try { await api("/api/admin/orders/clear-done", { method: "POST" }); } catch (e) {}
    refreshOrders();
  });

  /* printable kitchen ticket / customer receipt */
  function printOrder(o) {
    const w = window.open("", "_blank", "width=420,height=640");
    if (!w) return alert("Allow pop-ups to print tickets.");
    const rows = o.lines.map((l) =>
      `<tr><td class="q">${l.qty}×</td><td>${esc(l.name)}</td><td class="r">${money(l.price * l.qty)}</td></tr>`).join("");
    w.document.write(`<!DOCTYPE html><html><head><title>${esc(o.id)}</title><style>
      body{font-family:'Courier New',monospace;font-size:13px;margin:18px;color:#000}
      h1{font-size:15px;text-align:center;margin:0 0 2px} .c{text-align:center;margin:0 0 12px}
      table{width:100%;border-collapse:collapse} td{padding:3px 0;vertical-align:top}
      .q{width:34px} .r{text-align:right;white-space:nowrap}
      .tot td{border-top:1px dashed #000;padding-top:6px}
      .meta{margin:10px 0;border-top:1px dashed #000;padding-top:8px}
      .notes{border:1px solid #000;padding:6px;margin-top:8px}
    </style></head><body>
      <h1>HYDERABAD BIRYANI HOUSE</h1>
      <p class="c">6810 E Fowler Ave · (813) 988-2220</p>
      <div class="meta">
        <div><b>${esc(o.id)}</b> — ${esc(o.status).toUpperCase()}</div>
        <div>Placed: ${new Date(o.placedAt).toLocaleString()}</div>
        <div>Pickup: ${esc(o.pickupTime)}</div>
        <div>Customer: ${esc(o.name)} · ${esc(o.phone)}</div>
        <div>Payment: ${o.payment === "online" ? (o.paid ? "PAID ONLINE" : "online (unpaid)") : esc(o.payment)}</div>
      </div>
      <table>${rows}
        <tr class="tot"><td></td><td>Subtotal</td><td class="r">${money(o.subtotal)}</td></tr>
        ${o.cardFee ? `<tr><td></td><td>Card fee 4%</td><td class="r">${money(o.cardFee)}</td></tr>` : ""}
        <tr><td></td><td>Tax</td><td class="r">${money(o.tax)}</td></tr>
        <tr><td></td><td><b>TOTAL</b></td><td class="r"><b>${money(o.total)}</b></td></tr>
      </table>
      ${o.notes ? `<div class="notes"><b>NOTES:</b> ${esc(o.notes)}</div>` : ""}
      <p class="c" style="margin-top:14px">Shukriya! Come again.</p>
    </body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 250);
  }

  function orderCard(o) {
    const el = document.createElement("article");
    el.className = "order" + (o.status === "new" ? " is-new" : "");
    const t = new Date(o.placedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    el.innerHTML = `
      <div class="order-top">
        <span class="order-id">${esc(o.id)}</span>
        <span class="order-time">${t} · pickup ${esc(o.pickupTime)}</span>
      </div>
      <div class="order-who">${esc(o.name)}<a href="tel:${esc(o.phone)}">${esc(o.phone)}</a></div>
      <ul class="order-lines">
        ${o.lines.map((l) => `<li><span class="q">${l.qty}×</span><span style="flex:1">${esc(l.name)}</span><span>${money(l.price * l.qty)}</span></li>`).join("")}
      </ul>
      ${o.notes ? `<div class="order-notes">${esc(o.notes)}</div>` : ""}
      <div class="order-meta">
        <span>${o.payment === "online" ? (o.paid ? "Paid online ✓" : "Online (unpaid)") : o.payment === "card" ? "Card at pickup" : "Cash"}</span>
        <b>${money(o.total)}</b>
      </div>
    `;
    if (o.status === "new") {
      const row = document.createElement("div");
      row.className = "order-actions";
      const accept = document.createElement("button");
      accept.className = "btn btn-primary order-act";
      accept.textContent = "Accept — start cooking";
      accept.addEventListener("click", () => { accept.disabled = true; setStatus(o.id, "preparing"); });
      const reject = document.createElement("button");
      reject.className = "btn btn-reject";
      reject.textContent = "Reject";
      reject.addEventListener("click", () => {
        const reason = prompt(`Reject order ${o.id} from ${o.name}?\n\nReason (goes on the receipt — call ${o.phone} to let them know):`, "");
        if (reason === null) return; // cancelled
        reject.disabled = true;
        setStatus(o.id, "rejected", { rejectReason: reason.trim() });
      });
      row.append(accept, reject);
      el.appendChild(row);
    } else if (NEXT[o.status]) {
      const btn = document.createElement("button");
      btn.className = "btn btn-primary order-act";
      btn.textContent = NEXT[o.status][0];
      btn.addEventListener("click", () => { btn.disabled = true; setStatus(o.id, NEXT[o.status][1]); });
      el.appendChild(btn);
    } else if (o.status === "done") {
      const clear = document.createElement("button");
      clear.className = "btn btn-ghost order-act";
      clear.textContent = "Clear from board";
      clear.addEventListener("click", () => { clear.disabled = true; patchOrder(o.id, { archived: true }); });
      el.appendChild(clear);
    }

    /* small utility row: print ticket + undo one step */
    const util = document.createElement("div");
    util.className = "order-util";
    const print = document.createElement("button");
    print.className = "util-btn";
    print.textContent = "🖨 Print";
    print.title = "Print kitchen ticket / receipt";
    print.addEventListener("click", () => printOrder(o));
    util.appendChild(print);
    if (PREV[o.status]) {
      const back = document.createElement("button");
      back.className = "util-btn";
      back.textContent = "↩ Move back";
      back.title = `Move back to “${PREV[o.status]}” (fix a mis-tap)`;
      back.addEventListener("click", () => { back.disabled = true; setStatus(o.id, PREV[o.status]); });
      util.appendChild(back);
    }
    el.appendChild(util);
    return el;
  }

  /* ── receipts ── */
  $("#receipt-search").addEventListener("input", renderReceipts);
  $("#receipt-filter").addEventListener("change", renderReceipts);

  function renderReceipts() {
    const q = $("#receipt-search").value.trim().toLowerCase();
    const f = $("#receipt-filter").value;
    const list = allOrders.filter((o) => {
      if (f === "done" && o.status !== "done") return false;
      if (f === "rejected" && o.status !== "rejected") return false;
      if (f === "open" && !["new", "preparing", "ready", "awaiting-payment"].includes(o.status)) return false;
      if (!q) return true;
      return (o.id + " " + o.name + " " + o.phone).toLowerCase().includes(q);
    });
    const wrap = $("#receipt-list");
    wrap.innerHTML = list.length ? "" : '<p class="panel-hint">No orders match.</p>';
    list.forEach((o) => {
      const d = new Date(o.placedAt);
      const el = document.createElement("details");
      el.className = "receipt";
      el.innerHTML = `
        <summary>
          <span class="order-id">${esc(o.id)}</span>
          <span class="receipt-who">${esc(o.name)}</span>
          <span class="receipt-date">${d.toLocaleDateString([], { month: "short", day: "numeric" })} ${d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
          <span class="status-chip st-${esc(o.status)}">${esc(o.status)}${o.archived ? " · cleared" : ""}</span>
          <b>${money(o.total)}</b>
        </summary>
        <div class="receipt-body">
          <p class="receipt-line"><span>Phone</span><a href="tel:${esc(o.phone)}">${esc(o.phone)}</a></p>
          <p class="receipt-line"><span>Pickup</span><span>${esc(o.pickupTime)}</span></p>
          <p class="receipt-line"><span>Payment</span><span>${o.payment === "online" ? (o.paid ? "Paid online" : "Online, unpaid") : esc(o.payment)}</span></p>
          ${o.notes ? `<p class="receipt-line"><span>Notes</span><span>${esc(o.notes)}</span></p>` : ""}
          ${o.rejectReason ? `<p class="receipt-line"><span>Reject reason</span><span>${esc(o.rejectReason)}</span></p>` : ""}
          <ul class="order-lines">
            ${o.lines.map((l) => `<li><span class="q">${l.qty}×</span><span style="flex:1">${esc(l.name)}</span><span>${money(l.price * l.qty)}</span></li>`).join("")}
          </ul>
          <p class="receipt-line"><span>Subtotal</span><span>${money(o.subtotal)}</span></p>
          ${o.cardFee ? `<p class="receipt-line"><span>Card fee</span><span>${money(o.cardFee)}</span></p>` : ""}
          <p class="receipt-line"><span>Tax</span><span>${money(o.tax)}</span></p>
          <p class="receipt-line receipt-total"><span>Total</span><b>${money(o.total)}</b></p>
          <div class="receipt-actions">
            <button class="btn btn-ghost" data-act="print">🖨 Print receipt</button>
            ${o.archived ? '<button class="btn btn-ghost" data-act="restore">Put back on board</button>' : ""}
          </div>
        </div>`;
      el.querySelector('[data-act="print"]').addEventListener("click", () => printOrder(o));
      const restore = el.querySelector('[data-act="restore"]');
      if (restore) restore.addEventListener("click", () => patchOrder(o.id, { archived: false }));
      wrap.appendChild(el);
    });
  }

  /* ── menu & prices (admin) ── */
  async function loadMenu() {
    const menu = await fetch("/api/menu").then((r) => r.json());
    const wrap = $("#menu-list");
    wrap.innerHTML = "";
    menu.categories.forEach((cat) => {
      const sec = document.createElement("section");
      sec.className = "avail-cat";
      sec.innerHTML = `<h2>${esc(cat.name)} <button class="btn btn-ghost btn-add-dish">+ Add dish</button></h2>`;

      /* add-dish inline form (hidden until + is clicked) */
      const form = document.createElement("form");
      form.className = "add-dish-form";
      form.hidden = true;
      form.innerHTML = `
        <input name="name" placeholder="Dish name" maxlength="80" required />
        <input name="price" type="number" placeholder="$" min="0" max="500" step="0.5" required />
        <input name="description" placeholder="Short description (optional)" maxlength="300" />
        <button class="btn btn-primary" type="submit">Add</button>
        <button class="btn btn-ghost" type="button" data-cancel>Cancel</button>`;
      sec.querySelector(".btn-add-dish").addEventListener("click", () => {
        form.hidden = !form.hidden;
        if (!form.hidden) form.querySelector('[name="name"]').focus();
      });
      form.querySelector("[data-cancel]").addEventListener("click", () => { form.hidden = true; form.reset(); });
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        try {
          await api("/api/admin/menu", {
            method: "POST",
            body: JSON.stringify({
              category: cat.name,
              name: form.name.value,
              price: parseFloat(form.price.value),
              description: form.description.value,
            }),
          });
          loadMenu(); // re-render with the new dish in place
        } catch (err) { alert(err.message); }
      });
      sec.appendChild(form);

      cat.items.forEach((item) => {
        const row = document.createElement("div");
        row.className = "avail-row";
        row.innerHTML = `
          <img class="row-thumb" src="${esc(item.image || "")}" alt="" loading="lazy" onerror="this.style.visibility='hidden'" />
          <span class="row-name">${esc(item.name)}<small class="row-desc">${esc(item.description || "")}</small></span>
          <button class="btn-mini btn-edit" title="Edit name & description">✎</button>
          <span class="row-price">$ <input type="number" class="price-input" min="0" max="500" step="0.5" value="${item.price}" aria-label="Price for ${esc(item.name)}" /></span>
          <button class="btn btn-ghost btn-img">Image</button>
          <label class="switch">
            <input type="checkbox" class="avail-input" ${item.available ? "checked" : ""} aria-label="${esc(item.name)} available" />
            <i></i>
          </label>
          <button class="btn-mini btn-del" title="Remove ${esc(item.name)} from the menu">✕</button>`;

        /* edit name + description */
        row.querySelector(".btn-edit").addEventListener("click", async () => {
          const name = prompt("Dish name:", item.name);
          if (name === null) return;
          const description = prompt("Description:", item.description || "");
          if (description === null) return;
          try {
            const updated = await api("/api/admin/menu/" + encodeURIComponent(item.id), {
              method: "PATCH", body: JSON.stringify({ name, description }),
            });
            item.name = updated.name;
            item.description = updated.description;
            row.querySelector(".row-name").innerHTML = `${esc(item.name)}<small class="row-desc">${esc(item.description || "")}</small>`;
            flash(row);
          } catch (err) { alert(err.message); }
        });

        /* delete dish */
        row.querySelector(".btn-del").addEventListener("click", async () => {
          if (!confirm(`Remove “${item.name}” from the menu?\n\nPast receipts keep it; it just stops being orderable.`)) return;
          try {
            await api("/api/admin/menu/" + encodeURIComponent(item.id), { method: "DELETE" });
            row.remove();
          } catch (err) { alert(err.message); }
        });

        /* price: save on change (Enter or blur) */
        const priceInput = row.querySelector(".price-input");
        priceInput.addEventListener("change", async () => {
          const v = parseFloat(priceInput.value);
          if (!Number.isFinite(v) || v < 0) { priceInput.value = item.price; return; }
          try {
            const updated = await api("/api/admin/menu/" + encodeURIComponent(item.id), {
              method: "PATCH", body: JSON.stringify({ price: v }),
            });
            item.price = updated.price;
            priceInput.value = updated.price;
            flash(row);
          } catch (err) { priceInput.value = item.price; alert(err.message); }
        });

        /* availability */
        row.querySelector(".avail-input").addEventListener("change", async (e) => {
          try {
            await api("/api/admin/menu/" + encodeURIComponent(item.id), {
              method: "PATCH", body: JSON.stringify({ available: e.target.checked }),
            });
          } catch (err) { e.target.checked = !e.target.checked; }
        });

        /* image picker */
        row.querySelector(".btn-img").addEventListener("click", () => openPicker(item, row));

        sec.appendChild(row);
      });
      wrap.appendChild(sec);
    });
  }

  function flash(row) {
    row.classList.add("is-saved");
    setTimeout(() => row.classList.remove("is-saved"), 900);
  }

  /* ── image picker ── */
  const picker = $("#picker");
  const pickerScrim = $("#picker-scrim");
  let pickerItem = null;
  let pickerRow = null;
  let assetCache = null;

  async function openPicker(item, row) {
    pickerItem = item;
    pickerRow = row;
    $("#picker-title").textContent = "Image for " + item.name;
    picker.hidden = false;
    pickerScrim.hidden = false;
    if (!assetCache) assetCache = await api("/api/admin/assets");
    const grid = $("#picker-grid");
    grid.innerHTML = "";
    assetCache.forEach((src) => {
      const b = document.createElement("button");
      b.className = "picker-cell" + (item.image === src ? " is-current" : "");
      b.innerHTML = `<img src="${esc(src)}" alt="" loading="lazy" />`;
      b.addEventListener("click", () => applyImage({ image: src }));
      grid.appendChild(b);
    });
  }
  function closePicker() { picker.hidden = true; pickerScrim.hidden = true; pickerItem = null; }
  $("#picker-close").addEventListener("click", closePicker);
  pickerScrim.addEventListener("click", closePicker);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !picker.hidden) closePicker(); });

  async function applyImage(body) {
    if (!pickerItem) return;
    try {
      const updated = await api("/api/admin/menu/" + encodeURIComponent(pickerItem.id), {
        method: "PATCH", body: JSON.stringify(body),
      });
      pickerItem.image = updated.image;
      const thumb = pickerRow.querySelector(".row-thumb");
      thumb.src = updated.image;
      thumb.style.visibility = "";
      flash(pickerRow);
      closePicker();
    } catch (err) { alert(err.message); }
  }

  $("#picker-file").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file || !pickerItem) return;
    try {
      const res = await fetch("/api/admin/menu/" + encodeURIComponent(pickerItem.id) + "/image", {
        method: "POST",
        headers: { "Content-Type": file.type, Authorization: "Bearer " + token },
        body: file,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      assetCache = null; // refresh library next open
      pickerItem.image = data.image;
      const thumb = pickerRow.querySelector(".row-thumb");
      thumb.src = data.image;
      thumb.style.visibility = "";
      flash(pickerRow);
      closePicker();
    } catch (err) { alert(err.message); }
    e.target.value = "";
  });

  /* ── export orders CSV (admin) ── */
  $("#export-csv").addEventListener("click", async () => {
    try {
      const res = await fetch("/api/admin/export.csv", { headers: { Authorization: "Bearer " + token } });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "hbh-orders-" + new Date().toISOString().slice(0, 10) + ".csv";
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (err) { alert(err.message); }
  });

  /* ── sales dashboard (admin) ── */
  async function loadStats() {
    if (role !== "admin") return;
    let s;
    try { s = await api("/api/admin/stats"); } catch (e) { return; }

    $("#stat-cards").innerHTML = `
      <div class="stat"><span>Today</span><b>${money(s.today.revenue)}</b><small>${s.today.orders} orders · avg ${money(s.today.avgTicket)}</small></div>
      <div class="stat"><span>All time</span><b>${money(s.total.revenue)}</b><small>${s.total.orders} orders</small></div>
      <div class="stat"><span>Rejected</span><b>${s.total.rejected}</b><small>orders turned away</small></div>`;

    barChart($("#chart-days"), s.days.map((d) => ({ label: d.day.slice(5), value: d.revenue })), (v) => "$" + Math.round(v));
    barChart($("#chart-hours"),
      s.byHour.map((v, h) => ({ label: h % 3 === 0 ? String(h) : "", value: v })).slice(9, 24),
      (v) => String(Math.round(v)));

    const maxQty = Math.max(1, ...s.topItems.map((i) => i.qty));
    $("#top-items").innerHTML = s.topItems.map((i) => `
      <div class="hbar">
        <span class="hbar-name">${esc(i.name)}</span>
        <span class="hbar-track"><i style="width:${(i.qty / maxQty) * 100}%"></i></span>
        <span class="hbar-val">${i.qty} · ${money(i.revenue)}</span>
      </div>`).join("") || '<p class="panel-hint">No sales yet.</p>';

    const totalPay = Math.max(1, s.paySplit.cash + s.paySplit.card + s.paySplit.online);
    $("#pay-split").innerHTML = ["cash", "card", "online"].map((k) => `
      <div class="hbar">
        <span class="hbar-name">${k}</span>
        <span class="hbar-track"><i style="width:${(s.paySplit[k] / totalPay) * 100}%"></i></span>
        <span class="hbar-val">${s.paySplit[k]}</span>
      </div>`).join("");
  }

  /* minimal canvas bar chart, brand colors, no deps */
  function barChart(canvas, data, fmt) {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.style.width = "100%";
    const W = canvas.clientWidth || 600;
    const H = canvas.getAttribute("height") ? +canvas.getAttribute("height") : 200;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.height = H + "px";
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    const max = Math.max(1, ...data.map((d) => d.value));
    const padB = 22, padT = 16;
    const bw = W / data.length;
    ctx.font = "11px 'Spline Sans Mono', monospace";
    data.forEach((d, i) => {
      const h = ((H - padB - padT) * d.value) / max;
      const x = i * bw + bw * 0.18;
      const y = H - padB - h;
      const g = ctx.createLinearGradient(0, y, 0, H - padB);
      g.addColorStop(0, "#E9C455");
      g.addColorStop(1, "#B18E22");
      ctx.fillStyle = d.value ? g : "rgba(233,247,236,0.08)";
      const w = bw * 0.64;
      ctx.beginPath();
      ctx.roundRect(x, y, w, Math.max(2, h), 3);
      ctx.fill();
      if (d.value && bw > 26) {
        ctx.fillStyle = "rgba(241,247,236,0.75)";
        ctx.textAlign = "center";
        ctx.fillText(fmt(d.value), x + w / 2, y - 4);
      }
      ctx.fillStyle = "rgba(163,203,177,0.8)";
      ctx.textAlign = "center";
      ctx.fillText(d.label, x + w / 2, H - 7);
    });
  }

  if (token && role) enter();
  else $("#pin").focus();
})();
