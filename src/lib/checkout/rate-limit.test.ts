import { afterEach, describe, expect, it, vi } from "vitest";

import type { NextRequest } from "next/server";

import { createCheckoutRateLimitKey } from "./rate-limit";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({
  ServerConfigurationError: class ServerConfigurationError extends Error {},
}));

const SECRET = "test-rate-limit-secret-with-32-characters";

function request(headers: Record<string, string>) {
  return new Request("https://example.test/api/checkout", { headers }) as NextRequest;
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("createCheckoutRateLimitKey", () => {
  it("gebruikt op Vercel uitsluitend de door Vercel beheerde client-IP-header", () => {
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("CHECKOUT_RATE_LIMIT_SECRET", SECRET);

    const first = createCheckoutRateLimitKey(request({
      "x-vercel-forwarded-for": "203.0.113.10",
      "cf-connecting-ip": "198.51.100.1",
      "x-real-ip": "198.51.100.2",
      "x-forwarded-for": "198.51.100.3",
    }));
    const spoofed = createCheckoutRateLimitKey(request({
      "x-vercel-forwarded-for": "203.0.113.10",
      "cf-connecting-ip": "192.0.2.1",
      "x-real-ip": "192.0.2.2",
      "x-forwarded-for": "192.0.2.3",
    }));

    expect(spoofed).toBe(first);
  });

  it("weigert productie zonder een geldige, vertrouwde Vercel-identiteit", () => {
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("CHECKOUT_RATE_LIMIT_SECRET", SECRET);

    expect(() => createCheckoutRateLimitKey(request({
      "cf-connecting-ip": "198.51.100.1",
      "x-real-ip": "198.51.100.2",
      "x-forwarded-for": "198.51.100.3",
    }))).toThrow("betrouwbare clientidentiteit");
    expect(() => createCheckoutRateLimitKey(request({
      "x-vercel-forwarded-for": "geen-ip-adres",
    }))).toThrow("betrouwbare clientidentiteit");
  });

  it("gebruikt lokaal een vaste identiteit die requestheaders niet kunnen wijzigen", () => {
    vi.stubEnv("VERCEL", "");
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("CHECKOUT_RATE_LIMIT_SECRET", SECRET);

    const first = createCheckoutRateLimitKey(request({ "x-forwarded-for": "198.51.100.1" }));
    const second = createCheckoutRateLimitKey(request({ "x-forwarded-for": "192.0.2.1" }));

    expect(second).toBe(first);
  });

  it("faalt gesloten bij een niet-ondersteunde productie-ingress", () => {
    vi.stubEnv("VERCEL", "");
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("CHECKOUT_RATE_LIMIT_SECRET", SECRET);

    expect(() => createCheckoutRateLimitKey(request({
      "cf-connecting-ip": "198.51.100.1",
      "x-forwarded-for": "198.51.100.2",
    }))).toThrow("betrouwbare clientidentiteit");
  });
});
