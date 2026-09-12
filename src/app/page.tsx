import Image from "next/image";
import Link from "next/link";

import ProductCard from "@/components/shop/ProductCard";
import { getFeaturedProducts } from "@/lib/products";

const HERO_IMAGE = "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?q=80&w=2070";

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts(4);

  return (
    <div className="min-h-screen">
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0f0f0f]">
        <Image src={HERO_IMAGE} alt="" fill sizes="100vw" quality={75} preload className="object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f0f]/70 via-[#0f0f0f]/50 to-[#0f0f0f]" aria-hidden="true" />
        <div className="reveal relative z-10 mx-auto max-w-3xl px-4 text-center">
          <p className="font-accent mb-6 text-sm uppercase tracking-[0.4em] text-[#c9a227] md:text-base">Slagerij - Traiteur</p>
          <h1 className="font-title mb-8 whitespace-nowrap text-4xl leading-none tracking-wide text-[#c9a227] md:text-6xl lg:text-7xl">Yves &amp; Veerle</h1>
          <div className="mb-8 flex items-center justify-center gap-4" aria-hidden="true">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#c9a227] md:w-24" />
            <div className="h-2 w-2 rotate-45 border border-[#c9a227]" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#c9a227] md:w-24" />
          </div>
          <p className="mb-2 text-base leading-relaxed text-[#faf8f5]/80 md:text-lg">Huisbereide passie, geserveerd met een glimlach.</p>
          <p className="mb-10 text-base leading-relaxed text-[#c9a227]/70 md:text-lg">Waar kwaliteit en klantvredenheid de basis vormen van elke specialiteit.</p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/shop" className="inline-flex min-h-12 items-center justify-center bg-[#c9a227] px-8 py-4 text-lg font-semibold tracking-wide text-[#0f0f0f] transition-transform hover:-translate-y-0.5 hover:bg-[#d4b945]">Bekijk Assortiment</Link>
            <Link href="#specialiteiten" className="inline-flex min-h-12 items-center justify-center border border-[#c9a227] px-8 py-4 text-lg font-medium tracking-wide text-[#c9a227] transition-colors hover:bg-[#c9a227] hover:text-[#0f0f0f]">Onze Specialiteiten</Link>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 motion-safe:animate-bounce" aria-hidden="true">
          <div className="flex h-10 w-6 justify-center rounded-full border border-[#c9a227]/50"><div className="mt-2 h-3 w-1 rounded-full bg-[#c9a227]/50" /></div>
        </div>
      </section>

      <section id="specialiteiten" className="bg-[#0f0f0f] py-20 md:py-28" aria-labelledby="specialiteiten-title">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 id="specialiteiten-title" className="font-title mb-8 text-4xl tracking-wide text-[#faf8f5] md:text-6xl">Specialiteiten</h2>
            <p className="text-[#faf8f5]/60">Handgeselecteerde producten waar we bijzonder trots op zijn.<br />Allemaal bereid met de beste ingrediënten en jarenlange ervaring.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-4">
            {featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
          <div className="mt-16 text-center">
            <Link href="/shop" className="inline-flex min-h-12 items-center gap-2 bg-[#c9a227] px-8 py-4 font-medium text-[#0f0f0f] transition-colors hover:bg-[#d4b945]">
              Bekijk Volledig Assortiment
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-[#1a1a1a] bg-[#0f0f0f] pb-20 pt-24 md:pb-28 md:pt-32" aria-label="Contact en openingsuren">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-16 md:grid-cols-2 lg:gap-24">
            <div className="flex flex-col items-center text-center md:items-end md:text-right">
              <p className="font-title mb-4 text-xs uppercase tracking-[0.2em] text-[#c9a227]">Blijf Verbonden</p>
              <h2 className="font-title mb-8 text-3xl tracking-wide text-[#faf8f5] md:text-4xl">Social Media</h2>
              <p className="mb-8 max-w-sm leading-relaxed text-[#faf8f5]/60">Volg ons voor de lekkerste suggesties, een kijkje achter de schermen en exclusieve acties.</p>
              <div className="flex gap-4">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center border border-[#c9a227]/30 px-5 text-[#faf8f5]/70 hover:border-[#c9a227] hover:text-[#c9a227]" aria-label="Instagram (opent in een nieuw venster)">Instagram</a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center border border-[#c9a227]/30 px-5 text-[#faf8f5]/70 hover:border-[#c9a227] hover:text-[#c9a227]" aria-label="Facebook (opent in een nieuw venster)">Facebook</a>
              </div>
            </div>
            <div className="flex flex-col items-center text-center md:items-start md:border-l md:border-[#1a1a1a] md:pl-16 md:text-left">
              <p className="font-title mb-4 text-xs uppercase tracking-[0.2em] text-[#c9a227]">Bezoek Ons</p>
              <h2 className="font-title mb-8 text-3xl tracking-wide text-[#faf8f5] md:text-4xl">Openingsuren</h2>
              <dl className="w-full max-w-sm space-y-4 text-lg text-[#faf8f5]/80">
                <Hours day="Maandag" hours={<>07:30 - 13:00<br />14:00 - 18:30</>} />
                <Hours day="Dinsdag - donderdag" hours="Gesloten" />
                <Hours day="Vrijdag" hours={<>07:30 - 13:00<br />14:00 - 18:30</>} />
                <Hours day="Zaterdag" hours={<>07:30 - 13:00<br />14:00 - 18:30</>} />
                <Hours day="Zondag" hours="07:30 - 18:00" last />
              </dl>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Hours({ day, hours, last = false }: { day: string; hours: React.ReactNode; last?: boolean }) {
  return <div className={`flex items-start justify-between gap-4 pb-2 ${last ? "" : "border-b border-[#1a1a1a]"}`}><dt className="font-medium">{day}</dt><dd className="text-right">{hours}</dd></div>;
}
