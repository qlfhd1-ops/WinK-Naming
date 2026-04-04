"use client";

import { useMemo, useState } from "react";

type Lang = "ko" | "en" | "ja" | "zh" | "es";

type Props = {
  lang: Lang;
  category: string;
  name: string;
};

export default function PremiumExpansionOptions({
  lang,
  category,
  name,
}: Props) {
  const copy = {
    ko: {
      title: "프리미엄 확장 옵션",
      subtitle:
        "이 이름을 실물 선물과 브랜드 패키지로 확장할 수 있도록 미리 선택해볼 수 있습니다.",
      calligraphy: "캘리그래피 스타일",
      frame: "액자 스타일",
      seal: "인장 스타일",
      logo: "브랜드 로고 콘셉트",
      summary: "선택 요약",
      summaryEmpty: "아직 선택하지 않았습니다.",
      categoryGuide: {
        baby: "아이 이름 선물용 액자/인장 패키지에 어울립니다.",
        rename: "새 이름의 의미를 담은 액자/인장 패키지에 어울립니다.",
        activity: "활동명 브랜딩 카드와 시그니처 패키지에 어울립니다.",
        brand: "브랜드 로고/명패/상호 패키지 확장에 어울립니다.",
        pet: "반려 이름 카드, 인장, 기념 액자 패키지에 어울립니다.",
        plant: "식물 이름 카드, 감성 액자 패키지에 어울립니다.",
        global: "글로벌 이름 카드와 기념 인장 패키지에 어울립니다.",
        default: "이 이름을 다양한 선물 패키지로 확장할 수 있습니다.",
      },
      calligraphyOptions: ["정갈한 서예형", "부드러운 감성형", "미니멀 모던형"],
      frameOptions: ["화이트 우드", "골드 프레임", "미니멀 아크릴"],
      sealOptions: ["전통 낙관형", "모던 원형", "사각 시그니처형"],
      logoOptions: ["심볼형", "워드마크형", "엠블럼형"],
    },
    en: {
      title: "Premium Expansion Options",
      subtitle:
        "Preview how this name can expand into physical gifts and branded packages.",
      calligraphy: "Calligraphy Style",
      frame: "Frame Style",
      seal: "Seal Style",
      logo: "Brand Logo Concept",
      summary: "Selection Summary",
      summaryEmpty: "Nothing selected yet.",
      categoryGuide: {
        baby: "Fits a baby name gift frame / seal package.",
        rename: "Fits a renewed-name frame / seal package.",
        activity: "Fits a public identity card and signature package.",
        brand: "Fits brand logo, signboard, and naming package expansion.",
        pet: "Fits pet name cards, seals, and memory frame packages.",
        plant: "Fits plant name cards and emotional frame packages.",
        global: "Fits global name cards and commemorative seal packages.",
        default: "This name can expand into a variety of gift packages.",
      },
      calligraphyOptions: ["Classic Script", "Soft Emotional", "Minimal Modern"],
      frameOptions: ["White Wood", "Gold Frame", "Minimal Acrylic"],
      sealOptions: ["Traditional Seal", "Modern Round", "Square Signature"],
      logoOptions: ["Symbol Type", "Wordmark", "Emblem"],
    },
    ja: {
      title: "プレミアム拡張オプション",
      subtitle:
        "この名前を実物ギフトやブランドパッケージに広げるための選択肢です。",
      calligraphy: "カリグラフィースタイル",
      frame: "フレームスタイル",
      seal: "印章スタイル",
      logo: "ブランドロゴコンセプト",
      summary: "選択概要",
      summaryEmpty: "まだ選択されていません。",
      categoryGuide: {
        baby: "赤ちゃんの名前ギフト用フレーム・印章に合います。",
        rename: "新しい名前の意味を込めたフレーム・印章に合います。",
        activity: "活動名カードとシグネチャーパッケージに合います。",
        brand: "ブランドロゴ・看板・商号パッケージ拡張に合います。",
        pet: "ペット名カード・印章・記念フレームに合います。",
        plant: "植物名カードと感性フレームに合います。",
        global: "グローバル名カードと記念印章に合います。",
        default: "さまざまなギフトパッケージへ拡張できます。",
      },
      calligraphyOptions: ["端正な書道風", "やわらかな感性風", "ミニマルモダン"],
      frameOptions: ["ホワイトウッド", "ゴールドフレーム", "ミニマルアクリル"],
      sealOptions: ["伝統落款風", "モダン円形", "四角シグネチャー"],
      logoOptions: ["シンボル型", "ワードマーク型", "エンブレム型"],
    },
    zh: {
      title: "高级扩展选项",
      subtitle: "可预览这个名字如何扩展为实物礼物和品牌包装。",
      calligraphy: "书法风格",
      frame: "相框风格",
      seal: "印章风格",
      logo: "品牌 Logo 概念",
      summary: "选择摘要",
      summaryEmpty: "尚未选择。",
      categoryGuide: {
        baby: "适合宝宝名字礼物相框 / 印章套装。",
        rename: "适合新名字意义表达的相框 / 印章套装。",
        activity: "适合活动名卡片与签名字体套装。",
        brand: "适合品牌 Logo、门牌与命名套装扩展。",
        pet: "适合宠物名字卡、印章与纪念相框。",
        plant: "适合植物名字卡与氛围相框。",
        global: "适合全球名字卡与纪念印章套装。",
        default: "这个名字可扩展为多种礼物套装。",
      },
      calligraphyOptions: ["端正规范型", "柔和感性型", "极简现代型"],
      frameOptions: ["白色木框", "金色边框", "极简亚克力"],
      sealOptions: ["传统印章型", "现代圆章型", "方形签名章"],
      logoOptions: ["符号型", "字标型", "徽章型"],
    },
    es: {
      title: "Opciones premium de expansión",
      subtitle:
        "Puedes previsualizar cómo este nombre puede convertirse en regalos físicos y paquetes de marca.",
      calligraphy: "Estilo de caligrafía",
      frame: "Estilo de marco",
      seal: "Estilo de sello",
      logo: "Concepto de logo de marca",
      summary: "Resumen de selección",
      summaryEmpty: "Aún no hay selección.",
      categoryGuide: {
        baby: "Encaja con marcos y sellos para regalo de nombre de bebé.",
        rename: "Encaja con marcos y sellos para un nuevo nombre.",
        activity: "Encaja con tarjetas de identidad pública y firma.",
        brand: "Encaja con expansión a logo, letrero y paquete de marca.",
        pet: "Encaja con tarjetas, sellos y marcos de recuerdo para mascota.",
        plant: "Encaja con tarjetas de planta y marcos emocionales.",
        global: "Encaja con tarjetas globales y sellos conmemorativos.",
        default: "Este nombre puede ampliarse a varios paquetes de regalo.",
      },
      calligraphyOptions: ["Clásico", "Emocional Suave", "Minimal Moderno"],
      frameOptions: ["Madera Blanca", "Marco Dorado", "Acrílico Minimal"],
      sealOptions: ["Sello Tradicional", "Sello Redondo Moderno", "Sello Cuadrado"],
      logoOptions: ["Símbolo", "Wordmark", "Emblema"],
    },
  } as const;

  const t = copy[lang];

  const [calligraphy, setCalligraphy] = useState("");
  const [frame, setFrame] = useState("");
  const [seal, setSeal] = useState("");
  const [logo, setLogo] = useState("");

  const guide = useMemo(() => {
    return (
      t.categoryGuide[category as keyof typeof t.categoryGuide] ||
      t.categoryGuide.default
    );
  }, [category, t.categoryGuide]);

  return (
    <div
      style={{
        padding: 18,
        borderRadius: 18,
        background: "#101826",
        border: "1px solid #223049",
      }}
    >
      <div style={{ fontWeight: 800, marginBottom: 8 }}>{t.title}</div>
      <div style={{ opacity: 0.82, lineHeight: 1.7, marginBottom: 14 }}>
        {t.subtitle}
      </div>

      <div
        style={{
          padding: 14,
          borderRadius: 14,
          background: "rgba(212,175,55,0.07)",
          border: "1px solid rgba(212,175,55,0.12)",
          marginBottom: 16,
          lineHeight: 1.7,
        }}
      >
        {name} · {guide}
      </div>

      <div style={{ display: "grid", gap: 14 }}>
        <label className="wink-field">
          <span className="wink-label">{t.calligraphy}</span>
          <select
            value={calligraphy}
            onChange={(e) => setCalligraphy(e.target.value)}
            className="wink-input"
          >
            <option value="">-</option>
            {t.calligraphyOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>

        <label className="wink-field">
          <span className="wink-label">{t.frame}</span>
          <select
            value={frame}
            onChange={(e) => setFrame(e.target.value)}
            className="wink-input"
          >
            <option value="">-</option>
            {t.frameOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>

        <label className="wink-field">
          <span className="wink-label">{t.seal}</span>
          <select
            value={seal}
            onChange={(e) => setSeal(e.target.value)}
            className="wink-input"
          >
            <option value="">-</option>
            {t.sealOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>

        {category === "brand" && (
          <label className="wink-field">
            <span className="wink-label">{t.logo}</span>
            <select
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              className="wink-input"
            >
              <option value="">-</option>
              {t.logoOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div
        style={{
          marginTop: 16,
          padding: 14,
          borderRadius: 14,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ fontWeight: 800, marginBottom: 8 }}>{t.summary}</div>
        {calligraphy || frame || seal || logo ? (
          <div style={{ display: "grid", gap: 6, lineHeight: 1.7, opacity: 0.9 }}>
            {calligraphy && <div>• {t.calligraphy}: {calligraphy}</div>}
            {frame && <div>• {t.frame}: {frame}</div>}
            {seal && <div>• {t.seal}: {seal}</div>}
            {logo && <div>• {t.logo}: {logo}</div>}
          </div>
        ) : (
          <div style={{ opacity: 0.72 }}>{t.summaryEmpty}</div>
        )}
      </div>
    </div>
  );
}