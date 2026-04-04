export type CartItemType = "naming-package";

export type CartItem = {
  id: string;
  type: CartItemType;
  briefId: string;
  packageType: "stamp" | "doorplate" | "giftcard";
  title: string;
  description: string;
  price: number;
  quantity: number;
  lang: "ko" | "en" | "ja" | "zh" | "es" | "ru" | "fr" | "ar" | "hi";
  createdAt: string;
  selectedName?: string;
  selectedNameIndex?: number;
  category?: string;
  meaning?: string;
};

const CART_KEY = "wink-cart";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getCartItems(): CartItem[] {
  if (!isBrowser()) return [];

  const raw = localStorage.getItem(CART_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCartItems(items: CartItem[]) {
  if (!isBrowser()) return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addCartItem(item: CartItem) {
  const items = getCartItems();

  const existingIndex = items.findIndex(
    (x) => x.briefId === item.briefId && x.packageType === item.packageType
  );

  if (existingIndex >= 0) {
    items[existingIndex] = {
      ...items[existingIndex],
      quantity: items[existingIndex].quantity + item.quantity,
    };
  } else {
    items.unshift(item);
  }

  saveCartItems(items);
}

export function removeCartItem(id: string) {
  const items = getCartItems().filter((item) => item.id !== id);
  saveCartItems(items);
}

export function clearCart() {
  if (!isBrowser()) return;
  localStorage.removeItem(CART_KEY);
}

export function getCartCount() {
  return getCartItems().reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartTotal() {
  return getCartItems().reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
}