import Link from "next/link";

function safeOrderNumber(value: string | string[] | undefined) {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate && /^YV-[A-Z0-9-]{8,30}$/.test(candidate) ? candidate : "Wordt per e-mail bevestigd";
}

export default async function SuccessPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const orderNumber = safeOrderNumber(params.order);
  const emailSent = params.email === "sent";

  return (
    <div className="flex min-h-screen items-center bg-[#faf8f5] pb-16 pt-28">
      <main className="container mx-auto px-4">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center border-2 border-[#c9a227]" aria-hidden="true"><svg className="h-12 w-12 text-[#c9a227]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg></div>
          <p className="font-accent mb-4 text-sm uppercase tracking-[0.2em] text-[#c9a227]">Bestelling Geplaatst</p>
          <h1 className="font-title mb-4 text-4xl tracking-wide text-[#1a1a1a] md:text-5xl">Bedankt!</h1>
          <p className="mb-8 text-lg text-[#1a1a1a]/60">Uw bestelling is veilig ontvangen. {emailSent ? "Er is een bevestigingsmail verzonden." : "Als de bevestigingsmail uitblijft, nemen wij rechtstreeks contact met u op."}</p>
          <div className="mb-8 bg-[#0f0f0f] p-6"><p className="mb-2 text-sm uppercase tracking-wide text-[#faf8f5]/50">Bestelnummer</p><p className="font-title text-2xl font-semibold tracking-wide text-[#c9a227]">{orderNumber}</p></div>
          <section className="mb-8 border border-[#1a1a1a]/10 p-6 text-left" aria-labelledby="next-steps"><h2 id="next-steps" className="font-title mb-4 text-lg tracking-wide">Wat gebeurt er nu?</h2><ol className="list-decimal space-y-3 pl-5 text-[#1a1a1a]/60"><li>Wij controleren uw bestelling.</li><li>We bereiden alles met de grootste zorg voor.</li><li>We nemen contact op over afhaling of levering.</li></ol></section>
          <div className="flex flex-col justify-center gap-4 sm:flex-row"><Link href="/" className="inline-flex min-h-12 items-center justify-center bg-[#c9a227] px-8 text-[#0f0f0f] hover:bg-[#d4b945]">Terug naar Home</Link><Link href="/shop" className="inline-flex min-h-12 items-center justify-center border border-[#1a1a1a]/20 px-8 text-[#1a1a1a]/70 hover:border-[#c9a227] hover:text-[#c9a227]">Verder Winkelen</Link></div>
          <p className="mt-12 text-sm text-[#1a1a1a]/50">Vragen? Bel <a href="tel:+32478550731" className="text-[#a68520] underline">0478 55 07 31</a>.</p>
        </div>
      </main>
    </div>
  );
}
