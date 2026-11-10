"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Adventure, Day } from "@/lib/adventures";
import { fmtDate, fmtDuration, fmtNum, type Dict, type Locale } from "@/lib/i18n";
import { CubeProfile, type Mark } from "./CubeProfile";
import { RouteMap } from "./RouteMap";
import { Scramble } from "./Scramble";

type Metric = "grade" | "hr" | "sp" | "t";
const pad = (n: number) => String(n).padStart(2, "0");
const localTime = (ts: number) => new Date((ts + 7200) * 1000).toISOString().slice(11, 16); // CEST all along the route
const place = (p: { name: string | null }) => p.name ?? "—";

function grades(d: number[], e: number[]) {
  return e.map((_, i) => {
    const a = Math.max(0, i - 3), b = Math.min(e.length - 1, i + 3);
    const run = d[b] - d[a];
    return run > 0 ? ((e[b] - e[a]) / run) * 100 : 0;
  });
}
function norm(v: (number | null)[], lo?: number, hi?: number) {
  const xs = v.filter((x): x is number => x != null);
  const a = lo ?? Math.min(...xs), b = hi ?? Math.max(...xs);
  return v.map((x) => (x == null ? null : Math.min(1, Math.max(0, (x - a) / (b - a || 1)))));
}

function Spark({ values, cursor, unit, label }: { values: (number | null)[]; cursor: number | null; unit: string; label: string }) {
  const xs = values.filter((x): x is number => x != null);
  if (xs.length < 2) return null;
  const lo = Math.min(...xs), hi = Math.max(...xs), W = 480, H = 56;
  let dPath = "", pen = false;
  const step = 4; // pixel-ish steps
  for (let i = 0; i < values.length; i += step) {
    const seg = values.slice(i, i + step).filter((x): x is number => x != null);
    if (!seg.length) { pen = false; continue; }
    const v = seg.reduce((a, b) => a + b, 0) / seg.length;
    const x0 = (i / values.length) * W, x1 = (Math.min(values.length, i + step) / values.length) * W;
    const y = H - 3 - ((v - lo) / (hi - lo || 1)) * (H - 6);
    dPath += `${pen ? "L" : "M"}${x0.toFixed(1)} ${y.toFixed(1)}L${x1.toFixed(1)} ${y.toFixed(1)}`;
    pen = true;
  }
  const at = cursor != null ? values[Math.round(cursor * (values.length - 1))] : null;
  return (
    <div className="spark">
      <div className="spark-head">
        <span className="label">{label}</span>
        <span className="spark-val">{at != null ? `${Math.round(at)} ${unit}` : `${Math.round(lo)}–${Math.round(hi)} ${unit}`}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden>
        <path d={dPath} fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        {cursor != null && <line x1={cursor * W} x2={cursor * W} y1="0" y2={H} className="spark-cursor" vectorEffect="non-scaling-stroke" />}
      </svg>
    </div>
  );
}

