"use client";

import { createElement, useEffect, useRef } from "react";

// Glyphs with no line-break opportunity and no ligature partner: a scrambled word keeps the
// exact footprint of the real one (same number of cells, same wrapping), so nothing around it moves.
const GLYPHS = "#01XZ@&*";
const rnd = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];
const LETTER = /[\p{L}\p{N}]/u;

/** Imperative scramble: letters and digits flicker then resolve left-to-right into `to`; spaces and punctuation never move. Returns a cancel fn. */
export function scrambleTo(el: HTMLElement, to: string, duration = 550) {
  if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    el.textContent = to;
    return () => {};
  }
  const start = performance.now();
  let raf = 0;
  let last = 0;
  const tick = (now: number) => {
    const p = Math.min(1, (now - start) / duration);
    if (now - last > 32 || p === 1) {
      last = now;
      const solved = Math.floor(p * to.length);
      let out = to.slice(0, solved);
      for (let i = solved; i < to.length; i++) out += LETTER.test(to[i]) ? rnd() : to[i];
      el.textContent = out;
    }
    if (p < 1) raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}
type Props = { text: string; as?: string; className?: string; duration?: number; delay?: number; onMount?: boolean };

/** Renders `text`; whenever it changes (and optionally on mount), it scrambles into place. */
export function Scramble({ text, as = "span", className, duration = 550, delay = 0, onMount = true }: Props) {
  const ref = useRef<HTMLElement>(null);
  const first = useRef(true);
  // React only ever renders the initial text; later changes are written imperatively,
  // so the scramble never fights React's reconciliation of the text node.
  const initial = useRef(text).current;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.setAttribute("aria-label", text);
    if (first.current) {
      first.current = false;
      if (!onMount) return;
    }
    let cancel = () => {};
    const t = setTimeout(() => (cancel = scrambleTo(el, text, duration)), delay);
    return () => {
      clearTimeout(t);
      cancel();
      el.textContent = text;
    };
  }, [text, duration, delay, onMount]);
  return createElement(as, { ref, className, suppressHydrationWarning: true }, initial);
}

/**
 * Link/label that re-scrambles on hover. With `fixed`, the real text stays in the flow (invisible) and the
 * flickering copy is laid over it: whatever the glyphs do, the box cannot change size.
 */
export function HoverScramble({ text, className, fixed }: { text: string; className?: string; fixed?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const cancel = useRef(() => {});
  const enter = () => {
    cancel.current();
    const el = ref.current;
    if (!el) return;
    const stop = scrambleTo(el, text, 380);
    cancel.current = () => { stop(); el.textContent = text; };
  };
  if (fixed)
    return (
      <span className={`hs ${className ?? ""}`} aria-label={text} onPointerEnter={enter}>
        <span className="hs-ghost" aria-hidden>{text}</span>
        <span className="hs-live" aria-hidden ref={ref}>{text}</span>
      </span>
    );
  return <span ref={ref} className={className} aria-label={text} onPointerEnter={enter}>{text}</span>;
}
/** Page title whose full stops are drawn as square pixels (the dot-matrix face draws them as a cross). */
export function DotTitle({ text, className }: { text: string; className?: string }) {
  const parts = text.split(".");
  return (
    <h1 className={className} aria-label={text}>
      {parts.map((part, i) => (
        <span key={i} aria-hidden>
          {part && <Scramble text={part} />}
          {i < parts.length - 1 && <i className="dot-sq" />}
        </span>
      ))}
    </h1>
  );
}