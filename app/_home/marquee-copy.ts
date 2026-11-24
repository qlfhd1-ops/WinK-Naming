import { type Lang } from "./lang";

export const MARQUEE_BOY_NAMES = "도윤 · 도현 · 하준 · 서준 · 이준 · 시우 · 주원 · 지호 · 준서 · 윤우";

export const MARQUEE_GIRL_NAMES = "서윤 · 하린 · 하윤 · 아린 · 서아 · 지아 · 서하 · 아윤 · 윤서 · 설아";

export const MARQUEE_LABELS: Record<Lang, { boy: string; girl: string; source: string }> = {
  ko: { boy: "인기 남자이름 TOP 10", girl: "인기 여자이름 TOP 10", source: "(출처: 대법원 전자가족관계등록시스템)" },
  en: { boy: "Popular Boy Names TOP 10", girl: "Popular Girl Names TOP 10", source: "(Source: Supreme Court Electronic Family Registration System)" },
  ja: { boy: "人気の男の子の名前TOP10", girl: "人気の女の子の名前TOP10", source: "(出典：大法院電子家族関係登録システム)" },
  zh: { boy: "热门男孩名字TOP10", girl: "热门女孩名字TOP10", source: "(来源：大法院电子家族关系登记系统)" },
  es: { boy: "Top 10 Nombres de Niño", girl: "Top 10 Nombres de Niña", source: "(Fuente: Sistema Electrónico de Registro Familiar de la Corte Suprema)" },
  fr: { boy: "Top 10 Prénoms de Garçon", girl: "Top 10 Prénoms de Fille", source: "(Source : Système électronique d'enregistrement familial de la Cour suprême)" },
  ru: { boy: "Топ-10 имён мальчиков", girl: "Топ-10 имён девочек", source: "(Источник: Электронная система регистрации семей Верховного суда)" },
  ar: { boy: "أفضل 10 أسماء للأولاد", girl: "أفضل 10 أسماء للبنات", source: "(المصدر: نظام التسجيل الأسري الإلكتروني للمحكمة العليا)" },
  hi: { boy: "टॉप 10 लड़कों के नाम", girl: "टॉप 10 लड़कियों के नाम", source: "(स्रोत: सर्वोच्च न्यायालय इलेक्ट्रॉनिक पारिवारिक पंजीकरण प्रणाली)" },
};

export const MARQUEE_BY_LANG: Record<Lang, { text: string; color: string }[]> = Object.fromEntries(
  (Object.keys(MARQUEE_LABELS) as Lang[]).map((l) => {
    const { boy, girl, source } = MARQUEE_LABELS[l];
    return [
      l,
      [
        { text: `🏆 ${boy} — ${MARQUEE_BOY_NAMES}  🌸 ${girl} — ${MARQUEE_GIRL_NAMES}  ${source} ✦ `, color: "#C9A84C" },
      ],
    ];
  })
) as Record<Lang, { text: string; color: string }[]>;
