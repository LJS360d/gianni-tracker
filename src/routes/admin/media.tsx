import { useI18n } from "~/i18n";

export default function AdminMedia() {
  const { t } = useI18n();
  return (
    <div class="max-w-xl text-neutral-300">
      <h2 class="text-xl font-light text-neutral-100 mb-4">{t("admin.media")}</h2>
      <p class="text-neutral-400">{t("admin.mediaIntro")}</p>
      <p class="mt-4 text-sm text-neutral-500">Upload UI and media list will be added here.</p>
    </div>
  );
}
