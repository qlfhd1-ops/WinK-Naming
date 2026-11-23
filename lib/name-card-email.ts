/**
 * 이름카드 "선물 도착" 메일 본문
 *  1) 히어로: 한국 랜드마크 사진 위에 "당신의 한국 이름이 도착했어요" (사진은 분위기용 배경)
 *  2) 이름 증서: 금테 이중 테두리, 큰 이름·한자·뜻·발급일·붉은 인장 — 메일 글자(HTML)로 그려 사진 한 장이 아니라 '받는 선물'이 되게 한다
 *  3) 🔊 발음 듣기 버튼(메일에서는 소리를 재생할 수 없어 사이트의 발음 페이지로 연결)
 *  4) 이름 이야기 카드: 설계 배경·오행·획수·다국어 표기
 *  + 고객이 고른 스타일의 카드 이미지는 첨부 파일로 함께 보낸다(SNS 공유·보관용)
 *
 * 메일 클라이언트 호환을 위해 table 레이아웃 + 인라인 스타일만 사용한다.
 */

import { CARD_BACKGROUNDS } from "@/lib/card-backgrounds";

export type NameCardMailItem = {
  name: string;
  hanja: string;
  hanjaMeaning: string;
  meaning: string;
  story: string;
  english: string;
  chinese: string;
  chinesePinyin: string;
  japaneseKana: string;
  fiveElements: string;
  hanjaStrokes: string;
};

