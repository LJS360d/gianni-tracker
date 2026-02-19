import { createSignal, lazy, onMount, Show, Suspense } from "solid-js";
import { useI18n } from "~/i18n";

const Map = lazy(() => import("~/components/Map"));

export default function Embed() {
  const { t } = useI18n();
  const [mounted, setMounted] = createSignal(false);
  onMount(() => setMounted(true));

  const loading = <div class="grid place-items-center h-full text-neutral-400">{t("map.loading")}</div>;

  return (
    <main class="flex flex-col flex-1 min-h-0 bg-[#0d0d0d]">
      <div class="flex-1 min-h-0 relative">
        <Show when={mounted()} fallback={loading}>
          <Suspense fallback={loading}>
            <Map class="absolute inset-0" initialCenter={[45.46, 9.19]} initialZoom={5} animateTrack={false} />
          </Suspense>
        </Show>
      </div>
    </main>
  );
}
