"use client";

import { useCart } from "@/contexts/CartContext";
import { BagIcon } from "./Icons";
import CountBadge from "./CountBadge";

export default function CartTrigger() {
  const { count, open } = useCart();

  return (
    <button
      type="button"
      onClick={open}
      aria-label={`Shopping bag, ${count} item${count === 1 ? "" : "s"}`}
      aria-haspopup="dialog"
      className="icon-btn"
    >
      <BagIcon />
      <CountBadge count={count} />
    </button>
  );
}
