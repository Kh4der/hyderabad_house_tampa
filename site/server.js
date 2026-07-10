/* Hyderabad Biryani House — site + ordering API + role-based admin */
const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
app.set("trust proxy", true); // on Vercel the real client IP is in x-forwarded-for
const PORT = process.env.PORT || 4000;
const ADMIN_PIN = process.env.ADMIN_PIN || "2220";
const EMPLOYEE_PIN = process.env.EMPLOYEE_PIN || "1111";
const SITE_URL = (process.env.SITE_URL || `http://localhost:${PORT}`).replace(/\/$/, "");

/* Stripe: online card payments switch on when a key is provided */
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";
let stripe = null;
if (STRIPE_SECRET_KEY) {
  try { stripe = require("stripe")(STRIPE_SECRET_KEY); }
  catch (e) { console.warn("STRIPE_SECRET_KEY set but the stripe package is missing — run: npm install stripe"); }
}

/* PostHog: analytics switch on when a key is provided */
const POSTHOG_KEY = process.env.POSTHOG_KEY || "";
const POSTHOG_HOST = process.env.POSTHOG_HOST || "https://us.i.posthog.com";

/* Dine-in: how many tables have a QR code, and where "get it delivered"
   sends people. The delivery apps can't accept our cart, so these just
   open the restaurant's storefront on each app. Override via env if the
   store URLs ever change. */
const TABLE_COUNT = parseInt(process.env.TABLE_COUNT, 10) || 25;
const UBER_EATS_URL = process.env.UBER_EATS_URL ||
  "https://www.ubereats.com/store/hyderabad-biryani-house-indian-cuisine-usf/KwUx7-JFRAKZBJg5cmTCIA";
const DOORDASH_URL = process.env.DOORDASH_URL ||
  "https://www.doordash.com/en/store/hyderabad-biryani-house-tampa-259446/";

/* On Vercel the filesystem is read-only except /tmp, and /tmp resets on
   cold starts. Seed /tmp from the bundled data so everything works; for
   durable orders in production, move this layer to a database (see README). */
const IS_VERCEL = !!process.env.VERCEL;
const DATA_SRC = path.join(__dirname, "data");
const DATA_DIR = IS_VERCEL ? path.join("/tmp", "hbh-data") : DATA_SRC;
if (IS_VERCEL) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  for (const f of ["menu.json", "orders.json", "settings.json"]) {
    const dest = path.join(DATA_DIR, f);
    const src = path.join(DATA_SRC, f);
    if (!fs.existsSync(dest) && fs.existsSync(src)) fs.copyFileSync(src, dest);
  }
}
const MENU_FILE = path.join(DATA_DIR, "menu.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");
const UPLOADS_DIR = IS_VERCEL
  ? path.join("/tmp", "hbh-uploads")
  : path.join(__dirname, "public", "assets", "uploads");
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const readJSON = (f) => JSON.parse(fs.readFileSync(f, "utf-8").replace(/^﻿/, ""));
const writeJSON = (f, v) => fs.writeFileSync(f, JSON.stringify(v, null, 1));

if (!fs.existsSync(SETTINGS_FILE)) {
  writeJSON(SETTINGS_FILE, { orderingOpen: true, pauseMessage: "" });
}

/* ---- sessions: stateless signed tokens. An in-memory Map does NOT work on
   Vercel — each serverless instance has its own, so you'd sign in on one and
   get bounced (401) on the next request routed elsewhere. A signed token
   "role.exp.hmac" verifies on any instance. Set AUTH_SECRET in the env for a
   fixed secret; otherwise it's derived from the PINs (stable across instances). ---- */
const SESSION_TTL = 12 * 60 * 60 * 1000; // 12h
const AUTH_SECRET = process.env.AUTH_SECRET ||
  crypto.createHash("sha256").update(`${ADMIN_PIN}|${EMPLOYEE_PIN}|hbh-session-v1`).digest("hex");
