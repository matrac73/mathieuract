// Pixel pictograms for the kind of adventure (meta.json → "kind"), instead of spelling the sport out.
const ICONS: Record<string, string[]> = {
  bike: [
    "...........##....",
    ".....###....#....",
    "......#.....#....",
    "......#######....",
    "..#####...#.###..",
    ".#..##.#..##.#.#.",
    "#...#.##.##..#..#",
    "#..######.#..#..#",
    "#.....#...#.....#",
    ".#...#.....#...#.",
    "..###.......###..",
  ],
  run: [
    ".......##...",
    ".......##...",
    "....####....",
    "...#.###.##.",
    "..#..##.....",
    ".....###....",
    "....#...#...",
    "..##.....#..",
    ".#.......#..",
    ".........##.",
  ],
  ski: [
    "......##....",
    "......##....",
    "....###.....",
    "...#.###....",
    "..#..##.#...",
    ".....#.#.#..",
    "#...#...#...",
    ".##.#....#..",
    "...###....#.",
    "......#####.",
  ],
  hike: [
    ".....##.....",
    ".....##.....",
    "...####.....",
    "..##.##..#..",
    "..##.###.#..",
    ".....##.##..",
    "....#..#.#..",
    "....#..#.#..",
    "...#....##..",
    "..##....##..",
  ],
};

export function SportIcon({ kind, label }: { kind?: string; label: string }) {
  const rows = ICONS[kind ?? ""];
  if (!rows) return <>{label} ·</>;
  const w = rows[0].length, h = rows.length;
  return (
    <svg className="sport-icon" viewBox={`0 0 ${w} ${h}`} width={w * 2} height={h * 2} shapeRendering="crispEdges" role="img" aria-label={label}>
      <title>{label}</title>
      {rows.flatMap((row, y) => [...row].map((c, x) => (c === "#" ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" /> : null)))}
    </svg>
  );
}
