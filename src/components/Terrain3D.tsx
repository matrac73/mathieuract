"use client";

import { useEffect, useRef, useState, type MutableRefObject } from "react";
import { TRAIN, arc, sprite } from "@/lib/pixel";

// The real mountain of the day, built out of cubes from an elevation grid
// (scripts/build-terrain.mjs). Big blocks first, refined until the cubes are small;
// then the route, already there in grey, turns orange behind a moving head in 5 s.
// The pointer tilts the model by a few degrees, no more.

type Data = { nu: number; nv: number; cellKm: number; min: number; step: number; ex: number; pitch: number; bearing: number; h: string; u: number[]; v: number[] };
export type Wind = { dir: number; speed: number; rain?: number } | null; // dir = where it blows from (degrees), speed in km/h, rain in mm/h
export type Spot = { src: string; at: number; video: boolean }; // a photo or a video, `at` = 0..1 along the route
type Town = { name: string; at: number; always?: boolean };
export type TerrainHandle = { set: (progress: number, wind?: Wind) => void };
type Level = { b: number; n: number; m: number; z: Float32Array };
type Props = {
  src: string; cursor?: number | null; marks?: number[]; label?: string; maxHeight?: number;
  handle?: MutableRefObject<TerrainHandle | null>; // when given, the route follows `set(progress)` (scroll) instead of drawing itself in 5 s
  towns?: Town[]; // named as the rider reaches them (`always`: start and finish, shown from the first frame)
  media?: Spot[]; // blinking dots on the route; hovering one shows the picture
  mediaLabel?: string;
  clouds?: Cloud[]; // they stay where it rained, and fade in as the rider gets close
  fill?: boolean; // size to the parent box
};

