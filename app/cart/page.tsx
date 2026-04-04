"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  clearCart,
  getCartItems,
  removeCartItem,
  type CartItem,
} from "@/lib/cart";
import { AppLang } from "@/lib/lang-config";

const LANG_STORAGE_KEY = "wink.naming.preferred-lang";
const SUPPORTED_LANGS = new Set<AppLang>(["ko", "en", "ja", "zh", "es", "ru", "fr", "ar", "hi"]);

type CartCopy = {
  chip: string;
  title: string;
  sub: string;
  empty: string;
  goNaming: string;
  description: string;
  quantity: string;
  total: string;
  remove: string;
  clear: string;
  checkout: string;
  itemType: string;
  briefId: string;
  selectedName: string;
  category: string;
  meaning: string;
};

const COPY: Record<AppLang, CartCopy> = {
  ko: {
    chip: "Wink Cart",
    title: "장바구니",
    sub: "선택한 패키지를 확인하고 주문 단계로 이동할 수 있습니다.",
    empty: "장바구니가 비어 있습니다.",
    goNaming: "이름 설계하러 가기",
    description: "설명",
    quantity: "수량",
    total: "합계",
    remove: "삭제",
    clear: "비우기",
    checkout: "주문 요약으로",
    itemType: "상품 유형",
    briefId: "브리프 ID",
    selectedName: "선택한 이름",
    category: "설계 대상",
    meaning: "이름 의미",
  },
  en: {
    chip: "Wink Cart",
    title: "Cart",
    sub: "Review your selected packages and continue to checkout.",
    empty: "Your cart is empty.",
    goNaming: "Go to Naming",
    description: "Description",
    quantity: "Quantity",
    total: "Total",
    remove: "Remove",
    clear: "Clear",
    checkout: "Go to Checkout",
    itemType: "Item Type",
    briefId: "Brief ID",
    selectedName: "Selected Name",
    category: "Category",
    meaning: "Name Meaning",
  },
  ja: {
    chip: "Wink Cart",
    title: "カート",
    sub: "選択したパッケージを確認し、注文段階に進むことができます。",
    empty: "カートが空です。",
    goNaming: "ネーミングへ移動",
    description: "説明",
    quantity: "数量",
    total: "合計",
    remove: "削除",
    clear: "空にする",
    checkout: "注文概要へ",
    itemType: "商品タイプ",
    briefId: "ブリーフ ID",
    selectedName: "選択した名前",
    category: "対象カテゴリ",
    meaning: "名前の意味",
  },
  zh: {
    chip: "Wink Cart",
    title: "购物车",
    sub: "确认已选择的套餐后进入下单阶段。",
    empty: "购物车为空。",
    goNaming: "前往命名流程",
    description: "说明",
    quantity: "数量",
    total: "合计",
    remove: "删除",
    clear: "清空",
    checkout: "前往订单摘要",
    itemType: "商品类型",
    briefId: "Brief ID",
    selectedName: "已选名字",
    category: "设计对象",
    meaning: "名字含义",
  },
  es: {
    chip: "Wink Cart",
    title: "Carrito",
    sub: "Revise los paquetes seleccionados y continúe al resumen del pedido.",
    empty: "Su carrito está vacío.",
    goNaming: "Ir al Naming",
    description: "Descripción",
    quantity: "Cantidad",
    total: "Total",
    remove: "Eliminar",
    clear: "Vaciar",
    checkout: "Ir al resumen",
    itemType: "Tipo de producto",
    briefId: "ID del brief",
    selectedName: "Nombre seleccionado",
    category: "Categoría",
    meaning: "Significado del nombre",
  },
  ru: {
    chip: "Wink Cart",
    title: "Корзина",
    sub: "Просмотрите выбранные пакеты и перейдите к оформлению заказа.",
    empty: "Ваша корзина пуста.",
    goNaming: "Перейти к именованию",
    description: "Описание",
    quantity: "Количество",
    total: "Итого",
    remove: "Удалить",
    clear: "Очистить",
    checkout: "Перейти к заказу",
    itemType: "Тип товара",
    briefId: "ID брифа",
    selectedName: "Выбранное имя",
    category: "Категория",
    meaning: "Значение имени",
  },
  fr: {
    chip: "Wink Cart",
    title: "Panier",
    sub: "Vérifiez les forfaits sélectionnés et passez à la commande.",
    empty: "Votre panier est vide.",
    goNaming: "Aller au naming",
    description: "Description",
    quantity: "Quantité",
    total: "Total",
    remove: "Supprimer",
    clear: "Vider",
    checkout: "Voir le récapitulatif",
    itemType: "Type de produit",
    briefId: "ID du brief",
    selectedName: "Nom sélectionné",
    category: "Catégorie",
    meaning: "Signification du nom",
  },
  ar: {
    chip: "Wink Cart",
    title: "سلة التسوق",
    sub: "راجع الحزم المحددة وانتقل إلى مرحلة الطلب.",
    empty: "سلة التسوق فارغة.",
    goNaming: "الذهاب إلى التسمية",
    description: "الوصف",
    quantity: "الكمية",
    total: "الإجمالي",
    remove: "حذف",
    clear: "إفراغ",
    checkout: "الذهاب إلى ملخص الطلب",
    itemType: "نوع المنتج",
    briefId: "معرف الملخص",
    selectedName: "الاسم المختار",
    category: "الفئة",
    meaning: "معنى الاسم",
  },
  hi: {
    chip: "Wink Cart",
    title: "कार्ट",
    sub: "चुने गए पैकेज की समीक्षा करें और ऑर्डर चरण पर जाएं।",
    empty: "आपकी कार्ट खाली है।",
    goNaming: "नामकरण पर जाएं",
    description: "विवरण",
    quantity: "मात्रा",
    total: "कुल",
    remove: "हटाएं",
    clear: "साफ़ करें",
    checkout: "ऑर्डर सारांश पर जाएं",
    itemType: "उत्पाद प्रकार",
    briefId: "ब्रीफ ID",
    selectedName: "चुना हुआ नाम",
    category: "श्रेणी",
    meaning: "नाम का अर्थ",
  },
};