function signSession(role) {
  const body = `${role}.${Date.now() + SESSION_TTL}`;
  const sig = crypto.createHmac("sha256", AUTH_SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}
function verifySession(token) {
  if (!token) return null;
  const cut = token.lastIndexOf(".");
  if (cut < 0) return null;
  const body = token.slice(0, cut);
  const sig = Buffer.from(token.slice(cut + 1));
  const expect = Buffer.from(crypto.createHmac("sha256", AUTH_SECRET).update(body).digest("base64url"));
  if (sig.length !== expect.length || !crypto.timingSafeEqual(sig, expect)) return null;
  const [role, exp] = body.split(".");
  if (!["admin", "employee"].includes(role) || Date.now() > Number(exp)) return null;
  return role;
}
const auth = (...roles) => (req, res, next) => {
  const t = (req.headers.authorization || "").replace("Bearer ", "");
  const role = verifySession(t);
  if (!role) return res.status(401).json({ error: "Not signed in" });
  if (roles.length && !roles.includes(role)) {
    return res.status(403).json({ error: "Not allowed for your role" });
  }
  req.role = role;
  next();
};

/* ---- login rate limit: 8 tries then a 15-minute lock, per IP ---- */
const loginAttempts = new Map();
function loginAllowed(ip) {
  const a = loginAttempts.get(ip);
  if (!a) return true;
  if (Date.now() - a.first > 15 * 60 * 1000) { loginAttempts.delete(ip); return true; }
  return a.count < 8;
}
function loginFailed(ip) {
  const a = loginAttempts.get(ip) || { count: 0, first: Date.now() };
  a.count++;
  loginAttempts.set(ip, a);
}

/* ---- Stripe webhook needs the raw body, so it mounts before express.json ---- */
app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), (req, res) => {
  if (!stripe) return res.sendStatus(400);
  let event;
  try {
    event = STRIPE_WEBHOOK_SECRET
      ? stripe.webhooks.constructEvent(req.body, req.headers["stripe-signature"], STRIPE_WEBHOOK_SECRET)
      : JSON.parse(req.body);
  } catch (e) {
    return res.status(400).json({ error: "Bad signature" });
  }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orders = readJSON(ORDERS_FILE);
    const order = orders.find((o) => o.stripeSessionId === session.id);
    if (order && order.status === "awaiting-payment") {
      order.status = "new";
      order.paid = true;
      writeJSON(ORDERS_FILE, orders);
    }
  }
  res.json({ received: true });
});

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Private-Network", "true");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});
app.use(express.static(path.join(__dirname, "public"), { extensions: ["html"] }));
/* uploads live outside public on Vercel (/tmp), so serve them explicitly */
if (IS_VERCEL) {
  app.use("/assets/uploads", express.static(UPLOADS_DIR));
}

/* ---- public API ---- */
app.get("/api/menu", (req, res) => res.json(readJSON(MENU_FILE)));

/* client feature flags (never exposes secrets) */
app.get("/api/config", (req, res) => {
  const settings = readJSON(SETTINGS_FILE);
  res.json({
    stripeEnabled: !!stripe,
    posthogKey: POSTHOG_KEY || null,
    posthogHost: POSTHOG_KEY ? POSTHOG_HOST : null,
    orderingOpen: settings.orderingOpen !== false,
    pauseMessage: settings.pauseMessage || "",
    tableCount: TABLE_COUNT,
    uberEatsUrl: UBER_EATS_URL || null,
    doorDashUrl: DOORDASH_URL || null,
  });
});

const CARD_FEE_RATE = 0.04;
const TAX_RATE = 0.075; // FL + Hillsborough sales tax est.

function priceOrder(items, payment) {
  const menu = readJSON(MENU_FILE);
  const lookup = {};
  menu.categories.forEach((c) => c.items.forEach((i) => (lookup[i.id] = i)));
  const lines = [];
  for (const line of items) {
    const item = lookup[line.id];
    const qty = Math.max(1, Math.min(50, parseInt(line.qty, 10) || 1));
    if (!item) return { error: "An item in your cart no longer exists.", code: 400 };
    if (!item.available) return { error: `${item.name} is sold out today. Remove it to continue.`, code: 409 };
    lines.push({ id: item.id, name: item.name, price: item.price, qty });
  }
  const subtotal = +lines.reduce((s, l) => s + l.price * l.qty, 0).toFixed(2);
  const cardFee = payment === "card" || payment === "online" ? +(subtotal * CARD_FEE_RATE).toFixed(2) : 0;
  const tax = +(subtotal * TAX_RATE).toFixed(2);
  const total = +(subtotal + cardFee + tax).toFixed(2);
  return { lines, subtotal, cardFee, tax, total };
}

