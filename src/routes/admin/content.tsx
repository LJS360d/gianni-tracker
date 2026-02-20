import { onCleanup, onMount } from "solid-js";
import { useI18n } from "~/i18n";
import "easymde/dist/easymde.min.css";

export default function AdminContent() {
  const { t } = useI18n();
  let container: HTMLTextAreaElement | undefined;
  let editor: import("easymde") | null = null;

  onMount(() => {
    if (!container) return;
    import("easymde").then(({ default: EasyMDE }) => {
      editor = new EasyMDE({
        element: container,
        initialValue: "",
        spellChecker: false,
        status: false,
        toolbar: ["bold", "italic", "heading", "|", "quote", "unordered-list", "ordered-list", "|", "link", "preview"]
      });
    });
    onCleanup(() => {
      editor?.toTextArea();
      editor = null;
    });
  });

  return (
    <div class="max-w-2xl text-neutral-300">
      <h2 class="text-xl font-light text-neutral-100 mb-4">{t("admin.content")}</h2>
      <p class="text-neutral-400 mb-4">{t("admin.contentIntro")}</p>
      <textarea ref={el => (container = el)} class="hidden" />
    </div>
  );
}
