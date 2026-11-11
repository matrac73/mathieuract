import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LifeGame } from "@/components/LifeGame";
import { DotTitle, HoverScramble } from "@/components/Scramble";
import { PixelPortrait } from "@/components/PixelPortrait";
import { VoxelScene } from "@/components/VoxelScene";
import { career, languages, life, projects, site, skills } from "@/content/site";
import { listArticles, type ArticleMeta } from "@/lib/articles";
import { fmtDate, getDict, isLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const d = getDict(isLocale(locale) ? locale : "en");
  return { title: d.pro.title, description: d.pro.lead };
}

const months = (ym: string) => Number(ym.slice(0, 4)) * 12 + Number(ym.slice(5, 7)) - 1;

export default async function ProPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = getDict(locale);
  const t = d.pro;
  const now = new Date().toISOString().slice(0, 7);

  // each article sits on the rail of the period it was written in, at the height of its date
  const articles = listArticles(locale);
  const placed = career.map(() => [] as { a: ArticleMeta; top: number; k: number }[]);
  for (const a of articles) {
    const w = a.written ?? a.date.slice(0, 7);
    let row = career.findIndex((c) => months(w) >= months(c.start) && months(w) <= months(c.end ?? now));
    if (row < 0) row = months(w) > months(now) ? 0 : career.length - 1;
    const c = career[row], span = Math.max(1, months(c.end ?? now) - months(c.start));
    const top = Math.min(0.9, Math.max(0.04, (months(c.end ?? now) - months(w)) / span));
    placed[row].push({ a, top, k: placed[row].filter((x) => x.top === top).length });
  }

  return (
    <div className="page pro">
      <header className="page-head">
        <div>
          <p className="label">[ 01 ] {site.name}</p>
          <DotTitle className="display" text={t.title} />
          <p className="lead">{t.lead}</p>
        </div>
        <div className="profile-side">
          <div className="frame perso-portrait"><PixelPortrait src="/portrait-pro.jpg" alt={site.name} /></div>
          <Link className="btn ghost no-print" href={`/${locale}/cv`}>{t.cv} <span aria-hidden>→</span></Link>
        </div>
      </header>

      <section className="block" id="path">
        <h2 className="label">[ {t.path} ]</h2>
        <LifeGame stages={life} locale={locale} labels={{ hint: t.hint, touch: t.touch, acad: t.acad, pro: t.proLane, origin: t.origin, soon: t.soon, now: t.now, replay: t.replay, more: t.more, none: t.none, wip: t.wip, next: d.articles.next, prev: "←" }} />
      </section>

      <section className="block" id="career">
        <h2 className="label">[ {t.career} ]</h2>
        <p className="label dim rail-legend"><i aria-hidden /> {t.articlesRail}</p>
        <ol className="career">
          {career.map((it, i) => (
            <li key={it.org + it.from} className="career-row">
              <div className="career-pin" data-pin>
              <div className="career-rail">
                {placed[i].map(({ a, top, k }) => (
                  <Link key={a.slug} href={`/${locale}/articles/${a.slug}`} className="bump" style={{ top: `calc(${(top * 100).toFixed(1)}% + ${k * 30}px)`, animationDelay: `${-(k * 0.37 + i * 0.2).toFixed(2)}s` }} aria-label={a.title}>
                    <span className="bump-card">
                      <VoxelScene scene={a.scene ?? "pyramid"} className="bump-img" />
                      <span className="bump-text">
                        <span className="label">{d.articles.categories[a.category] ?? a.category} · {fmtDate(`${a.written ?? a.date.slice(0, 7)}-15`, locale, { month: "short", year: "numeric" })}</span>
                        <span className="bump-title">{a.title}</span>
                        <span className="label">{a.readingMinutes} {d.articles.min} · {t.read} →</span>
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
              <div className="career-body">
                <p className="label">{it.from === it.to ? it.from : `${it.from} — ${it.to ?? d.profile.present}`}</p>
                <h3><Link href={`/${locale}/experience/${it.slug}`} className="career-link">{it.short ?? it.org}</Link>{it.wip && <span className="tag">WIP</span>}</h3>
                <p className="tl-role">{it.role[locale]} · <span className="dim">{it.place}</span></p>
                <ul>{it.bullets[locale].map((b) => <li key={b}>{b}</li>)}</ul>
                <Link href={`/${locale}/experience/${it.slug}`} className="label career-more">{t.details} →</Link>
              </div>
              <Link href={`/${locale}/experience/${it.slug}`} className="career-scene-link" aria-label={it.org} tabIndex={-1}><VoxelScene scene={it.scene} scroll className="career-scene" /></Link>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="block">
        <h2 className="label">[ {d.profile.skills} ]</h2>
        <div className="skills">
          {skills.map((g) => (
            <div key={g.label.en} className="skill-group">
              <h3>{g.label[locale]}</h3>
              <ul className="tags">{g.items.map((s) => <li key={s}>{s}</li>)}</ul>
            </div>
          ))}
          <div className="skill-group wide">
            <h3>{d.profile.languages}</h3>
            <ul className="langs">{languages.map((l) => <li key={l.name.en}><b>{l.name[locale]}</b> <span className="dim">{l.level[locale]}</span></li>)}</ul>
          </div>
        </div>
      </section>

      <section className="block" id="projects">
        <h2 className="label">[ {d.projects.title} ] {String(projects.length).padStart(2, "0")} repos</h2>
        <ul className="cards compact">
          {projects.map((p) => (
            <li key={p.name} className="card">
              <div className="card-top"><h3><HoverScramble text={p.name} /></h3><span className="label dim">{p.lang}</span></div>
              <p>{p.desc[locale]}</p>
              <div className="card-links">
                <a href={p.url} target="_blank" rel="noreferrer">{d.projects.code} ↗</a>
                {p.live && <a href={p.live} target="_blank" rel="noreferrer">{d.projects.live} ↗</a>}
              </div>
            </li>
          ))}
        </ul>
        <a className="btn projects-more" href={site.contacts.github} target="_blank" rel="noreferrer">{t.projectsMore} <span aria-hidden>↗</span></a>
      </section>
    </div>
  );
}
