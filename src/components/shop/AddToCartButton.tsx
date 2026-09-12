"use client";

import { useRef, useState } from "react";

import { useCart } from "@/context/CartContext";
import type { Product } from "@/lib/types";

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1_200);
  };

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={!product.in_stock}
      className="inline-flex min-h-11 items-center gap-2 px-3 py-2 text-sm font-medium text-[#c9a227] transition-colors hover:text-[#d4b945] disabled:cursor-not-allowed disabled:text-[#faf8f5]/40"
      aria-label={`${product.name} toevoegen aan winkelmandje`}
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        {added
          ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />}
      </svg>
      <span aria-live="polite">{added ? "Toegevoegd" : "Toevoegen"}</span>
    </button>
  );
}
