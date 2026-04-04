"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type GiftCard = {
  name: string;
  hanja?: string;
  hanja_meaning?: string;
  hanja_strokes?: string;
  five_elements?: string;
  english?: string;
  chinese?: string;
  chinese_pinyin?: string;
  japanese_kana?: string;
  japanese_reading?: string;
  meaning?: string;
  story?: string;
  phonetic_harmony?: string;
  sender_name?: string;
  recipient_name?: string;
  message?: string;
  lang?: string;
};

const COPY = {
  ko: {
    loading: "카드를 불러오는 중...",
    notFound: "선물 카드를 찾을 수 없습니다.",
    notFoundSub: "링크가 만료되었거나 올바르지 않은 주소입니다.",
    from: "보내는 분",
    to: "받는 분",
    message: "메시지",
    hanja: "한자 표기",
    hanjaDetail: "한자 풀이",
    hanjaStrokes: "획수 조합",
    fiveElements: "오행 균형",
    phoneticHarmony: "음운 조화",
    meaning: "이름의 의미",
    story: "이름 설계 이야기",
    pronunciation: "발음 표기",
    en: "영어",
    zh: "중문",
    zhPinyin: "병음",
    ja: "일본어",
    jaRomaji: "로마자",
    shareTitle: "이름 선물 카드",
    copyLink: "링크 복사",
    copied: "복사됨!",
    shareKakao: "카카오톡 공유",
    shareSms: "문자 보내기",
    shareNative: "공유하기",
    footer: "윙크 네이밍 — 이름은 평생의 선물",
  },
  en: {
    loading: "Loading card...",
    notFound: "Gift card not found.",
    notFoundSub: "The link may have expired or is invalid.",
    from: "From",
    to: "To",
    message: "Message",
    hanja: "Chinese Characters",
    hanjaDetail: "Character Meanings",
    hanjaStrokes: "Stroke Count",
    fiveElements: "Five Elements",
    phoneticHarmony: "Phonetic Harmony",
    meaning: "Name Meaning",
    story: "Design Story",
    pronunciation: "Pronunciation",
    en: "English",
    zh: "Chinese",
    zhPinyin: "Pinyin",
    ja: "Japanese",
    jaRomaji: "Romaji",
    shareTitle: "Name Gift Card",
    copyLink: "Copy Link",
    copied: "Copied!",
    shareKakao: "Share via KakaoTalk",
    shareSms: "Send SMS",
    shareNative: "Share",
    footer: "윙크 네이밍 — A name is a gift for life",
  },
  zh: {
    loading: "正在加载卡片...",
    notFound: "未找到礼品卡。",
    notFoundSub: "链接可能已过期或无效。",
    from: "寄件人",
    to: "收件人",
    message: "留言",
    hanja: "汉字写法",
    hanjaDetail: "汉字解析",
    hanjaStrokes: "笔画组合",
    fiveElements: "五行平衡",
    phoneticHarmony: "音韵和谐",
    meaning: "名字含义",
    story: "设计故事",
    pronunciation: "发音标注",
    en: "英文",
    zh: "中文",
    zhPinyin: "拼音",
    ja: "日文",
    jaRomaji: "罗马字",
    shareTitle: "姓名礼品卡",
    copyLink: "复制链接",
    copied: "已复制！",
    shareKakao: "KakaoTalk 分享",
    shareSms: "发短信",
    shareNative: "分享",
    footer: "윙크 네이밍 — 名字是送给人生的礼物",
  },
  ja: {
    loading: "カードを読み込み中...",
    notFound: "ギフトカードが見つかりません。",
    notFoundSub: "リンクが無効または期限切れです。",
    from: "贈り主",
    to: "宛先",
    message: "メッセージ",
    hanja: "漢字表記",
    hanjaDetail: "漢字解説",
    hanjaStrokes: "画数の組み合わせ",
    fiveElements: "五行バランス",
    phoneticHarmony: "音韻調和",
    meaning: "名前の意味",
    story: "設計ストーリー",
    pronunciation: "発音表記",
    en: "英語",
    zh: "中国語",
    zhPinyin: "ピンイン",
    ja: "日本語",
    jaRomaji: "ローマ字",
    shareTitle: "ネーミングギフトカード",
    copyLink: "リンクをコピー",
    copied: "コピーしました！",
    shareKakao: "KakaoTalkで共有",
    shareSms: "SMSを送る",
    shareNative: "共有する",
    footer: "윙크 네이밍 — 名前は一生の贈り物",
  },
  es: {
    loading: "Cargando tarjeta...",
    notFound: "Tarjeta regalo no encontrada.",
    notFoundSub: "El enlace puede haber caducado o ser inválido.",
    from: "De",
    to: "Para",
    message: "Mensaje",
    hanja: "Caracteres chinos",
    hanjaDetail: "Significados de caracteres",
    hanjaStrokes: "Conteo de trazos",
    fiveElements: "Cinco elementos",
    phoneticHarmony: "Armonía fonética",
    meaning: "Significado del nombre",
    story: "Historia del diseño",
    pronunciation: "Pronunciación",
    en: "Inglés",
    zh: "Chino",
    zhPinyin: "Pinyin",
    ja: "Japonés",
    jaRomaji: "Romaji",
    shareTitle: "Tarjeta regalo de nombre",
    copyLink: "Copiar enlace",
    copied: "¡Copiado!",
    shareKakao: "Compartir en KakaoTalk",
    shareSms: "Enviar SMS",
    shareNative: "Compartir",
    footer: "윙크 네이밍 — Un nombre es un regalo de por vida",
  },
  ru: {
    loading: "Загрузка карточки...",
    notFound: "Подарочная карточка не найдена.",
    notFoundSub: "Ссылка могла истечь или недействительна.",
    from: "От",
    to: "Кому",
    message: "Сообщение",
    hanja: "Китайские иероглифы",
    hanjaDetail: "Значения иероглифов",
    hanjaStrokes: "Число черт",
    fiveElements: "Пять элементов",
    phoneticHarmony: "Фонетическая гармония",
    meaning: "Значение имени",
    story: "История дизайна",
    pronunciation: "Произношение",
    en: "Английский",
    zh: "Китайский",
    zhPinyin: "Пиньинь",
    ja: "Японский",
    jaRomaji: "Ромадзи",
    shareTitle: "Подарочная карточка с именем",
    copyLink: "Копировать ссылку",
    copied: "Скопировано!",
    shareKakao: "Поделиться в KakaoTalk",
    shareSms: "Отправить SMS",
    shareNative: "Поделиться",
    footer: "윙크 네이밍 — Имя — это подарок на всю жизнь",
  },
  fr: {
    loading: "Chargement de la carte...",
    notFound: "Carte cadeau introuvable.",
    notFoundSub: "Le lien a peut-être expiré ou est invalide.",
    from: "De",
    to: "À",
    message: "Message",
    hanja: "Caractères chinois",
    hanjaDetail: "Significations des caractères",
    hanjaStrokes: "Nombre de traits",
    fiveElements: "Cinq éléments",
    phoneticHarmony: "Harmonie phonétique",
    meaning: "Signification du nom",
    story: "Histoire du design",
    pronunciation: "Prononciation",
    en: "Anglais",
    zh: "Chinois",
    zhPinyin: "Pinyin",
    ja: "Japonais",
    jaRomaji: "Romaji",
    shareTitle: "Carte cadeau de nom",
    copyLink: "Copier le lien",
    copied: "Copié !",
    shareKakao: "Partager sur KakaoTalk",
    shareSms: "Envoyer par SMS",
    shareNative: "Partager",
    footer: "윙크 네이밍 — Un nom est un cadeau pour la vie",
  },
  ar: {
    loading: "جارٍ تحميل البطاقة...",
    notFound: "لم يتم العثور على بطاقة الهدية.",
    notFoundSub: "قد يكون الرابط منتهي الصلاحية أو غير صحيح.",
    from: "من",
    to: "إلى",
    message: "رسالة",
    hanja: "الأحرف الصينية",
    hanjaDetail: "معاني الأحرف",
    hanjaStrokes: "عدد الخطوط",
    fiveElements: "العناصر الخمسة",
    phoneticHarmony: "الانسجام الصوتي",
    meaning: "معنى الاسم",
    story: "قصة التصميم",
    pronunciation: "النطق",
    en: "الإنجليزية",
    zh: "الصينية",
    zhPinyin: "البينيين",
    ja: "اليابانية",
    jaRomaji: "الرومادزي",
    shareTitle: "بطاقة هدية الاسم",
    copyLink: "نسخ الرابط",
    copied: "تم النسخ!",
    shareKakao: "مشاركة عبر KakaoTalk",
    shareSms: "إرسال رسالة",
    shareNative: "مشاركة",
    footer: "윙크 네이밍 — الاسم هدية العمر",
  },
  hi: {
    loading: "कार्ड लोड हो रहा है...",
    notFound: "उपहार कार्ड नहीं मिला।",
    notFoundSub: "लिंक समाप्त हो गया होगा या अमान्य है।",
    from: "से",
    to: "को",
    message: "संदेश",
    hanja: "चीनी अक्षर",
    hanjaDetail: "अक्षर अर्थ",
    hanjaStrokes: "रेखा गणना",
    fiveElements: "पांच तत्व",
    phoneticHarmony: "ध्वन्यात्मक सामंजस्य",
    meaning: "नाम का अर्थ",
    story: "डिज़ाइन कहानी",
    pronunciation: "उच्चारण",
    en: "अंग्रेज़ी",
    zh: "चीनी",
    zhPinyin: "पिनयिन",
    ja: "जापानी",
    jaRomaji: "रोमाजी",
    shareTitle: "नाम उपहार कार्ड",
    copyLink: "लिंक कॉपी करें",
    copied: "कॉपी हो गया!",
    shareKakao: "KakaoTalk पर शेयर करें",
    shareSms: "SMS भेजें",
    shareNative: "शेयर करें",
    footer: "윙크 네이밍 — नाम जीवन भर का उपहार है",
  },
} as const;

