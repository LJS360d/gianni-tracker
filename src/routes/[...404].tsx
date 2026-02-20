import { A } from "@solidjs/router";
import { useI18n } from "~/i18n";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <main class="max-w-2xl mx-auto px-4 py-12 text-neutral-300 text-center">
      <h1 class="text-2xl font-light text-neutral-100 mb-6">404</h1>
      <p class="mb-8">Page not found.</p>
      <A href="/" class="text-neutral-400 hover:text-neutral-200 underline">
        {t("nav.home")}
      </A>
    </main>
  );
}
