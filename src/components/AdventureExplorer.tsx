"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Adventure, Day } from "@/lib/adventures";
import { useFitLine } from "@/lib/fit";
import { fmtDate, fmtDuration, fmtNum, type Dict, type Locale } from "@/lib/i18n";
import { heat } from "@/lib/ride";
import { CubeProfile } from "./CubeProfile";
import { DayScene } from "./DayScene";
import { JourneyScroll } from "./JourneyScroll";
import { Scramble } from "./Scramble";
import { SportIcon } from "./SportIcon";

const pad = (n: number) => String(n).padStart(2, "0");
const localTime = (ts: number) => new Date((ts + 7200) * 1000).toISOString().slice(11, 16); // CEST all along the route
const place = (p: { name: string | null }) => p.name ?? "—";

export function AdventureExplorer({ adv, days, dict, locale, index }: { adv: Adventure; days: Day[]; dict: Dict; locale: Locale; index: number }) {
  const t = dict.adv;
  const { summary, meta } = adv;
  const [idx, setIdx] = useState(0);
  const explorer = useRef<HTMLElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const day = days[idx];
  const P = day.profile;

  const go = useCallback(
    (i: number, smooth = false) => {
      const n = Math.min(days.length - 1, Math.max(0, i));
      setIdx(n);
      history.replaceState(null, "", `#${days[n].slug}`);
      // every day starts at the top of its own scroll
      requestAnimationFrame(() => explorer.current?.scrollIntoView({ behavior: smooth ? "smooth" : "instant", block: "start" }));
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

  const hasTransfer = useMemo(() => P.lat.some((la, i) => i > 0 && Math.hypot((la - P.lat[i - 1]) * 111, (P.lon[i] - P.lon[i - 1]) * 78) > 2.5), [P]);
  const named = day.passes.filter((p) => p.name);
  const s = day.stats;
  useFitLine(title, `${place(day.start)} → ${place(day.end)}`);
  // each figure is tinted by where this day stands among the days of the trip: white = the lowest, yellow then orange = the highest
  const rank = (pick: (d: Day) => number | null) => {
    const all = days.map(pick).filter((v): v is number => v != null), lo = Math.min(...all), hi = Math.max(...all), v = pick(day);
    return v == null || hi === lo ? 0 : (v - lo) / (hi - lo);
  };
  const stats: [string, string, string, number][] = [
    [t.distance, fmtNum(s.distanceKm, locale, 1), "km", rank((d) => d.stats.distanceKm)],
    [t.ascent, fmtNum(s.ascent, locale), "m", rank((d) => d.stats.ascent)],
    [t.moving, fmtDuration(s.movingSec), "", rank((d) => d.stats.movingSec)],
    [t.avgSpeed, fmtNum(s.avgSpeed, locale, 1), "km/h", rank((d) => d.stats.avgSpeed)],
    [t.highPoint, fmtNum(s.maxAlt, locale), "m", rank((d) => d.stats.maxAlt)],
    [t.avgHr, s.avgHr ? String(s.avgHr) : "—", "bpm", rank((d) => d.stats.avgHr)],
    [t.maxHr, s.maxHr ? String(s.maxHr) : "—", "bpm", rank((d) => d.stats.maxHr)],
    [t.avgPower, String(day.avgPower), "W", rank((d) => d.avgPower)],
    [t.calories, fmtNum(s.calories, locale), "kcal", rank((d) => d.stats.calories)],
  ];
  const wx = day.weather;
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
            <p className="label">[ {t.adventure} {pad(index)} ] <SportIcon kind={meta.kind} label={meta.sport[locale]} /> {fmtDate(summary.startDate, locale, { day: "numeric", month: "short" })} – {fmtDate(summary.endDate, locale)}</p>
            <Scramble as="h1" className="display" text={meta.title[locale]} duration={800} />
            <p className="lead">{meta.tagline[locale]}</p>
            <p className="muted adv-intro">{meta.intro[locale]}</p>
          </div>
          <div className={`frame cover ${adv.cover ? "" : "empty"}`}>
            {adv.cover ? <img src={adv.cover} alt="" /> : <span className="label">Cover photo</span>}
          </div>
        </div>
        <JourneyScroll src={`/adventures/${adv.slug}/terrain/overview.json`} summary={summary} dict={dict} locale={locale} />
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
          <h2 className="day-title" ref={title}>
            <Scramble text={place(day.start)} duration={600} /> <span className="to" aria-hidden>→</span> <Scramble text={place(day.end)} duration={600} delay={120} />
          </h2>
          <p className="muted day-sub">
            <Scramble text={named.map((p) => p.name).join(" · ") || "—"} duration={700} />
            {hasTransfer && <span className="tag">{t.transfer}</span>}
          </p>
        </header>

        <dl className="stat-grid nine">
          {stats.map(([k, v, u, lvl], i) => (
            <div key={k} className="stat">
              <dt className="label">{k}</dt>
              <dd style={{ color: heat(lvl) }}><Scramble className="num" text={v} delay={i * 40} />{u && <span className="unit">{u}</span>}</dd>
            </div>
          ))}
        </dl>

        <p className="label scene-title">[ 01 ] {t.terrain}</p>
        <DayScene key={day.slug} slug={adv.slug} day={day} dict={dict} locale={locale} index={idx} mass={meta.massKg ?? 85} />
        <p className="note">{t.terrainNote}</p>
        {named.length > 0 && (
          <ol className="pass-list">
            {named.map((p, i) => (
              <li key={p.name}>
                <span className="badge">{i + 1}</span>
                <span>{p.name}</span>
                <span className="dim">{fmtNum(p.eleOfficial ?? p.ele, locale)} m · km {fmtNum(p.km, locale, 0)} · +{fmtNum(p.gain, locale)} m</span>
              </li>
            ))}
          </ol>
        )}

        {/* room to tell the day */}
        <div className="panel story">
          <div className="panel-head"><h3 className="label">[ 02 ] {t.story}</h3></div>
          {day.notesHtml ? (
            <div className="prose" dangerouslySetInnerHTML={{ __html: day.notesHtml }} />
          ) : (
            <>
              <div className="frame empty story-empty"><span className="label">{t.storyEmpty}<br /><span className="dim">content/adventures/{adv.slug}/notes/{day.slug}.{locale}.md</span></span></div>
              <div className="anecdotes">
                {Array.from({ length: 3 }, (_, i) => <div key={i} className="frame empty"><span className="label">{t.anecdote} {pad(i + 1)}</span></div>)}
              </div>
            </>
          )}
        </div>

        <div className="panel">
          <div className="panel-head"><h3 className="label">[ 03 ] {t.photos}</h3></div>
          <div className="photos">
            {day.media.length
              ? day.media.map((m) => <figure key={m.src} className="frame">{m.video ? <video src={m.src} controls muted playsInline preload="metadata" /> : <img src={m.src} alt="" loading="lazy" />}</figure>)
              : Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="frame empty"><span className="label">{t.photoSlot} {pad(i + 1)}{i === 0 && <><br /><span className="dim">public/adventures/{adv.slug}/{day.slug}/</span></>}</span></div>
                ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head"><h3 className="label">[ 04 ] {t.weather}</h3></div>
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
        </div>

        <div className="pager">
          <button className="btn ghost" onClick={() => go(idx - 1, true)} disabled={idx === 0}>← {t.prev}</button>
          <button className="btn" onClick={() => go(idx + 1, true)} disabled={idx === days.length - 1}>{t.next} →</button>
        </div>
      </section>
    </>
  );
}
