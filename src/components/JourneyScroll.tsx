"use client";

import { useEffect, useRef, useState } from "react";
import type { Summary } from "@/lib/adventures";
import { fmtDate, fmtNum, type Dict, type Locale } from "@/lib/i18n";
import { Scramble } from "./Scramble";

// Whole adventure on one relief map (dot matrix, seen from above). Scrolling moves
// a point along the route and turns the line orange behind it, start to finish.

type Over = { nu: number; nv: number; h: string; days: { n: number; u: number[]; v: number[] }[] };
const pad = (n: number) => String(n).padStart(2, "0");
const hex = (c: string) => {
  const m = c.trim().replace("#", "");
  const f = m.length === 3 ? m.split("").map((x) => x + x).join("") : m.padEnd(6, "0");
  return [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16));
};

export function JourneyScroll({ src, summary, dict, locale }: { src: string; summary: Summary; dict: Dict; locale: Locale }) {
  const t = dict.adv;
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const kmEl = useRef<HTMLElement>(null), upEl = useRef<HTMLElement>(null), bar = useRef<HTMLDivElement>(null);
  const [di, setDi] = useState(0);
  const day = summary.days[di];

  useEffect(() => {
    const sec = section.current!, cv = canvas.current!, ctx = cv.getContext("2d")!;
    let dead = false, raf = 0, o: Over | null = null, relief: HTMLCanvasElement | null = null;
    let W = 0, H = 0, dpr = 1, cell = 4, lastDay = -1;
    const X: number[] = [], Y: number[] = [], brk: number[] = [];
    const kms = summary.days.map((d) => d.stats.distanceKm), total = kms.reduce((a, b) => a + b, 0);
    const css = () => getComputedStyle(document.documentElement);

    const build = () => {
      if (!o) return;
      const box = cv.parentElement!;
      W = box.clientWidth; H = box.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = W * dpr; cv.height = H * dpr;
      // contain the map; on narrow screens keep the dots readable and let the camera follow the rider
      cell = Math.max(Math.min(W / o.nu, (H * 0.9) / o.nv), 3.4);
      const cs = css(), fg = hex(cs.getPropertyValue("--fg")), bin = atob(o.h);
      relief = document.createElement("canvas");
      relief.width = Math.ceil(o.nu * cell * dpr); relief.height = Math.ceil(o.nv * cell * dpr);
      const g = relief.getContext("2d")!;
      g.scale(dpr, dpr);
      for (let j = 0; j < o.nv; j++)
        for (let i = 0; i < o.nu; i++) {
          const e = bin.charCodeAt(j * o.nu + i) / 255, s = Math.max(1, cell * (0.16 + 0.8 * e));
          g.fillStyle = `rgba(${fg.join(",")},${(0.1 + 0.5 * e).toFixed(2)})`;
          g.fillRect(i * cell + (cell - s) / 2, j * cell + (cell - s) / 2, s, s);
        }
    };

    const draw = () => {
      raf = 0;
      if (dead || !o || !relief) return;
      const r = sec.getBoundingClientRect(), stick = cv.parentElement!.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (stick.top - r.top) / Math.max(1, r.height - stick.height)));
      // position along the route, linear in kilometres
      const km = p * total;
      let d = 0, acc = 0;
      while (d < kms.length - 1 && acc + kms[d] < km) acc += kms[d++];
      const f = Math.min(1, (km - acc) / kms[d]);
      const idx = Math.min(X.length - 1.001, brk[d] + f * (brk[d + 1] - 1 - brk[d]));
      const i0 = Math.floor(idx), fr = idx - i0;
      const hx = (X[i0] + (X[i0 + 1] - X[i0]) * fr) * cell, hy = (Y[i0] + (Y[i0 + 1] - Y[i0]) * fr) * cell;
      const mw = o.nu * cell, mh = o.nv * cell;
      const tx = mw <= W ? (W - mw) / 2 : Math.min(0, Math.max(W - mw, W / 2 - hx));
      const ty = (H - mh) / 2;
      const cs = css(), accent = cs.getPropertyValue("--accent").trim(), bg = cs.getPropertyValue("--bg").trim(), mid = cs.getPropertyValue("--mid").trim(), fg = cs.getPropertyValue("--fg").trim();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(relief, tx, ty, mw, mh);
      ctx.translate(tx, ty);
      ctx.lineJoin = ctx.lineCap = "round";
      const path = (to: number) => {
        ctx.beginPath();
        for (let k = 0; k <= Math.floor(to); k++) {
          const jump = k > 0 && Math.hypot(X[k] - X[k - 1], Y[k] - Y[k - 1]) > 4; // train transfer: lift the pen
          if (k === 0 || jump) ctx.moveTo(X[k] * cell, Y[k] * cell); else ctx.lineTo(X[k] * cell, Y[k] * cell);
        }
      };
      path(X.length - 1);
      ctx.strokeStyle = bg; ctx.lineWidth = 5; ctx.stroke();
      ctx.strokeStyle = mid; ctx.lineWidth = 2; ctx.stroke();
      path(idx); ctx.lineTo(hx, hy);
      ctx.strokeStyle = accent; ctx.lineWidth = 3; ctx.stroke();
      brk.slice(0, -1).forEach((b, k) => { // stage starts
        ctx.fillStyle = bg; ctx.fillRect(X[b] * cell - 4.5, Y[b] * cell - 4.5, 9, 9);
        ctx.fillStyle = k <= d ? accent : fg; ctx.fillRect(X[b] * cell - 3, Y[b] * cell - 3, 6, 6);
      });
      ctx.fillStyle = bg; ctx.fillRect(hx - 8, hy - 8, 16, 16);
      ctx.fillStyle = accent; ctx.fillRect(hx - 6, hy - 6, 12, 12);

      if (kmEl.current) kmEl.current.textContent = fmtNum(km, locale);
      if (upEl.current) upEl.current.textContent = fmtNum(summary.days.slice(0, d).reduce((a, x) => a + x.stats.ascent, 0) + summary.days[d].stats.ascent * f, locale);
      if (bar.current) bar.current.style.setProperty("--p", String(p));
      if (d !== lastDay) { lastDay = d; setDi(d); }
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(draw); };
    const resize = () => { build(); kick(); };

    fetch(src).then((r) => r.json()).then((d: Over) => {
      if (dead) return;
      o = d;
      d.days.forEach((x) => { brk.push(X.length); X.push(...x.u); Y.push(...x.v); });
      brk.push(X.length);
      resize();
    }).catch(() => {});
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", resize);
    const mo = new MutationObserver(resize);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => { dead = true; cancelAnimationFrame(raf); window.removeEventListener("scroll", kick); window.removeEventListener("resize", resize); mo.disconnect(); };
  }, [src, summary, locale]);

  return (
    <section className="journey" ref={section} aria-label={t.journey}>
      <div className="journey-stick">
        <canvas ref={canvas} aria-hidden />
        <div className="journey-hud">
          <p className="label">[ {t.journey} ] {t.day} <Scramble text={pad(day.n)} /> / {pad(summary.days.length)} — <Scramble text={fmtDate(day.date, locale, { weekday: "short", day: "numeric", month: "short" })} /></p>
          <p className="journey-title"><Scramble text={day.start.name ?? "—"} duration={420} /> <span className="to" aria-hidden>→</span> <Scramble text={day.end.name ?? "—"} duration={420} delay={80} /></p>
          <p className="journey-count"><b className="num" ref={kmEl}>0</b><span className="unit">km</span> <b className="num" ref={upEl}>0</b><span className="unit">m ↑</span></p>
        </div>
        <div className="journey-foot">
          <div className="journey-bar" ref={bar} aria-hidden>
            {summary.days.map((d) => <i key={d.slug} style={{ flexGrow: d.stats.distanceKm }}><span>{pad(d.n)}</span></i>)}
          </div>
          <a className="label journey-skip" href="#explorer">{t.skipJourney} ↓</a>
        </div>
      </div>
    </section>
  );
}
