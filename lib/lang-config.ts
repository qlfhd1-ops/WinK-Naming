export type AppLang = "ko" | "en" | "ja" | "zh" | "es" | "ru" | "fr" | "ar" | "hi";

export const LANG_CONFIG: Record<
  AppLang,
  {
    label: string;
    sub: string;
    native: string;
    dir?: "ltr" | "rtl";
  }
> = {
  ko: {
    label: "한국어",
    sub: "Korean",
    native: "한국어",
    dir: "ltr",
  },
  en: {
    label: "English",
    sub: "Global Naming",
    native: "English",
    dir: "ltr",
  },
  ja: {
    label: "日本語",
    sub: "Japanese",
    native: "日本語",
    dir: "ltr",
  },
  zh: {
    label: "中文",
    sub: "Chinese",
    native: "中文",
    dir: "ltr",
  },
  es: {
    label: "Español",
    sub: "Spanish",
    native: "Español",
    dir: "ltr",
  },
  ru: {
    label: "Русский",
    sub: "Russian",
    native: "Русский",
    dir: "ltr",
  },
  fr: {
    label: "Français",
    sub: "French",
    native: "Français",
    dir: "ltr",
  },
  ar: {
    label: "العربية",
    sub: "Arabic",
    native: "العربية",
    dir: "rtl",
  },
  hi: {
    label: "हिन्दी",
    sub: "Hindi",
    native: "हिन्दी",
    dir: "ltr",
  },
};

export const LANG_LIST = Object.entries(LANG_CONFIG).map(([code, value]) => ({
  code: code as AppLang,
  ...value,
}));

export function isSupportedLang(value: string): value is AppLang {
  return ["ko", "en", "ja", "zh", "es", "ru", "fr", "ar", "hi"].includes(value);
}
