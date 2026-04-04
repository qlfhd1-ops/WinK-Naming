"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppLang, isSupportedLang } from "@/lib/lang-config";

type OrderItem = {
  id?: string;
  title: string;
  description?: string;
  quantity: number;
  price: number;
  briefId?: string;
  packageType?: string;
};

type OrderRecord = {
  id: string;
  customer?: {
    name?: string;
    email?: string;
    note?: string;
  };
  items: OrderItem[];
  total: number;
  createdAt: string;
  lang?: string;
};

const STORAGE_KEY = "wink.naming.latest-order";

const COPY = {
  ko: {
    chip: "Wink Orders",
    title: "주문이 접수되었습니다",
    sub: "선택하신 패키지와 주문 정보를 기준으로 다음 작업이 진행됩니다.",
    empty: "저장된 주문 정보가 없습니다.",
    loading: "주문 정보를 불러오고 있습니다...",
    orderInfo: "주문 정보",
    orderItems: "주문 상품",
    customerInfo: "주문자 정보",
    total: "총 결제 예정 금액",
    orderId: "주문 번호",
    orderedAt: "접수 일시",
    quantity: "수량",
    price: "금액",
    briefId: "브리프 ID",
    name: "이름",
    email: "이메일",
    note: "요청 메모",
    noNote: "추가 메모가 없습니다.",
    startAgain: "다시 설계하기",
    goCart: "장바구니 보기",
    goCategory: "카테고리로 이동",
  },
  en: {
    chip: "Wink Orders",
    title: "Your order has been received",
    sub: "The next steps will proceed based on your selected package and order information.",
    empty: "No saved order information was found.",
    loading: "Loading order information...",
    orderInfo: "Order Information",
    orderItems: "Ordered Items",
    customerInfo: "Customer Information",
    total: "Estimated Total",
    orderId: "Order ID",
    orderedAt: "Received At",
    quantity: "Quantity",
    price: "Price",
    briefId: "Brief ID",
    name: "Name",
    email: "Email",
    note: "Request Note",
    noNote: "No additional note provided.",
    startAgain: "Start Again",
    goCart: "View Cart",
    goCategory: "Go to Category",
  },
  ja: {
    chip: "Wink Orders",
    title: "ご注文を受け付けました",
    sub: "選択されたパッケージと注文情報をもとに次の作業が進みます。",
    empty: "保存された注文情報がありません。",
    loading: "注文情報を読み込んでいます...",
    orderInfo: "注文情報",
    orderItems: "注文商品",
    customerInfo: "注文者情報",
    total: "お支払い予定金額",
    orderId: "注文番号",
    orderedAt: "受付日時",
    quantity: "数量",
    price: "金額",
    briefId: "ブリーフ ID",
    name: "名前",
    email: "メール",
    note: "要望メモ",
    noNote: "追加メモはありません。",
    startAgain: "もう一度設計する",
    goCart: "カートを見る",
    goCategory: "カテゴリへ移動",
  },
  zh: {
    chip: "Wink Orders",
    title: "您的订单已提交",
    sub: "后续流程将根据您选择的配套与订单信息继续进行。",
    empty: "未找到已保存的订单信息。",
    loading: "正在加载订单信息...",
    orderInfo: "订单信息",
    orderItems: "订单商品",
    customerInfo: "订购人信息",
    total: "预计支付总额",
    orderId: "订单编号",
    orderedAt: "提交时间",
    quantity: "数量",
    price: "金额",
    briefId: "简报 ID",
    name: "姓名",
    email: "邮箱",
    note: "备注",
    noNote: "没有附加备注。",
    startAgain: "重新开始设计",
    goCart: "查看购物车",
    goCategory: "前往分类页",
  },
  es: {
    chip: "Wink Orders",
    title: "Su pedido ha sido recibido",
    sub: "Los siguientes pasos avanzarán según el paquete seleccionado y la información del pedido.",
    empty: "No se encontró información de pedido guardada.",
    loading: "Cargando la información del pedido...",
    orderInfo: "Información del pedido",
    orderItems: "Productos pedidos",
    customerInfo: "Información del cliente",
    total: "Total estimado",
    orderId: "Número de pedido",
    orderedAt: "Fecha de recepción",
    quantity: "Cantidad",
    price: "Precio",
    briefId: "ID del brief",
    name: "Nombre",
    email: "Correo",
    note: "Nota",
    noNote: "No hay nota adicional.",
    startAgain: "Empezar de nuevo",
    goCart: "Ver carrito",
    goCategory: "Ir a categoría",
  },
  ru: {
    chip: "Wink Orders",
    title: "Ваш заказ получен",
    sub: "Следующие шаги будут выполнены в соответствии с выбранным пакетом и информацией о заказе.",
    empty: "Сохранённая информация о заказе не найдена.",
    loading: "Загрузка информации о заказе...",
    orderInfo: "Информация о заказе",
    orderItems: "Заказанные товары",
    customerInfo: "Информация о клиенте",
    total: "Приблизительный итог",
    orderId: "Номер заказа",
    orderedAt: "Дата получения",
    quantity: "Количество",
    price: "Цена",
    briefId: "ID брифа",
    name: "Имя",
    email: "Email",
    note: "Примечание",
    noNote: "Дополнительных примечаний нет.",
    startAgain: "Начать заново",
    goCart: "Просмотреть корзину",
    goCategory: "Перейти к категории",
  },
  fr: {
    chip: "Wink Orders",
    title: "Votre commande a été reçue",
    sub: "Les étapes suivantes avanceront selon le package sélectionné et les informations de commande.",
    empty: "Aucune information de commande sauvegardée trouvée.",
    loading: "Chargement des informations de commande...",
    orderInfo: "Informations de commande",
    orderItems: "Articles commandés",
    customerInfo: "Informations client",
    total: "Total estimé",
    orderId: "Numéro de commande",
    orderedAt: "Date de réception",
    quantity: "Quantité",
    price: "Prix",
    briefId: "ID du brief",
    name: "Nom",
    email: "Email",
    note: "Note",
    noNote: "Aucune note supplémentaire.",
    startAgain: "Recommencer",
    goCart: "Voir le panier",
    goCategory: "Aller à la catégorie",
  },
  ar: {
    chip: "Wink Orders",
    title: "تم استلام طلبك",
    sub: "ستتقدم الخطوات التالية وفقاً للحزمة المختارة ومعلومات الطلب.",
    empty: "لم يتم العثور على معلومات طلب محفوظة.",
    loading: "جارٍ تحميل معلومات الطلب...",
    orderInfo: "معلومات الطلب",
    orderItems: "المنتجات المطلوبة",
    customerInfo: "معلومات العميل",
    total: "الإجمالي التقريبي",
    orderId: "رقم الطلب",
    orderedAt: "تاريخ الاستلام",
    quantity: "الكمية",
    price: "السعر",
    briefId: "معرّف الموجز",
    name: "الاسم",
    email: "البريد الإلكتروني",
    note: "ملاحظة",
    noNote: "لا توجد ملاحظات إضافية.",
    startAgain: "البدء من جديد",
    goCart: "عرض سلة التسوق",
    goCategory: "الذهاب إلى الفئة",
  },
  hi: {
    chip: "Wink Orders",
    title: "आपका ऑर्डर प्राप्त हुआ",
    sub: "अगले चरण चुने गए पैकेज और ऑर्डर जानकारी के अनुसार आगे बढ़ेंगे।",
    empty: "कोई सहेजी गई ऑर्डर जानकारी नहीं मिली।",
    loading: "ऑर्डर जानकारी लोड हो रही है...",
    orderInfo: "ऑर्डर जानकारी",
    orderItems: "ऑर्डर किए गए उत्पाद",
    customerInfo: "ग्राहक जानकारी",
    total: "अनुमानित कुल",
    orderId: "ऑर्डर संख्या",
    orderedAt: "प्राप्ति तिथि",
    quantity: "मात्रा",
    price: "कीमत",
    briefId: "ब्रीफ आईडी",
    name: "नाम",
    email: "ईमेल",
    note: "नोट",
    noNote: "कोई अतिरिक्त नोट नहीं।",
    startAgain: "फिर से शुरू करें",
    goCart: "कार्ट देखें",
    goCategory: "श्रेणी पर जाएं",
  },
} as const;