type UiLang = keyof typeof COPY;

export default function GiftCardPage() {
  const params = useParams();
  const token = String(params.token ?? "");
  const rawLang = String(params.lang ?? "ko");
  const ui = COPY[(rawLang in COPY ? rawLang : "ko") as UiLang];

  const [card, setCard] = useState<GiftCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!token) { setNotFound(true); setLoading(false); return; }
    fetch(`/api/gift-card?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.ok && j.card) setCard(j.card);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [token]);

  const pageUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(pageUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${card?.name ?? ""} — ${ui.shareTitle}`,
        text: card?.message ?? ui.footer,
        url: pageUrl,
      });
    } else {
      handleCopy();
    }
  };

  const handleSms = () => {
    const text = encodeURIComponent(
      `${ui.shareTitle}: ${card?.name ?? ""}\n${pageUrl}`
    );
    window.open(`sms:?body=${text}`, "_self");
  };

  const handleKakao = () => {
    // KakaoTalk JS SDK 없이는 링크 복사 후 안내
    handleCopy();
    alert("링크가 복사되었습니다. 카카오톡에서 붙여넣기해 공유하세요.");
  };

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#070e28" }}>
        <p style={{ color: "rgba(200,215,240,0.7)", fontSize: 16 }}>{ui.loading}</p>
      </main>
    );
  }

  if (notFound || !card) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#070e28", padding: 24 }}>
        <p style={{ color: "#f8fbff", fontSize: 22, fontWeight: 700, marginBottom: 10 }}>{ui.notFound}</p>
        <p style={{ color: "rgba(200,215,240,0.65)", fontSize: 15 }}>{ui.notFoundSub}</p>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(180deg, #0a1432 0%, #060d22 100%)", padding: "40px 16px" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>

        {/* Header chip */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <span style={{ display: "inline-block", padding: "6px 16px", borderRadius: 999, border: "1px solid rgba(201,168,76,0.4)", color: "rgba(242,210,110,0.95)", fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            윙크 네이밍 Gift Card
          </span>
        </div>

        {/* To/From */}
        {(card.recipient_name || card.sender_name) && (
          <div style={{ marginBottom: 20, padding: "16px 20px", borderRadius: 14, border: "1px solid rgba(201,168,76,0.18)", background: "rgba(201,168,76,0.06)" }}>
            {card.recipient_name && (
              <div style={{ color: "rgba(242,210,110,0.9)", fontSize: 14, marginBottom: 6 }}>
                <strong>{ui.to}</strong>: {card.recipient_name}
              </div>
            )}
            {card.sender_name && (
              <div style={{ color: "rgba(200,215,240,0.8)", fontSize: 14 }}>
                <strong>{ui.from}</strong>: {card.sender_name}
              </div>
            )}
          </div>
        )}

        {/* Main card */}
        <div style={{
          borderRadius: 24,
          padding: "32px 24px",
          background: "radial-gradient(circle at top left, rgba(201,168,76,0.14), transparent 36%), linear-gradient(180deg, #162132 0%, #0f1725 100%)",
          border: "1px solid rgba(201,168,76,0.26)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.36)",
          marginBottom: 20,
        }}>

          {/* Name */}
          <div style={{ fontSize: "clamp(48px, 10vw, 72px)", fontWeight: 800, color: "#f8fbff", letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 10, textShadow: "0 0 32px rgba(201,168,76,0.18)" }}>
            {card.name}
          </div>

          {/* Hanja */}
          {card.hanja && (
            <div style={{ fontSize: 26, color: "rgba(242,210,110,0.88)", letterSpacing: "0.1em", marginBottom: 16 }}>
              {card.hanja}
            </div>
          )}

          {/* Hanja detail */}
          {card.hanja_meaning && (
            <div style={{ marginBottom: 14, padding: "12px 16px", borderRadius: 10, background: "rgba(0,0,0,0.2)", border: "1px solid rgba(201,168,76,0.12)" }}>
              <div style={{ fontSize: 11, color: "rgba(201,168,76,0.7)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>{ui.hanjaDetail}</div>
              <div style={{ color: "rgba(215,228,248,0.9)", fontSize: 14, lineHeight: 1.7 }}>{card.hanja_meaning}</div>
              {card.hanja_strokes && (
                <div style={{ color: "rgba(200,215,240,0.6)", fontSize: 12, marginTop: 4 }}>{ui.hanjaStrokes}: {card.hanja_strokes}</div>
              )}
            </div>
          )}

          {/* Five elements */}
          {card.five_elements && (
            <div style={{ marginBottom: 14, padding: "10px 16px", borderRadius: 10, background: "rgba(0,0,0,0.18)", border: "1px solid rgba(120,160,255,0.12)" }}>
              <span style={{ fontSize: 11, color: "rgba(140,180,255,0.7)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{ui.fiveElements}  </span>
              <span style={{ color: "rgba(210,225,248,0.88)", fontSize: 14 }}>{card.five_elements}</span>
            </div>
          )}

          {/* Meaning */}
          {card.meaning && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: "rgba(201,168,76,0.65)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>{ui.meaning}</div>
              <div style={{ color: "rgba(218,230,250,0.92)", fontSize: 15, lineHeight: 1.8 }}>{card.meaning}</div>
            </div>
          )}

          {/* Phonetic harmony */}
          {card.phonetic_harmony && (
            <div style={{ marginBottom: 16, padding: "10px 16px", borderRadius: 10, background: "rgba(0,0,0,0.18)", border: "1px solid rgba(120,160,255,0.12)" }}>
              <div style={{ fontSize: 11, color: "rgba(140,180,255,0.65)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>{ui.phoneticHarmony}</div>
              <div style={{ color: "rgba(210,225,248,0.88)", fontSize: 14, lineHeight: 1.65 }}>{card.phonetic_harmony}</div>
            </div>
          )}

          {/* Divider */}
          <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)", margin: "20px 0" }} />

          {/* Global pronunciation */}
          <div style={{ fontSize: 11, color: "rgba(201,168,76,0.65)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>{ui.pronunciation}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {[
              { label: ui.en, value: card.english, sub: null },
              { label: ui.zh, value: card.chinese, sub: card.chinese_pinyin ? `${ui.zhPinyin}: ${card.chinese_pinyin}` : null },
              { label: ui.ja, value: card.japanese_kana, sub: card.japanese_reading ? `${ui.jaRomaji}: ${card.japanese_reading}` : null },
            ].map((item) => (
              <div key={item.label} style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ fontSize: 10, color: "rgba(201,168,76,0.7)", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 4 }}>{item.label}</div>
                <div style={{ color: "#f0f5ff", fontSize: 15, fontWeight: 600 }}>{item.value || "—"}</div>
                {item.sub && <div style={{ color: "rgba(190,210,240,0.6)", fontSize: 11, marginTop: 3 }}>{item.sub}</div>}
              </div>
            ))}
          </div>

          {/* Story */}
          {card.story && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 11, color: "rgba(201,168,76,0.65)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>{ui.story}</div>
              <div style={{ color: "rgba(200,218,246,0.82)", fontSize: 14, lineHeight: 1.82 }}>{card.story}</div>
            </div>
          )}
        </div>

        {/* Personal message */}
        {card.message && (
          <div style={{ marginBottom: 20, padding: "18px 20px", borderRadius: 14, border: "1px solid rgba(120,160,255,0.16)", background: "rgba(11,22,52,0.6)" }}>
            <div style={{ fontSize: 11, color: "rgba(160,185,230,0.65)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>{ui.message}</div>
            <div style={{ color: "rgba(215,228,250,0.9)", fontSize: 15, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{card.message}</div>
          </div>
        )}

        {/* Share buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            type="button"
            onClick={handleNativeShare}
            style={{ padding: "14px", borderRadius: 12, border: "1px solid rgba(201,168,76,0.5)", background: "rgba(201,168,76,0.12)", color: "rgba(242,210,110,0.95)", fontWeight: 700, fontSize: 15, cursor: "pointer" }}
          >
            {ui.shareNative}
          </button>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            <button type="button" onClick={handleKakao} style={{ padding: "11px 8px", borderRadius: 10, border: "1px solid rgba(255,210,0,0.3)", background: "rgba(254,229,0,0.08)", color: "rgba(254,229,0,0.9)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              💬 {ui.shareKakao.split(" ").pop()}
            </button>
            <button type="button" onClick={handleSms} style={{ padding: "11px 8px", borderRadius: 10, border: "1px solid rgba(120,160,255,0.25)", background: "rgba(120,160,255,0.08)", color: "rgba(180,205,255,0.9)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              📱 {ui.shareSms}
            </button>
            <button type="button" onClick={handleCopy} style={{ padding: "11px 8px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", color: "rgba(210,225,250,0.8)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              {copied ? "✓" : "🔗"} {copied ? ui.copied : ui.copyLink}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 32, textAlign: "center", fontSize: 12, color: "rgba(150,170,210,0.5)", letterSpacing: "0.05em" }}>
          {ui.footer}
        </div>
      </div>
    </main>
  );
}
