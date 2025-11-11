export const i18n = {
  defaultLocale: "ko",
  locales: ["ko", "en", "ja", "ru", "de", "fr", "hi", "bn"],
} as const;

export type Locale = (typeof i18n)["locales"][number];

export const localeNames: Record<Locale, string> = {
  ko: "한국어",
  en: "English",
  ja: "日本語",
  ru: "Русский",
  de: "Deutsch",
  fr: "Français",
  hi: "हिन्दी",
  bn: "বাংলা",
};

export const localeFlags: Record<Locale, string> = {
  ko: "🇰🇷",
  en: "🇺🇸",
  ja: "🇯🇵",
  ru: "🇷🇺",
  de: "🇩🇪",
  fr: "🇫🇷",
  hi: "🇮🇳",
  bn: "🇧🇩",
};
