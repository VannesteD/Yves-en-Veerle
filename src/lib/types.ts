export const PRODUCT_CATEGORIES = [
  "Rund",
  "Varken",
  "Kip",
  "Lam",
  "Gevogelte",
  "Paard",
  "Gehakt",
  "Worsten",
  "Burgers",
  "Charcuterie",
  "Bereide gerechten",
  "Kaas",
  "Conserven",
  "Overige",
] as const;

export const CHARCUTERIE_SUBCATEGORIES = [
  "Paté",
  "Salades",
  "Saucisson en dergelijke",
  "Salami",
  "Hesp",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
export type CharcuterieSubcategory = (typeof CHARCUTERIE_SUBCATEGORIES)[number];

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: ProductCategory;
  subcategory: CharcuterieSubcategory | null;
  image_url: string | null;
  unit: string;
  in_stock: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  product_id: string;
  name: string;
  quantity: number;
  price: number;
  unit: string;
}

export interface Order {
  id: string;
  order_number: string;
  idempotency_key: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  order_items: OrderItem[];
  subtotal: number;
  total_amount: number;
  status: "pending" | "confirmed" | "processing" | "ready" | "completed" | "cancelled";
  notes: string | null;
  created_at: string;
  updated_at: string;
}
