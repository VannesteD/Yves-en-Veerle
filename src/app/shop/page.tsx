import type { Metadata } from "next";
import Link from "next/link";

import ProductCard from "@/components/shop/ProductCard";
import ShopHeader from "@/components/shop/ShopHeader";
import ShopSidebar from "@/components/shop/ShopSidebar";
import { getProducts } from "@/lib/products";
import { shopHref, type ShopFilters } from "@/lib/shop-url";
import { CHARCUTERIE_SUBCATEGORIES, PRODUCT_CATEGORIES } from "@/lib/types";

export const metadata: Metadata = {
  title: "Assortiment",
  description: "Bekijk het assortiment vers vlees, charcuterie en huisbereide gerechten van Yves & Veerle in Menen.",
  alternates: { canonical: "/shop" },
};

const PAGE_SIZE = 12;
const SORT_OPTIONS = ["featured", "price-asc", "price-desc", "name-asc"] as const;

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function readFilters(params: Record<string, string | string[] | undefined>): ShopFilters {
  const categoryValue = single(params.category);
  const subcategoryValue = single(params.subcategory);
  const sortValue = single(params.sort);
  const pageValue = Number.parseInt(single(params.page), 10);
  return {
    q: single(params.q).trim().slice(0, 80),
    category: PRODUCT_CATEGORIES.includes(categoryValue as (typeof PRODUCT_CATEGORIES)[number]) ? categoryValue : "Alles",
    subcategory: CHARCUTERIE_SUBCATEGORIES.includes(subcategoryValue as (typeof CHARCUTERIE_SUBCATEGORIES)[number]) ? subcategoryValue : "Alles",
    sort: SORT_OPTIONS.includes(sortValue as (typeof SORT_OPTIONS)[number]) ? sortValue : "featured",
    page: Number.isFinite(pageValue) && pageValue > 0 ? pageValue : 1,
  };
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const filters = readFilters(await searchParams);
  const products = await getProducts();
  const query = filters.q.toLocaleLowerCase("nl");
  const filtered = products
    .filter((product) => filters.category === "Alles" || product.category === filters.category)
    .filter((product) => filters.category !== "Charcuterie" || filters.subcategory === "Alles" || product.subcategory === filters.subcategory)
    .filter((product) => !query || `${product.name} ${product.description ?? ""}`.toLocaleLowerCase("nl").includes(query))
    .sort((a, b) => {
      if (filters.sort === "price-asc") return a.price - b.price;
      if (filters.sort === "price-desc") return b.price - a.price;
      if (filters.sort === "name-asc") return a.name.localeCompare(b.name, "nl");
      return Number(b.featured) - Number(a.featured);
    });
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(filters.page, pageCount);
  const visibleProducts = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const currentFilters = { ...filters, page: currentPage };

  return (
    <div className="min-h-screen bg-[#0f0f0f] pb-16 pt-28">
      <div className="container mx-auto px-4">
        <ShopHeader productCount={filtered.length} />
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
          <div className="w-full flex-shrink-0 lg:w-72"><div className="lg:sticky lg:top-24"><ShopSidebar filters={currentFilters} /></div></div>
          <div className="min-w-0 flex-grow">
            <form action="/shop" method="get" className="mb-6 flex items-center justify-end gap-3">
              <label htmlFor="sort" className="text-sm text-[#faf8f5]/60">Sorteren</label>
              <select id="sort" name="sort" defaultValue={filters.sort} className="min-h-11 border border-[#c9a227]/30 bg-[#1a1a1a] px-4 py-2 text-sm text-[#faf8f5] outline-none focus:border-[#c9a227]">
                <option value="featured">Aanbevolen</option><option value="price-asc">Prijs: laag naar hoog</option><option value="price-desc">Prijs: hoog naar laag</option><option value="name-asc">Naam: A-Z</option>
              </select>
              {filters.q && <input type="hidden" name="q" value={filters.q} />}
              {filters.category !== "Alles" && <input type="hidden" name="category" value={filters.category} />}
              {filters.subcategory !== "Alles" && <input type="hidden" name="subcategory" value={filters.subcategory} />}
              <button type="submit" className="min-h-11 border border-[#c9a227]/30 px-4 text-sm text-[#c9a227] hover:border-[#c9a227]">Toepassen</button>
            </form>
            {visibleProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">{visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div>
            ) : (
              <div className="border border-[#c9a227]/20 bg-[#1a1a1a] p-12 text-center"><h2 className="font-title mb-3 text-2xl text-[#faf8f5]">Geen producten gevonden</h2><p className="text-[#faf8f5]/60">Pas de filters aan of bekijk het volledige assortiment.</p><Link href="/shop" className="mt-6 inline-flex min-h-11 items-center bg-[#c9a227] px-6 text-[#0f0f0f]">Wis filters</Link></div>
            )}
            {pageCount > 1 && <nav className="mt-12 flex flex-wrap justify-center gap-2" aria-label="Paginering">{Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => <Link key={page} href={shopHref(currentFilters, { page })} aria-current={page === currentPage ? "page" : undefined} className={`flex h-11 min-w-11 items-center justify-center border px-3 ${page === currentPage ? "border-[#c9a227] bg-[#c9a227] text-[#0f0f0f]" : "border-[#c9a227]/30 text-[#c9a227] hover:border-[#c9a227]"}`}>{page}</Link>)}</nav>}
          </div>
        </div>
      </div>
    </div>
  );
}
