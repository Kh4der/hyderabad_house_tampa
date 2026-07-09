# Hyderabad Biryani House — site + ordering + kitchen dashboard

## Run
```bash
cd site
npm install
npm start          # http://localhost:4000  (or PORT=xxxx)
```
- Customer site: `/`
- Kitchen dashboard: `/admin`
  - **Admin PIN:** `2220` (override with `ADMIN_PIN`)
  - **Employee PIN:** `1111` (override with `EMPLOYEE_PIN`)

## Roles
| Ability | Employee | Admin |
|---|---|---|
| Live order board: **accept / reject** (with reason) / advance orders | ✅ | ✅ |
| **Clear** picked-up orders off the board (per order or “Clear all”) | ✅ | ✅ |
| **Move back** an order one step (fix a mis-tap) | ✅ | ✅ |
| **Print** kitchen ticket / customer receipt | ✅ | ✅ |
| New-order **sound alert** + tab flash (🔔 toggle) | ✅ | ✅ |
| Browse old **receipts** (search + filter, restore cleared orders) | ✅ | ✅ |
| **Pause / resume online ordering** (customers see a banner) | — | ✅ |
| Toggle item availability (sold out) | — | ✅ |
| **Change prices** (inline, saves on Enter/blur) | — | ✅ |
| **Change item images** — pick from the 121-photo library or **upload from your PC** (webp/jpg/png) | — | ✅ |
| **Add / edit / remove dishes** (name, description, price, category) | — | ✅ |
| **Sales dashboard** (today/all-time revenue, 14-day chart, top dishes, orders by hour, payment split) | — | ✅ |
| **Export all orders as CSV** for accounting | — | ✅ |

One PIN box on the login screen — the PIN you type decides your role. Login is
rate-limited (8 tries per IP, then a 15-minute lock). Sessions last 12 hours.

## Online payments (Stripe)
Off by default; the customer checkout only shows cash / card-at-pickup.
To enable "Pay now online":

```bash
STRIPE_SECRET_KEY=sk_live_...        # or sk_test_... to try it
STRIPE_WEBHOOK_SECRET=whsec_...      # optional but recommended
SITE_URL=https://yourdomain.com      # used for Stripe return URLs
```

Flow: order is stored as `awaiting-payment` → customer pays on Stripe Checkout →
webhook (`POST /api/stripe/webhook`) or the success-page verify call flips it to
`new` + `paid`, and it appears on the kitchen board with a "Paid online ✓" badge.
Unpaid online orders never show on the board. Set the webhook in the Stripe
dashboard to `https://yourdomain.com/api/stripe/webhook` with event
`checkout.session.completed`. Without a webhook, payment is still verified
against the Stripe API when the customer lands back on the site.

## Analytics (PostHog)
Off by default. To enable:

```bash
POSTHOG_KEY=phc_...                          # project API key
POSTHOG_HOST=https://us.i.posthog.com        # or https://eu.i.posthog.com
```

The customer site then auto-captures pageviews/clicks and sends these events:
- `add_to_cart` — `item`, `price`
- `checkout_started` — `items`, `subtotal`
- `order_placed` — `order_id`, `total`, `payment`, `items`
- `order_paid_online` — `order_id`

**Dashboards to create in PostHog** (Dashboards → New):
1. **Traffic** — `$pageview` trends (unique visitors, DAU/WAU), top referrers, device breakdown.
2. **Ordering funnel** — `$pageview → add_to_cart → checkout_started → order_placed`; watch the drop-off between checkout and placed.
3. **Revenue** — `order_placed` trend with `total` summed as a property; break down by `payment`.
4. **Popular dishes** — `add_to_cart` broken down by `item`.
Enable Session Replay in the PostHog project to watch real ordering sessions.

## What's here
| Piece | Where | Notes |
|---|---|---|
| Customer site | `public/index.html`, `js/main.js`, `css/main.css` | Emerald/gold, native-smooth build: IntersectionObserver reveals, autoplaying kitchen videos, drift gallery, scroll-snap signature row. |
| Fire sparks | `public/js/sparks.js` | Logo trace on first visit + ember bursts on add-to-cart. |
| Menu + ordering API | `server.js` | 91 items, 11 categories. Server-side price validation — client prices are never trusted. 4% card fee, 7.5% FL tax estimate. |
| Kitchen dashboard | `public/admin.html`, `js/admin.js` | Role-gated tabs, 4s polling, accept/reject, receipts, menu editor, sales charts (vanilla canvas). |
| Data | `data/menu.json`, `data/orders.json` | Flat-file storage. Swap for SQLite/Postgres for production. |
| Uploads | `public/assets/uploads/` | Item photos uploaded from the admin image picker land here. |

## Design system
Emerald charcoal `#0A3520` / cream `#F1F7EC` / saffron accent `#D9B23C`.
Bricolage Grotesque display, Archivo body, Spline Sans Mono prices, Amiri for
the Urdu heritage mark. Pill buttons, 14px cards, 10px inputs. Reduced motion
honored everywhere.

## Before production
- Set strong `ADMIN_PIN` / `EMPLOYEE_PIN`; put the site behind HTTPS.
- Use `sk_live_` Stripe keys + a real webhook secret.
- Replace flat-file orders with SQLite/Postgres; add printer/webhook integration for the kitchen.
- Serve fonts locally (currently Google Fonts CDN).
- Confirm tax rate (incl. whether the 4% surcharge is taxable in FL) and the old-address discrepancy (one IG graphic says 6130, site says 6810 E Fowler Ave).
