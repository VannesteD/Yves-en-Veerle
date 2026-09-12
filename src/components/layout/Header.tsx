"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useCart } from "@/context/CartContext";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Webshop" },
];

export default function Header() {
  const { getItemCount } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const itemCount = getItemCount();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${isScrolled || isMobileMenuOpen ? "bg-[#0f0f0f]/95 shadow-lg backdrop-blur-md" : "bg-transparent"}`}>
      <div className="container mx-auto px-4">
        <nav className="flex h-20 items-center justify-between" aria-label="Hoofdnavigatie">
          <Link href="/" className="flex flex-col" aria-label="Yves en Veerle – startpagina">
            <span className="font-title text-xs uppercase tracking-[0.2em] text-[#c9a227]">Slagerij - Traiteur</span>
            <span className="font-title text-2xl font-bold tracking-wide text-[#faf8f5] md:text-3xl">Yves &amp; Veerle</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="font-medium text-[#faf8f5]/80 transition-colors hover:text-[#c9a227]">{link.label}</Link>
            ))}
            <Link href="/checkout" className="relative flex min-h-11 items-center gap-2 rounded-lg bg-[#c9a227] px-5 py-2.5 font-medium text-[#0f0f0f] transition-colors hover:bg-[#d4b945]" aria-label={`Winkelmandje, ${itemCount} ${itemCount === 1 ? "product" : "producten"}`}>
              <CartIcon />
              <span>Mandje</span>
              {itemCount > 0 && <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full border border-[#c9a227] bg-[#0f0f0f] px-1 text-sm font-bold text-[#c9a227]">{itemCount}</span>}
            </Link>
          </div>

          <div className="flex items-center gap-3 md:hidden">
            <Link href="/checkout" className="relative flex min-h-11 min-w-11 items-center justify-center text-[#faf8f5]" aria-label={`Winkelmandje, ${itemCount} ${itemCount === 1 ? "product" : "producten"}`}>
              <CartIcon />
              {itemCount > 0 && <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#c9a227] px-1 text-xs font-bold text-[#0f0f0f]">{itemCount}</span>}
            </Link>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              className="flex min-h-11 min-w-11 items-center justify-center text-[#faf8f5]"
              aria-label={isMobileMenuOpen ? "Menu sluiten" : "Menu openen"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </nav>

        <div
          id="mobile-navigation"
          aria-hidden={!isMobileMenuOpen}
          inert={!isMobileMenuOpen}
          className={`overflow-hidden transition-[max-height,opacity] duration-300 md:hidden ${isMobileMenuOpen ? "max-h-64 pb-5 opacity-100" : "pointer-events-none invisible max-h-0 opacity-0"}`}
        >
          <nav aria-label="Mobiele navigatie" className="flex flex-col border-t border-[#c9a227]/20 pt-3">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className="min-h-11 px-2 py-3 font-medium text-[#faf8f5]/80 hover:text-[#c9a227]">{link.label}</Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

function CartIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 2.3c-.6.6-.2 1.7.7 1.7H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}
