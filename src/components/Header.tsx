"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Dict, Locale } from "@/lib/i18n";
import { HoverScramble } from "./Scramble";

export function Header({ locale, dict }: { locale: Locale; dict: Dict }) {
  const pathname = usePathname() ?? `/${locale}`;
  const rest = pathname.replace(/^\/(en|fr)/, "");
  const other: Locale = locale === "en" ? "fr" : "en";
  const items = (["pro", "perso"] as const).map((k) => ({ k, href: `/${locale}/${k}`, label: dict.nav[k] }));
  const section = /^\/(articles|cv)/.test(rest) ? "pro" : /^\/adventures/.test(rest) ? "perso" : rest.split("/")[1];

  const setLang = () => {
    document.cookie = `lang=${other}; path=/; max-age=31536000; samesite=lax`;
  };
  const toggleTheme = () => {
    const el = document.documentElement;
    const next = el.dataset.theme === "light" ? "dark" : "light";
    el.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch {}
  };

  return (
    <header className="site-header">
      <Link href={`/${locale}`} className="brand" aria-label="Mathieu Ract — home">
        <span className="brand-mark" aria-hidden>MR</span>
        <span className="brand-name">Mathieu Ract</span>
      </Link>
      <nav className="nav" aria-label="Main">
        {items.map(({ k, href, label }, i) => (
          <Link key={k} href={href} className={section === k ? "active" : ""}>
            <span className="nav-n" aria-hidden>0{i + 1}</span>
            <HoverScramble text={label} />
          </Link>
        ))}
      </nav>
      <div className="tools">
        <Link href={`/${other}${rest}`} onClick={setLang} className="tool" aria-label={other === "fr" ? "Passer en français" : "Switch to English"} hrefLang={other}>
          <span className={locale === "en" ? "on" : ""}>EN</span>/<span className={locale === "fr" ? "on" : ""}>FR</span>
        </Link>
        <button className="tool theme-toggle" onClick={toggleTheme} aria-label={dict.theme}>
          <span aria-hidden className="theme-icon" />
        </button>
      </div>
    </header>
  );
}
