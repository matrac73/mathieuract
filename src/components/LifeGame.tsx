"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Stage } from "@/content/site";
import type { Locale } from "@/lib/i18n";
import { Scramble } from "./Scramble";

// The path as a two-lane timeline, in the spirit of a rhythm platformer (no music):
// studies are built above the time ruler, jobs below it, and periods overlap as they did.
// Two small cubes run along their lane; the blocks assemble out of loose pixels just ahead
// of them and settle behind. It starts in the mountains of Savoie and ends on "coming soon".
// It plays by itself once; the mouse scrubs it, Space / → jumps to the next period.

type Labels = { acad: string; pro: string; origin: string; soon: string; now: string; hint: string; touch: string; replay: string; prev: string; next: string; more: string; wip: string; none: string };
const mo = (ym: string) => Number(ym.slice(0, 4)) * 12 + Number(ym.slice(5, 7)) - 1;
const hex = (c: string) => {
  const m = c.trim().replace("#", "");
  const f = m.length === 3 ? m.split("").map((x) => x + x).join("") : m.padEnd(6, "0");
  return [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16));
};
const rnd = (n: number) => { const s = Math.sin(n * 127.1 + 3.7) * 43758.5453; return s - Math.floor(s); };
const back = (k: number) => 1 + 2.4 * Math.pow(k - 1, 3) + 1.4 * Math.pow(k - 1, 2); // ease-out with a small overshoot
const PEAKS = [1, 2, 3, 2, 3, 5, 6, 5, 4, 5, 7, 8, 7, 5, 4, 3, 2, 3, 2, 1];

