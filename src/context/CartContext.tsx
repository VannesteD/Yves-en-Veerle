"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

import type { Product } from "@/lib/types";

export interface CartItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  image_url?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  getTotal: () => number;
}

interface StoredCart {
  version: 1;
  items: CartItem[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_STORAGE_KEY = "yves-veerle-cart";
const CART_EVENT = "yves-veerle-cart-change";
const EMPTY_SNAPSHOT = JSON.stringify({ version: 1, items: [] } satisfies StoredCart);

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.product_id === "string" &&
    item.product_id.length > 0 &&
    item.product_id.length <= 100 &&
    typeof item.name === "string" &&
    item.name.length > 0 &&
    item.name.length <= 120 &&
    typeof item.price === "number" &&
    Number.isFinite(item.price) &&
    item.price >= 0 &&
    Number.isInteger(item.quantity) &&
    Number(item.quantity) >= 1 &&
    Number(item.quantity) <= 20 &&
    typeof item.unit === "string" &&
    item.unit.length > 0 &&
    item.unit.length <= 40 &&
    (item.image_url === undefined || typeof item.image_url === "string")
  );
}

function parseCart(snapshot: string): CartItem[] {
  try {
    const parsed: unknown = JSON.parse(snapshot);
    const candidateItems = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === "object" && (parsed as { version?: unknown }).version === 1
        ? (parsed as { items?: unknown }).items
        : null;

    if (!Array.isArray(candidateItems) || candidateItems.length > 40) return [];
    return candidateItems.filter(isCartItem);
  } catch {
    return [];
  }
}

function getCartSnapshot() {
  return window.localStorage.getItem(CART_STORAGE_KEY) ?? EMPTY_SNAPSHOT;
}

function subscribeToCart(callback: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === CART_STORAGE_KEY) callback();
  };
  window.addEventListener("storage", handleStorage);
  window.addEventListener(CART_EVENT, callback);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(CART_EVENT, callback);
  };
}

function commitCart(items: CartItem[]) {
  const storedCart: StoredCart = { version: 1, items };
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(storedCart));
  window.dispatchEvent(new Event(CART_EVENT));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(subscribeToCart, getCartSnapshot, () => EMPTY_SNAPSHOT);
  const items = useMemo(() => parseCart(snapshot), [snapshot]);

  const addItem = useCallback((product: Product, quantity = 1) => {
    const safeQuantity = Math.max(1, Math.min(20, Math.trunc(quantity)));
    const currentItems = parseCart(getCartSnapshot());
    const existingItem = currentItems.find((item) => item.product_id === product.id);
    const nextItems = existingItem
      ? currentItems.map((item) => item.product_id === product.id
          ? { ...item, quantity: Math.min(20, item.quantity + safeQuantity) }
          : item)
      : [...currentItems, {
          product_id: product.id,
          name: product.name,
          price: product.price,
          quantity: safeQuantity,
          unit: product.unit,
          image_url: product.image_url || undefined,
        }];
    commitCart(nextItems.slice(0, 40));
  }, []);

  const removeItem = useCallback((productId: string) => {
    commitCart(parseCart(getCartSnapshot()).filter((item) => item.product_id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      commitCart(parseCart(getCartSnapshot()).filter((item) => item.product_id !== productId));
      return;
    }
    commitCart(parseCart(getCartSnapshot()).map((item) => item.product_id === productId
      ? { ...item, quantity: Math.min(20, quantity) }
      : item));
  }, []);

  const clearCart = useCallback(() => commitCart([]), []);
  const getItemCount = useCallback(() => items.reduce((count, item) => count + item.quantity, 0), [items]);
  const getSubtotal = useCallback(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const getTotal = getSubtotal;
  const value = useMemo(() => ({
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemCount,
    getSubtotal,
    getTotal,
  }), [items, addItem, removeItem, updateQuantity, clearCart, getItemCount, getSubtotal, getTotal]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart moet binnen CartProvider worden gebruikt.");
  return context;
}
