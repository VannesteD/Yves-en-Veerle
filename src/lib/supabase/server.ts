import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Order, OrderItem, Product } from "@/lib/types";

export class ServerConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ServerConfigurationError";
  }
}

function readSupabaseConfiguration() {
  const url = process.env.SUPABASE_URL?.trim();
  const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();

  if (!url || !secretKey) {
    return null;
  }

  return { url, secretKey };
}

export function isSupabaseConfigured() {
  return readSupabaseConfiguration() !== null;
}

export function createSupabaseAdminClient(): SupabaseClient {
  const configuration = readSupabaseConfiguration();

  if (!configuration) {
    throw new ServerConfigurationError("Supabase is niet geconfigureerd.");
  }

  return createClient(configuration.url, configuration.secretKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}

export async function fetchProductsFromDatabase(): Promise<Product[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("id,name,description,price,category,subcategory,image_url,unit,in_stock,featured,created_at,updated_at")
    .eq("in_stock", true)
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Producten konden niet worden geladen: ${error.message}`);
  }

  return (data ?? []) as Product[];
}

export async function fetchProductsByIds(productIds: string[]): Promise<Product[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("id,name,description,price,category,subcategory,image_url,unit,in_stock,featured,created_at,updated_at")
    .in("id", productIds)
    .eq("in_stock", true);

  if (error) {
    throw new Error(`Producten konden niet worden gecontroleerd: ${error.message}`);
  }

  return (data ?? []) as Product[];
}

interface CreateOrderInput {
  idempotencyKey: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderItems: OrderItem[];
  subtotal: number;
  totalAmount: number;
  notes: string | null;
}

export async function createOrder(input: CreateOrderInput): Promise<{ order: Order; created: boolean }> {
  const supabase = createSupabaseAdminClient();
  const insertData = {
    idempotency_key: input.idempotencyKey,
    customer_name: input.customerName,
    customer_email: input.customerEmail,
    customer_phone: input.customerPhone,
    order_items: input.orderItems,
    subtotal: input.subtotal,
    total_amount: input.totalAmount,
    notes: input.notes,
  };

  const { data, error } = await supabase
    .from("orders")
    .insert(insertData)
    .select()
    .single();

  if (!error && data) {
    return { order: data as Order, created: true };
  }

  if (error?.code === "23505") {
    const existing = await supabase
      .from("orders")
      .select()
      .eq("idempotency_key", input.idempotencyKey)
      .single();

    if (!existing.error && existing.data) {
      return { order: existing.data as Order, created: false };
    }
  }

  throw new Error(`Bestelling kon niet worden opgeslagen: ${error?.message ?? "onbekende fout"}`);
}

export async function consumeCheckoutRateLimit(key: string): Promise<boolean> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.rpc("consume_checkout_rate_limit", {
    p_key: key,
    p_limit: 5,
    p_window_seconds: 900,
  });

  if (error || typeof data !== "boolean") {
    throw new Error(`Rate limiting is niet beschikbaar: ${error?.message ?? "ongeldig antwoord"}`);
  }

  return data;
}