function getPreferredLang(): AppLang {
  try {
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (stored && SUPPORTED_LANGS.has(stored as AppLang)) {
      return stored as AppLang;
    }
  } catch {
    // ignore
  }

  return "ko";
}

function formatCurrency(value: number, lang: AppLang) {
  try {
    const locale =
      lang === "ko"
        ? "ko-KR"
        : lang === "ja"
        ? "ja-JP"
        : lang === "zh"
        ? "zh-CN"
        : lang === "es"
        ? "es-ES"
        : "en-US";

    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "KRW",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `₩${value.toLocaleString()}`;
  }
}

function getItemTypeLabel(item: CartItem) {
  if (item.type === "naming-package") return "naming-package";
  return item.type;
}

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [lang, setLang] = useState<AppLang>("ko");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setItems(getCartItems());
    setLang(getPreferredLang());
    setMounted(true);
  }, []);

  const ui = COPY[lang];

  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const handleRemove = (id: string) => {
    removeCartItem(id);
    setItems(getCartItems());
  };

  const handleClear = () => {
    clearCart();
    setItems([]);
  };

  const handleGoNaming = () => {
    router.push(`/${lang}/category`);
  };

  const handleCheckout = () => {
    router.push(`/${lang}/checkout`);
  };

  return (
    <main className="wink-page">
      <div className="wink-container">
        <div className="wink-chip">{ui.chip}</div>
        <h1 className="wink-title">{ui.title}</h1>
        <p className="wink-sub">{ui.sub}</p>

        {!mounted ? (
          <section className="wink-panel" style={{ marginTop: 20 }}>
            ...
          </section>
        ) : items.length === 0 ? (
          <>
            <section className="wink-panel" style={{ marginTop: 20, marginBottom: 20 }}>
              {ui.empty}
            </section>

            <div className="wink-actions">
              <button
                type="button"
                className="wink-primary-btn"
                onClick={handleGoNaming}
              >
                {ui.goNaming}
              </button>
            </div>
          </>
        ) : (
          <>
            <section className="wink-result-card" style={{ marginTop: 20 }}>
              <div className="wink-section-title" style={{ marginBottom: 18 }}>
                {ui.title}
              </div>

              <div className="wink-form" style={{ gap: 14 }}>
                {items.map((item) => (
                  <article key={item.id} className="wink-mini-card">
                    <div
                      className="wink-result-head"
                      style={{ marginBottom: 10 }}
                    >
                      <div>
                        {item.selectedName && (
                          <div
                            className="wink-card-title"
                            style={{ fontSize: 28, marginBottom: 4, letterSpacing: "0.04em" }}
                          >
                            {item.selectedName}
                          </div>
                        )}
                        <div
                          className="wink-card-title"
                          style={{ fontSize: item.selectedName ? 16 : 24, marginBottom: 6, opacity: item.selectedName ? 0.7 : 1 }}
                        >
                          {item.title}
                        </div>
                        {item.category && (
                          <div className="wink-mini-sub">
                            {ui.category}: {item.category}
                          </div>
                        )}
                        <div className="wink-mini-sub">
                          {ui.itemType}: {getItemTypeLabel(item)}
                        </div>
                        <div className="wink-mini-sub">
                          {ui.briefId}: {item.briefId}
                        </div>
                      </div>

                      <div className="wink-score-pill">
                        {formatCurrency(item.price * item.quantity, lang)}
                      </div>
                    </div>

                    {item.meaning && (
                      <div className="wink-result-section" style={{ marginTop: 0, marginBottom: 8 }}>
                        <div className="wink-result-label">{ui.meaning}</div>
                        <div className="wink-result-text">{item.meaning}</div>
                      </div>
                    )}

                    <div className="wink-result-section" style={{ marginTop: 0 }}>
                      <div className="wink-result-label">{ui.description}</div>
                      <div className="wink-result-text">
                        {item.description || "-"}
                      </div>
                    </div>

                    <div
                      className="wink-actions wink-actions-between"
                      style={{ marginTop: 14 }}
                    >
                      <div className="wink-score-pill">
                        {ui.quantity}: {item.quantity}
                      </div>

                      <button
                        type="button"
                        className="wink-secondary-btn"
                        onClick={() => handleRemove(item.id)}
                      >
                        {ui.remove}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="wink-panel" style={{ marginTop: 20 }}>
              <div className="wink-section-title" style={{ marginBottom: 14 }}>
                {ui.total}
              </div>

              <div
                className="wink-card-title"
                style={{ fontSize: 34, marginBottom: 18 }}
              >
                {formatCurrency(total, lang)}
              </div>

              <div className="wink-actions wink-actions-between">
                <button
                  type="button"
                  className="wink-secondary-btn"
                  onClick={handleClear}
                >
                  {ui.clear}
                </button>

                <div className="wink-actions">
                  <button
                    type="button"
                    className="wink-secondary-btn"
                    onClick={handleGoNaming}
                  >
                    {ui.goNaming}
                  </button>

                  <button
                    type="button"
                    className="wink-primary-btn"
                    onClick={handleCheckout}
                  >
                    {ui.checkout}
                  </button>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}