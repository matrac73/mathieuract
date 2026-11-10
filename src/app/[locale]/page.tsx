import Link from "next/link";
import { notFound } from "next/navigation";
import { CubeProfile } from "@/components/CubeProfile";
import { Intro } from "@/components/Intro";
import { NoiseTrack } from "@/components/NoiseTrack";
import { HoverScramble, Scramble } from "@/components/Scramble";
import { listAdventures } from "@/lib/adventures";
import { listArticles } from "@/lib/articles";
import { fmtDate, fmtNum, getDict, isLocale } from "@/lib/i18n";
import { projects, site } from "@/content/site";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = getDict(locale);
  const adventures = listAdventures();
  const latest = adventures[0];
  const articles = listArticles(locale);
  const tiles = [
    { k: "profile", count: "CV" },
    { k: "projects", count: String(projects.length).padStart(2, "0") },
    { k: "articles", count: String(articles.length).padStart(2, "0") },
    { k: "adventures", count: String(adventures.length).padStart(2, "0") },
  ] as const;
  const tripEle = latest?.summary.days.flatMap((x) => x.ele) ?? [];

  return (
    <>
      <Intro label={d.intro.label} lines={d.intro.lines} skip={d.intro.skip} />

      <section className="hero">
        <NoiseTrack className="hero-noise" />
        <div className="hero-inner">
          <p className="label">[ {d.home.kicker} ] {site.location}</p>
          <h1 className="display hero-name">
            <Scramble text="Mathieu" duration={700} delay={150} />
            <br />
            <Scramble text="Ract" duration={700} delay={350} />
          </h1>
          <p className="hero-role">{d.home.role}</p>
          <p className="lead hero-lead">{d.home.lead}</p>
          <div className="hero-cta">
            <Link className="btn" href={`/${locale}/profile`}>{d.home.ctaProfile} <span aria-hidden>→</span></Link>
            {latest && <Link className="btn ghost" href={`/${locale}/adventures/${latest.slug}`}>{d.home.ctaAdventure} <span aria-hidden>→</span></Link>}
          </div>
        </div>
        <div className="hero-portrait frame">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/avatar.jpg" alt={site.name} width={320} height={320} />
          <span className="label portrait-tag">MR / 01</span>
        </div>
      </section>

      <section className="section">
        <p className="label">[ {d.home.index} ]</p>
        <div className="tiles">
          {tiles.map(({ k, count }, i) => (
            <Link key={k} href={`/${locale}/${k}`} className="tile">
              <span className="tile-n">0{i + 1}</span>
              <span className="tile-title"><HoverScramble text={d.nav[k]} /></span>
              <span className="tile-desc">{d.home.tiles[k]}</span>
              <span className="tile-foot"><span className="label">{count}</span><span aria-hidden>→</span></span>
            </Link>
          ))}
        </div>
      </section>

      {latest && (
        <section className="section">
          <p className="label">[ {d.home.latest} ]</p>
          <Link href={`/${locale}/adventures/${latest.slug}`} className="teaser">
            <div className="teaser-head">
              <h2 className="display small">{latest.meta.title[locale]}</h2>
              <p className="muted">
                {latest.meta.tagline[locale]} — {fmtDate(latest.summary.startDate, locale, { month: "long", year: "numeric" })}
              </p>
            </div>
            <CubeProfile ele={tripEle} height={180} minRange={1500} label={latest.meta.title[locale]} />
            <div className="teaser-stats">
              <span><b className="num">{fmtNum(latest.summary.totals.distanceKm, locale)}</b> km</span>
              <span><b className="num">{fmtNum(latest.summary.totals.ascent, locale)}</b> m ↑</span>
              <span><b className="num">{latest.summary.totals.days}</b> {d.adv.days.toLowerCase()}</span>
              <span><b className="num">{latest.summary.totals.passes}</b> {d.adv.passes.toLowerCase()}</span>
              <span className="teaser-go">{d.adv.open} →</span>
            </div>
          </Link>
        </section>
      )}
    </>
  );
}
