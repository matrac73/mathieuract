import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ScrollFigures } from "@/components/ScrollFigures";
import { VoxelScene } from "@/components/VoxelScene";
import { getArticle, listArticles, listSlugs } from "@/lib/articles";
import { courseName, courseOf } from "@/lib/courses";
import { fmtDate, getDict, isLocale, locales } from "@/lib/i18n";

type P = { params: Promise<{ locale: string; slug: string }> };

export const generateStaticParams = () => locales.flatMap((locale) => listSlugs().map((slug) => ({ locale, slug })));

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale, slug } = await params;
  const a = isLocale(locale) ? getArticle(slug, locale) : null;
  return a ? { title: a.title, description: a.summary } : {};
}

export default async function ArticlePage({ params }: P) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const a = getArticle(slug, locale);
  if (!a) notFound();
  const d = getDict(locale);
  const course = courseOf(a);
  const all = listArticles(locale);
  const next = all[(all.findIndex((x) => x.slug === slug) + 1) % all.length];
  return (
    <article className="page article">
      <Link href={`/${locale}/pro#career`} className="back label">cd ..</Link>
      {a.category === "perspective" ? (
        <header className="article-head persp-head">
          <p className="label">[ {d.articles.categories[a.category]} ] {a.readingMinutes} {d.articles.min} · {fmtDate(a.date, locale, { day: "numeric", month: "long", year: "numeric" })}</p>
          {a.hook && <p className="hook">{a.hook}</p>}
          <h1 className="display small">{a.title}</h1>
          <dl className="persp-meta">
            {a.news && (<><dt className="label">{d.articles.news}</dt><dd><a href={a.news.url} target="_blank" rel="noopener noreferrer">{a.news.title}</a> <span className="dim">· {a.news.source}, {fmtDate(a.news.date, locale)}</span></dd></>)}
            {a.course && (<><dt className="label">{d.articles.course}</dt><dd>{course ? <Link href={`/${locale}/experience/centralesupelec#${course.slug}`}>{courseName(course)} ({course.year})</Link> : a.course} <span className="dim">· CentraleSupélec</span></dd></>)}
          </dl>
        </header>
      ) : (
        <header className="article-head">
          <VoxelScene scene={a.scene ?? "pyramid"} className="article-img" />
          <p className="label">[ {d.articles.categories[a.category] ?? a.category} ] {a.readingMinutes} {d.articles.min} · {fmtDate(`${a.written ?? a.date.slice(0, 7)}-15`, locale, { month: "long", year: "numeric" })}</p>
          <h1 className="display small">{a.title}</h1>
          <p className="lead">{a.summary}</p>
        </header>
      )}
      <div className="prose" dangerouslySetInnerHTML={{ __html: a.html }} />
      <ScrollFigures />
      {next && next.slug !== slug && (
        <Link href={`/${locale}/articles/${next.slug}`} className="next-article">
          <span className="label">{d.articles.next} →</span>
          <span className="row-title">{next.title}</span>
        </Link>
      )}
    </article>
  );
}
