import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { onCleanup, onMount } from "solid-js";

const CARTO_DARK =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

type Props = {
  class?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
};

export default function Map(props: Props) {
  let container: HTMLDivElement | undefined;
  let map: L.Map | null = null;

  const center: [number, number] = props.initialCenter ?? [45.46, 9.19];
  const zoom = props.initialZoom ?? 5;

  onMount(() => {
    if (!container) return;
    map = L.map(container, {
      center,
      zoom,
      zoomControl: false
    });
    L.control.zoom({ position: "topright" }).addTo(map);
    L.tileLayer(CARTO_DARK, {
      attribution: ATTRIBUTION,
      subdomains: "abcd",
      maxZoom: 19
    }).addTo(map);
    const onResize = () => map?.invalidateSize();
    window.addEventListener("resize", onResize);
    onCleanup(() => {
      window.removeEventListener("resize", onResize);
      map?.remove();
      map = null;
    });
  });

  return (
    <div
      ref={el => (container = el)}
      class={props.class}
      style={{ width: "100%", height: "100%", "min-height": "200px" }}
      aria-hidden="true"
    />
  );
}
