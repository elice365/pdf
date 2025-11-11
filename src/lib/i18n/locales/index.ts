import { ko } from "./ko";
import { en } from "./en";
import { ja } from "./ja";
import { ru } from "./ru";
import { de } from "./de";
import { fr } from "./fr";
import { hi } from "./hi";
import { bn } from "./bn";
import type { Locale } from "../config";

export const translations = {
  ko,
  en,
  ja,
  ru,
  de,
  fr,
  hi,
  bn,
} as const;

export function getTranslation(locale: Locale) {
  return translations[locale] || translations.ko;
}
