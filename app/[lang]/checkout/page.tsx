"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { AppLang, isSupportedLang } from "@/lib/lang-config";
import { clearCart, getCartItems, type CartItem } from "@/lib/cart";

// ─── Types ───────────────────────────────────────────────────
type CustomerForm = {
  name: string;
  email: string;
  note: string;
};

type ShippingAddr = {
  country: string;
  recipient: string;
  phone: string;
  address: string;
  address2: string;
  city: string;
  state: string;
  postal: string;
};

type ShippingResult = {
  shipping_fee: number;
  base_fee: number;
  is_free: boolean;
  free_reason: "event" | "threshold" | null;
  estimated_days: string;
  zone: string;
};

// ─── Country list ────────────────────────────────────────────
const COUNTRIES = [
  { code: "KR", flag: "🇰🇷", label_ko: "대한민국", label_en: "South Korea" },
  { code: "JP", flag: "🇯🇵", label_ko: "일본",     label_en: "Japan" },
  { code: "CN", flag: "🇨🇳", label_ko: "중국",     label_en: "China" },
  { code: "TW", flag: "🇹🇼", label_ko: "대만",     label_en: "Taiwan" },
  { code: "HK", flag: "🇭🇰", label_ko: "홍콩",     label_en: "Hong Kong" },
  { code: "SG", flag: "🇸🇬", label_ko: "싱가포르", label_en: "Singapore" },
  { code: "TH", flag: "🇹🇭", label_ko: "태국",     label_en: "Thailand" },
  { code: "VN", flag: "🇻🇳", label_ko: "베트남",   label_en: "Vietnam" },
  { code: "MY", flag: "🇲🇾", label_ko: "말레이시아",label_en: "Malaysia" },
  { code: "ID", flag: "🇮🇩", label_ko: "인도네시아",label_en: "Indonesia" },
  { code: "PH", flag: "🇵🇭", label_ko: "필리핀",   label_en: "Philippines" },
  { code: "US", flag: "🇺🇸", label_ko: "미국",     label_en: "United States" },
  { code: "CA", flag: "🇨🇦", label_ko: "캐나다",   label_en: "Canada" },
  { code: "AU", flag: "🇦🇺", label_ko: "호주",     label_en: "Australia" },
  { code: "GB", flag: "🇬🇧", label_ko: "영국",     label_en: "United Kingdom" },
  { code: "DE", flag: "🇩🇪", label_ko: "독일",     label_en: "Germany" },
  { code: "FR", flag: "🇫🇷", label_ko: "프랑스",   label_en: "France" },
  { code: "IT", flag: "🇮🇹", label_ko: "이탈리아", label_en: "Italy" },
  { code: "ES", flag: "🇪🇸", label_ko: "스페인",   label_en: "Spain" },
  { code: "NL", flag: "🇳🇱", label_ko: "네덜란드", label_en: "Netherlands" },
  { code: "SE", flag: "🇸🇪", label_ko: "스웨덴",   label_en: "Sweden" },
  { code: "NO", flag: "🇳🇴", label_ko: "노르웨이", label_en: "Norway" },
  { code: "CH", flag: "🇨🇭", label_ko: "스위스",   label_en: "Switzerland" },
  { code: "OTHER", flag: "🌐", label_ko: "기타 국가", label_en: "Other" },
] as const;

type CountryCode = typeof COUNTRIES[number]["code"];

const LATEST_ORDER_STORAGE_KEY = "wink.naming.latest-order";
const FREE_THRESHOLD = 50_000;