const REST_YAW = -7, MAX_YAW = 8, MAX_PITCH = 5; // degrees
const RISE = 420, FADE = 230, HOLD = 110, DRAW = 5000; // ms
const RELIEF = 1.5; // extra vertical exaggeration, on top of the one chosen by build-terrain
export type Cloud = { at: number; rain: number }; // where it rained on the route (0..1), and how hard (mm/h)
const rad = (d: number) => (d * Math.PI) / 180;
const hex = (c: string) => {
  const m = c.trim().replace("#", "");
  const f = m.length === 3 ? m.split("").map((x) => x + x).join("") : m.padEnd(6, "0");
  return [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16));
};
const mix = (a: number[], b: number[], t: number) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(",")})`;

export function Terrain3D({ src, cursor = null, marks, label, maxHeight = 640, handle, towns, fill, media, mediaLabel, clouds }: Props) {
  const [tip, setTip] = useState<{ k: number; x: number; y: number } | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const live = useRef({ cursor: null as number | null, marks: [] as number[], towns: [] as Town[], media: [] as Spot[], clouds: [] as Cloud[], p: null as number | null, wind: null as Wind, kick: () => {} });
  live.current.cursor = cursor;
  live.current.marks = marks ?? [];
  live.current.towns = towns ?? [];
  live.current.media = media ?? [];
  live.current.clouds = clouds ?? [];

  useEffect(() => { live.current.kick(); }, [cursor]);

  useEffect(() => {
    const el = wrap.current!, cv = canvas.current!;
    const ctx = cv.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let dead = false, raf = 0, data: Data | null = null;
    let W = 0, H = 0, S = 1, ox = 0, oy = 0, dpr = 1, zmax = 1;
    let zw = new Float32Array(0), levels: Level[] = [], zl = new Float32Array(0), gap = new Uint8Array(0);
    let layers: (HTMLCanvasElement | null)[] = [], cache: HTMLCanvasElement | null = null;
    let t0 = 0, started = false, vis = false, lastT = 0;
    const gusts = Array.from({ length: 54 }, (_, i) => ({ u: 0, v: 0, age: 1e9, life: 900 + ((i * 37) % 10) * 90, l: 0.6 + ((i * 53) % 10) / 12 }));
    const drops = Array.from({ length: 44 }, (_, i) => ({ a: ((i * 61) % 44) / 44, b: ((i * 29) % 44) / 44, ph: ((i * 17) % 44) / 44 }));
    let spots: { k: number; x: number; y: number }[] = [], hot = -1, lastDraw = 0;
    let rc: { key: string; X: Float32Array; Y: Float32Array; vis: Uint8Array } | null = null; // the route on screen, computed once per pose
    let puff: HTMLCanvasElement | null = null;
    const cloudSprite = () => { // a soft cumulus: a few blurred balls on a flat base
      const c = document.createElement("canvas"); c.width = 240; c.height = 130;
      const g = c.getContext("2d")!, rgb = col.fg.join(",");
      for (const [x, y, r] of [[52, 78, 30], [92, 56, 42], [140, 62, 40], [182, 80, 28], [118, 84, 34], [30, 90, 18], [208, 92, 16]]) {
        const gr = g.createRadialGradient(x, y - r * 0.25, r * 0.1, x, y, r);
        gr.addColorStop(0, `rgba(${rgb},0.95)`); gr.addColorStop(0.6, `rgba(${rgb},0.55)`); gr.addColorStop(1, `rgba(${rgb},0)`);
        g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill();
      }
      g.globalCompositeOperation = "destination-out";
      const cut = g.createLinearGradient(0, 88, 0, 112); cut.addColorStop(0, "rgba(0,0,0,0)"); cut.addColorStop(1, "rgba(0,0,0,1)");
      g.fillStyle = cut; g.fillRect(0, 88, 240, 42);
      return c;
    };
    let yaw = REST_YAW, pitch = 50;
    let col = { bg: [0, 0, 0], fg: [255, 255, 255], accent: "#ff5a1f", hot: [255, 90, 31], tones: [] as string[] };

    const colours = () => {
      const cs = getComputedStyle(document.documentElement);
      const bg = hex(cs.getPropertyValue("--bg") || "#000"), fg = hex(cs.getPropertyValue("--fg") || "#fff");
      col = { bg, fg, accent: cs.getPropertyValue("--accent").trim() || "#ff5a1f", hot: hex(cs.getPropertyValue("--accent") || "#ff5a1f"), tones: Array.from({ length: 33 }, (_, i) => mix(bg, fg, i / 32)) };
    };
    const tone = (t: number) => col.tones[Math.max(0, Math.min(32, Math.round(t * 32)))];

    const level = (b: number): Level => {
      const { nu, nv } = data!;
      const n = Math.ceil(nu / b), m = Math.ceil(nv / b), z = new Float32Array(n * m);
      for (let j = 0; j < m; j++)
        for (let i = 0; i < n; i++) {
          let s = 0, k = 0;
          for (let y = j * b; y < Math.min(nv, (j + 1) * b); y++) for (let x = i * b; x < Math.min(nu, (i + 1) * b); x++) { s += zw[y * nu + x]; k++; }
          z[j * n + i] = Math.max(1, Math.round(s / k / b)) * b; // whole cubes
        }
      return { b, n, m, z };
    };

    const layout = () => {
      const d = data!;
      W = el.clientWidth;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const c = Math.cos(rad(REST_YAW)), s = Math.sin(rad(REST_YAW)), sp = Math.sin(rad(d.pitch)), cp = Math.cos(rad(d.pitch));
      let x0 = Infinity, x1 = -Infinity, up0 = Infinity, up1 = -Infinity;
      for (const du of [-d.nu / 2, d.nu / 2]) for (const dv of [-d.nv / 2, d.nv / 2]) {
        const gx = du * c - dv * s, gy = du * s + dv * c;
        x0 = Math.min(x0, gx); x1 = Math.max(x1, gx);
        up0 = Math.min(up0, gy * sp); up1 = Math.max(up1, gy * sp + zmax * cp);
      }
      const PAD = 30;
      S = (W * 0.94) / (x1 - x0);
      H = (up1 - up0) * S + PAD;
      const cap = fill ? Math.max(220, el.parentElement!.clientHeight) : Math.min(maxHeight, Math.max(260, window.innerHeight * 0.78));
      if (H > cap) { S *= (cap - PAD) / (H - PAD); H = cap; }
      ox = W / 2 - ((x0 + x1) / 2) * S;
      oy = PAD / 2 + up1 * S;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      cv.style.height = `${H}px`;
      // refinement ladder: 16 → 32 → 64 → 128 cubes across, stopping before cubes get too small to read
      const bs = [8, 4, 2, 1].filter((b, i) => i === 0 || S * b >= 3.4);
      levels = bs.map(level);
      layers = levels.map(() => null);
      cache = null; rc = null;
      // the route floats just above the cube tops, so it never cuts through them
      const fin = levels[levels.length - 1], n = d.u.length;
      const top = new Float32Array(n);
      for (let i = 0; i < n; i++) top[i] = zAt(fin, d.u[i], d.v[i]);
      zl = new Float32Array(n);
      gap = new Uint8Array(n);
      for (let i = 0; i < n; i++) {
        let s2 = 0, k = 0, mx = 0;
        for (let j = Math.max(0, i - 3); j <= Math.min(n - 1, i + 3); j++) { s2 += top[j]; k++; if (Math.abs(j - i) <= 1) mx = Math.max(mx, top[j]); }
        zl[i] = Math.max(s2 / k, mx) + 0.4 * fin.b;
        if (i > 0 && Math.hypot(d.u[i] - d.u[i - 1], d.v[i] - d.v[i - 1]) * d.cellKm > 2.5) gap[i] = 1;
      }
    };
    const zAt = (L: Level, u: number, v: number) => {
      const i = Math.floor(u / L.b), j = Math.floor(v / L.b);
      return i < 0 || j < 0 || i >= L.n || j >= L.m ? 0 : L.z[j * L.n + i];
    };

    const terrain = (g: CanvasRenderingContext2D, L: Level, yawD: number, pitchD: number, grow = 1) => {
      const d = data!, { b, n, m, z } = L;
      const c = Math.cos(rad(yawD)), s = Math.sin(rad(yawD)), sp = Math.sin(rad(pitchD)), cp = Math.cos(rad(pitchD));
      const eUx = c * S * b, eUy = -s * sp * S * b, eVx = -s * S * b, eVy = -c * sp * S * b, eZ = -cp * S;
      const x00 = ox + ((-d.nu / 2) * c + (d.nv / 2) * s) * S, y00 = oy - ((-d.nu / 2) * s - (d.nv / 2) * c) * sp * S;
      const right = yawD < 0, px = S * b;
      g.lineJoin = "round";
      g.lineWidth = px >= 6 ? 1 : 0.5;
      g.strokeStyle = tone(0);
      const hz = (i: number, j: number) => (i < 0 || j < 0 || i >= n ? 0 : Math.max(b * 0.2, z[j * n + i] * grow));
      const quad = (ax: number, ay: number, bx: number, by: number, cx: number, cy: number, dx: number, dy: number, fill: string) => {
        g.fillStyle = fill;
        g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.lineTo(cx, cy); g.lineTo(dx, dy); g.closePath();
        g.fill(); g.stroke();
      };
      for (let j = m - 1; j >= 0; j--)
        for (let q = 0; q < n; q++) {
          const i = right ? q : n - 1 - q;
          const zc = hz(i, j), zf = hz(i, j - 1), zs = hz(right ? i + 1 : i - 1, j), rel = zc / zmax;
          const x = x00 + i * eUx + j * eVx, y = y00 + i * eUy + j * eVy;
          if (zc > zs) {
            const ax = right ? x + eUx : x, ay = right ? y + eUy : y;
            quad(ax, ay + zs * eZ, ax + eVx, ay + eVy + zs * eZ, ax + eVx, ay + eVy + zc * eZ, ax, ay + zc * eZ, tone(0.2 + 0.14 * rel));
          }
          if (zc > zf) {
            quad(x, y + zf * eZ, x + eUx, y + eUy + zf * eZ, x + eUx, y + eUy + zc * eZ, x, y + zc * eZ, tone(0.07 + 0.1 * rel));
            if (grow === 1 && px >= 4 && zc - zf > b) { // the seams between stacked cubes
              g.beginPath();
              for (let k = Math.floor(zf / b) * b + b; k < zc; k += b) { g.moveTo(x, y + k * eZ); g.lineTo(x + eUx, y + eUy + k * eZ); }
              g.stroke();
            }
          }
          const yt = y + zc * eZ;
          quad(x, yt, x + eUx, yt + eUy, x + eUx + eVx, yt + eUy + eVy, x + eVx, yt + eVy, tone(0.1 + 0.86 * Math.pow(rel, 0.85)));
        }
    };

    const route = (g: CanvasRenderingContext2D, yawD: number, pitchD: number, p: number, alpha: number) => {
      const d = data!, n = d.u.length, fin = levels[levels.length - 1];
      const c = Math.cos(rad(yawD)), s = Math.sin(rad(yawD)), sp = Math.sin(rad(pitchD)), cp = Math.cos(rad(pitchD)), tan = Math.tan(rad(pitchD));
      const key = `${yawD}/${pitchD}`;
      if (!rc || rc.key !== key) {
      const X = new Float32Array(n), Y = new Float32Array(n), vis = new Uint8Array(n);
      for (let i = 0; i < n; i++) {
        const du = d.u[i] - d.nu / 2, dv = d.v[i] - d.nv / 2;
        X[i] = ox + (du * c - dv * s) * S;
        Y[i] = oy - ((du * s + dv * c) * sp + zl[i] * cp) * S;
        let ok = 1; // hidden when a cube nearer to the camera rises above the line of sight
        for (let t = fin.b; t < d.nv; t += fin.b) {
          const uu = d.u[i] - s * t, vv = d.v[i] - c * t;
          if (vv < 0 || uu < 0 || uu >= d.nu) break;
          if (zAt(fin, uu, vv) > zl[i] + t * tan) { ok = 0; break; }
        }
        vis[i] = ok;
      }
      rc = { key, X, Y, vis };
      }
      const { X, Y, vis } = rc;
      const lw = Math.max(2, Math.min(3.2, S * 0.42));
      g.lineJoin = g.lineCap = "round";
      const at = (f: number) => {
        const i = Math.min(n - 2, Math.floor(f)), r = f - i;
        return gap[i + 1] ? arc(X[i], Y[i], X[i + 1], Y[i + 1], r) : ([X[i] + (X[i + 1] - X[i]) * r, Y[i] + (Y[i + 1] - Y[i]) * r] as const);
      };
      const stroke = (end: number, colour: string) => {
        for (const flag of [0, 1]) {
          g.beginPath();
          for (let k = 0; k < Math.min(n - 1, Math.ceil(end)); k++) {
            if (gap[k + 1] || (vis[k] & vis[k + 1]) !== flag) continue;
            g.moveTo(X[k], Y[k]);
            if (k + 1 <= end) g.lineTo(X[k + 1], Y[k + 1]); else { const [x, y] = at(end); g.lineTo(x, y); }
          }
          if (flag) { g.globalAlpha = alpha; g.strokeStyle = tone(0); g.lineWidth = lw + 2.6; g.stroke(); }
          // behind a ridge the route stays readable, as if the cubes in front were translucent
          g.globalAlpha = alpha * (flag ? 1 : 0.45);
          g.strokeStyle = colour; g.lineWidth = lw; g.stroke();
        }
        g.globalAlpha = alpha;
      };
      const box = (x: number, y: number, r: number, fill: string) => { g.fillStyle = tone(0); g.fillRect(x - r - 1.5, y - r - 1.5, 2 * r + 3, 2 * r + 3); g.fillStyle = fill; g.fillRect(x - r, y - r, 2 * r, 2 * r); };
      g.globalAlpha = alpha;
      stroke(n - 1, tone(0.5));
      if (p > 0) stroke(p * (n - 1), col.accent);
      for (let k = 0; k < n - 1; k++) if (gap[k + 1]) { // a transfer (train): dotted arc and a tiny train
        const done = p * (n - 1) >= k + 1;
        g.lineCap = "butt"; g.setLineDash([3, 6]);
        for (const [w, c] of [[6, tone(0)], [2.4, done ? col.accent : tone(0.8)]] as const) {
          g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.moveTo(X[k], Y[k]);
          for (let q = 1; q <= 24; q++) { const [x, y] = arc(X[k], Y[k], X[k + 1], Y[k + 1], q / 24); g.lineTo(x, y); }
          g.stroke();
        }
        g.setLineDash([]); g.lineCap = "round";
        const [tx, ty] = arc(X[k], Y[k], X[k + 1], Y[k + 1], 0.5);
        sprite(g, TRAIN, tx, ty, 2, done ? col.accent : tone(1), tone(0));
      }
      g.font = `600 10px ui-monospace, monospace`; g.textBaseline = "middle"; g.textAlign = "left";
      for (const t of live.current.towns) { // towns light up as the rider gets there
        const a = t.always ? 1 : Math.min(1, Math.max(0, (p - t.at + 0.012) / 0.03));
        if (a <= 0) continue;
        const i = Math.round(t.at * (n - 1)), name = t.name.toUpperCase(), w = g.measureText(name).width + 10, right = X[i] + 12 + w > W;
        const lx = right ? X[i] - 12 - w : X[i] + 12, ly = t.always ? Y[i] - 16 : Y[i] + 14;
        g.globalAlpha = alpha * a;
        g.fillStyle = tone(1); g.fillRect(X[i] - 2.5, Y[i] - 2.5, 5, 5);
        g.fillStyle = tone(0); g.fillRect(lx, ly - 8, w, 16);
        g.fillStyle = tone(1); g.fillText(name, lx + 5, ly + 0.5);
      }
      g.globalAlpha = alpha;
      box(X[0], Y[0], lw, p > 0 ? col.accent : tone(0.5));
      box(X[n - 1], Y[n - 1], lw, p >= 1 ? col.accent : tone(0.5));
      g.font = `600 10px ui-monospace, monospace`; g.textAlign = "center"; g.textBaseline = "middle";
      live.current.marks.forEach((f, k) => {
        const i = Math.round(f * (n - 1)), x = X[i], y = Y[i] - 16;
        g.fillStyle = tone(0); g.fillRect(x - 0.5, y, 1, 14);
        g.fillStyle = f <= p ? col.accent : tone(1); g.fillRect(x - 8, y - 8, 16, 16);
        g.fillStyle = tone(0); g.fillText(String(k + 1), x, y + 0.5);
      });
      if (p > 0 && (p < 1 || handle)) { const [x, y] = at(Math.min(n - 1.001, p * (n - 1))); box(x, y, lw + 2.5, col.accent); }
      spots = live.current.media.map((m, k) => { const [x, y] = at(Math.min(n - 1.001, Math.max(0, m.at) * (n - 1))); return { k, x, y }; });
      const beat = (performance.now() % 1600) / 1600;
      for (const q of spots) { // where a photo or a video was taken: a dot that pings
        const r = 3.5 + (q.k === hot ? 2 : 0), ring = r + 3 + beat * 9;
        g.globalAlpha = alpha * (1 - beat) * 0.9; g.strokeStyle = tone(1); g.lineWidth = 1.5; g.strokeRect(q.x - ring, q.y - ring, ring * 2, ring * 2);
        g.globalAlpha = alpha; g.fillStyle = tone(0); g.fillRect(q.x - r - 2, q.y - r - 2, 2 * r + 4, 2 * r + 4);
        g.fillStyle = tone(1); g.fillRect(q.x - r, q.y - r, 2 * r, 2 * r);
        g.fillStyle = col.accent; g.fillRect(q.x - 1.5, q.y - 1.5, 3, 3);
      }
      const cu = live.current.cursor;
      if (cu != null) {
        const [x, y] = at(Math.min(n - 1.001, cu * (n - 1)));
        g.strokeStyle = tone(0); g.lineWidth = 4; g.strokeRect(x - 6, y - 6, 12, 12);
        g.strokeStyle = tone(1); g.lineWidth = 1.5; g.strokeRect(x - 6, y - 6, 12, 12);
      }
      g.globalAlpha = 1;
    };

    // The weather of the moment. Wind: faint dashes lying on the cubes around the rider — almost nothing in a
    // breeze, more of them, longer and more opaque as it blows. Rain: soft clouds that stay where it rained and
    // fade in as the rider comes close, with a few translucent streaks underneath. Returns true while something moves.
    const weather = (wind: Wind, p: number, dt: number) => {
      const d = data!, n = d.u.length, fin = levels[levels.length - 1];
      const f = Math.min(n - 1.001, Math.max(0, p) * (n - 1)), i0 = Math.floor(f), fr = f - i0;
      const ru = d.u[i0] + (d.u[i0 + 1] - d.u[i0]) * fr, rv = d.v[i0] + (d.v[i0 + 1] - d.v[i0]) * fr;
      const c = Math.cos(rad(yaw)), s = Math.sin(rad(yaw)), sp = Math.sin(rad(pitch)), cp = Math.cos(rad(pitch));
      const proj = (u: number, v: number, z: number) => { const du = u - d.nu / 2, dv = v - d.nv / 2; return [ox + (du * c - dv * s) * S, oy - ((du * s + dv * c) * sp + z * cp) * S] as const; };
      const ground = (u: number, v: number) => zAt(fin, u, v) + 0.35 * fin.b;
      let live2 = false;
      const act = wind ? Math.min(1, Math.max(0, (wind.speed - 1.5) / 12)) : 0; // 2 km/h: next to nothing
      if (wind && act > 0) {
        live2 = true;
        const th = rad(wind.dir + 180 - d.bearing), wu = Math.cos(th), wv = -Math.sin(th); // where the air goes, in grid cells
        const R = Math.max(7, d.nu * 0.085), strong = Math.min(1, Math.max(0, (wind.speed - 9) / 12));
        const len = 1.2 + wind.speed * 0.4, run = (1.8 + wind.speed * 0.5) * (dt / 1000), count = Math.max(2, Math.ceil(act * gusts.length));
        ctx.lineCap = "round"; ctx.lineWidth = 1.1 + strong * 0.7;
        ctx.strokeStyle = mix(col.fg, col.hot, strong);
        for (let j = 0; j < count; j++) {
          const q = gusts[j];
          q.age += dt; q.u += wu * run * q.l; q.v += wv * run * q.l;
          if (q.age > q.life || Math.hypot(q.u - ru, q.v - rv) > R * 1.25) { // born again around the rider, a little upwind
            const a = Math.random() * 6.283, r = Math.sqrt(Math.random()) * R;
            q.u = ru + Math.cos(a) * r - wu * R * 0.35; q.v = rv + Math.sin(a) * r - wv * R * 0.35; q.age = 0;
          }
          const k = Math.sin(Math.PI * Math.min(1, q.age / q.life)), edge = 1 - Math.min(1, Math.hypot(q.u - ru, q.v - rv) / (R * 1.25));
          if (k * edge < 0.05) continue;
          const tu = q.u - wu * len * q.l, tv = q.v - wv * len * q.l;
          const z = Math.max(ground(q.u, q.v), ground(tu, tv), ground(q.u + 1.5, q.v), ground(q.u - 1.5, q.v), ground(q.u, q.v - 1.5)); // one straight dash, lying on the surface
          const [x1, y1] = proj(q.u, q.v, z), [x2, y2] = proj(tu, tv, z);
          ctx.globalAlpha = k * edge * (0.1 + 0.55 * act); // translucent in a breeze, firmer when it blows
          ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        }
      }
      const t = performance.now() / 1000;
      live.current.clouds.forEach((cl, k) => {
        const near = 1 - Math.abs(p - cl.at) / 0.085;
        if (near <= 0) return;
        const a = near * near * (3 - 2 * near), i = Math.round(cl.at * (n - 1)), h1 = ((k * 73 + 11) % 17) / 17, h2 = ((k * 41 + 5) % 13) / 13;
        const u = d.u[i] + (h1 - 0.5) * 7, v = d.v[i] + (h2 - 0.5) * 5, top = zl[i] + Math.max(10, d.nu * 0.11) + h1 * 3;
        const heavy = Math.min(1, Math.max(0, (cl.rain - 1) / 3)), spread = Math.max(3, d.nu * 0.03), count = Math.min(drops.length, Math.round(4 + cl.rain * 9));
        ctx.lineCap = "butt"; ctx.lineWidth = 1 + heavy * 0.6;
        ctx.strokeStyle = mix(col.fg, col.hot, heavy);
        ctx.globalAlpha = a * (0.2 + 0.25 * heavy);
        ctx.beginPath();
        for (let j = 0; j < count; j++) {
          const q = drops[(j + k * 7) % drops.length], du = u + (q.a - 0.5) * 2 * spread, dv = v + (q.b - 0.5) * 2 * spread * 0.7, z0 = ground(du, dv);
          const ph = (q.ph + t * (0.7 + heavy * 0.5)) % 1, z = top - (top - z0) * ph, tail = Math.min(1.6 + heavy, top - z);
          const [x1, y1] = proj(du, dv, z), [x2, y2] = proj(du, dv, z + tail);
          ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
        }
        ctx.stroke();
        puff ??= cloudSprite();
        const [cx, cy] = proj(u, v, top), cw = S * d.nu * (0.13 + 0.07 * h2), chh = cw * (130 / 240);
        ctx.globalAlpha = a * (0.42 + Math.min(0.2, cl.rain * 0.15));
        ctx.drawImage(puff, cx - cw / 2, cy - chh * 0.8, cw, chh);
        live2 = true;
      });
      ctx.globalAlpha = 1;
      return live2;
    };
    const offscreen = (L: Level, yawD: number, pitchD: number) => {
      const off = document.createElement("canvas");
      off.width = cv.width; off.height = cv.height;
      const g = off.getContext("2d")!;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      terrain(g, L, yawD, pitchD);
      return off;
    };
    const blit = (img: HTMLCanvasElement, a: number) => { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = a; ctx.drawImage(img, 0, 0); ctx.globalAlpha = 1; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };

    const frame = (now: number) => {
      raf = 0;
      if (dead || !data || !started || !vis) return;
      const t = reduce ? Infinity : now - t0, last = levels.length - 1, dt = Math.min(60, now - (lastT || now));
      lastT = now;
      const refine = RISE + last * (FADE + HOLD);
      if (t >= refine && now - lastDraw < 30) { raf = requestAnimationFrame(frame); return; } // once built, 30 frames a second are plenty
      lastDraw = now;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      let again = false;
      if (t < RISE) {
        terrain(ctx, levels[0], REST_YAW, data.pitch, Math.max(0.04, 1 - Math.pow(1 - t / RISE, 3)));
        again = true;
      } else if (t < refine) {
        const u = t - RISE, seg = FADE + HOLD, i = Math.min(last, 1 + Math.floor(u / seg)), p = Math.min(1, (u - (i - 1) * seg) / FADE);
        blit((layers[i - 1] ??= offscreen(levels[i - 1], REST_YAW, data.pitch)), 1);
        blit((layers[i] ??= offscreen(levels[i], REST_YAW, data.pitch)), p);
        if (i === last) route(ctx, REST_YAW, data.pitch, 0, p);
        again = true;
      } else {
        // the pose never changes: the cubes are painted once and kept; the pointer tilts the picture itself (CSS, on the GPU)
        if (!cache) cache = offscreen(levels[last], yaw, pitch);
        blit(cache, 1);
        const ext = live.current.p, p = ext != null ? ext : Math.min(1, (t - refine) / DRAW);
        route(ctx, yaw, pitch, p, 1);
        const moving = !reduce && ext != null && weather(live.current.wind, p, dt);
        const pings = live.current.media.length > 0 && !reduce;
        again = moving || pings || (ext == null && p < 1);
      }
      if (again) raf = requestAnimationFrame(frame);
    };
    const kick = () => { if (!raf && started) raf = requestAnimationFrame(frame); };
    live.current.kick = kick;
    if (handle) handle.current = { set: (p, w) => { live.current.p = p; if (w !== undefined) live.current.wind = w; kick(); } };

    const start = () => { if (started || !data) return; started = true; t0 = performance.now(); kick(); };
    const io = new IntersectionObserver((es) => { vis = es.some((e) => e.isIntersecting); if (vis) { lastT = 0; start(); kick(); } }, { threshold: 0.2 });

    fetch(src)
      .then((r) => r.json())
      .then((d: Data) => {
        if (dead) return;
        data = d;
        const bin = atob(d.h), k = (d.step * d.ex * RELIEF) / (d.cellKm * 1000);
        zw = new Float32Array(bin.length);
        const raw = new Float32Array(bin.length);
        for (let i = 0; i < bin.length; i++) raw[i] = 1 + bin.charCodeAt(i) * k;
        // taller relief needs calmer cubes: a light 3 × 3 smoothing keeps the shapes and drops the cell-to-cell jitter
        for (let y = 0; y < d.nv; y++)
          for (let x = 0; x < d.nu; x++) {
            let sum = 0, wt = 0;
            for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
              const xx = x + dx, yy = y + dy;
              if (xx < 0 || yy < 0 || xx >= d.nu || yy >= d.nv) continue;
              const w = (dx ? 1 : 2) * (dy ? 1 : 2);
              sum += raw[yy * d.nu + xx] * w; wt += w;
            }
            zw[y * d.nu + x] = sum / wt;
          }
        zmax = 1 + 255 * k;
        pitch = d.pitch;
        colours();
        layout();
        io.observe(el);
      })
      .catch(() => {});

    const move = (e: PointerEvent) => {
      if (!data) return;
      const r = el.getBoundingClientRect(), fx = (e.clientX - r.left) / r.width - 0.5, fy = (e.clientY - r.top) / r.height - 0.5;
      if (!reduce) cv.style.transform = `perspective(1500px) rotateY(${(fx * 2 * MAX_YAW).toFixed(2)}deg) rotateX(${(-fy * 2 * MAX_PITCH).toFixed(2)}deg)`;
      const local = e.target === cv, mx = local ? e.offsetX : e.clientX - r.left, my = local ? e.offsetY : e.clientY - r.top; // offsetX/Y are already un-tilted
      let best = -1, bd = 18;
      for (const q of spots) { const dd = Math.hypot(q.x - mx, q.y - my); if (dd < bd) { bd = dd; best = q.k; } }
      if (best !== hot) { hot = best; const q = spots.find((x) => x.k === best); setTip(q ? { k: q.k, x: q.x, y: q.y } : null); kick(); }
    };
    const leave = () => { cv.style.transform = ""; if (hot !== -1) { hot = -1; setTip(null); kick(); } };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    let lastW = el.clientWidth;
    const ro = new ResizeObserver(() => { if (data && el.clientWidth !== lastW) { lastW = el.clientWidth; layout(); kick(); } });
    ro.observe(el);
    const mo = new MutationObserver(() => { if (!data) return; colours(); layers = levels.map(() => null); cache = null; puff = null; kick(); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      io.disconnect(); ro.disconnect(); mo.disconnect();
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      live.current.kick = () => {};
      if (handle) handle.current = null;
    };
  }, [src, maxHeight, handle, fill]);

  return (
    <div ref={wrap} className="terrain" role="img" aria-label={label}>
      <canvas ref={canvas} style={{ width: "100%" }} />
      {tip && media?.[tip.k] && (
        <figure className={`terrain-media ${tip.x > (wrap.current?.clientWidth ?? 0) / 2 ? "left" : ""} ${tip.y < 190 ? "below" : ""}`} style={{ left: tip.x, top: tip.y }}>
          {media[tip.k].video
            ? <video src={media[tip.k].src} autoPlay muted loop playsInline />
            // eslint-disable-next-line @next/next/no-img-element
            : <img src={media[tip.k].src} alt="" />}
          {mediaLabel && <figcaption className="label">{mediaLabel}</figcaption>}
        </figure>
      )}
    </div>
  );
}
