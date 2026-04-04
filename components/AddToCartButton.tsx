"use client";

import { useState } from "react";
import { addCartItem, type CartItem } from "@/lib/cart";

type AddToCartButtonProps = {
  item: Omit<CartItem, "id" | "quantity">;
  label?: string;
  doneLabel?: string;
  className?: string;
};

function buildCartItemId(item: Omit<CartItem, "id" | "quantity">) {
  const baseName =
    "name" in item && typeof item.name === "string" && item.name.trim()
      ? item.name
      : "title" in item && typeof item.title === "string" && item.title.trim()
      ? item.title
      : "item";

  return `${item.type}-${baseName}-${Date.now()}`;
}

export default function AddToCartButton({
  item,
  label = "장바구니 담기",
  doneLabel = "담았습니다",
  className = "wink-primary-btn",
}: AddToCartButtonProps) {
  const [done, setDone] = useState(false);

  const handleClick = () => {
    addCartItem({
      ...item,
      id: buildCartItemId(item),
      quantity: 1,
    });

    setDone(true);

    window.setTimeout(() => {
      setDone(false);
    }, 1600);
  };

  return (
    <button
      type="button"
      className={className}
      onClick={handleClick}
      disabled={done}
    >
      {done ? doneLabel : label}
    </button>
  );
}