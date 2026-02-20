import { atom } from "nanostores";

const STORAGE_KEY = "admin_token";

function getStored(): string {
  if (typeof sessionStorage === "undefined") return "";
  return sessionStorage.getItem(STORAGE_KEY) ?? "";
}

function persist(value: string): void {
  if (typeof sessionStorage === "undefined") return;
  if (value) sessionStorage.setItem(STORAGE_KEY, value);
  else sessionStorage.removeItem(STORAGE_KEY);
}

export const adminTokenStore = atom<string>("");

if (typeof sessionStorage !== "undefined") {
  const initial = getStored();
  if (initial) adminTokenStore.set(initial);
  adminTokenStore.subscribe(persist);
}

export function setAdminToken(value: string): void {
  adminTokenStore.set(value);
}

export function clearAdminToken(): void {
  adminTokenStore.set("");
}