app.post("/api/orders", async (req, res) => {
  const settings = readJSON(SETTINGS_FILE);
  if (settings.orderingOpen === false) {
    return res.status(423).json({
      error: settings.pauseMessage || "Online ordering is paused right now. Call (813) 988-2220 to order.",
    });
  }
  const { name, phone, pickupTime, payment, notes, items, orderType, table } = req.body || {};

  /* dine-in (scanned a table QR) vs pickup (ordered from anywhere) */
  const type = orderType === "dine-in" ? "dine-in" : "pickup";
  let tableNo = null;
  if (type === "dine-in") {
    tableNo = parseInt(table, 10);
    if (!(tableNo >= 1 && tableNo <= TABLE_COUNT)) {
      return res.status(400).json({ error: "That table number isn't valid — please rescan the QR code on your table." });
    }
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Add at least one item to your order." });
  }

  const cleanName = String(name || "").trim().slice(0, 80);
  const cleanPhone = String(phone || "").trim().slice(0, 25);
  if (type === "pickup") {
    /* pickup needs a name + phone so the kitchen can call when it's ready */
    if (!cleanName) return res.status(400).json({ error: "Name, phone, and at least one item are required." });
    if (!/^[\d\s()+.-]{7,}$/.test(cleanPhone)) return res.status(400).json({ error: "Enter a valid phone number." });
  } else if (cleanPhone && !/^[\d\s()+.-]{7,}$/.test(cleanPhone)) {
    /* dine-in name + phone are optional, but a bad phone is still rejected */
    return res.status(400).json({ error: "Enter a valid phone number, or leave it blank." });
  }

  /* pay-now-online is pickup-only; dine-in always settles at the table/counter */
  let pay;
  if (type === "dine-in") {
    pay = "counter";
  } else {
    pay = ["card", "online"].includes(payment) ? payment : "cash";
    if (pay === "online" && !stripe) {
      return res.status(400).json({ error: "Online payment is not available right now. Choose cash or card at pickup." });
    }
  }

  const priced = priceOrder(items, pay);
  if (priced.error) return res.status(priced.code).json({ error: priced.error });

  const orders = readJSON(ORDERS_FILE);
  const order = {
    id: "HBH-" + String(orders.length + 1).padStart(4, "0") + "-" + crypto.randomBytes(2).toString("hex").toUpperCase(),
    placedAt: new Date().toISOString(),
    status: pay === "online" ? "awaiting-payment" : "new",
    paid: false,
    orderType: type,
    table: tableNo,
    name: cleanName || (type === "dine-in" ? "Table " + tableNo : ""),
    phone: cleanPhone,
    pickupTime: type === "dine-in" ? "Dine-in" : String(pickupTime || "ASAP").slice(0, 40),
    payment: pay,
    notes: String(notes || "").slice(0, 500),
    lines: priced.lines,
    subtotal: priced.subtotal,
    cardFee: priced.cardFee,
    tax: priced.tax,
    total: priced.total,
  };

  if (pay === "online") {
    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [{
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(order.total * 100),
            product_data: {
              name: `Hyderabad Biryani House pickup ${order.id}`,
              description: order.lines.map((l) => `${l.qty}× ${l.name}`).join(", ").slice(0, 500),
            },
          },
        }],
        metadata: { orderId: order.id },
        success_url: `${SITE_URL}/?paid=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${SITE_URL}/?cancelled=${order.id}`,
      });
      order.stripeSessionId = session.id;
      orders.push(order);
      writeJSON(ORDERS_FILE, orders);
      return res.status(201).json({ id: order.id, total: order.total, pickupTime: order.pickupTime, checkoutUrl: session.url });
    } catch (e) {
      console.error("Stripe session failed:", e.message);
      return res.status(502).json({ error: "Could not start online payment. Choose cash or card at pickup." });
    }
  }

  orders.push(order);
  writeJSON(ORDERS_FILE, orders);
  res.status(201).json({
    id: order.id, total: order.total, pickupTime: order.pickupTime,
    orderType: order.orderType, table: order.table,
  });
});

/* success-page fallback when no webhook is configured (e.g. local dev):
   verifies the checkout session with Stripe before marking paid */
