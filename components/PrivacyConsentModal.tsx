"use client";

import { useState } from "react";

const BRAND = "윙크네이밍";

const COPY = {
  ko: {
    title: "개인정보 수집·이용 동의",
    betaBadge: "베타 서비스",
    trust: `${BRAND}은 입력하신 정보를 고객님의 이름설계 외 다른 용도로 사용하지 않습니다.`,
    intro: "이름 설계 서비스를 제공하기 위해 아래와 같이 개인정보를 수집·이용합니다.",
    items: [
      { label: "수집 항목", value: "이름 설계 목적, 성별, 성씨, 선호 분위기, 키워드, 언어 등 브리프 입력 정보" },
      { label: "이용 목적", value: "이름 설계 결과 생성 및 A/S 서비스 제공 목적으로만 사용" },
      { label: "보유 기간", value: "생성일로부터 90일 후 자동 삭제 (계정 탈퇴 시 즉시 삭제)" },
      { label: "제3자 제공", value: "없음 — 어떠한 제3자에게도 제공하지 않습니다" },
    ],
    rights: "수집된 정보에 대한 열람·수정·삭제를 언제든지 요청하실 수 있습니다.",
    required: "[필수] 개인정보 수집·이용에 동의합니다",
    privacyLink: "개인정보처리방침 전문 보기",
    agreeBtn: "동의하고 계속하기",
    cancelBtn: "취소",
    requiredError: "서비스 이용을 위해 동의가 필요합니다.",
  },
  en: {
    title: "Privacy & Data Consent",
    betaBadge: "Beta Service",
    trust: `${BRAND} uses your information solely for your name design — nothing else.`,
    intro: "We collect and use your personal data to provide the name design service as described below.",
    items: [
      { label: "Data collected", value: "Brief inputs: naming purpose, gender, family name, preferred style, keywords, and language" },
      { label: "Purpose", value: "Used only to generate name recommendations and provide after-service support" },
      { label: "Retention", value: "Automatically deleted 90 days after generation (or immediately upon account deletion)" },
      { label: "Third parties", value: "None — your data is never sold or shared with any third party" },
    ],
    rights: "You may request access, correction, or deletion of your data at any time.",
    required: "[Required] I agree to the collection and use of my personal data",
    privacyLink: "View full Privacy Policy",
    agreeBtn: "Agree & Continue",
    cancelBtn: "Cancel",
    requiredError: "Your consent is required to use this service.",
  },
  ja: {
    title: "個人情報の収集・利用に関する同意",
    betaBadge: "ベータサービス",
    trust: `${BRAND}は、入力いただいた情報をお名前の設計以外の目的には一切使用しません。`,
    intro: "ネーミング設計サービスを提供するため、以下のとおり個人情報を収集・利用します。",
    items: [
      { label: "収集項目", value: "命名目的、性別、姓、希望する雰囲気、キーワード、言語などのブリーフ入力情報" },
      { label: "利用目的", value: "名前候補の生成およびアフターサービスの提供のみに使用" },
      { label: "保有期間", value: "生成日から90日後に自動削除（アカウント削除時は即時削除）" },
      { label: "第三者提供", value: "なし — いかなる第三者にも提供・販売しません" },
    ],
    rights: "収集された情報について、いつでも開示・修正・削除を請求できます。",
    required: "【必須】個人情報の収集・利用に同意します",
    privacyLink: "プライバシーポリシー全文を見る",
    agreeBtn: "同意して続ける",
    cancelBtn: "キャンセル",
    requiredError: "サービスのご利用には同意が必要です。",
  },
  zh: {
    title: "个人信息收集与使用同意",
    betaBadge: "测试版服务",
    trust: `${BRAND}仅将您的输入信息用于命名设计，不会用于任何其他目的。`,
    intro: "为提供命名设计服务，我们将按如下方式收集和使用您的个人信息。",
    items: [
      { label: "收集项目", value: "命名目的、性别、姓氏、偏好风格、关键词、语言等设计简报信息" },
      { label: "使用目的", value: "仅用于生成名字推荐及提供售后服务" },
      { label: "保存期限", value: "生成后90天自动删除（注销账户时立即删除）" },
      { label: "第三方提供", value: "无 — 不向任何第三方出售或提供您的数据" },
    ],
    rights: "您可随时申请查阅、更正或删除所收集的信息。",
    required: "【必填】本人同意收集和使用个人信息",
    privacyLink: "查看完整隐私政策",
    agreeBtn: "同意并继续",
    cancelBtn: "取消",
    requiredError: "使用本服务需要您的同意。",
  },
  es: {
    title: "Consentimiento de Privacidad",
    betaBadge: "Servicio Beta",
    trust: `${BRAND} utiliza su información únicamente para el diseño de nombres — nunca para otro fin.`,
    intro: "Recopilamos y usamos sus datos personales para prestar el servicio de diseño de nombres tal como se describe a continuación.",
    items: [
      { label: "Datos recopilados", value: "Propósito del nombre, género, apellido, estilo preferido, palabras clave e idioma del brief" },
      { label: "Finalidad", value: "Solo para generar recomendaciones de nombres y brindar soporte posventa" },
      { label: "Retención", value: "Eliminados automáticamente 90 días después de la generación (o al eliminar la cuenta)" },
      { label: "Terceros", value: "Ninguno — sus datos no se venden ni se comparten con terceros" },
    ],
    rights: "Puede solicitar acceso, corrección o eliminación de sus datos en cualquier momento.",
    required: "[Obligatorio] Acepto la recopilación y el uso de mis datos personales",
    privacyLink: "Ver Política de Privacidad completa",
    agreeBtn: "Aceptar y continuar",
    cancelBtn: "Cancelar",
    requiredError: "Se requiere su consentimiento para usar este servicio.",
  },
  ru: {
    title: "Согласие на обработку персональных данных",
    betaBadge: "Бета-сервис",
    trust: `${BRAND} использует введённые вами данные исключительно для разработки имени — ни для каких иных целей.`,
    intro: "Для предоставления услуги по разработке имён мы собираем и используем ваши персональные данные, как описано ниже.",
    items: [
      { label: "Собираемые данные", value: "Краткое описание: цель именования, пол, фамилия, предпочтительный стиль, ключевые слова, язык" },
      { label: "Цель обработки", value: "Только для создания рекомендаций по именам и послепродажной поддержки" },
      { label: "Срок хранения", value: "Автоматически удаляются через 90 дней после генерации (или немедленно при удалении аккаунта)" },
      { label: "Третьи лица", value: "Нет — данные не продаются и не передаются третьим лицам" },
    ],
    rights: "Вы вправе запросить доступ, исправление или удаление своих данных в любое время.",
    required: "[Обязательно] Я согласен(а) на сбор и использование моих персональных данных",
    privacyLink: "Просмотреть полную Политику конфиденциальности",
    agreeBtn: "Принять и продолжить",
    cancelBtn: "Отмена",
    requiredError: "Для использования сервиса необходимо ваше согласие.",
  },
  fr: {
    title: "Consentement à la confidentialité",
    betaBadge: "Service Bêta",
    trust: `${BRAND} utilise vos informations uniquement pour la conception de votre prénom — jamais à d'autres fins.`,
    intro: "Nous collectons et utilisons vos données personnelles pour fournir le service de conception de noms, comme décrit ci-dessous.",
    items: [
      { label: "Données collectées", value: "Objectif du nom, genre, nom de famille, style préféré, mots-clés et langue du brief" },
      { label: "Finalité", value: "Uniquement pour générer des recommandations de noms et fournir un support après-vente" },
      { label: "Conservation", value: "Supprimées automatiquement 90 jours après la génération (ou immédiatement à la suppression du compte)" },
      { label: "Tiers", value: "Aucun — vos données ne sont jamais vendues ni partagées avec des tiers" },
    ],
    rights: "Vous pouvez demander l'accès, la rectification ou la suppression de vos données à tout moment.",
    required: "[Obligatoire] J'accepte la collecte et l'utilisation de mes données personnelles",
    privacyLink: "Voir la Politique de confidentialité complète",
    agreeBtn: "Accepter et continuer",
    cancelBtn: "Annuler",
    requiredError: "Votre consentement est requis pour utiliser ce service.",
  },
  ar: {
    title: "موافقة على الخصوصية وجمع البيانات",
    betaBadge: "خدمة تجريبية",
    trust: `يستخدم ${BRAND} معلوماتك فقط لتصميم اسمك — ولا شيء آخر على الإطلاق.`,
    intro: "نجمع بياناتك الشخصية ونستخدمها لتقديم خدمة تصميم الأسماء على النحو الموضح أدناه.",
    items: [
      { label: "البيانات المجمَّعة", value: "معلومات الملخص: غرض التسمية، الجنس، اسم العائلة، الأسلوب المفضل، الكلمات المفتاحية، واللغة" },
      { label: "الغرض", value: "تُستخدم فقط لإنشاء توصيات الأسماء وتقديم دعم ما بعد البيع" },
      { label: "مدة الاحتفاظ", value: "تُحذف تلقائياً بعد 90 يوماً من الإنشاء (أو فوراً عند حذف الحساب)" },
      { label: "أطراف ثالثة", value: "لا أحد — لا تُباع بياناتك أو تُشارَك مع أي طرف ثالث" },
    ],
    rights: "يمكنك طلب الاطلاع على بياناتك أو تصحيحها أو حذفها في أي وقت.",
    required: "[إلزامي] أوافق على جمع بياناتي الشخصية واستخدامها",
    privacyLink: "عرض سياسة الخصوصية الكاملة",
    agreeBtn: "موافقة والمتابعة",
    cancelBtn: "إلغاء",
    requiredError: "موافقتك مطلوبة لاستخدام هذه الخدمة.",
  },
  hi: {
    title: "गोपनीयता एवं डेटा सहमति",
    betaBadge: "बीटा सेवा",
    trust: `${BRAND} आपकी जानकारी केवल आपके नाम डिज़ाइन के लिए उपयोग करता है — किसी अन्य उद्देश्य के लिए नहीं।`,
    intro: "नाम डिज़ाइन सेवा प्रदान करने के लिए हम आपका व्यक्तिगत डेटा नीचे बताए अनुसार एकत्र और उपयोग करते हैं।",
    items: [
      { label: "एकत्र डेटा", value: "ब्रीफ इनपुट: नाम का उद्देश्य, लिंग, उपनाम, पसंदीदा शैली, कीवर्ड और भाषा" },
      { label: "उद्देश्य", value: "केवल नाम सुझाव उत्पन्न करने और आफ्टर-सेल सेवा प्रदान करने के लिए उपयोग" },
      { label: "संरक्षण अवधि", value: "उत्पन्न होने के 90 दिन बाद स्वत: हटाया जाएगा (खाता हटाने पर तत्काल)" },
      { label: "तृतीय पक्ष", value: "कोई नहीं — आपका डेटा किसी तृतीय पक्ष को बेचा या साझा नहीं किया जाता" },
    ],
    rights: "आप किसी भी समय अपने डेटा तक पहुँच, सुधार या हटाने का अनुरोध कर सकते हैं।",
    required: "[अनिवार्य] मैं अपने व्यक्तिगत डेटा के संग्रह और उपयोग के लिए सहमत हूँ",
    privacyLink: "पूर्ण गोपनीयता नीति देखें",
    agreeBtn: "सहमत हैं और जारी रखें",
    cancelBtn: "रद्द करें",
    requiredError: "इस सेवा का उपयोग करने के लिए आपकी सहमति आवश्यक है।",
  },
} as const;

