import { useStore } from "@nanostores/solid";
import { createEffect, createSignal, onCleanup } from "solid-js";
import { useI18n } from "~/i18n";
import "easymde/dist/easymde.min.css";
import { apiHeaders } from "~/lib/admin-client";
import { adminTokenStore } from "~/lib/admin-store";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-solid";

type PointOption = { id: number; device_ts: number; lat: number; lng: number };
type MediaRow = {
  id: number;
  point_id: number;
  point_device_ts: number | null;
  point_lat: number | null;
  point_lng: number | null;
  type: string;
  url: string;
  title: string;
  description: string;
  created_at: number;
  taken_at: number | null;
  taken_lat: number | null;
  taken_lng: number | null;
};

type SortCol = "id" | "created_at" | "taken_at" | "title";

function formatPoint(p: PointOption) {
  const d = new Date(p.device_ts);
  return `#${p.id} ${d.toLocaleDateString()} ${p.lat.toFixed(2)},${p.lng.toFixed(2)}`;
}

function formatTs(sec: number | null): string {
  if (sec == null) return "—";
  return new Date(sec * 1000).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
}

export default function AdminMedia() {
  const { t } = useI18n();
  const token = useStore(adminTokenStore);
  const [mediaList, setMediaList] = createSignal<MediaRow[]>([]);
  const [points, setPoints] = createSignal<PointOption[]>([]);
  const [error, setError] = createSignal<string | null>(null);
  const [showModal, setShowModal] = createSignal(false);
  const [editingRow, setEditingRow] = createSignal<MediaRow | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = createSignal<number | null>(null);

  const [page, setPage] = createSignal(0);
  const [pageSize, setPageSize] = createSignal(25);
  const [total, setTotal] = createSignal(0);
  const [sort, setSort] = createSignal<SortCol>("created_at");
  const [order, setOrder] = createSignal<"asc" | "desc">("desc");

  const [formPointId, setFormPointId] = createSignal<number | null>(null);
  const [formUrl, setFormUrl] = createSignal("");
  const [formTitle, setFormTitle] = createSignal("");
  const [formDescription, setFormDescription] = createSignal("");
  const [formTakenAt, setFormTakenAt] = createSignal<number | null>(null);
  const [formTakenLat, setFormTakenLat] = createSignal<number | null>(null);
  const [formTakenLng, setFormTakenLng] = createSignal<number | null>(null);
  const [formSubmitting, setFormSubmitting] = createSignal(false);
  const [uploading, setUploading] = createSignal(false);

  let mdeContainer: HTMLTextAreaElement | undefined;
  let mdeInstance: import("easymde") | null = null;

  function loadMedia() {
    const tkn = token();
    if (!tkn) return;
    const limit = pageSize();
    const offset = page() * limit;
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset), sort: sort(), order: order() });
    fetch(`/api/admin/media?${params}`, { headers: apiHeaders(tkn) })
      .then(r => {
        if (r.status === 401) return null;
        const totalHeader = r.headers.get("X-Total-Count");
        if (totalHeader != null) setTotal(parseInt(totalHeader, 10) || 0);
        return r.json();
      })
      .then(data => Array.isArray(data) && setMediaList(data));
  }

  function loadPoints() {
    const tkn = token();
    if (!tkn) return;
    fetch("/api/admin/points?limit=300", { headers: apiHeaders(tkn) })
      .then(r => r.json())
      .then(data => Array.isArray(data) && setPoints(data));
  }

  createEffect(() => {
    if (!token()) return;
    loadPoints();
  });
  createEffect(() => {
    if (!token()) return;
    loadMedia();
  });

  function openCreate() {
    const pts = points();
    setEditingRow(null);
    setFormPointId(pts[0]?.id ?? null);
    setFormUrl("");
    setFormTitle("");
    setFormDescription("");
    setFormTakenAt(null);
    setFormTakenLat(null);
    setFormTakenLng(null);
    setError(null);
    setShowModal(true);
  }

  function openEdit(row: MediaRow) {
    setEditingRow(row);
    setFormPointId(row.point_id);
    setFormUrl(row.url);
    setFormTitle(row.title);
    setFormDescription(row.description);
    setError(null);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingRow(null);
  }

  createEffect(() => {
    if (!showModal() || !mdeContainer) return;
    const initial = formDescription();
    import("easymde").then(({ default: EasyMDE }) => {
      if (!showModal() || !mdeContainer) return;
      mdeInstance = new EasyMDE({
        element: mdeContainer,
        initialValue: initial ?? "",
        spellChecker: false,
        status: false,
        toolbar: ["bold", "italic", "heading", "|", "quote", "unordered-list", "ordered-list", "|", "link", "preview"]
      });
    });
    onCleanup(() => {
      if (mdeInstance) {
        mdeInstance.toTextArea();
        mdeInstance = null;
      }
    });
  });

  function handleFileChange(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !token()) return;
    setUploading(true);
    setError(null);
    const fd = new FormData();
    fd.set("file", file);
    fetch("/api/admin/media/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${token()}` },
      body: fd
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error);
        else {
          if (data.url) setFormUrl(data.url);
          if (data.taken_at != null) setFormTakenAt(data.taken_at);
          if (data.taken_lat != null) setFormTakenLat(data.taken_lat);
          if (data.taken_lng != null) setFormTakenLng(data.taken_lng);
        }
      })
      .finally(() => {
        setUploading(false);
        input.value = "";
      });
  }

  function handleSubmit(e: Event) {
    e.preventDefault();
    const tkn = token();
    const pointId = formPointId();
    if (!tkn || pointId == null) {
      setError("Select a point");
      return;
    }
    const url = formUrl().trim();
    if (!url) {
      setError("Add a link or upload a file");
      return;
    }
    const title = formTitle().trim();
    const description = mdeInstance?.value() ?? formDescription();
    setFormSubmitting(true);
    setError(null);
    const row = editingRow();
    if (row) {
      fetch(`/api/admin/media/${row.id}`, {
        method: "PATCH",
        headers: apiHeaders(tkn),
        body: JSON.stringify({ point_id: pointId, url, title, description })
      })
        .then(r => r.json())
        .then(data => {
          if (data.error) setError(data.error);
          else {
            closeModal();
            loadMedia();
          }
        })
        .finally(() => setFormSubmitting(false));
    } else {
      const payload: Record<string, unknown> = { point_id: pointId, url, title, description };
      const ta = formTakenAt();
      const tlat = formTakenLat();
      const tlng = formTakenLng();
      if (ta != null) payload.taken_at = ta;
      if (tlat != null) payload.taken_lat = tlat;
      if (tlng != null) payload.taken_lng = tlng;
      fetch("/api/admin/media", {
        method: "POST",
        headers: apiHeaders(tkn),
        body: JSON.stringify(payload)
      })
        .then(r => r.json())
        .then(data => {
          if (data.error) setError(data.error);
          else {
            closeModal();
            loadMedia();
          }
        })
        .finally(() => setFormSubmitting(false));
    }
  }

  function confirmDelete(id: number) {
    setDeleteConfirmId(id);
  }

  function cancelDelete() {
    setDeleteConfirmId(null);
  }

  function doDelete() {
    const id = deleteConfirmId();
    const tkn = token();
    if (id == null || !tkn) return;
    fetch(`/api/admin/media/${id}`, { method: "DELETE", headers: apiHeaders(tkn) }).then(r => {
      if (r.status === 204 || r.ok) {
        setDeleteConfirmId(null);
        loadMedia();
      }
    });
  }

  function setSortCol(col: SortCol) {
    if (sort() === col) setOrder(o => (o === "asc" ? "desc" : "asc"));
    else setSort(col);
    setPage(0);
  }
  const totalPages = () => Math.max(1, Math.ceil(total() / pageSize()));
  const from = () => total() === 0 ? 0 : page() * pageSize() + 1;
  const to = () => Math.min((page() + 1) * pageSize(), total());

  if (!token()) {
    return (
      <div class="max-w-xl text-neutral-300">
        <h2 class="text-xl font-light text-neutral-100 mb-4">{t("admin.media")}</h2>
        <p class="text-neutral-400">{t("admin.mediaIntro")}</p>
        <p class="mt-4 text-sm text-neutral-500">Log in from Config to manage media.</p>
      </div>
    );
  }

  const pointsList = () => points();
  const pointLabel = (id: number) => {
    const p = pointsList().find(x => x.id === id);
    return p ? formatPoint(p) : `#${id}`;
  };

  return (
    <div class="max-w-4xl text-neutral-300">
      <h2 class="text-xl font-light text-neutral-100 mb-4">{t("admin.media")}</h2>
      <p class="text-neutral-400 mb-4">{t("admin.mediaIntro")}</p>
      {error() && <p class="mb-4 text-red-400">{error()}</p>}

      <button
        type="button"
        onClick={openCreate}
        class="mb-4 px-4 py-2 rounded bg-neutral-700 hover:bg-neutral-600 text-neutral-100"
      >
        {t("admin.addMedia")}
      </button>

      {showModal() && (
        <div
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          onClick={e => e.target === e.currentTarget && closeModal()}
        >
          <div class="bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div class="p-4 border-b border-neutral-700">
              <h3 class="text-lg text-neutral-100">{editingRow() ? t("admin.editMedia") : t("admin.addMedia")}</h3>
            </div>
            <form onSubmit={handleSubmit} class="p-4 overflow-y-auto space-y-3 flex-1">
              <div>
                <label class="block text-sm text-neutral-400 mb-1">{t("admin.point")}</label>
                <select
                  required
                  value={formPointId() ?? ""}
                  onInput={e => setFormPointId(parseInt(e.currentTarget.value, 10) || null)}
                  class="w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-600 text-neutral-100"
                >
                  <option value="">—</option>
                  {pointsList().map(p => (
                    <option value={p.id}>{formatPoint(p)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label class="block text-sm text-neutral-400 mb-1">{t("admin.url")}</label>
                <input
                  type="text"
                  value={formUrl()}
                  onInput={e => setFormUrl(e.currentTarget.value)}
                  class="w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-600 text-neutral-100 mb-2"
                  placeholder="https://… or /media/…"
                />
                <div class="flex items-center gap-2 text-sm text-neutral-500">
                  <span>{t("admin.or")}</span>
                  <label class="cursor-pointer px-3 py-1.5 rounded bg-neutral-700 hover:bg-neutral-600 text-neutral-200">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      class="sr-only"
                      onChange={handleFileChange}
                      disabled={uploading()}
                    />
                    {uploading() ? "…" : t("admin.uploadFile")}
                  </label>
                </div>
              </div>
              <div>
                <label class="block text-sm text-neutral-400 mb-1">{t("admin.title")}</label>
                <input
                  type="text"
                  value={formTitle()}
                  onInput={e => setFormTitle(e.currentTarget.value)}
                  class="w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-600 text-neutral-100"
                />
              </div>
              <div>
                <label class="block text-sm text-neutral-400 mb-1">{t("admin.description")}</label>
                <textarea ref={el => (mdeContainer = el)} class="hidden" />
              </div>
              <div class="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={formSubmitting()}
                  class="px-4 py-2 rounded bg-neutral-700 hover:bg-neutral-600 text-neutral-100 disabled:opacity-50"
                >
                  {t("admin.save")}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  class="px-4 py-2 rounded bg-neutral-800 text-neutral-400 hover:text-neutral-200"
                >
                  {t("admin.cancel")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div class="mb-4 flex flex-wrap items-center gap-4">
        <label class="flex items-center gap-2 text-sm text-neutral-400">
          {t("admin.pageSize")}
          <select
            value={pageSize()}
            onInput={e => {
              setPageSize(Number((e.target as HTMLSelectElement).value));
              setPage(0);
            }}
            class="rounded bg-neutral-800 border border-neutral-600 text-neutral-100 px-2 py-1"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </label>
        <span class="text-sm text-neutral-500">
          {from()}–{to()} {t("admin.of")} {total()}
        </span>
        <div class="flex gap-1">
          <button
            type="button"
            disabled={page() <= 0}
            onClick={() => setPage(p => Math.max(0, p - 1))}
            class="rounded px-2 py-1 bg-neutral-700 text-neutral-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <ChevronLeftIcon class="w-4 h-4" />
            {t("admin.prev")}
          </button>
          <button
            type="button"
            disabled={page() >= totalPages() - 1}
            onClick={() => setPage(p => Math.min(totalPages() - 1, p + 1))}
            class="rounded px-2 py-1 bg-neutral-700 text-neutral-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            {t("admin.next")}
            <ChevronRightIcon class="w-4 h-4" />
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-neutral-700 text-left text-neutral-400">
              <th class="py-2 pr-2">
                <button type="button" onClick={() => setSortCol("id")} class="hover:text-neutral-200 text-left">
                  ID {sort() === "id" ? (order() === "asc" ? "↑" : "↓") : ""}
                </button>
              </th>
              <th class="py-2 pr-2">{t("admin.point")}</th>
              <th class="py-2 pr-2">{t("admin.type")}</th>
              <th class="py-2 pr-2">
                <button type="button" onClick={() => setSortCol("title")} class="hover:text-neutral-200 text-left">
                  {t("admin.title")} {sort() === "title" ? (order() === "asc" ? "↑" : "↓") : ""}
                </button>
              </th>
              <th class="py-2 pr-2">
                <button type="button" onClick={() => setSortCol("created_at")} class="hover:text-neutral-200 text-left">
                  {t("admin.created")} {sort() === "created_at" ? (order() === "asc" ? "↑" : "↓") : ""}
                </button>
              </th>
              <th class="py-2 pr-2">
                <button type="button" onClick={() => setSortCol("taken_at")} class="hover:text-neutral-200 text-left">
                  {t("admin.taken")} {sort() === "taken_at" ? (order() === "asc" ? "↑" : "↓") : ""}
                </button>
              </th>
              <th class="py-2 pr-2 w-24"></th>
            </tr>
          </thead>
          <tbody>
            {mediaList().map(row => (
              <tr class="border-b border-neutral-800">
                <td class="py-2 pr-2 text-neutral-500">{row.id}</td>
                <td class="py-2 pr-2">{pointLabel(row.point_id)}</td>
                <td class="py-2 pr-2">{row.type}</td>
                <td class="py-2 pr-2 text-neutral-200">{row.title || "—"}</td>
                <td class="py-2 pr-2 text-neutral-500">{formatTs(row.created_at)}</td>
                <td class="py-2 pr-2 text-neutral-500">{formatTs(row.taken_at)}</td>
                <td class="py-2 pr-2">
                  {deleteConfirmId() === row.id ? (
                    <span class="flex gap-1">
                      <button
                        type="button"
                        onClick={doDelete}
                        class="px-2 py-1 rounded bg-red-900/50 text-red-300 text-xs"
                      >
                        {t("admin.delete")}
                      </button>
                      <button type="button" onClick={cancelDelete} class="px-2 py-1 text-neutral-500 text-xs">
                        {t("admin.cancel")}
                      </button>
                    </span>
                  ) : (
                    <span class="flex gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(row)}
                        class="text-neutral-400 hover:text-neutral-200 text-xs"
                      >
                        {t("admin.editMedia")}
                      </button>
                      <button
                        type="button"
                        onClick={() => confirmDelete(row.id)}
                        class="text-neutral-500 hover:text-red-400 text-xs"
                      >
                        {t("admin.delete")}
                      </button>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {mediaList().length === 0 && <p class="mt-4 text-neutral-500">No media yet.</p>}
    </div>
  );
}
