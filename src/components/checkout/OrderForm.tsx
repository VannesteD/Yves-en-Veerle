"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ChangeEvent, type FormEvent, useRef, useState } from "react";

import { useCart } from "@/context/CartContext";

interface CheckoutResponse {
  error?: string;
  order?: {
    order_number: string;
    confirmation_email_sent: boolean;
  };
}

export default function OrderForm() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const idempotencyKey = useRef<string | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", notes: "", website: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.trim().length > 100) nextErrors.name = "Vul een geldige naam in";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()) || formData.email.length > 254) nextErrors.email = "Vul een geldig e-mailadres in";
    if (!/^[\d\s+\-()./]{9,32}$/.test(formData.phone.trim())) nextErrors.phone = "Vul een geldig telefoonnummer in";
    if (formData.notes.length > 1_000) nextErrors.notes = "Gebruik maximaal 1000 tekens";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: "" }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validateForm() || items.length === 0) return;
    setIsSubmitting(true);
    setSubmitError(null);
    idempotencyKey.current ??= crypto.randomUUID();

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey.current,
        },
        body: JSON.stringify({
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          notes: formData.notes || undefined,
          website: formData.website,
          order_items: items.map((item) => ({ product_id: item.product_id, quantity: item.quantity })),
        }),
      });
      const data = await response.json() as CheckoutResponse;
      if (!response.ok || !data.order) throw new Error(data.error || "De bestelling kon niet worden geplaatst.");
      clearCart();
      const emailStatus = data.order.confirmation_email_sent ? "sent" : "pending";
      router.push(`/success?order=${encodeURIComponent(data.order.order_number)}&email=${emailStatus}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Er is een fout opgetreden. Probeer het later opnieuw.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="border border-[#c9a227]/20 bg-[#1a1a1a] p-6 md:p-8">
        <h2 className="font-title mb-6 text-2xl tracking-wide text-[#faf8f5]">Uw Gegevens</h2>
        <div className="space-y-5">
          <Field label="Naam" name="name" error={errors.name}>
            <input id="name" name="name" type="text" autoComplete="name" required maxLength={100} value={formData.name} onChange={handleChange} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "name-error" : undefined} className={inputClass(errors.name)} />
          </Field>
          <Field label="E-mail" name="email" error={errors.email}>
            <input id="email" name="email" type="email" autoComplete="email" required maxLength={254} value={formData.email} onChange={handleChange} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} className={inputClass(errors.email)} />
          </Field>
          <Field label="Telefoonnummer" name="phone" error={errors.phone}>
            <input id="phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" required maxLength={32} value={formData.phone} onChange={handleChange} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "phone-error" : undefined} className={inputClass(errors.phone)} />
          </Field>
          <Field label="Opmerkingen (optioneel)" name="notes" error={errors.notes}>
            <textarea id="notes" name="notes" rows={4} maxLength={1_000} value={formData.notes} onChange={handleChange} aria-invalid={Boolean(errors.notes)} aria-describedby={errors.notes ? "notes-error" : "notes-help"} className={`${inputClass(errors.notes)} resize-y`} />
            <p id="notes-help" className="mt-1 text-xs text-[#faf8f5]/40">Maximaal 1000 tekens</p>
          </Field>
          <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input id="website" name="website" type="text" autoComplete="off" tabIndex={-1} value={formData.website} onChange={handleChange} />
          </div>
        </div>
      </div>

      {submitError && <div role="alert" className="border border-red-500/50 bg-red-900/30 p-4 text-center text-red-300">{submitError}</div>}
      <button type="submit" disabled={isSubmitting || items.length === 0} className="min-h-14 w-full bg-[#c9a227] px-6 py-4 text-lg font-medium text-[#0f0f0f] transition-colors hover:bg-[#d4b945] disabled:cursor-not-allowed disabled:bg-[#2a2a2a] disabled:text-[#faf8f5]/40">
        {isSubmitting ? "Bestelling veilig verwerken…" : "Bestelling Plaatsen"}
      </button>
      <p className="text-center text-sm text-[#faf8f5]/50">Uw gegevens worden alleen gebruikt om deze bestelling te verwerken. Lees ons <Link href="/privacy" className="underline hover:text-[#c9a227]">privacybeleid</Link>.</p>
    </form>
  );
}

function Field({ label, name, error, children }: { label: string; name: string; error?: string; children: React.ReactNode }) {
  return <div><label htmlFor={name} className="mb-2 block text-sm font-medium text-[#faf8f5]/70">{label}</label>{children}{error && <p id={`${name}-error`} className="mt-1 text-sm text-red-300">{error}</p>}</div>;
}

function inputClass(error?: string) {
  return `w-full border bg-[#0f0f0f] px-4 py-3 text-[#faf8f5] outline-none transition-colors focus:border-[#c9a227] focus:ring-2 focus:ring-[#c9a227]/30 ${error ? "border-red-500" : "border-[#c9a227]/20"}`;
}