function getLocale(lang: AppLang) {
  switch (lang) {
    case "ko":
      return "ko-KR";
    case "ja":
      return "ja-JP";
    case "zh":
      return "zh-CN";
    case "es":
      return "es-ES";
    default:
      return "en-US";
  }
}

function formatDate(value: string, lang: AppLang) {
  try {
    return new Intl.DateTimeFormat(getLocale(lang), {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function formatKRW(value: number, lang: AppLang) {
  try {
    return new Intl.NumberFormat(getLocale(lang), {
      style: "currency",
      currency: "KRW",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `₩${value.toLocaleString()}`;
  }
}

export default function OrdersPage() {
  const router = useRouter();
  const params = useParams();

  const rawLang = String(params.lang || "ko");
  const lang: AppLang = isSupportedLang(rawLang) ? rawLang : "ko";
  const ui = COPY[lang];

  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);

      if (!saved) {
        setOrder(null);
        setLoaded(true);
        return;
      }

      const parsed = JSON.parse(saved) as OrderRecord;
      setOrder(parsed);
      setLoaded(true);
    } catch {
      setOrder(null);
      setLoaded(true);
    }
  }, []);

  const computedTotal = useMemo(() => {
    if (!order) return 0;
    return order.items.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0
    );
  }, [order]);

  const displayTotal = order?.total && order.total > 0 ? order.total : computedTotal;

  if (!loaded) {
    return (
      <main className="wink-page">
        <div className="wink-container">
          <div className="wink-chip">{ui.chip}</div>
          <h1 className="wink-title">{ui.title}</h1>
          <p className="wink-sub">{ui.sub}</p>

          <div className="wink-panel" style={{ marginTop: 20 }}>
            {ui.loading}
          </div>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="wink-page">
        <div className="wink-container">
          <div className="wink-chip">{ui.chip}</div>
          <h1 className="wink-title">{ui.title}</h1>
          <p className="wink-sub">{ui.sub}</p>

          <div className="wink-panel" style={{ marginTop: 20, marginBottom: 20 }}>
            {ui.empty}
          </div>

          <div className="wink-actions">
            <button
              type="button"
              className="wink-primary-btn"
              onClick={() => router.push(`/${lang}/category`)}
            >
              {ui.goCategory}
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="wink-page">
      <div className="wink-container">
        <div className="wink-chip">{ui.chip}</div>
        <h1 className="wink-title">{ui.title}</h1>
        <p className="wink-sub">{ui.sub}</p>

        <section className="wink-panel" style={{ marginBottom: 24 }}>
          <div className="wink-section-title" style={{ marginBottom: 12 }}>
            {ui.orderInfo}
          </div>

          <div className="wink-brief-grid">
            <div>
              <strong>{ui.orderId}</strong> : {order.id}
            </div>
            <div>
              <strong>{ui.orderedAt}</strong> : {formatDate(order.createdAt, lang)}
            </div>
          </div>
        </section>

        <section className="wink-result-card" style={{ marginBottom: 24 }}>
          <div className="wink-section-title" style={{ marginBottom: 14 }}>
            {ui.orderItems}
          </div>

          <div className="wink-form" style={{ gap: 12 }}>
            {order.items.map((item, index) => (
              <div
                key={`${item.id ?? item.title}-${index}`}
                className="wink-result-section"
              >
                <div className="wink-result-head">
                  <div className="wink-card-title">{item.title}</div>
                  <div className="wink-score-pill">
                    {formatKRW(item.price * item.quantity, lang)}
                  </div>
                </div>

                <div className="wink-result-text">{item.description || "-"}</div>

                <div
                  style={{
                    marginTop: 10,
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    color: "var(--text-soft)",
                    fontSize: 14,
                    flexWrap: "wrap",
                  }}
                >
                  <span>
                    {ui.quantity} {item.quantity}
                  </span>
                  {item.briefId ? (
                    <span>
                      {ui.briefId}: {item.briefId}
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="wink-result-grid">
          <section className="wink-result-card">
            <div className="wink-section-title" style={{ marginBottom: 14 }}>
              {ui.customerInfo}
            </div>

            <div className="wink-form" style={{ gap: 12 }}>
              <div className="wink-result-section">
                <div className="wink-result-label">{ui.name}</div>
                <div className="wink-result-text">
                  {order.customer?.name || "-"}
                </div>
              </div>

              <div className="wink-result-section">
                <div className="wink-result-label">{ui.email}</div>
                <div className="wink-result-text">
                  {order.customer?.email || "-"}
                </div>
              </div>

              <div className="wink-result-section">
                <div className="wink-result-label">{ui.note}</div>
                <div className="wink-result-text">
                  {order.customer?.note?.trim() || ui.noNote}
                </div>
              </div>
            </div>
          </section>

          <section className="wink-result-card">
            <div className="wink-section-title" style={{ marginBottom: 14 }}>
              {ui.total}
            </div>

            <div className="wink-top-pick-score">
              {formatKRW(displayTotal, lang)}
            </div>
          </section>
        </section>

        <div className="wink-actions wink-actions-between" style={{ marginTop: 28 }}>
          <button
            type="button"
            className="wink-secondary-btn"
            onClick={() => router.push(`/${lang}/cart`)}
          >
            {ui.goCart}
          </button>

          <button
            type="button"
            className="wink-primary-btn"
            onClick={() => router.push(`/${lang}/category`)}
          >
            {ui.startAgain}
          </button>
        </div>
      </div>
    </main>
  );
}