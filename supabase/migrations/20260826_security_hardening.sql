BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory TEXT;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;
UPDATE products SET category = CASE category
    WHEN 'Rundvlees' THEN 'Rund'
    WHEN 'Varkensvlees' THEN 'Varken'
    WHEN 'Specialiteiten' THEN 'Bereide gerechten'
    ELSE category
END;
ALTER TABLE products ADD CONSTRAINT products_category_check CHECK (category IN (
    'Rund', 'Varken', 'Kip', 'Lam', 'Gevogelte', 'Paard', 'Gehakt', 'Worsten',
    'Burgers', 'Charcuterie', 'Bereide gerechten', 'Kaas', 'Conserven', 'Overige'
));
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_subcategory_check;
ALTER TABLE products ADD CONSTRAINT products_subcategory_check CHECK (subcategory IS NULL OR subcategory IN (
    'Paté', 'Salades', 'Saucisson en dergelijke', 'Salami', 'Hesp'
));

ALTER TABLE orders ADD COLUMN IF NOT EXISTS idempotency_key UUID;
UPDATE orders SET idempotency_key = gen_random_uuid() WHERE idempotency_key IS NULL;
ALTER TABLE orders ALTER COLUMN idempotency_key SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS orders_idempotency_key_key ON orders(idempotency_key);
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_customer_name_length_check;
ALTER TABLE orders ADD CONSTRAINT orders_customer_name_length_check CHECK (char_length(customer_name) BETWEEN 1 AND 100) NOT VALID;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_customer_email_length_check;
ALTER TABLE orders ADD CONSTRAINT orders_customer_email_length_check CHECK (char_length(customer_email) BETWEEN 3 AND 254) NOT VALID;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_customer_phone_length_check;
ALTER TABLE orders ADD CONSTRAINT orders_customer_phone_length_check CHECK (char_length(customer_phone) BETWEEN 9 AND 32) NOT VALID;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_items_shape_check;
ALTER TABLE orders ADD CONSTRAINT orders_items_shape_check CHECK (jsonb_typeof(order_items) = 'array' AND jsonb_array_length(order_items) BETWEEN 1 AND 40) NOT VALID;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_positive_totals_check;
ALTER TABLE orders ADD CONSTRAINT orders_positive_totals_check CHECK (subtotal > 0 AND total_amount > 0) NOT VALID;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_notes_length_check;
ALTER TABLE orders ADD CONSTRAINT orders_notes_length_check CHECK (notes IS NULL OR char_length(notes) <= 1000) NOT VALID;

DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'orders'
    LOOP
        EXECUTE FORMAT('DROP POLICY IF EXISTS %I ON public.orders', policy_record.policyname);
    END LOOP;
END;
$$;
REVOKE ALL ON TABLE orders FROM anon, authenticated;
GRANT ALL ON TABLE orders TO service_role;

REVOKE ALL ON TABLE products FROM anon, authenticated;
GRANT SELECT ON TABLE products TO anon, authenticated;

CREATE TABLE IF NOT EXISTS checkout_rate_limits (
    key_hash TEXT PRIMARY KEY CHECK (char_length(key_hash) = 64),
    window_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    request_count INTEGER NOT NULL DEFAULT 1 CHECK (request_count > 0),
    expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_checkout_rate_limits_expires_at ON checkout_rate_limits(expires_at);
ALTER TABLE checkout_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE checkout_rate_limits FROM anon, authenticated;
GRANT ALL ON TABLE checkout_rate_limits TO service_role;

CREATE OR REPLACE FUNCTION consume_checkout_rate_limit(
    p_key TEXT,
    p_limit INTEGER DEFAULT 5,
    p_window_seconds INTEGER DEFAULT 900
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_count INTEGER;
BEGIN
    IF char_length(p_key) <> 64 OR p_limit < 1 OR p_window_seconds < 60 THEN
        RETURN FALSE;
    END IF;

    DELETE FROM checkout_rate_limits WHERE expires_at < NOW() - INTERVAL '1 day';
    INSERT INTO checkout_rate_limits (key_hash, window_started_at, request_count, expires_at)
    VALUES (p_key, NOW(), 1, NOW() + make_interval(secs => p_window_seconds))
    ON CONFLICT (key_hash) DO UPDATE SET
        window_started_at = CASE WHEN checkout_rate_limits.window_started_at <= NOW() - make_interval(secs => p_window_seconds) THEN NOW() ELSE checkout_rate_limits.window_started_at END,
        request_count = CASE WHEN checkout_rate_limits.window_started_at <= NOW() - make_interval(secs => p_window_seconds) THEN 1 ELSE checkout_rate_limits.request_count + 1 END,
        expires_at = CASE WHEN checkout_rate_limits.window_started_at <= NOW() - make_interval(secs => p_window_seconds) THEN NOW() + make_interval(secs => p_window_seconds) ELSE checkout_rate_limits.expires_at END
    RETURNING request_count INTO current_count;
    RETURN current_count <= p_limit;
END;
$$;

REVOKE ALL ON FUNCTION consume_checkout_rate_limit(TEXT, INTEGER, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION consume_checkout_rate_limit(TEXT, INTEGER, INTEGER) TO service_role;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        NEW.order_number := 'YV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(REPLACE(gen_random_uuid()::TEXT, '-', ''), 1, 12));
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_order_number ON orders;
CREATE TRIGGER set_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_order_number();

COMMIT;
