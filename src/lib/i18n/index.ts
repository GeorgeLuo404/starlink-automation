import zh from "@/messages/zh.json";
import en from "@/messages/en.json";
import { defaultLocale, type Locale } from "./config";

export type Dictionary = typeof zh;

const dictionaries: Record<Locale, Dictionary> = {
  zh,
  en: en as Dictionary,
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}

export { locales, defaultLocale, isLocale, localizePath, stripLocale, localeLabels, localeHtmlLang, localeOgLocale } from "./config";
export type { Locale } from "./config";
