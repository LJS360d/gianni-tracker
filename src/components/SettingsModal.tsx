import { A } from "@solidjs/router";
import type { Accessor } from "solid-js";
import { Show } from "solid-js";
import { useI18n } from "~/i18n";

type Props = {
  open: Accessor<boolean>;
  onClose: () => void;
};

export default function SettingsModal(props: Props) {
  const { t, locale, setLocale } = useI18n();

  return (
    <Show when={props.open()}>
      <div
        class="fixed inset-0 z-[9998] flex items-start justify-end pt-14 pr-3"
        role="dialog"
        aria-modal="true"
        aria-label={t("settings.title")}
      >
        <div
          class="absolute inset-0 -z-10"
          onClick={() => props.onClose()}
          aria-hidden="true"
        />
        <div
          class="min-w-[200px] rounded-lg border border-neutral-700 bg-[#1a1a1a] shadow-xl"
          onClick={e => e.stopPropagation()}
        >
          <div class="border-b border-neutral-700 px-4 py-3">
            <span class="text-sm font-medium text-neutral-300">{t("settings.title")}</span>
          </div>
          <div class="p-2">
            <A
              href="/admin"
              class="block rounded px-3 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-800"
              onClick={() => props.onClose()}
            >
              {t("nav.admin")}
            </A>
            <div class="mt-2 flex gap-1 rounded p-1">
              <button
                type="button"
                class={`flex-1 rounded px-2 py-1.5 text-sm ${locale() === "it" ? "bg-neutral-700 text-white" : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"}`}
                onClick={() => setLocale("it")}
                aria-pressed={locale() === "it"}
              >
                IT
              </button>
              <button
                type="button"
                class={`flex-1 rounded px-2 py-1.5 text-sm ${locale() === "en" ? "bg-neutral-700 text-white" : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"}`}
                onClick={() => setLocale("en")}
                aria-pressed={locale() === "en"}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
}
