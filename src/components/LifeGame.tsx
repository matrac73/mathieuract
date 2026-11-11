"use client";

import { useEffect, useRef, useState } from "react";
import type { Stage } from "@/content/site";
import type { Locale } from "@/lib/i18n";
import { Scramble } from "./Scramble";

// The path as a sober little platformer: a pixel character walks the timeline,
// changes outfit at every stage and hops over the opponent of the era.
// Space / → = next stage, ← = previous, or just lead him with the mouse.

type Labels = { hint: string; touch: string; foe: string; wip: string; next: string; prev: string; end: string };

// ---- hero: 12 × 16 pixels (+2 rows of headroom for hats) ----
const HEAD = ["....hhhh....", "...hhhhhh...", "...hsssss...", "...sssese...", "...ssssss...", "....ssss....", "...tttttt...", "..tttttttt..", "..tttttttt..", "..tttttttt..", "..stttttts.."];
const LEGS = [
  ["...llllll...", "...ll..ll...", "...ll..ll...", "...ll..ll...", "...bb..bbb.."],
  ["...llllll...", "...lll.ll...", "..ll....ll..", ".ll.....ll..", ".bb.....bbb."],
  ["...llllll...", "....llll....", "....llll....", "....lll.....", "....bbbb...."],
];
type Outfit = { t: number; l: number; c?: number; k?: number; g?: number; shorts?: boolean; put: [number, number, string][] };
const OUTFITS: Record<string, Outfit> = {
  ugine: { t: 0.92, l: 0.45, c: 0.7, put: [[-1, 5, "xx"], [0, 4, "cccc"], [1, 3, "cccccc"], [5, 4, "xxxx"]] }, // beanie, scarf
  usa: { t: 0.55, l: 0.4, c: 0.95, put: [[0, 4, "cccc"], [1, 3, "cccccc"], [1, 9, "xx"], [8, 2, "wwwwwwww"]] }, // cap, varsity stripe
  lyon: { t: 0.75, l: 0.4, k: 0.45, put: [[6, 1, "kk"], [7, 0, "kk"], [8, 0, "kk"], [9, 0, "kk"], [10, 1, "k"]] }, // school bag
  prepa: { t: 0.3, l: 0.25, g: 0.3, put: [[3, 5, "gggg"], [2, 2, "t"], [3, 2, "t"], [4, 2, "t"]] }, // glasses, hoodie
  cs: { t: 0.85, l: 0.45, put: [[7, 5, "xx"]] }, // school sweatshirt
  safran: { t: 0.55, l: 0.35, c: 1, put: [[-1, 4, "cccc"], [0, 3, "cccccc"], [1, 2, "ccccccccc"], [6, 4, "x"], [7, 4, "x"], [8, 4, "x"], [9, 4, "x"], [6, 7, "x"], [7, 7, "x"], [8, 7, "x"], [9, 7, "x"]] }, // hard hat, hi-vis
  bcg: { t: 0.28, l: 0.28, put: [[6, 5, "wxw"], [7, 5, "wxw"], [8, 6, "x"], [9, 6, "x"]] }, // suit and tie
  essec: { t: 1, l: 0.6, g: 0, shorts: true, put: [[3, 5, "gggg"]] }, // sunglasses, shorts
  onepoint: { t: 0.42, l: 0.32, c: 0.8, put: [[-1, 4, "cccc"], [0, 3, "c"], [1, 2, "c"], [2, 2, "c"], [3, 2, "c"], [4, 8, "x"]] }, // headset
  adagia: { t: 0.3, l: 0.3, put: [[6, 5, "ww"], [7, 5, "ww"], [8, 5, "ww"], [7, 8, "x"]] }, // blazer, open collar
};
// ---- opponents ----
const FOES: Record<string, string[]> = {
  ugine: ["..x.....", "..xxxx..", "..xxxxx.", "..xxxx..", "..#.....", "..#.....", "..#.....", "..#.....", "..#.....", ".###...."],
  usa: ["..######..", ".########.", "##o####o##", "xxxxxxxxxx", "++++++++++", "##########", ".########."],
  lyon: ["########.", "#......##", "#.++++..#", "#.......#", "#.o...o.#", "#.......#", "#.xxxxx.#", "#.......#", "#.++++..#", "#########"],
  prepa: ["....##.", "...#..#", "...#...", "...#...", "..x#x..", "...#...", "...#...", "...#...", "#..#...", ".##...."],
  cs: ["#......#", ".#.##.#.", "..####..", "#x####x#", ".######.", "#.####.#", "..#..#..", ".#....#."],
  safran: [".........#....", "........##....", "#......###....", "##############", ".####x########", "...###........", "....##...o.o.."],
  bcg: ["##########", "#........#", "#......x.#", "#....+.x.#", "#..+.+.x.#", "#..+.+.x.#", "##########", "....##....", "...####..."],
  essec: ["#...#...#", ".#.....#.", "...###...", "..#####..", "#.#o#o#.#", "..#####..", "...###...", ".#.....#.", "#...#...#"],
  onepoint: ["....x....", "....#....", ".#######.", ".#o###o#.", ".#######.", ".#.+++.#.", ".#######.", "..#...#.."],
  adagia: ["###########", "#x#x#x#x#x#", "###########", "#.#.#.#.#.#", "###########", "#.#o#.#o#.#", "###########", "#.#.#.#.#.#", "###########"],
};
const hex = (c: string) => {
  const m = c.trim().replace("#", "");
  const f = m.length === 3 ? m.split("").map((x) => x + x).join("") : m.padEnd(6, "0");
  return [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16));
};
const noise = (n: number) => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };

export function LifeGame({ stages, locale, labels }: { stages: Stage[]; locale: Locale; labels: Labels }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const api = useRef<{ goTo: (i: number) => void; step: (d: number) => boolean }>({ goTo: () => {}, step: () => false });
  const [era, setEra] = useState(0);
  const st = stages[era];

  useEffect(() => {
    const el = wrap.current!, cv = canvas.current!, ctx = cv.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const N = stages.length;
    let W = 0, H = 0, ps = 4, gap = 360, gy = 0, dpr = 1;
    let x = 0, target = 0, facing = 1, cam = 0, phase = 0, eraNow = -1, flash = 0, raf = 0, visible = false, last = 0;
    const dead: number[] = stages.map(() => 0); // time of defeat
    let pal = { bg: [0, 0, 0], fg: [255, 255, 255], accent: "#ff5a1f", dot: "monospace", mono: "monospace" };
    const tone = (t: number) => `rgb(${pal.bg.map((v, i) => Math.round(v + (pal.fg[i] - v) * t)).join(",")})`;
    const flagX = (i: number) => 150 + i * gap;
    const foeX = (i: number) => flagX(i) + gap * 0.56;
    const endX = () => flagX(N - 1) + gap * 0.86;

    const size = () => {
      const keep = gap ? (x - 150) / gap : 0;
      W = el.clientWidth; H = W < 620 ? 230 : 290;
      ps = W < 620 ? 3 : 4;
      gap = Math.max(250, Math.min(430, W * 0.44));
      gy = H - 54;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = W * dpr; cv.height = H * dpr; cv.style.height = `${H}px`;
      const cs = getComputedStyle(document.documentElement), body = getComputedStyle(document.body);
      pal = { bg: hex(cs.getPropertyValue("--bg")), fg: hex(cs.getPropertyValue("--fg")), accent: cs.getPropertyValue("--accent").trim(), dot: body.getPropertyValue("--font-dot") || "monospace", mono: body.getPropertyValue("--font-mono") || "monospace" };
      x = 150 + keep * gap; target = Math.min(target, endX());
    };

    const sprite = (rows: string[], px: number, py: number, s: number, flip: boolean, tones: Record<string, number | undefined>, solid?: string) => {
      const w = rows[0].length;
      for (let r = 0; r < rows.length; r++) for (let c = 0; c < w; c++) {
        const ch = rows[r][c];
        if (!ch || ch === ".") continue;
        ctx.fillStyle = solid ?? (ch === "x" ? pal.accent : tone(tones[ch] ?? 1));
        ctx.fillRect(Math.round(px + (flip ? w - 1 - c : c) * s), Math.round(py + r * s), s, s);
      }
    };
    const hero = (id: string, frame: number) => {
      const o = OUTFITS[id] ?? OUTFITS.cs;
      const rows = ["............", "............", ...HEAD, ...LEGS[frame]].map((r) => r.split(""));
      if (o.shorts) for (const r of [15, 16]) rows[r] = rows[r].map((c) => (c === "l" ? "s" : c));
      for (const [r, c, str] of o.put) for (let k = 0; k < str.length; k++) if (c + k < 12) rows[r + 2][c + k] = str[k];
      return { rows: rows.map((r) => r.join("")), tones: { s: 1, h: 0.5, e: 0, b: 0.75, w: 1, t: o.t, l: o.l, c: o.c, k: o.k, g: o.g } };
    };

    const draw = (now: number) => {
      raf = 0;
      if (!visible) return;
      const dt = Math.min(50, now - (last || now)); last = now;
      // --- move ---
      const dx = target - x, speed = 0.3 * (gap / 360) * dt;
      const moving = Math.abs(dx) > 1;
      if (moving) { facing = dx > 0 ? 1 : -1; x += Math.sign(dx) * Math.min(Math.abs(dx), speed * (Math.abs(dx) > gap * 1.2 ? 2.2 : 1)); phase += dt; }
      let hop = 0;
      for (let i = 0; i < N; i++) {
        const fx = foeX(i), d = x - fx, R = 15 * ps;
        if (Math.abs(d) < R && (!dead[i] || now - dead[i] < 400)) hop = Math.max(hop, (FOES[stages[i].id].length * ps + 14) * (1 - (d / R) ** 2));
        if (!dead[i] && d > -ps * 2) dead[i] = now; // stomped on the way
      }
      let e = 0;
      for (let i = 0; i < N; i++) if (x >= flagX(i) - 8) e = i;
      if (e !== eraNow) { if (eraNow >= 0) flash = now; eraNow = e; setEra(e); }
      cam += (Math.max(0, Math.min(endX() + 90 - W, x - W * 0.36)) - cam) * (reduce ? 1 : 0.12);

      // --- paint ---
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      // far ridge, blocky; taller in the mountain years
      for (let sx = 0; sx < W; sx += 8) {
        const wx = sx + cam * 0.35, c = Math.floor(wx / 8), k = c / 5, a = noise(Math.floor(k)), b = noise(Math.floor(k) + 1), f = k - Math.floor(k);
        const i = Math.max(0, Math.min(N - 1, Math.round((sx + cam - 150) / gap)));
        const amp = [1, 0.35, 0.45, 0.45, 0.3, 0.3, 0.25, 0.3, 0.25, 0.4][i] ?? 0.3;
        const h = Math.round((14 + 62 * (a + (b - a) * f)) * amp / 4) * 4;
        ctx.fillStyle = tone(0.09); ctx.fillRect(sx, gy - h, 8, h);
      }
      ctx.save();
      ctx.translate(-Math.round(cam), 0);
      // ground
      ctx.fillStyle = tone(0.4);
      for (let gx = Math.floor(cam / 12) * 12; gx < cam + W; gx += 12) ctx.fillRect(gx, gy, 8, 2);
      ctx.textAlign = "center";
      for (let i = 0; i < N; i++) {
        const fx = flagX(i), on = i <= eraNow;
        ctx.font = `900 ${W < 620 ? 44 : 72}px ${pal.dot}`; ctx.fillStyle = tone(i === eraNow ? 0.16 : 0.08); ctx.textBaseline = "alphabetic";
        ctx.fillText(stages[i].short.slice(0, 9), fx + gap * 0.5, gy - (W < 620 ? 86 : 120));
        ctx.fillStyle = tone(on ? 1 : 0.4); ctx.fillRect(fx - 1, gy - 58, 2, 58);
        ctx.fillStyle = on ? pal.accent : tone(0.4); ctx.fillRect(fx + 1, gy - 58, 16, 10);
        ctx.font = `500 10px ${pal.mono}`; ctx.fillStyle = tone(on ? 1 : 0.5); ctx.textBaseline = "top";
        ctx.fillText(stages[i].years.replace(/\s/g, ""), fx, gy + 10);
        ctx.fillStyle = tone(0.5); ctx.fillText(stages[i].short, fx, gy + 26);
        // opponent
        const rows = FOES[stages[i].id], fw = rows[0].length * ps, fh = rows.length * ps, ax = foeX(i) - fw / 2;
        if (!dead[i]) sprite(rows, ax, gy - fh - (Math.floor(now / 380 + i) % 2) * ps, ps, false, { "#": 1, "+": 0.5, o: 0 });
        else if (now - dead[i] < 520) { // bursts into pixels
          const q = (now - dead[i]) / 520;
          for (let r = 0; r < rows.length; r++) for (let c = 0; c < rows[0].length; c++) {
            const ch = rows[r][c]; if (ch === "." || ch === "o") continue;
            const n1 = noise(r * 31 + c * 7 + i), n2 = noise(r * 13 + c * 17 + i);
            ctx.globalAlpha = 1 - q; ctx.fillStyle = ch === "x" ? pal.accent : tone(1);
            ctx.fillRect(ax + c * ps + (n1 - 0.5) * 120 * q, gy - fh + r * ps - (n2 * 90 * q - 110 * q * q), ps, ps);
          }
          ctx.globalAlpha = 1;
        }
      }
      ctx.font = `500 10px ${pal.mono}`; ctx.fillStyle = tone(0.5); ctx.textBaseline = "top";
      ctx.fillText(labels.end, endX(), gy + 10);
      ctx.fillStyle = tone(0.5); for (let k = 0; k < 3; k++) ctx.fillRect(endX() - 14 + k * 12, gy - 20, 6, 6);
      // hero
      const frame = moving && !hop ? 1 + (Math.floor(phase / 110) % 2) : hop ? 1 : 0;
      const h = hero(stages[Math.max(0, eraNow)].id, frame);
      const blink = now - flash < 300 && Math.floor((now - flash) / 60) % 2 === 0;
      sprite(h.rows, x - 6 * ps, gy - 18 * ps - hop, ps, facing < 0, h.tones, blink ? pal.accent : undefined);
      ctx.restore();
      raf = requestAnimationFrame(draw);
    };
    const kick = () => { if (!raf && visible) { last = 0; raf = requestAnimationFrame(draw); } };

    const stops = () => [...stages.map((_, i) => flagX(i)), endX()];
    api.current.goTo = (i) => { target = flagX(i); kick(); };
    api.current.step = (d) => {
      const s = stops();
      const nxt = d > 0 ? s.find((v) => v > Math.max(x, target) + 2) : [...s].reverse().find((v) => v < Math.min(x, target) - 2);
      if (nxt != null) target = nxt;
      kick();
      return nxt != null;
    };

    size();
    x = flagX(0) - 96; target = flagX(0);
    const io = new IntersectionObserver((es) => { visible = es.some((e) => e.isIntersecting); if (visible) kick(); }, { threshold: 0.15 });
    io.observe(el);
    const key = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const r = el.getBoundingClientRect();
      if (r.bottom < window.innerHeight * 0.3 || r.top > window.innerHeight * 0.7) return;
      const tag = (document.activeElement?.tagName ?? "").toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "button" || tag === "a") return;
      if (e.key === " " || e.key === "ArrowRight") { if (api.current.step(e.shiftKey ? -1 : 1)) e.preventDefault(); }
      else if (e.key === "ArrowLeft") { api.current.step(-1); e.preventDefault(); }
    };
    const point = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.type === "pointermove") return;
      const r = cv.getBoundingClientRect();
      target = Math.max(60, Math.min(endX(), cam + e.clientX - r.left));
      kick();
    };
    window.addEventListener("keydown", key);
    cv.addEventListener("pointermove", point);
    cv.addEventListener("pointerdown", point);
    const ro = new ResizeObserver(() => { if (el.clientWidth !== W) { size(); kick(); } });
    ro.observe(el);
    const mo = new MutationObserver(() => { size(); kick(); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      visible = false; cancelAnimationFrame(raf);
      io.disconnect(); ro.disconnect(); mo.disconnect();
      window.removeEventListener("keydown", key);
      cv.removeEventListener("pointermove", point);
      cv.removeEventListener("pointerdown", point);
    };
  }, [stages, labels.end]);

  return (
    <div className="game" ref={wrap}>
      <canvas ref={canvas} className="game-canvas" role="img" aria-label={stages.map((s) => `${s.years} ${s.title[locale]}`).join(", ")} />
      <div className="game-bar">
        <button className="arrow" onClick={() => api.current.step(-1)} aria-label={labels.prev}>←</button>
        <ol className="game-dots">
          {stages.map((s, i) => (
            <li key={s.id}><button className={i === era ? "on" : i < era ? "done" : ""} onClick={() => api.current.goTo(i)} aria-label={`${s.years} — ${s.title[locale]}`} aria-current={i === era} /></li>
          ))}
        </ol>
        <button className="arrow" onClick={() => api.current.step(1)} aria-label={labels.next}>→</button>
        <span className="label game-hint"><span className="hint-key">{labels.hint}</span><span className="hint-touch">{labels.touch}</span></span>
      </div>
      <div className="game-card" aria-live="polite">
        <p className="label">[ {String(era + 1).padStart(2, "0")} / {String(stages.length).padStart(2, "0")} ] <Scramble text={st.years} />{st.wip && <span className="tag">{labels.wip}</span>}</p>
        <h3 className="game-title"><Scramble text={st.title[locale]} duration={450} /></h3>
        <p className="game-place label"><Scramble text={st.place[locale]} duration={450} delay={60} /></p>
        <p className="game-text">{st.text[locale]}</p>
        <p className="game-foe label">{labels.foe} — <b><Scramble text={st.foe[locale]} duration={450} delay={120} /></b></p>
      </div>
    </div>
  );
}
