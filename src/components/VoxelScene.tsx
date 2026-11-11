"use client";

import { useEffect, useRef } from "react";

// Small isometric cube sculptures. With `scroll`, the cubes fall into place as the page scrolls:
// inside a pinned row (`[data-pin]`) the build finishes while the row holds still, then the row lets go.

type V = { x: number; y: number; z: number; a?: boolean };
type Model = { n: number; vox: V[] };
type Cell = { h: number; accent?: boolean };

const box = (out: V[], x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, a = false) => {
  for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) out.push({ x, y, z, a });
};
const model = (n: number, build: (v: V[]) => void): Model => {
  const raw: V[] = [], seen = new Map<string, V>();
  build(raw);
  for (const c of raw) seen.set(`${c.x},${c.y},${c.z}`, c); // a later cube replaces an earlier one at the same spot
  return { n, vox: [...seen.values()] };
};
const heights = (fn: (x: number, y: number) => Cell): Model =>
  model(8, (v) => {
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { const c = fn(x, y); for (let z = 0; z < c.h; z++) v.push({ x, y, z, a: !!c.accent && z === c.h - 1 }); }
  });
const ring = (x: number, y: number) => Math.max(Math.abs(x - 3.5), Math.abs(y - 3.5));

// The viewer stands towards +x / +y: a wall along x shows its face, the nose of the plane points at you.
const MODELS: Record<string, Model> = {
  // ---- career ----
  // Adagia: a scattered market, a filter, one neat stack — sourcing deals with AI
  adagia: model(10, (v) => {
    for (let x = 6; x <= 9; x++) for (let y = 0; y <= 9; y++) if ((x * 7 + y * 5 + x * y) % 3 === 0) box(v, x, y, 0, x, y, (x + y) % 4 === 0 ? 1 : 0); // the market, in front
    box(v, 4, 0, 0, 4, 3, 2); box(v, 4, 6, 0, 4, 9, 2); box(v, 4, 0, 3, 4, 9, 3); // the gate
    box(v, 4, 4, 0, 5, 5, 0, true); // what goes through
    box(v, 1, 4, 0, 2, 5, 6); box(v, 1, 4, 7, 2, 5, 7, true); // the stack behind it
  }),
  // Onepoint: a copilot — a question, and the answer being typed
  onepoint: model(10, (v) => {
    box(v, 1, 3, 3, 8, 4, 8);
    box(v, 2, 3, 2, 3, 4, 2); box(v, 2, 3, 1, 2, 4, 1); // the tail of the bubble
    for (const x of [3, 5, 7]) box(v, x - 1, 4, 5, x - 1, 4, 6, true); // …
    box(v, 5, 8, 0, 9, 8, 2); box(v, 9, 8, 3, 9, 8, 3);
  }),
  // ESSEC, Singapore: three towers and the deck that joins them
  essec: model(10, (v) => {
    for (const x of [1, 4, 7]) box(v, x, 3, 0, x + 1, 4, 6);
    box(v, 0, 3, 7, 9, 4, 7, true);
    box(v, 1, 7, 0, 1, 8, 1); box(v, 3, 8, 0, 4, 8, 0); box(v, 6, 7, 0, 6, 7, 2); box(v, 8, 8, 0, 9, 8, 0);
  }),
  // BCG X: the 2×2 matrix, and something green growing out of the tallest quadrant (Greener IT)
  bcg: model(10, (v) => {
    box(v, 0, 0, 0, 3, 3, 2); box(v, 6, 0, 0, 9, 3, 4); box(v, 0, 6, 0, 3, 9, 0); box(v, 6, 6, 0, 9, 9, 1);
    box(v, 7, 1, 5, 7, 1, 6); // trunk
    box(v, 6, 0, 7, 8, 2, 7, true); box(v, 7, 1, 8, 7, 1, 8, true);
  }),
  // Safran Landing Systems: an aircraft standing on its gear
  safran: model(10, (v) => {
    box(v, 0, 4, 3, 8, 5, 4); box(v, 9, 4, 3, 9, 5, 3); // fuselage, nose
    box(v, 4, 0, 3, 5, 9, 3); box(v, 6, 2, 3, 6, 7, 3); // wings
    box(v, 0, 3, 4, 0, 6, 4); box(v, 0, 4, 5, 1, 5, 5); box(v, 0, 4, 6, 0, 5, 7); // tail
    box(v, 8, 4, 1, 8, 5, 2); box(v, 8, 4, 0, 8, 5, 0, true); // nose gear
    for (const y of [2, 7]) { box(v, 5, y, 1, 5, y, 2); box(v, 4, y, 0, 5, y, 0, true); } // main gear
  }),
  // CentraleSupélec: an engineer's cog, with something bright at its centre
  centrale: model(10, (v) => {
    for (let x = 0; x < 10; x++) for (let y = 0; y < 10; y++) {
      const r = Math.hypot(x - 4.5, y - 4.5), tooth = ((x === 4 || x === 5) && (y === 0 || y === 9)) || ((y === 4 || y === 5) && (x === 0 || x === 9)) || ((x === 1 || x === 8) && (y === 1 || y === 8));
      if (r < 1) box(v, x, y, 0, x, y, 3, true);
      else if ((r > 1.9 && r < 4.1) || tooth) box(v, x, y, 0, x, y, 1);
    }
  }),
  // Prépa: a blackboard with a curve in chalk, and the pile of books
  prepa: model(10, (v) => {
    box(v, 0, 1, 1, 9, 1, 6); box(v, 0, 1, 0, 0, 1, 0); box(v, 9, 1, 0, 9, 1, 0);
    for (const [x, z] of [[1, 2], [2, 2], [3, 3], [4, 4], [5, 4], [6, 5], [7, 5], [8, 5]]) v.push({ x, y: 1, z, a: true });
    box(v, 5, 5, 0, 8, 7, 0); box(v, 6, 5, 1, 8, 7, 1); box(v, 6, 6, 2, 8, 7, 2); box(v, 7, 6, 3, 8, 7, 3, true);
  }),
  // ---- articles & fallbacks ----
  pyramid: heights((x, y) => ({ h: 1 + Math.round((3.5 - ring(x, y)) * 1.6), accent: ring(x, y) < 1 })),
  mountain: heights((x, y) => ({ h: Math.max(1, Math.round(7 - 1.15 * (Math.abs(x - 3.5) + Math.abs(y - 3.5)))), accent: ring(x, y) < 1 })),
  stairs: heights((x, y) => (y >= 3 && y <= 4 ? { h: x + 1, accent: x === 7 } : { h: 0 })),
  sieve: heights((x, y) => ({ h: (x + y) % 2 ? 2 : 1, accent: (x + y) % 2 === 1 && (x * 3 + y * 5) % 7 === 0 })),
  clusters: heights((x, y) => { const d = [[1.5, 1.5], [5.5, 2.5], [3, 6]].map(([a, b]) => Math.hypot(x - a, y - b)); const m = Math.min(...d); return m < 1.9 ? { h: m < 0.8 ? 4 : 2, accent: m < 0.8 } : { h: 0 }; }),
  wave: heights((x, y) => (y >= 2 && y <= 5 ? { h: Math.round(3.6 + 2.6 * Math.sin(x * 0.95)), accent: x === 7 } : { h: 0 })),
  target: heights((x, y) => { const r = ring(x, y); return { h: r < 1 ? 5 : r < 2 ? 1 : r < 3 ? 3 : 1, accent: r < 1 }; }),
  maze: heights((x, y) => ((x * 7 + y * 3) % 5 === 0 && x !== y ? { h: 3 } : { h: 1, accent: x === y })),
  tree: heights((x, y) => (y <= 1 ? (x >= 3 && x <= 4 ? { h: 5, accent: true } : { h: 0 }) : y >= 3 && y <= 4 ? (x === 1 || x === 2 || x === 5 || x === 6 ? { h: 3 } : { h: 0 }) : y >= 6 ? (x % 2 === 0 ? { h: 1 } : { h: 0 }) : { h: 0 })),
};