type UiLang = keyof typeof COPY;

function toLang(lang: string): UiLang {
  return lang in COPY ? (lang as UiLang) : "ko";
}

interface Props {
  lang: string;
  onAgree: () => void;
  onCancel: () => void;
}

export default function PrivacyConsentModal({ lang, onAgree, onCancel }: Props) {
  const ui = COPY[toLang(lang)];
  const [checked, setChecked] = useState(false);
  const [showError, setShowError] = useState(false);
  const isRtl = lang === "ar";

  const handleAgree = () => {
    if (!checked) {
      setShowError(true);
      return;
    }
    onAgree();
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
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        dir={isRtl ? "rtl" : "ltr"}
        style={{
          background: "linear-gradient(160deg, rgba(11,22,52,0.99), rgba(6,13,34,0.99))",
          border: "1px solid rgba(91,164,212,0.3)",
          borderRadius: 20,
          padding: "28px 24px",
          width: "100%",
          maxWidth: 520,
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
        }}
      >
        {/* Beta badge + Title */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{
            display: "inline-block",
            fontSize: 11,
            fontWeight: 700,
            padding: "3px 10px",
            borderRadius: 999,
            background: "rgba(91,164,212,0.15)",
            color: "rgba(91,164,212,0.9)",
            border: "1px solid rgba(91,164,212,0.35)",
            marginBottom: 10,
            letterSpacing: "0.05em",
          }}>
            {ui.betaBadge}
          </div>
          <div style={{ fontSize: 28, marginBottom: 10 }}>🔒</div>
          <h2 style={{
            fontSize: "clamp(15px,3vw,18px)",
            fontWeight: 800,
            color: "#f0f4ff",
            marginBottom: 0,
            lineHeight: 1.4,
          }}>
            {ui.title}
          </h2>
        </div>

        {/* Trust message */}
        <div style={{
          background: "linear-gradient(135deg, rgba(91,164,212,0.12), rgba(8,18,48,0.5))",
          border: "1px solid rgba(91,164,212,0.25)",
          borderRadius: 12,
          padding: "12px 16px",
          marginBottom: 18,
          fontSize: 13,
          color: "rgba(180,210,240,0.95)",
          lineHeight: 1.6,
          textAlign: "center",
          fontStyle: "italic",
        }}>
          {ui.trust}
        </div>

        {/* Intro */}
        <p style={{ fontSize: 13, color: "rgba(200,215,240,0.7)", marginBottom: 14, lineHeight: 1.6 }}>
          {ui.intro}
        </p>

        {/* Data items table */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {ui.items.map((item) => (
            <div key={item.label} style={{
              display: "flex",
              gap: 10,
              padding: "10px 14px",
              borderRadius: 10,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              alignItems: "flex-start",
            }}>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                color: "rgba(91,164,212,0.85)",
                minWidth: 68,
                paddingTop: 1,
                flexShrink: 0,
                letterSpacing: "0.02em",
              }}>
                {item.label}
              </span>
              <span style={{ fontSize: 12, color: "rgba(200,215,240,0.75)", lineHeight: 1.6 }}>
                {item.value}
              </span>
            </div>
          ))}
        </div>

        {/* User rights */}
        <p style={{ fontSize: 12, color: "rgba(200,215,240,0.55)", marginBottom: 16, lineHeight: 1.6 }}>
          {ui.rights}
        </p>

        {/* Privacy policy link */}
        <div style={{ marginBottom: 20, textAlign: "center" }}>
          <a
            href={`/${lang}/privacy`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 12, color: "rgba(91,164,212,0.8)", textDecoration: "underline" }}
          >
            {ui.privacyLink}
          </a>
        </div>

        {/* Consent checkbox */}
        <label style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          cursor: "pointer",
          padding: "12px 14px",
          borderRadius: 10,
          border: `1px solid ${checked ? "rgba(91,164,212,0.5)" : showError ? "rgba(220,60,60,0.5)" : "rgba(255,255,255,0.15)"}`,
          background: checked ? "rgba(91,164,212,0.08)" : showError ? "rgba(220,60,60,0.05)" : "rgba(255,255,255,0.03)",
          marginBottom: showError ? 6 : 20,
          transition: "border-color 0.2s, background 0.2s",
        }}>
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => {
              setChecked(e.target.checked);
              if (e.target.checked) setShowError(false);
            }}
            style={{ marginTop: 2, accentColor: "#5BA4D4", width: 16, height: 16, flexShrink: 0, cursor: "pointer" }}
          />
          <span style={{ fontSize: 13, color: checked ? "rgba(200,215,240,0.95)" : "rgba(200,215,240,0.7)", lineHeight: 1.5 }}>
            {ui.required}
          </span>
        </label>

        {showError && (
          <p style={{ fontSize: 12, color: "rgba(220,80,80,0.9)", marginBottom: 16, paddingLeft: 4 }}>
            {ui.requiredError}
          </p>
        )}

        {/* Action buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            type="button"
            onClick={handleAgree}
            style={{
              width: "100%",
              padding: "13px 0",
              borderRadius: 12,
              border: "none",
              background: "linear-gradient(135deg, #5BA4D4, #3880B0)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            {ui.agreeBtn}
          </button>
          <button
            type="button"
            onClick={onCancel}
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
      </div>
    </div>
  );
}
