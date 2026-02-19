import * as i18n from "@solid-primitives/i18n";
import { createContext, createMemo, createSignal, useContext, type ParentProps } from "solid-js";
import { dict as en } from "./en";
import { dict as it } from "./it";

export type Locale = "it" | "en";
export type RawDictionary = typeof en;
export type Dictionary = i18n.Flatten<RawDictionary>;

const dictionaries: Record<Locale, RawDictionary> = { it, en };

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "it";
  const stored = localStorage.getItem("gianni-locale");
  return stored === "en" ? "en" : "it";
}

type I18nContextValue = {
  locale: () => Locale;
  setLocale: (locale: Locale) => void;
  t: i18n.Translator<Dictionary>;
};

const I18nContext = createContext<I18nContextValue>();

export function I18nProvider(props: ParentProps) {
  const [locale, setLocaleSignal] = createSignal<Locale>(getInitialLocale());
  const setLocale = (l: Locale) => {
    setLocaleSignal(l);
    if (typeof window !== "undefined") localStorage.setItem("gianni-locale", l);
  };

  const dict = createMemo(() => i18n.flatten(dictionaries[locale()]));
  const t = i18n.translator(dict, i18n.resolveTemplate);

  const value: I18nContextValue = { locale, setLocale, t };

  return (
    <I18nContext.Provider value={value}>
      {props.children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
