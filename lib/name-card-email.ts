/**
 * 이름카드 메일 본문 (한 통에 두 가지 카드를 함께 담는다)
 *  1) 위쪽: 사이트의 멋진 네임카드 이미지(고객이 고른 스타일, 메일에 인라인 첨부 → cid:namecard)
 *  2) 아래쪽: 자세한 설계 카드(한자·뜻·오행·획수·설계 배경·다국어 표기)
 *  + 🔊 발음 듣기 버튼(메일에서는 소리를 재생할 수 없으므로 사이트의 발음 페이지로 연결)
 *
 * 메일 클라이언트 호환을 위해 table 레이아웃 + 인라인 스타일만 사용한다.
 */

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
  hasImage: boolean;
  listenUrl: string;
  siteUrl: string;
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

type Copy = {
  subject: (n: string) => string;
  brand: string;
  hello: string;
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
  saveHint: string;
  family: string;
  purpose: string;
};

const BRAND = "WINK NAMING · NAME CARD";

/** 9개 언어(ko/en/ja/zh/es/ru/fr/ar/hi) 메일 문구 */
const COPIES: Record<string, Copy> = {
  ko: {
    subject: (n) => `윙크 네이밍 — "${n}" 이름카드가 도착했어요`, brand: BRAND,
    hello: "선택하신 이름으로 만든 이름카드예요.",
    listen: "🔊 발음 듣기", listenSub: "누르면 사이트에서 한국어 발음이 재생돼요",
    detailTitle: "이름 설계 카드", hanja: "한자", meaning: "이름 의미", story: "설계 배경", elements: "오행", strokes: "획수", global: "다국어 표기",
    social: "고객님이 선물하신 이름을 통해\n이름 없이 버려진 아이에게 선물을 줄 수 있게 되었습니다.\n윙크 네이밍은 소외된 아이들이 웃을 수 있게 돕고 있습니다. 🤍",
    more: "다른 이름이나 더 많은 카드 스타일이 궁금하신가요?", moreBtn: "윙크 네이밍에서 이어 보기",
    spam: "이 메일은 이름카드를 요청하셨을 때 한 번만 발송됩니다. 보이지 않으면 스팸함을 확인해 주세요.",
    saveHint: "위 카드 이미지는 길게 누르거나 우클릭해서 저장·공유할 수 있어요.",
    family: "성씨", purpose: "목적",
  },
  en: {
    subject: (n) => `Wink Naming — Your "${n}" name card is here`, brand: BRAND,
    hello: "Here is the name card for the name you chose.",
    listen: "🔊 Hear the pronunciation", listenSub: "Opens the site and plays the Korean pronunciation",
    detailTitle: "Name design card", hanja: "Hanja", meaning: "Meaning", story: "Design story", elements: "Five elements", strokes: "Strokes", global: "Global script",
    social: "Through the name you chose,\nyou helped give a gift to a child who had no name.\nWink Naming helps children who are left out smile again. 🤍",
    more: "Curious about other names or more card styles?", moreBtn: "Continue on Wink Naming",
    spam: "This email is sent once, when you request your name card. If you can't find it later, check your spam folder.",
    saveHint: "Press and hold (or right-click) the card above to save or share it.",
    family: "Family name", purpose: "Purpose",
  },
  ja: {
    subject: (n) => `Wink Naming — 「${n}」の名前カードが届きました`, brand: BRAND,
    hello: "選んだお名前で作った名前カードです。",
    listen: "🔊 発音を聞く", listenSub: "タップするとサイトで韓国語の発音が再生されます",
    detailTitle: "名前の設計カード", hanja: "漢字", meaning: "名前の意味", story: "設計の背景", elements: "五行", strokes: "画数", global: "多言語表記",
    social: "お客様が贈ってくださったお名前を通じて、\n名前のない子どもに贈り物を届けることができました。\nWink Naming は、取り残された子どもたちが笑顔になれるよう支えています。🤍",
    more: "ほかの名前やカードスタイルも見てみませんか？", moreBtn: "Wink Naming で続きを見る",
    spam: "このメールは、名前カードをリクエストされたときに一度だけ送信されます。見当たらない場合は迷惑メールフォルダをご確認ください。",
    saveHint: "上のカード画像は長押し（または右クリック）で保存・共有できます。",
    family: "姓", purpose: "目的",
  },
  zh: {
    subject: (n) => `Wink Naming — 您的「${n}」名字卡已送达`, brand: BRAND,
    hello: "这是用您选定的名字制作的名字卡。",
    listen: "🔊 收听发音", listenSub: "点击后将在网站播放韩语发音",
    detailTitle: "名字设计卡", hanja: "汉字", meaning: "名字含义", story: "设计背景", elements: "五行", strokes: "笔画", global: "多语言写法",
    social: "通过您赠送的名字，\n我们得以向没有名字的孩子送上一份礼物。\nWink Naming 正在帮助被忽视的孩子重拾笑容。🤍",
    more: "想看看其他名字或更多卡片样式吗？", moreBtn: "继续访问 Wink Naming",
    spam: "此邮件仅在您申请名字卡时发送一次。如果没有看到，请检查垃圾邮件箱。",
    saveHint: "长按（或右键）上方的卡片图片即可保存或分享。",
    family: "姓氏", purpose: "目的",
  },
  es: {
    subject: (n) => `Wink Naming — Tu tarjeta de nombre «${n}» ha llegado`, brand: BRAND,
    hello: "Esta es la tarjeta del nombre que elegiste.",
    listen: "🔊 Escuchar la pronunciación", listenSub: "Abre el sitio y reproduce la pronunciación en coreano",
    detailTitle: "Tarjeta de diseño del nombre", hanja: "Hanja", meaning: "Significado", story: "Historia del diseño", elements: "Cinco elementos", strokes: "Trazos", global: "Escritura internacional",
    social: "Gracias al nombre que elegiste,\npudiste regalarle algo a un niño que no tenía nombre.\nWink Naming ayuda a que los niños olvidados vuelvan a sonreír. 🤍",
    more: "¿Quieres ver otros nombres o más estilos de tarjeta?", moreBtn: "Seguir en Wink Naming",
    spam: "Este correo se envía una sola vez, cuando solicitas tu tarjeta. Si no lo encuentras, revisa la carpeta de spam.",
    saveHint: "Mantén pulsada (o haz clic derecho en) la tarjeta de arriba para guardarla o compartirla.",
    family: "Apellido", purpose: "Objetivo",
  },
  ru: {
    subject: (n) => `Wink Naming — Ваша карточка имени «${n}»`, brand: BRAND,
    hello: "Это карточка для выбранного вами имени.",
    listen: "🔊 Послушать произношение", listenSub: "Откроется сайт, где воспроизводится корейское произношение",
    detailTitle: "Карточка разработки имени", hanja: "Ханча", meaning: "Значение", story: "История создания", elements: "Пять стихий", strokes: "Черты", global: "Написание на разных языках",
    social: "Благодаря выбранному вами имени\nвы смогли сделать подарок ребёнку, у которого не было имени.\nWink Naming помогает детям, оставшимся без внимания, снова улыбаться. 🤍",
    more: "Хотите увидеть другие имена и стили карточек?", moreBtn: "Продолжить на Wink Naming",
    spam: "Это письмо отправляется один раз, когда вы запрашиваете карточку. Если не нашли его, проверьте папку «Спам».",
    saveHint: "Нажмите и удерживайте (или щёлкните правой кнопкой) карточку выше, чтобы сохранить или поделиться.",
    family: "Фамилия", purpose: "Цель",
  },
  fr: {
    subject: (n) => `Wink Naming — Votre carte du prénom « ${n} » est arrivée`, brand: BRAND,
    hello: "Voici la carte du prénom que vous avez choisi.",
    listen: "🔊 Écouter la prononciation", listenSub: "Ouvre le site et lit la prononciation coréenne",
    detailTitle: "Carte de conception du prénom", hanja: "Hanja", meaning: "Signification", story: "Histoire de la conception", elements: "Cinq éléments", strokes: "Traits", global: "Écriture internationale",
    social: "Grâce au prénom que vous avez choisi,\nvous avez pu offrir un cadeau à un enfant sans nom.\nWink Naming aide les enfants laissés de côté à retrouver le sourire. 🤍",
    more: "Envie de découvrir d'autres prénoms ou d'autres styles de carte ?", moreBtn: "Continuer sur Wink Naming",
    spam: "Cet e-mail n'est envoyé qu'une seule fois, lorsque vous demandez votre carte. S'il reste introuvable, vérifiez votre dossier spam.",
    saveHint: "Appuyez longuement (ou clic droit) sur la carte ci-dessus pour l'enregistrer ou la partager.",
    family: "Nom", purpose: "Objectif",
  },
  ar: {
    subject: (n) => `Wink Naming — وصلت بطاقة اسم «${n}»`, brand: BRAND,
    hello: "هذه بطاقة الاسم الذي اخترته.",
    listen: "🔊 استمع إلى النطق", listenSub: "يفتح الموقع ويشغّل النطق الكوري",
    detailTitle: "بطاقة تصميم الاسم", hanja: "الهانجا", meaning: "المعنى", story: "قصة التصميم", elements: "العناصر الخمسة", strokes: "عدد الخطوط", global: "الكتابة بلغات متعددة",
    social: "من خلال الاسم الذي اخترته،\nتمكنت من تقديم هدية لطفل بلا اسم.\nيساعد Wink Naming الأطفال المهمَّشين على الابتسام من جديد. 🤍",
    more: "هل تود رؤية أسماء أخرى أو أنماط بطاقات أكثر؟", moreBtn: "تابع على Wink Naming",
    spam: "يُرسل هذا البريد مرة واحدة فقط عند طلب البطاقة. إذا لم تجده فتحقق من مجلد البريد العشوائي.",
    saveHint: "اضغط مطولًا (أو انقر بزر الفأرة الأيمن) على البطاقة أعلاه لحفظها أو مشاركتها.",
    family: "اللقب", purpose: "الغرض",
  },
  hi: {
    subject: (n) => `Wink Naming — आपका "${n}" नेम कार्ड आ गया है`, brand: BRAND,
    hello: "यह आपके चुने हुए नाम का नेम कार्ड है।",
    listen: "🔊 उच्चारण सुनें", listenSub: "साइट खुलेगी और कोरियाई उच्चारण सुनाई देगा",
    detailTitle: "नाम डिज़ाइन कार्ड", hanja: "हांजा", meaning: "अर्थ", story: "डिज़ाइन की कहानी", elements: "पाँच तत्व", strokes: "स्ट्रोक", global: "बहुभाषी लेखन",
    social: "आपके चुने हुए नाम के ज़रिए\nआप एक बिना नाम वाले बच्चे को उपहार दे पाए।\nWink Naming उपेक्षित बच्चों को फिर से मुस्कुराने में मदद करता है। 🤍",
    more: "अन्य नाम या और कार्ड स्टाइल देखना चाहेंगे?", moreBtn: "Wink Naming पर जारी रखें",
    spam: "यह ईमेल कार्ड मँगाने पर केवल एक बार भेजा जाता है। न दिखे तो स्पैम फ़ोल्डर देखें।",
    saveHint: "ऊपर के कार्ड को सेव या शेयर करने के लिए दबाकर रखें (या राइट-क्लिक करें)।",
    family: "उपनाम", purpose: "उद्देश्य",
  },
};

