"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AppLang, isSupportedLang } from "@/lib/lang-config";
import { createClient } from "@/lib/supabase/browser";
import { PRICING } from "@/lib/pricing";

// ─── Types ───────────────────────────────────────────────
type ProductType = "stamp" | "doorplate";
type Step = "form" | "confirm" | "done";
type StampScript = "block" | "curved" | "gothic" | "hand";
type StampLang  = "ko" | "hanja";

// ─── Product config ───────────────────────────────────────
const PRODUCT_PRICE: Record<ProductType, number> = {
  stamp: PRICING.stamp,
  doorplate: PRICING.doorplate,
};

// Material presets
const STAMP_MATERIALS = ["목인(木印)", "수정(水晶)", "흑단(黑檀)", "상아대용"];
const DOORPLATE_MATERIALS = ["스테인리스", "원목", "아크릴", "황동"];

// ─── COPY ─────────────────────────────────────────────────
const COPY = {
  ko: {
    chip: "Wink Direct Order",
    title: "도장 · 문패 바로 주문",
    sub: "이름 설계 없이 기존 이름으로 바로 도장과 문패를 제작 주문할 수 있습니다.",
    step1Title: "상품 선택 및 이름 입력",
    step2Title: "주문자 정보 확인",
    doneTitle: "주문이 접수되었습니다",
    doneSub: "입력하신 이메일로 주문 확인 안내를 보내드립니다.",
    orderNum: "주문번호",
    doneNotice1: "제작 기간은 영업일 기준 7-10일이며, 배송은 제작 완료 후 순차적으로 진행됩니다.",
    doneNotice2: "문의 사항은 이메일로 연락 주시면 빠르게 안내드립니다.",
    productSectionTitle: "제작할 상품 선택 (복수 선택 가능)",
    stampTitle: "인장 / 도장",
    stampDesc: "이름을 각인한 개인용 도장으로, 소장 가치 높은 인장을 제작합니다.",
    stampPoints: ["한글 / 한자 각인", "선택 재질 제작", "전용 보관함 포함"],
    doorplateTitle: "문패",
    doorplateDesc: "공간에 이름의 의미를 담은 문패를 제작합니다.",
    doorplatePoints: ["한글 / 한자 병기 가능", "선택 재질 제작", "맞춤 마운트 포함"],
    nameSectionTitle: "이름 및 각인 정보",
    nameLabel: "이름 (한글)",
    namePh: "예: 김윤슬",
    hanjaLabel: "한자 표기 (선택)",
    hanjaPh: "예: 金潤瑟",
    engravingLabel: "각인 문구 (기본: 이름)",
    engravingPh: "비워두면 이름으로 각인됩니다",
    stampMatLabel: "도장 재질 요청",
    stampMatPh: "직접 입력 또는 아래에서 선택",
    doorplateMatLabel: "문패 재질 요청",
    doorplateMatPh: "직접 입력 또는 아래에서 선택",
    memoLabel: "추가 요청 메모",
    memoPh: "사이즈, 디자인, 배송 요청 등 자유롭게 작성해 주세요",
    previewTitle: "각인 미리보기",
    orderSummaryTitle: "주문 요약",
    selectedProducts: "선택 상품",
    engravingInfo: "각인 정보",
    materialInfo: "재질 요청",
    totalLabel: "결제 예정 금액",
    customerSectionTitle: "주문자 정보",
    custNameLabel: "주문자 이름",
    custNamePh: "실명으로 입력해 주세요",
    custEmailLabel: "이메일",
    custEmailPh: "name@email.com",
    btnNext: "다음 단계 →",
    btnBack: "← 이전",
    btnSubmit: "주문 완료",
    btnSubmitting: "주문 저장 중...",
    btnGoCategory: "이름 설계하러 가기",
    btnGoHome: "홈으로",
    errSelectProduct: "제작할 상품을 하나 이상 선택해 주세요.",
    errName: "이름을 입력해 주세요.",
    errCustName: "주문자 이름을 입력해 주세요.",
    errEmail: "유효한 이메일을 입력해 주세요.",
    errServer: "주문 처리 중 오류가 발생했습니다. 다시 시도해 주세요.",
    trustTitle: "주문 안내",
    trust1: "결과 확인 후 마음에 드실 때만 주문해 주세요.",
    trust2: "주문 후 제작이 시작되면 취소가 어렵습니다.",
    trust3: "한글·한자 각인이 모두 가능합니다.",
    previewQualityNote: "모든 디자인은 실제 도장으로 찍은 듯한 사실적인 질감으로 표현되었으며, 곧바로 인쇄물이나 디지털 문서에 적용할 수 있는 형태로 시각화되어 미리보기와 흡사합니다.",
    deliverySectionTitle: "배송지 정보",
    deliveryRecipientLabel: "받는 분 이름",
    deliveryRecipientPh: "받으실 분의 이름을 입력해 주세요",
    deliveryPhoneLabel: "연락처",
    deliveryPhonePh: "010-0000-0000",
    deliveryZipLabel: "우편번호",
    deliveryZipSearchBtn: "주소 검색",
    deliveryAddrLabel: "기본 주소",
    deliveryAddrDetailLabel: "상세 주소",
    deliveryAddrDetailPh: "동·호수 등 상세 주소를 입력해 주세요",
    deliveryMemoLabel: "배송 메모 (선택)",
    deliveryMemoPh: "부재 시 문앞 보관, 경비실 맡김 등",
    stampNameLabel: "도장 이름",
    doorplateNameLabel: "문패 이름",
    nameModeKo: "한글",
    nameModeHanja: "한자",
    nameModeDuo: "2인",
    doorplateDuoPh: "예: 이인홍 & 배은주",
    designerNotice: "주문 완료 후 24시간 내 전문 디자이너가 시안을 이메일로 발송합니다.",
    savedNamesTitle: "저장된 작명 결과",
    savedNamesHint: "선택하면 도장 이름에 자동 입력됩니다",
    savedNamesEmpty: "저장된 이름 결과가 없습니다",
  },
  en: {
    chip: "Wink Direct Order",
    title: "Order Stamp · Door Plate",
    sub: "Order a stamp or door plate directly with your existing name — no naming session required.",
    step1Title: "Select Product & Enter Name",
    step2Title: "Customer Information",
    doneTitle: "Order Received",
    doneSub: "We will send a confirmation to your email address.",
    orderNum: "Order ID",
    doneNotice1: "Production takes 7-10 business days. Shipping follows after production is complete.",
    doneNotice2: "For inquiries, please contact us via email.",
    productSectionTitle: "Choose Products (multiple allowed)",
    stampTitle: "Name Seal / Stamp",
    stampDesc: "A personal seal engraved with your name, crafted with lasting value.",
    stampPoints: ["Korean / Hanja engraving", "Your choice of material", "Storage case included"],
    doorplateTitle: "Door Plate",
    doorplateDesc: "A door plate that brings your name's meaning into your space.",
    doorplatePoints: ["Korean / Hanja dual engraving", "Your choice of material", "Custom mount included"],
    nameSectionTitle: "Name & Engraving Info",
    nameLabel: "Name (Korean)",
    namePh: "e.g. 김윤슬",
    hanjaLabel: "Hanja (optional)",
    hanjaPh: "e.g. 金潤瑟",
    engravingLabel: "Engraving Text (default: name)",
    engravingPh: "Leave blank to use the name",
    stampMatLabel: "Stamp Material",
    stampMatPh: "Type or choose below",
    doorplateMatLabel: "Door Plate Material",
    doorplateMatPh: "Type or choose below",
    memoLabel: "Additional Notes",
    memoPh: "Size, design, delivery requests, etc.",
    previewTitle: "Engraving Preview",
    orderSummaryTitle: "Order Summary",
    selectedProducts: "Selected Products",
    engravingInfo: "Engraving Info",
    materialInfo: "Material",
    totalLabel: "Estimated Total",
    customerSectionTitle: "Customer Information",
    custNameLabel: "Customer Name",
    custNamePh: "Your full name",
    custEmailLabel: "Email",
    custEmailPh: "name@email.com",
    btnNext: "Next →",
    btnBack: "← Back",
    btnSubmit: "Place Order",
    btnSubmitting: "Saving...",
    btnGoCategory: "Go to Naming",
    btnGoHome: "Go Home",
    errSelectProduct: "Please select at least one product.",
    errName: "Please enter the name.",
    errCustName: "Please enter your name.",
    errEmail: "Please enter a valid email address.",
    errServer: "An error occurred. Please try again.",
    trustTitle: "Order Notes",
    trust1: "Only order if you are satisfied with the design.",
    trust2: "Cancellation is difficult once production begins.",
    trust3: "Both Korean and Hanja engraving are available.",
    previewQualityNote: "All designs are rendered with a realistic ink-stamp texture, ready for print or digital documents. The actual stamp will closely resemble this preview.",
    deliverySectionTitle: "Delivery Address",
    deliveryRecipientLabel: "Recipient Name",
    deliveryRecipientPh: "Enter the recipient's name",
    deliveryPhoneLabel: "Phone Number",
    deliveryPhonePh: "e.g. 010-0000-0000",
    deliveryZipLabel: "Postal Code",
    deliveryZipSearchBtn: "Search Address",
    deliveryAddrLabel: "Address",
    deliveryAddrDetailLabel: "Detailed Address",
    deliveryAddrDetailPh: "Apt, suite, unit, etc.",
    deliveryMemoLabel: "Delivery Note (optional)",
    deliveryMemoPh: "Leave at door, front desk, etc.",
    stampNameLabel: "Stamp Name",
    doorplateNameLabel: "Door Plate Name",
    nameModeKo: "Korean",
    nameModeHanja: "Hanja",
    nameModeDuo: "Two Names",
    doorplateDuoPh: "e.g. Lee In-hong & Bae Eun-ju",
    designerNotice: "A professional designer will send your design draft by email within 24 hours of order completion.",
    savedNamesTitle: "Saved Naming Results",
    savedNamesHint: "Select to auto-fill stamp name",
    savedNamesEmpty: "No saved naming results found",
  },
  zh: {
    chip: "Wink Direct Order",
    title: "印章 · 门牌直接订购",
    sub: "无需命名流程，直接用现有名字订购印章或门牌。",
    step1Title: "选择商品并输入名字",
    step2Title: "订购人信息",
    doneTitle: "订单已接收",
    doneSub: "订单确认信息将发送至您的邮箱。",
    orderNum: "订单号",
    doneNotice1: "制作周期为7-10个工作日，制作完成后按顺序发货。",
    doneNotice2: "如有疑问，请通过邮件联系我们。",
    productSectionTitle: "选择商品（可多选）",
    stampTitle: "印章",
    stampDesc: "刻有您名字的个人印章，具有较高的收藏价值。",
    stampPoints: ["韩文 / 汉字刻印", "可选材质制作", "含专用收纳盒"],
    doorplateTitle: "门牌",
    doorplateDesc: "将名字的意义融入空间的定制门牌。",
    doorplatePoints: ["韩文 / 汉字并刻", "可选材质制作", "含定制安装件"],
    nameSectionTitle: "名字与刻印信息",
    nameLabel: "名字（韩文）",
    namePh: "例：김윤슬",
    hanjaLabel: "汉字（可选）",
    hanjaPh: "例：金潤瑟",
    engravingLabel: "刻印文字（默认：名字）",
    engravingPh: "留空则使用名字",
    stampMatLabel: "印章材质要求",
    stampMatPh: "直接输入或从下方选择",
    doorplateMatLabel: "门牌材质要求",
    doorplateMatPh: "直接输入或从下方选择",
    memoLabel: "补充备注",
    memoPh: "尺寸、设计、配送要求等",
    previewTitle: "刻印预览",
    orderSummaryTitle: "订单摘要",
    selectedProducts: "已选商品",
    engravingInfo: "刻印信息",
    materialInfo: "材质要求",
    totalLabel: "预计支付金额",
    customerSectionTitle: "订购人信息",
    custNameLabel: "订购人姓名",
    custNamePh: "请输入真实姓名",
    custEmailLabel: "邮箱",
    custEmailPh: "name@email.com",
    btnNext: "下一步 →",
    btnBack: "← 返回",
    btnSubmit: "完成订购",
    btnSubmitting: "保存中...",
    btnGoCategory: "前往命名流程",
    btnGoHome: "返回首页",
    errSelectProduct: "请至少选择一件商品。",
    errName: "请输入名字。",
    errCustName: "请输入订购人姓名。",
    errEmail: "请输入有效的邮箱地址。",
    errServer: "订单处理时发生错误，请重试。",
    trustTitle: "订购说明",
    trust1: "满意后再下单。",
    trust2: "开始制作后较难取消订单。",
    trust3: "支持韩文和汉字刻印。",
    previewQualityNote: "所有设计均以仿真印章质感呈现，可直接用于印刷或数字文档，实际效果与预览高度相似。",
    deliverySectionTitle: "收货地址",
    deliveryRecipientLabel: "收件人姓名",
    deliveryRecipientPh: "请输入收件人姓名",
    deliveryPhoneLabel: "联系电话",
    deliveryPhonePh: "例：010-0000-0000",
    deliveryZipLabel: "邮政编码",
    deliveryZipSearchBtn: "搜索地址",
    deliveryAddrLabel: "地址",
    deliveryAddrDetailLabel: "详细地址",
    deliveryAddrDetailPh: "楼层、房间号等",
    deliveryMemoLabel: "配送备注（选填）",
    deliveryMemoPh: "无人时放门口、前台代收等",
    stampNameLabel: "印章名字",
    doorplateNameLabel: "门牌名字",
    nameModeKo: "韩文",
    nameModeHanja: "汉字",
    nameModeDuo: "两人",
    doorplateDuoPh: "例：이인홍 & 배은주",
    designerNotice: "订单完成后24小时内，专业设计师将通过邮件发送设计稿。",
    savedNamesTitle: "已保存的命名结果",
    savedNamesHint: "选择后自动填入印章名字",
    savedNamesEmpty: "暂无已保存的命名结果",
  },
  ja: {
    chip: "Wink Direct Order",
    title: "印鑑 · 表札 直接注文",
    sub: "ネーミング不要。お手元の名前で印鑑や表札をすぐに注文できます。",
    step1Title: "商品選択・名前入力",
    step2Title: "注文者情報の確認",
    doneTitle: "ご注文を受け付けました",
    doneSub: "注文確認メールをご入力のアドレスにお送りします。",
    orderNum: "注文番号",
    doneNotice1: "制作期間は営業日7-10日です。完成後、順次発送いたします。",
    doneNotice2: "ご不明な点はメールにてお問い合わせください。",
    productSectionTitle: "商品選択（複数可）",
    stampTitle: "印鑑",
    stampDesc: "名前を刻印した個人用印鑑で、所蔵価値の高い仕上がりです。",
    stampPoints: ["韓国語・漢字彫刻", "素材選択可", "専用ケース付き"],
    doorplateTitle: "表札",
    doorplateDesc: "名前の意味を空間に込めた表札を制作します。",
    doorplatePoints: ["韓国語・漢字併記可", "素材選択可", "カスタムマウント付き"],
    nameSectionTitle: "名前・彫刻情報",
    nameLabel: "名前（韓国語）",
    namePh: "例：김윤슬",
    hanjaLabel: "漢字（任意）",
    hanjaPh: "例：金潤瑟",
    engravingLabel: "彫刻文字（デフォルト：名前）",
    engravingPh: "空欄の場合は名前で彫刻します",
    stampMatLabel: "印鑑素材希望",
    stampMatPh: "直接入力または下から選択",
    doorplateMatLabel: "表札素材希望",
    doorplateMatPh: "直接入力または下から選択",
    memoLabel: "追加要望",
    memoPh: "サイズ、デザイン、配送要望など自由にご記入ください",
    previewTitle: "彫刻プレビュー",
    orderSummaryTitle: "注文サマリー",
    selectedProducts: "選択商品",
    engravingInfo: "彫刻情報",
    materialInfo: "素材希望",
    totalLabel: "お支払い予定金額",
    customerSectionTitle: "注文者情報",
    custNameLabel: "注文者名",
    custNamePh: "お名前をご入力ください",
    custEmailLabel: "メール",
    custEmailPh: "name@email.com",
    btnNext: "次へ →",
    btnBack: "← 戻る",
    btnSubmit: "注文を確定する",
    btnSubmitting: "保存中...",
    btnGoCategory: "ネーミングへ",
    btnGoHome: "ホームへ",
    errSelectProduct: "商品を1つ以上選択してください。",
    errName: "名前を入力してください。",
    errCustName: "注文者名を入力してください。",
    errEmail: "有効なメールアドレスを入力してください。",
    errServer: "注文処理中にエラーが発生しました。再度お試しください。",
    trustTitle: "注文について",
    trust1: "ご満足いただけた場合のみご注文ください。",
    trust2: "制作開始後はキャンセルが難しくなります。",
    trust3: "韓国語・漢字どちらの彫刻も対応しています。",
    previewQualityNote: "すべてのデザインはリアルな印鑑の質感で表現されており、印刷物やデジタル文書にそのまま使用できる形で視覚化されています。実際の仕上がりはプレビューに近いものになります。",
    deliverySectionTitle: "配送先情報",
    deliveryRecipientLabel: "受取人名",
    deliveryRecipientPh: "受取人のお名前をご入力ください",
    deliveryPhoneLabel: "電話番号",
    deliveryPhonePh: "例：010-0000-0000",
    deliveryZipLabel: "郵便番号",
    deliveryZipSearchBtn: "住所検索",
    deliveryAddrLabel: "住所",
    deliveryAddrDetailLabel: "詳細住所",
    deliveryAddrDetailPh: "建物名・部屋番号など",
    deliveryMemoLabel: "配送メモ（任意）",
    deliveryMemoPh: "不在時は玄関前に置くなど",
    stampNameLabel: "印鑑名前",
    doorplateNameLabel: "表札名前",
    nameModeKo: "韓国語",
    nameModeHanja: "漢字",
    nameModeDuo: "2名",
    doorplateDuoPh: "例：이인홍 & 배은주",
    designerNotice: "ご注文完了後24時間以内に、プロデザイナーがデザイン案をメールでお送りします。",
    savedNamesTitle: "保存された命名結果",
    savedNamesHint: "選択すると印鑑名前に自動入力されます",
    savedNamesEmpty: "保存された命名結果がありません",
  },
  es: {
    chip: "Wink Direct Order",
    title: "Sello · Placa de puerta — Pedido directo",
    sub: "Pida un sello o placa de puerta directamente con su nombre existente — sin necesidad de sesión de naming.",
    step1Title: "Seleccionar producto e ingresar nombre",
    step2Title: "Información del cliente",
    doneTitle: "Pedido recibido",
    doneSub: "Enviaremos una confirmación a su dirección de correo.",
    orderNum: "Número de pedido",
    doneNotice1: "La producción tarda 7-10 días hábiles. El envío se realiza después de completar la producción.",
    doneNotice2: "Para consultas, contáctenos por correo electrónico.",
    productSectionTitle: "Elegir productos (selección múltiple permitida)",
    stampTitle: "Sello de nombre",
    stampDesc: "Un sello personal grabado con su nombre, de gran valor coleccionable.",
    stampPoints: ["Grabado en coreano / Hanja", "Elección de material", "Estuche incluido"],
    doorplateTitle: "Placa de puerta",
    doorplateDesc: "Una placa de puerta que lleva el significado de su nombre a su espacio.",
    doorplatePoints: ["Grabado dual coreano / Hanja", "Elección de material", "Soporte personalizado incluido"],
    nameSectionTitle: "Nombre e info de grabado",
    nameLabel: "Nombre (coreano)",
    namePh: "ej. 김윤슬",
    hanjaLabel: "Hanja (opcional)",
    hanjaPh: "ej. 金潤瑟",
    engravingLabel: "Texto de grabado (por defecto: nombre)",
    engravingPh: "Dejar en blanco para usar el nombre",
    stampMatLabel: "Material del sello",
    stampMatPh: "Escribir o elegir abajo",
    doorplateMatLabel: "Material de la placa",
    doorplateMatPh: "Escribir o elegir abajo",
    memoLabel: "Notas adicionales",
    memoPh: "Tamaño, diseño, instrucciones de envío, etc.",
    previewTitle: "Vista previa del grabado",
    orderSummaryTitle: "Resumen del pedido",
    selectedProducts: "Productos seleccionados",
    engravingInfo: "Info de grabado",
    materialInfo: "Material",
    totalLabel: "Total estimado",
    customerSectionTitle: "Información del cliente",
    custNameLabel: "Nombre del cliente",
    custNamePh: "Su nombre completo",
    custEmailLabel: "Correo",
    custEmailPh: "name@email.com",
    btnNext: "Siguiente →",
    btnBack: "← Atrás",
    btnSubmit: "Realizar pedido",
    btnSubmitting: "Guardando...",
    btnGoCategory: "Ir al Naming",
    btnGoHome: "Inicio",
    errSelectProduct: "Seleccione al menos un producto.",
    errName: "Ingrese el nombre.",
    errCustName: "Ingrese su nombre.",
    errEmail: "Ingrese un correo válido.",
    errServer: "Ocurrió un error. Por favor, inténtelo de nuevo.",
    trustTitle: "Notas del pedido",
    trust1: "Pida solo si está satisfecho con el diseño.",
    trust2: "La cancelación es difícil una vez iniciada la producción.",
    trust3: "El grabado en coreano y Hanja está disponible.",
    previewQualityNote: "Todos los diseños se muestran con una textura realista de sello entintado, listos para impresión o documentos digitales. El sello real se parecerá a esta vista previa.",
    deliverySectionTitle: "Dirección de entrega",
    deliveryRecipientLabel: "Nombre del destinatario",
    deliveryRecipientPh: "Ingrese el nombre del destinatario",
    deliveryPhoneLabel: "Teléfono",
    deliveryPhonePh: "ej. 010-0000-0000",
    deliveryZipLabel: "Código postal",
    deliveryZipSearchBtn: "Buscar dirección",
    deliveryAddrLabel: "Dirección",
    deliveryAddrDetailLabel: "Dirección detallada",
    deliveryAddrDetailPh: "Piso, apartamento, etc.",
    deliveryMemoLabel: "Nota de entrega (opcional)",
    deliveryMemoPh: "Dejar en la puerta, conserjería, etc.",
    stampNameLabel: "Nombre del sello",
    doorplateNameLabel: "Nombre de la placa",
    nameModeKo: "Coreano",
    nameModeHanja: "Hanja",
    nameModeDuo: "Dos nombres",
    doorplateDuoPh: "ej. 이인홍 & 배은주",
    designerNotice: "Un diseñador profesional enviará su borrador por correo dentro de las 24 horas posteriores al pedido.",
    savedNamesTitle: "Resultados de nombre guardados",
    savedNamesHint: "Seleccione para autocompletar el nombre del sello",
    savedNamesEmpty: "No se encontraron resultados guardados",
  },
  ru: {
    chip: "Wink Direct Order",
    title: "Печать · Табличка — Прямой заказ",
    sub: "Закажите печать или табличку напрямую с вашим существующим именем — сессия нейминга не нужна.",
    step1Title: "Выбрать продукт и ввести имя",
    step2Title: "Информация о покупателе",
    doneTitle: "Заказ принят",
    doneSub: "Мы отправим подтверждение на ваш email.",
    orderNum: "Номер заказа",
    doneNotice1: "Производство занимает 7-10 рабочих дней. Отправка осуществляется после завершения.",
    doneNotice2: "По вопросам обращайтесь по email.",
    productSectionTitle: "Выбрать продукты (возможен множественный выбор)",
    stampTitle: "Именная печать",
    stampDesc: "Персональная печать с гравировкой имени, обладающая коллекционной ценностью.",
    stampPoints: ["Гравировка корейский / Ханджа", "Выбор материала", "Футляр в комплекте"],
    doorplateTitle: "Именная табличка",
    doorplateDesc: "Табличка, привносящая смысл имени в ваше пространство.",
    doorplatePoints: ["Двойная гравировка корейский / Ханджа", "Выбор материала", "Крепление в комплекте"],
    nameSectionTitle: "Имя и информация о гравировке",
    nameLabel: "Имя (корейский)",
    namePh: "напр. 김윤슬",
    hanjaLabel: "Ханджа (необязательно)",
    hanjaPh: "напр. 金潤瑟",
    engravingLabel: "Текст гравировки (по умолчанию: имя)",
    engravingPh: "Оставьте пустым для использования имени",
    stampMatLabel: "Материал печати",
    stampMatPh: "Введите или выберите ниже",
    doorplateMatLabel: "Материал таблички",
    doorplateMatPh: "Введите или выберите ниже",
    memoLabel: "Дополнительные пожелания",
    memoPh: "Размер, дизайн, пожелания по доставке и т.д.",
    previewTitle: "Предварительный просмотр",
    orderSummaryTitle: "Итог заказа",
    selectedProducts: "Выбранные продукты",
    engravingInfo: "Информация о гравировке",
    materialInfo: "Материал",
    totalLabel: "Итоговая сумма",
    customerSectionTitle: "Информация о покупателе",
    custNameLabel: "Имя покупателя",
    custNamePh: "Ваше полное имя",
    custEmailLabel: "Email",
    custEmailPh: "name@email.com",
    btnNext: "Далее →",
    btnBack: "← Назад",
    btnSubmit: "Оформить заказ",
    btnSubmitting: "Сохранение...",
    btnGoCategory: "К нейминг",
    btnGoHome: "На главную",
    errSelectProduct: "Выберите хотя бы один продукт.",
    errName: "Введите имя.",
    errCustName: "Введите ваше имя.",
    errEmail: "Введите корректный email.",
    errServer: "Произошла ошибка. Попробуйте снова.",
    trustTitle: "Примечания по заказу",
    trust1: "Заказывайте только если удовлетворены дизайном.",
    trust2: "Отмена затруднена после начала производства.",
    trust3: "Доступна гравировка на корейском и Ханджа.",
    previewQualityNote: "Все дизайны отображаются с реалистичной текстурой печати, готовой для использования в печатных или цифровых документах. Реальная печать будет близка к предварительному просмотру.",
    deliverySectionTitle: "Адрес доставки",
    deliveryRecipientLabel: "Имя получателя",
    deliveryRecipientPh: "Введите имя получателя",
    deliveryPhoneLabel: "Телефон",
    deliveryPhonePh: "напр. 010-0000-0000",
    deliveryZipLabel: "Почтовый индекс",
    deliveryZipSearchBtn: "Найти адрес",
    deliveryAddrLabel: "Адрес",
    deliveryAddrDetailLabel: "Уточнение адреса",
    deliveryAddrDetailPh: "Квартира, этаж и т.д.",
    deliveryMemoLabel: "Примечание к доставке (необязательно)",
    deliveryMemoPh: "Оставить у двери, на ресепшн и т.д.",
    stampNameLabel: "Имя для печати",
    doorplateNameLabel: "Имя для таблички",
    nameModeKo: "Корейский",
    nameModeHanja: "Ханджа",
    nameModeDuo: "Два имени",
    doorplateDuoPh: "напр. 이인홍 & 배은주",
    designerNotice: "Профессиональный дизайнер пришлёт вам макет по email в течение 24 часов после оформления заказа.",
    savedNamesTitle: "Сохранённые результаты нейминга",
    savedNamesHint: "Выберите для автозаполнения имени на печати",
    savedNamesEmpty: "Сохранённых результатов нет",
  },
  fr: {
    chip: "Wink Direct Order",
    title: "Sceau · Plaque — Commande directe",
    sub: "Commandez un sceau ou une plaque directement avec votre nom existant — sans session de naming.",
    step1Title: "Sélectionner le produit et saisir le nom",
    step2Title: "Informations client",
    doneTitle: "Commande reçue",
    doneSub: "Nous enverrons une confirmation à votre adresse email.",
    orderNum: "Numéro de commande",
    doneNotice1: "La production prend 7 à 10 jours ouvrés. L'expédition suit après la production.",
    doneNotice2: "Pour toute question, contactez-nous par email.",
    productSectionTitle: "Choisir les produits (sélection multiple autorisée)",
    stampTitle: "Sceau de nom",
    stampDesc: "Un sceau personnel gravé avec votre nom, de grande valeur de collection.",
    stampPoints: ["Gravure coréen / Hanja", "Choix du matériau", "Étui inclus"],
    doorplateTitle: "Plaque de porte",
    doorplateDesc: "Une plaque qui apporte la signification de votre nom dans votre espace.",
    doorplatePoints: ["Double gravure coréen / Hanja", "Choix du matériau", "Support personnalisé inclus"],
    nameSectionTitle: "Nom et info de gravure",
    nameLabel: "Nom (coréen)",
    namePh: "ex. 김윤슬",
    hanjaLabel: "Hanja (optionnel)",
    hanjaPh: "ex. 金潤瑟",
    engravingLabel: "Texte de gravure (par défaut : nom)",
    engravingPh: "Laisser vide pour utiliser le nom",
    stampMatLabel: "Matériau du sceau",
    stampMatPh: "Saisir ou choisir ci-dessous",
    doorplateMatLabel: "Matériau de la plaque",
    doorplateMatPh: "Saisir ou choisir ci-dessous",
    memoLabel: "Notes supplémentaires",
    memoPh: "Taille, design, instructions de livraison, etc.",
    previewTitle: "Aperçu de la gravure",
    orderSummaryTitle: "Récapitulatif de commande",
    selectedProducts: "Produits sélectionnés",
    engravingInfo: "Info de gravure",
    materialInfo: "Matériau",
    totalLabel: "Total estimé",
    customerSectionTitle: "Informations client",
    custNameLabel: "Nom du client",
    custNamePh: "Votre nom complet",
    custEmailLabel: "Email",
    custEmailPh: "name@email.com",
    btnNext: "Suivant →",
    btnBack: "← Retour",
    btnSubmit: "Passer la commande",
    btnSubmitting: "Enregistrement...",
    btnGoCategory: "Aller au naming",
    btnGoHome: "Accueil",
    errSelectProduct: "Sélectionnez au moins un produit.",
    errName: "Saisissez le nom.",
    errCustName: "Saisissez votre nom.",
    errEmail: "Saisissez un email valide.",
    errServer: "Une erreur s'est produite. Veuillez réessayer.",
    trustTitle: "Notes de commande",
    trust1: "Commandez seulement si vous êtes satisfait du design.",
    trust2: "L'annulation est difficile une fois la production commencée.",
    trust3: "La gravure en coréen et Hanja est disponible.",
    previewQualityNote: "Tous les designs sont rendus avec une texture réaliste de tampon encré, prêts pour l'impression ou les documents numériques. Le tampon réel ressemblera étroitement à cet aperçu.",
    deliverySectionTitle: "Adresse de livraison",
    deliveryRecipientLabel: "Nom du destinataire",
    deliveryRecipientPh: "Saisir le nom du destinataire",
    deliveryPhoneLabel: "Téléphone",
    deliveryPhonePh: "ex. 010-0000-0000",
    deliveryZipLabel: "Code postal",
    deliveryZipSearchBtn: "Rechercher une adresse",
    deliveryAddrLabel: "Adresse",
    deliveryAddrDetailLabel: "Complément d'adresse",
    deliveryAddrDetailPh: "Appartement, étage, etc.",
    deliveryMemoLabel: "Note de livraison (optionnel)",
    deliveryMemoPh: "Laisser à la porte, à la réception, etc.",
    stampNameLabel: "Nom du sceau",
    doorplateNameLabel: "Nom de la plaque",
    nameModeKo: "Coréen",
    nameModeHanja: "Hanja",
    nameModeDuo: "Deux noms",
    doorplateDuoPh: "ex. 이인홍 & 배은주",
    designerNotice: "Un designer professionnel vous enverra votre maquette par email dans les 24 heures suivant la commande.",
    savedNamesTitle: "Résultats de naming sauvegardés",
    savedNamesHint: "Sélectionnez pour remplir automatiquement le nom du sceau",
    savedNamesEmpty: "Aucun résultat de naming sauvegardé",
  },
  ar: {
    chip: "Wink Direct Order",
    title: "ختم · لوحة — طلب مباشر",
    sub: "اطلب ختماً أو لوحة باب مباشرةً باسمك الحالي — لا حاجة لجلسة تسمية.",
    step1Title: "اختر المنتج وأدخل الاسم",
    step2Title: "معلومات العميل",
    doneTitle: "تم استلام الطلب",
    doneSub: "سنرسل تأكيداً إلى بريدك الإلكتروني.",
    orderNum: "رقم الطلب",
    doneNotice1: "تستغرق المعالجة 7-10 أيام عمل. يتم الشحن بعد اكتمال الإنتاج.",
    doneNotice2: "للاستفسارات، تواصل معنا عبر البريد الإلكتروني.",
    productSectionTitle: "اختر المنتجات (يمكن الاختيار المتعدد)",
    stampTitle: "ختم الاسم",
    stampDesc: "ختم شخصي منقوش باسمك، ذو قيمة تحفية عالية.",
    stampPoints: ["نقش بالكورية / هانجا", "اختيار المادة", "علبة حفظ مضمنة"],
    doorplateTitle: "لوحة الباب",
    doorplateDesc: "لوحة باب تجلب معنى اسمك إلى مساحتك.",
    doorplatePoints: ["نقش مزدوج كوري / هانجا", "اختيار المادة", "وحدة تثبيت مخصصة مضمنة"],
    nameSectionTitle: "الاسم ومعلومات النقش",
    nameLabel: "الاسم (كوري)",
    namePh: "مثال: 김윤슬",
    hanjaLabel: "هانجا (اختياري)",
    hanjaPh: "مثال: 金潤瑟",
    engravingLabel: "نص النقش (الافتراضي: الاسم)",
    engravingPh: "اترك فارغاً لاستخدام الاسم",
    stampMatLabel: "مادة الختم",
    stampMatPh: "اكتب أو اختر أدناه",
    doorplateMatLabel: "مادة اللوحة",
    doorplateMatPh: "اكتب أو اختر أدناه",
    memoLabel: "ملاحظات إضافية",
    memoPh: "الحجم، التصميم، تعليمات التسليم، إلخ",
    previewTitle: "معاينة النقش",
    orderSummaryTitle: "ملخص الطلب",
    selectedProducts: "المنتجات المحددة",
    engravingInfo: "معلومات النقش",
    materialInfo: "المادة",
    totalLabel: "الإجمالي المتوقع",
    customerSectionTitle: "معلومات العميل",
    custNameLabel: "اسم العميل",
    custNamePh: "اسمك الكامل",
    custEmailLabel: "البريد الإلكتروني",
    custEmailPh: "name@email.com",
    btnNext: "التالي →",
    btnBack: "← السابق",
    btnSubmit: "تقديم الطلب",
    btnSubmitting: "جارٍ الحفظ...",
    btnGoCategory: "الذهاب إلى التسمية",
    btnGoHome: "الرئيسية",
    errSelectProduct: "اختر منتجاً واحداً على الأقل.",
    errName: "أدخل الاسم.",
    errCustName: "أدخل اسمك.",
    errEmail: "أدخل بريداً إلكترونياً صحيحاً.",
    errServer: "حدث خطأ. الرجاء المحاولة مجدداً.",
    trustTitle: "ملاحظات الطلب",
    trust1: "اطلب فقط إذا كنت راضياً عن التصميم.",
    trust2: "يصعب الإلغاء بعد بدء الإنتاج.",
    trust3: "النقش بالكورية وهانجا متاح.",
    previewQualityNote: "جميع التصميمات مُقدَّمة بملمس واقعي لختم الحبر، جاهزة للطباعة أو المستندات الرقمية. سيكون الختم الفعلي قريباً جداً من المعاينة.",
    deliverySectionTitle: "عنوان التسليم",
    deliveryRecipientLabel: "اسم المستلم",
    deliveryRecipientPh: "أدخل اسم المستلم",
    deliveryPhoneLabel: "رقم الهاتف",
    deliveryPhonePh: "مثال: 010-0000-0000",
    deliveryZipLabel: "الرمز البريدي",
    deliveryZipSearchBtn: "البحث عن العنوان",
    deliveryAddrLabel: "العنوان",
    deliveryAddrDetailLabel: "تفاصيل العنوان",
    deliveryAddrDetailPh: "الشقة، الطابق، إلخ",
    deliveryMemoLabel: "ملاحظة التسليم (اختياري)",
    deliveryMemoPh: "اترك عند الباب، في الاستقبال، إلخ",
    stampNameLabel: "اسم الختم",
    doorplateNameLabel: "اسم اللوحة",
    nameModeKo: "كوري",
    nameModeHanja: "هانجا",
    nameModeDuo: "اسمان",
    doorplateDuoPh: "مثال: 이인홍 & 배은주",
    designerNotice: "سيرسل مصمم محترف مسودة التصميم عبر البريد الإلكتروني خلال 24 ساعة من إتمام الطلب.",
    savedNamesTitle: "نتائج التسمية المحفوظة",
    savedNamesHint: "اختر لملء اسم الختم تلقائياً",
    savedNamesEmpty: "لا توجد نتائج محفوظة",
  },
  hi: {
    chip: "Wink Direct Order",
    title: "मुहर · दरवाज़ा पट्टिका — सीधा ऑर्डर",
    sub: "अपने मौजूदा नाम से सीधे मुहर या दरवाज़ा पट्टिका ऑर्डर करें — नामकरण सत्र की जरूरत नहीं।",
    step1Title: "उत्पाद चुनें और नाम दर्ज करें",
    step2Title: "ग्राहक जानकारी",
    doneTitle: "ऑर्डर प्राप्त हुआ",
    doneSub: "हम आपके ईमेल पर पुष्टि भेजेंगे।",
    orderNum: "ऑर्डर नंबर",
    doneNotice1: "उत्पादन में 7-10 कार्य दिवस लगते हैं। उत्पादन पूरा होने के बाद शिपिंग होती है।",
    doneNotice2: "प्रश्नों के लिए ईमेल से संपर्क करें।",
    productSectionTitle: "उत्पाद चुनें (एकाधिक चयन संभव)",
    stampTitle: "नाम मुहर",
    stampDesc: "आपके नाम की नक्काशी वाली व्यक्तिगत मुहर, संग्रहणीय मूल्य के साथ।",
    stampPoints: ["कोरियाई / हांजा नक्काशी", "सामग्री का चुनाव", "केस शामिल"],
    doorplateTitle: "दरवाज़ा पट्टिका",
    doorplateDesc: "एक पट्टिका जो आपके नाम का अर्थ आपके स्थान में लाती है।",
    doorplatePoints: ["कोरियाई / हांजा दोहरी नक्काशी", "सामग्री का चुनाव", "कस्टम माउंट शामिल"],
    nameSectionTitle: "नाम और नक्काशी जानकारी",
    nameLabel: "नाम (कोरियाई)",
    namePh: "जैसे 김윤슬",
    hanjaLabel: "हांजा (वैकल्पिक)",
    hanjaPh: "जैसे 金潤瑟",
    engravingLabel: "नक्काशी पाठ (डिफ़ॉल्ट: नाम)",
    engravingPh: "नाम उपयोग के लिए खाली छोड़ें",
    stampMatLabel: "मुहर सामग्री",
    stampMatPh: "टाइप करें या नीचे चुनें",
    doorplateMatLabel: "पट्टिका सामग्री",
    doorplateMatPh: "टाइप करें या नीचे चुनें",
    memoLabel: "अतिरिक्त नोट्स",
    memoPh: "आकार, डिज़ाइन, डिलीवरी निर्देश आदि",
    previewTitle: "नक्काशी पूर्वावलोकन",
    orderSummaryTitle: "ऑर्डर सारांश",
    selectedProducts: "चुने गए उत्पाद",
    engravingInfo: "नक्काशी जानकारी",
    materialInfo: "सामग्री",
    totalLabel: "अनुमानित कुल",
    customerSectionTitle: "ग्राहक जानकारी",
    custNameLabel: "ग्राहक नाम",
    custNamePh: "आपका पूरा नाम",
    custEmailLabel: "ईमेल",
    custEmailPh: "name@email.com",
    btnNext: "अगला →",
    btnBack: "← पीछे",
    btnSubmit: "ऑर्डर दें",
    btnSubmitting: "सहेजा जा रहा है...",
    btnGoCategory: "नामकरण पर जाएं",
    btnGoHome: "होम",
    errSelectProduct: "कम से कम एक उत्पाद चुनें।",
    errName: "नाम दर्ज करें।",
    errCustName: "अपना नाम दर्ज करें।",
    errEmail: "वैध ईमेल दर्ज करें।",
    errServer: "त्रुटि हुई। कृपया पुनः प्रयास करें।",
    trustTitle: "ऑर्डर नोट्स",
    trust1: "केवल तभी ऑर्डर करें जब डिज़ाइन पसंद आए।",
    trust2: "उत्पादन शुरू होने के बाद रद्द करना मुश्किल है।",
    trust3: "कोरियाई और हांजा दोनों नक्काशी उपलब्ध है।",
    previewQualityNote: "सभी डिज़ाइन वास्तविक स्टाम्प की स्याही जैसी बनावट के साथ प्रस्तुत किए गए हैं, जो मुद्रण या डिजिटल दस्तावेज़ों के लिए तैयार हैं। वास्तविक स्टाम्प इस पूर्वावलोकन के समान होगा।",
    deliverySectionTitle: "डिलीवरी पता",
    deliveryRecipientLabel: "प्राप्तकर्ता का नाम",
    deliveryRecipientPh: "प्राप्तकर्ता का नाम दर्ज करें",
    deliveryPhoneLabel: "फ़ोन नंबर",
    deliveryPhonePh: "जैसे 010-0000-0000",
    deliveryZipLabel: "पिन कोड",
    deliveryZipSearchBtn: "पता खोजें",
    deliveryAddrLabel: "पता",
    deliveryAddrDetailLabel: "विस्तृत पता",
    deliveryAddrDetailPh: "फ्लैट नंबर, मंज़िल आदि",
    deliveryMemoLabel: "डिलीवरी नोट (वैकल्पिक)",
    deliveryMemoPh: "दरवाज़े पर छोड़ें, रिसेप्शन पर दें आदि",
    stampNameLabel: "मुहर का नाम",
    doorplateNameLabel: "पट्टिका का नाम",
    nameModeKo: "कोरियाई",
    nameModeHanja: "हांजा",
    nameModeDuo: "दो नाम",
    doorplateDuoPh: "जैसे 이인홍 & 배은주",
    designerNotice: "ऑर्डर पूरा होने के 24 घंटे के भीतर एक पेशेवर डिज़ाइनर ईमेल पर डिज़ाइन ड्राफ्ट भेजेगा।",
    savedNamesTitle: "सहेजे गए नामकरण परिणाम",
    savedNamesHint: "चुनें तो मुहर नाम स्वचालित भरा जाएगा",
    savedNamesEmpty: "कोई सहेजा गया परिणाम नहीं मिला",
  },
} as const;