app.post("/api/orders/:id/verify-payment", async (req, res) => {
  if (!stripe) return res.status(400).json({ error: "Online payment not enabled" });
  const orders = readJSON(ORDERS_FILE);
  const order = orders.find((o) => o.id === req.params.id);
  if (!order || !order.stripeSessionId) return res.status(404).json({ error: "No such order" });
  if (order.paid) return res.json({ paid: true, status: order.status });
  try {
    const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
    if (session.payment_status === "paid") {
      order.paid = true;
      if (order.status === "awaiting-payment") order.status = "new";
      writeJSON(ORDERS_FILE, orders);
    }
    res.json({ paid: order.paid, status: order.status });
  } catch (e) {
    res.status(502).json({ error: "Could not verify payment" });
  }
});

/* ---- login: one PIN box, the PIN decides the role ---- */
app.post("/api/admin/login", (req, res) => {
  const ip = req.ip || "?";
  if (!loginAllowed(ip)) return res.status(429).json({ error: "Too many attempts. Try again in 15 minutes." });
  const pin = String(req.body?.pin || "");
  const role = pin === ADMIN_PIN ? "admin" : pin === EMPLOYEE_PIN ? "employee" : null;
  if (!role) { loginFailed(ip); return res.status(401).json({ error: "Wrong PIN" }); }
  loginAttempts.delete(ip);
  res.json({ token: signSession(role), role });
});

/* ---- shared: orders board + receipts (admin + employee) ---- */
app.get("/api/admin/orders", auth("admin", "employee"), (req, res) => {
  res.json(readJSON(ORDERS_FILE).slice().reverse());
});

const STATUSES = ["new", "preparing", "ready", "done", "rejected"];
app.patch("/api/admin/orders/:id", auth("admin", "employee"), (req, res) => {
  const { status, archived, rejectReason } = req.body || {};
  if (status !== undefined && !STATUSES.includes(status)) return res.status(400).json({ error: "Bad status" });
  const orders = readJSON(ORDERS_FILE);
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "No such order" });
  if (status !== undefined) {
    order.status = status;
    if (status === "rejected") {
      order.rejectedAt = new Date().toISOString();
      if (rejectReason) order.rejectReason = String(rejectReason).slice(0, 200);
    }
    if (status === "done") order.doneAt = new Date().toISOString();
  }
  if (typeof archived === "boolean") order.archived = archived;
  writeJSON(ORDERS_FILE, orders);
  res.json(order);
});

/* clear the whole Done column in one tap */
app.post("/api/admin/orders/clear-done", auth("admin", "employee"), (req, res) => {
  const orders = readJSON(ORDERS_FILE);
  let n = 0;
  for (const o of orders) {
    if (o.status === "done" && !o.archived) { o.archived = true; n++; }
  }
  writeJSON(ORDERS_FILE, orders);
  res.json({ cleared: n });
});

/* ---- admin only: store settings (pause/resume online ordering) ---- */
app.patch("/api/admin/settings", auth("admin"), (req, res) => {
  const settings = readJSON(SETTINGS_FILE);
  if (typeof req.body?.orderingOpen === "boolean") settings.orderingOpen = req.body.orderingOpen;
  if (req.body?.pauseMessage !== undefined) settings.pauseMessage = String(req.body.pauseMessage).slice(0, 200);
  writeJSON(SETTINGS_FILE, settings);
  res.json(settings);
});

/* ---- admin only: menu editing (availability, price, image, name, description) ---- */
function findMenuItem(menu, id) {
  for (const c of menu.categories) for (const i of c.items) if (i.id === id) return i;
  return null;
}
const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

