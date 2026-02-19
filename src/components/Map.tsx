import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { createSignal, onCleanup, onMount } from "solid-js";
import MediaModal, { type MediaItem } from "~/components/MediaModal";

const CARTO_DARK =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

type TrackPoint = { lat: number; lng: number; device_ts: number };

type MediaEntry = { pointIndex: number; type: "image" | "video"; url: string; title: string; description: string };

const REVEAL_DURATION_MS = 1000;

type Props = {
  class?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
  animateTrack?: boolean;
};

export default function Map(props: Props) {
  let container: HTMLDivElement | undefined;
  let map: L.Map | null = null;
  let polyline: L.Polyline | null = null;
  let revealFrameId: number | null = null;
  const mediaMarkers: L.CircleMarker[] = [];
  const [modalMedia, setModalMedia] = createSignal<MediaItem | null>(null);
  const animate = props.animateTrack !== false;

  const center: [number, number] = props.initialCenter ?? [45.46, 9.19];
  const zoom = props.initialZoom ?? 5;

  onMount(() => {
    if (!container) return;
    map = L.map(container, {
      center,
      zoom,
      zoomControl: false,
      attributionControl: false
    });
    L.control.zoom({ position: "topright" }).addTo(map);
    L.tileLayer(CARTO_DARK, {
      subdomains: "abcd",
      maxZoom: 19
    }).addTo(map);

    fetch("/api/track")
      .then(r => r.json())
      .then((data: { points?: TrackPoint[]; media?: MediaEntry[] }) => {
        const points = data?.points ?? [];
        const media = data?.media ?? [];
        if (points.length === 0) return;
        const latLngs: L.LatLngExpression[] = points.map(p => [p.lat, p.lng]);
        const bounds = L.latLngBounds(latLngs);

        const addMediaMarkers = () => {
          for (const entry of media) {
            if (entry.pointIndex >= points.length) continue;
            const p = points[entry.pointIndex];
            const marker = L.circleMarker([p.lat, p.lng], {
              radius: 8,
              fillColor: "#fff",
              color: "#333",
              weight: 2,
              fillOpacity: 0.9
            }).addTo(map!);
            mediaMarkers.push(marker);
            marker.on("click", () => {
              setModalMedia({
                type: entry.type,
                url: entry.url,
                title: entry.title,
                description: entry.description
              });
            });
          }
        };

        if (animate && points.length > 1) {
          polyline = L.polyline([latLngs[0]], { color: "#fff", weight: 3 }).addTo(map!);
          const start = performance.now();
          const tick = () => {
            const elapsed = performance.now() - start;
            const t = Math.min(1, elapsed / REVEAL_DURATION_MS);
            const targetIndex = 1 + Math.floor(t * (points.length - 1));
            const revealed = latLngs.slice(0, targetIndex);
            polyline!.setLatLngs(revealed);
            if (t < 1) {
              revealFrameId = requestAnimationFrame(tick);
            } else {
              addMediaMarkers();
              map!.fitBounds(bounds, { padding: [20, 20], maxZoom: 10 });
            }
          };
          revealFrameId = requestAnimationFrame(tick);
        } else {
          polyline = L.polyline(latLngs, { color: "#fff", weight: 3 }).addTo(map!);
          addMediaMarkers();
          map!.fitBounds(bounds, { padding: [20, 20], maxZoom: 10 });
        }
      })
      .catch(() => {});

    const onResize = () => map?.invalidateSize();
    window.addEventListener("resize", onResize);
    onCleanup(() => {
      if (revealFrameId != null) cancelAnimationFrame(revealFrameId);
      window.removeEventListener("resize", onResize);
      for (const m of mediaMarkers) m.remove();
      mediaMarkers.length = 0;
      polyline?.remove();
      polyline = null;
      map?.remove();
      map = null;
    });
  });

  return (
    <>
      <div
        ref={el => (container = el)}
        class={props.class}
        style={{ width: "100%", height: "100%", "min-height": "200px" }}
        aria-hidden="true"
      />
      <MediaModal media={modalMedia} onClose={() => setModalMedia(null)} />
    </>
  );
}
