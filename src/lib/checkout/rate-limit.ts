import "server-only";

import { createHmac } from "node:crypto";
import { isIP } from "node:net";

import type { NextRequest } from "next/server";

import { ServerConfigurationError } from "@/lib/supabase/server";

function clientAddress(request: NextRequest): string {
  if (process.env.VERCEL !== "1") {
    if (process.env.NODE_ENV !== "production") {
      return "local-development";
    }

    throw new ServerConfigurationError("Checkout rate limiting heeft geen betrouwbare clientidentiteit.");
  }

  const trustedAddress = request.headers.get("x-vercel-forwarded-for")?.trim();
  if (!trustedAddress || isIP(trustedAddress) === 0) {
    throw new ServerConfigurationError("Checkout rate limiting heeft geen betrouwbare clientidentiteit.");
  }

  return trustedAddress;
}

export function createCheckoutRateLimitKey(request: NextRequest): string {
  const secret = process.env.CHECKOUT_RATE_LIMIT_SECRET?.trim();
  if (!secret || secret.length < 32) {
    throw new ServerConfigurationError("Checkout rate limiting is niet geconfigureerd.");
  }

  return createHmac("sha256", secret)
    .update(`checkout:${clientAddress(request)}`)
    .digest("hex");
}
