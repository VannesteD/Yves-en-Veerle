import Image from "next/image";

import AddToCartButton from "@/components/shop/AddToCartButton";
import type { Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden border border-[#c9a227]/20 bg-[#1a1a1a] shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#c9a227]/10">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#2a2a2a]">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a]" aria-hidden="true">
            <svg className="h-16 w-16 text-[#c9a227]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.6-4.6a2 2 0 012.8 0L16 16l1.6-1.6a2 2 0 012.8 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <span className="absolute left-3 top-3 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#c9a227]">
          {product.category}
        </span>
        {!product.in_stock && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0f0f0f]/70">
            <span className="bg-[#1a1a1a] px-4 py-2 font-medium text-[#faf8f5]">Uitverkocht</span>
          </div>
        )}
      </div>
      <div className="flex flex-grow flex-col p-5">
        <h3 className="font-title mb-1 text-xl tracking-wide text-[#faf8f5] transition-colors group-hover:text-[#c9a227]">{product.name}</h3>
        {product.description && <p className="line-clamp-2 mb-4 min-h-10 text-sm text-[#faf8f5]/60">{product.description}</p>}
        <div className="mt-auto flex items-end justify-between gap-2">
          <p>
            <span className="text-2xl font-bold text-[#c9a227]">€{product.price.toFixed(2)}</span>{" "}
            <span className="text-sm text-[#faf8f5]/50">{product.unit}</span>
          </p>
          <AddToCartButton product={product} />
        </div>
      </div>
    </article>
  );
}
