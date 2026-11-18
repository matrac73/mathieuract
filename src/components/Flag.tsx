// Round flags, drawn inline. Shown in black & white; the colour comes back on hover (see .flag in globals.css).

const star = (cx: number, cy: number, r: number, rot = 0) =>
  Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2 + rot, k = i % 2 ? r * 0.4 : r;
    return `${(cx + k * Math.cos(a)).toFixed(2)},${(cy + k * Math.sin(a)).toFixed(2)}`;
  }).join(" ");

const FLAGS: Record<string, React.ReactNode> = {
  fr: (
    <>
      <rect width="32" height="32" fill="#fff" />
      <rect width="10.67" height="32" fill="#0055a4" />
      <rect x="21.33" width="10.67" height="32" fill="#ef4135" />
    </>
  ),
  gb: (
    <>
      <rect width="32" height="32" fill="#012169" />
      <path d="M0 0L32 32M32 0L0 32" stroke="#fff" strokeWidth="6" />
      <path d="M0 0L32 32M32 0L0 32" stroke="#c8102e" strokeWidth="2.2" />
      <path d="M16 0V32M0 16H32" stroke="#fff" strokeWidth="10" />
      <path d="M16 0V32M0 16H32" stroke="#c8102e" strokeWidth="6" />
    </>
  ),
  es: (
    <>
      <rect width="32" height="32" fill="#aa151b" />
      <rect y="8" width="32" height="16" fill="#f1bf00" />
    </>
  ),
  cn: (
    <>
      <rect width="32" height="32" fill="#de2910" />
      <polygon points={star(11, 12, 5.2)} fill="#ffde00" />
      {[[18.5, 5.5, 0.4], [22, 9, 0.9], [22, 14, 0.1], [18.5, 17.5, 0.5]].map(([x, y, r]) => <polygon key={`${x}-${y}`} points={star(x, y, 1.8, r)} fill="#ffde00" />)}
    </>
  ),
};

export function Flag({ code }: { code: string }) {
  if (!FLAGS[code]) return null;
  return (
    <svg className="flag" viewBox="0 0 32 32" aria-hidden>
      <clipPath id={`flag-${code}`}><circle cx="16" cy="16" r="16" /></clipPath>
      <g clipPath={`url(#flag-${code})`}>{FLAGS[code]}</g>
    </svg>
  );
}
