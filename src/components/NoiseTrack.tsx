"use client";

import { useEffect, useRef } from "react";

// "Noisy track" background: hundreds of points follow a slowly drifting noise
// field and leave fading tracks behind them; a film-grain layer sits on top (CSS).

function makeNoise(seed = 7) {
  const perm = new Uint8Array(512);
  let s = seed;
  const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const p = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) { const j = (rand() * (i + 1)) | 0; [p[i], p[j]] = [p[j], p[i]]; }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const grad = (h: number, x: number, y: number, z: number) => {
    const u = h & 8 ? y : x, v = h & 4 ? (h & 2 ? x : z) : y; // cheap gradient
    return (h & 1 ? -u : u) + (h & 2 ? -v : v);
  };
  return (x: number, y: number, z: number) => {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255;
    x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
    const u = fade(x), v = fade(y), w = fade(z);
    const A = perm[X] + Y, AA = perm[A] + Z, AB = perm[A + 1] + Z, B = perm[X + 1] + Y, BA = perm[B] + Z, BB = perm[B + 1] + Z;
    return lerp(
      lerp(lerp(grad(perm[AA], x, y, z), grad(perm[BA], x - 1, y, z), u), lerp(grad(perm[AB], x, y - 1, z), grad(perm[BB], x - 1, y - 1, z), u), v),
      lerp(lerp(grad(perm[AA + 1], x, y, z - 1), grad(perm[BA + 1], x - 1, y, z - 1), u), lerp(grad(perm[AB + 1], x, y - 1, z - 1), grad(perm[BB + 1], x - 1, y - 1, z - 1), u), v),
      w,
    );
  };
}

export function NoiseTrack({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const noise = makeNoise();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, raf = 0, visible = true, t = 0;
    let bg = "#000", fg = "#fff";
    type P = { x: number; y: number; life: number };
    let pts: P[] = [];

    const colors = () => {
      const cs = getComputedStyle(document.documentElement);
      bg = cs.getPropertyValue("--bg").trim() || bg;
      fg = cs.getPropertyValue("--fg").trim() || fg;
      ctx.fillStyle = bg;
      ctx.globalAlpha = 1;
      ctx.fillRect(0, 0, w, h);
    };
    const spawn = (): P => ({ x: Math.random() * w, y: Math.random() * h, life: 60 + Math.random() * 220 });
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const r = canvas.getBoundingClientRect();
      w = Math.max(1, r.width); h = Math.max(1, r.height);
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      pts = Array.from({ length: Math.round(Math.min(700, (w * h) / 2200)) }, spawn);
      colors();
      if (reduce) for (let i = 0; i < 160; i++) step();
    };
    const step = () => {
      t += 0.0016;
      ctx.globalAlpha = 0.022; // fade old tracks slowly → long trails
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = fg;
      ctx.lineWidth = 1;
      ctx.beginPath();
      const sc = 0.0022;
      for (const p of pts) {
        const a = noise(p.x * sc, p.y * sc, t) * Math.PI * 2.4;
        const nx = p.x + Math.cos(a) * 1.5, ny = p.y + Math.sin(a) * 1.5;
        ctx.moveTo(p.x, p.y); ctx.lineTo(nx, ny);
        p.x = nx; p.y = ny;
        if (--p.life < 0 || nx < 0 || nx > w || ny < 0 || ny > h) Object.assign(p, spawn());
      }
      ctx.stroke();
    };
    const loop = () => { if (visible) step(); raf = requestAnimationFrame(loop); };

    resize();
    const ro = new ResizeObserver(resize); ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting)); io.observe(canvas);
    const mo = new MutationObserver(colors); mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    if (!reduce) raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); mo.disconnect(); };
  }, []);
  return <canvas ref={ref} className={className} aria-hidden />;
}
