export interface ShopFilters {
  q: string;
  category: string;
  subcategory: string;
  sort: string;
  page: number;
}

export function shopHref(filters: ShopFilters, updates: Partial<ShopFilters>) {
  const next = { ...filters, ...updates };
  const query = new URLSearchParams();
  if (next.q) query.set("q", next.q);
  if (next.category && next.category !== "Alles") query.set("category", next.category);
  if (next.subcategory && next.subcategory !== "Alles") query.set("subcategory", next.subcategory);
  if (next.sort && next.sort !== "featured") query.set("sort", next.sort);
  if (next.page > 1) query.set("page", String(next.page));
  const suffix = query.toString();
  return suffix ? `/shop?${suffix}` : "/shop";
}
