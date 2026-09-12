import "server-only";

import { fallbackProducts } from "@/data/catalog";
import { fetchProductsFromDatabase, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

export async function getProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return fallbackProducts;
  }

  return fetchProductsFromDatabase();
}

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((product) => product.featured && product.in_stock).slice(0, limit);
}
