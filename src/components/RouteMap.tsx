"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LMap, Polyline, CircleMarker, TileLayer, LayerGroup } from "leaflet";
import "leaflet/dist/leaflet.css";

type Layer = "day" | "sharp" | "map";
type Props = {
  track: [number, number][];
  date: string; // YYYY-MM-DD, drives the "that day" satellite pass
  cursor?: [number, number] | null;
  pins?: { at: [number, number]; label: string }[];
  labels: { day: string; sharp: string; map: string; color: string };
};

const SOURCES: Record<Layer, (date: string, dark: boolean) => { url: string; maxNativeZoom: number; attribution: string }> = {
  day: (date) => ({
    url: `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_NOAA20_CorrectedReflectance_TrueColor/default/${date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`,
    maxNativeZoom: 9,
    attribution: "Imagery: NASA GIBS / VIIRS (NOAA-20)",
  }),
  sharp: () => ({
    url: "https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2024_3857/default/g/{z}/{y}/{x}.jpg",
    maxNativeZoom: 15,
    attribution: 'Sentinel-2 cloudless 2024 by <a href="https://s2maps.eu">EOX</a> (modified Copernicus Sentinel data)',
  }),
  map: (_d, dark) => ({
    url: `https://{s}.basemaps.cartocdn.com/${dark ? "dark_all" : "light_all"}/{z}/{x}/{y}{r}.png`,
    maxNativeZoom: 18,
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>',
  }),
};

// split the line where the recording jumps (e.g. a train transfer)
function segments(track: [number, number][]) {
  const out: [number, number][][] = [[]];
  for (let i = 0; i < track.length; i++) {
    if (i > 0) {
      const [a, b] = [track[i - 1], track[i]];
      const km = Math.hypot((b[0] - a[0]) * 111, (b[1] - a[1]) * 111 * Math.cos((a[0] * Math.PI) / 180));
      if (km > 2.5) out.push([]);
    }
    out[out.length - 1].push(track[i]);
  }
  return out.filter((s) => s.length > 1);
}

export function RouteMap({ track, date, cursor, pins, labels }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<LMap | null>(null);
  const L = useRef<typeof import("leaflet") | null>(null);
  const tiles = useRef<TileLayer | null>(null);
  const route = useRef<LayerGroup | null>(null);
  const dot = useRef<CircleMarker | null>(null);
  const [ready, setReady] = useState(false);
  const [layer, setLayer] = useState<Layer>("day");
  const [color, setColor] = useState(false);
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    let dead = false;
    import("leaflet").then((mod) => {
      if (dead || !el.current) return;
      L.current = mod;
      map.current = mod.map(el.current, { zoomControl: true, scrollWheelZoom: false, attributionControl: true, zoomSnap: 0.25 });
      map.current.attributionControl.setPrefix(false);
      route.current = mod.layerGroup().addTo(map.current);
      setReady(true);
    });
    const read = () => setTheme(document.documentElement.dataset.theme ?? "dark");
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => { dead = true; mo.disconnect(); map.current?.remove(); map.current = null; };
  }, []);

  useEffect(() => {
    if (!ready || !map.current || !L.current) return;
    const src = SOURCES[layer](date, theme !== "light");
    tiles.current?.remove();
    tiles.current = L.current.tileLayer(src.url, { maxNativeZoom: src.maxNativeZoom, maxZoom: 15, attribution: src.attribution, subdomains: "abcd" }).addTo(map.current);
    tiles.current.bringToBack();
  }, [ready, layer, date, theme]);

  useEffect(() => {
    if (!ready || !map.current || !L.current || !route.current) return;
    const lf = L.current;
    route.current.clearLayers();
    const cs = getComputedStyle(document.documentElement);
    const accent = cs.getPropertyValue("--accent").trim() || "#ff5a1f";
    const lines: Polyline[] = [];
    for (const seg of segments(track)) {
      lf.polyline(seg, { color: "#000", weight: 6, opacity: 0.85 }).addTo(route.current);
      lines.push(lf.polyline(seg, { color: "#fff", weight: 2.5, opacity: 1 }).addTo(route.current));
    }
    const mark = (p: [number, number], fill: string) =>
      lf.circleMarker(p, { radius: 5, color: "#000", weight: 2, fillColor: fill, fillOpacity: 1 }).addTo(route.current!);
    if (track.length) { mark(track[0], "#fff"); mark(track[track.length - 1], accent); }
    for (const p of pins ?? []) {
      lf.marker(p.at, { icon: lf.divIcon({ className: "map-pin", html: `<span>▲ ${p.label}</span>`, iconSize: [0, 0] }), interactive: false }).addTo(route.current);
    }
    dot.current = lf.circleMarker(track[0] ?? [0, 0], { radius: 7, color: "#000", weight: 2, fillColor: accent, fillOpacity: 0, opacity: 0 }).addTo(route.current);
    if (lines.length) {
      const b = lf.featureGroup(lines).getBounds();
      map.current.fitBounds(b, { padding: [28, 28], animate: false });
    }
  }, [ready, track, pins]);

  useEffect(() => {
    if (!dot.current) return;
    if (cursor) dot.current.setLatLng(cursor).setStyle({ opacity: 1, fillOpacity: 1 });
    else dot.current.setStyle({ opacity: 0, fillOpacity: 0 });
  }, [cursor]);

  return (
    <div className={`map-wrap ${color ? "map-color" : ""}`}>
      <div ref={el} className="map" />
      <div className="map-tools">
        {(["day", "sharp", "map"] as const).map((k) => (
          <button key={k} className={`chip ${layer === k ? "on" : ""}`} onClick={() => setLayer(k)}>{labels[k]}</button>
        ))}
        <button className={`chip ${color ? "on" : ""}`} onClick={() => setColor((v) => !v)} aria-pressed={color}>{labels.color}</button>
      </div>
    </div>
  );
}
