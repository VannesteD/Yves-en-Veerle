import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Inter } from "next/font/google";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { CartProvider } from "@/context/CartContext";
import { SITE_DESCRIPTION, SITE_NAME, siteUrl } from "@/lib/site";

import "./globals.css";

const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  applicationName: SITE_NAME,
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  keywords: ["slagerij Menen", "traiteur Menen", "vers vlees", "charcuterie", "Yves en Veerle"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "nl_BE",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  twitter: { card: "summary_large_image", title: SITE_NAME, description: SITE_DESCRIPTION },
  formatDetection: { email: false, address: false, telephone: false },
};

export const viewport: Viewport = { themeColor: "#0f0f0f", colorScheme: "dark light" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl-BE" className={`${bodoni.variable} ${inter.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        <a href="#main-content" className="skip-link">Ga naar de hoofdinhoud</a>
        <CartProvider>
          <Header />
          <main id="main-content" className="flex-grow">{children}</main>
        </CartProvider>
        <Footer />
      </body>
    </html>
  );
}
