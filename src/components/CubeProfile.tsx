"use client";

import { useEffect, useRef, useState } from "react";

// Elevation profile built out of cubes. It first appears as a handful of big
// blocks, then refines level by level (each level halves the cube size) until
// the road is readable. Drawn on canvas with a painter's algorithm; only the
// faces that can be seen are drawn, so even the finest level stays cheap.

export type Mark = { at: number; label: string; sub?: string };
type Props = {
  ele: number[];
  shade?: (number | null)[]; // 0..1 per sample → grey level of the front faces
  height?: number;
  minRange?: number; // metres: keeps flat days looking flat
  marks?: Mark[];
  cursor?: number | null; // 0..1
  onHover?: (frac: number | null) => void;
  onPick?: (frac: number) => void;
  label?: string;
  trace?: boolean; // an orange line creeps along the crest, in a loop
};

const LEVELS = [12, 24, 48, 96, 192];
const MIN_CUBE = 3; // px
const hex = (c: string) => {
  const m = c.trim().replace("#", "");
  const f = m.length === 3 ? m.split("").map((x) => x + x).join("") : m.padEnd(6, "0");
  return [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16));
};
const mix = (a: number[], b: number[], t: number) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(",")})`;
const hash = (c: number, k: number, l: number) => (((c + 1) * 73856093) ^ ((k + 1) * 19349663) ^ ((l + 1) * 83492791)) >>> 0;

type Geo = { n: number; s: number; D: number; ox: number; oy: number; heights: Int16Array; shades: Float32Array };

export function CubeProfile({ ele, shade, height = 340, minRange = 500, marks, cursor, onHover, onPick, label, trace }: Props) {
  const [crest, setCrest] = useState("");
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const lastEle = useRef<number[] | null>(null);
  const geoRef = useRef<Geo | null>(null);
  const [flags, setFlags] = useState<{ left: number; top: number }[]>([]);
  const [box, setBox] = useState({ ox: 0, w: 1 });

  useEffect(() => {
    const cv = canvas.current!, el = wrap.current!;
    const ctx = cv.getContext("2d")!;
    let raf = 0, running = false;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const build = (animate: boolean) => {
      cancelAnimationFrame(raf);
      const W = el.clientWidth, H = height;
      if (W < 10 || ele.length < 2) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = W * dpr; cv.height = H * dpr;
      cv.style.height = `${H}px`;
      const cs = getComputedStyle(document.documentElement);
      const fg = hex(cs.getPropertyValue("--fg") || "#fff"), bg = hex(cs.getPropertyValue("--bg") || "#000");
      const cTop = mix(bg, fg, 0.95), cSide = mix(bg, fg, 0.42), cBg = mix(bg, fg, 0);

      const lo = Math.min(...ele), hi = Math.max(...ele);
      const range = Math.max(hi - lo, minRange) * 1.06, base = lo - Math.max(hi - lo, minRange) * 0.06;
      const s0 = (W - 2) / (LEVELS[0] + 0.5); // level-0 cube; depth = half a cube, constant in px for all levels
      const depth = s0 / 2;
      const levels = LEVELS.filter((n, i) => i === 0 || ((W - 2 - depth) / n >= MIN_CUBE && n <= ele.length));

      const geo = (n: number, li: number): Geo => {
        const s = (W - 2 - depth) / n, D = 1 << li;
        const rows = Math.max(2, Math.floor((H - depth - 6) / s));
        const heights = new Int16Array(n * D), shades = new Float32Array(n);
        for (let c = 0; c < n; c++) {
          const a = Math.floor((c * ele.length) / n), b = Math.max(a + 1, Math.floor(((c + 1) * ele.length) / n));
          let v = 0, sh = 0, shN = 0;
          for (let i = a; i < b; i++) {
            v += ele[i];
            const q = shade?.[i];
            if (q != null) { sh += q; shN++; }
          }
          const h = Math.max(1, Math.round(((v / (b - a) - base) / range) * rows));
          shades[c] = shN ? sh / shN : 0;
          for (let k = 0; k < D; k++) heights[c * D + k] = k === 0 ? h : Math.max(1, h - (hash(c, k, li) % 3 === 0 ? 1 : 0));
        }
        return { n, s, D, ox: 1, oy: H - 1, heights, shades };
      };

      const paint = (g: Geo, target: CanvasRenderingContext2D, grow = 1) => {
        const { n, s, D, ox, oy, heights, shades } = g;
        const hs = s / 2, fine = s < 7;
        target.lineJoin = "round";
        target.lineWidth = fine ? 0.5 : 1;
        const ht = (c: number, k: number) => Math.max(1, Math.round(heights[c * D + k] * grow));
        for (let k = D - 1; k >= 0; k--) {
          for (let c = 0; c < n; c++) {
            const h = ht(c, k), hFront = k > 0 ? ht(c, k - 1) : 0, hRight = c < n - 1 ? ht(c + 1, k) : 0;
            const x = ox + c * s + k * hs;
            const front = mix(bg, fg, 0.05 + 0.62 * shades[c]);
            for (let y = 0; y < h; y++) {
              const yb = oy - y * s - k * hs, yt = yb - s;
              if (y >= hFront) { // front face
                target.fillStyle = front;
                target.strokeStyle = mix(bg, fg, fine ? 0.38 : 0.7);
                target.fillRect(x, yt, s, s);
                target.strokeRect(x, yt, s, s);
              }
              if (y >= hRight) { // right side
                target.fillStyle = cSide; target.strokeStyle = cBg;
                target.beginPath();
                target.moveTo(x + s, yt); target.lineTo(x + s + hs, yt - hs); target.lineTo(x + s + hs, yb - hs); target.lineTo(x + s, yb);
                target.closePath(); target.fill(); target.stroke();
              }
              if (y === h - 1) { // top
                target.fillStyle = cTop; target.strokeStyle = cBg;
                target.beginPath();
                target.moveTo(x, yt); target.lineTo(x + s, yt); target.lineTo(x + s + hs, yt - hs); target.lineTo(x + hs, yt - hs);
                target.closePath(); target.fill(); target.stroke();
              }
            }
          }
        }
      };

      const geos = levels.map((n, i) => geo(n, i));
      const final = geos[geos.length - 1];
      geoRef.current = final;
      setBox({ ox: final.ox, w: final.n * final.s });
      if (trace) setCrest(Array.from({ length: final.n }, (_, c) => `${(final.ox + (c + 0.75) * final.s).toFixed(1)},${(final.oy - (final.heights[c * final.D] + 0.25) * final.s).toFixed(1)}`).join(" "));
      setFlags(
        (marks ?? []).map((m) => {
          const c = Math.min(final.n - 1, Math.max(0, Math.floor(m.at * final.n)));
          return { left: final.ox + (c + 0.5) * final.s + depth / 2, top: final.oy - final.heights[c * final.D] * final.s - depth };
        }),
      );

      const layer = (g: Geo) => {
        const off = document.createElement("canvas");
        off.width = cv.width; off.height = cv.height;
        const c2 = off.getContext("2d")!;
        c2.setTransform(dpr, 0, 0, dpr, 0, 0);
        paint(g, c2);
        return off;
      };
      const blit = (img: HTMLCanvasElement, alpha: number) => {
        ctx.globalAlpha = alpha;
        ctx.drawImage(img, 0, 0);
        ctx.globalAlpha = 1;
      };
      const clear = () => { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height); };

      if (!animate || reduce) {
        clear();
        blit(layer(final), 1);
        running = false;
        return;
      }

      // timeline: level 0 rises, then each finer level cross-fades in
      running = true;
      const RISE = 420, FADE = 230, HOLD = 110;
      const layers: (HTMLCanvasElement | null)[] = geos.map(() => null);
      const get = (i: number) => (layers[i] ??= layer(geos[i]));
      const t0 = performance.now();
      const frame = (now: number) => {
        const t = now - t0;
        clear();
        if (t < RISE) {
          const p = 1 - Math.pow(1 - t / RISE, 3);
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          paint(geos[0], ctx, Math.max(0.05, p));
        } else {
          const u = t - RISE, seg = FADE + HOLD;
          const i = Math.min(geos.length - 1, 1 + Math.floor(u / seg));
          const p = Math.min(1, (u - (i - 1) * seg) / FADE);
          if (i >= geos.length - 1 && p >= 1) { blit(get(geos.length - 1), 1); running = false; return; }
          if (geos.length === 1) { blit(get(0), 1); running = false; return; }
          blit(get(i - 1), 1);
          blit(get(i), p);
        }
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    };

    const animate = lastEle.current !== ele;
    lastEle.current = ele;
    build(animate);
    let lastW = el.clientWidth;
    const ro = new ResizeObserver(() => { if (el.clientWidth !== lastW) { lastW = el.clientWidth; build(false); } });
    ro.observe(el);
    const mo = new MutationObserver(() => build(false));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect(); mo.disconnect();
      if (running) lastEle.current = null; // interrupted mid-animation → replay next time
    };
    // marks are derived from the same day as `ele`, so they don't need to be a dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ele, shade, height, minRange, trace]);

  const fracAt = (clientX: number) => {
    const r = wrap.current!.getBoundingClientRect();
    return Math.min(1, Math.max(0, (clientX - r.left - box.ox) / box.w));
  };

  return (
    <div
      ref={wrap}
      className="cubes"
      role="img"
      aria-label={label}
      onPointerMove={(e) => onHover?.(fracAt(e.clientX))}
      onPointerDown={(e) => onHover?.(fracAt(e.clientX))}
      onPointerLeave={() => onHover?.(null)}
      onClick={(e) => onPick?.(fracAt(e.clientX))}
      style={{ cursor: onPick ? "pointer" : onHover ? "crosshair" : undefined }}
    >
      <canvas ref={canvas} style={{ width: "100%", height }} />
      {trace && crest && <svg className="cubes-trace" aria-hidden><polyline points={crest} pathLength={1} /></svg>}
      {cursor != null && <div className="cubes-cursor" style={{ left: box.ox + cursor * box.w }} />}
      {marks?.map((m, i) =>
        flags[i] ? (
          <div key={m.label + i} className="cubes-flag" style={{ left: flags[i].left, top: flags[i].top }}>
            <span className="cubes-flag-n">{i + 1}</span>
            <span className="cubes-flag-t">{m.label}{m.sub ? <em> {m.sub}</em> : null}</span>
          </div>
        ) : null,
      )}
    </div>
  );
}
