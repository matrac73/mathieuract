import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/PrintButton";
import { Scramble } from "@/components/Scramble";
import { about, education, experience, extras, interests, languages, site, skills } from "@/content/site";
import { getDict, isLocale, type Dict, type Locale } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: getDict(isLocale(locale) ? locale : "en").profile.title };
}

function Timeline({ items, locale, d }: { items: typeof experience; locale: Locale; d: Dict }) {
  return (
    <ol className="timeline">
      {items.map((it) => (
        <li key={it.org + it.from}>
          <div className="tl-when label">{it.from === it.to ? it.from : `${it.from} — ${it.to ?? d.profile.present}`}</div>
          <div className="tl-body">
            <h3>{it.org}{it.wip && <span className="tag">WIP</span>}</h3>
            <p className="tl-role">{it.role[locale]} · <span className="dim">{it.place}</span></p>
            <ul>{it.bullets[locale].map((b) => <li key={b}>{b}</li>)}</ul>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = getDict(locale);
  const p = d.profile;
  const c = site.contacts;
  const links = [
    c.email && { label: "Email", text: c.email, href: `mailto:${c.email}` },
    c.linkedin && { label: "LinkedIn", text: c.linkedin.replace(/^https?:\/\/(www\.)?/, ""), href: c.linkedin },
    c.github && { label: "GitHub", text: c.github.replace(/^https?:\/\//, ""), href: c.github },
    c.strava && { label: "Strava", text: c.strava.replace(/^https?:\/\/(www\.)?/, ""), href: c.strava },
  ].filter(Boolean) as { label: string; text: string; href: string }[];

  return (
    <div className="page profile">
      <header className="page-head">
        <div>
          <p className="label">[ 01 ] {p.title}</p>
          <Scramble as="h1" className="display" text={site.name} />
          <p className="hero-role">{d.home.role}</p>
          <p className="muted">{site.location}</p>
        </div>
        <div className="profile-side">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="frame avatar" src="/avatar.jpg" alt={site.name} width={160} height={160} />
          <PrintButton label={p.download} />
        </div>
      </header>

      <section className="block">
        <h2 className="label">[ {p.about} ] <span className="tag">{p.wip}</span></h2>
        <div className="about">{about[locale].map((para) => <p key={para.slice(0, 24)}>{para}</p>)}</div>
      </section>

      <section className="block">
        <h2 className="label">[ {p.experience} ]</h2>
        <Timeline items={experience} locale={locale} d={d} />
      </section>

      <section className="block">
        <h2 className="label">[ {p.education} ]</h2>
        <Timeline items={education} locale={locale} d={d} />
      </section>

      <section className="block">
        <h2 className="label">[ {p.skills} ]</h2>
        <div className="skills">
          {skills.map((g) => (
            <div key={g.label.en} className="skill-group">
              <h3>{g.label[locale]}</h3>
              <ul className="tags">{g.items.map((s) => <li key={s}>{s}</li>)}</ul>
            </div>
          ))}
          <div className="skill-group">
            <h3>{p.languages}</h3>
            <ul className="langs">{languages.map((l) => <li key={l.name.en}><b>{l.name[locale]}</b> <span className="dim">{l.level[locale]}</span></li>)}</ul>
          </div>
        </div>
      </section>

      <section className="block">
        <h2 className="label">[ {p.interests} ]</h2>
        <Timeline items={extras} locale={locale} d={d} />
        <dl className="interests">
          {interests.map((i) => (
            <div key={i.label.en}><dt>{i.label[locale]}</dt><dd>{i.text[locale]}</dd></div>
          ))}
        </dl>
      </section>

      <section className="block">
        <h2 className="label">[ {p.contact} ]</h2>
        <ul className="contacts">
          {links.map((l) => (
            <li key={l.label}><span className="label">{l.label}</span><a href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{l.text}</a></li>
          ))}
        </ul>
      </section>
    </div>
  );
}
