import { dict as en } from "./en";
import { dict as it } from "./it";

export type Locale = "it" | "en";

const dictionaries: Record<Locale, typeof en> = { it, en };

export function getServerLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return "en";
  const first = acceptLanguage.split(",")[0]?.trim().toLowerCase();
  if (first?.startsWith("it")) return "it";
  return "en";
}

export function getServerMeta(locale: Locale): { title: string; description: string } {
  const d = dictionaries[locale];
  return { title: d.meta.title, description: d.meta.description };
}
