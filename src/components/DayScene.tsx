"use client";

import { useEffect, useMemo, useRef } from "react";
import type { Day } from "@/lib/adventures";
import { EMOJI } from "@/lib/emoji";
import { fmtNum, type Dict, type Locale } from "@/lib/i18n";
import { cumulativeAscent, estimatePower, heat, weatherAt } from "@/lib/ride";
import { MiniMap, type MiniHandle } from "./MiniMap";
import { Terrain3D, type TerrainHandle } from "./Terrain3D";

// One stage, ridden by scrolling: the point moves along the route on the cube relief,
// towns appear as it reaches them, the wind and the rain of that moment show around the rider,
// and every gauge follows — white when the value is low, yellow then orange as it climbs.
// A minimap in the corner says where the stage sits in the whole trip. Nothing to click.

const localTime = (ts: number) => new Date((ts + 7200) * 1000).toISOString().slice(11, 16); // CEST all along the route
const near = (v: (number | null)[], i: number) => { for (let k = 0; k < 12; k++) { const a = v[i - k] ?? v[i + k]; if (a != null) return a; } return null; };

export function DayScene({ slug, day, dict, locale, index, mass }: { slug: string; day: Day; dict: Dict; locale: Locale; index: number; mass: number }) {
  const t = dict.adv;
  const P = day.profile, n = P.d.length;
  const section = useRef<HTMLElement>(null), stick = useRef<HTMLDivElement>(null);
  const handle = useRef<TerrainHandle | null>(null), mini = useRef<MiniHandle | null>(null);
  const els = useRef<Record<string, HTMLElement | null>>({});
  const shots = useRef<(HTMLElement | null)[]>([]);
  const media = day.media;
  const set = (k: string) => (el: HTMLElement | null) => { els.current[k] = el; };

  // start and finish are always named; the towns in between appear on the way
  const towns = useMemo(() => [
    ...(day.start.name ? [{ name: day.start.name, at: 0, always: true }] : []),
    ...day.towns.map((x) => ({ name: x.name, at: x.i / (n - 1) })),
    ...(day.end.name ? [{ name: day.end.name, at: 1, always: true }] : []),
  ], [day, n]);
  const marks = useMemo(() => day.passes.filter((p) => p.name).map((p) => Math.min(0.999, (p.km * 1000) / P.d[n - 1])), [day, P, n]);
  const watts = useMemo(() => estimatePower(P, day.weather, mass), [P, day, mass]);
  // where it rained that day: one cloud every few percent of the route, as long as the hourly rain is not nil
  const clouds = useMemo(() => {
    const out: { at: number; rain: number }[] = [], total = P.d[n - 1] / 1000;
    for (let at = 0.02; at < 1; at += 0.04) { const w = weatherAt(day.weather, at * total); if (w && w.precip > 0.05) out.push({ at, rain: w.precip }); }
    return out;
  }, [P, n, day]);
  const climbed = useMemo(() => cumulativeAscent(P.e, day.stats.ascent), [P, day]);
  const elePath = useMemo(() => {
    const lo = Math.min(...P.e), hi = Math.max(...P.e);
    let d = `M0 40`;
    for (let i = 0; i < n; i += 4) d += `L${((i / (n - 1)) * 480).toFixed(1)} ${(38 - ((P.e[i] - lo) / (hi - lo || 1)) * 34).toFixed(1)}`;
    return `${d}L480 40Z`;
  }, [P, n]);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const sec = section.current, st = stick.current;
      if (!sec || !st) return;
      const r = sec.getBoundingClientRect(), s = st.getBoundingClientRect();
      let p = Math.min(1, Math.max(0, (s.top - r.top) / Math.max(1, r.height - s.height))), active = -1;
      if (media.length) {
        // With photos, they set the pace: the rider is where a photo was taken when that photo crosses the reading line
        // (the middle of the map; under the map on a phone), and moves evenly along the route between two photos.
        const top = parseFloat(getComputedStyle(st).top) || 0, side = s.width < r.width - 40;
        const line = side ? top + s.height / 2 : (top + s.height + window.innerHeight) / 2;
        const pts: [number, number][] = [[line - top, 0]];
        shots.current.forEach((el, k) => {
          if (!el) return;
          const b = el.getBoundingClientRect(), y = b.top + b.height / 2 - r.top, on = Math.abs(b.top + b.height / 2 - line) < b.height / 2 + 24;
          if (on && active < 0) active = k;
          if (y > pts[pts.length - 1][0]) pts.push([y, media[k].at]);
        });
        const end = line - top - s.height + r.height;
        if (end > pts[pts.length - 1][0]) pts.push([end, 1]);
        const y = line - r.top;
        let k = 1;
        while (k < pts.length - 1 && pts[k][0] < y) k++;
        const [y0, a0] = pts[k - 1], [y1, a1] = pts[k];
        p = Math.min(1, Math.max(0, a0 + (a1 - a0) * Math.min(1, Math.max(0, (y - y0) / Math.max(1, y1 - y0)))));
        shots.current.forEach((el, j) => {
          if (!el || el.classList.contains("on") === (j === active)) return;
          el.classList.toggle("on", j === active);
          const v = el.querySelector("video");
          if (v) { if (j === active) v.play().catch(() => {}); else v.pause(); }
        });
      }
      const i = Math.round(p * (n - 1)), e = els.current;
      // text + colour: low is white, high goes yellow then orange
      const show = (k: string, v: string, level: number | null = null) => {
        const el = e[k];
        if (!el) return;
        if (el.textContent !== v) el.textContent = v;
        el.style.color = level == null ? "" : heat(level);
      };
      const a = Math.max(0, i - 3), b = Math.min(n - 1, i + 3), run = P.d[b] - P.d[a], grade = run > 0 ? ((P.e[b] - P.e[a]) / run) * 100 : 0;
      show("km", fmtNum(P.d[i] / 1000, locale, 1), P.d[i] / P.d[n - 1]);
      show("alt", fmtNum(P.e[i], locale), (P.e[i] - 400) / 2400);
      show("grade", `${grade > 0 ? "+" : ""}${fmtNum(grade, locale, 1)}`, grade / 11);
      show("up", fmtNum(climbed[i], locale), climbed[i] / 3000);
      show("time", localTime(P.ts[i]));
      const w = weatherAt(day.weather, P.d[i] / 1000);
      const hr = near(P.hr, i), sp = near(P.sp, i), temp = near(P.t, i) ?? w?.temp ?? null, pw = watts[i];
      show("hr", hr != null ? String(Math.round(hr)) : "—", hr != null ? (hr - 95) / 75 : null);
      show("pw", String(Math.round(pw / 5) * 5), pw / 340);
      show("sp", sp != null ? fmtNum(sp, locale, 0) : "—", (sp ?? 0) / 62);
      show("temp", temp != null ? fmtNum(temp, locale, 0) : "—", temp != null ? (temp - 6) / 28 : null);
      show("wind", w ? String(Math.round(w.wind)) : "—", w ? w.wind / 22 : null);
      show("windWay", w ? (Math.abs(w.headwind) < 2 ? t.cross : w.headwind > 0 ? t.head : t.tail) : "");
      const bar = (k: string, v: number) => { const el = e[k]; if (el) { el.style.setProperty("--v", String(Math.min(1, Math.max(0, v)))); el.style.setProperty("--c", heat(v)); } };
      bar("hrBar", hr != null ? (hr - 95) / 75 : 0);
      bar("pwBar", pw / 340);
      bar("spBar", (sp ?? 0) / 62);
      bar("tBar", temp != null ? (temp - 6) / 28 : 0);
      if (e.windBar) { // zero (or a pure crosswind) in the middle; left = against us, right = with us
        const v = w ? Math.max(-1, Math.min(1, -w.headwind / 18)) : 0;
        e.windBar.style.setProperty("--l", `${v < 0 ? 50 + v * 50 : 50}%`);
        e.windBar.style.setProperty("--w", `${Math.abs(v) * 50}%`);
        e.windBar.style.setProperty("--c", heat(w ? w.wind / 22 : 0));
      }
      if (e.cursor) e.cursor.style.left = `${p * 100}%`;
      handle.current?.set(p, w ? { dir: w.windDir, speed: w.wind, rain: w.precip } : null, active);
      mini.current?.set(p);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(update); };
    kick();
    const boot = setTimeout(kick, 400); // once the relief has loaded
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    return () => { cancelAnimationFrame(raf); clearTimeout(boot); window.removeEventListener("scroll", kick); window.removeEventListener("resize", kick); };
  }, [day, media, P, n, watts, climbed, locale, t]);

  return (
    <section className={`scene ${media.length ? "duo" : ""}`} ref={section} aria-label={t.terrain}>
      <div className="scene-stick" ref={stick}>
        <div className="scene-map">
          <Terrain3D key={day.slug} fill handle={handle} towns={towns} marks={marks} media={day.media} mediaLabel={t.media} clouds={clouds} src={`/adventures/${slug}/terrain/${day.slug}.json`} label={`${day.start.name ?? ""} → ${day.end.name ?? ""}`} />
        </div>
        <dl className="scene-hud left">
          <div><dt className="label">{t.distance}</dt><dd><b className="num" ref={set("km")}>0</b><span className="unit">km</span></dd></div>
          <div><dt className="label">{t.alt}</dt><dd><b className="num" ref={set("alt")}>0</b><span className="unit">m</span></dd></div>
          <div><dt className="label">{t.cumAscent}</dt><dd><b className="num" ref={set("up")}>0</b><span className="unit">m ↑</span></dd></div>
          <div><dt className="label">{t.grade}</dt><dd><b className="num" ref={set("grade")}>0</b><span className="unit">%</span></dd></div>
          <div><dt className="label">{t.time}</dt><dd><b className="num" ref={set("time")}>--:--</b></dd></div>
        </dl>
        <dl className="scene-hud right">
          <div><dt className="label">{t.metrics.hr}</dt><dd><i className="meter" ref={set("hrBar")} aria-hidden /><b className="num" ref={set("hr")}>—</b><span className="unit">bpm</span></dd></div>
          <div><dt className="label">{t.power} <span className="dim">{t.est}</span></dt><dd><i className="meter" ref={set("pwBar")} aria-hidden /><b className="num" ref={set("pw")}>—</b><span className="unit">W</span></dd></div>
          <div><dt className="label">{t.metrics.sp}</dt><dd><i className="meter" ref={set("spBar")} aria-hidden /><b className="num" ref={set("sp")}>—</b><span className="unit">km/h</span></dd></div>
          <div><dt className="label">{t.metrics.t}</dt><dd><i className="meter" ref={set("tBar")} aria-hidden /><b className="num" ref={set("temp")}>—</b><span className="unit">°C</span></dd></div>
          <div>
            <dt className="label">{t.wind} · <span ref={set("windWay")} /></dt>
            <dd><i className="wind-gauge" ref={set("windBar")} aria-hidden /><b className="num" ref={set("wind")}>—</b><span className="unit">km/h</span></dd>
            <p className="wind-ends label" aria-hidden><span>← {t.head}</span><span>{t.tail} →</span></p>
          </div>
        </dl>
        <MiniMap src={`/adventures/${slug}/terrain/minimap.json`} day={index} handle={mini} label={t.minimap} />
        <div className="scene-foot">
          <div className="scene-ele" aria-hidden>
            <svg viewBox="0 0 480 40" preserveAspectRatio="none"><path d={elePath} /></svg>
            <i ref={set("cursor")} />
          </div>
          <span className="label dim scene-hint">↕ {t.terrainHint}</span>
        </div>
      </div>
      {media.length > 0 && (
        <div className="scene-photos">
          {media.map((m, k) => (
            <figure key={m.src} className="shot" ref={(el) => { shots.current[k] = el; }}>
              {m.video
                ? <video src={m.src} muted loop playsInline preload="metadata" width={m.w} height={m.h} />
                // eslint-disable-next-line @next/next/no-img-element
                : <img src={m.src} alt={m.title} loading="lazy" width={m.w} height={m.h} />}
              <figcaption>
                {m.title && <span className="shot-title">{m.title.split(EMOJI).map((part, j) => (j % 2 ? <span key={j} className="emo">{part}</span> : part))}</span>}
                <span className="label dim">km {fmtNum(m.km, locale, 0)}{m.time && ` · ${m.time}`}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}
