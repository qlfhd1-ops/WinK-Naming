"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";

const COPY = {
  ko: {
    title: "후기 남기기",
    subtitle: "이번 이름 설계 경험은 어떠셨나요?",
    ratingLabel: "별점",
    contentLabel: "후기 내용",
    contentPlaceholder: "이름 설계 경험을 자유롭게 남겨주세요.",
    displayNameLabel: "닉네임 (선택)",
    displayNamePlaceholder: "후기에 표시될 이름",
    countryLabel: "국가 (선택)",
    countryPlaceholder: "예: 대한민국",
    submitBtn: "후기 제출하기",
    cancelBtn: "취소",
    submitting: "제출 중...",
    thanksTitle: "소중한 후기 감사합니다!",
    thanksBody: "관리자 검토 후 메인 페이지에 노출될 수 있습니다.",
    closeBtn: "닫기",
    errorContent: "후기 내용을 입력해 주세요.",
    errorLogin: "로그인이 필요합니다.",
    errorGeneric: "후기 제출 중 오류가 발생했습니다.",
  },
  en: {
    title: "Leave a Review",
    subtitle: "How was your naming experience?",
    ratingLabel: "Rating",
    contentLabel: "Review",
    contentPlaceholder: "Share your experience with us.",
    displayNameLabel: "Nickname (optional)",
    displayNamePlaceholder: "Name shown on your review",
    countryLabel: "Country (optional)",
    countryPlaceholder: "e.g. United States",
    submitBtn: "Submit Review",
    cancelBtn: "Cancel",
    submitting: "Submitting...",
    thanksTitle: "Thank you for your review!",
    thanksBody: "It may appear on our main page after admin review.",
    closeBtn: "Close",
    errorContent: "Please enter your review.",
    errorLogin: "Please log in first.",
    errorGeneric: "Something went wrong while submitting your review.",
  },
  ja: {
    title: "レビューを投稿",
    subtitle: "今回のネーミング体験はいかがでしたか？",
    ratingLabel: "評価",
    contentLabel: "レビュー内容",
    contentPlaceholder: "ご自由にご感想をお聞かせください。",
    displayNameLabel: "ニックネーム（任意）",
    displayNamePlaceholder: "レビューに表示される名前",
    countryLabel: "国（任意）",
    countryPlaceholder: "例：日本",
    submitBtn: "レビューを送信",
    cancelBtn: "キャンセル",
    submitting: "送信中...",
    thanksTitle: "貴重なレビューありがとうございます！",
    thanksBody: "管理者の確認後、メインページに掲載される場合があります。",
    closeBtn: "閉じる",
    errorContent: "レビュー内容を入力してください。",
    errorLogin: "ログインが必要です。",
    errorGeneric: "レビューの送信中にエラーが発生しました。",
  },
  zh: {
    title: "撰写评价",
    subtitle: "这次的起名体验如何？",
    ratingLabel: "评分",
    contentLabel: "评价内容",
    contentPlaceholder: "请自由分享您的体验。",
    displayNameLabel: "昵称（可选）",
    displayNamePlaceholder: "将显示在评价中的名称",
    countryLabel: "国家（可选）",
    countryPlaceholder: "例如：中国",
    submitBtn: "提交评价",
    cancelBtn: "取消",
    submitting: "提交中...",
    thanksTitle: "感谢您的宝贵评价！",
    thanksBody: "管理员审核后可能会展示在主页上。",
    closeBtn: "关闭",
    errorContent: "请输入评价内容。",
    errorLogin: "请先登录。",
    errorGeneric: "提交评价时发生错误。",
  },
  es: {
    title: "Dejar una Reseña",
    subtitle: "¿Qué tal fue tu experiencia de diseño de nombre?",
    ratingLabel: "Calificación",
    contentLabel: "Reseña",
    contentPlaceholder: "Comparte libremente tu experiencia.",
    displayNameLabel: "Apodo (opcional)",
    displayNamePlaceholder: "Nombre que se mostrará en tu reseña",
    countryLabel: "País (opcional)",
    countryPlaceholder: "ej. España",
    submitBtn: "Enviar Reseña",
    cancelBtn: "Cancelar",
    submitting: "Enviando...",
    thanksTitle: "¡Gracias por tu reseña!",
    thanksBody: "Podría mostrarse en nuestra página principal tras la revisión del administrador.",
    closeBtn: "Cerrar",
    errorContent: "Por favor ingresa tu reseña.",
    errorLogin: "Inicia sesión primero.",
    errorGeneric: "Ocurrió un error al enviar tu reseña.",
  },
  ru: {
    title: "Оставить отзыв",
    subtitle: "Как вам опыт подбора имени?",
    ratingLabel: "Оценка",
    contentLabel: "Отзыв",
    contentPlaceholder: "Поделитесь своими впечатлениями.",
    displayNameLabel: "Никнейм (необязательно)",
    displayNamePlaceholder: "Имя, отображаемое в отзыве",
    countryLabel: "Страна (необязательно)",
    countryPlaceholder: "например, Россия",
    submitBtn: "Отправить отзыв",
    cancelBtn: "Отмена",
    submitting: "Отправка...",
    thanksTitle: "Спасибо за ваш отзыв!",
    thanksBody: "Он может появиться на главной странице после проверки администратором.",
    closeBtn: "Закрыть",
    errorContent: "Пожалуйста, введите текст отзыва.",
    errorLogin: "Пожалуйста, сначала войдите в систему.",
    errorGeneric: "Произошла ошибка при отправке отзыва.",
  },
  fr: {
    title: "Laisser un Avis",
    subtitle: "Comment s'est passée votre expérience de création de nom ?",
    ratingLabel: "Note",
    contentLabel: "Avis",
    contentPlaceholder: "Partagez librement votre expérience.",
    displayNameLabel: "Pseudo (facultatif)",
    displayNamePlaceholder: "Nom affiché sur votre avis",
    countryLabel: "Pays (facultatif)",
    countryPlaceholder: "ex. France",
    submitBtn: "Envoyer l'avis",
    cancelBtn: "Annuler",
    submitting: "Envoi en cours...",
    thanksTitle: "Merci pour votre avis !",
    thanksBody: "Il pourra apparaître sur notre page principale après validation par l'administrateur.",
    closeBtn: "Fermer",
    errorContent: "Veuillez saisir votre avis.",
    errorLogin: "Veuillez vous connecter d'abord.",
    errorGeneric: "Une erreur est survenue lors de l'envoi de votre avis.",
  },
  ar: {
    title: "أضف تقييماً",
    subtitle: "كيف كانت تجربتك في تصميم الاسم؟",
    ratingLabel: "التقييم",
    contentLabel: "محتوى التقييم",
    contentPlaceholder: "شاركنا تجربتك بحرية.",
    displayNameLabel: "اسم مستعار (اختياري)",
    displayNamePlaceholder: "الاسم الذي سيظهر في تقييمك",
    countryLabel: "الدولة (اختياري)",
    countryPlaceholder: "مثال: مصر",
    submitBtn: "إرسال التقييم",
    cancelBtn: "إلغاء",
    submitting: "جارٍ الإرسال...",
    thanksTitle: "شكراً لتقييمك القيّم!",
    thanksBody: "قد يظهر في صفحتنا الرئيسية بعد مراجعة المسؤول.",
    closeBtn: "إغلاق",
    errorContent: "الرجاء إدخال محتوى التقييم.",
    errorLogin: "الرجاء تسجيل الدخول أولاً.",
    errorGeneric: "حدث خطأ أثناء إرسال تقييمك.",
  },
  hi: {
    title: "समीक्षा लिखें",
    subtitle: "आपका नामकरण अनुभव कैसा रहा?",
    ratingLabel: "रेटिंग",
    contentLabel: "समीक्षा",
    contentPlaceholder: "कृपया अपना अनुभव साझा करें।",
    displayNameLabel: "उपनाम (वैकल्पिक)",
    displayNamePlaceholder: "आपकी समीक्षा में दिखने वाला नाम",
    countryLabel: "देश (वैकल्पिक)",
    countryPlaceholder: "जैसे: भारत",
    submitBtn: "समीक्षा सबमिट करें",
    cancelBtn: "रद्द करें",
    submitting: "सबमिट हो रहा है...",
    thanksTitle: "आपकी समीक्षा के लिए धन्यवाद!",
    thanksBody: "व्यवस्थापक समीक्षा के बाद यह मुख्य पृष्ठ पर दिखाई दे सकती है।",
    closeBtn: "बंद करें",
    errorContent: "कृपया अपनी समीक्षा दर्ज करें।",
    errorLogin: "कृपया पहले लॉग इन करें।",
    errorGeneric: "समीक्षा सबमिट करते समय त्रुटि हुई।",
  },
} as const;

