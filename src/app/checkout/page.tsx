"use client";

import Link from "next/link";

import OrderForm from "@/components/checkout/OrderForm";
import { useCart } from "@/context/CartContext";

export default function CheckoutPage() {
  const { items, getTotal, removeItem, updateQuantity } = useCart();

  return (
    <div className="min-h-screen bg-[#0f0f0f] pb-16 pt-28">
      <header className="mb-16 px-4 text-center">
        <p className="font-accent mb-4 text-sm uppercase tracking-[0.2em] text-[#c9a227]">Afronden</p>
        <h1 className="font-title mb-4 text-4xl tracking-wide text-[#faf8f5] md:text-6xl">Checkout</h1>
        <p className="text-[#faf8f5]/60">Controleer uw winkelmandje en vul uw gegevens in</p>
      </header>

      {items.length === 0 ? (
        <section className="mx-auto max-w-md border border-[#c9a227]/20 bg-[#1a1a1a] p-10 text-center" aria-labelledby="empty-cart-title">
          <h2 id="empty-cart-title" className="font-title mb-4 text-2xl tracking-wide text-[#faf8f5]">Uw winkelmandje is leeg</h2>
          <p className="mb-8 text-[#faf8f5]/60">Voeg enkele producten toe om verder te gaan met bestellen.</p>
          <Link href="/shop" className="inline-flex min-h-12 items-center bg-[#c9a227] px-8 text-[#0f0f0f] hover:bg-[#d4b945]">Bekijk Assortiment</Link>
        </section>
      ) : (
        <div className="mx-auto grid w-full max-w-5xl gap-8 px-4 lg:grid-cols-[1fr_22rem]">
          <OrderForm />
          <aside aria-label="Besteloverzicht" className="lg:order-last">
            <div className="border border-[#c9a227]/20 bg-[#1a1a1a] p-6 text-[#faf8f5] lg:sticky lg:top-28 md:p-8">
              <h2 className="font-title mb-6 text-xl tracking-wide">Overzicht</h2>
              <ul className="mb-6 space-y-5">
                {items.map((item) => (
                  <li key={item.product_id} className="border-b border-[#c9a227]/10 pb-4">
                    <div className="mb-2 flex justify-between gap-3"><span className="font-medium">{item.name}</span><span>€{(item.price * item.quantity).toFixed(2)}</span></div>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <label htmlFor={`quantity-${item.product_id}`} className="text-[#faf8f5]/60">Aantal</label>
                      <input id={`quantity-${item.product_id}`} type="number" min={1} max={20} value={item.quantity} onChange={(event) => updateQuantity(item.product_id, Number(event.target.value))} className="w-16 border border-[#c9a227]/20 bg-[#0f0f0f] px-2 py-1 text-center" />
                      <button type="button" onClick={() => removeItem(item.product_id)} className="min-h-10 text-[#faf8f5]/50 underline hover:text-[#c9a227]" aria-label={`${item.name} verwijderen`}>Verwijder</button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between border-t border-[#c9a227]/20 pt-4"><span className="font-title text-lg">Totaal</span><span className="font-title text-2xl text-[#c9a227]">€{getTotal().toFixed(2)}</span></div>
              <p className="mt-5 text-xs text-[#faf8f5]/40">De definitieve prijzen en beschikbaarheid worden bij het plaatsen server-side gecontroleerd.</p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
