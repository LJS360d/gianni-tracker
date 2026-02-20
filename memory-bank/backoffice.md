# Backoffice (Gianni Admin) — Implementation Spec

## Current State

- **Admin layout** (`/admin`): Nav with Config, Media, Content. Token in sessionStorage; all admin API calls use `Authorization: Bearer <token>`.
- **Config** (done): `/api/admin/config` GET/PATCH for `delay_hours`, `sharing_enabled`. `/api/admin/status` for `last_sync_server_ts`. UI in `admin/index.tsx`: login, delay slider (0–168h), sharing toggle, last sync display.
- **Media** (placeholder only): `admin/media.tsx` is a stub. DB schema exists: `media` table (`id`, `point_id`, `type`, `url`, `title`, `description`, `provider`). Track/family APIs return media keyed by point; no admin CRUD for media.
- **Content** (UI only): `admin/content.tsx` has EasyMDE editor; no persistence, no API. i18n describes “titles and descriptions for media and trip content (Markdown)”: media fields live in Media section; “trip content” = one global markdown blob (e.g. intro on map page).

---

## 1. Media Backoffice

**Goal:** Gianni can list media, add new entries (link to a track point, set type/url/title/description/provider), edit title/description (and optionally point/url), delete.

### 1.1 API (all admin-auth)

- **GET `/api/admin/media`**  
  List media. Query: optional `point_id`, `limit`, `offset`. Response: array of `{ id, point_id, type, url, title, description, provider }`. Optionally include minimal point info (e.g. `device_ts`, `lat`, `lng`) per row for display.

- **GET `/api/admin/points`**  
  List points for dropdown when creating/editing media. Query: optional `limit` (default e.g. 200). Response: array of `{ id, device_ts, lat, lng }` ordered by `device_ts` desc (most recent first) so Gianni can attach media to “last” or recent positions.

- **POST `/api/admin/media`**  
  Create media. Body: `point_id`, `type` (e.g. `image` | `video`), `url`, `title`, `description`, `provider` (e.g. `youtube` | `imgur` | `local`). Validate: point exists, `type`/`provider` in allowed enums. Return created row.

- **PATCH `/api/admin/media/[id]`**  
  Update media. Body: optional `title`, `description`, `point_id`, `url`. Validate id exists and (if present) point_id exists. Return updated row.

- **DELETE `/api/admin/media/[id]`**  
  Delete one media row. Return 204 or 200.

**DB:** Use existing `media` table and `points` table. No schema change required. Add db helpers: e.g. `listMedia(filters)`, `listPointsForAdmin(limit)`, `insertMedia(...)`, `updateMedia(id, ...)`, `deleteMedia(id)`.

### 1.2 Local file upload (optional)

- **POST `/api/admin/media/upload`**  
  Multipart file upload. Store file under a fixed directory (e.g. `public/media/` or env `UPLOAD_DIR`); filename = sanitized original or uuid. Response: `{ url: "/media/..." }` (or full URL) to use as `url` when creating a media row with `provider: "local"`.
- **Serving:** Either place under `public/media/` so existing `/media/*` works, or add a GET route that serves from that directory (and apply same public-delay policy if those URLs are ever exposed elsewhere; currently track API only returns delay-filtered points/media).

### 1.3 UI (`admin/media.tsx`)

- List: Table or card list of media (id, point, type, provider, title, url); sort by point time or id.
- Create: Form with point selector (dropdown from GET `/api/admin/points`), type, provider, url (text input or file upload for local), title, description; submit → POST `/api/admin/media`.
- Edit: Inline or modal edit for title, description (and optionally point, url); submit → PATCH `/api/admin/media/:id`.
- Delete: Button + confirm → DELETE `/api/admin/media/:id`.

---

## 2. Content Backoffice (Trip Markdown)

**Goal:** One editable markdown blob (“trip content”) for the public map page (e.g. intro text). Stored server-side; admin edits in existing EasyMDE UI.

### 2.1 Storage and API

- **Storage:** Config table, key e.g. `trip_content_md` or `page_content_md`. Value = raw markdown string.
- **GET `/api/admin/content`**  
  Admin auth. Return `{ markdown: string }` (value of that config key, or `""`).
- **PUT or PATCH `/api/admin/content`**  
  Admin auth. Body `{ markdown: string }`. Write to config key. Return `{ markdown: string }`.

Reuse same admin token check as `/api/admin/config` (e.g. shared helper).

### 2.2 UI (`admin/content.tsx`)

- On mount: fetch GET `/api/admin/content`, set EasyMDE initial value.
- Save: Button “Save” or debounced blur → PUT `/api/admin/content` with current markdown. Show success/error.

### 2.3 Public consumption

- Not part of backoffice: when the public map page should show this blob, add either (a) a public GET that returns the markdown (or HTML) with no auth, or (b) server-render it from config in the page. Document in this file when that is implemented.

---

## 3. Administration Config

- **Done.** Delay slider, sharing toggle, last sync. No further work required for “administration config” unless new keys (e.g. site title, contact) are added later.

---

## 4. Implementation Order

1. **Media API** — GET list, GET points, POST/PATCH/DELETE media; db helpers.
2. **Media UI** — List, create form (point + type + url + title + description + provider), edit, delete.
3. **Content API** — GET/PUT content; config key for markdown.
4. **Content UI** — Wire EasyMDE load/save to content API.
5. **Optional:** Local upload endpoint + serve under `/media/*` (or existing static); then “Upload” in media create form.
