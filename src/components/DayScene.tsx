"use client";

import { useEffect, useMemo, useRef } from "react";
import type { Day } from "@/lib/adventures";
import { fmtNum, type Dict, type Locale } from "@/lib/i18n";
import { Terrain3D, type TerrainHandle } from "./Terrain3D";

// One stage, ridden by scrolling: the point moves along the route on the cube relief,
// towns appear as it reaches them, grey streams show the wind of that moment,
// and the gauges live with it — a heart that grows and beats at the recorded rate,
// a speed bar, a thermometer. Nothing to click.

const HEART = [".##.##.", "#######", "#######", ".#####.", "..###..", "...#..."];
const localTime = (ts: number) => new Date((ts + 7200) * 1000).toISOString().slice(11, 16); // CEST all along the route
const near = (v: (number | null)[], i: number) => { for (let k = 0; k < 12; k++) { const a = v[i - k] ?? v[i + k]; if (a != null) return a; } return null; };

export function DayScene({ slug, day, dict, locale }: { slug: string; day: Day; dict: Dict; locale: Locale }) {
  const t = dict.adv;
  const P = day.profile, n = P.d.length;
  const section = useRef<HTMLElement>(null), stick = useRef<HTMLDivElement>(null);
  const handle = useRef<TerrainHandle | null>(null);
  const els = useRef<Record<string, HTMLElement | null>>({});
  const set = (k: string) => (el: HTMLElement | null) => { els.current[k] = el; };

  const towns = useMemo(() => day.towns.map((x) => ({ name: x.name, at: x.i / (n - 1) })), [day, n]);
  const marks = useMemo(() => day.passes.filter((p) => p.name).map((p) => Math.min(0.999, (p.km * 1000) / P.d[n - 1])), [day, P, n]);
  const hrs = useMemo(() => P.hr.filter((x): x is number => x != null), [P]);
  const elePath = useMemo(() => {
    const lo = Math.min(...P.e), hi = Math.max(...P.e);
    let d = `M0 40`;
    for (let i = 0; i < n; i += 4) d += `L${((i / (n - 1)) * 480).toFixed(1)} ${(38 - ((P.e[i] - lo) / (hi - lo || 1)) * 34).toFixed(1)}`;
    return `${d}L480 40Z`;
  }, [P, n]);

  useEffect(() => {
    let raf = 0, beat = 0;
    const hrLo = hrs.length ? Math.min(...hrs) : 0, hrHi = hrs.length ? Math.max(...hrs) : 1;
    const update = () => {
      raf = 0;
      const sec = section.current, st = stick.current;
      if (!sec || !st) return;
      const r = sec.getBoundingClientRect(), s = st.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (s.top - r.top) / Math.max(1, r.height - s.height)));
      const i = Math.round(p * (n - 1)), e = els.current;
      const txt = (k: string, v: string) => { const el = e[k]; if (el && el.textContent !== v) el.textContent = v; };
      const a = Math.max(0, i - 3), b = Math.min(n - 1, i + 3), run = P.d[b] - P.d[a], grade = run > 0 ? ((P.e[b] - P.e[a]) / run) * 100 : 0;
      txt("km", fmtNum(P.d[i] / 1000, locale, 1));
      txt("alt", fmtNum(P.e[i], locale));
      txt("grade", `${grade > 0 ? "+" : ""}${fmtNum(grade, locale, 1)}`);
      txt("time", localTime(P.ts[i]));
      // nearest weather sample: wind for the streams, temperature when the bike computer has none
      const km = P.d[i] / 1000, w = day.weather.length ? day.weather.reduce((x, y) => (Math.abs(y.km - km) < Math.abs(x.km - km) ? y : x)) : null;
      const hr = near(P.hr, i), sp = near(P.sp, i), temp = near(P.t, i) ?? w?.temp ?? null;
      txt("hr", hr != null ? String(Math.round(hr)) : "—");
      if (e.heart && hr != null) {
        e.heart.style.setProperty("--s", (0.62 + 0.75 * ((hr - hrLo) / (hrHi - hrLo || 1))).toFixed(3));
        if (Math.abs(hr - beat) >= 4) { beat = hr; e.heart.style.setProperty("--beat", `${(60 / hr).toFixed(2)}s`); }
      }
      txt("sp", sp != null ? fmtNum(sp, locale, 0) : "—");
      e.spBar?.style.setProperty("--v", String(Math.min(1, (sp ?? 0) / 70)));
      txt("temp", temp != null ? fmtNum(temp, locale, 0) : "—");
      e.tBar?.style.setProperty("--v", String(Math.min(1, Math.max(0, (temp ?? 0) / 40))));
      txt("wind", w ? String(w.wind) : "—");
      txt("windWay", w ? (Math.abs(w.headwind) < 3 ? t.cross : w.headwind > 0 ? t.head : t.tail) : "");
      if (e.cursor) e.cursor.style.left = `${p * 100}%`;
      handle.current?.set(p, w ? { dir: w.windDir, speed: w.wind } : null);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(update); };
    kick();
    const boot = setTimeout(kick, 400); // once the relief has loaded
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    return () => { cancelAnimationFrame(raf); clearTimeout(boot); window.removeEventListener("scroll", kick); window.removeEventListener("resize", kick); };
  }, [day, P, n, hrs, locale, t]);

  return (
    <section className="scene" ref={section} aria-label={t.terrain}>
      <div className="scene-stick" ref={stick}>
        <div className="scene-map">
          <Terrain3D key={day.slug} fill handle={handle} towns={towns} marks={marks} src={`/adventures/${slug}/terrain/${day.slug}.json`} label={`${day.start.name ?? ""} → ${day.end.name ?? ""}`} />
        </div>
        <dl className="scene-hud left">
          <div><dt className="label">{t.distance}</dt><dd><b className="num" ref={set("km")}>0</b><span className="unit">km</span></dd></div>
          <div><dt className="label">{t.alt}</dt><dd><b className="num" ref={set("alt")}>0</b><span className="unit">m</span></dd></div>
          <div><dt className="label">{t.grade}</dt><dd><b className="num" ref={set("grade")}>0</b><span className="unit">%</span></dd></div>
          <div><dt className="label">{t.time}</dt><dd><b className="num" ref={set("time")}>--:--</b></dd></div>
        </dl>
        <dl className="scene-hud right">
          <div className="g-heart">
            <dt className="label">{t.metrics.hr}</dt>
            <dd>
              <span className="heart" ref={set("heart")} aria-hidden>
                <svg viewBox="0 0 7 6" shapeRendering="crispEdges">{HEART.flatMap((row, y) => [...row].map((c, x) => (c === "#" ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" /> : null)))}</svg>
              </span>
              <b className="num" ref={set("hr")}>—</b><span className="unit">bpm</span>
            </dd>
          </div>
          <div><dt className="label">{t.metrics.sp}</dt><dd><i className="meter" ref={set("spBar")} aria-hidden /><b className="num" ref={set("sp")}>—</b><span className="unit">km/h</span></dd></div>
          <div><dt className="label">{t.metrics.t}</dt><dd><i className="meter" ref={set("tBar")} aria-hidden /><b className="num" ref={set("temp")}>—</b><span className="unit">°C</span></dd></div>
          <div><dt className="label">{t.wind}</dt><dd><i className="streams" aria-hidden /><b className="num" ref={set("wind")}>—</b><span className="unit">km/h <span ref={set("windWay")} /></span></dd></div>
        </dl>
        <div className="scene-foot">
          <div className="scene-ele" aria-hidden>
            <svg viewBox="0 0 480 40" preserveAspectRatio="none"><path d={elePath} /></svg>
            <i ref={set("cursor")} />
          </div>
          <span className="label dim scene-hint">↕ {t.terrainHint}</span>
        </div>
      </div>
    </section>
  );
}
