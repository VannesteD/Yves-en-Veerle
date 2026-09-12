import Link from "next/link";

import { CHARCUTERIE_SUBCATEGORIES, PRODUCT_CATEGORIES } from "@/lib/types";
import { shopHref, type ShopFilters } from "@/lib/shop-url";

export default function ShopSidebar({ filters }: { filters: ShopFilters }) {
  const categories = ["Alles", ...PRODUCT_CATEGORIES];

  return (
    <aside className="space-y-8" aria-label="Productfilters">
      <form action="/shop" method="get" role="search">
        <label htmlFor="product-search" className="mb-4 block text-xs font-medium uppercase tracking-widest text-[#faf8f5]/50">Zoeken</label>
        <div className="flex gap-2">
          <input id="product-search" name="q" type="search" defaultValue={filters.q} maxLength={80} placeholder="Zoek een product…" className="min-w-0 flex-1 rounded-lg border border-[#faf8f5]/10 bg-[#1a1a1a] px-4 py-3 text-sm text-[#faf8f5] outline-none placeholder:text-[#faf8f5]/30 focus:border-[#c9a227]" />
          <button type="submit" className="min-h-11 rounded-lg border border-[#c9a227]/30 px-4 text-[#c9a227] hover:border-[#c9a227]" aria-label="Zoeken">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>
        </div>
        {filters.category !== "Alles" && <input type="hidden" name="category" value={filters.category} />}
        {filters.subcategory !== "Alles" && <input type="hidden" name="subcategory" value={filters.subcategory} />}
        {filters.sort !== "featured" && <input type="hidden" name="sort" value={filters.sort} />}
      </form>

      <div className="h-px bg-[#faf8f5]/10" />
      <div>
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-[#faf8f5]/50">Categorieën</h2>
        <ul className="space-y-1">
          {categories.map((category) => {
            const active = filters.category === category;
            return (
              <li key={category}>
                <Link href={shopHref(filters, { category, subcategory: "Alles", page: 1 })} aria-current={active ? "page" : undefined} className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${active ? "bg-[#c9a227]/10 font-medium text-[#c9a227]" : "text-[#faf8f5]/70 hover:bg-[#faf8f5]/5 hover:text-[#faf8f5]"}`}>
                  <span className={`h-2 w-2 rounded-full ${active ? "bg-[#c9a227]" : "bg-[#faf8f5]/20"}`} aria-hidden="true" />
                  {category}
                </Link>
                {category === "Charcuterie" && filters.category === "Charcuterie" && (
                  <ul className="ml-6 border-l border-[#faf8f5]/10 py-2 pl-2">
                    {["Alles", ...CHARCUTERIE_SUBCATEGORIES].map((subcategory) => {
                      const subActive = filters.subcategory === subcategory;
                      return <li key={subcategory}><Link href={shopHref(filters, { subcategory, page: 1 })} aria-current={subActive ? "page" : undefined} className={`block min-h-10 rounded px-3 py-2 text-sm ${subActive ? "bg-[#c9a227]/10 text-[#c9a227]" : "text-[#faf8f5]/50 hover:text-[#faf8f5]"}`}>{subcategory}</Link></li>;
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
