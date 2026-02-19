import { Router, useLocation } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Show, Suspense } from "solid-js";
import { I18nProvider } from "~/i18n";
import Nav from "~/components/Nav";
import "./app.css";

const EMBED_PATHS = ["/embed", "/tv"];

export default function App() {
  return (
    <I18nProvider>
      <Router
        root={props => {
          const location = useLocation();
          const showNav = () => !EMBED_PATHS.includes(location.pathname);
          return (
            <div class="flex flex-col h-screen overflow-hidden">
              <Show when={showNav()}>
                <Nav />
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
