import { NextRequest, NextResponse } from "next/server";

// First visit: pick the language from where the visitor connects from
// (Vercel's geo-IP header), then remember any manual switch in a cookie.
const FRENCH_SPEAKING = new Set(["FR", "BE", "LU", "MC", "RE", "GP", "MQ", "GF", "YT", "NC", "PF", "PM", "BL", "MF", "WF"]);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (/^\/(en|fr)(\/|$)/.test(pathname)) return NextResponse.next();

  const saved = req.cookies.get("lang")?.value;
  const country = req.headers.get("x-vercel-ip-country");
  let locale: string;
  if (saved === "en" || saved === "fr") locale = saved;
  else if (country) locale = FRENCH_SPEAKING.has(country.toUpperCase()) ? "fr" : "en";
  else locale = (req.headers.get("accept-language") ?? "").toLowerCase().startsWith("fr") ? "fr" : "en"; // local dev

  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/((?!_next|api|.*\\..*).*)"] };
