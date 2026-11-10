import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HoverScramble, Scramble } from "@/components/Scramble";
import { projects } from "@/content/site";
import { getDict, isLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: getDict(isLocale(locale) ? locale : "en").projects.title };
}

export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = getDict(locale);
  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="label">[ 02 ] {String(projects.length).padStart(2, "0")} repos</p>
          <Scramble as="h1" className="display" text={d.projects.title} />
          <p className="lead">{d.projects.lead}</p>
        </div>
      </header>
      <ul className="cards">
        {projects.map((p, i) => (
          <li key={p.name} className="card">
            <div className="card-top"><span className="label">{String(i + 1).padStart(2, "0")}</span><span className="label dim">{p.lang}</span></div>
            <h2><HoverScramble text={p.name} /></h2>
            <p>{p.desc[locale]}</p>
            <div className="card-links">
              <a href={p.url} target="_blank" rel="noreferrer">{d.projects.code} ↗</a>
              {p.live && <a href={p.live} target="_blank" rel="noreferrer">{d.projects.live} ↗</a>}
              <span className="dim">{d.projects.updated} {p.updated}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
