import { Router, useLocation, useSearchParams } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Settings } from "lucide-solid";
import { createSignal, Show, Suspense } from "solid-js";
import { I18nProvider } from "~/i18n";
import SettingsModal from "~/components/SettingsModal";
import "./app.css";

export default function App() {
  const [settingsOpen, setSettingsOpen] = createSignal(false);

  return (
    <I18nProvider>
      <Router
        root={props => {
          const location = useLocation();
          const [params] = useSearchParams();
          const embedLikeMode = () => {
            const raw = params.mode;
            const m = (typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined)?.toLowerCase();
            return m === "embed" || m === "tv";
          };
          const showChrome = () =>
            location.pathname !== "/" || !embedLikeMode();
          return (
            <div class="flex flex-col h-screen overflow-hidden relative">
              <Show when={showChrome()}>
                <button
                  type="button"
                  class="fixed top-3 right-3 z-[9997] flex h-10 w-10 items-center justify-center rounded-full bg-[#1a1a1a] border border-neutral-700 text-neutral-400 hover:text-white hover:bg-neutral-800 shadow-lg"
                  aria-label="Settings"
                  onClick={() => setSettingsOpen(true)}
                >
                  <Settings class="h-5 w-5" />
                </button>
                <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
              </Show>
              <Suspense>{props.children}</Suspense>
            </div>
          );
        }}
      >
        <FileRoutes />
      </Router>
    </I18nProvider>
  );
}
