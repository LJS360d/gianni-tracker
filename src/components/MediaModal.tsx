import type { Accessor } from "solid-js";
import { Show } from "solid-js";

export type MediaItem = {
  type: "image" | "video";
  url: string;
  title: string;
  description: string;
  provider?: string;
};

function getYoutubeEmbedId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "www.youtube.com" || u.hostname === "youtube.com") {
      return u.searchParams.get("v");
    }
    if (u.hostname === "youtu.be") {
      return u.pathname.slice(1) || null;
    }
  } catch {
    return null;
  }
  return null;
}

function isLocalVideo(item: MediaItem): boolean {
  if (item.type !== "video") return false;
  if (item.provider === "local") return true;
  try {
    const u = new URL(item.url);
    const path = u.pathname.toLowerCase();
    return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(path) || (!item.provider && /\.(mp4|webm|ogg|mov)(\?|$)/i.test(item.url));
  } catch {
    return false;
  }
}

type Props = {
  media: Accessor<MediaItem | null>;
  onClose: () => void;
};

export default function MediaModal(props: Props) {
  return (
    <Show when={props.media()}>
      {(m) => {
        const videoId = () => (m().type === "video" ? getYoutubeEmbedId(m().url) : null);
        const localVideo = () => isLocalVideo(m());
        return (
          <div
            class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="media-modal-title"
            onClick={e => e.target === e.currentTarget && props.onClose()}
          >
            <div
              class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-neutral-900 shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div class="sticky top-0 z-10 flex justify-end border-b border-neutral-700 bg-neutral-900 p-2">
                <button
                  type="button"
                  class="rounded p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white"
                  aria-label="Close"
                  onClick={() => props.onClose()}
                >
                  ✕
                </button>
              </div>
              <div class="p-4">
                <h2 id="media-modal-title" class="mb-2 text-lg font-medium text-white">
                  {m().title}
                </h2>
                <p class="mb-4 text-sm text-neutral-400">{m().description}</p>
                <Show
                  when={m().type === "video" && localVideo()}
                  fallback={
                    <Show
                      when={m().type === "video" && videoId()}
                      fallback={
                        <img
                          src={m().url}
                          alt=""
                          class="w-full rounded object-contain"
                        />
                      }
                    >
                      {(id: Accessor<string>) => (
                        <div class="aspect-video w-full overflow-hidden rounded">
                          <iframe
                            src={`https://www.youtube.com/embed/${id()}?autoplay=0`}
                            title={m().title}
                            class="h-full w-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen
                          />
                        </div>
                      )}
                    </Show>
                  }
                >
                  <div class="aspect-video w-full overflow-hidden rounded bg-black">
                    <video
                      src={m().url}
                      controls
                      class="h-full w-full"
                      title={m().title}
                    />
                  </div>
                </Show>
              </div>
            </div>
          </div>
        );
      }}
    </Show>
  );
}