type UiLang = keyof typeof COPY;
function toUiLang(l: string): UiLang {
  return (l in COPY) ? (l as UiLang) : "ko";
}

// ─── Helpers ─────────────────────────────────────────────
function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** 카카오/Daum 우편번호 팝업 — 스크립트를 동적으로 로드 후 실행 */
function openDaumPostcode(onComplete: (zip: string, addr: string) => void) {
  const run = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new (window as any).daum.Postcode({
      oncomplete: (data: { zonecode: string; roadAddress: string; jibunAddress: string }) => {
        onComplete(data.zonecode, data.roadAddress || data.jibunAddress);
      },
    }).open();
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window as any).daum?.Postcode) {
    run();
  } else {
    const script = document.createElement("script");
    script.src = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.onload = run;
    document.head.appendChild(script);
  }
}

function formatKRW(n: number) {
  return `₩${n.toLocaleString("ko-KR")}`;
}

// ─── Sub-components ───────────────────────────────────────
function MaterialPill({
  label,
  selected,
  onClick,
  isLight,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  isLight: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "6px 14px",
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        border: selected
          ? "1px solid rgba(201,168,76,0.8)"
          : isLight
          ? "1px solid rgba(0,0,0,0.15)"
          : "1px solid rgba(120,160,255,0.22)",
        background: selected
          ? "rgba(201,168,76,0.14)"
          : isLight
          ? "rgba(0,0,0,0.04)"
          : "rgba(255,255,255,0.04)",
        color: selected
          ? "rgba(201,140,30,0.98)"
          : isLight
          ? "rgba(30,40,60,0.82)"
          : "rgba(200,215,240,0.8)",
        transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );
}

