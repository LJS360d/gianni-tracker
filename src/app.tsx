import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import { I18nProvider } from "~/i18n";
import "./app.css";

export default function App() {
  return (
    <I18nProvider>
      <Router
        root={props => (
          <div class="flex flex-col h-screen overflow-hidden">
            <Suspense>{props.children}</Suspense>
          </div>
        )}
      >
        <FileRoutes />
      </Router>
    </I18nProvider>
  );
}
