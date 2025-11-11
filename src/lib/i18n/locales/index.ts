import type { Locale } from "../config";
import { bn } from "./bn";
import { de } from "./de";
import { en } from "./en";
import { fr } from "./fr";
import { hi } from "./hi";
import { ja } from "./ja";
import { ko } from "./ko";
import { ru } from "./ru";

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
