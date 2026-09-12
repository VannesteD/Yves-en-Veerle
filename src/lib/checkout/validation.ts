import type { OrderItem, Product } from "@/lib/types";

export const MAX_CHECKOUT_BODY_BYTES = 32_000;
const MAX_ORDER_ITEMS = 40;
const MAX_QUANTITY_PER_ITEM = 20;

export class CheckoutValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CheckoutValidationError";
  }
}

export interface CheckoutInputItem {
  product_id: string;
  quantity: number;
}

export interface CheckoutInput {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  notes: string | null;
  order_items: CheckoutInputItem[];
  website: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(value: unknown, fieldLabel: string, maximumLength: number): string {
  if (typeof value !== "string") {
    throw new CheckoutValidationError(`${fieldLabel} is verplicht.`);
  }

  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized || normalized.length > maximumLength) {
    throw new CheckoutValidationError(`${fieldLabel} is ongeldig.`);
  }

  return normalized;
}

function optionalString(value: unknown, maximumLength: number): string | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    throw new CheckoutValidationError("Opmerkingen zijn ongeldig.");
  }

  const normalized = value.trim();
  if (normalized.length > maximumLength) {
    throw new CheckoutValidationError(`Opmerkingen mogen maximaal ${maximumLength} tekens bevatten.`);
  }

  return normalized || null;
}

export function parseCheckoutInput(value: unknown): CheckoutInput {
  if (!isRecord(value)) {
    throw new CheckoutValidationError("Ongeldig verzoek.");
  }

  const customerName = requiredString(value.customer_name, "Naam", 100);
  const customerEmail = requiredString(value.customer_email, "E-mailadres", 254).toLowerCase();
  const customerPhone = requiredString(value.customer_phone, "Telefoonnummer", 32);
  const notes = optionalString(value.notes, 1_000);
  const website = typeof value.website === "string" ? value.website.trim() : "";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    throw new CheckoutValidationError("Ongeldig e-mailadres.");
  }

  if (!/^[\d\s+\-()./]{9,32}$/.test(customerPhone)) {
    throw new CheckoutValidationError("Ongeldig telefoonnummer.");
  }

  if (!Array.isArray(value.order_items) || value.order_items.length === 0) {
    throw new CheckoutValidationError("Uw winkelmandje is leeg.");
  }

  if (value.order_items.length > MAX_ORDER_ITEMS) {
    throw new CheckoutValidationError("Uw winkelmandje bevat te veel producten.");
  }

  const seenProductIds = new Set<string>();
  const orderItems = value.order_items.map((item): CheckoutInputItem => {
    if (!isRecord(item)) {
      throw new CheckoutValidationError("Een productregel is ongeldig.");
    }

    const allowedKeys = new Set(["product_id", "quantity"]);
    if (Object.keys(item).some((key) => !allowedKeys.has(key))) {
      throw new CheckoutValidationError("Een productregel bevat niet-toegestane gegevens.");
    }

    const productId = requiredString(item.product_id, "Product", 100);
    const quantity = item.quantity;

    if (!Number.isInteger(quantity) || Number(quantity) < 1 || Number(quantity) > MAX_QUANTITY_PER_ITEM) {
      throw new CheckoutValidationError(`Een aantal moet tussen 1 en ${MAX_QUANTITY_PER_ITEM} liggen.`);
    }

    if (seenProductIds.has(productId)) {
      throw new CheckoutValidationError("Een product komt meerdere keren voor.");
    }

    seenProductIds.add(productId);
    return { product_id: productId, quantity: Number(quantity) };
  });

  return {
    customer_name: customerName,
    customer_email: customerEmail,
    customer_phone: customerPhone,
    notes,
    order_items: orderItems,
    website,
  };
}

export function buildCanonicalOrder(
  requestedItems: CheckoutInputItem[],
  products: Product[],
): { orderItems: OrderItem[]; subtotal: number } {
  const productsById = new Map(products.map((product) => [product.id, product]));
  let subtotalInCents = 0;

  const orderItems = requestedItems.map((requestedItem): OrderItem => {
    const product = productsById.get(requestedItem.product_id);
    if (!product || !product.in_stock) {
      throw new CheckoutValidationError("Een product is niet langer beschikbaar. Vernieuw uw winkelmandje.");
    }

    const unitPriceInCents = Math.round(Number(product.price) * 100);
    if (!Number.isSafeInteger(unitPriceInCents) || unitPriceInCents < 0) {
      throw new Error(`Ongeldige databaseprijs voor product ${product.id}.`);
    }

    subtotalInCents += unitPriceInCents * requestedItem.quantity;
    return {
      product_id: product.id,
      name: product.name,
      quantity: requestedItem.quantity,
      price: unitPriceInCents / 100,
      unit: product.unit,
    };
  });

  if (!Number.isSafeInteger(subtotalInCents) || subtotalInCents <= 0) {
    throw new CheckoutValidationError("Het totaalbedrag is ongeldig.");
  }

  return { orderItems, subtotal: subtotalInCents / 100 };
}

export function isValidIdempotencyKey(value: string | null): value is string {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
}
