import { A, useLocation } from "@solidjs/router";
import { useI18n } from "~/i18n";

export default function Nav() {
  const location = useLocation();
  const { t, locale, setLocale } = useI18n();
  const active = (path: string) =>
    path === location.pathname ? "border-neutral-300 text-neutral-100" : "border-transparent text-neutral-400 hover:text-neutral-200";
  return (
    <nav class="bg-[#1a1a1a] border-b border-neutral-800 shrink-0">
      <div class="container flex items-center justify-between p-3">
        <ul class="flex items-center gap-4 sm:gap-8">
          <li class={`border-b-2 ${active("/")}`}>
            <A href="/">{t("nav.home")}</A>
          </li>
          <li class={`border-b-2 ${active("/about")}`}>
            <A href="/about">{t("nav.about")}</A>
          </li>
        </ul>
        <div class="flex gap-2 text-sm text-neutral-500">
          <button
            type="button"
            class={locale() === "it" ? "text-neutral-200" : "hover:text-neutral-300"}
            onClick={() => setLocale("it")}
            aria-pressed={locale() === "it"}
          >
            IT
          </button>
          <span aria-hidden="true">|</span>
          <button
            type="button"
            class={locale() === "en" ? "text-neutral-200" : "hover:text-neutral-300"}
            onClick={() => setLocale("en")}
            aria-pressed={locale() === "en"}
          >
            EN
          </button>
        </div>
      </div>
    </nav>
  );
}
