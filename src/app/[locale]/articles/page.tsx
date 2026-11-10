import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HoverScramble, Scramble } from "@/components/Scramble";
import { listArticles } from "@/lib/articles";
import { getDict, isLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: getDict(isLocale(locale) ? locale : "en").articles.title };
}

export default async function ArticlesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = getDict(locale);
  const all = listArticles(locale);
  const cats = [...new Set(all.map((a) => a.category))];
  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="label">[ 03 ] {String(all.length).padStart(2, "0")} notes</p>
          <Scramble as="h1" className="display" text={d.articles.title} />
          <p className="lead">{d.articles.lead}</p>
        </div>
      </header>
      {cats.map((cat) => (
        <section key={cat} className="block">
          <h2 className="label">[ {d.articles.categories[cat] ?? cat} ]</h2>
          <ul className="rows">
            {all.filter((a) => a.category === cat).map((a) => (
              <li key={a.slug}>
                <Link href={`/${locale}/articles/${a.slug}`} className="row">
                  <span className="row-n label">{String(a.order).padStart(2, "0")}</span>
                  <span className="row-main">
                    <span className="row-title"><HoverScramble text={a.title} /></span>
                    <span className="row-sub">{a.summary}</span>
                  </span>
                  <span className="row-meta label">{a.readingMinutes} {d.articles.min}</span>
                  <span className="row-go" aria-hidden>→</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
