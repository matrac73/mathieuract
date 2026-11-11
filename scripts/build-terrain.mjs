// Builds the real relief around each stage, as a grid of heights the site turns into cubes.
//   node scripts/build-terrain.mjs <slug>
// Source: Mapzen / AWS open "terrarium" elevation tiles (SRTM & national DEMs), no key needed.
// Output: public/adventures/<slug>/terrain/day-NN.json (one per stage) + overview.json (whole trip).
// Tiles are cached in data-raw/dem/ (git-ignored).
import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";

const slug = process.argv[2];
if (!slug) { console.error("usage: node scripts/build-terrain.mjs <slug>"); process.exit(1); }
const ROOT = process.cwd();
const DAYS = path.join(ROOT, "content", "adventures", slug, "days");
const OUT = path.join(ROOT, "public", "adventures", slug, "terrain");
const CACHE = path.join(ROOT, "data-raw", "dem");
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(CACHE, { recursive: true });

// ---------- elevation tiles ----------
const tiles = new Map();
async function tile(z, x, y) {
  const key = `${z}-${x}-${y}`;
  if (tiles.has(key)) return tiles.get(key);
  const file = path.join(CACHE, `${key}.png`);
  if (!fs.existsSync(file)) {
    const res = await fetch(`https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`, { signal: AbortSignal.timeout(40000) });
    if (!res.ok) throw new Error(`tile ${key}: HTTP ${res.status}`);
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  }
  const png = PNG.sync.read(fs.readFileSync(file));
  tiles.set(key, png.data);
  return png.data;
}
const px = (data, i, j) => { const o = (j * 256 + i) * 4; return data[o] * 256 + data[o + 1] + data[o + 2] / 256 - 32768; };
async function eleAt(lat, lon, z) {
  const n = 2 ** z;
  const fx = ((lon + 180) / 360) * n * 256 - 0.5;
  const r = (lat * Math.PI) / 180;
  const fy = ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * n * 256 - 0.5;
  const x0 = Math.floor(fx), y0 = Math.floor(fy), ax = fx - x0, ay = fy - y0;
  const at = async (X, Y) => px(await tile(z, Math.floor(X / 256), Math.floor(Y / 256)), X & 255, Y & 255);
  const [a, b, c, d] = [await at(x0, y0), await at(x0 + 1, y0), await at(x0, y0 + 1), await at(x0 + 1, y0 + 1)];
  return a * (1 - ax) * (1 - ay) + b * ax * (1 - ay) + c * (1 - ax) * ay + d * ax * ay;
}
const zoomFor = (cellKm, lat) => {
  for (let z = 7; z <= 12; z++) if ((40075 * Math.cos((lat * Math.PI) / 180)) / (2 ** z * 256) <= cellKm / 1.4) return z;
  return 12;
};
const b64 = (u8) => Buffer.from(u8).toString("base64");
const r2 = (v) => Math.round(v * 100) / 100;

// ---------- one stage ----------
const NU = 128, NV_MIN = 56, NV_MAX = 104;
const rad = (d) => (d * Math.PI) / 180;

/** share of the route a camera pitched `pitch` degrees down can see (nothing nearer hides it) */
function visibility(h, nu, nv, ru, rv, zOf, pitch) {
  const tan = Math.tan(rad(pitch));
  let seen = 0;
  for (let i = 0; i < ru.length; i++) {
    const cu = Math.min(nu - 1, Math.max(0, Math.floor(ru[i]))), cv = Math.min(nv - 1, Math.max(0, Math.floor(rv[i])));
    const pz = zOf(h[cv * nu + cu]) + 0.6;
    let ok = true;
    for (let k = cv - 1, t = 1; k >= 0; k--, t++) if (zOf(h[k * nu + cu]) > pz + t * tan) { ok = false; break; }
    if (ok) seen++;
  }
  return seen / ru.length;
}