export function AdventureExplorer({ adv, days, dict, locale, index }: { adv: Adventure; days: Day[]; dict: Dict; locale: Locale; index: number }) {
  const t = dict.adv;
  const { summary, meta } = adv;
  const [idx, setIdx] = useState(0);
  const [metric, setMetric] = useState<Metric>("grade");
  const [cur, setCur] = useState<number | null>(null);
  const explorer = useRef<HTMLElement>(null);
  const day = days[idx];
  const P = day.profile;

  const go = useCallback(
    (i: number, scroll = false) => {
      const n = Math.min(days.length - 1, Math.max(0, i));
      setIdx(n);
      setCur(null);
      history.replaceState(null, "", `#${days[n].slug}`);
      if (scroll) explorer.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [days],
  );

  useEffect(() => {
    const i = days.findIndex((d) => `#${d.slug}` === location.hash);
    if (i >= 0) { setIdx(i); requestAnimationFrame(() => explorer.current?.scrollIntoView({ block: "start" })); }
  }, [days]);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const r = explorer.current?.getBoundingClientRect();
      if (!r || r.bottom < 80 || r.top > window.innerHeight - 80) return;
      if (e.key === "ArrowRight") go(idx + 1);
      if (e.key === "ArrowLeft") go(idx - 1);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [go, idx]);

  // whole-trip strip: each day gets a width proportional to its distance
  const trip = useMemo(() => {
    const ele: number[] = [], shade: number[] = [], bounds: number[] = [];
    const maxKm = Math.max(...summary.days.map((d) => d.stats.distanceKm));
    summary.days.forEach((d, di) => {
      const n = Math.max(6, Math.round((d.ele.length * d.stats.distanceKm) / maxKm));
      for (let i = 0; i < n; i++) { ele.push(d.ele[Math.min(d.ele.length - 1, Math.floor((i * d.ele.length) / n))]); shade.push(di % 2 ? 0.5 : 0.08); }
      bounds.push(ele.length);
    });
    return { ele, shade, bounds, frac: bounds.map((b) => b / ele.length) };
  }, [summary]);
  const pickTrip = (f: number) => go(Math.max(0, trip.frac.findIndex((b) => f <= b)), true);

  const grade = useMemo(() => grades(P.d, P.e), [P]);
  const shade = useMemo(() => {
    if (metric === "grade") return grade.map((g) => Math.min(1, Math.max(0, g) / 11));
    return norm(P[metric]);
  }, [P, grade, metric]);
  const track = useMemo(() => P.lat.map((la, i) => [la, P.lon[i]] as [number, number]), [P]);
  const marks: Mark[] = useMemo(
    () => day.passes.filter((p) => p.name).map((p) => ({ at: Math.min(0.999, (p.km * 1000) / P.d[P.d.length - 1]), label: p.name!, sub: `${fmtNum(p.eleOfficial ?? p.ele, locale)} m` })),
    [day, P, locale],
  );
  const pins = useMemo(() => day.passes.filter((p) => p.name && p.lat != null).map((p) => ({ at: [p.lat!, p.lon!] as [number, number], label: p.name! })), [day]);
  const hasTransfer = useMemo(() => track.some((p, i) => i > 0 && Math.hypot((p[0] - track[i - 1][0]) * 111, (p[1] - track[i - 1][1]) * 78) > 2.5), [track]);

  const ci = cur != null ? Math.round(cur * (P.d.length - 1)) : null;
  const cursorLL = ci != null ? track[ci] : null;
  const s = day.stats;
  const stats: [string, string, string][] = [
    [t.distance, fmtNum(s.distanceKm, locale, 1), "km"],
    [t.ascent, fmtNum(s.ascent, locale), "m"],
    [t.moving, fmtDuration(s.movingSec), ""],
    [t.avgSpeed, fmtNum(s.avgSpeed, locale, 1), "km/h"],
    [t.highPoint, fmtNum(s.maxAlt, locale), "m"],
    [t.avgHr, s.avgHr ? String(s.avgHr) : "—", "bpm"],
    [t.maxHr, s.maxHr ? String(s.maxHr) : "—", "bpm"],
    [t.calories, fmtNum(s.calories, locale), "kcal"],
  ];
  const wx = day.weather;
  const wxLine = wx.length
    ? `${Math.round(Math.min(...wx.map((w) => w.temp)))}–${Math.round(Math.max(...wx.map((w) => w.temp)))} °C · ${t.wind.toLowerCase()} ${Math.min(...wx.map((w) => w.wind))}–${Math.max(...wx.map((w) => w.wind))} km/h · ${t.rain.toLowerCase()} ${fmtNum(wx.reduce((a, w) => a + w.precip, 0), locale, 1)} mm`
    : "";
  const tot = summary.totals;
  const totals: [string, string, string][] = [
    [t.distance, fmtNum(tot.distanceKm, locale), "km"],
    [t.ascent, fmtNum(tot.ascent, locale), "m"],
    [t.days, String(tot.days), ""],
    [t.passes, String(tot.passes), ""],
    [t.countries, summary.countries.join(" · "), ""],
    [t.riders, String(meta.riders), ""],
  ];

  return (
    <>
      {/* ---------- landing ---------- */}
      <section className="adv-hero">
        <div className="adv-hero-grid">
          <div>
            <p className="label">[ {t.adventure} {pad(index)} ] {meta.sport[locale]} · {fmtDate(summary.startDate, locale, { day: "numeric", month: "short" })} – {fmtDate(summary.endDate, locale)}</p>
            <Scramble as="h1" className="display" text={meta.title[locale]} duration={800} />
            <p className="lead">{meta.tagline[locale]}</p>
            <p className="muted adv-intro">{meta.intro[locale]}</p>
          </div>
          <div className={`frame cover ${adv.cover ? "" : "empty"}`}>
            {adv.cover ? <img src={adv.cover} alt="" /> : <span className="label">Cover photo</span>}
          </div>
        </div>
        <dl className="stat-grid totals">
          {totals.map(([k, v, u]) => (
            <div key={k} className="stat">
              <dt className="label">{k}</dt>
              <dd><span className={`num ${v.length > 8 ? "long" : ""}`}>{v}</span>{u && <span className="unit">{u}</span>}</dd>
            </div>
          ))}
        </dl>
        <div className="trip">
          <CubeProfile ele={trip.ele} shade={trip.shade} height={200} minRange={1500} onPick={pickTrip} label={`${meta.title[locale]} — ${t.profile}`} />
          <div className="trip-days">
            {summary.days.map((d, i) => (
              <button key={d.slug} style={{ flexGrow: trip.bounds[i] - (trip.bounds[i - 1] ?? 0) }} className={i === idx ? "on" : ""} onClick={() => go(i, true)} aria-label={`${t.day} ${d.n}`}>
                {pad(d.n)}
              </button>
            ))}
          </div>
        </div>
        <button className="btn" onClick={() => go(idx, true)}>{t.start} <span aria-hidden>↓</span></button>
      </section>

      {/* ---------- day explorer ---------- */}
      <section className="explorer" ref={explorer} id="explorer">
        <nav className="rail" aria-label={t.days}>
          {days.map((d, i) => {
            const e = summary.days[i].ele, lo = 300, hi = 2800;
            return (
              <button key={d.slug} className={`rail-day ${i === idx ? "on" : ""}`} onClick={() => go(i)} aria-current={i === idx}>
                <span className="rail-n">{pad(d.n)}</span>
                <span className="rail-bars" aria-hidden>
                  {Array.from({ length: 10 }, (_, k) => {
                    const v = e[Math.floor((k * e.length) / 10)];
                    return <i key={k} style={{ height: `${Math.max(8, ((v - lo) / (hi - lo)) * 100)}%` }} />;
                  })}
                </span>
                <span className="rail-km">{Math.round(d.stats.distanceKm)} km</span>
              </button>
            );
          })}
        </nav>

        <header className="day-head">
          <div className="day-count">
            <button className="arrow" onClick={() => go(idx - 1)} disabled={idx === 0} aria-label={t.prev}>←</button>
            <p className="label">
              {t.day} <Scramble text={pad(day.n)} /> / {pad(days.length)} — <Scramble text={fmtDate(day.date, locale, { weekday: "long", day: "numeric", month: "long" })} />
            </p>
            <button className="arrow" onClick={() => go(idx + 1)} disabled={idx === days.length - 1} aria-label={t.next}>→</button>
          </div>
          <h2 className="day-title">
            <Scramble text={place(day.start)} duration={600} /> <span className="to" aria-hidden>→</span> <Scramble text={place(day.end)} duration={600} delay={120} />
          </h2>
          <p className="muted day-sub">
            <Scramble text={day.passes.filter((p) => p.name).map((p) => p.name).join(" · ") || "—"} duration={700} />
            {hasTransfer && <span className="tag">{t.transfer}</span>}
          </p>
        </header>

        <dl className="stat-grid">
          {stats.map(([k, v, u], i) => (
            <div key={k} className="stat">
              <dt className="label">{k}</dt>
              <dd><Scramble className="num" text={v} delay={i * 40} />{u && <span className="unit">{u}</span>}</dd>
            </div>
          ))}
        </dl>

        <div className="panel">
          <div className="panel-head">
            <h3 className="label">[ 01 ] {t.profile}</h3>
            <div className="chips" role="group" aria-label={t.shadeBy}>
              <span className="label dim">{t.shadeBy}</span>
              {(["grade", "hr", "sp", "t"] as const).map((m) => (
                <button key={m} className={`chip ${metric === m ? "on" : ""}`} onClick={() => setMetric(m)} aria-pressed={metric === m} disabled={m !== "grade" && !P[m].some((x) => x != null)}>{t.metrics[m]}</button>
              ))}
            </div>
          </div>
          <CubeProfile ele={P.e} shade={shade} marks={marks} cursor={cur} onHover={setCur} height={360} label={`${t.profile} — ${place(day.start)} → ${place(day.end)}`} />
          <div className="readout" aria-live="off">
            {ci == null ? (
              <span className="dim">↔ {t.hoverHint}</span>
            ) : (
              <>
                <span><b>{fmtNum(P.d[ci] / 1000, locale, 1)}</b> km</span>
                <span><b>{fmtNum(P.e[ci], locale)}</b> m</span>
                <span><b>{grade[ci] > 0 ? "+" : ""}{fmtNum(grade[ci], locale, 1)}</b> %</span>
                {P.hr[ci] != null && <span><b>{P.hr[ci]}</b> bpm</span>}
                {P.sp[ci] != null && <span><b>{fmtNum(P.sp[ci]!, locale, 0)}</b> km/h</span>}
                {P.t[ci] != null && <span><b>{fmtNum(P.t[ci]!, locale, 0)}</b> °C</span>}
                <span><b>{localTime(P.ts[ci])}</b></span>
              </>
            )}
          </div>
          {marks.length > 0 && (
            <ol className="pass-list">
              {day.passes.filter((p) => p.name).map((p, i) => (
                <li key={p.name}>
                  <span className="badge">{i + 1}</span>
                  <span>{p.name}</span>
                  <span className="dim">{fmtNum(p.eleOfficial ?? p.ele, locale)} m · km {fmtNum(p.km, locale, 0)} · +{fmtNum(p.gain, locale)} m</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="split">
          <div className="panel">
            <div className="panel-head"><h3 className="label">[ 02 ] {t.satellite}</h3></div>
            <RouteMap track={track} date={day.date} cursor={cursorLL} pins={pins} labels={{ day: t.layerDay, sharp: t.layerSharp, map: t.layerMap, color: t.color }} />
            <p className="note">{t.satNote}</p>
          </div>
          <div className="panel">
            <div className="panel-head"><h3 className="label">[ 03 ] {t.weather}</h3></div>
            <p className="wx-line"><Scramble text={wxLine} duration={700} /></p>
            <div className="table-scroll">
              <table className="wx">
                <thead>
                  <tr><th>{t.km}</th><th>{t.time}</th><th>{t.alt}</th><th>{t.temp}</th><th>{t.wind}</th><th>{t.gust}</th><th>{t.cloud}</th><th>{t.rain}</th></tr>
                </thead>
                <tbody>
                  {wx.map((w) => (
                    <tr key={w.km}>
                      <td>{fmtNum(w.km, locale, 0)}</td>
                      <td>{localTime(w.ts)}</td>
                      <td>{fmtNum(w.ele, locale)}</td>
                      <td><b>{Math.round(w.temp)}°</b> <span className="dim">({Math.round(w.feels)}°)</span></td>
                      <td className="wind">
                        <span className="wind-arrow" style={{ transform: `rotate(${w.windDir + 180}deg)` }} aria-hidden>↑</span>
                        <b>{w.wind}</b> <span className="dim">{Math.abs(w.headwind) < 3 ? t.cross : w.headwind > 0 ? t.head : t.tail}</span>
                      </td>
                      <td>{w.gust}</td>
                      <td>{w.cloud}%</td>
                      <td>{w.precip ? fmtNum(w.precip, locale, 1) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="note">{t.weatherNote}</p>
            <div className="panel-head sub"><h3 className="label">[ 04 ] {t.device}</h3></div>
            <Spark values={P.hr} cursor={cur} unit="bpm" label={t.metrics.hr} />
            <Spark values={P.sp} cursor={cur} unit="km/h" label={t.metrics.sp} />
            <Spark values={P.t} cursor={cur} unit="°C" label={t.metrics.t} />
            <p className="note">{t.deviceNote}</p>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head"><h3 className="label">[ 05 ] {t.photos}</h3></div>
          <div className="photos">
            {day.photos.length
              ? day.photos.map((src) => <figure key={src} className="frame"><img src={src} alt="" loading="lazy" /></figure>)
              : Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="frame empty"><span className="label">{t.photoSlot} {pad(i + 1)}</span></div>
                ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head"><h3 className="label">[ 06 ] {t.notes}</h3></div>
          {day.notesHtml ? (
            <div className="prose" dangerouslySetInnerHTML={{ __html: day.notesHtml }} />
          ) : (
            <div className="frame empty notes-empty"><span className="label">{t.notesEmpty}</span></div>
          )}
        </div>

        <div className="pager">
          <button className="btn ghost" onClick={() => go(idx - 1, true)} disabled={idx === 0}>← {t.prev}</button>
          <button className="btn" onClick={() => go(idx + 1, true)} disabled={idx === days.length - 1}>{t.next} →</button>
        </div>
      </section>
    </>
  );
}