export type UiLang = keyof typeof COPY;

function toUiLang(l: string): UiLang {
  return l in COPY ? (l as UiLang) : "ko";
}

export const REVIEW_BUTTON_LABEL: Record<UiLang, string> = {
  ko: "후기 남기기",
  en: "Leave a Review",
  ja: "レビューを投稿",
  zh: "撰写评价",
  es: "Dejar una Reseña",
  ru: "Оставить отзыв",
  fr: "Laisser un Avis",
  ar: "أضف تقييماً",
  hi: "समीक्षा लिखें",
};

interface Props {
  lang: string;
  briefId: string;
  nameUsed?: string;
  onClose: () => void;
}

export default function ReviewModal({ lang, briefId, nameUsed, onClose }: Props) {
  const ui = COPY[toUiLang(lang)];
  const isRtl = lang === "ar";

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [country, setCountry] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError(ui.errorContent);
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) {
        setError(ui.errorLogin);
        setSubmitting(false);
        return;
      }

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken,
          briefId,
          nameUsed: nameUsed ?? "",
          rating,
          content: content.trim(),
          displayName: displayName.trim(),
          country: country.trim(),
          lang,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) {
        setError(json?.error || ui.errorGeneric);
        setSubmitting(false);
        return;
      }
      setDone(true);
    } catch {
      setError(ui.errorGeneric);
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: "rgba(0,0,0,0.78)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        dir={isRtl ? "rtl" : "ltr"}
        style={{
          background: "linear-gradient(160deg, rgba(11,22,52,0.99), rgba(6,13,34,0.99))",
          border: "1px solid rgba(201,168,76,0.3)",
          borderRadius: 20,
          padding: "28px 24px",
          width: "100%",
          maxWidth: 480,
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
        }}
      >
        {done ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 36, marginBottom: 14 }}>🙏</div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#f0f4ff", marginBottom: 10 }}>
              {ui.thanksTitle}
            </h2>
            <p style={{ fontSize: 13, color: "rgba(200,215,240,0.7)", lineHeight: 1.6, marginBottom: 24 }}>
              {ui.thanksBody}
            </p>
            <button
              type="button"
              onClick={onClose}
              style={{
                width: "100%",
                padding: "13px 0",
                borderRadius: 12,
                border: "none",
                background: "linear-gradient(135deg, #C9A84C, #E8C870)",
                color: "#0B1634",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              {ui.closeBtn}
            </button>
          </div>
        ) : (
          <>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: "clamp(16px,3vw,19px)", fontWeight: 800, color: "#f0f4ff", marginBottom: 6 }}>
                {ui.title}
              </h2>
              <p style={{ fontSize: 13, color: "rgba(200,215,240,0.6)" }}>{ui.subtitle}</p>
            </div>

            {/* Rating */}
            <div style={{ marginBottom: 18, textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(201,168,76,0.8)", marginBottom: 8, letterSpacing: "0.04em" }}>
                {ui.ratingLabel}
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 4 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHoverRating(n)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 28,
                      padding: 2,
                      lineHeight: 1,
                      color: n <= (hoverRating || rating) ? "rgba(201,168,76,0.95)" : "rgba(255,255,255,0.18)",
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(200,215,240,0.75)", display: "block", marginBottom: 6 }}>
                {ui.contentLabel}
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={ui.contentPlaceholder}
                rows={4}
                style={{
                  width: "100%",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(255,255,255,0.04)",
                  color: "#f0f4ff",
                  padding: "10px 12px",
                  fontSize: 13,
                  lineHeight: 1.6,
                  resize: "vertical",
                }}
              />
            </div>

            {/* Display name */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(200,215,240,0.75)", display: "block", marginBottom: 6 }}>
                {ui.displayNameLabel}
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={ui.displayNamePlaceholder}
                style={{
                  width: "100%",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(255,255,255,0.04)",
                  color: "#f0f4ff",
                  padding: "10px 12px",
                  fontSize: 13,
                }}
              />
            </div>

            {/* Country */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(200,215,240,0.75)", display: "block", marginBottom: 6 }}>
                {ui.countryLabel}
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder={ui.countryPlaceholder}
                style={{
                  width: "100%",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(255,255,255,0.04)",
                  color: "#f0f4ff",
                  padding: "10px 12px",
                  fontSize: 13,
                }}
              />
            </div>

            {error && (
              <p style={{ fontSize: 12, color: "rgba(220,80,80,0.9)", marginBottom: 14 }}>{error}</p>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  width: "100%",
                  padding: "13px 0",
                  borderRadius: 12,
                  border: "none",
                  background: "linear-gradient(135deg, #C9A84C, #E8C870)",
                  color: "#0B1634",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: submitting ? "default" : "pointer",
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? ui.submitting : ui.submitBtn}
              </button>
              <button
                type="button"
                onClick={onClose}
                style={{
                  width: "100%",
                  padding: "11px 0",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "transparent",
                  color: "rgba(200,215,240,0.5)",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {ui.cancelBtn}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