export function LifeGame({ stages, locale, labels }: { stages: Stage[]; locale: Locale; labels: Labels }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const api = useRef<{ step: (d: number) => boolean; replay: () => void }>({ step: () => false, replay: () => {} });
  const [active, setActive] = useState<{ acad: string | null; pro: string | null }>({ acad: stages[0]?.id ?? null, pro: null });

  useEffect(() => {
    const el = wrap.current!, cv = canvas.current!, ctx = cv.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nowM = new Date().getFullYear() * 12 + new Date().getMonth();
    const first = Math.min(...stages.map((s) => mo(s.start)));
    const T0 = first - 34, T1 = nowM + 18; // room for Savoie before, "coming soon" after
    let W = 0, H = 0, cell = 8, world = 0, padL = 0, axis = 0, band = 12, dpr = 1;
    let px = 0, target = 0, cam = 0, raf = 0, visible = false, last = 0, auto: number | null = null, played = false, key = "";
    let pal = { bg: [0, 0, 0], fg: [255, 255, 255], accent: "#ff5a1f", dot: "monospace", mono: "monospace" };
    const tone = (t: number) => `rgb(${pal.bg.map((v, i) => Math.round(v + (pal.fg[i] - v) * t)).join(",")})`;
    const xOf = (m: number) => padL + ((m - T0) / (T1 - T0)) * world;
    const snap = (x: number) => Math.round(x / cell) * cell;
    type Block = { s: Stage; x0: number; x1: number; base: number; h: number };
    let blocks: Block[] = [];
    const riders = [{ lane: "acad" as const, y: 0, from: 0, to: 0, t: -1e9, rot: 0, show: 1 }, { lane: "pro" as const, y: 0, from: 0, to: 0, t: -1e9, rot: 0, show: 0 }];
    const trail: { x: number; a: number; p: number }[] = [];

    const size = () => {
      const keep = world ? (px - padL) / world : 0;
      W = el.clientWidth; H = W < 620 ? 300 : 360;
      cell = W < 620 ? 6 : 8;
      padL = cell * 2;
      world = Math.max(W - padL * 2, ((T1 - T0) / 12) * 60);
      axis = Math.round(H * 0.5); band = cell * 1.5;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = W * dpr; cv.height = H * dpr; cv.style.height = `${H}px`;
      const cs = getComputedStyle(document.documentElement), body = getComputedStyle(document.body);
      pal = { bg: hex(cs.getPropertyValue("--bg")), fg: hex(cs.getPropertyValue("--fg")), accent: cs.getPropertyValue("--accent").trim(), dot: body.getPropertyValue("--font-dot") || "monospace", mono: body.getPropertyValue("--font-mono") || "monospace" };
      blocks = stages.map((s) => ({ s, x0: snap(xOf(mo(s.start))), x1: snap(xOf(s.end ? mo(s.end) : nowM)), base: s.row ? 9 : 0, h: 1 + s.level * 3 }));
      px = padL + keep * world; target = Math.min(target, endX());
    };
    const startX = () => snap(xOf(first)) - cell * 9;
    const endX = () => snap(xOf(nowM)) + cell * 7;
    const mountain = (x: number) => { // Savoie, before the first period
      const x1 = snap(xOf(first)) - cell, x0 = x1 - PEAKS.length * cell;
      return x >= x0 && x < x1 ? PEAKS[Math.floor((x - x0) / cell)] : 0;
    };
    const surface = (lane: "acad" | "pro", x: number) => {
      let h = lane === "acad" ? mountain(x) : 0;
      for (const b of blocks) if (b.s.lane === lane && x >= b.x0 && x < b.x1) h = Math.max(h, b.base + b.h);
      return h;
    };
    const current = (lane: "acad" | "pro", x: number) => {
      const on = blocks.filter((b) => b.s.lane === lane && x >= b.x0 - 2 && (x < b.x1 || !b.s.end)); // an open-ended period is still the current one
      return on.length ? on.reduce((a, b) => (b.base > a.base || mo(b.s.start) > mo(a.s.start) ? b : a)).s.id : null;
    };

    const draw = (now: number) => {
      raf = 0;
      if (!visible) return;
      const dt = Math.min(50, now - (last || now)); last = now;
      if (auto != null) { // plays itself once, start to finish
        const k = Math.min(1, (now - auto) / 12000);
        target = px = startX() + (endX() - startX()) * k;
        if (k >= 1) auto = null;
      } else px += (target - px) * Math.min(1, dt * 0.007);
      const moving = Math.abs(target - px) > 0.6 || auto != null;
      cam += (Math.max(0, Math.min(world + padL * 2 - W, px - W * 0.4)) - cam) * (reduce ? 1 : 0.15);
      const a = current("acad", px), p = current("pro", px), k2 = `${a}|${p}`;
      if (k2 !== key) { key = k2; setActive({ acad: a, pro: p }); }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      // backdrop: a faint grid drifting slower than the lanes
      ctx.fillStyle = tone(0.055);
      const g = cell * 4, gx0 = -((cam * 0.5) % g);
      for (let x = gx0; x < W; x += g) ctx.fillRect(Math.round(x), 0, 1, H);
      for (let y = axis % g; y < H; y += g) ctx.fillRect(0, y, W, 1);
      ctx.save();
      ctx.translate(-Math.round(cam), 0);
      const A = cell * 18; // how far ahead of the cubes the pixels start to gather

      // a block cell: loose dot far ahead, snaps into place as the cube arrives, settles once passed
      const put = (x: number, row: number, lane: "acad" | "pro", lit: number, seed: number) => {
        const d = x - px;
        let sc: number, off = 0, al = 1;
        if (d > A) { sc = 0.2; al = 0.5; }
        else if (d > 0) { const k = 1 - d / A, q = Math.min(1, Math.max(0, k * 1.5 - rnd(seed) * 0.5)); sc = 0.2 + 0.8 * back(q); off = (1 - q) * (1 - q) * cell * (3 + 5 * rnd(seed + 9)); al = 0.5 + 0.5 * q; }
        else sc = Math.max(0.66, 1 - (-d / (cell * 30)) * 0.34);
        const s = Math.max(1.5, (cell - 1) * sc), dir = lane === "acad" ? -1 : 1;
        const cy = axis + dir * (band + (row + 0.5) * cell + off);
        ctx.globalAlpha = al;
        ctx.fillStyle = lit >= 2 ? pal.accent : tone(d > 0 ? 0.42 + 0.5 * (al - 0.5) : lit ? 0.92 : 0.5);
        ctx.fillRect(x + (cell - s) / 2, cy - s / 2, s, s);
      };
      const from = Math.floor(cam / cell) * cell - cell, to = cam + W + cell;
      for (let x = Math.max(from, 0); x < to; x += cell) { // Savoie
        const h = mountain(x);
        for (let r = 0; r < h; r++) put(x, r, "acad", r === h - 1 && h >= 7 ? 1 : 0, x * 7 + r);
      }
      ctx.textBaseline = "middle";
      for (const b of blocks) {
        const on = b.s.id === a || b.s.id === p, lane = b.s.lane, dir = lane === "acad" ? -1 : 1;
        for (let x = Math.max(b.x0, from); x < Math.min(b.x1, to); x += cell)
          for (let r = 0; r < b.h; r++) {
            const edge = r === b.h - 1, hollow = !edge && r > 0 && x > b.x0 && x < b.x1 - cell && (x / cell + r) % 2 === 1; // lighter, pixelated body
            if (!hollow) put(x, b.base + r, lane, on ? (edge ? 2 : 1) : 0, x * 3 + r * 17 + b.base);
          }
        if (!b.s.end) for (let x = b.x1, i = 0; x < Math.min(b.x1 + cell * 12, to); x += cell * 2, i++) { // still being written
          ctx.globalAlpha = Math.max(0, 0.6 - i * 0.1); ctx.fillStyle = tone(0.6);
          for (let r = 0; r < b.h; r += 2) ctx.fillRect(x + 2, axis + dir * (band + (b.base + r + 0.5) * cell) - 1.5, 3, 3);
        }
        const reach = Math.min(1, Math.max(0, 1 - (b.x0 - px) / A)); // the name appears as the cube gets there
        if (reach > 0) {
          ctx.globalAlpha = reach * (on ? 1 : 0.55);
          ctx.font = `600 ${W < 620 ? 9 : 10}px ${pal.mono}`; ctx.textAlign = "left"; ctx.fillStyle = on ? pal.accent : tone(1);
          const ly = axis + dir * (band + (b.base + b.h + 1.1) * cell);
          ctx.fillText(b.s.short, b.x0, ly); // what kind of period…
          ctx.globalAlpha = reach * (on ? 0.85 : 0.4); ctx.font = `500 ${W < 620 ? 8 : 9}px ${pal.mono}`; ctx.fillStyle = tone(1);
          ctx.fillText(b.s.where, b.x0, ly + dir * cell * 1.5); // …and where
        }
      }
      ctx.globalAlpha = 1;
      // the ruler between the two lanes
      ctx.fillStyle = tone(0.22); ctx.fillRect(Math.max(0, cam), axis - 0.5, W, 1);
      ctx.font = `500 9px ${pal.mono}`; ctx.textAlign = "center";
      for (let y = Math.ceil(T0 / 12); y * 12 <= T1; y++) {
        const x = xOf(y * 12);
        if (x < cam - 30 || x > cam + W + 30) continue;
        ctx.fillStyle = tone(0); ctx.fillRect(x - 15, axis - 6, 30, 12);
        ctx.fillStyle = tone(x <= px ? 0.95 : 0.4); ctx.fillText(String(y), x, axis + 0.5);
      }
      // today, and what comes next
      const nx = snap(xOf(nowM));
      for (let y = cell; y < H - cell; y += cell) { ctx.fillStyle = y % (cell * 2) ? pal.accent : "transparent"; ctx.globalAlpha = 0.75; ctx.fillRect(nx, y, 2, cell - 2); }
      ctx.globalAlpha = 1;
      ctx.font = `500 9px ${pal.mono}`; ctx.textAlign = "right"; ctx.fillStyle = pal.accent; ctx.fillText(labels.now, nx - 6, cell * 2);
      ctx.textAlign = "left"; ctx.font = `900 ${W < 620 ? 16 : 22}px ${pal.dot}`;
      ctx.fillStyle = tone(px > nx - cell * 4 ? 1 : 0.35);
      const soon = labels.soon.split(" ");
      soon.forEach((w, i) => ctx.fillText(w, nx + cell * 2, axis - band - cell * (2.2 + (soon.length - 1 - i) * 3)));
      if (Math.floor(now / 480) % 2) { ctx.fillStyle = pal.accent; ctx.fillRect(nx + cell * 2, axis - band - cell * 1.1, cell * 1.6, 3); }
      ctx.font = `600 10px ${pal.mono}`; ctx.fillStyle = tone(px < xOf(first) ? 1 : 0.5); ctx.textAlign = "left";
      ctx.fillText(labels.origin, snap(xOf(first)) - PEAKS.length * cell, axis + band + cell * 1.2);

      // the two cubes
      if (moving) trail.push({ x: px, a: 1, p: 0 });
      for (const r of riders) {
        const dir = r.lane === "acad" ? -1 : 1, surf = surface(r.lane, px) * cell;
        const want = r.lane === "acad" ? 1 : px >= Math.min(...blocks.filter((b) => b.s.lane === "pro").map((b) => b.x0)) - cell ? 1 : 0;
        r.show += (want - r.show) * Math.min(1, dt * 0.01);
        if (surf !== r.to) { r.from = r.y; r.to = surf; r.t = now; }
        const k = Math.min(1, (now - r.t) / 240), e = 1 - Math.pow(1 - k, 2);
        r.y = r.from + (r.to - r.from) * e;
        const hop = Math.sin(Math.PI * k) * cell * 1.6 * (k < 1 ? 1 : 0), S = cell * 1.75;
        const cy = axis + dir * (band + r.y + hop + S / 2 + 1), rot = (r.rot + (k < 1 ? k : 0)) * (Math.PI / 2) * dir;
        if (k >= 1 && r.t > 0) { r.rot = (r.rot + 1) % 4; r.t = -1e9; }
        if (r.show < 0.02) continue;
        for (const t of trail) { ctx.globalAlpha = t.a * 0.35 * r.show; ctx.fillStyle = pal.accent; const q = S * 0.5 * t.a; ctx.fillRect(t.x - q / 2, cy - q / 2, q, q); }
        if (r.show < 0.98) { // enters as loose pixels that come together
          for (let i = 0; i < 9; i++) {
            const ox = ((i % 3) - 1) * (S / 3), oy = (Math.floor(i / 3) - 1) * (S / 3), sp = (1 - r.show) * 34;
            ctx.globalAlpha = r.show; ctx.fillStyle = pal.accent;
            ctx.fillRect(px + ox + (rnd(i) - 0.5) * sp * 2 - S / 6, cy + oy + (rnd(i + 5) - 0.5) * sp * 2 - S / 6, S / 3 - 0.5, S / 3 - 0.5);
          }
        } else {
          ctx.globalAlpha = 1;
          ctx.save(); ctx.translate(px, cy); ctx.rotate(rot);
          ctx.fillStyle = pal.accent; ctx.fillRect(-S / 2, -S / 2, S, S);
          ctx.fillStyle = tone(0); ctx.fillRect(-S / 4, -S / 4, S / 2, S / 2);
          ctx.fillStyle = tone(1); ctx.fillRect(-S / 8, -S / 8, S / 4, S / 4);
          ctx.restore();
        }
      }
      for (const t of trail) t.a -= dt * 0.004;
      while (trail.length && trail[0].a <= 0) trail.shift();
      ctx.globalAlpha = 1;
      ctx.restore();
      raf = requestAnimationFrame(draw);
    };
    const kick = () => { if (!raf && visible) { last = 0; raf = requestAnimationFrame(draw); } };

    // Scroll drives the timeline: the block stays pinned (sticky) inside a tall track, and the page only
    // moves on once the cubes have reached "coming soon".
    const track = el.parentElement!;
    const END = 0.92; // the last stretch of the track holds the final picture
    const pinned = () => {
      const span = track.offsetHeight - el.offsetHeight;
      return span > 40 ? { span, stick: parseFloat(getComputedStyle(el).top) || 0, top: track.getBoundingClientRect().top } : null;
    };
    const onScroll = () => {
      const pin = pinned();
      if (!pin) return;
      auto = null; played = true;
      const p = Math.min(1, Math.max(0, (pin.stick - pin.top) / (pin.span * END)));
      target = startX() + (endX() - startX()) * p;
      kick();
    };
    const scrollToX = (x: number) => {
      const pin = pinned();
      if (!pin) return false;
      const p = (x - startX()) / (endX() - startX());
      window.scrollTo({ top: window.scrollY + pin.top - pin.stick + p * pin.span * END, behavior: "smooth" });
      return true;
    };
    const stops = () => [...new Set([startX(), ...blocks.map((b) => b.x0 + cell), endX()])].sort((x, y) => x - y);
    api.current.step = (d) => {
      auto = null;
      const s = stops();
      const nxt = d > 0 ? s.find((v) => v > Math.max(px, target) + 2) : [...s].reverse().find((v) => v < Math.min(px, target) - 2);
      if (nxt != null && !scrollToX(nxt)) target = nxt;
      kick();
      return nxt != null;
    };
    api.current.replay = () => { if (scrollToX(startX())) return; px = target = startX(); auto = performance.now(); kick(); };

    size();
    px = target = reduce ? endX() : startX();
    const io = new IntersectionObserver((es) => {
      visible = es.some((e) => e.isIntersecting);
      if (visible && !played && !reduce && !pinned()) { played = true; auto = performance.now() + 500; }
      if (visible) kick();
    }, { threshold: 0.35 });
    io.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const r = el.getBoundingClientRect();
      if (r.bottom < window.innerHeight * 0.3 || r.top > window.innerHeight * 0.7) return;
      const tag = (document.activeElement?.tagName ?? "").toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "button" || tag === "a") return;
      if (e.key === " " || e.key === "ArrowRight") { if (api.current.step(e.shiftKey ? -1 : 1)) e.preventDefault(); }
      else if (e.key === "ArrowLeft") { api.current.step(-1); e.preventDefault(); }
    };
    const point = (e: PointerEvent) => {
      if (pinned()) return; // the scroll is in charge
      if (e.pointerType !== "mouse" && e.type === "pointermove") return;
      const r = cv.getBoundingClientRect();
      auto = null;
      target = Math.max(startX(), Math.min(endX(), cam + e.clientX - r.left));
      kick();
    };
    window.addEventListener("keydown", onKey);
    cv.addEventListener("pointermove", point);
    cv.addEventListener("pointerdown", point);
    const ro = new ResizeObserver(() => { if (el.clientWidth !== W) { size(); kick(); } });
    ro.observe(el);
    const mut = new MutationObserver(() => { size(); kick(); });
    mut.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      visible = false; cancelAnimationFrame(raf);
      io.disconnect(); ro.disconnect(); mut.disconnect();
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
      cv.removeEventListener("pointermove", point);
      cv.removeEventListener("pointerdown", point);
    };
  }, [stages, labels.soon, labels.now, labels.origin]);

  const years = (s: Stage) => `${s.start.slice(0, 4)} — ${s.end ? s.end.slice(0, 4) : "…"}`;
  const slot = (lane: "acad" | "pro") => {
    const s = stages.find((x) => x.id === active[lane]);
    return (
      <div className={`game-slot ${s ? "" : "idle"}`}>
        <p className="label">[ {lane === "acad" ? labels.acad : labels.pro} ] <Scramble text={s ? years(s) : "—"} />{s?.wip && <span className="tag">{labels.wip}</span>}</p>
        <h3 className="game-title"><Scramble text={s ? s.title[locale] : labels.none} duration={420} /></h3>
        <p className="game-place label"><Scramble text={s ? s.place[locale] : " "} duration={420} delay={60} /></p>
        <p className="game-text">{s?.text[locale]}</p>
        {s?.slug && <Link className="label game-more" href={`/${locale}/experience/${s.slug}`}>{labels.more} →</Link>}
      </div>
    );
  };

  return (
    <div className="game-track">
    <div className="game" ref={wrap}>
      <div className="game-stage">
        <canvas ref={canvas} className="game-canvas" role="img" aria-label={stages.map((s) => `${years(s)} ${s.title[locale]}`).join(", ")} />
        <span className="label game-lane top">{labels.acad} ↑</span>
        <span className="label game-lane bottom">{labels.pro} ↓</span>
      </div>
      <div className="game-bar">
        <button className="arrow" onClick={() => api.current.step(-1)} aria-label={labels.prev}>←</button>
        <button className="arrow" onClick={() => api.current.step(1)} aria-label={labels.next}>→</button>
        <button className="arrow" onClick={() => api.current.replay()} aria-label={labels.replay}>↻</button>
        <span className="label game-hint"><span className="hint-key">{labels.hint}</span><span className="hint-touch">{labels.touch}</span></span>
      </div>
      <div className="game-card" aria-live="polite">
        {slot("acad")}
        {slot("pro")}
      </div>
    </div>
    </div>
  );
}