app.patch("/api/admin/menu/:id", auth("admin"), (req, res) => {
  const menu = readJSON(MENU_FILE);
  const item = findMenuItem(menu, req.params.id);
  if (!item) return res.status(404).json({ error: "No such item" });

  if (typeof req.body?.available === "boolean") item.available = req.body.available;

  if (req.body?.price !== undefined) {
    const p = Number(req.body.price);
    if (!Number.isFinite(p) || p < 0 || p > 500) return res.status(400).json({ error: "Price must be between $0 and $500." });
    item.price = Math.round(p * 100) / 100;
  }

  if (req.body?.name !== undefined) {
    const n = String(req.body.name).trim().slice(0, 80);
    if (!n) return res.status(400).json({ error: "Name cannot be empty." });
    item.name = n;
  }
  if (req.body?.description !== undefined) {
    item.description = String(req.body.description).trim().slice(0, 300);
  }

  if (req.body?.image !== undefined) {
    const img = String(req.body.image);
    const rel = img.replace(/^\//, "").replace(/\\/g, "/");
    if (!rel.startsWith("assets/") || rel.includes("..")) return res.status(400).json({ error: "Image must live under /assets/." });
    if (!fs.existsSync(path.join(__dirname, "public", rel))) return res.status(400).json({ error: "That image file does not exist." });
    item.image = "/" + rel;
  }

  writeJSON(MENU_FILE, menu);
  res.json(item);
});

/* add a new dish to a category */
app.post("/api/admin/menu", auth("admin"), (req, res) => {
  const { category, name, price, description } = req.body || {};
  const menu = readJSON(MENU_FILE);
  const cat = menu.categories.find((c) => c.name === category);
  if (!cat) return res.status(400).json({ error: "Unknown category." });
  const n = String(name || "").trim().slice(0, 80);
  const p = Number(price);
  if (!n) return res.status(400).json({ error: "The dish needs a name." });
  if (!Number.isFinite(p) || p < 0 || p > 500) return res.status(400).json({ error: "Price must be between $0 and $500." });

  const maxId = menu.categories
    .flatMap((c) => c.items)
    .reduce((m, i) => Math.max(m, parseInt(String(i.id).replace(/\D/g, ""), 10) || 0), 0);
  const item = {
    id: "i" + String(maxId + 1).padStart(3, "0"),
    slug: slugify(n) || "dish-" + (maxId + 1),
    name: n,
    price: Math.round(p * 100) / 100,
    description: String(description || "").trim().slice(0, 300),
    image: null,
    available: true,
    highlight: false,
  };
  cat.items.push(item);
  writeJSON(MENU_FILE, menu);
  res.status(201).json(item);
});

/* remove a dish */
app.delete("/api/admin/menu/:id", auth("admin"), (req, res) => {
  const menu = readJSON(MENU_FILE);
  for (const c of menu.categories) {
    const idx = c.items.findIndex((i) => i.id === req.params.id);
    if (idx !== -1) {
      const [removed] = c.items.splice(idx, 1);
      writeJSON(MENU_FILE, menu);
      return res.json({ removed: removed.id });
    }
  }
  res.status(404).json({ error: "No such item" });
});

/* ---- admin only: export all orders as CSV for accounting ---- */
app.get("/api/admin/export.csv", auth("admin"), (req, res) => {
  const orders = readJSON(ORDERS_FILE);
  const csvCell = (v) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const head = "id,placedAt,status,type,table,name,phone,pickupTime,payment,paid,items,subtotal,cardFee,tax,total,notes";
  const rows = orders.map((o) =>
    [
      o.id, o.placedAt, o.status, o.orderType || "pickup", o.table || "",
      o.name, o.phone, o.pickupTime, o.payment, o.paid ? "yes" : "no",
      o.lines.map((l) => `${l.qty}x ${l.name}`).join("; "),
      o.subtotal.toFixed(2), (o.cardFee || 0).toFixed(2), o.tax.toFixed(2), o.total.toFixed(2),
      o.notes || "",
    ].map(csvCell).join(",")
  );
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="hbh-orders-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send([head, ...rows].join("\n"));
});

/* upload a new photo for an item (raw image body) */
const IMG_TYPES = { "image/webp": ".webp", "image/jpeg": ".jpg", "image/png": ".png" };
app.post("/api/admin/menu/:id/image", auth("admin"),
  express.raw({ type: Object.keys(IMG_TYPES), limit: "8mb" }),
  (req, res) => {
    const ext = IMG_TYPES[(req.headers["content-type"] || "").split(";")[0]];
    if (!ext || !Buffer.isBuffer(req.body) || !req.body.length) {
      return res.status(400).json({ error: "Send the image file as the request body (webp, jpg, or png)." });
    }
    const menu = readJSON(MENU_FILE);
    const item = findMenuItem(menu, req.params.id);
    if (!item) return res.status(404).json({ error: "No such item" });
    const file = `${item.slug || item.id}-${Date.now()}${ext}`;
    fs.writeFileSync(path.join(UPLOADS_DIR, file), req.body);
    item.image = "/assets/uploads/" + file;
    writeJSON(MENU_FILE, menu);
    res.json(item);
  }
);

/* browsable image library for the "change image" picker */
app.get("/api/admin/assets", auth("admin"), (req, res) => {
  const dirs = ["dishes", "site", "stock", "plates", "uploads"];
  const out = [];
  for (const d of dirs) {
    const full = path.join(__dirname, "public", "assets", d);
    if (!fs.existsSync(full)) continue;
    for (const f of fs.readdirSync(full)) {
      if (/\.(webp|jpe?g|png)$/i.test(f)) out.push(`/assets/${d}/${f}`);
    }
  }
  res.json(out);
});

/* ---- admin only: sales dashboard data ---- */
app.get("/api/admin/stats", auth("admin"), (req, res) => {
  const orders = readJSON(ORDERS_FILE);
  const sold = orders.filter((o) => !["rejected", "awaiting-payment"].includes(o.status));
  const dayKey = (iso) => iso.slice(0, 10);
  const today = dayKey(new Date().toISOString());

  /* last 14 days revenue + order counts */
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    days.push(dayKey(d.toISOString()));
  }
  const byDay = Object.fromEntries(days.map((d) => [d, { revenue: 0, orders: 0 }]));
  for (const o of sold) {
    const k = dayKey(o.placedAt);
    if (byDay[k]) { byDay[k].revenue += o.total; byDay[k].orders++; }
  }

  /* top items all-time */
  const itemTotals = {};
  for (const o of sold) for (const l of o.lines) {
    itemTotals[l.name] = itemTotals[l.name] || { qty: 0, revenue: 0 };
    itemTotals[l.name].qty += l.qty;
    itemTotals[l.name].revenue += l.price * l.qty;
  }
  const topItems = Object.entries(itemTotals)
    .map(([name, v]) => ({ name, ...v, revenue: +v.revenue.toFixed(2) }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 10);

  /* payment + hour-of-day split */
  const paySplit = { cash: 0, card: 0, online: 0, counter: 0 };
  const byHour = Array(24).fill(0);
  for (const o of sold) {
    paySplit[o.payment] = (paySplit[o.payment] || 0) + 1;
    byHour[new Date(o.placedAt).getHours()]++;
  }
  const typeSplit = { pickup: 0, "dine-in": 0 };
  for (const o of sold) typeSplit[o.orderType === "dine-in" ? "dine-in" : "pickup"]++;

  const todays = sold.filter((o) => dayKey(o.placedAt) === today);
  res.json({
    today: {
      revenue: +todays.reduce((s, o) => s + o.total, 0).toFixed(2),
      orders: todays.length,
      avgTicket: todays.length ? +(todays.reduce((s, o) => s + o.total, 0) / todays.length).toFixed(2) : 0,
    },
    total: {
      revenue: +sold.reduce((s, o) => s + o.total, 0).toFixed(2),
      orders: sold.length,
      rejected: orders.filter((o) => o.status === "rejected").length,
    },
    days: days.map((d) => ({ day: d, revenue: +byDay[d].revenue.toFixed(2), orders: byDay[d].orders })),
    topItems,
    paySplit,
    typeSplit,
    byHour,
  });
});

/* ---- 404: branded page for pages, JSON for the API. Also the fallback
   that Vercel routes unmatched paths to (see vercel.json). ---- */
app.use((req, res) => {
  if (req.path.startsWith("/api/")) return res.status(404).json({ error: "Not found" });
  res.status(404);
  const p = path.join(__dirname, "public", "404.html");
  return fs.existsSync(p) ? res.sendFile(p) : res.type("txt").send("Not found");
});

if (require.main === module) {
  app.listen(PORT, () =>
    console.log(
      `HBH site  http://localhost:${PORT}\n` +
      `  admin: /admin  (admin PIN ${ADMIN_PIN}, employee PIN ${EMPLOYEE_PIN})\n` +
      `  stripe: ${stripe ? "ENABLED" : "off (set STRIPE_SECRET_KEY)"}   posthog: ${POSTHOG_KEY ? "ENABLED" : "off (set POSTHOG_KEY)"}`
    )
  );
}

module.exports = app;
