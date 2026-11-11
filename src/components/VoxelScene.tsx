"use client";

import { useEffect, useRef } from "react";

// Small isometric cube sculptures. With `scroll`, the cubes fall into place as the
// scene travels up the viewport (and lift off again when scrolling back).

const N = 8;
type Cell = { h: number; accent?: boolean };
const ring = (x: number, y: number) => Math.max(Math.abs(x - 3.5), Math.abs(y - 3.5));
const SCENES: Record<string, (x: number, y: number) => Cell> = {
  // career
  bars: (x, y) => (x % 2 === 0 && y >= 2 && y <= 5 ? { h: [2, 3, 5, 7][x / 2], accent: x === 6 } : { h: 1 }),
  chat: (x, y) => (x >= 1 && x <= 6 && y >= 2 && y <= 5 ? { h: y === 3 && x % 2 === 0 ? 4 : 3, accent: y === 3 && x % 2 === 0 } : x === 2 && y === 6 ? { h: 2 } : { h: 0 }),
  skyline: (x, y) => ({ h: 1 + (y >= 2 && y <= 5 ? [0, 5, 7, 0, 6, 8, 0, 3][x] * (y === 2 || y === 5 ? 0.5 : 1) : 0) | 0, accent: x === 5 && (y === 3 || y === 4) }),
  matrix: (x, y) => (x === 3 || x === 4 || y === 3 || y === 4 ? { h: 1 } : { h: x < 3 ? (y < 3 ? 3 : 2) : y < 3 ? 6 : 4, accent: x > 4 && y < 3 }),
  plane: (x, y) => ({ h: 1 + ((y === 3 || y === 4) && x >= 0 ? 2 : (x === 3 || x === 4) ? 1 : x === 7 && y >= 2 && y <= 5 ? 1 : 0), accent: x === 0 && (y === 3 || y === 4) }),
  pyramid: (x, y) => ({ h: 1 + Math.round((3.5 - ring(x, y)) * 1.6), accent: ring(x, y) < 1 }),
  books: (x, y) => (y >= 2 && y <= 5 ? (x <= 1 ? { h: 4 } : x >= 3 && x <= 4 ? { h: 6, accent: true } : x >= 6 ? { h: 2 } : { h: 0 }) : { h: 0 }),
  mountain: (x, y) => ({ h: Math.max(1, Math.round(7 - 1.15 * (Math.abs(x - 3.5) + Math.abs(y - 3.5)))), accent: ring(x, y) < 1 }),
  // articles
  stairs: (x, y) => (y >= 3 && y <= 4 ? { h: x + 1, accent: x === 7 } : { h: 0 }),
  sieve: (x, y) => ({ h: (x + y) % 2 ? 2 : 1, accent: (x + y) % 2 === 1 && (x * 3 + y * 5) % 7 === 0 }),
  clusters: (x, y) => { const d = [[1.5, 1.5], [5.5, 2.5], [3, 6]].map(([a, b]) => Math.hypot(x - a, y - b)); const m = Math.min(...d); return m < 1.9 ? { h: m < 0.8 ? 4 : 2, accent: m < 0.8 } : { h: 0 }; },
  wave: (x, y) => (y >= 2 && y <= 5 ? { h: Math.round(3.6 + 2.6 * Math.sin(x * 0.95)), accent: x === 7 } : { h: 0 }),
  target: (x, y) => { const r = ring(x, y); return { h: r < 1 ? 5 : r < 2 ? 1 : r < 3 ? 3 : 1, accent: r < 1 }; },
  maze: (x, y) => ((x * 7 + y * 3) % 5 === 0 && x !== y ? { h: 3 } : { h: 1, accent: x === y }),
  tree: (x, y) => (y <= 1 ? (x >= 3 && x <= 4 ? { h: 5, accent: true } : { h: 0 }) : y >= 3 && y <= 4 ? (x === 1 || x === 2 || x === 5 || x === 6 ? { h: 3 } : { h: 0 }) : y >= 6 ? (x % 2 === 0 ? { h: 1 } : { h: 0 }) : { h: 0 }),
};