// ─── COPY ────────────────────────────────────────────────────
const COPY = {
  ko: {
    chip: "Wink Checkout",
    title: "주문 요약",
    sub: "선택한 패키지와 배송지를 확인한 뒤 주문을 저장합니다.",
    cartEmpty: "장바구니가 비어 있습니다.",
    loading: "주문 정보를 불러오고 있습니다...",
    goCart: "장바구니로 이동",
    goNaming: "이름 설계하러 가기",
    itemsTitle: "선택한 상품",
    customerTitle: "주문자 정보",
    shippingTitle: "배송지 정보",
    shippingCountry: "배송 국가",
    shippingRecipient: "받는 분 이름",
    shippingPhone: "연락처",
    shippingAddress: "주소",
    shippingAddress2: "상세주소 (동·호수 등)",
    shippingCity: "시/군/구",
    shippingState: "도/광역시",
    shippingPostal: "우편번호",
    shippingRecipientPh: "받는 분 성함",
    shippingPhonePh: "010-0000-0000",
    shippingAddressPh: "도로명 주소",
    shippingAddress2Ph: "상세주소",
    shippingCityPh: "예: 서울시 강남구",
    shippingStatePh: "예: 서울특별시",
    shippingPostalPh: "우편번호 5자리",
    feeLabel: "배송비",
    feeFreeEvent: "무료 (출시 이벤트)",
    feeFreeThreshold: "무료 (5만원 이상)",
    feeCalculating: "계산 중...",
    estimatedDays: "예상 소요",
    subtotalLabel: "상품 금액",
    totalTitle: "총 결제 예정 금액",
    quantity: "수량",
    briefId: "브리프 ID",
    name: "이름",
    email: "이메일",
    note: "요청 메모",
    namePh: "주문자 이름",
    emailPh: "name@email.com",
    notePh: "인장 문구, 추가 요청 등",
    submit: "주문 저장",
    submitting: "저장 중...",
    orderSaveFailed: "주문 저장에 실패했습니다.",
    orderProcessFailed: "주문 처리 중 오류가 발생했습니다.",
    invalidEmail: "올바른 이메일을 입력해 주세요.",
    invalidName: "이름을 입력해 주세요.",
    freeBadge: "무료배송",
    days: "일",
  },
  en: {
    chip: "Wink Checkout",
    title: "Checkout Summary",
    sub: "Review your selected items and shipping address before saving the order.",
    cartEmpty: "Your cart is empty.",
    loading: "Loading your order information...",
    goCart: "Go to Cart",
    goNaming: "Go to Naming",
    itemsTitle: "Selected Items",
    customerTitle: "Customer Information",
    shippingTitle: "Shipping Address",
    shippingCountry: "Country",
    shippingRecipient: "Recipient Name",
    shippingPhone: "Phone",
    shippingAddress: "Address",
    shippingAddress2: "Address Line 2",
    shippingCity: "City",
    shippingState: "State / Province",
    shippingPostal: "Postal Code",
    shippingRecipientPh: "Recipient full name",
    shippingPhonePh: "+1 000 000 0000",
    shippingAddressPh: "Street address",
    shippingAddress2Ph: "Apt, suite, unit, etc.",
    shippingCityPh: "City",
    shippingStatePh: "State / Province",
    shippingPostalPh: "Postal code",
    feeLabel: "Shipping",
    feeFreeEvent: "Free (Launch event)",
    feeFreeThreshold: "Free (Order ₩50,000+)",
    feeCalculating: "Calculating...",
    estimatedDays: "Est. delivery",
    subtotalLabel: "Subtotal",
    totalTitle: "Estimated Total",
    quantity: "Qty",
    briefId: "Brief ID",
    name: "Name",
    email: "Email",
    note: "Note",
    namePh: "Customer name",
    emailPh: "name@email.com",
    notePh: "Seal text, delivery notes, etc.",
    submit: "Save Order",
    submitting: "Saving...",
    orderSaveFailed: "Failed to save order.",
    orderProcessFailed: "An error occurred while processing the order.",
    invalidEmail: "Please enter a valid email address.",
    invalidName: "Please enter your name.",
    freeBadge: "Free shipping",
    days: " days",
  },
  ja: {
    chip: "Wink Checkout",
    title: "注文概要",
    sub: "選択した商品と配送先を確認してから注文を保存します。",
    cartEmpty: "カートが空です。",
    loading: "注文情報を読み込んでいます...",
    goCart: "カートへ",
    goNaming: "ネーミングへ",
    itemsTitle: "選択した商品",
    customerTitle: "注文者情報",
    shippingTitle: "配送先情報",
    shippingCountry: "配送国",
    shippingRecipient: "受取人氏名",
    shippingPhone: "電話番号",
    shippingAddress: "住所",
    shippingAddress2: "住所2（部屋番号など）",
    shippingCity: "市区町村",
    shippingState: "都道府県",
    shippingPostal: "郵便番号",
    shippingRecipientPh: "受取人フルネーム",
    shippingPhonePh: "090-0000-0000",
    shippingAddressPh: "番地・マンション名",
    shippingAddress2Ph: "部屋番号など",
    shippingCityPh: "例：渋谷区",
    shippingStatePh: "例：東京都",
    shippingPostalPh: "郵便番号（ハイフンあり）",
    feeLabel: "送料",
    feeFreeEvent: "無料（ローンチイベント）",
    feeFreeThreshold: "無料（₩50,000以上）",
    feeCalculating: "計算中...",
    estimatedDays: "配送予定",
    subtotalLabel: "小計",
    totalTitle: "お支払い予定金額",
    quantity: "数量",
    briefId: "ブリーフ ID",
    name: "名前",
    email: "メール",
    note: "要望メモ",
    namePh: "注文者名",
    emailPh: "name@email.com",
    notePh: "印章文言、配送メモなど",
    submit: "注文を保存",
    submitting: "保存中...",
    orderSaveFailed: "注文保存に失敗しました。",
    orderProcessFailed: "注文処理中にエラーが発生しました。",
    invalidEmail: "有効なメールアドレスを入力してください。",
    invalidName: "名前を入力してください。",
    freeBadge: "送料無料",
    days: "日",
  },
  zh: {
    chip: "Wink Checkout",
    title: "订单摘要",
    sub: "请确认所选商品与收货地址后保存订单。",
    cartEmpty: "购物车为空。",
    loading: "正在加载订单信息...",
    goCart: "前往购物车",
    goNaming: "前往命名",
    itemsTitle: "已选商品",
    customerTitle: "订购人信息",
    shippingTitle: "收货地址",
    shippingCountry: "收货国家",
    shippingRecipient: "收件人姓名",
    shippingPhone: "联系电话",
    shippingAddress: "地址",
    shippingAddress2: "详细地址（楼号、房间号等）",
    shippingCity: "城市/区",
    shippingState: "省/直辖市",
    shippingPostal: "邮政编码",
    shippingRecipientPh: "收件人全名",
    shippingPhonePh: "+86 000 0000 0000",
    shippingAddressPh: "街道地址",
    shippingAddress2Ph: "详细地址",
    shippingCityPh: "例：朝阳区",
    shippingStatePh: "例：北京市",
    shippingPostalPh: "邮政编码",
    feeLabel: "运费",
    feeFreeEvent: "免费（开业活动）",
    feeFreeThreshold: "免费（满₩50,000）",
    feeCalculating: "计算中...",
    estimatedDays: "预计送达",
    subtotalLabel: "商品金额",
    totalTitle: "预计支付总额",
    quantity: "数量",
    briefId: "简报 ID",
    name: "姓名",
    email: "邮箱",
    note: "备注",
    namePh: "订购人姓名",
    emailPh: "name@email.com",
    notePh: "印章文案、配送备注等",
    submit: "保存订单",
    submitting: "保存中...",
    orderSaveFailed: "订单保存失败。",
    orderProcessFailed: "订单处理过程中发生错误。",
    invalidEmail: "请输入有效的邮箱地址。",
    invalidName: "请输入姓名。",
    freeBadge: "免费配送",
    days: "天",
  },
  es: {
    chip: "Wink Checkout",
    title: "Resumen del pedido",
    sub: "Revise los productos seleccionados y la dirección de envío antes de guardar el pedido.",
    cartEmpty: "El carrito está vacío.",
    loading: "Cargando la información del pedido...",
    goCart: "Ir al carrito",
    goNaming: "Ir a Naming",
    itemsTitle: "Productos seleccionados",
    customerTitle: "Información del cliente",
    shippingTitle: "Dirección de envío",
    shippingCountry: "País de envío",
    shippingRecipient: "Nombre del destinatario",
    shippingPhone: "Teléfono",
    shippingAddress: "Dirección",
    shippingAddress2: "Dirección 2",
    shippingCity: "Ciudad",
    shippingState: "Estado / Provincia",
    shippingPostal: "Código postal",
    shippingRecipientPh: "Nombre completo",
    shippingPhonePh: "+34 000 000 000",
    shippingAddressPh: "Calle y número",
    shippingAddress2Ph: "Piso, puerta, etc.",
    shippingCityPh: "Ciudad",
    shippingStatePh: "Provincia",
    shippingPostalPh: "Código postal",
    feeLabel: "Envío",
    feeFreeEvent: "Gratis (evento de lanzamiento)",
    feeFreeThreshold: "Gratis (pedido +₩50.000)",
    feeCalculating: "Calculando...",
    estimatedDays: "Entrega est.",
    subtotalLabel: "Subtotal",
    totalTitle: "Total estimado",
    quantity: "Cant.",
    briefId: "ID del brief",
    name: "Nombre",
    email: "Correo",
    note: "Nota",
    namePh: "Nombre del cliente",
    emailPh: "name@email.com",
    notePh: "Texto del sello, notas de envío, etc.",
    submit: "Guardar pedido",
    submitting: "Guardando...",
    orderSaveFailed: "No se pudo guardar el pedido.",
    orderProcessFailed: "Ocurrió un error al procesar el pedido.",
    invalidEmail: "Ingrese un correo válido.",
    invalidName: "Ingrese su nombre.",
    freeBadge: "Envío gratis",
    days: " días",
  },
  ru: {
    chip: "Wink Checkout",
    title: "Итог заказа",
    sub: "Проверьте выбранные товары и адрес доставки перед сохранением заказа.",
    cartEmpty: "Корзина пуста.",
    loading: "Загрузка информации о заказе...",
    goCart: "Перейти в корзину",
    goNaming: "Перейти к именованию",
    itemsTitle: "Выбранные товары",
    customerTitle: "Данные покупателя",
    shippingTitle: "Адрес доставки",
    shippingCountry: "Страна доставки",
    shippingRecipient: "Имя получателя",
    shippingPhone: "Телефон",
    shippingAddress: "Адрес",
    shippingAddress2: "Адрес (строка 2)",
    shippingCity: "Город",
    shippingState: "Регион / Область",
    shippingPostal: "Почтовый индекс",
    shippingRecipientPh: "Полное имя получателя",
    shippingPhonePh: "+7 000 000 0000",
    shippingAddressPh: "Улица и номер дома",
    shippingAddress2Ph: "Квартира, офис и т.д.",
    shippingCityPh: "Город",
    shippingStatePh: "Регион / Область",
    shippingPostalPh: "Почтовый индекс",
    feeLabel: "Доставка",
    feeFreeEvent: "Бесплатно (акция запуска)",
    feeFreeThreshold: "Бесплатно (заказ от ₩50 000)",
    feeCalculating: "Расчёт...",
    estimatedDays: "Ориент. доставка",
    subtotalLabel: "Сумма товаров",
    totalTitle: "Итоговая сумма",
    quantity: "Кол-во",
    briefId: "ID брифа",
    name: "Имя",
    email: "Email",
    note: "Примечание",
    namePh: "Имя покупателя",
    emailPh: "name@email.com",
    notePh: "Текст печати, пожелания по доставке и т.д.",
    submit: "Сохранить заказ",
    submitting: "Сохранение...",
    orderSaveFailed: "Не удалось сохранить заказ.",
    orderProcessFailed: "Ошибка при обработке заказа.",
    invalidEmail: "Введите корректный email.",
    invalidName: "Введите ваше имя.",
    freeBadge: "Бесплатная доставка",
    days: " дней",
  },
  fr: {
    chip: "Wink Checkout",
    title: "Récapitulatif de commande",
    sub: "Vérifiez les articles sélectionnés et l'adresse de livraison avant d'enregistrer la commande.",
    cartEmpty: "Votre panier est vide.",
    loading: "Chargement de la commande...",
    goCart: "Aller au panier",
    goNaming: "Aller au naming",
    itemsTitle: "Articles sélectionnés",
    customerTitle: "Informations client",
    shippingTitle: "Adresse de livraison",
    shippingCountry: "Pays de livraison",
    shippingRecipient: "Nom du destinataire",
    shippingPhone: "Téléphone",
    shippingAddress: "Adresse",
    shippingAddress2: "Complément d'adresse",
    shippingCity: "Ville",
    shippingState: "Région / Province",
    shippingPostal: "Code postal",
    shippingRecipientPh: "Nom complet",
    shippingPhonePh: "+33 0 00 00 00 00",
    shippingAddressPh: "Rue et numéro",
    shippingAddress2Ph: "Appartement, étage, etc.",
    shippingCityPh: "Ville",
    shippingStatePh: "Région",
    shippingPostalPh: "Code postal",
    feeLabel: "Livraison",
    feeFreeEvent: "Gratuit (événement de lancement)",
    feeFreeThreshold: "Gratuit (commande +₩50 000)",
    feeCalculating: "Calcul en cours...",
    estimatedDays: "Livraison est.",
    subtotalLabel: "Sous-total",
    totalTitle: "Total estimé",
    quantity: "Qté",
    briefId: "ID du brief",
    name: "Nom",
    email: "Email",
    note: "Note",
    namePh: "Nom du client",
    emailPh: "name@email.com",
    notePh: "Texte du sceau, instructions de livraison, etc.",
    submit: "Enregistrer la commande",
    submitting: "Enregistrement...",
    orderSaveFailed: "Impossible d'enregistrer la commande.",
    orderProcessFailed: "Une erreur s'est produite lors du traitement.",
    invalidEmail: "Saisissez un email valide.",
    invalidName: "Saisissez votre nom.",
    freeBadge: "Livraison gratuite",
    days: " jours",
  },
  ar: {
    chip: "Wink Checkout",
    title: "ملخص الطلب",
    sub: "راجع المنتجات المحددة وعنوان الشحن قبل حفظ الطلب.",
    cartEmpty: "سلة التسوق فارغة.",
    loading: "جارٍ تحميل معلومات الطلب...",
    goCart: "الذهاب إلى السلة",
    goNaming: "الذهاب إلى التسمية",
    itemsTitle: "المنتجات المحددة",
    customerTitle: "معلومات العميل",
    shippingTitle: "عنوان الشحن",
    shippingCountry: "دولة الشحن",
    shippingRecipient: "اسم المستلم",
    shippingPhone: "الهاتف",
    shippingAddress: "العنوان",
    shippingAddress2: "العنوان (السطر الثاني)",
    shippingCity: "المدينة",
    shippingState: "المنطقة / الولاية",
    shippingPostal: "الرمز البريدي",
    shippingRecipientPh: "الاسم الكامل للمستلم",
    shippingPhonePh: "+966 000 000 0000",
    shippingAddressPh: "الشارع ورقم المبنى",
    shippingAddress2Ph: "الشقة، المكتب، إلخ",
    shippingCityPh: "المدينة",
    shippingStatePh: "المنطقة / الولاية",
    shippingPostalPh: "الرمز البريدي",
    feeLabel: "الشحن",
    feeFreeEvent: "مجاني (حدث الإطلاق)",
    feeFreeThreshold: "مجاني (طلب بقيمة +₩50,000)",
    feeCalculating: "جارٍ الحساب...",
    estimatedDays: "وقت التسليم المتوقع",
    subtotalLabel: "المبلغ الجزئي",
    totalTitle: "الإجمالي المتوقع",
    quantity: "الكمية",
    briefId: "معرف الملخص",
    name: "الاسم",
    email: "البريد الإلكتروني",
    note: "ملاحظة",
    namePh: "اسم العميل",
    emailPh: "name@email.com",
    notePh: "نص الختم، تعليمات التسليم، إلخ",
    submit: "حفظ الطلب",
    submitting: "جارٍ الحفظ...",
    orderSaveFailed: "فشل حفظ الطلب.",
    orderProcessFailed: "حدث خطأ أثناء معالجة الطلب.",
    invalidEmail: "أدخل بريدًا إلكترونيًا صحيحًا.",
    invalidName: "أدخل اسمك.",
    freeBadge: "شحن مجاني",
    days: " أيام",
  },
  hi: {
    chip: "Wink Checkout",
    title: "ऑर्डर सारांश",
    sub: "ऑर्डर सहेजने से पहले चुने गए उत्पाद और शिपिंग पता जांचें।",
    cartEmpty: "आपकी कार्ट खाली है।",
    loading: "ऑर्डर जानकारी लोड हो रही है...",
    goCart: "कार्ट पर जाएं",
    goNaming: "नामकरण पर जाएं",
    itemsTitle: "चुने गए उत्पाद",
    customerTitle: "ग्राहक जानकारी",
    shippingTitle: "शिपिंग पता",
    shippingCountry: "शिपिंग देश",
    shippingRecipient: "प्राप्तकर्ता का नाम",
    shippingPhone: "फ़ोन",
    shippingAddress: "पता",
    shippingAddress2: "पता (पंक्ति 2)",
    shippingCity: "शहर",
    shippingState: "राज्य / प्रांत",
    shippingPostal: "पिन कोड",
    shippingRecipientPh: "प्राप्तकर्ता का पूरा नाम",
    shippingPhonePh: "+91 00000 00000",
    shippingAddressPh: "सड़क और नंबर",
    shippingAddress2Ph: "फ्लैट, ऑफिस आदि",
    shippingCityPh: "शहर",
    shippingStatePh: "राज्य",
    shippingPostalPh: "पिन कोड",
    feeLabel: "शिपिंग",
    feeFreeEvent: "मुफ़्त (लॉन्च इवेंट)",
    feeFreeThreshold: "मुफ़्त (₩50,000+ का ऑर्डर)",
    feeCalculating: "गणना हो रही है...",
    estimatedDays: "अनुमानित डिलीवरी",
    subtotalLabel: "उप-कुल",
    totalTitle: "अनुमानित कुल",
    quantity: "मात्रा",
    briefId: "ब्रीफ ID",
    name: "नाम",
    email: "ईमेल",
    note: "नोट",
    namePh: "ग्राहक का नाम",
    emailPh: "name@email.com",
    notePh: "मुहर का पाठ, डिलीवरी नोट्स आदि",
    submit: "ऑर्डर सहेजें",
    submitting: "सहेजा जा रहा है...",
    orderSaveFailed: "ऑर्डर सहेजने में विफल।",
    orderProcessFailed: "ऑर्डर प्रसंस्करण में त्रुटि।",
    invalidEmail: "वैध ईमेल दर्ज करें।",
    invalidName: "अपना नाम दर्ज करें।",
    freeBadge: "मुफ़्त शिपिंग",
    days: " दिन",
  },
} as const;

