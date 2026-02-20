import { useStore } from "@nanostores/solid";
import { createEffect, createSignal } from "solid-js";
import { useI18n } from "~/i18n";
import { apiHeaders } from "~/lib/admin-client";
import { adminTokenStore, clearAdminToken, setAdminToken } from "~/lib/admin-store";

type Config = { delay_hours: number; sharing_enabled: boolean };
type Status = { last_sync_server_ts: number | null };

function formatLastSync(ts: number | null): string {
  if (ts == null) return "";
  const d = new Date(ts);
  return d.toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
}

export default function AdminConfig() {
  const { t } = useI18n();
  const token = useStore(adminTokenStore);
  const [tokenInput, setTokenInput] = createSignal("");
  const [config, setConfig] = createSignal<Config | null>(null);
  const [status, setStatus] = createSignal<Status | null>(null);
  const [error, setError] = createSignal<string | null>(null);
  const [pendingDelay, setPendingDelay] = createSignal<number | null>(null);
  const [pendingSharing, setPendingSharing] = createSignal<boolean | null>(null);

  function saveToken(value: string) {
    setAdminToken(value);
    setTokenInput("");
    setError(null);
  }

  function logout() {
    clearAdminToken();
    setConfig(null);
    setStatus(null);
  }

  createEffect(() => {
    const tkn = token();
    if (!tkn) return;
    setError(null);
    fetch("/api/admin/config", { headers: apiHeaders(tkn!) })
      .then(r => {
        if (r.status === 401) {
          setError(t("admin.unauthorized"));
          logout();
          return null;
        }
        return r.json();
      })
      .then(data => data && setConfig({ delay_hours: data.delay_hours, sharing_enabled: data.sharing_enabled }));
    fetch("/api/admin/status", { headers: apiHeaders(tkn!) })
      .then(r => r.json())
      .then(data => setStatus({ last_sync_server_ts: data.last_sync_server_ts }));
  });

  function handleTokenSubmit(e: Event) {
    e.preventDefault();
    const value = tokenInput().trim();
    if (value) saveToken(value);
  }

  function handleDelayChange(hours: number) {
    setPendingDelay(hours);
    const tkn = token();
    if (!tkn) return;
    fetch("/api/admin/config", {
      method: "PATCH",
      headers: apiHeaders(tkn!),
      body: JSON.stringify({ delay_hours: hours })
    })
      .then(r => r.json())
      .then(data => data.delay_hours != null && setConfig(c => (c ? { ...c, delay_hours: data.delay_hours } : null)))
      .then(() => setPendingDelay(null))
      .catch(() => setPendingDelay(null));
  }

  function handleSharingChange(enabled: boolean) {
    setPendingSharing(enabled);
    const tkn = token();
    if (!tkn) return;
    fetch("/api/admin/config", {
      method: "PATCH",
      headers: apiHeaders(tkn!),
      body: JSON.stringify({ sharing_enabled: enabled })
    })
      .then(r => r.json())
      .then(data => data.sharing_enabled != null && setConfig(c => (c ? { ...c, sharing_enabled: data.sharing_enabled } : null)))
      .then(() => setPendingSharing(null))
      .catch(() => setPendingSharing(null));
  }

  const cfg = () => config();
  const delay = () => pendingDelay() ?? cfg()?.delay_hours ?? 48;
  const sharing = () => (pendingSharing() ?? cfg()?.sharing_enabled ?? true);

  return (
    <div class="max-w-xl text-neutral-300">
      <h2 class="text-xl font-light text-neutral-100 mb-4">{t("admin.config")}</h2>
      {error() && <p class="mb-4 text-red-400">{error()}</p>}
      {!token() ? (
        <form onSubmit={handleTokenSubmit} class="space-y-3">
          <input
            type="password"
            placeholder={t("admin.tokenPlaceholder")}
            value={tokenInput()}
            onInput={e => setTokenInput(e.currentTarget.value)}
            class="w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-600 text-neutral-100 placeholder-neutral-500"
            autocomplete="off"
          />
          <button type="submit" class="px-4 py-2 rounded bg-neutral-700 hover:bg-neutral-600 text-neutral-100">
            {t("admin.submitToken")}
          </button>
        </form>
      ) : (
        <>
          <div class="mb-4 flex items-center justify-end">
            <button type="button" onClick={logout} class="text-sm text-neutral-500 hover:text-neutral-300">
              Logout
            </button>
          </div>
          <div class="space-y-6">
            <div>
              <label for="delay" class="block text-sm text-neutral-400 mb-1">
                {t("admin.delayLabel")}
              </label>
              <input
                id="delay"
                type="range"
                min={0}
                max={168}
                value={delay()}
                onInput={e => handleDelayChange(parseInt(e.currentTarget.value, 10))}
                class="w-full h-2 rounded bg-neutral-700 accent-neutral-400"
              />
              <span class="block mt-1 text-neutral-500">{delay()} h</span>
            </div>
            <div class="flex items-center gap-2">
              <input
                id="sharing"
                type="checkbox"
                checked={sharing()}
                onInput={e => handleSharingChange(e.currentTarget.checked)}
                class="rounded border-neutral-600 bg-neutral-800 accent-neutral-400"
              />
              <label for="sharing" class="text-sm">
                {t("admin.sharingLabel")}
              </label>
            </div>
            <div>
              <span class="text-sm text-neutral-400">{t("admin.lastSync")}: </span>
              <span class="text-neutral-200">
                {status()?.last_sync_server_ts != null ? formatLastSync(status()!.last_sync_server_ts) : t("admin.never")}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
