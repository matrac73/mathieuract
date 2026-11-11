"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import { TRAIN, arc, sprite } from "@/lib/pixel";

// The real mountain of the day, built out of cubes from an elevation grid
// (scripts/build-terrain.mjs). Big blocks first, refined until the cubes are small;
// then the route, already there in grey, turns orange behind a moving head in 5 s.
// The pointer tilts the model by a few degrees, no more.

type Data = { nu: number; nv: number; cellKm: number; min: number; step: number; ex: number; pitch: number; bearing: number; h: string; u: number[]; v: number[] };
export type Wind = { dir: number; speed: number } | null; // dir = where it blows from (degrees), speed in km/h
export type TerrainHandle = { set: (progress: number, wind?: Wind) => void };
type Level = { b: number; n: number; m: number; z: Float32Array };
type Props = {
  src: string; cursor?: number | null; marks?: number[]; label?: string; maxHeight?: number;
  handle?: MutableRefObject<TerrainHandle | null>; // when given, the route follows `set(progress)` (scroll) instead of drawing itself in 5 s
  towns?: { name: string; at: number }[]; // named as the rider reaches them
  fill?: boolean; // size to the parent box
};

const REST_YAW = -7, MAX_YAW = 8, MAX_PITCH = 5; // degrees
const RISE = 420, FADE = 230, HOLD = 110, DRAW = 5000; // ms
const rad = (d: number) => (d * Math.PI) / 180;
const hex = (c: string) => {
  const m = c.trim().replace("#", "");
  const f = m.length === 3 ? m.split("").map((x) => x + x).join("") : m.padEnd(6, "0");
  return [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16));
};
const mix = (a: number[], b: number[], t: number) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(",")})`;

export function Terrain3D({ src, cursor = null, marks, label, maxHeight = 640, handle, towns, fill }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const live = useRef({ cursor: null as number | null, marks: [] as number[], towns: [] as { name: string; at: number }[], p: null as number | null, wind: null as Wind, kick: () => {} });
  live.current.cursor = cursor;
  live.current.marks = marks ?? [];
  live.current.towns = towns ?? [];

  useEffect(() => { live.current.kick(); }, [cursor]);

  useEffect(() => {
    const el = wrap.current!, cv = canvas.current!;
    const ctx = cv.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let dead = false, raf = 0, data: Data | null = null;
    let W = 0, H = 0, S = 1, ox = 0, oy = 0, dpr = 1, zmax = 1;
    let zw = new Float32Array(0), levels: Level[] = [], zl = new Float32Array(0), gap = new Uint8Array(0);
    let layers: (HTMLCanvasElement | null)[] = [], cache: HTMLCanvasElement | null = null, cachePose = "";
    let t0 = 0, started = false, vis = false, lastT = 0;
    const gusts = Array.from({ length: 80 }, (_, i) => ({ x: Math.random(), y: Math.random(), l: 0.5 + ((i * 37) % 10) / 10 }));
    let yaw = REST_YAW, pitch = 50, tYaw = REST_YAW, tPitch = 50;
    let col = { bg: [0, 0, 0], fg: [255, 255, 255], accent: "#ff5a1f", tones: [] as string[] };

    const colours = () => {
      const cs = getComputedStyle(document.documentElement);
      const bg = hex(cs.getPropertyValue("--bg") || "#000"), fg = hex(cs.getPropertyValue("--fg") || "#fff");
      col = { bg, fg, accent: cs.getPropertyValue("--accent").trim() || "#ff5a1f", tones: Array.from({ length: 33 }, (_, i) => mix(bg, fg, i / 32)) };
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
      cache = null;
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
        const a = Math.min(1, Math.max(0, (p - t.at + 0.012) / 0.03));
        if (a <= 0) continue;
        const i = Math.round(t.at * (n - 1)), name = t.name.toUpperCase(), w = g.measureText(name).width + 10, right = X[i] + 12 + w > W;
        const lx = right ? X[i] - 12 - w : X[i] + 12, ly = Y[i] + 14;
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
      const cu = live.current.cursor;
      if (cu != null) {
        const [x, y] = at(Math.min(n - 1.001, cu * (n - 1)));
        g.strokeStyle = tone(0); g.lineWidth = 4; g.strokeRect(x - 6, y - 6, 12, 12);
        g.strokeStyle = tone(1); g.lineWidth = 1.5; g.strokeRect(x - 6, y - 6, 12, 12);
      }
      g.globalAlpha = 1;
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
        yaw += (tYaw - yaw) * 0.14; pitch += (tPitch - pitch) * 0.14;
        const moving = Math.abs(tYaw - yaw) > 0.04 || Math.abs(tPitch - pitch) > 0.04;
        if (moving && last > 0) terrain(ctx, levels[last - 1], yaw, pitch); // one step coarser while it turns: stays fluid
        else {
          if (!moving) { yaw = tYaw; pitch = tPitch; }
          const pose = `${yaw.toFixed(2)}/${pitch.toFixed(2)}`;
          if (!cache || cachePose !== pose) { cache = offscreen(levels[last], yaw, pitch); cachePose = pose; }
          blit(cache, 1);
        }
        const ext = live.current.p, p = ext != null ? ext : Math.min(1, (t - refine) / DRAW);
        route(ctx, yaw, pitch, p, 1);
        const wind = live.current.wind;
        if (wind && !reduce) { // grey streams: where the wind goes, and how hard
          const th = rad(wind.dir + 180 - data.bearing), du = Math.cos(th), dv = -Math.sin(th);
          const c = Math.cos(rad(yaw)), s = Math.sin(rad(yaw)), sp = Math.sin(rad(pitch));
          const dx = du * c - dv * s, dy = -(du * s + dv * c) * sp, v = (10 + wind.speed * 5) * (dt / 1000), len = 6 + wind.speed * 2.2;
          ctx.strokeStyle = tone(0.8); ctx.lineWidth = 1; ctx.lineCap = "butt";
          ctx.globalAlpha = Math.min(0.5, 0.16 + wind.speed * 0.014);
          ctx.beginPath();
          for (const q of gusts) {
            q.x += (dx * v * q.l) / W; q.y += (dy * v * q.l) / H;
            if (q.x < 0 || q.x > 1 || q.y < 0 || q.y > 1) { q.x = (q.x + 1) % 1; q.y = (q.y + 1) % 1; }
            ctx.moveTo(q.x * W, q.y * H); ctx.lineTo(q.x * W - dx * len * q.l, q.y * H - dy * len * q.l);
          }
          ctx.stroke(); ctx.globalAlpha = 1;
        }
        again = moving || (ext != null ? !!wind && !reduce : p < 1);
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
        const bin = atob(d.h), k = (d.step * d.ex) / (d.cellKm * 1000);
        zw = new Float32Array(bin.length);
        for (let i = 0; i < bin.length; i++) zw[i] = 1 + bin.charCodeAt(i) * k;
        zmax = 1 + 255 * k;
        pitch = tPitch = d.pitch;
        colours();
        layout();
        io.observe(el);
      })
      .catch(() => {});

    const move = (e: PointerEvent) => {
      if (!data) return;
      const r = el.getBoundingClientRect();
      tYaw = REST_YAW + (0.5 - (e.clientX - r.left) / r.width) * 2 * MAX_YAW;
      tPitch = data.pitch + ((e.clientY - r.top) / r.height - 0.5) * 2 * MAX_PITCH;
      kick();
    };
    const leave = () => { if (!data) return; tYaw = REST_YAW; tPitch = data.pitch; kick(); };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    let lastW = el.clientWidth;
    const ro = new ResizeObserver(() => { if (data && el.clientWidth !== lastW) { lastW = el.clientWidth; layout(); kick(); } });
    ro.observe(el);
    const mo = new MutationObserver(() => { if (!data) return; colours(); layers = levels.map(() => null); cache = null; kick(); });
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
    </div>
  );
}