type UiLang = keyof typeof COPY;
function toUiLang(l: string): UiLang { return l in COPY ? (l as UiLang) : "ko"; }

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getLocale(lang: AppLang) {
  const map: Record<string, string> = { ko:"ko-KR", ja:"ja-JP", zh:"zh-CN", es:"es-ES" };
  return map[lang] ?? "en-US";
}

function formatKRW(value: number, lang: AppLang) {
  try {
    return new Intl.NumberFormat(getLocale(lang), {
      style: "currency", currency: "KRW", maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `₩${value.toLocaleString()}`;
  }
}

// ─── Main Page ────────────────────────────────────────────────
export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const rawLang = String(params.lang || "ko");
  const lang: AppLang = isSupportedLang(rawLang) ? rawLang : "ko";
  const ui = COPY[toUiLang(rawLang)];

  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState<CustomerForm>({ name: "", email: "", note: "" });
  const [shipping, setShipping] = useState<ShippingAddr>({
    country: "KR",
    recipient: "", phone: "", address: "", address2: "",
    city: "", state: "", postal: "",
  });
  const [shippingResult, setShippingResult] = useState<ShippingResult | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const calcTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const supabase = useMemo(() => {
    try { return createClient(); } catch { return null; }
  }, []);

  useEffect(() => {
    setItems(getCartItems());
    setLoaded(true);
  }, []);

  // ── 상품 합계
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  // ── 배송비 자동 계산 (국가 또는 합계 변경 시)
  useEffect(() => {
    if (!loaded) return;
    if (calcTimeoutRef.current) clearTimeout(calcTimeoutRef.current);

    calcTimeoutRef.current = setTimeout(async () => {
      setShippingLoading(true);
      try {
        const res = await fetch("/api/shipping/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            country_code: shipping.country,
            product_weight: 500,
            order_total: subtotal,
          }),
        });
        if (res.ok) {
          const json = await res.json();
          setShippingResult(json as ShippingResult);
        }
      } catch { /* 무시 */ } finally {
        setShippingLoading(false);
      }
    }, 200);

    return () => {
      if (calcTimeoutRef.current) clearTimeout(calcTimeoutRef.current);
    };
  }, [shipping.country, subtotal, loaded]);

  const shippingFee = shippingResult?.shipping_fee ?? 0;
  const total = subtotal + shippingFee;

  const isKorea = shipping.country === "KR";

  const canSubmit =
    loaded &&
    items.length > 0 &&
    form.name.trim().length > 0 &&
    isValidEmail(form.email.trim()) &&
    shipping.recipient.trim().length > 0 &&
    shipping.address.trim().length > 0;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!form.name.trim())                      { setMessage(ui.invalidName);  return; }
    if (!isValidEmail(form.email.trim()))       { setMessage(ui.invalidEmail); return; }

    setSubmitting(true);
    setMessage("");

    let userId: string | null = null;
    try {
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id ?? null;
      }
    } catch { userId = null; }

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { name: form.name.trim(), email: form.email.trim(), note: form.note.trim() },
          shippingAddress: shipping,
          shippingFee,
          items,
          total,
          userId,
          lang,
        }),
      });

      let json: Record<string, unknown> | null = null;
      try { json = await res.json(); } catch { json = null; }

      if (!res.ok || !json?.ok) throw new Error((json?.error as string) || ui.orderSaveFailed);

      sessionStorage.setItem(
        LATEST_ORDER_STORAGE_KEY,
        JSON.stringify({
          id: String(json.orderId ?? `order-${Date.now()}`),
          customer: { name: form.name.trim(), email: form.email.trim() },
          shippingAddress: shipping,
          shippingFee,
          items,
          total,
          createdAt: new Date().toISOString(),
          lang,
        })
      );

      clearCart();
      setItems([]);
      router.push(`/${lang}/orders`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : ui.orderProcessFailed);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── 배송비 표시 문자열
  function renderShippingFee() {
    if (shippingLoading) return <span style={{ opacity: 0.5 }}>{ui.feeCalculating}</span>;
    if (shippingResult?.is_free) {
      const reason = shippingResult.free_reason === "threshold" ? ui.feeFreeThreshold : ui.feeFreeEvent;
      return (
        <span>
          <span
            style={{
              display: "inline-block",
              fontSize: 11, fontWeight: 700,
              padding: "2px 8px", borderRadius: 999, marginRight: 6,
              background: "rgba(93,192,138,0.15)",
              border: "1px solid rgba(93,192,138,0.4)",
              color: "rgba(93,192,138,0.95)",
            }}
          >
            {ui.freeBadge}
          </span>
          <span style={{ opacity: 0.6, fontSize: 13 }}>{reason}</span>
        </span>
      );
    }
    return <strong>{formatKRW(shippingFee, lang)}</strong>;
  }

  // ─── 국가 select 옵션 label
  function countryLabel(c: typeof COUNTRIES[number]) {
    return `${c.flag} ${lang === "ko" ? c.label_ko : c.label_en}`;
  }

  return (
    <main className="wink-page">
      <div className="wink-container">
        <div className="wink-chip">{ui.chip}</div>
        <h1 className="wink-title">{ui.title}</h1>
        <p className="wink-sub">{ui.sub}</p>

        {message && (
          <div className="wink-error-banner" style={{ marginTop: 18 }}>{message}</div>
        )}

        {!loaded ? (
          <section className="wink-panel" style={{ marginTop: 20 }}>{ui.loading}</section>
        ) : items.length === 0 ? (
          <section className="wink-panel" style={{ marginTop: 20 }}>
            <div style={{ marginBottom: 18 }}>{ui.cartEmpty}</div>
            <div className="wink-actions">
              <button type="button" className="wink-secondary-btn"
                onClick={() => router.push(`/${lang}/cart`)}>
                {ui.goCart}
              </button>
              <button type="button" className="wink-primary-btn"
                onClick={() => router.push(`/${lang}/category`)}>
                {ui.goNaming}
              </button>
            </div>
          </section>
        ) : (
          <form onSubmit={handleSubmit} className="wink-result-grid" style={{ marginTop: 20 }}>

            {/* ── 상품 목록 ── */}
            <section className="wink-result-card">
              <div className="wink-section-title" style={{ marginBottom: 14 }}>{ui.itemsTitle}</div>
              <div className="wink-form" style={{ gap: 12 }}>
                {items.map((item) => (
                  <div key={item.id} className="wink-result-section">
                    <div className="wink-result-head">
                      <div className="wink-card-title">{item.title}</div>
                      <div className="wink-score-pill">{formatKRW(item.price * item.quantity, lang)}</div>
                    </div>
                    <div className="wink-result-text">{item.description}</div>
                    <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between",
                      gap: 12, color: "var(--text-soft)", fontSize: 14, flexWrap: "wrap" }}>
                      <span>{ui.quantity} {item.quantity}</span>
                      <span>{ui.briefId}: {item.briefId}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── 배송지 정보 ── */}
            <section className="wink-result-card">
              <div className="wink-section-title" style={{ marginBottom: 14 }}>{ui.shippingTitle}</div>
              <div className="wink-form-grid">

                {/* 국가 선택 */}
                <div className="wink-field wink-field-full">
                  <label>{ui.shippingCountry}</label>
                  <select
                    className="wink-input"
                    value={shipping.country}
                    onChange={(e) => setShipping((p) => ({ ...p, country: e.target.value }))}
                    style={{ cursor: "pointer" }}
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>{countryLabel(c)}</option>
                    ))}
                  </select>
                </div>

                {/* 받는 분 이름 */}
                <div className="wink-field">
                  <label>{ui.shippingRecipient}</label>
                  <input className="wink-input"
                    value={shipping.recipient}
                    onChange={(e) => setShipping((p) => ({ ...p, recipient: e.target.value }))}
                    placeholder={ui.shippingRecipientPh}
                    autoComplete="shipping name"
                  />
                </div>

                {/* 연락처 */}
                <div className="wink-field">
                  <label>{ui.shippingPhone}</label>
                  <input className="wink-input"
                    type="tel"
                    value={shipping.phone}
                    onChange={(e) => setShipping((p) => ({ ...p, phone: e.target.value }))}
                    placeholder={ui.shippingPhonePh}
                    autoComplete="shipping tel"
                    inputMode="tel"
                  />
                </div>

                {/* 주소 */}
                <div className="wink-field wink-field-full">
                  <label>{ui.shippingAddress}</label>
                  <input className="wink-input"
                    value={shipping.address}
                    onChange={(e) => setShipping((p) => ({ ...p, address: e.target.value }))}
                    placeholder={ui.shippingAddressPh}
                    autoComplete="shipping address-line1"
                  />
                </div>

                {/* 상세주소 */}
                <div className="wink-field wink-field-full">
                  <label>{ui.shippingAddress2}</label>
                  <input className="wink-input"
                    value={shipping.address2}
                    onChange={(e) => setShipping((p) => ({ ...p, address2: e.target.value }))}
                    placeholder={ui.shippingAddress2Ph}
                    autoComplete="shipping address-line2"
                  />
                </div>

                {/* 시/구 */}
                <div className="wink-field">
                  <label>{ui.shippingCity}</label>
                  <input className="wink-input"
                    value={shipping.city}
                    onChange={(e) => setShipping((p) => ({ ...p, city: e.target.value }))}
                    placeholder={ui.shippingCityPh}
                    autoComplete="shipping address-level2"
                  />
                </div>

                {/* 도/광역시 — 해외는 항상 표시 */}
                {(!isKorea || true) && (
                  <div className="wink-field">
                    <label>{ui.shippingState}</label>
                    <input className="wink-input"
                      value={shipping.state}
                      onChange={(e) => setShipping((p) => ({ ...p, state: e.target.value }))}
                      placeholder={ui.shippingStatePh}
                      autoComplete="shipping address-level1"
                    />
                  </div>
                )}

                {/* 우편번호 */}
                <div className="wink-field">
                  <label>{ui.shippingPostal}</label>
                  <input className="wink-input"
                    value={shipping.postal}
                    onChange={(e) => setShipping((p) => ({ ...p, postal: e.target.value }))}
                    placeholder={ui.shippingPostalPh}
                    autoComplete="shipping postal-code"
                    inputMode="numeric"
                  />
                </div>
              </div>

              {/* 배송비 안내 박스 */}
              {shippingResult && (
                <div
                  style={{
                    marginTop: 16,
                    padding: "14px 16px",
                    borderRadius: 12,
                    border: shippingResult.is_free
                      ? "1px solid rgba(93,192,138,0.35)"
                      : "1px solid var(--line-gold)",
                    background: shippingResult.is_free
                      ? "rgba(93,192,138,0.06)"
                      : "rgba(201,168,76,0.06)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="wink-result-label">{ui.feeLabel}</span>
                    {renderShippingFee()}
                  </div>
                  {shippingResult.estimated_days && (
                    <div style={{ fontSize: 13, color: "var(--text-soft)", opacity: 0.75 }}>
                      {ui.estimatedDays}: {shippingResult.estimated_days}{ui.days}
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* ── 주문자 정보 ── */}
            <section className="wink-result-card">
              <div className="wink-section-title" style={{ marginBottom: 14 }}>{ui.customerTitle}</div>
              <div className="wink-form-grid">
                <div className="wink-field wink-field-full">
                  <label htmlFor="customer-name">{ui.name}</label>
                  <input id="customer-name" className="wink-input"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder={ui.namePh} autoComplete="name"
                  />
                </div>
                <div className="wink-field wink-field-full">
                  <label htmlFor="customer-email">{ui.email}</label>
                  <input id="customer-email" type="email" className="wink-input"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder={ui.emailPh} inputMode="email" autoComplete="email"
                  />
                </div>
                <div className="wink-field wink-field-full">
                  <label htmlFor="customer-note">{ui.note}</label>
                  <textarea id="customer-note" className="wink-textarea" rows={4}
                    value={form.note}
                    onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
                    placeholder={ui.notePh}
                  />
                </div>
              </div>

              {/* 금액 요약 */}
              <div className="wink-panel" style={{ marginTop: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between",
                  alignItems: "center", marginBottom: 10, fontSize: 14 }}>
                  <span style={{ color: "var(--text-soft)" }}>{ui.subtotalLabel}</span>
                  <span>{formatKRW(subtotal, lang)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between",
                  alignItems: "center", marginBottom: 14, fontSize: 14 }}>
                  <span style={{ color: "var(--text-soft)" }}>{ui.feeLabel}</span>
                  <span>
                    {shippingLoading
                      ? <span style={{ opacity: 0.5 }}>{ui.feeCalculating}</span>
                      : shippingResult?.is_free
                        ? <span style={{ color: "rgba(93,192,138,0.9)", fontWeight: 700 }}>₩0</span>
                        : formatKRW(shippingFee, lang)
                    }
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between",
                  alignItems: "center", paddingTop: 12,
                  borderTop: "1px solid var(--line-soft)", flexWrap: "wrap", gap: 8 }}>
                  <div className="wink-section-title" style={{ margin: 0 }}>{ui.totalTitle}</div>
                  <div className="wink-top-pick-score">{formatKRW(total, lang)}</div>
                </div>
              </div>

              <div className="wink-actions" style={{ marginTop: 18 }}>
                <button type="submit" className="wink-primary-btn"
                  disabled={!canSubmit || submitting}>
                  {submitting ? ui.submitting : ui.submit}
                </button>
              </div>
            </section>
          </form>
        )}
      </div>
    </main>
  );
}