const hex = (c: string) => {
  const m = c.trim().replace("#", "");
  const f = m.length === 3 ? m.split("").map((x) => x + x).join("") : m.padEnd(6, "0");
  return [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16));
};
const mix = (a: number[], b: number[], t: number) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(",")})`;

export function VoxelScene({ scene, scroll = false, className }: { scene: string; scroll?: boolean; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current!, ctx = cv.getContext("2d")!;
    const fn = SCENES[scene] ?? SCENES.pyramid;
    const cubes: { x: number; y: number; z: number; accent: boolean; o: number }[] = [];
    let top = 1;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const c = fn(x, y);
      top = Math.max(top, c.h);
      for (let z = 0; z < c.h; z++) cubes.push({ x, y, z, accent: !!c.accent && z === c.h - 1, o: 0 });
    }
    cubes.sort((a, b) => a.x + a.y - (b.x + b.y) || a.z - b.z);
    cubes.forEach((c) => (c.o = (c.z * 3 + (2 * N - c.x - c.y) * 0.5) / (top * 3 + N)));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;

    const draw = () => {
      raf = 0;
      const W = cv.clientWidth, H = cv.clientHeight;
      if (!W) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (cv.width !== Math.round(W * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
      let p = 1;
      if (scroll && !reduce) {
        const r = cv.getBoundingClientRect(), vh = window.innerHeight;
        p = Math.min(1, Math.max(0, (vh - r.top) / (vh - (vh - r.height) / 2))); // complete exactly when the scene is centred, where the scroll pauses
      }
      const cs = getComputedStyle(document.documentElement);
      const bg = hex(cs.getPropertyValue("--bg")), fg = hex(cs.getPropertyValue("--fg")), accent = cs.getPropertyValue("--accent").trim();
      const w = Math.min(W / (N + 0.5), (H * 0.98) / (N / 2 + top * 0.58 + 0.5)); // cube width on screen
      const hw = w / 2, qh = w / 4, ch = w * 0.58;
      const ox = W / 2, oy = H - N * 2 * qh - 2; // back corner of the grid
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.lineJoin = "round";
      ctx.lineWidth = w > 14 ? 1 : 0.6;
      ctx.strokeStyle = mix(bg, fg, 0);
      for (const c of cubes) {
        const k = Math.min(1, Math.max(0, (p * 1.75 - c.o) / 0.75)), e = 1 - Math.pow(1 - k, 3);
        if (e <= 0) continue;
        const x = ox + (c.x - c.y) * hw, y = oy + (c.x + c.y) * qh - c.z * ch - (1 - e) * (H * 0.6);
        ctx.globalAlpha = Math.min(1, e * 1.4);
        const face = (pts: number[], fill: string) => {
          ctx.fillStyle = fill; ctx.beginPath(); ctx.moveTo(pts[0], pts[1]);
          for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
          ctx.closePath(); ctx.fill(); ctx.stroke();
        };
        face([x, y - ch, x + hw, y + qh - ch, x, y + 2 * qh - ch, x - hw, y + qh - ch], c.accent ? accent : mix(bg, fg, 0.9));
        face([x - hw, y + qh - ch, x, y + 2 * qh - ch, x, y + 2 * qh, x - hw, y + qh], mix(bg, fg, 0.46));
        face([x + hw, y + qh - ch, x, y + 2 * qh - ch, x, y + 2 * qh, x + hw, y + qh], mix(bg, fg, 0.2));
      }
      ctx.globalAlpha = 1;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(draw); };
    kick();
    const ro = new ResizeObserver(kick);
    ro.observe(cv);
    if (scroll) window.addEventListener("scroll", kick, { passive: true });
    const mo = new MutationObserver(kick);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => { cancelAnimationFrame(raf); ro.disconnect(); mo.disconnect(); window.removeEventListener("scroll", kick); };
  }, [scene, scroll]);

  return <canvas ref={ref} className={`voxel ${className ?? ""}`} aria-hidden />;
}
