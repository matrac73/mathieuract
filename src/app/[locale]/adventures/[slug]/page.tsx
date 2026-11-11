import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdventureExplorer } from "@/components/AdventureExplorer";
import { getAdventure, getDays, listAdventures } from "@/lib/adventures";
import { getDict, isLocale, locales } from "@/lib/i18n";

type P = { params: Promise<{ locale: string; slug: string }> };

export const generateStaticParams = () => locales.flatMap((locale) => listAdventures().map((a) => ({ locale, slug: a.slug })));

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale, slug } = await params;
  const a = getAdventure(slug);
  return a && isLocale(locale) ? { title: a.meta.title[locale], description: a.meta.tagline[locale] } : {};
}

export default async function AdventurePage({ params }: P) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const adv = getAdventure(slug);
  if (!adv) notFound();
  const dict = getDict(locale);
  const all = listAdventures();
  const index = all.length - all.findIndex((a) => a.slug === slug);
  return (
    <div className="page adventure">
      <Link href={`/${locale}/perso#adventures`} className="back label">← {dict.adv.allAdventures}</Link>
      <AdventureExplorer adv={adv} days={getDays(slug, locale)} dict={dict} locale={locale} index={index} />
    </div>
  );
}
