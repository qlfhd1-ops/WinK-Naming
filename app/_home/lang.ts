export const LANG_KEY = "wink.naming.preferred-lang";

export const LANGS = ["ko","en","ja","zh","es","ru","fr","ar","hi"] as const;

export type Lang = typeof LANGS[number];

export const LANG_LABELS: Record<Lang, string> = {
  ko:"한국어", en:"English", ja:"日本語", zh:"中文",
  es:"Español", fr:"Français", ru:"Русский", ar:"العربية", hi:"हिन्दी",
};

export const LANG_FLAGS: Record<Lang, string> = {
  ko:"🇰🇷", en:"🇺🇸", ja:"🇯🇵", zh:"🇨🇳",
  es:"🇪🇸", fr:"🇫🇷", ru:"🇷🇺", ar:"🇸🇦", hi:"🇮🇳",
};

export const THEME = {
  "korean-name":  { accent: "#C9A84C", bg: "#0F1A3A", badge: "#1a2d5a" },
  "child":        { accent: "#5B8ED6", bg: "#0A1628", badge: "#14244a" },
  "self":         { accent: "#5BB0A8", bg: "#0A2420", badge: "#123a32" },
  "stage":        { accent: "#E09B4A", bg: "#241708", badge: "#3a2510" },
  "pet":          { accent: "#6AAE8F", bg: "#0C1E18", badge: "#162e24" },
  "foreign":      { accent: "#B87DBF", bg: "#1A0E2A", badge: "#2a1842" },
  "goods":        { accent: "#C4845A", bg: "#1E1208", badge: "#2e1c10" },
} as const;
