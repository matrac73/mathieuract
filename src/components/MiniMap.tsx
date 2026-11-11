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

  const here = useRef<HTMLElement>(null);

  // Nothing here runs in a loop: the relief is painted once, the route is redrawn only when the rider has
  // moved or the box has changed size, and the blinking "you are here" is a plain element animated in CSS.
  useEffect(() => {
    const el = wrap.current!, cv = canvas.current!, ctx = cv.getContext("2d")!;
    let o: Data | null = null, base: HTMLCanvasElement | null = null, dead = false, raf = 0, p = 0, drawn = -1, drawnW = 0;
    const CELL = 4; // the relief is painted once at this size, then only scaled
    const css = () => getComputedStyle(document.documentElement);

    const build = () => {
      if (!o) return;
      const fg = hex(css().getPropertyValue("--fg")), bin = atob(o.h);
      base = document.createElement("canvas");
      base.width = o.nu * CELL; base.height = o.nv * CELL;
      const g = base.getContext("2d")!;
      for (let j = 0; j < o.nv; j++)
        for (let i = 0; i < o.nu; i++) {
          const e = bin.charCodeAt(j * o.nu + i);
          if (!e) continue; // water stays empty
          g.fillStyle = `rgba(${fg.join(",")},${(0.13 + 0.62 * (e / 255)).toFixed(2)})`;
          g.fillRect(i * CELL, j * CELL, CELL - 1, CELL - 1);
        }
    };

    const draw = () => {
      raf = 0;
      if (dead || !o) return;
      const W = cv.clientWidth, H = cv.clientHeight;
      if (!W || !H) return;
      const cur = o.days[day], cell = W / o.nu;
      let hx = 0, hy = 0;
      if (cur) {
        let k = 0;
        while (k < cur.at.length - 2 && cur.at[k + 1] < p) k++;
        const t = Math.min(1, Math.max(0, (p - cur.at[k]) / Math.max(1e-6, cur.at[k + 1] - cur.at[k])));
        hx = cur.u[k] + (cur.u[k + 1] - cur.u[k]) * t; hy = cur.v[k] + (cur.v[k + 1] - cur.v[k]) * t;
        if (here.current) { here.current.style.left = `${(hx / o.nu) * 100}%`; here.current.style.top = `${(hy / o.nv) * 100}%`; here.current.hidden = false; }
      }
      if (Math.abs(p - drawn) < 0.004 && drawnW === W) return; // the canvas only when the line has visibly grown
      drawn = p; drawnW = W;
      base ??= (build(), base);
      if (!base) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (cv.width !== Math.round(W * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
      const cs = css(), accent = cs.getPropertyValue("--accent").trim(), bg = cs.getPropertyValue("--bg").trim(), fg = cs.getPropertyValue("--fg").trim(), mid = cs.getPropertyValue("--mid").trim();
      const big = W > 250;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.imageSmoothingEnabled = !big; // small: blended (no moiré); big: crisp pixels
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
      if (cur) line(cur, p, accent, lw);
      if (big) { // cities are named once there is room
        ctx.font = "600 9px ui-monospace, monospace"; ctx.textBaseline = "middle"; ctx.textAlign = "left";
        for (const c of o.cities) {
          const x = c.u * cell, y = c.v * cell;
          ctx.fillStyle = bg; ctx.fillRect(x - 3, y - 3, 6, 6);
          ctx.fillStyle = fg; ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
          ctx.fillStyle = bg; ctx.fillText(c.name.toUpperCase(), x + 6.5, y + 1); ctx.fillText(c.name.toUpperCase(), x + 5.5, y);
          ctx.fillStyle = fg; ctx.fillText(c.name.toUpperCase(), x + 6, y + 0.5);
        }
      }
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(draw); };
    handle.current = { set: (v) => { if (v !== p) { p = v; kick(); } } };
    let settle: ReturnType<typeof setTimeout> | undefined;
    const ro = new ResizeObserver(() => { clearTimeout(settle); settle = setTimeout(kick, 60); }); // once the box has finished growing
    ro.observe(cv);
    const mo = new MutationObserver(() => { base = null; drawn = -1; kick(); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    fetch(src).then((r) => r.json()).then((d: Data) => { if (dead) return; o = d; el.style.setProperty("--ratio", String(d.nu / d.nv)); kick(); }).catch(() => {});
    return () => { dead = true; cancelAnimationFrame(raf); clearTimeout(settle); ro.disconnect(); mo.disconnect(); handle.current = null; };
  }, [src, day, handle]);

  return (
    <button type="button" ref={wrap} className="minimap" aria-label={label} onClick={(e) => e.currentTarget.classList.toggle("open")}>
      <canvas ref={canvas} aria-hidden />
      <i className="minimap-here" ref={here} hidden aria-hidden />
      <span className="label minimap-tag" aria-hidden>{label}</span>
    </button>
  );
}