async function stage(file) {
  const day = JSON.parse(fs.readFileSync(path.join(DAYS, file), "utf8"));
  const { lat, lon } = day.profile;
  const lat0 = (Math.min(...lat) + Math.max(...lat)) / 2, lon0 = (Math.min(...lon) + Math.max(...lon)) / 2;
  const kx = 111.32 * Math.cos(rad(lat0)), ky = 110.57;
  const X = lon.map((l) => (l - lon0) * kx), Y = lat.map((l) => (l - lat0) * ky);
  // principal axis of the route, pointing from start to end
  const mx = X.reduce((a, b) => a + b, 0) / X.length, my = Y.reduce((a, b) => a + b, 0) / Y.length;
  let sxx = 0, syy = 0, sxy = 0;
  X.forEach((x, i) => { sxx += (x - mx) ** 2; syy += (Y[i] - my) ** 2; sxy += (x - mx) * (Y[i] - my); });
  let axis = 0.5 * Math.atan2(2 * sxy, sxx - syy);
  const n = X.length - 1;
  if ((X[n] - X[0]) * Math.cos(axis) + (Y[n] - Y[0]) * Math.sin(axis) < 0) axis += Math.PI;

  let best = null;
  for (const off of [0, -15, 15, -30, 30]) {
    const a = axis + rad(off), ca = Math.cos(a), sa = Math.sin(a);
    // frame: u to the right of the screen, v away from the camera
    const U = X.map((x, i) => x * ca + Y[i] * sa), V = X.map((x, i) => -x * sa + Y[i] * ca);
    const u0 = Math.min(...U), u1 = Math.max(...U), v0 = Math.min(...V), v1 = Math.max(...V);
    const mu = Math.max(2.5, (u1 - u0) * 0.1), near = Math.max(2, (u1 - u0) * 0.05), far = Math.max(5, (u1 - u0) * 0.14);
    const cell = Math.max((u1 - u0 + 2 * mu) / NU, (v1 - v0 + near + far) / NV_MAX);
    const nv = Math.min(NV_MAX, Math.max(NV_MIN, Math.ceil((v1 - v0 + near + far) / cell)));
    const uMin = (u0 + u1) / 2 - (NU * cell) / 2;
    const vMin = v0 - near - Math.max(0, (nv * cell - (v1 - v0 + near + far)) / 2);
    const z = zoomFor(cell, lat0);
    const ele = new Float32Array(NU * nv);
    for (let j = 0; j < nv; j++)
      for (let i = 0; i < NU; i++) {
        const u = uMin + (i + 0.5) * cell, v = vMin + (j + 0.5) * cell;
        const x = u * ca - v * sa, y = u * sa + v * ca;
        ele[j * NU + i] = await eleAt(lat0 + y / ky, lon0 + x / kx, z);
      }
    let lo = Infinity, hi = -Infinity;
    for (const e of ele) { if (e < lo) lo = e; if (e > hi) hi = e; }
    const step = Math.max(1, (hi - lo) / 255);
    const h = Uint8Array.from(ele, (e) => Math.round((e - lo) / step));
    const ex = Math.min(7, Math.max(1.6, (0.17 * NU * cell * 1000) / (hi - lo)));
    const zOf = (q) => (q * step * ex) / (cell * 1000);
    const ru = U.map((u) => (u - uMin) / cell), rv = V.map((v) => (v - vMin) / cell);
    for (const pitch of [42, 50, 58]) {
      const vis = visibility(h, NU, nv, ru, rv, zOf, pitch);
      const score = vis - (pitch - 42) * 0.006 - Math.abs(off) * 0.0015; // a low camera reads as relief; climb only if the route gets lost
      if (!best || score > best.score) best = { score, vis, off, pitch, nu: NU, nv, cellKm: r2(cell), min: Math.round(lo), step: r2(step), ex: r2(ex), h: b64(h), u: ru.map(r2), v: rv.map(r2), bearing: Math.round((90 - (a * 180) / Math.PI + 360) % 360) };
    }
  }
  const { score, vis, off, ...out } = best;
  fs.writeFileSync(path.join(OUT, file), JSON.stringify(out));
  console.log(`${file}: ${out.nu}x${out.nv} cells of ${out.cellKm} km, pitch ${out.pitch}°, axis offset ${off}°, screen-right bearing ${out.bearing}°, route visible ${(vis * 100).toFixed(0)}%`);
  return { n: day.n, lat, lon };
}

// ---------- whole trip, seen from above ----------
async function overview(days) {
  const lat = days.flatMap((d) => d.lat), lon = days.flatMap((d) => d.lon);
  const la0 = Math.min(...lat), la1 = Math.max(...lat), lo0 = Math.min(...lon), lo1 = Math.max(...lon);
  const latC = (la0 + la1) / 2, kx = 111.32 * Math.cos(rad(latC)), ky = 110.57;
  const w = (lo1 - lo0) * kx, hgt = (la1 - la0) * ky, m = Math.max(w, hgt) * 0.09;
  const nu = 200, cell = (w + 2 * m) / nu, nv = Math.ceil((hgt + 2 * m) / cell);
  const z = zoomFor(cell, latC);
  const uOf = (l) => ((l - lo0) * kx + m) / cell, vOf = (l) => ((la1 - l) * ky + m) / cell; // v grows southwards (screen y)
  const ele = new Float32Array(nu * nv);
  for (let j = 0; j < nv; j++)
    for (let i = 0; i < nu; i++) ele[j * nu + i] = await eleAt(la1 - ((j + 0.5) * cell - m) / ky, lo0 + ((i + 0.5) * cell - m) / kx, z);
  let lo = Infinity, hi = -Infinity;
  for (const e of ele) { if (e < lo) lo = e; if (e > hi) hi = e; }
  const step = (hi - lo) / 255;
  const out = {
    nu, nv, cellKm: r2(cell), min: Math.round(lo), step: r2(step), h: b64(Uint8Array.from(ele, (e) => Math.round((e - lo) / step))),
    days: days.map((d) => {
      const idx = d.lat.map((_, i) => i).filter((i) => i % 3 === 0 || i === d.lat.length - 1);
      return { n: d.n, u: idx.map((i) => r2(uOf(d.lon[i]))), v: idx.map((i) => r2(vOf(d.lat[i]))) };
    }),
  };
  fs.writeFileSync(path.join(OUT, "overview.json"), JSON.stringify(out));
  console.log(`overview.json: ${nu}x${nv} cells of ${out.cellKm} km`);
}

const files = fs.readdirSync(DAYS).filter((f) => /^day-\d+\.json$/.test(f)).sort();
const days = [];
for (const f of files) days.push(await stage(f));
await overview(days);