const NAVY = "#1B2A5E";
const GOLD = "#B8923A";
const PAPER = "#F3EEE4";
const SERIF = "'Noto Serif KR','Nanum Myeongjo','Batang',serif";
const SANS = "'Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic',Arial,sans-serif";

function label(text: string): string {
  return `<div style="font-size:11px;letter-spacing:0.14em;font-weight:700;color:${GOLD};text-transform:uppercase;margin:0 0 6px;">${esc(text)}</div>`;
}

export function buildNameCardEmail(input: NameCardMailInput): { subject: string; html: string } {
  const c = COPIES[input.lang] ?? COPIES.en;
  const it = input.item;
  const dir = input.lang === "ar" ? "rtl" : "ltr";

  const subject = c.subject(it.name);

  const chips = [
    it.fiveElements ? `<span style="display:inline-block;margin:0 6px 6px 0;padding:5px 12px;border-radius:999px;background:#FBF6E8;border:1px solid #E4D9BE;font-size:12px;color:${NAVY};"><b style="color:${GOLD};">${esc(c.elements)}</b> ${esc(it.fiveElements)}</span>` : "",
    it.hanjaStrokes ? `<span style="display:inline-block;margin:0 6px 6px 0;padding:5px 12px;border-radius:999px;background:#FBF6E8;border:1px solid #E4D9BE;font-size:12px;color:${NAVY};"><b style="color:${GOLD};">${esc(c.strokes)}</b> ${esc(it.hanjaStrokes)}</span>` : "",
  ].join("");

  const cardImage = input.hasImage
    ? `<tr><td style="padding:0 0 6px;">
        <img src="cid:namecard" alt="${esc(it.name)} name card" width="560" style="display:block;width:100%;max-width:560px;height:auto;border:0;" />
      </td></tr>
      <tr><td style="padding:0 0 22px;font-size:11px;line-height:1.6;color:#8A8372;text-align:center;">${esc(c.saveHint)}</td></tr>`
    : "";

  const hanjaBlock = it.hanja
    ? `<tr><td style="padding:0 0 18px;">${label(c.hanja)}
        <div style="font-family:${SERIF};font-size:28px;letter-spacing:6px;color:${NAVY};">${esc(it.hanja)}</div>
        ${it.hanjaMeaning ? `<div style="font-size:13px;line-height:1.6;color:#6B6558;margin-top:4px;">${esc(it.hanjaMeaning)}</div>` : ""}
      </td></tr>`
    : "";

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
<tr><td align="center" style="padding:28px 12px;">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;">

    <tr><td style="padding:0 4px 14px;text-align:center;">
      <div style="font-size:11px;letter-spacing:0.2em;font-weight:700;color:${GOLD};">${esc(c.brand)}</div>
    </td></tr>

    <tr><td style="padding:0 0 18px;text-align:center;">
      <div style="font-size:14px;color:#6B6558;line-height:1.7;margin-bottom:10px;">${esc(c.hello)}</div>
      <div style="font-family:${SERIF};font-size:52px;font-weight:900;letter-spacing:6px;color:${NAVY};line-height:1.15;">${esc(it.name)}</div>
      ${it.english ? `<div style="font-size:14px;letter-spacing:0.08em;color:${GOLD};margin-top:6px;">${esc(it.english)}</div>` : ""}
    </td></tr>

    ${cardImage}

    <tr><td align="center" style="padding:0 0 26px;">
      <a href="${esc(input.listenUrl)}" style="display:inline-block;padding:14px 34px;border-radius:999px;background:${NAVY};color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;">${esc(c.listen)}</a>
      <div style="font-size:11px;color:#8A8372;margin-top:8px;">${esc(c.listenSub)}</div>
    </td></tr>

    <tr><td style="padding:0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #E4D9BE;border-radius:18px;">
        <tr><td style="padding:26px 24px 8px;">
          <div style="font-size:12px;letter-spacing:0.16em;font-weight:700;color:${GOLD};text-align:center;padding-bottom:14px;border-bottom:1px solid #EFE6CF;">✦ ${esc(c.detailTitle)} ✦</div>
        </td></tr>
        <tr><td style="padding:16px 24px 6px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${hanjaBlock}
            ${chips ? `<tr><td style="padding:0 0 14px;">${chips}</td></tr>` : ""}
            <tr><td style="padding:0 0 18px;">${label(c.meaning)}
              <div style="font-size:15px;line-height:1.8;color:${NAVY};">${esc(it.meaning)}</div>
            </td></tr>
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
