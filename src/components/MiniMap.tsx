"use client";

import { useEffect, useRef, type MutableRefObject } from "react";

// Video-game minimap: the whole trip inside a much wider frame (coast, big lakes, a few cities), in pixels.
// A blinking dot says where we are; hovering (or tapping) makes it bigger and names the cities.

type Data = { nu: number; nv: number; h: string; days: { n: number; at: number[]; u: number[]; v: number[] }[]; cities: { name: string; u: number; v: number }[] };
export type MiniHandle = { set: (progress: number) => void };
const hex = (c: string) => {
  const m = c.trim().replace("#", "");
  const f = m.length === 3 ? m.split("").map((x) => x + x).join("") : m.padEnd(6, "0");
  return [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16));
};

export function MiniMap({ src, day, handle, label }: { src: string; day: number; handle: MutableRefObject<MiniHandle | null>; label: string }) {
  const wrap = useRef<HTMLButtonElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = wrap.current!, cv = canvas.current!, ctx = cv.getContext("2d")!;
    let o: Data | null = null, base: HTMLCanvasElement | null = null, dead = false, raf = 0, p = 0, W = 0, H = 0, dpr = 1;
    const css = () => getComputedStyle(document.documentElement);

    const build = () => {
      if (!o) return;
      W = cv.clientWidth; H = cv.clientHeight;
      if (!W || !H) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      const fg = hex(css().getPropertyValue("--fg")), bin = atob(o.h), cell = W / o.nu, gap = cell > 2.6 ? 1 : 0;
      base = document.createElement("canvas");
      base.width = cv.width; base.height = cv.height;
      const g = base.getContext("2d")!;
      g.scale(dpr, dpr);
      for (let j = 0; j < o.nv; j++)
        for (let i = 0; i < o.nu; i++) {
          const e = bin.charCodeAt(j * o.nu + i);
          if (!e) continue; // water stays empty
          g.fillStyle = `rgba(${fg.join(",")},${(0.13 + 0.62 * (e / 255)).toFixed(2)})`;
          g.fillRect(i * cell, j * cell, cell - gap, cell - gap);
        }
    };

    const draw = (now: number) => {
      raf = 0;
      if (dead || !o) return;
      if (!base || Math.abs(cv.clientWidth - W) > 0.5) build();
      if (!base) return;
      const cs = css(), accent = cs.getPropertyValue("--accent").trim(), bg = cs.getPropertyValue("--bg").trim(), fg = cs.getPropertyValue("--fg").trim(), mid = cs.getPropertyValue("--mid").trim();
      const cell = W / o.nu, big = W > 250;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(base, 0, 0, W, H);
      ctx.lineJoin = ctx.lineCap = "round";
      const line = (d: Data["days"][number], upTo: number, colour: string, w: number) => {
        ctx.beginPath();
        for (let k = 0; k < d.u.length && d.at[k] <= upTo + 1e-6; k++) {
          const jump = k > 0 && Math.hypot(d.u[k] - d.u[k - 1], d.v[k] - d.v[k - 1]) > 2.2; // a train transfer is not drawn
          if (k === 0 || jump) ctx.moveTo(d.u[k] * cell, d.v[k] * cell); else ctx.lineTo(d.u[k] * cell, d.v[k] * cell);
        }
        ctx.strokeStyle = colour; ctx.lineWidth = w; ctx.stroke();
      };
      const lw = big ? 2.4 : 1.6;
      o.days.forEach((d) => line(d, 1, bg, lw + 2.2));
      o.days.forEach((d, i) => line(d, 1, i < day ? accent : mid, lw));
      const cur = o.days[day];
      let hx = 0, hy = 0;
      if (cur) {
        line(cur, p, accent, lw);
        let k = 0;
        while (k < cur.at.length - 2 && cur.at[k + 1] < p) k++;
        const t = Math.min(1, Math.max(0, (p - cur.at[k]) / Math.max(1e-6, cur.at[k + 1] - cur.at[k])));
        hx = (cur.u[k] + (cur.u[k + 1] - cur.u[k]) * t) * cell; hy = (cur.v[k] + (cur.v[k + 1] - cur.v[k]) * t) * cell;
      }
      if (big) { // cities are named once there is room
        ctx.font = "600 9px ui-monospace, monospace"; ctx.textBaseline = "middle"; ctx.textAlign = "left";
        for (const c of o.cities) {
          const x = c.u * cell, y = c.v * cell;
          ctx.fillStyle = bg; ctx.fillRect(x - 3, y - 3, 6, 6);
          ctx.fillStyle = fg; ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
          ctx.globalAlpha = 0.85; ctx.fillStyle = bg; ctx.fillText(c.name.toUpperCase(), x + 6.5, y + 1); ctx.fillText(c.name.toUpperCase(), x + 5.5, y);
          ctx.globalAlpha = 1; ctx.fillStyle = fg; ctx.fillText(c.name.toUpperCase(), x + 6, y + 0.5);
        }
      }
      if (cur) { // you are here
        const beat = (now % 1400) / 1400, r = big ? 4 : 3, ring = r + 2 + beat * (big ? 12 : 8);
        ctx.globalAlpha = 1 - beat; ctx.strokeStyle = accent; ctx.lineWidth = 1.5; ctx.strokeRect(hx - ring, hy - ring, ring * 2, ring * 2);
        ctx.globalAlpha = 1; ctx.fillStyle = bg; ctx.fillRect(hx - r - 1.5, hy - r - 1.5, 2 * r + 3, 2 * r + 3);
        ctx.fillStyle = accent; ctx.fillRect(hx - r, hy - r, 2 * r, 2 * r);
      }
      if (vis && !reduce) raf = requestAnimationFrame(draw);
    };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let vis = false;
    const kick = () => { if (!raf) raf = requestAnimationFrame(draw); };
    handle.current = { set: (v) => { p = v; kick(); } };
    const io = new IntersectionObserver((es) => { vis = es.some((e) => e.isIntersecting); if (vis) kick(); });
    io.observe(el);
    const ro = new ResizeObserver(() => { base = null; kick(); });
    ro.observe(cv);
    const mo = new MutationObserver(() => { base = null; kick(); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    fetch(src).then((r) => r.json()).then((d: Data) => { if (dead) return; o = d; el.style.setProperty("--ratio", String(d.nu / d.nv)); kick(); }).catch(() => {});
    return () => { dead = true; cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); mo.disconnect(); handle.current = null; };
  }, [src, day, handle]);

  return (
    <button type="button" ref={wrap} className="minimap" aria-label={label} onClick={(e) => e.currentTarget.classList.toggle("open")}>
      <canvas ref={canvas} aria-hidden />
      <span className="label minimap-tag" aria-hidden>{label}</span>
    </button>
  );
}
