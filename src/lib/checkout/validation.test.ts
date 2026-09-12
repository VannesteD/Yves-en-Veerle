import { describe, expect, it } from "vitest";

import type { Product } from "../types";
import {
  buildCanonicalOrder,
  CheckoutValidationError,
  isValidIdempotencyKey,
  parseCheckoutInput,
} from "./validation";

const product: Product = {
  id: "database-product-id",
  name: "Entrecote",
  description: "Malse entrecote",
  price: 28.5,
  category: "Rund",
  subcategory: null,
  image_url: null,
  unit: "per kg",
  in_stock: true,
  featured: true,
  created_at: "2026-08-26T00:00:00.000Z",
  updated_at: "2026-08-26T00:00:00.000Z",
};

const validBody = {
  customer_name: "  Jan   Janssen  ",
  customer_email: "JAN@EXAMPLE.BE",
  customer_phone: "+32 478 55 07 31",
  notes: "Zonder kruiden",
  website: "",
  order_items: [{ product_id: product.id, quantity: 2 }],
};

describe("parseCheckoutInput", () => {
  it("normaliseert geldige klantgegevens", () => {
    const result = parseCheckoutInput(validBody);
    expect(result.customer_name).toBe("Jan Janssen");
    expect(result.customer_email).toBe("jan@example.be");
  });

  it("weigert door de browser meegestuurde prijzen en namen", () => {
    expect(() => parseCheckoutInput({
      ...validBody,
      order_items: [{ product_id: product.id, quantity: 1, price: 0, name: "Gratis product" }],
    })).toThrow(CheckoutValidationError);
  });

  it("weigert negatieve en buitensporige aantallen", () => {
    expect(() => parseCheckoutInput({ ...validBody, order_items: [{ product_id: product.id, quantity: -1 }] })).toThrow();
    expect(() => parseCheckoutInput({ ...validBody, order_items: [{ product_id: product.id, quantity: 21 }] })).toThrow();
  });

  it("weigert dubbele productregels", () => {
    expect(() => parseCheckoutInput({ ...validBody, order_items: [
      { product_id: product.id, quantity: 1 },
      { product_id: product.id, quantity: 1 },
    ] })).toThrow("meerdere keren");
  });
});

describe("buildCanonicalOrder", () => {
  it("berekent het bedrag uitsluitend met de databaseprijs", () => {
    const result = buildCanonicalOrder([{ product_id: product.id, quantity: 2 }], [product]);
    expect(result.subtotal).toBe(57);
    expect(result.orderItems[0]).toMatchObject({ name: "Entrecote", price: 28.5, quantity: 2 });
  });

  it("weigert onbekende of uitverkochte producten", () => {
    expect(() => buildCanonicalOrder([{ product_id: "unknown", quantity: 1 }], [product])).toThrow("niet langer beschikbaar");
    expect(() => buildCanonicalOrder([{ product_id: product.id, quantity: 1 }], [{ ...product, in_stock: false }])).toThrow("niet langer beschikbaar");
  });
});

describe("isValidIdempotencyKey", () => {
  it("aanvaardt alleen UUID v4-sleutels", () => {
    expect(isValidIdempotencyKey("3b12f1df-5232-4e3f-8a24-5f2d3e4c5b6a")).toBe(true);
    expect(isValidIdempotencyKey("same-order-again")).toBe(false);
  });
});
