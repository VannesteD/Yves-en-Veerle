export default function ShopHeader({ productCount }: { productCount: number }) {
  return (
    <header className="mb-12 text-center">
      <p className="font-accent mb-4 text-sm uppercase tracking-[0.2em] text-[#c9a227]">Ontdek</p>
      <h1 className="font-title mb-6 text-4xl tracking-wide text-[#faf8f5] md:text-6xl">Ons Assortiment</h1>
      <p className="mx-auto mb-4 max-w-lg leading-relaxed text-[#faf8f5]/60">Ontdek onze volledige selectie van vers vlees en ambachtelijke producten. Alles met zorg geselecteerd en bereid.</p>
      <p className="text-sm text-[#faf8f5]/40">{productCount} {productCount === 1 ? "product" : "producten"} gevonden</p>
    </header>
  );
}
