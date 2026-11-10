import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CubeProfile } from "@/components/CubeProfile";
import { Scramble } from "@/components/Scramble";
import { listAdventures } from "@/lib/adventures";
import { fmtDate, fmtNum, getDict, isLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: getDict(isLocale(locale) ? locale : "en").adv.title };
}

export default async function AdventuresPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = getDict(locale);
  const list = listAdventures();
  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="label">[ 04 ] {String(list.length).padStart(2, "0")} logged</p>
          <Scramble as="h1" className="display" text={d.adv.title} />
          <p className="lead">{d.adv.lead}</p>
        </div>
      </header>
      <div className="adv-list">
        {list.map((a, i) => (
          <Link key={a.slug} href={`/${locale}/adventures/${a.slug}`} className="teaser">
            <div className="teaser-head">
              <p className="label">[ {d.adv.adventure} {String(list.length - i).padStart(2, "0")} ] {a.meta.sport[locale]} · {fmtDate(a.summary.startDate, locale, { month: "long", year: "numeric" })}</p>
              <h2 className="display small">{a.meta.title[locale]}</h2>
              <p className="muted">{a.meta.tagline[locale]}</p>
            </div>
            <CubeProfile ele={a.summary.days.flatMap((x) => x.ele)} height={180} minRange={1500} label={a.meta.title[locale]} />
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
    </div>
  );
}