function ProductCard({
  id,
  title,
  desc,
  points,
  price,
  selected,
  onToggle,
  isLight,
}: {
  id: ProductType;
  title: string;
  desc: string;
  points: readonly string[];
  price: number;
  selected: boolean;
  onToggle: () => void;
  isLight: boolean;
}) {
  const isStamp = id === "stamp";
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        textAlign: "left",
        padding: "24px 20px",
        borderRadius: 16,
        cursor: "pointer",
        border: selected
          ? "1.5px solid rgba(201,168,76,0.75)"
          : isLight
          ? "1px solid rgba(0,0,0,0.12)"
          : "1px solid rgba(120,160,255,0.18)",
        background: selected
          ? isLight
            ? "linear-gradient(160deg, rgba(201,168,76,0.12), rgba(240,236,220,0.96))"
            : "linear-gradient(160deg, rgba(201,168,76,0.10), rgba(11,22,52,0.85))"
          : isLight
          ? "linear-gradient(160deg, rgba(240,240,248,0.95), rgba(228,228,240,0.98))"
          : "linear-gradient(160deg, rgba(15,28,64,0.85), rgba(8,16,40,0.92))",
        boxShadow: selected
          ? "0 12px 36px rgba(201,168,76,0.14)"
          : isLight
          ? "0 8px 24px rgba(0,0,0,0.07)"
          : "0 8px 24px rgba(0,0,0,0.2)",
        transition: "all 0.18s",
        width: "100%",
        position: "relative",
      }}
    >
      {selected && (
        <span
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "rgba(201,168,76,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            color: "#070e28",
            fontWeight: 800,
          }}
        >
          ✓
        </span>
      )}
      <div
        style={{
          fontSize: 36,
          marginBottom: 10,
          opacity: 0.9,
        }}
      >
        {isStamp ? "⬛" : "🏷️"}
      </div>
      <div className="wink-card-title" style={{ marginBottom: 6, fontSize: 20 }}>
        {title}
      </div>
      <div className="wink-result-text" style={{ marginBottom: 12, opacity: 0.82 }}>
        {desc}
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: "none", marginBottom: 14 }}>
        {(points as readonly string[]).map((pt) => (
          <li
            key={pt}
            style={{
              fontSize: 13,
              color: isLight ? "rgba(40,50,70,0.78)" : "rgba(201,214,240,0.76)",
              marginBottom: 4,
              paddingLeft: 14,
              position: "relative",
            }}
          >
            <span
              style={{
                position: "absolute",
                left: 0,
                color: "rgba(201,168,76,0.85)",
              }}
            >
              ·
            </span>
            {pt}
          </li>
        ))}
      </ul>
      <div className="wink-score-pill" style={{ display: "inline-block" }}>
        {formatKRW(price)}
      </div>
    </button>
  );
}

