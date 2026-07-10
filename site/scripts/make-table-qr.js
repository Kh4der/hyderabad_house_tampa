/* Generate table QR codes for Hyderabad Biryani House.
 *
 *   node scripts/make-table-qr.js [baseUrl] [count]
 *
 * Each QR encodes  <baseUrl>/?table=N  so scanning a table's code opens the
 * menu already tagged to that table (the order lands in the kitchen marked
 * "Table N", settled at the table/counter). Defaults to the live site.
 *
 * Outputs:
 *   public/assets/qr/tables/qr-table-01.png … -NN.png   (raw codes)
 *   public/qr-tables.html                               (print-ready tent sheet)
 *
 * Re-run any time the domain or table count changes. Pure JS, no native deps. */
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");

const BASE = (process.argv[2] || process.env.SITE_URL || "https://hyderabadhouse.vercel.app").replace(/\/$/, "");
const COUNT = parseInt(process.argv[3] || process.env.TABLE_COUNT, 10) || 25;

const PUBLIC = path.join(__dirname, "..", "public");
const OUT_DIR = path.join(PUBLIC, "assets", "qr", "tables");
fs.mkdirSync(OUT_DIR, { recursive: true });

const pad = (n) => String(n).padStart(2, "0");
const tableUrl = (n) => `${BASE}/?table=${n}`;

const QR_OPTS = {
  errorCorrectionLevel: "M",
  margin: 2,
  width: 620,
  color: { dark: "#0A3520", light: "#ffffff" }, // brand green on white, high contrast for scanning
};

async function main() {
  const files = [];
  for (let n = 1; n <= COUNT; n++) {
    const file = `qr-table-${pad(n)}.png`;
    await QRCode.toFile(path.join(OUT_DIR, file), tableUrl(n), QR_OPTS);
    files.push({ n, file, url: tableUrl(n) });
  }

  writeSheet(files);

  console.log(`Generated ${COUNT} table QR codes → ${path.relative(process.cwd(), OUT_DIR)}`);
  console.log(`  encoding: ${tableUrl(1)} … ${tableUrl(COUNT)}`);
  console.log(`Print sheet → ${path.relative(process.cwd(), path.join(PUBLIC, "qr-tables.html"))}  (open /qr-tables.html and print)`);
}

/* one self-contained HTML page: 25 branded table tents, laid out to print
   and cut. Cards reference the PNGs above by their public path. */
function writeSheet(files) {
  const cards = files.map(({ n, file }) => `
    <article class="tent">
      <img class="tent-logo" src="/assets/logo/logo-mark.webp" alt="" width="46" height="46" />
      <p class="tent-brand">Hyderabad Biryani House</p>
      <p class="tent-num">Table ${n}</p>
      <img class="tent-qr" src="/assets/qr/tables/${file}" alt="QR code for table ${n}" width="220" height="220" />
      <p class="tent-cta">Scan to see the menu<br/>&amp; order from your table</p>
      <p class="tent-foot">Dum biryani · mandi · tandoori — pay at the table</p>
    </article>`).join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="robots" content="noindex" />
<title>HBH · Table QR codes to print</title>
<link rel="icon" href="/assets/logo/logo-square.webp" />
<style>
  :root { --char:#0A3520; --soot:#10452C; --cream:#F1F7EC; --muted:#A3CBB1; --saffron:#D9B23C; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #0b2a1c; color: var(--cream);
    font-family: "Archivo", system-ui, sans-serif; }
  .sheet-head { text-align: center; padding: 26px 20px 8px; }
  .sheet-head h1 { font-family: "Bricolage Grotesque", system-ui, sans-serif; margin: 0 0 6px; }
  .sheet-head p { color: var(--muted); margin: 0; font-size: .92rem; }
  .sheet-head button { margin-top: 14px; padding: 11px 22px; border: 0; border-radius: 10px;
    background: var(--saffron); color: #23180a; font-weight: 700; font-size: .95rem; cursor: pointer; }
  .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px;
    max-width: 900px; margin: 20px auto 60px; padding: 0 16px; }
  .tent { break-inside: avoid; text-align: center; background: #fff; color: var(--char);
    border-radius: 16px; padding: 22px 18px 18px; border: 2px solid #0A3520; }
  .tent-logo { display: block; margin: 0 auto 6px; }
  .tent-brand { font-family: "Bricolage Grotesque", system-ui, sans-serif; font-weight: 700;
    letter-spacing: .01em; margin: 0; font-size: 1rem; }
  .tent-num { font-family: "Bricolage Grotesque", system-ui, sans-serif; font-weight: 800;
    font-size: 2.1rem; margin: 4px 0 10px; color: #0A3520; }
  .tent-qr { width: 220px; height: 220px; display: block; margin: 0 auto; }
  .tent-cta { font-weight: 700; font-size: 1.02rem; margin: 12px 0 4px; line-height: 1.25; }
  .tent-foot { color: #4c6a58; font-size: .74rem; margin: 6px 0 0; }
  @media print {
    body { background: #fff; color: #000; }
    .sheet-head { display: none; }
    .grid { gap: 10px; margin: 0; max-width: none; padding: 8px; }
    .tent { border: 1px dashed #999; border-radius: 10px; }
    .tent-num { color: #000; }
  }
  @page { margin: 10mm; }
</style>
</head>
<body>
  <div class="sheet-head">
    <h1>Table QR codes</h1>
    <p>${COUNT} tables · each opens the menu tagged to that table. Print, cut along the guides, and stand one on each table.</p>
    <button onclick="window.print()">Print all ${COUNT}</button>
  </div>
  <div class="grid">${cards}
  </div>
</body>
</html>`;
  fs.writeFileSync(path.join(PUBLIC, "qr-tables.html"), html);
}

main().catch((e) => { console.error(e); process.exit(1); });
