import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#0f0f0f] pb-8 pt-16 text-[#faf8f5]/60">
      <div className="container mx-auto px-4">
        <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-3">
          <div>
            <Link href="/" className="mb-4 inline-block" aria-label="Yves en Veerle – startpagina">
              <span className="font-accent block text-xs uppercase tracking-[0.2em] text-[#c9a227]">Slagerij - Traiteur</span>
              <span className="font-title text-2xl font-bold tracking-wide text-[#faf8f5]">Yves &amp; Veerle</span>
            </Link>
            <p className="max-w-xs text-[#faf8f5]/40">Huisbereide passie, geserveerd met een glimlach. Waar kwaliteit en klantvredenheid de basis vormen.</p>
          </div>
          <div>
            <h2 className="font-title mb-4 text-lg tracking-wide text-[#faf8f5]">Navigatie</h2>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-[#c9a227]">Home</Link></li>
              <li><Link href="/shop" className="hover:text-[#c9a227]">Webshop</Link></li>
              <li><Link href="/checkout" className="hover:text-[#c9a227]">Winkelmandje</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="font-title mb-4 text-lg tracking-wide text-[#faf8f5]">Contact</h2>
            <address className="space-y-3 not-italic">
              <p>Lauwbergstraat 26<br />8930 Menen</p>
              <p><a href="tel:+32478550731" className="hover:text-[#c9a227]">0478 55 07 31</a></p>
              <p><a href="mailto:hetvleeskuipke@gmail.com" className="break-all hover:text-[#c9a227]">hetvleeskuipke@gmail.com</a></p>
            </address>
          </div>
        </div>
        <div className="border-t border-[#c9a227]/20 pt-8 text-center text-sm text-[#faf8f5]/40">
          <p>© {new Date().getFullYear()} Slagerij - Traiteur Yves &amp; Veerle. Alle rechten voorbehouden.</p>
          <p className="mt-2"><Link href="/privacy" className="underline hover:text-[#c9a227]">Privacybeleid</Link></p>
        </div>
      </div>
    </footer>
  );
}