// ─── StampPreview v3 ──────────────────────────────────────
// 실제 낙관/인장 스타일: 흰 종이 배경 + 빨간 이중 링 테두리 + 빨간 글자
function StampPreview({
  displayText,
  showIn,
  script,
  stampLang,
}: {
  displayText: string;
  showIn: boolean;
  script: StampScript;
  stampLang: StampLang;
}) {
  const letters  = displayText ? [...displayText] : [];
  const allChars = [...letters, ...(showIn && displayText ? ["印"] : [])];
  const n        = allChars.length;
  const isHanja  = stampLang === "hanja";

  // 서체 → 폰트 매핑 (Google Fonts: Black Han Sans / Noto Serif KR / Do Hyeon / Gaegu)
  const fontMap: Record<StampScript, { family: string; weight: string; style: string }> = {
    block:  { family: "'Black Han Sans', sans-serif",  weight: "400", style: "normal" },
    curved: { family: "'Noto Serif KR', serif",        weight: "700", style: "normal" },
    gothic: { family: "'Do Hyeon', sans-serif",        weight: "400", style: "normal" },
    hand:   { family: "'Gaegu', cursive",              weight: "700", style: "normal" },
  };
  const f = fontMap[script];

  // 글자 위치 계산 — viewBox 220×220, 도장 중심 (110,110)
  // 2자(외자+印 or 단독 2글자)는 크게, 3자↑는 작게
  type Pos = { x: number; y: number; size: number };
  const positions: Pos[] = (() => {
    if (n === 0) return [];

    // 1글자 — 정중앙, 매우 크게
    if (n === 1) return [{ x: 110, y: 110, size: 62 }];

    if (!isHanja) {
      // ── 한글 레이아웃 ──────────────────────────────
      // 2글자 — 세로 2칸, 크게
      if (n === 2) return [
        { x: 110, y: 84,  size: 52 },
        { x: 110, y: 140, size: 52 },
      ];
      // 3글자 T자형: 상단 1자 / 구분선 / 하단 2자 나란히
      if (n === 3) return [
        { x: 110, y: 78,  size: 42 },
        { x: 72,  y: 144, size: 42 },
        { x: 148, y: 144, size: 42 },
      ];
      // 4글자 2×2
      if (n === 4) return [
        { x: 72,  y: 84,  size: 36 },
        { x: 148, y: 84,  size: 36 },
        { x: 72,  y: 144, size: 36 },
        { x: 148, y: 144, size: 36 },
      ];
    } else {
      // ── 한자 레이아웃 ──────────────────────────────
      if (n === 2) return [
        { x: 110, y: 84,  size: 52 },
        { x: 110, y: 140, size: 52 },
      ];
      // 3글자: 우→좌 상단 2자 / 하단 중앙 1자
      if (n === 3) return [
        { x: 148, y: 80,  size: 40 },
        { x: 72,  y: 80,  size: 40 },
        { x: 110, y: 150, size: 40 },
      ];
      // 4글자 2×2
      if (n === 4) return [
        { x: 72,  y: 84,  size: 35 },
        { x: 148, y: 84,  size: 35 },
        { x: 72,  y: 144, size: 35 },
        { x: 148, y: 144, size: 35 },
      ];
    }

    // fallback: 세로 나열
    const sp = 22, sy = 110 - ((n - 1) * sp) / 2;
    return allChars.map((_, i) => ({ x: 110, y: sy + i * sp, size: 18 }));
  })();

  // T자형 구분선 — 3자 레이아웃에서만 표시 (내부 원에 clip)
  const showDivider = n === 3;

  return (
    <svg
      width="220" height="220" viewBox="0 0 220 220"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="도장 미리보기"
      style={{ display: "block" }}
    >
      <defs>
        {/* ① 종이 질감 — 미세 fractalNoise */}
        <filter id="sp-paper" x="0%" y="0%" width="100%" height="100%"
          colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="4" seed="3" result="n"/>
          <feColorMatrix type="saturate" values="0" in="n" result="g"/>
          <feBlend in="SourceGraphic" in2="g" mode="multiply" result="blended"/>
          <feComponentTransfer in="blended">
            <feFuncR type="linear" slope="0.04" intercept="0.94"/>
            <feFuncG type="linear" slope="0.03" intercept="0.93"/>
            <feFuncB type="linear" slope="0.03" intercept="0.90"/>
          </feComponentTransfer>
        </filter>

        {/* ② 불규칙 링/선 — 저주파 displacement */}
        <filter id="sp-rough" x="-12%" y="-12%" width="124%" height="124%">
          <feTurbulence type="turbulence" baseFrequency="0.032 0.018"
            numOctaves="3" seed="7" result="r"/>
          <feDisplacementMap in="SourceGraphic" in2="r" scale="4.5"
            xChannelSelector="R" yChannelSelector="G"/>
        </filter>

        {/* ③ 글자 잉크 번짐 */}
        <filter id="sp-ink" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.78" numOctaves="4"
            seed="9" result="t"/>
          <feDisplacementMap in="SourceGraphic" in2="t" scale="1.8"
            xChannelSelector="R" yChannelSelector="G"/>
        </filter>

        {/* ④ 내부 원 clipPath — 구분선이 링 밖으로 나가지 않도록 */}
        <clipPath id="sp-clip">
          <circle cx="110" cy="110" r="91"/>
        </clipPath>
      </defs>

      {/* 종이 배경 — 거의 흰색 + 미세 질감 */}
      <rect width="220" height="220" fill="#FAFAF6" filter="url(#sp-paper)"/>

      {/* 이중 링 테두리 */}
      <g filter="url(#sp-rough)">
        {/* 외곽 링 — 두꺼운 */}
        <circle cx="110" cy="110" r="100" fill="none" stroke="#8B0000" strokeWidth="5"/>
        {/* 내부 링 — 얇은 */}
        <circle cx="110" cy="110" r="91"  fill="none" stroke="#8B0000" strokeWidth="1.4"/>
      </g>

      {/* T자형 수평 구분선 (3글자 레이아웃) — 내부 원 안에 clip */}
      {showDivider && (
        <g clipPath="url(#sp-clip)" filter="url(#sp-rough)">
          <line x1="19" y1="110" x2="201" y2="110"
            stroke="#8B0000" strokeWidth="1.2" opacity="0.85"/>
        </g>
      )}

      {/* 글자 — 빨간 잉크 */}
      {n > 0 ? (
        <g filter="url(#sp-ink)">
          {allChars.map((ch, i) => {
            const pos = positions[i];
            if (!pos) return null;
            return (
              <text
                key={i}
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#8B0000"
                fontSize={pos.size}
                fontFamily={f.family}
                fontWeight={f.weight}
                fontStyle={f.style}
              >
                {ch}
              </text>
            );
          })}
        </g>
      ) : (
        <text x="110" y="110" textAnchor="middle" dominantBaseline="central"
          fill="rgba(139,0,0,0.22)" fontSize="14" fontFamily="sans-serif">
          이름 입력
        </text>
      )}
    </svg>
  );
}

