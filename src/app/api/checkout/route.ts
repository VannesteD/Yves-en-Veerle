import { NextRequest, NextResponse } from "next/server";

import { createCheckoutRateLimitKey } from "@/lib/checkout/rate-limit";
import { isAllowedCheckoutOrigin } from "@/lib/checkout/origin";
import { readBoundedTextBody, RequestBodyTooLargeError } from "@/lib/checkout/request-body";
import {
  buildCanonicalOrder,
  CheckoutValidationError,
  isValidIdempotencyKey,
  MAX_CHECKOUT_BODY_BYTES,
  parseCheckoutInput,
} from "@/lib/checkout/validation";
import { sendOrderConfirmation } from "@/lib/resend";
import {
  consumeCheckoutRateLimit,
  createOrder,
  fetchProductsByIds,
  ServerConfigurationError,
} from "@/lib/supabase/server";

export const runtime = "nodejs";

const JSON_HEADERS = { "Cache-Control": "no-store" };

function json(body: object, status: number) {
  return NextResponse.json(body, { status, headers: JSON_HEADERS });
}

export async function POST(request: NextRequest) {
  try {
    if (!isAllowedCheckoutOrigin(
      request.headers.get("origin"),
      process.env.NEXT_PUBLIC_SITE_URL,
      request.nextUrl.origin,
    )) {
      return json({ error: "Ongeldige herkomst van het verzoek." }, 403);
    }

    if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
      return json({ error: "Ongeldig inhoudstype." }, 415);
    }

    const idempotencyKey = request.headers.get("idempotency-key");
    if (!isValidIdempotencyKey(idempotencyKey)) {
      return json({ error: "Ongeldige aanvraagcode." }, 400);
    }

    const rateLimitKey = createCheckoutRateLimitKey(request);
    if (!(await consumeCheckoutRateLimit(rateLimitKey))) {
      return json({ error: "Te veel bestelpogingen. Probeer het over 15 minuten opnieuw." }, 429);
    }

    let rawBody: string;
    try {
      rawBody = await readBoundedTextBody(request, MAX_CHECKOUT_BODY_BYTES);
    } catch (error) {
      if (error instanceof RequestBodyTooLargeError) {
        return json({ error: "Het verzoek is te groot." }, 413);
      }
      throw error;
    }

    let parsedBody: unknown;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      throw new CheckoutValidationError("Ongeldige aanvraag.");
    }

    const input = parseCheckoutInput(parsedBody);
    if (input.website) {
      return json({ error: "Bestelling kon niet worden verwerkt." }, 400);
    }

    const databaseProducts = await fetchProductsByIds(input.order_items.map((item) => item.product_id));
    const { orderItems, subtotal } = buildCanonicalOrder(input.order_items, databaseProducts);
    const { order, created } = await createOrder({
      idempotencyKey,
      customerName: input.customer_name,
      customerEmail: input.customer_email,
      customerPhone: input.customer_phone,
      orderItems,
      subtotal,
      totalAmount: subtotal,
      notes: input.notes,
    });

    let confirmationEmailSent = !created;
    if (created) {
      try {
        await sendOrderConfirmation({
          orderNumber: order.order_number,
          customerName: input.customer_name,
          customerEmail: input.customer_email,
          orderItems,
          totalAmount: subtotal,
        });
        confirmationEmailSent = true;
      } catch (error) {
        console.error("Order confirmation email failed", error);
      }
    }

    return json(
      {
        success: true,
        order: {
          order_number: order.order_number,
          total_amount: order.total_amount,
          confirmation_email_sent: confirmationEmailSent,
        },
      },
      created ? 201 : 200,
    );
  } catch (error) {
    if (error instanceof CheckoutValidationError) {
      return json({ error: error.message }, 400);
    }

    if (error instanceof ServerConfigurationError) {
      console.error("Checkout configuration error", error.message);
      return json({ error: "Bestellen is tijdelijk niet beschikbaar." }, 503);
    }

    console.error("Checkout failed", error);
    return json({ error: "Er is een fout opgetreden. Probeer het later opnieuw." }, 500);
  }
}
