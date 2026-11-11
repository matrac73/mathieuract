import Link from "next/link";
import { notFound } from "next/navigation";
import { Intro } from "@/components/Intro";
import { NoiseTrack } from "@/components/NoiseTrack";
import { PixelPortrait } from "@/components/PixelPortrait";
import { Rotator } from "@/components/Rotator";
import { HoverScramble, Scramble } from "@/components/Scramble";
import { listAdventures } from "@/lib/adventures";
import { getDict, isLocale } from "@/lib/i18n";
import { site } from "@/content/site";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = getDict(locale);
  const adventures = listAdventures();
  const latest = adventures[0];
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
            <Link className="btn" href={`/${locale}/pro`}>{d.home.ctaPro} <span aria-hidden>→</span></Link>
            {latest && <Link className="btn ghost" href={`/${locale}/adventures/${latest.slug}`}>{d.home.ctaAdventure} <span aria-hidden>→</span></Link>}
          </div>
        </div>
        <div className="hero-portrait frame">
          <PixelPortrait src="/avatar.jpg" alt={site.name} />
          <span className="label portrait-tag">MR / 01</span>
        </div>
      </section>

      <section className="section">
        <p className="label">[ {d.home.index} ]</p>
        <div className="tiles two">
          {tiles.map((k, i) => (
            <Link key={k} href={`/${locale}/${k}`} className="tile">
              <span className="tile-n">0{i + 1}</span>
              <span className="tile-title"><HoverScramble text={d.nav[k]} /></span>
              <span className="tile-desc">{d.home.tiles[k]}</span>
              <span className="tile-foot"><span className="label">{k === "pro" ? "2013 → …" : `${String(adventures.length).padStart(2, "0")} ${d.perso.adventures.toLowerCase()}`}</span><span aria-hidden>→</span></span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}