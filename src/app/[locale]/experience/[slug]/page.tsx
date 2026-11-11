import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { marked } from "marked";
import { notFound } from "next/navigation";
import { Scramble } from "@/components/Scramble";
import { VoxelScene } from "@/components/VoxelScene";
import { career } from "@/content/site";
import { listArticles } from "@/lib/articles";
import { getDict, isLocale, locales, type Locale } from "@/lib/i18n";

type P = { params: Promise<{ locale: string; slug: string }> };
const IMG = /\.(jpe?g|png|webp|avif)$/i;
const months = (ym: string) => Number(ym.slice(0, 4)) * 12 + Number(ym.slice(5, 7)) - 1;

export const generateStaticParams = () => locales.flatMap((locale) => career.map((c) => ({ locale, slug: c.slug })));

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale, slug } = await params;
  const it = career.find((c) => c.slug === slug);
  return it && isLocale(locale) ? { title: it.org, description: it.role[locale] } : {};
}

// long text: content/experiences/<slug>.<locale>.md — images: public/experiences/<slug>/
function load(slug: string, locale: Locale) {
  let html: string | null = null;
  for (const l of [locale, "en"]) {
    const f = path.join(process.cwd(), "content", "experiences", `${slug}.${l}.md`);
    if (fs.existsSync(f)) { const md = fs.readFileSync(f, "utf8").trim(); if (md) { html = marked.parse(md, { async: false }) as string; break; } }
  }
  const dir = path.join(process.cwd(), "public", "experiences", slug);
  const images = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => IMG.test(f)).sort().map((f) => `/experiences/${slug}/${f}`) : [];
  return { html, images };
}

export default async function ExperiencePage({ params }: P) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const i = career.findIndex((c) => c.slug === slug);
  if (i < 0) notFound();
  const it = career[i], d = getDict(locale), t = d.pro;
  const { html, images } = load(slug, locale);
  const now = new Date().toISOString().slice(0, 7);
  const written = listArticles(locale).filter((a) => {
    const w = months(a.written ?? a.date.slice(0, 7));
    return w >= months(it.start) && w <= months(it.end ?? now);
  });
  const prev = career[i + 1], next = career[i - 1]; // the list is newest first

  return (
    <article className="page exp">
      <Link href={`/${locale}/pro#career`} className="back label">← {t.expBack}</Link>
      <header className="exp-head">
        <div>
          <p className="label">[ {String(career.length - i).padStart(2, "0")} / {String(career.length).padStart(2, "0")} ] {it.from === it.to ? it.from : `${it.from} — ${it.to ?? d.profile.present}`} · {it.place}</p>
          <Scramble as="h1" className="display small" text={it.org} />
          <p className="lead">{it.role[locale]}{it.wip && <span className="tag">WIP</span>}</p>
          <ul className="exp-bullets">{it.bullets[locale].map((b) => <li key={b}>{b}</li>)}</ul>
        </div>
        <VoxelScene scene={it.scene} className="exp-scene" />
      </header>

      <section className="block">
        <h2 className="label">[ {t.expWhat} ]</h2>
        {html ? (
          <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <div className="frame empty exp-text"><span className="label">{t.expText}<br /><span className="dim">content/experiences/{slug}.{locale}.md</span></span></div>
        )}
      </section>

      <section className="block">
        <h2 className="label">[ Images ]</h2>
        <div className="photos">
          {images.length
            // eslint-disable-next-line @next/next/no-img-element
            ? images.map((src) => <figure key={src} className="frame"><img src={src} alt="" loading="lazy" /></figure>)
            : Array.from({ length: 3 }, (_, k) => <div key={k} className="frame empty"><span className="label">{t.expImg} {String(k + 1).padStart(2, "0")}<br /><span className="dim">public/experiences/{slug}/</span></span></div>)}
        </div>
      </section>

      {written.length > 0 && (
        <section className="block">
          <h2 className="label">[ {t.expArticles} ]</h2>
          <ul className="rows">
            {written.map((a) => (
              <li key={a.slug}>
                <Link href={`/${locale}/articles/${a.slug}`} className="row">
                  <VoxelScene scene={a.scene ?? "pyramid"} className="row-img" />
                  <span className="row-main"><span className="row-title">{a.title}</span><span className="row-sub">{a.summary}</span></span>
                  <span className="row-meta label">{a.readingMinutes} {d.articles.min}</span>
                  <span className="row-go" aria-hidden>→</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="pager">
        {prev ? <Link className="btn ghost" href={`/${locale}/experience/${prev.slug}`}>← {prev.org}</Link> : <span />}
        {next ? <Link className="btn" href={`/${locale}/experience/${next.slug}`}>{next.org} →</Link> : <span />}
      </div>
    </article>
  );
}
