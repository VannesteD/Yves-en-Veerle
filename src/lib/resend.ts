import "server-only";

import { Resend } from "resend";

import { escapeHtml } from "@/lib/email/escape-html";
import { ServerConfigurationError } from "@/lib/supabase/server";
import type { OrderItem } from "@/lib/types";

interface OrderConfirmationData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  orderItems: OrderItem[];
  totalAmount: number;
}

function emailConfiguration() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();

  if (!apiKey || !from) {
    throw new ServerConfigurationError("E-mail is niet geconfigureerd.");
  }

  return { apiKey, from };
}

export async function sendOrderConfirmation(data: OrderConfirmationData) {
  const { apiKey, from } = emailConfiguration();
  const resend = new Resend(apiKey);
  const safeName = escapeHtml(data.customerName);
  const safeOrderNumber = escapeHtml(data.orderNumber);
  const rows = data.orderItems
    .map((item) => {
      const name = escapeHtml(item.name);
      const lineTotal = (item.price * item.quantity).toFixed(2);
      return `<tr><td style="padding:8px 0;border-bottom:1px solid #e7e5e4">${name} × ${item.quantity}</td><td style="padding:8px 0;border-bottom:1px solid #e7e5e4;text-align:right">€${lineTotal}</td></tr>`;
    })
    .join("");
  const textItems = data.orderItems
    .map((item) => `• ${item.name} × ${item.quantity} — €${(item.price * item.quantity).toFixed(2)}`)
    .join("\n");

  const html = `<!doctype html>
<html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:24px;background:#faf8f5;color:#1a1a1a;font-family:Arial,sans-serif">
  <main style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #eee">
    <header style="padding:28px;background:#0f0f0f;color:#c9a227;text-align:center"><h1 style="margin:0">Yves &amp; Veerle</h1></header>
    <section style="padding:32px">
      <h2>Bedankt voor uw bestelling, ${safeName}!</h2>
      <p>Wij hebben uw bestelling goed ontvangen. Uw bestelnummer is <strong>${safeOrderNumber}</strong>.</p>
      <table role="presentation" style="width:100%;border-collapse:collapse;margin:24px 0"><tbody>${rows}</tbody></table>
      <p style="font-size:18px;text-align:right"><strong>Totaal: €${data.totalAmount.toFixed(2)}</strong></p>
      <p>Wij nemen contact met u op om de afhaling of levering te bespreken.</p>
    </section>
  </main>
</body></html>`;
  const text = `Bedankt voor uw bestelling, ${data.customerName}!\n\nBestelnummer: ${data.orderNumber}\n\n${textItems}\n\nTotaal: €${data.totalAmount.toFixed(2)}\n\nWij nemen contact met u op om de afhaling of levering te bespreken.`;

  const { error } = await resend.emails.send({
    from,
    to: [data.customerEmail],
    subject: `Orderbevestiging – ${data.orderNumber}`,
    html,
    text,
  });

  if (error) {
    throw new Error(`Bevestigingsmail kon niet worden verzonden: ${error.message}`);
  }
}
