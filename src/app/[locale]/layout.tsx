import type { Metadata, Viewport } from "next";
import { Doto, Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Year } from "@/components/Year";
import { getDict, isLocale, locales } from "@/lib/i18n";
import { site } from "@/content/site";
import "../globals.css";

const sans = Geist({ subsets: ["latin"], variable: "--font-sans" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });
const dot = Doto({ subsets: ["latin"], variable: "--font-dot", weight: ["700", "900"] });

export const generateStaticParams = () => locales.map((locale) => ({ locale }));

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const d = getDict(isLocale(locale) ? locale : "en");
  return {
    metadataBase: new URL(site.url),
    title: { default: site.name, template: `%s — ${site.name}` },
    description: d.home.lead,
    alternates: { languages: { en: "/en", fr: "/fr" } },
    openGraph: { title: site.name, description: d.home.lead, type: "website", images: ["/avatar.jpg"] },
  };
}

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#0a0a0a" }, { media: "(prefers-color-scheme: light)", color: "#f3f3ef" }],
};

// runs before paint: restores the theme and skips the intro if already seen this session
const boot = `try{var d=document.documentElement;d.dataset.theme=localStorage.getItem("theme")||"dark";if(sessionStorage.getItem("intro"))d.dataset.intro="done"}catch(e){}`;

export default async function RootLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDict(locale);
  return (
    <html lang={locale} data-theme="dark" className={`${sans.variable} ${mono.variable} ${dot.variable}`} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
        <a className="skip-link" href="#main">Skip to content</a>
        <Header locale={locale} dict={dict} />
        <main id="main">{children}</main>
        <footer className="site-footer">
          <span>© <Year /> {site.name}</span>
          <a href="#main">{dict.footer.top} ↑</a>
        </footer>
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