export type NameCardMailInput = {
  lang: string;
  item: NameCardMailItem;
  familyName?: string;
  purpose?: string;
  /** 카드 이미지를 첨부했는지(첨부 안내 문구 표시용) */
  hasImage: boolean;
  /** 고객이 카드 창에서 고른 스타일 id — 랜드마크 사진 스타일이면 같은 사진을 히어로에 쓴다 */
  cardStyle?: string;
  listenUrl: string;
  /** 선물 열기 페이지(/present?d=…) */
  giftUrl: string;
  siteUrl: string;
  /** 발급일(테스트용 주입). 기본은 현재 시각 */
  now?: Date;
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

type Copy = {
  subject: (n: string) => string;
  brand: string;
  heroKicker: string;
  heroTitle: string;
  certKicker: string;
  certLine: string;
  issued: string;
  openGift: string;
  openGiftSub: string;
  listen: string;
  listenSub: string;
  detailTitle: string;
  hanja: string;
  meaning: string;
  story: string;
  elements: string;
  strokes: string;
  global: string;
  social: string;
  more: string;
  moreBtn: string;
  spam: string;
  attachHint: string;
  family: string;
  purpose: string;
};

const BRAND = "WINK NAMING";

/** 9개 언어(ko/en/ja/zh/es/ru/fr/ar/hi) 메일 문구 */
const COPIES: Record<string, Copy> = {
  ko: {
    subject: (n) => `🎁 "${n}" — 당신의 한국 이름이 도착했어요`, brand: BRAND,
    heroKicker: "당신을 위한 선물", heroTitle: "당신의 한국 이름이\n도착했어요",
    certKicker: "한국 이름 증서", certLine: "윙크 네이밍이 정성껏 설계한, 오직 당신을 위한 이름입니다", issued: "발급일",
    openGift: "🎁 선물 열기", openGiftSub: "소리와 함께 이름이 펼쳐져요",
    listen: "🔊 발음 듣기", listenSub: "누르면 사이트에서 한국어 발음이 재생돼요",
    detailTitle: "이름 이야기", hanja: "한자", meaning: "이름 의미", story: "설계 배경", elements: "오행", strokes: "획수", global: "다국어 표기",
    social: "고객님이 선물하신 이름을 통해\n이름 없이 버려진 아이에게 선물을 줄 수 있게 되었습니다.\n윙크 네이밍은 소외된 아이들이 웃을 수 있게 돕고 있습니다. 🤍",
    more: "다른 이름이나 더 많은 카드 스타일이 궁금하신가요?", moreBtn: "윙크 네이밍에서 이어 보기",
    spam: "이 메일은 이름카드를 요청하셨을 때 한 번만 발송됩니다. 보이지 않으면 스팸함을 확인해 주세요.",
    attachHint: "첨부된 카드 이미지는 저장해서 SNS에 공유하거나 간직할 수 있어요.",
    family: "성씨", purpose: "목적",
  },
  en: {
    subject: (n) => `🎁 "${n}" — Your Korean name has arrived`, brand: BRAND,
    heroKicker: "A GIFT FOR YOU", heroTitle: "Your Korean name\nhas arrived",
    certKicker: "CERTIFICATE OF KOREAN NAME", certLine: "A name thoughtfully designed by Wink Naming, just for you", issued: "Issued",
    openGift: "🎁 Open your gift", openGiftSub: "Your name unfolds with sound",
    listen: "🔊 Hear the pronunciation", listenSub: "Opens the site and plays the Korean pronunciation",
    detailTitle: "The story of your name", hanja: "Hanja", meaning: "Meaning", story: "Design story", elements: "Five elements", strokes: "Strokes", global: "Global script",
    social: "Through the name you chose,\nyou helped give a gift to a child who had no name.\nWink Naming helps children who are left out smile again. 🤍",
    more: "Curious about other names or more card styles?", moreBtn: "Continue on Wink Naming",
    spam: "This email is sent once, when you request your name card. If you can't find it later, check your spam folder.",
    attachHint: "The attached card image is yours to save or share.",
    family: "Family name", purpose: "Purpose",
  },
  ja: {
    subject: (n) => `🎁「${n}」— あなたの韓国名が届きました`, brand: BRAND,
    heroKicker: "あなたへの贈り物", heroTitle: "あなたの韓国名が\n届きました",
    certKicker: "韓国名 証書", certLine: "Wink Namingが心を込めて設計した、あなただけのお名前です", issued: "発行日",
    openGift: "🎁 贈り物を開ける", openGiftSub: "音とともにお名前が現れます",
    listen: "🔊 発音を聞く", listenSub: "タップするとサイトで韓国語の発音が再生されます",
    detailTitle: "お名前のストーリー", hanja: "漢字", meaning: "名前の意味", story: "設計の背景", elements: "五行", strokes: "画数", global: "多言語表記",
    social: "お客様が贈ってくださったお名前を通じて、\n名前のない子どもに贈り物を届けることができました。\nWink Naming は、取り残された子どもたちが笑顔になれるよう支えています。🤍",
    more: "ほかの名前やカードスタイルも見てみませんか？", moreBtn: "Wink Naming で続きを見る",
    spam: "このメールは、名前カードをリクエストされたときに一度だけ送信されます。見当たらない場合は迷惑メールフォルダをご確認ください。",
    attachHint: "添付のカード画像は保存して、SNSで共有できます。",
    family: "姓", purpose: "目的",
  },
  zh: {
    subject: (n) => `🎁「${n}」— 您的韩文名字已送达`, brand: BRAND,
    heroKicker: "送给您的礼物", heroTitle: "您的韩文名字\n已送达",
    certKicker: "韩文名字证书", certLine: "由 Wink Naming 精心设计、只属于您的名字", issued: "颁发日期",
    openGift: "🎁 打开礼物", openGiftSub: "名字将伴随声音展开",
    listen: "🔊 收听发音", listenSub: "点击后将在网站播放韩语发音",
    detailTitle: "名字的故事", hanja: "汉字", meaning: "名字含义", story: "设计背景", elements: "五行", strokes: "笔画", global: "多语言写法",
    social: "通过您赠送的名字，\n我们得以向没有名字的孩子送上一份礼物。\nWink Naming 正在帮助被忽视的孩子重拾笑容。🤍",
    more: "想看看其他名字或更多卡片样式吗？", moreBtn: "继续访问 Wink Naming",
    spam: "此邮件仅在您申请名字卡时发送一次。如果没有看到，请检查垃圾邮件箱。",
    attachHint: "附件中的卡片图片可以保存，也可以分享到社交媒体。",
    family: "姓氏", purpose: "目的",
  },
  es: {
    subject: (n) => `🎁 «${n}» — Tu nombre coreano ha llegado`, brand: BRAND,
    heroKicker: "UN REGALO PARA TI", heroTitle: "Tu nombre coreano\nha llegado",
    certKicker: "CERTIFICADO DE NOMBRE COREANO", certLine: "Un nombre diseñado con esmero por Wink Naming, solo para ti", issued: "Emitido",
    openGift: "🎁 Abrir tu regalo", openGiftSub: "Tu nombre se despliega con sonido",
    listen: "🔊 Escuchar la pronunciación", listenSub: "Abre el sitio y reproduce la pronunciación en coreano",
    detailTitle: "La historia de tu nombre", hanja: "Hanja", meaning: "Significado", story: "Historia del diseño", elements: "Cinco elementos", strokes: "Trazos", global: "Escritura internacional",
    social: "Gracias al nombre que elegiste,\npudiste regalarle algo a un niño que no tenía nombre.\nWink Naming ayuda a que los niños olvidados vuelvan a sonreír. 🤍",
    more: "¿Quieres ver otros nombres o más estilos de tarjeta?", moreBtn: "Seguir en Wink Naming",
    spam: "Este correo se envía una sola vez, cuando solicitas tu tarjeta. Si no lo encuentras, revisa la carpeta de spam.",
    attachHint: "La imagen de la tarjeta adjunta es tuya para guardar o compartir.",
    family: "Apellido", purpose: "Objetivo",
  },
  ru: {
    subject: (n) => `🎁 «${n}» — Ваше корейское имя прибыло`, brand: BRAND,
    heroKicker: "ПОДАРОК ДЛЯ ВАС", heroTitle: "Ваше корейское имя\nприбыло",
    certKicker: "СЕРТИФИКАТ КОРЕЙСКОГО ИМЕНИ", certLine: "Имя, бережно созданное Wink Naming специально для вас", issued: "Дата выдачи",
    openGift: "🎁 Открыть подарок", openGiftSub: "Имя раскроется со звуком",
    listen: "🔊 Послушать произношение", listenSub: "Откроется сайт, где воспроизводится корейское произношение",
    detailTitle: "История вашего имени", hanja: "Ханча", meaning: "Значение", story: "История создания", elements: "Пять стихий", strokes: "Черты", global: "Написание на разных языках",
    social: "Благодаря выбранному вами имени\nвы смогли сделать подарок ребёнку, у которого не было имени.\nWink Naming помогает детям, оставшимся без внимания, снова улыбаться. 🤍",
    more: "Хотите увидеть другие имена и стили карточек?", moreBtn: "Продолжить на Wink Naming",
    spam: "Это письмо отправляется один раз, когда вы запрашиваете карточку. Если не нашли его, проверьте папку «Спам».",
    attachHint: "Прикреплённое изображение карточки можно сохранить или поделиться им.",
    family: "Фамилия", purpose: "Цель",
  },
  fr: {
    subject: (n) => `🎁 « ${n} » — Votre prénom coréen est arrivé`, brand: BRAND,
    heroKicker: "UN CADEAU POUR VOUS", heroTitle: "Votre prénom coréen\nest arrivé",
    certKicker: "CERTIFICAT DE PRÉNOM CORÉEN", certLine: "Un prénom conçu avec soin par Wink Naming, rien que pour vous", issued: "Délivré le",
    openGift: "🎁 Ouvrir votre cadeau", openGiftSub: "Votre prénom se dévoile avec le son",
    listen: "🔊 Écouter la prononciation", listenSub: "Ouvre le site et lit la prononciation coréenne",
    detailTitle: "L'histoire de votre prénom", hanja: "Hanja", meaning: "Signification", story: "Histoire de la conception", elements: "Cinq éléments", strokes: "Traits", global: "Écriture internationale",
    social: "Grâce au prénom que vous avez choisi,\nvous avez pu offrir un cadeau à un enfant sans nom.\nWink Naming aide les enfants laissés de côté à retrouver le sourire. 🤍",
    more: "Envie de découvrir d'autres prénoms ou d'autres styles de carte ?", moreBtn: "Continuer sur Wink Naming",
    spam: "Cet e-mail n'est envoyé qu'une seule fois, lorsque vous demandez votre carte. S'il reste introuvable, vérifiez votre dossier spam.",
    attachHint: "L'image de la carte en pièce jointe est à vous : enregistrez-la ou partagez-la.",
    family: "Nom", purpose: "Objectif",
  },
  ar: {
    subject: (n) => `🎁 «${n}» — وصل اسمك الكوري`, brand: BRAND,
    heroKicker: "هدية لك", heroTitle: "وصل اسمك الكوري",
    certKicker: "شهادة الاسم الكوري", certLine: "اسم صمّمته Wink Naming بعناية، لك وحدك", issued: "تاريخ الإصدار",
    openGift: "🎁 افتح هديتك", openGiftSub: "ينكشف اسمك مع الصوت",
    listen: "🔊 استمع إلى النطق", listenSub: "يفتح الموقع ويشغّل النطق الكوري",
    detailTitle: "قصة اسمك", hanja: "الهانجا", meaning: "المعنى", story: "قصة التصميم", elements: "العناصر الخمسة", strokes: "عدد الخطوط", global: "الكتابة بلغات متعددة",
    social: "من خلال الاسم الذي اخترته،\nتمكنت من تقديم هدية لطفل بلا اسم.\nيساعد Wink Naming الأطفال المهمَّشين على الابتسام من جديد. 🤍",
    more: "هل تود رؤية أسماء أخرى أو أنماط بطاقات أكثر؟", moreBtn: "تابع على Wink Naming",
    spam: "يُرسل هذا البريد مرة واحدة فقط عند طلب البطاقة. إذا لم تجده فتحقق من مجلد البريد العشوائي.",
    attachHint: "صورة البطاقة المرفقة لك لحفظها أو مشاركتها.",
    family: "اللقب", purpose: "الغرض",
  },
  hi: {
    subject: (n) => `🎁 "${n}" — आपका कोरियाई नाम आ गया है`, brand: BRAND,
    heroKicker: "आपके लिए एक उपहार", heroTitle: "आपका कोरियाई नाम\nआ गया है",
    certKicker: "कोरियाई नाम प्रमाणपत्र", certLine: "Wink Naming द्वारा सोच-समझकर बनाया गया, सिर्फ़ आपके लिए नाम", issued: "जारी करने की तिथि",
    openGift: "🎁 उपहार खोलें", openGiftSub: "आवाज़ के साथ आपका नाम सामने आएगा",
    listen: "🔊 उच्चारण सुनें", listenSub: "साइट खुलेगी और कोरियाई उच्चारण सुनाई देगा",
    detailTitle: "आपके नाम की कहानी", hanja: "हांजा", meaning: "अर्थ", story: "डिज़ाइन की कहानी", elements: "पाँच तत्व", strokes: "स्ट्रोक", global: "बहुभाषी लेखन",
    social: "आपके चुने हुए नाम के ज़रिए\nआप एक बिना नाम वाले बच्चे को उपहार दे पाए।\nWink Naming उपेक्षित बच्चों को फिर से मुस्कुराने में मदद करता है। 🤍",
    more: "अन्य नाम या और कार्ड स्टाइल देखना चाहेंगे?", moreBtn: "Wink Naming पर जारी रखें",
    spam: "यह ईमेल कार्ड मँगाने पर केवल एक बार भेजा जाता है। न दिखे तो स्पैम फ़ोल्डर देखें।",
    attachHint: "संलग्न कार्ड इमेज आप सेव या शेयर कर सकते हैं।",
    family: "उपनाम", purpose: "उद्देश्य",
  },
};

const NAVY = "#1B2A5E";
const GOLD = "#B8923A";
const PAPER = "#F3EEE4";
const CERT_BG = "#FFFDF7";
const SEAL = "#B3261E";
const SERIF = "'Noto Serif KR','Nanum Myeongjo','Batang',serif";
const SANS = "'Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic',Arial,sans-serif";
const SITE = "https://wink-naming.com";

/** 카드 창 스타일 id → 히어로 사진. 랜드마크 사진이 아닌 스타일이면 북촌 한옥마을을 쓴다. */
function heroPhoto(cardStyle: string | undefined): string {
  const id = cardStyle === "gwangan-frame" ? "gwangan-bridge" : cardStyle;
  const bg = CARD_BACKGROUNDS.find((b) => b.id === id) ?? CARD_BACKGROUNDS.find((b) => b.id === "hanok-village") ?? CARD_BACKGROUNDS[0];
  return `${SITE}${bg.image}`;
}

function issuedDate(lang: string, now: Date): string {
  try {
    return new Intl.DateTimeFormat(lang, { year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Seoul" }).format(now);
  } catch {
    return now.toISOString().slice(0, 10);
  }
}

function label(text: string): string {
  return `<div style="font-size:11px;letter-spacing:0.14em;font-weight:700;color:${GOLD};text-transform:uppercase;margin:0 0 6px;">${esc(text)}</div>`;
}

export function buildNameCardEmail(input: NameCardMailInput): { subject: string; html: string } {
  const c = COPIES[input.lang] ?? COPIES.en;
  const it = input.item;
  const dir = input.lang === "ar" ? "rtl" : "ltr";
  const photo = heroPhoto(input.cardStyle);
  const issued = issuedDate(input.lang in COPIES ? input.lang : "en", input.now ?? new Date());

  const subject = c.subject(it.name);

  const chips = [
    it.fiveElements ? `<span style="display:inline-block;margin:0 6px 6px 0;padding:5px 12px;border-radius:999px;background:#FBF6E8;border:1px solid #E4D9BE;font-size:12px;color:${NAVY};"><b style="color:${GOLD};">${esc(c.elements)}</b> ${esc(it.fiveElements)}</span>` : "",
    it.hanjaStrokes ? `<span style="display:inline-block;margin:0 6px 6px 0;padding:5px 12px;border-radius:999px;background:#FBF6E8;border:1px solid #E4D9BE;font-size:12px;color:${NAVY};"><b style="color:${GOLD};">${esc(c.strokes)}</b> ${esc(it.hanjaStrokes)}</span>` : "",
  ].join("");

  const heroTitle = esc(c.heroTitle).replace(/\n/g, "<br/>");

  // 히어로: 사진은 배경 분위기만. 글자는 HTML이라 사진이 안 보여도 읽힌다.
  const hero = `<tr><td align="center" bgcolor="${NAVY}" background="${esc(photo)}" style="background-color:${NAVY};background-image:url('${esc(photo)}');background-size:cover;background-position:center;border-radius:18px 18px 0 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:rgba(8,14,34,0.52);border-radius:18px 18px 0 0;">
        <tr><td align="center" style="padding:44px 20px 40px;">
          <div style="font-size:30px;line-height:1;margin-bottom:14px;">🎁</div>
          <div style="font-size:11px;letter-spacing:0.28em;font-weight:700;color:#E7CD8A;margin-bottom:12px;">${esc(c.heroKicker)}</div>
          <div style="font-family:${SERIF};font-size:27px;font-weight:900;line-height:1.35;color:#ffffff;">${heroTitle}</div>
        </td></tr>
      </table>
    </td></tr>`;

  const hanjaLine = it.hanja
    ? `<div style="font-family:${SERIF};font-size:24px;letter-spacing:8px;color:${NAVY};margin-top:16px;">${esc(it.hanja)}</div>
       ${it.hanjaMeaning ? `<div style="font-size:12px;line-height:1.7;color:#6B6558;margin-top:6px;">${esc(it.hanjaMeaning)}</div>` : ""}`
    : "";

  // 이름 증서: 금테 이중 테두리 + 붉은 인장
  const certificate = `<tr><td style="background:${PAPER};padding:0 0 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CERT_BG};border-left:2px solid ${GOLD};border-right:2px solid ${GOLD};border-bottom:2px solid ${GOLD};border-radius:0 0 18px 18px;">
        <tr><td style="padding:10px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #D9BC7A;">
            <tr><td align="center" style="padding:30px 18px 8px;">
              <div style="font-size:10px;letter-spacing:0.24em;font-weight:700;color:${GOLD};">${esc(c.certKicker)}</div>
              <div style="font-size:12px;line-height:1.7;color:#6B6558;margin-top:10px;">${esc(c.certLine)}</div>
            </td></tr>
            <tr><td align="center" style="padding:14px 18px 6px;">
              <div style="font-family:${SERIF};font-size:60px;font-weight:900;letter-spacing:8px;color:${NAVY};line-height:1.15;">${esc(it.name)}</div>
              ${it.english ? `<div style="font-size:14px;letter-spacing:0.12em;color:${GOLD};margin-top:8px;">${esc(it.english)}</div>` : ""}
              ${hanjaLine}
            </td></tr>
            ${it.meaning ? `<tr><td align="center" style="padding:18px 26px 6px;">
              <div style="width:40px;height:1px;background:#D9BC7A;margin:0 auto 14px;"></div>
              <div style="font-size:14px;line-height:1.85;color:${NAVY};">“${esc(it.meaning)}”</div>
            </td></tr>` : ""}
            <tr><td style="padding:18px 22px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                <td valign="bottom" style="font-size:11px;line-height:1.8;color:#8A8372;">
                  <div style="letter-spacing:0.14em;font-weight:700;color:${GOLD};">${esc(c.brand)}</div>
                  <div>${esc(c.issued)} · ${esc(issued)}</div>
                </td>
                <td width="64" align="right" valign="bottom">
                  <table role="presentation" cellpadding="0" cellspacing="0" style="background:${SEAL};border-radius:6px;transform:rotate(-6deg);"><tr>
                    <td align="center" style="width:52px;height:52px;color:#ffffff;font-family:${SERIF};font-size:17px;font-weight:900;line-height:1.15;letter-spacing:1px;">윙<br/>크</td>
                  </tr></table>
                </td>
              </tr></table>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </td></tr>`;

  const globalCell = (title: string, main: string, sub: string) =>
    `<td width="33%" valign="top" style="padding:0 4px;">
       <div style="background:#FBF6E8;border:1px solid #E4D9BE;border-radius:12px;padding:12px 6px;text-align:center;min-height:74px;">
         <div style="font-size:10px;letter-spacing:0.12em;font-weight:700;color:${GOLD};margin-bottom:6px;">${esc(title)}</div>
         <div style="font-size:16px;font-weight:700;color:${NAVY};line-height:1.4;">${esc(main || "-")}</div>
         ${sub ? `<div style="font-size:11px;color:#8A8372;margin-top:3px;">${esc(sub)}</div>` : ""}
       </div>
     </td>`;

  const html = `<!DOCTYPE html>
<html lang="${esc(input.lang)}" dir="${dir}">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="color-scheme" content="light only"/>
<title>${esc(subject)}</title>
</head>
<body style="margin:0;padding:0;background:${PAPER};font-family:${SANS};color:${NAVY};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAPER};">
<tr><td align="center" style="padding:24px 12px 28px;">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;">

    ${hero}
    ${certificate}

    <tr><td align="center" style="padding:28px 0 4px;">
      <a href="${esc(input.giftUrl)}" style="display:inline-block;padding:16px 40px;border-radius:999px;background:#C9A45C;color:${NAVY};font-size:17px;font-weight:800;text-decoration:none;">${esc(c.openGift)}</a>
      <div style="font-size:11px;color:#8A8372;margin-top:8px;">${esc(c.openGiftSub)}</div>
    </td></tr>
    <tr><td align="center" style="padding:20px 0 8px;">
      <a href="${esc(input.listenUrl)}" style="display:inline-block;padding:12px 30px;border-radius:999px;background:${NAVY};color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">${esc(c.listen)}</a>
      <div style="font-size:11px;color:#8A8372;margin-top:8px;">${esc(c.listenSub)}</div>
    </td></tr>
    ${input.hasImage ? `<tr><td align="center" style="padding:4px 12px 18px;font-size:12px;line-height:1.7;color:#6B6558;">📎 ${esc(c.attachHint)}</td></tr>` : `<tr><td style="padding:0 0 10px;"></td></tr>`}

    <tr><td style="padding:0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #E4D9BE;border-radius:18px;">
        <tr><td style="padding:24px 24px 8px;">
          <div style="font-size:12px;letter-spacing:0.16em;font-weight:700;color:${GOLD};text-align:center;padding-bottom:14px;border-bottom:1px solid #EFE6CF;">✦ ${esc(c.detailTitle)} ✦</div>
        </td></tr>
        <tr><td style="padding:16px 24px 6px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${chips ? `<tr><td style="padding:0 0 14px;">${chips}</td></tr>` : ""}
            ${it.story ? `<tr><td style="padding:0 0 20px;">${label(c.story)}
              <div style="font-size:14px;line-height:1.85;color:#4A4636;">${esc(it.story)}</div>
            </td></tr>` : ""}
            <tr><td style="padding:0 0 22px;">${label(c.global)}
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 -4px;width:calc(100% + 8px);"><tr>
                ${globalCell("EN", it.english, "")}
                ${globalCell("中文", it.chinese, it.chinesePinyin)}
                ${globalCell("日本語", it.japaneseKana, "")}
              </tr></table>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </td></tr>

    <tr><td style="padding:22px 12px 0;text-align:center;">
      <div style="font-size:13px;line-height:1.9;color:#6B6558;white-space:pre-line;">${esc(c.social)}</div>
    </td></tr>

    <tr><td align="center" style="padding:22px 0 0;">
      <div style="font-size:13px;color:#6B6558;margin-bottom:10px;">${esc(c.more)}</div>
      <a href="${esc(input.siteUrl)}" style="display:inline-block;padding:12px 28px;border-radius:12px;background:#C9A84C;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;">${esc(c.moreBtn)}</a>
    </td></tr>

    <tr><td style="padding:26px 8px 0;text-align:center;font-size:11px;line-height:1.8;color:#9A9382;">
      ${esc(c.spam)}<br/>
      윙크 네이밍 · Korean-style naming that elevates life's value
      ${input.familyName || input.purpose ? `<br/>${input.familyName ? esc(`${c.family} · ${input.familyName}`) : ""}${input.familyName && input.purpose ? " | " : ""}${input.purpose ? esc(`${c.purpose} · ${input.purpose.slice(0, 40)}`) : ""}` : ""}
    </td></tr>

  </table>
</td></tr>
</table>
</body>
</html>`;

  return { subject, html };
}
