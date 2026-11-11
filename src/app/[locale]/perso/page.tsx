import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CubeProfile } from "@/components/CubeProfile";
import { PixelPortrait } from "@/components/PixelPortrait";
import { Scramble } from "@/components/Scramble";
import { about, interests, site } from "@/content/site";
import { listAdventures } from "@/lib/adventures";
import { fmtDate, fmtNum, getDict, isLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const d = getDict(isLocale(locale) ? locale : "en");
  return { title: d.perso.title, description: d.perso.lead };
}

export default async function PersoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = getDict(locale);
  const list = listAdventures();
  const c = site.contacts;
  const links = [
    c.email && { label: "Email", text: c.email, href: `mailto:${c.email}` },
    c.linkedin && { label: "LinkedIn", text: c.linkedin.replace(/^https?:\/\/(www\.)?/, ""), href: c.linkedin },
    c.github && { label: "GitHub", text: c.github.replace(/^https?:\/\//, ""), href: c.github },
    c.strava && { label: "Strava", text: c.strava.replace(/^https?:\/\/(www\.)?/, ""), href: c.strava },
  ].filter(Boolean) as { label: string; text: string; href: string }[];

  return (
    <div className="page perso">
      <header className="page-head">
        <div>
          <p className="label">[ 02 ] {site.name}</p>
          <Scramble as="h1" className="display" text={d.perso.title} />
          <p className="lead">{d.perso.lead}</p>
        </div>
        <div className="profile-side">
          <div className="frame perso-portrait"><PixelPortrait src="/avatar.jpg" alt={site.name} /></div>
        </div>
      </header>

      <section className="block">
        <h2 className="label">[ {d.perso.about} ] <span className="tag">{d.profile.wip}</span></h2>
        <div className="about">{about[locale].map((para) => <p key={para.slice(0, 24)}>{para}</p>)}</div>
        <dl className="interests">
          {interests.filter((i) => !i.cvOnly).map((i) => (
            <div key={i.label.en}><dt>{i.label[locale]}</dt><dd>{i.text[locale]}</dd></div>
          ))}
        </dl>
      </section>

      <section className="block" id="adventures">
        <h2 className="label">[ {d.perso.adventures} ] {String(list.length).padStart(2, "0")}</h2>
        <p className="muted adv-lead">{d.adv.lead}</p>
        <div className="adv-list">
          {list.map((a, i) => (
            <Link key={a.slug} href={`/${locale}/adventures/${a.slug}`} className="teaser">
              <div className="teaser-head">
                <p className="label">[ {d.adv.adventure} {String(list.length - i).padStart(2, "0")} ] {a.meta.sport[locale]} · {fmtDate(a.summary.startDate, locale, { month: "long", year: "numeric" })}</p>
                <h3 className="display small">{a.meta.title[locale]}</h3>
                <p className="muted">{a.meta.tagline[locale]}</p>
              </div>
              <CubeProfile ele={a.summary.days.flatMap((x) => x.ele)} height={180} minRange={1500} trace label={a.meta.title[locale]} />
              <div className="teaser-stats">
                <span><b className="num">{fmtNum(a.summary.totals.distanceKm, locale)}</b> km</span>
                <span><b className="num">{fmtNum(a.summary.totals.ascent, locale)}</b> m ↑</span>
                <span><b className="num">{a.summary.totals.days}</b> {d.adv.days.toLowerCase()}</span>
                <span><b className="num">{a.summary.countries.join(" · ")}</b></span>
                <span className="teaser-go">{d.adv.open} →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="block">
        <h2 className="label">[ {d.profile.contact} ]</h2>
        <ul className="contacts">
          {links.map((l) => (
            <li key={l.label}><span className="label">{l.label}</span><a href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{l.text}</a></li>
          ))}
        </ul>
      </section>
    </div>
  );
}
