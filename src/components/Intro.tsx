"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { scrambleTo } from "./Scramble";

const TOTAL = 3000; // ms, whole "meet me in brief" sequence

/** Full-screen opening sequence, once per browser session, skippable with any click or key. */
export function Intro({ label, lines, skip }: { label: string; lines: string[]; skip: string }) {
  const [state, setState] = useState<"play" | "out" | "gone">("play");
  const text = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);

  const finish = useCallback(() => {
    try { sessionStorage.setItem("intro", "1"); } catch {}
    document.documentElement.dataset.intro = "done";
    setState((s) => (s === "play" ? "out" : s));
    setTimeout(() => setState("gone"), 520);
  }, []);

  useEffect(() => {
    if (document.documentElement.dataset.intro === "done") { setState("gone"); return; }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { finish(); return; }
    document.body.style.overflow = "hidden";
    const per = TOTAL / lines.length;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let cancel = () => {};
    lines.forEach((line, i) =>
      timers.push(setTimeout(() => {
        setStep(i);
        cancel();
        if (text.current) cancel = scrambleTo(text.current, line.toUpperCase(), Math.min(480, per * 0.7));
      }, i * per)),
    );
    timers.push(setTimeout(finish, TOTAL));
    const key = () => finish();
    window.addEventListener("keydown", key);
    return () => {
      timers.forEach(clearTimeout);
      cancel();
      window.removeEventListener("keydown", key);
      document.body.style.overflow = "";
    };
  }, [lines, finish]);

  useEffect(() => { if (state !== "play") document.body.style.overflow = ""; }, [state]);

  if (state === "gone") return null;
  return (
    <div className={`intro ${state === "out" ? "intro-out" : ""}`} onClick={finish} role="presentation">
      <div className="intro-top">
        <span className="label">[ {label} ]</span>
        <span className="label">{String(step + 1).padStart(2, "0")} / {String(lines.length).padStart(2, "0")}</span>
      </div>
      <div className="intro-text" ref={text} aria-live="polite">{lines[0].toUpperCase()}</div>
      <div className="intro-bottom">
        <div className="intro-bar" ref={bar} aria-hidden>
          {Array.from({ length: 24 }, (_, i) => <i key={i} style={{ animationDelay: `${(i * TOTAL) / 24}ms` }} />)}
        </div>
        <button className="label intro-skip" onClick={finish}>{skip} ↵</button>
      </div>
    </div>
  );
}
