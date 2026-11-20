import Link from "next/link";
import { notFound } from "next/navigation";
import { Intro } from "@/components/Intro";
import { NoiseTrack } from "@/components/NoiseTrack";
import { PixelPortrait } from "@/components/PixelPortrait";
import { Rotator } from "@/components/Rotator";
import { HoverScramble, Scramble } from "@/components/Scramble";
import { listAdventures } from "@/lib/adventures";
import { listArticles } from "@/lib/articles";
import { fmtDate, fmtNum, getDict, isLocale } from "@/lib/i18n";
import { site } from "@/content/site";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = getDict(locale);
  const adventures = listAdventures();
  const latest = adventures[0];
  // the most recently written article (ties: the last one in the reading order)
  const when = (a: { written?: string; date: string }) => a.written ?? a.date.slice(0, 7);
  const article = listArticles(locale).sort((a, b) => when(b).localeCompare(when(a)) || (b.order ?? 0) - (a.order ?? 0))[0];
  const tiles = ["pro", "perso"] as const;

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
          <p className="hero-role"><Rotator items={site.taglines[locale]} /></p>
          <div className="hero-cta">
            {tiles.map((k, i) => <Link key={k} className={i ? "btn ghost" : "btn"} href={`/${locale}/${k}`}>{d.nav[k]} <span aria-hidden>→</span></Link>)}
          </div>
        </div>
        <div className="hero-portrait frame">
          <PixelPortrait src="/avatar.jpg" alt={site.name} />
          <span className="label portrait-tag">MR / 01</span>
        </div>
      </section>

      <section className="section">
        <p className="label">[ {d.home.latest} ]</p>
        <div className="tiles two">
          {latest && (
            <Link href={`/${locale}/adventures/${latest.slug}`} className="tile">
              <span className="tile-n">01</span>
              <span className="tile-title"><HoverScramble text={d.home.ctaAdventure} /></span>
              <span className="tile-desc"><b>{latest.meta.title[locale]}</b>{latest.meta.tagline[locale]}</span>
              <span className="tile-foot"><span className="label">{fmtDate(latest.summary.startDate, locale, { month: "long", year: "numeric" })} · {fmtNum(latest.summary.totals.distanceKm, locale)} km</span><span aria-hidden>→</span></span>
            </Link>
          )}
          {article && (
            <Link href={`/${locale}/articles/${article.slug}`} className="tile">
              <span className="tile-n">02</span>
              <span className="tile-title"><HoverScramble text={d.home.ctaArticle} /></span>
              <span className="tile-desc"><b>{article.title}</b>{article.hook ?? article.summary}</span>
              <span className="tile-foot"><span className="label">{fmtDate(`${when(article)}-15`, locale, { month: "long", year: "numeric" })} · {article.readingMinutes} {d.articles.min}</span><span aria-hidden>→</span></span>
            </Link>
          )}
        </div>
      </section>
    </>
  );
}