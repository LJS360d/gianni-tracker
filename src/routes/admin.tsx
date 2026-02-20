import { A, useLocation } from "@solidjs/router";
import { ArrowLeft } from "lucide-solid";
import { useI18n } from "~/i18n";

export default function AdminLayout(props: { children?: import("solid-js").JSX.Element }) {
  const { t } = useI18n();
  const location = useLocation();
  const linkClass = (path: string) => {
    const isActive =
      path === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(path);
    return isActive ? "bg-neutral-800 text-white" : "text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200";
  };

  return (
    <div class="min-h-screen bg-[#0d0d0d] flex flex-col md:flex-row">
      <aside class="md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-neutral-800 bg-[#1a1a1a]">
        <div class="p-4">
          <A
            href="/"
            class="flex items-center gap-2 text-neutral-400 hover:text-white mb-6"
          >
            <ArrowLeft class="h-4 w-4" />
            <span>{t("admin.backToMap")}</span>
          </A>
          <nav class="flex flex-row md:flex-col gap-1">
            <A href="/admin" class={`block rounded px-3 py-2 text-sm ${linkClass("/admin")}`} end>
              {t("admin.config")}
            </A>
            <A href="/admin/media" class={`block rounded px-3 py-2 text-sm ${linkClass("/admin/media")}`}>
              {t("admin.media")}
            </A>
          </nav>
        </div>
      </aside>
      <main class="flex-1 p-6 md:p-8 overflow-auto">
        {props.children}
      </main>
    </div>
  );
}