// ─── Main Page ────────────────────────────────────────────
export default function OrderPage() {
  const router = useRouter();
  const params = useParams();
  const rawLang = String(params.lang ?? "ko");
  const lang: AppLang = isSupportedLang(rawLang) ? rawLang : "ko";
  const ui = COPY[toUiLang(rawLang)];

  // ── Theme detection
  const [isLight, setIsLight] = useState(false);
  useEffect(() => {
    const check = () =>
      setIsLight(document.documentElement.getAttribute("data-theme") === "light");
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  // ── Google Fonts (도장 미리보기용: Noto Serif KR + Dancing Script)
  useEffect(() => {
    const id = "stamp-gfonts";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id   = id;
      link.rel  = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Noto+Serif+KR:wght@700;900&family=Do+Hyeon&family=Gaegu:wght@700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  // ── URL params (결과 페이지 연동)
  const searchParams = useSearchParams();

  // ── Saved names (Supabase 작명 결과)
  type SavedName = { id: string; name: string; hanja: string | null };
  const [savedNames, setSavedNames] = useState<SavedName[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);

  // ── Form state
  const [step, setStep] = useState<Step>("form");
  const [products, setProducts] = useState<Set<ProductType>>(new Set());
  const [previewMode, setPreviewMode] = useState<"stamp" | "doorplate">("stamp");
  const [name, setName] = useState("");
  const [hanja, setHanja] = useState("");
  const [engraving, setEngraving] = useState("");
  const [stampMat, setStampMat] = useState("");
  const [doorplateMat, setDoorplateMat] = useState("");
  const [memo, setMemo] = useState("");
  // ── Name mode
  const [stampNameLang, setStampNameLang]     = useState<StampLang>("ko");
  const [doorplateNameMode, setDoorplateNameMode] = useState<"ko" | "hanja" | "duo">("ko");
  const [doorplateName, setDoorplateName]     = useState("");
  const [doorplateHanja, setDoorplateHanja]   = useState("");
  const [doorplateDuo, setDoorplateDuo]       = useState("");
  const [custName, setCustName] = useState("");
  const [custEmail, setCustEmail] = useState("");
  // ── Stamp preview options
  const [previewStampLang, setPreviewStampLang]     = useState<StampLang>("ko");
  const [previewStampScript, setPreviewStampScript] = useState<StampScript>("block");
  const [previewShowIn, setPreviewShowIn]           = useState(false);
  // ── Delivery state
  const [deliveryRecipient, setDeliveryRecipient] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [deliveryZip, setDeliveryZip] = useState("");
  const [deliveryAddr, setDeliveryAddr] = useState("");
  const [deliveryAddrDetail, setDeliveryAddrDetail] = useState("");
  const [deliveryMemo, setDeliveryMemo] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState("");

  // ── URL params → 이름 자동 입력 (결과 페이지 연동)
  useEffect(() => {
    const pName  = searchParams.get("name");
    const pHanja = searchParams.get("hanja");
    if (pName)  { setName(pName);  }
    if (pHanja) { setHanja(pHanja); }
  }, [searchParams]);

  // ── Supabase 저장된 작명 결과 불러오기
  useEffect(() => {
    const load = async () => {
      setSavedLoading(true);
      try {
        const sb = createClient();
        const { data: { user } } = await sb.auth.getUser();
        if (!user) return;
        const { data } = await sb
          .from("naming_results")
          .select("id, name, chinese")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20);
        if (data) {
          setSavedNames(data.map((r: { id: string; name: string; chinese: string | null }) => ({
            id: r.id,
            name: r.name,
            hanja: r.chinese ?? null,
          })));
        }
      } catch { /* ignore */ } finally {
        setSavedLoading(false);
      }
    };
    load();
  }, []);

  const toggleProduct = (p: ProductType) => {
    setProducts((prev) => {
      const next = new Set(prev);
      next.has(p) ? next.delete(p) : next.add(p);
      if (next.has("stamp")) setPreviewMode("stamp");
      else if (next.has("doorplate")) setPreviewMode("doorplate");
      return next;
    });
  };

  const displayEngraving = engraving.trim() || name.trim() || "이름";
  const total = [...products].reduce((s, p) => s + PRODUCT_PRICE[p], 0);

  // ── Step 1 → 2
  const handleNextStep = () => {
    setError("");
    if (products.size === 0) { setError(ui.errSelectProduct); return; }
    if (!name.trim()) { setError(ui.errName); return; }
    setStep("confirm");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!custName.trim()) { setError(ui.errCustName); return; }
    if (!isValidEmail(custEmail)) { setError(ui.errEmail); return; }

    setSubmitting(true);

    let userId: string | null = null;
    try {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      userId = user?.id ?? null;
    } catch { /* ignore */ }

    try {
      const res = await fetch("/api/direct-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          hanja: hanja.trim(),
          engraving: engraving.trim(),
          stampNameLang,
          doorplateName: doorplateName.trim(),
          doorplateHanja: doorplateHanja.trim(),
          doorplateNameMode,
          doorplateDuo: doorplateDuo.trim(),
          products: [...products],
          stampMaterial: stampMat.trim(),
          doorplateMaterial: doorplateMat.trim(),
          memo: memo.trim(),
          customer: { name: custName.trim(), email: custEmail.trim() },
          delivery: {
            recipient: deliveryRecipient.trim(),
            phone: deliveryPhone.trim(),
            zip: deliveryZip.trim(),
            address: deliveryAddr.trim(),
            addressDetail: deliveryAddrDetail.trim(),
            memo: deliveryMemo.trim(),
          },
          userId,
          lang,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error ?? ui.errServer);

      setOrderId(String(json.orderId ?? ""));
      setStep("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : ui.errServer);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Render: Done ──────────────────────────────────────
  if (step === "done") {
    return (
      <main className="wink-page">
        <div className="wink-container">
          <div className="wink-chip">{ui.chip}</div>

          <section
            className="wink-panel"
            style={{
              marginTop: 24,
              padding: "40px 28px",
              textAlign: "center",
              background: isLight
                ? "radial-gradient(circle at 50% 20%, rgba(201,168,76,0.12), transparent 55%), linear-gradient(180deg, rgba(252,248,238,0.98), rgba(244,240,228,0.99))"
                : "radial-gradient(circle at 50% 20%, rgba(201,168,76,0.12), transparent 55%), linear-gradient(180deg, rgba(11,22,52,0.94), rgba(6,13,34,0.98))",
              border: "1px solid rgba(201,168,76,0.28)",
            }}
          >
            <div style={{ fontSize: 52, marginBottom: 16 }}>✨</div>
            <h1 className="wink-title" style={{ marginBottom: 10 }}>
              {ui.doneTitle}
            </h1>
            <p className="wink-sub" style={{ marginBottom: 20 }}>
              {ui.doneSub}
            </p>
            {orderId && (
              <div className="wink-score-pill" style={{ display: "inline-block", marginBottom: 20 }}>
                {ui.orderNum}: {orderId}
              </div>
            )}
            <div
              className="wink-result-text"
              style={{ marginBottom: 8, maxWidth: 520, marginInline: "auto" }}
            >
              {ui.doneNotice1}
            </div>
            <div
              className="wink-result-text"
              style={{ maxWidth: 520, marginInline: "auto" }}
            >
              {ui.doneNotice2}
            </div>
          </section>

          <div className="wink-actions" style={{ marginTop: 24 }}>
            <button
              type="button"
              className="wink-secondary-btn"
              onClick={() => router.push(`/${lang}/category`)}
            >
              {ui.btnGoCategory}
            </button>
            <button
              type="button"
              className="wink-primary-btn"
              onClick={() => router.push(`/${lang}`)}
            >
              {ui.btnGoHome}
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ─── Render: Confirm (step 2) ─────────────────────────
  if (step === "confirm") {
    return (
      <main className="wink-page">
        <div className="wink-container">
          <div className="wink-chip">{ui.chip}</div>
          <h1 className="wink-title">{ui.step2Title}</h1>

          {/* Order summary */}
          <section className="wink-panel" style={{ marginBottom: 20 }}>
            <div className="wink-section-title" style={{ marginBottom: 14 }}>
              {ui.orderSummaryTitle}
            </div>

            <div className="wink-brief-grid">
              <div>
                <strong>{ui.selectedProducts}</strong>:{" "}
                {[...products]
                  .map((p) => (p === "stamp" ? ui.stampTitle : ui.doorplateTitle))
                  .join(" + ")}
              </div>
              <div>
                <strong>{ui.stampNameLabel}</strong>:{" "}
                {name.trim()}{hanja.trim() ? ` (${hanja.trim()})` : ""}
                {stampNameLang === "hanja" && hanja.trim() ? ` [${ui.nameModeHanja}]` : ""}
              </div>
              {(products.has("doorplate") && doorplateName.trim()) && (
                <div>
                  <strong>{ui.doorplateNameLabel}</strong>:{" "}
                  {doorplateName.trim()}
                  {doorplateNameMode === "hanja" && doorplateHanja.trim() ? ` (${doorplateHanja.trim()})` : ""}
                  {doorplateNameMode === "duo" ? ` [${ui.nameModeDuo}]` : ""}
                </div>
              )}
              {engraving.trim() && (
                <div>
                  <strong>{ui.engravingLabel}</strong>: {engraving.trim()}
                </div>
              )}
              {(stampMat.trim() || doorplateMat.trim()) && (
                <div>
                  <strong>{ui.materialInfo}</strong>:{" "}
                  {[
                    products.has("stamp") && stampMat.trim()
                      ? `${ui.stampTitle}: ${stampMat.trim()}`
                      : null,
                    products.has("doorplate") && doorplateMat.trim()
                      ? `${ui.doorplateTitle}: ${doorplateMat.trim()}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" / ")}
                </div>
              )}
              {memo.trim() && (
                <div>
                  <strong>{ui.memoLabel}</strong>: {memo.trim()}
                </div>
              )}
              {(deliveryRecipient.trim() || deliveryAddr.trim()) && (
                <div>
                  <strong>{ui.deliverySectionTitle}</strong>{" "}
                  {deliveryRecipient.trim()}
                  {deliveryPhone.trim() ? ` (${deliveryPhone.trim()})` : ""}
                  {deliveryAddr.trim()
                    ? ` — ${deliveryZip.trim() ? `[${deliveryZip}] ` : ""}${deliveryAddr.trim()}${deliveryAddrDetail.trim() ? ` ${deliveryAddrDetail.trim()}` : ""}`
                    : ""}
                  {deliveryMemo.trim() ? ` / ${deliveryMemo.trim()}` : ""}
                </div>
              )}
            </div>

            <div
              className="wink-card-title"
              style={{ fontSize: 28, marginTop: 16 }}
            >
              {ui.totalLabel}: {formatKRW(total)}
            </div>
          </section>

          {/* Customer form */}
          <form onSubmit={handleSubmit} className="wink-form">
            <section className="wink-panel" style={{ marginBottom: 20 }}>
              <div className="wink-section-title" style={{ marginBottom: 14 }}>
                {ui.customerSectionTitle}
              </div>
              <div className="wink-form-grid">
                <div className="wink-field">
                  <label>{ui.custNameLabel}</label>
                  <input
                    className="wink-input"
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    placeholder={ui.custNamePh}
                    autoComplete="name"
                  />
                </div>
                <div className="wink-field">
                  <label>{ui.custEmailLabel}</label>
                  <input
                    className="wink-input"
                    type="email"
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    placeholder={ui.custEmailPh}
                    autoComplete="email"
                  />
                </div>
              </div>
            </section>

            {/* Delivery — confirm page */}
            <section className="wink-panel" style={{ marginBottom: 20 }}>
              <div className="wink-section-title" style={{ marginBottom: 14 }}>
                {ui.deliverySectionTitle}
              </div>
              <div className="wink-form-grid">
                <div className="wink-field">
                  <label>{ui.deliveryRecipientLabel}</label>
                  <input className="wink-input" value={deliveryRecipient}
                    onChange={(e) => setDeliveryRecipient(e.target.value)}
                    placeholder={ui.deliveryRecipientPh} autoComplete="name" />
                </div>
                <div className="wink-field">
                  <label>{ui.deliveryPhoneLabel}</label>
                  <input className="wink-input" type="tel" value={deliveryPhone}
                    onChange={(e) => setDeliveryPhone(e.target.value)}
                    placeholder={ui.deliveryPhonePh} autoComplete="tel" />
                </div>
                <div className="wink-field wink-field-full">
                  <label>{ui.deliveryZipLabel}</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input className="wink-input" value={deliveryZip}
                      onChange={(e) => setDeliveryZip(e.target.value)}
                      placeholder="00000" style={{ maxWidth: 140 }} readOnly />
                    <button type="button"
                      onClick={() => openDaumPostcode((zip, addr) => {
                        setDeliveryZip(zip); setDeliveryAddr(addr); setDeliveryAddrDetail("");
                      })}
                      style={{
                        padding: "0 20px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                        cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s",
                        border: "1px solid rgba(201,168,76,0.6)",
                        background: isLight ? "rgba(201,168,76,0.12)" : "rgba(201,168,76,0.10)",
                        color: isLight ? "rgba(120,90,20,0.95)" : "rgba(201,168,76,0.95)",
                      }}>
                      {ui.deliveryZipSearchBtn}
                    </button>
                  </div>
                </div>
                <div className="wink-field wink-field-full">
                  <label>{ui.deliveryAddrLabel}</label>
                  <input className="wink-input" value={deliveryAddr}
                    onChange={(e) => setDeliveryAddr(e.target.value)}
                    placeholder={ui.deliveryAddrLabel}
                    autoComplete="street-address" readOnly={!!deliveryZip} />
                </div>
                <div className="wink-field wink-field-full">
                  <label>{ui.deliveryAddrDetailLabel}</label>
                  <input className="wink-input" value={deliveryAddrDetail}
                    onChange={(e) => setDeliveryAddrDetail(e.target.value)}
                    placeholder={ui.deliveryAddrDetailPh} autoComplete="address-line2" />
                </div>
                <div className="wink-field wink-field-full">
                  <label>{ui.deliveryMemoLabel}</label>
                  <input className="wink-input" value={deliveryMemo}
                    onChange={(e) => setDeliveryMemo(e.target.value)}
                    placeholder={ui.deliveryMemoPh} />
                </div>
              </div>
            </section>

            {/* Trust */}
            <section className="wink-panel" style={{ marginBottom: 20 }}>
              <div className="wink-result-label" style={{ marginBottom: 8 }}>{ui.trustTitle}</div>
              <div className="wink-result-text" style={{ marginBottom: 4 }}>· {ui.trust1}</div>
              <div className="wink-result-text" style={{ marginBottom: 4 }}>· {ui.trust2}</div>
              <div className="wink-result-text">· {ui.trust3}</div>
            </section>

            {error && <div className="wink-error-banner">{error}</div>}

            <div className="wink-actions wink-actions-between">
              <button
                type="button"
                className="wink-secondary-btn"
                onClick={() => { setStep("form"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              >
                {ui.btnBack}
              </button>
              <button
                type="submit"
                className="wink-primary-btn"
                disabled={submitting}
              >
                {submitting ? ui.btnSubmitting : ui.btnSubmit}
              </button>
            </div>
          </form>
        </div>
      </main>
    );
  }

  // ─── Render: Form (step 1) ────────────────────────────
  return (
    <main className="wink-page">
      <div className="wink-container">
        <div className="wink-chip">{ui.chip}</div>
        <h1 className="wink-title">{ui.title}</h1>
        <p className="wink-sub">{ui.sub}</p>

        {/* Product selection */}
        <section className="wink-panel" style={{ marginBottom: 20 }}>
          <div className="wink-section-title" style={{ marginBottom: 14 }}>
            {ui.productSectionTitle}
          </div>
          <div className="wink-language-grid">
            <ProductCard
              id="stamp"
              title={ui.stampTitle}
              desc={ui.stampDesc}
              points={ui.stampPoints}
              price={PRODUCT_PRICE.stamp}
              selected={products.has("stamp")}
              onToggle={() => toggleProduct("stamp")}
              isLight={isLight}
            />
            <ProductCard
              id="doorplate"
              title={ui.doorplateTitle}
              desc={ui.doorplateDesc}
              points={ui.doorplatePoints}
              price={PRODUCT_PRICE.doorplate}
              selected={products.has("doorplate")}
              onToggle={() => toggleProduct("doorplate")}
              isLight={isLight}
            />
          </div>
          {products.size > 0 && (
            <div
              className="wink-result-text"
              style={{ marginTop: 14, textAlign: "right", opacity: 0.85 }}
            >
              {ui.totalLabel}: <strong>{formatKRW(total)}</strong>
            </div>
          )}
        </section>

        {/* Name & engraving — 도장/문패 분리 입력 */}
        <section className="wink-panel" style={{ marginBottom: 20 }}>
          <div className="wink-section-title" style={{ marginBottom: 14 }}>
            {ui.nameSectionTitle}
          </div>

          {/* 저장된 작명 결과 장바구니 */}
          {savedNames.length > 0 && (
            <div style={{
              marginBottom: 20,
              padding: "14px 16px",
              borderRadius: 10,
              border: "1px solid rgba(201,168,76,0.28)",
              background: isLight ? "rgba(201,168,76,0.06)" : "rgba(201,168,76,0.05)",
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(201,168,76,0.9)", marginBottom: 6, letterSpacing: "0.06em" }}>
                {ui.savedNamesTitle}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-soft)", marginBottom: 10 }}>{ui.savedNamesHint}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {savedNames.map((sn) => (
                  <button
                    key={sn.id}
                    type="button"
                    onClick={() => {
                      setName(sn.name);
                      if (sn.hanja) setHanja(sn.hanja);
                      setStampNameLang(sn.hanja ? "hanja" : "ko");
                    }}
                    style={{
                      padding: "5px 14px", borderRadius: 999, fontSize: 13, fontWeight: 600,
                      cursor: "pointer", transition: "all 0.15s",
                      border: "1px solid rgba(201,168,76,0.45)",
                      background: name === sn.name ? "rgba(201,168,76,0.18)" : "transparent",
                      color: name === sn.name ? "rgba(201,168,76,0.97)" : "var(--text-main)",
                    }}
                  >
                    {sn.name}{sn.hanja ? ` (${sn.hanja})` : ""}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 두 컬럼: 왼쪽 도장 / 오른쪽 문패 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

            {/* 왼쪽: 도장 이름 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(201,168,76,0.9)", letterSpacing: "0.06em" }}>
                ⬛ {ui.stampNameLabel}
              </div>
              {/* 한글 / 한자 토글 */}
              <div style={{ display: "flex", gap: 6 }}>
                {(["ko", "hanja"] as StampLang[]).map((m) => (
                  <button key={m} type="button" onClick={() => setStampNameLang(m)}
                    style={{
                      padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                      border: stampNameLang === m ? "1.5px solid rgba(201,168,76,0.85)" : "1px solid var(--line-soft)",
                      background: stampNameLang === m ? "rgba(201,168,76,0.15)" : "transparent",
                      color: stampNameLang === m ? "rgba(201,168,76,0.97)" : "var(--text-soft)",
                    }}>
                    {m === "ko" ? ui.nameModeKo : ui.nameModeHanja}
                  </button>
                ))}
              </div>
              <input
                className="wink-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={ui.namePh}
              />
              {stampNameLang === "hanja" && (
                <input
                  className="wink-input"
                  value={hanja}
                  onChange={(e) => setHanja(e.target.value)}
                  placeholder={ui.hanjaPh}
                />
              )}
            </div>

            {/* 오른쪽: 문패 이름 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(201,168,76,0.9)", letterSpacing: "0.06em" }}>
                🏷️ {ui.doorplateNameLabel}
              </div>
              {/* 한글 / 한자 / 2인 토글 */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {(["ko", "hanja", "duo"] as const).map((m) => (
                  <button key={m} type="button" onClick={() => setDoorplateNameMode(m)}
                    style={{
                      padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                      border: doorplateNameMode === m ? "1.5px solid rgba(201,168,76,0.85)" : "1px solid var(--line-soft)",
                      background: doorplateNameMode === m ? "rgba(201,168,76,0.15)" : "transparent",
                      color: doorplateNameMode === m ? "rgba(201,168,76,0.97)" : "var(--text-soft)",
                    }}>
                    {m === "ko" ? ui.nameModeKo : m === "hanja" ? ui.nameModeHanja : ui.nameModeDuo}
                  </button>
                ))}
              </div>
              <input
                className="wink-input"
                value={doorplateName}
                onChange={(e) => setDoorplateName(e.target.value)}
                placeholder={doorplateNameMode === "duo" ? ui.doorplateDuoPh : ui.namePh}
              />
              {doorplateNameMode === "hanja" && (
                <input
                  className="wink-input"
                  value={doorplateHanja}
                  onChange={(e) => setDoorplateHanja(e.target.value)}
                  placeholder={ui.hanjaPh}
                />
              )}
              {doorplateNameMode === "duo" && (
                <div style={{ fontSize: 11, color: "var(--text-soft)", paddingLeft: 4 }}>
                  ※ {ui.doorplateDuoPh}
                </div>
              )}
            </div>
          </div>

          {/* 각인 문구 공통 (선택) */}
          <div className="wink-field wink-field-full" style={{ marginTop: 16 }}>
            <label>{ui.engravingLabel}</label>
            <input
              className="wink-input"
              value={engraving}
              onChange={(e) => setEngraving(e.target.value)}
              placeholder={ui.engravingPh}
            />
          </div>

          {/* 디자이너 안내 — 미리보기 대체 */}
          <div style={{
            marginTop: 20,
            padding: "16px 20px",
            borderRadius: 12,
            border: "1px solid rgba(201,168,76,0.32)",
            background: isLight
              ? "linear-gradient(135deg, rgba(201,168,76,0.08), rgba(252,248,238,0.96))"
              : "linear-gradient(135deg, rgba(201,168,76,0.08), rgba(11,22,52,0.7))",
            display: "flex",
            alignItems: "flex-start",
            gap: 14,
          }}>
            <span style={{ fontSize: 28, lineHeight: 1 }}>✏️</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(201,168,76,0.95)", marginBottom: 4 }}>
                디자이너 시안 안내
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.7, color: isLight ? "rgba(40,35,20,0.82)" : "rgba(210,198,160,0.88)" }}>
                {ui.designerNotice}
              </div>
            </div>
          </div>
        </section>

        {/* Material options */}
        {(products.has("stamp") || products.has("doorplate")) && (
          <section className="wink-panel" style={{ marginBottom: 20 }}>
            <div className="wink-form" style={{ gap: 20 }}>
              {products.has("stamp") && (
                <div>
                  <div className="wink-section-title" style={{ marginBottom: 10, fontSize: 16 }}>
                    {ui.stampMatLabel}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                    {STAMP_MATERIALS.map((m) => (
                      <MaterialPill
                        key={m}
                        label={m}
                        selected={stampMat === m}
                        onClick={() => setStampMat(stampMat === m ? "" : m)}
                        isLight={isLight}
                      />
                    ))}
                  </div>
                  <input
                    className="wink-input"
                    value={stampMat}
                    onChange={(e) => setStampMat(e.target.value)}
                    placeholder={ui.stampMatPh}
                  />
                </div>
              )}
              {products.has("doorplate") && (
                <div>
                  <div className="wink-section-title" style={{ marginBottom: 10, fontSize: 16 }}>
                    {ui.doorplateMatLabel}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                    {DOORPLATE_MATERIALS.map((m) => (
                      <MaterialPill
                        key={m}
                        label={m}
                        selected={doorplateMat === m}
                        onClick={() => setDoorplateMat(doorplateMat === m ? "" : m)}
                        isLight={isLight}
                      />
                    ))}
                  </div>
                  <input
                    className="wink-input"
                    value={doorplateMat}
                    onChange={(e) => setDoorplateMat(e.target.value)}
                    placeholder={ui.doorplateMatPh}
                  />
                </div>
              )}
            </div>
          </section>
        )}

        {/* Memo */}
        <section className="wink-panel" style={{ marginBottom: 20 }}>
          <div className="wink-field">
            <label>{ui.memoLabel}</label>
            <textarea
              className="wink-textarea"
              rows={4}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder={ui.memoPh}
            />
          </div>
        </section>

        {/* Delivery Address */}
        <section className="wink-panel" style={{ marginBottom: 20 }}>
          <div className="wink-section-title" style={{ marginBottom: 14 }}>
            {ui.deliverySectionTitle}
          </div>
          <div className="wink-form-grid">
            {/* 받는 분 이름 */}
            <div className="wink-field">
              <label>{ui.deliveryRecipientLabel}</label>
              <input
                className="wink-input"
                value={deliveryRecipient}
                onChange={(e) => setDeliveryRecipient(e.target.value)}
                placeholder={ui.deliveryRecipientPh}
                autoComplete="name"
              />
            </div>
            {/* 연락처 */}
            <div className="wink-field">
              <label>{ui.deliveryPhoneLabel}</label>
              <input
                className="wink-input"
                type="tel"
                value={deliveryPhone}
                onChange={(e) => setDeliveryPhone(e.target.value)}
                placeholder={ui.deliveryPhonePh}
                autoComplete="tel"
              />
            </div>
            {/* 우편번호 + 검색 버튼 */}
            <div className="wink-field wink-field-full">
              <label>{ui.deliveryZipLabel}</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  className="wink-input"
                  value={deliveryZip}
                  onChange={(e) => setDeliveryZip(e.target.value)}
                  placeholder="00000"
                  style={{ maxWidth: 140 }}
                  readOnly
                />
                <button
                  type="button"
                  onClick={() =>
                    openDaumPostcode((zip, addr) => {
                      setDeliveryZip(zip);
                      setDeliveryAddr(addr);
                      setDeliveryAddrDetail("");
                    })
                  }
                  style={{
                    padding: "0 20px",
                    borderRadius: 10,
                    border: "1px solid rgba(201,168,76,0.6)",
                    background: isLight
                      ? "rgba(201,168,76,0.12)"
                      : "rgba(201,168,76,0.10)",
                    color: isLight ? "rgba(120,90,20,0.95)" : "rgba(201,168,76,0.95)",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.15s",
                  }}
                >
                  {ui.deliveryZipSearchBtn}
                </button>
              </div>
            </div>
            {/* 기본 주소 */}
            <div className="wink-field wink-field-full">
              <label>{ui.deliveryAddrLabel}</label>
              <input
                className="wink-input"
                value={deliveryAddr}
                onChange={(e) => setDeliveryAddr(e.target.value)}
                placeholder={ui.deliveryAddrLabel}
                autoComplete="street-address"
                readOnly={!!deliveryZip}
              />
            </div>
            {/* 상세 주소 */}
            <div className="wink-field wink-field-full">
              <label>{ui.deliveryAddrDetailLabel}</label>
              <input
                className="wink-input"
                value={deliveryAddrDetail}
                onChange={(e) => setDeliveryAddrDetail(e.target.value)}
                placeholder={ui.deliveryAddrDetailPh}
                autoComplete="address-line2"
              />
            </div>
            {/* 배송 메모 */}
            <div className="wink-field wink-field-full">
              <label>{ui.deliveryMemoLabel}</label>
              <input
                className="wink-input"
                value={deliveryMemo}
                onChange={(e) => setDeliveryMemo(e.target.value)}
                placeholder={ui.deliveryMemoPh}
              />
            </div>
          </div>
        </section>

        {error && <div className="wink-error-banner">{error}</div>}

        <div className="wink-actions wink-actions-between">
          <button
            type="button"
            className="wink-secondary-btn"
            onClick={() => router.push(`/${lang}/category`)}
          >
            {ui.btnBack}
          </button>
          <button
            type="button"
            className="wink-primary-btn"
            onClick={handleNextStep}
          >
            {ui.btnNext}
          </button>
        </div>
      </div>
    </main>
  );
}
