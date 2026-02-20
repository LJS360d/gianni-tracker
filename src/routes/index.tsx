import { useSearchParams } from "@solidjs/router";
import { createSignal, lazy, onMount, Show, Suspense } from "solid-js";
import { useI18n } from "~/i18n";

const Map = lazy(() => import("~/components/Map"));

type MapMode = "default" | "embed" | "tv";

function modeFromParams(params: { mode?: string | string[] }): MapMode {
  const raw = params.mode;
  const m = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined;
  const s = m?.toLowerCase();
  if (s === "embed" || s === "tv") return s;
  return "default";
}

export default function Home() {
  const [params] = useSearchParams();
  const { t } = useI18n();
  const [mounted, setMounted] = createSignal(false);
  onMount(() => setMounted(true));

  const mode = () => modeFromParams(params);
  const isTv = () => mode() === "tv";
  const isEmbedLike = () => mode() === "embed" || mode() === "tv";

  const initialCenter = (): [number, number] =>
    isEmbedLike() ? [45.46, 9.19] : [48, 80];
  const initialZoom = () => (isEmbedLike() ? 5 : 3);
  const animateTrack = () => !isEmbedLike();

  const loadingClass = () =>
    isTv()
      ? "tv-loading grid place-items-center h-full text-white text-2xl font-semibold"
      : "grid place-items-center h-full text-neutral-400";
  const mainClass = () =>
    isTv()
      ? "tv-display flex flex-col flex-1 min-h-0 bg-[#0d0d0d]"
      : "flex flex-col flex-1 min-h-0 bg-[#0d0d0d]";

  const loading = <div class={loadingClass()}>{t("map.loading")}</div>;

  return (
    <main class={mainClass()}>
      <div class="flex-1 min-h-0 relative">
        <Show when={mounted()} fallback={loading}>
          <Suspense fallback={loading}>
            <Map
              class="absolute inset-0"
              initialCenter={initialCenter()}
              initialZoom={initialZoom()}
              animateTrack={animateTrack()}
            />
          </Suspense>
        </Show>
      </div>
    </main>
  );
}
