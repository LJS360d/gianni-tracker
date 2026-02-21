import { atom, computed } from "nanostores";
import type en from "./en.json";

export type TranslationSchema = typeof en;
export const locale = atom<string>("it");
export const translations = atom<TranslationSchema | null>(null);

// Type-safe helper for components
export const $t = computed(translations, (dict) => {
  if (!dict) return {} as TranslationSchema; // Fallback for hydration
  return dict;
});

export async function load(_lang: string) {
  let lang = _lang;
  let messages = (await import(`../i18n/${lang}.json`)).default;
  if (!messages) {
    lang = locale.get();
    console.error(
      `Failed to load translation file for ${lang}, using default locale "${lang}"`,
    );
    messages = (await import(`../i18n/${lang}.json`)).default;
  }
  locale.set(lang);
  translations.set(messages);
}
