import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacybeleid",
  description: "Lees hoe Slagerij - Traiteur Yves & Veerle persoonsgegevens verwerkt bij een bestelling.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] pb-20 pt-28 text-[#1a1a1a]">
      <main className="container mx-auto max-w-3xl px-4">
        <p className="font-accent mb-3 text-sm uppercase tracking-[0.2em] text-[#a68520]">Uw gegevens</p>
        <h1 className="font-title mb-8 text-4xl tracking-wide md:text-5xl">Privacybeleid</h1>
        <div className="space-y-8 leading-relaxed text-[#1a1a1a]/75">
          <section><h2 className="font-title mb-3 text-2xl text-[#1a1a1a]">Wie verwerkt uw gegevens?</h2><p>Slagerij - Traiteur Yves &amp; Veerle, Lauwbergstraat 26, 8930 Menen verwerkt de gegevens die u via deze website bezorgt. Vragen kunnen naar <a href="mailto:hetvleeskuipke@gmail.com" className="underline">hetvleeskuipke@gmail.com</a>.</p></section>
          <section><h2 className="font-title mb-3 text-2xl text-[#1a1a1a]">Welke gegevens en waarom?</h2><p>Bij een bestelling verwerken we uw naam, e-mailadres, telefoonnummer, bestelregels en eventuele opmerkingen. Deze gegevens zijn nodig om de bestelling te controleren, bevestigen, bereiden en de afhaling of levering af te spreken.</p></section>
          <section><h2 className="font-title mb-3 text-2xl text-[#1a1a1a]">Dienstverleners</h2><p>Bestelgegevens worden technisch verwerkt in Supabase. Resend wordt gebruikt om de orderbevestiging per e-mail te versturen. Zij ontvangen alleen de gegevens die nodig zijn voor die taak.</p></section>
          <section><h2 className="font-title mb-3 text-2xl text-[#1a1a1a]">Bewaring en beveiliging</h2><p>Bestelgegevens worden niet langer bewaard dan nodig voor de bestelling en toepasselijke administratieve verplichtingen. De website beperkt publieke databasetoegang, controleert prijzen op de server en beveiligt het bestelformulier tegen geautomatiseerd misbruik.</p></section>
          <section><h2 className="font-title mb-3 text-2xl text-[#1a1a1a]">Lokale winkelmand</h2><p>De inhoud van uw winkelmandje wordt lokaal in uw browser opgeslagen zodat die tijdens een volgend bezoek beschikbaar blijft. Er worden geen advertentie- of trackingcookies geplaatst door deze website.</p></section>
          <section><h2 className="font-title mb-3 text-2xl text-[#1a1a1a]">Uw verzoeken</h2><p>U kunt per e-mail vragen welke gegevens over u worden bewaard en verzoeken om verbetering of verwijdering wanneer dat wettelijk mogelijk is.</p></section>
          <p className="text-sm text-[#1a1a1a]/50">Laatst bijgewerkt: 26 augustus 2026.</p>
        </div>
      </main>
    </div>
  );
}