const hex = (c: string) => {
  const m = c.trim().replace("#", "");
  const f = m.length === 3 ? m.split("").map((x) => x + x).join("") : m.padEnd(6, "0");
  return [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16));
};
const mix = (a: number[], b: number[], t: number) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(",")})`;
const clamp = (v: number) => Math.min(1, Math.max(0, v));

export function VoxelScene({ scene, scroll = false, className }: { scene: string; scroll?: boolean; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current!, ctx = cv.getContext("2d")!;
    const { n, vox } = MODELS[scene] ?? MODELS.pyramid;
    const top = Math.max(1, ...vox.map((c) => c.z + 1));
    const cubes = vox.map((c) => ({ ...c, o: (c.z * 3 + (2 * n - c.x - c.y) * 0.5) / (top * 3 + n) }));
    cubes.sort((a, b) => a.x + a.y - (b.x + b.y) || a.z - b.z);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pin = scroll ? (cv.closest("[data-pin]") as HTMLElement | null) : null;
    let raf = 0;

    const progress = () => {
      const vh = window.innerHeight, r = cv.getBoundingClientRect();
      const row = pin?.parentElement;
      if (pin && row) {
        const rr = row.getBoundingClientRect(), stick = parseFloat(getComputedStyle(pin).top) || 0, span = rr.height - pin.offsetHeight;
        // a quarter while the row comes in, the rest while it is held; done at 80 % of the hold
        if (span > 40) return 0.25 * clamp((vh - rr.top) / (vh - stick)) + 0.75 * clamp((stick - rr.top) / (span * 0.8));
      }
      return clamp((vh - r.top) / (vh - (vh - r.height) / 2));
    };

    const draw = () => {
      raf = 0;
      const W = cv.clientWidth, H = cv.clientHeight;
      if (!W) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
      const p = scroll && !reduce ? progress() : 1;
      const cs = getComputedStyle(document.documentElement);
      const bg = hex(cs.getPropertyValue("--bg")), fg = hex(cs.getPropertyValue("--fg")), ac = hex(cs.getPropertyValue("--accent"));
      const w = Math.min(W / (n + 0.5), (H * 0.98) / (n / 2 + top * 0.58 + 0.5)); // cube width on screen
      const hw = w / 2, qh = w / 4, ch = w * 0.58;
      const ox = W / 2, oy = H - n * 2 * qh - 2; // back corner of the grid
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.lineJoin = "round";
      ctx.lineWidth = w > 14 ? 1 : 0.6;
      ctx.strokeStyle = mix(bg, fg, 0);
      for (const c of cubes) {
        const k = clamp((p * 1.75 - c.o) / 0.75), e = 1 - Math.pow(1 - k, 3);
        if (e <= 0) continue;
        const x = ox + (c.x - c.y) * hw, y = oy + (c.x + c.y) * qh - c.z * ch - (1 - e) * (H * 0.6);
        ctx.globalAlpha = Math.min(1, e * 1.4);
        const face = (pts: number[], fill: string) => {
          ctx.fillStyle = fill; ctx.beginPath(); ctx.moveTo(pts[0], pts[1]);
          for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
          ctx.closePath(); ctx.fill(); ctx.stroke();
        };
        face([x, y - ch, x + hw, y + qh - ch, x, y + 2 * qh - ch, x - hw, y + qh - ch], c.a ? mix(bg, ac, 1) : mix(bg, fg, 0.9));
        face([x - hw, y + qh - ch, x, y + 2 * qh - ch, x, y + 2 * qh, x - hw, y + qh], c.a ? mix(bg, ac, 0.72) : mix(bg, fg, 0.46));
        face([x + hw, y + qh - ch, x, y + 2 * qh - ch, x, y + 2 * qh, x + hw, y + qh], c.a ? mix(bg, ac, 0.46) : mix(bg, fg, 0.2));
      }
      ctx.globalAlpha = 1;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(draw); };
    kick();
    const ro = new ResizeObserver(kick);
    ro.observe(cv);
    if (scroll) { window.addEventListener("scroll", kick, { passive: true }); window.addEventListener("resize", kick); }
    const mo = new MutationObserver(kick);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => { cancelAnimationFrame(raf); ro.disconnect(); mo.disconnect(); window.removeEventListener("scroll", kick); window.removeEventListener("resize", kick); };
  }, [scene, scroll]);

  return <canvas ref={ref} className={`voxel ${className ?? ""}`} aria-hidden />;
}
