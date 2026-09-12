-- Fresh Supabase schema for Slagerij - Traiteur Yves & Veerle.
-- Run migrations instead when upgrading an existing project.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
    description TEXT CHECK (description IS NULL OR char_length(description) <= 1000),
    price NUMERIC(10, 2) NOT NULL CHECK (price > 0),
    category TEXT NOT NULL CHECK (category IN (
        'Rund', 'Varken', 'Kip', 'Lam', 'Gevogelte', 'Paard', 'Gehakt', 'Worsten',
        'Burgers', 'Charcuterie', 'Bereide gerechten', 'Kaas', 'Conserven', 'Overige'
    )),
    subcategory TEXT CHECK (subcategory IS NULL OR subcategory IN (
        'Paté', 'Salades', 'Saucisson en dergelijke', 'Salami', 'Hesp'
    )),
    image_url TEXT,
    unit TEXT NOT NULL DEFAULT 'per kg' CHECK (char_length(unit) BETWEEN 1 AND 40),
    in_stock BOOLEAN NOT NULL DEFAULT true,
    featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_featured ON products(featured) WHERE featured = true AND in_stock = true;

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,
    idempotency_key UUID NOT NULL UNIQUE,
    customer_name TEXT NOT NULL CHECK (char_length(customer_name) BETWEEN 1 AND 100),
    customer_email TEXT NOT NULL CHECK (char_length(customer_email) BETWEEN 3 AND 254),
    customer_phone TEXT NOT NULL CHECK (char_length(customer_phone) BETWEEN 9 AND 32),
    order_items JSONB NOT NULL CHECK (jsonb_typeof(order_items) = 'array' AND jsonb_array_length(order_items) BETWEEN 1 AND 40),
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal > 0),
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount > 0),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'ready', 'completed', 'cancelled')),
    notes TEXT CHECK (notes IS NULL OR char_length(notes) <= 1000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);

CREATE TABLE checkout_rate_limits (
    key_hash TEXT PRIMARY KEY CHECK (char_length(key_hash) = 64),
    window_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    request_count INTEGER NOT NULL DEFAULT 1 CHECK (request_count > 0),
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_checkout_rate_limits_expires_at ON checkout_rate_limits(expires_at);

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

CREATE TRIGGER set_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_order_number();

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
        window_started_at = CASE
            WHEN checkout_rate_limits.window_started_at <= NOW() - make_interval(secs => p_window_seconds) THEN NOW()
            ELSE checkout_rate_limits.window_started_at
        END,
        request_count = CASE
            WHEN checkout_rate_limits.window_started_at <= NOW() - make_interval(secs => p_window_seconds) THEN 1
            ELSE checkout_rate_limits.request_count + 1
        END,
        expires_at = CASE
            WHEN checkout_rate_limits.window_started_at <= NOW() - make_interval(secs => p_window_seconds) THEN NOW() + make_interval(secs => p_window_seconds)
            ELSE checkout_rate_limits.expires_at
        END
    RETURNING request_count INTO current_count;

    RETURN current_count <= p_limit;
END;
$$;

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkout_rate_limits ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE products FROM anon, authenticated;
REVOKE ALL ON TABLE orders FROM anon, authenticated;
REVOKE ALL ON TABLE checkout_rate_limits FROM anon, authenticated;
GRANT SELECT ON TABLE products TO anon, authenticated;
GRANT ALL ON TABLE products, orders, checkout_rate_limits TO service_role;

CREATE POLICY "Public products are readable"
    ON products FOR SELECT
    TO anon, authenticated
    USING (true);

REVOKE ALL ON FUNCTION consume_checkout_rate_limit(TEXT, INTEGER, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION consume_checkout_rate_limit(TEXT, INTEGER, INTEGER) TO service_role;

INSERT INTO products (name, description, price, category, subcategory, unit, in_stock, featured) VALUES
    ('Entrecote', 'Malse entrecote van Belgische runderen, perfect voor de grill', 28.50, 'Rund', NULL, 'per kg', true, true),
    ('Filet Pur', 'De meest verfijnde snit, ongeëvenaard mals', 42.00, 'Rund', NULL, 'per kg', true, true),
    ('Stoofvlees', 'Ideaal voor een traditionele Vlaamse stoofpot', 16.50, 'Rund', NULL, 'per kg', true, false),
    ('Rosbief', 'Perfect voor in de oven, klassiek en smaakvol', 24.90, 'Rund', NULL, 'per kg', true, false),
    ('Kotelet', 'Sappige varkenskotelet aan het been', 14.50, 'Varken', NULL, 'per kg', true, true),
    ('Varkensgebraad', 'Klassiek varkensgebraad met zwoerd', 12.90, 'Varken', NULL, 'per kg', true, false),
    ('Speklappen', 'Perfect voor op de barbecue', 11.90, 'Varken', NULL, 'per kg', true, false),
    ('Kipfilet', 'Verse kipfilet van scharrelkippen', 14.90, 'Kip', NULL, 'per kg', true, false),
    ('Hele Kip', 'Hele scharrelkip, ideaal voor de oven', 8.50, 'Kip', NULL, 'per stuk', true, true),
    ('Kippenbillen', 'Malse kippenbillen met vel', 7.90, 'Kip', NULL, 'per kg', true, false),
    ('Lamskotelet', 'Sappige lamskoteletten, perfect voor de grill', 32.00, 'Lam', NULL, 'per kg', true, true),
    ('Lamsbout', 'Hele lamsbout voor een feestelijk gerecht', 28.00, 'Lam', NULL, 'per kg', true, false),
    ('Kalkoenfilet', 'Magere kalkoenfilet, veelzijdig in gebruik', 16.90, 'Gevogelte', NULL, 'per kg', true, false),
    ('Eendenborst', 'Malse eendenborst met vel', 26.00, 'Gevogelte', NULL, 'per kg', true, true),
    ('Paardenfilet', 'Mager en mals paardenfilet', 22.00, 'Paard', NULL, 'per kg', true, false),
    ('Paardensteak', 'Sappige paardensteak voor de grill', 19.50, 'Paard', NULL, 'per kg', true, false),
    ('Rundergehakt', 'Puur rundergehakt, perfect voor burgers', 14.90, 'Gehakt', NULL, 'per kg', true, false),
    ('Gemengd Gehakt', 'Half om half rund en varken', 12.90, 'Gehakt', NULL, 'per kg', true, true),
    ('Kippengehakt', 'Mager kippengehakt', 11.90, 'Gehakt', NULL, 'per kg', true, false),
    ('Boerenworst', 'Huisgemaakte boerenworst volgens oud recept', 12.50, 'Worsten', NULL, 'per kg', true, true),
    ('Chipolata', 'Fijne chipolataworstjes', 14.00, 'Worsten', NULL, 'per kg', true, false),
    ('Merguez', 'Pittige merguezworstjes', 15.00, 'Worsten', NULL, 'per kg', true, false),
    ('Classic Burger', 'Huisgemaakte runderburger', 16.00, 'Burgers', NULL, 'per kg', true, true),
    ('Kaashamburger', 'Burger met kaas door het gehakt', 17.50, 'Burgers', NULL, 'per kg', true, false),
    ('Paté Maison', 'Huisgemaakte paté met kruiden', 22.00, 'Charcuterie', 'Paté', 'per kg', true, true),
    ('Ardennenpaté', 'Pittige paté in Ardense stijl', 24.00, 'Charcuterie', 'Paté', 'per kg', true, false),
    ('Vleessalade', 'Klassieke vleessalade', 16.00, 'Charcuterie', 'Salades', 'per kg', true, false),
    ('Kipsalade', 'Romige kipsalade', 18.00, 'Charcuterie', 'Salades', 'per kg', true, true),
    ('Tonijnsalade', 'Verse tonijnsalade', 19.00, 'Charcuterie', 'Salades', 'per kg', true, false),
    ('Droge Worst', 'Ambachtelijke droge worst, 3 maanden gerijpt', 32.00, 'Charcuterie', 'Saucisson en dergelijke', 'per kg', true, true),
    ('Lookworst', 'Droge worst met look', 28.00, 'Charcuterie', 'Saucisson en dergelijke', 'per kg', true, false),
    ('Italiaanse Salami', 'Fijngesneden Italiaanse salami', 35.00, 'Charcuterie', 'Salami', 'per kg', true, false),
    ('Pepersalami', 'Pikante pepersalami', 34.00, 'Charcuterie', 'Salami', 'per kg', true, false),
    ('Achterham', 'Klassieke achterham', 18.50, 'Charcuterie', 'Hesp', 'per kg', true, true),
    ('Hespenrollade', 'Gerookte hespenrollade', 19.50, 'Charcuterie', 'Hesp', 'per kg', true, false),
    ('Balletjes in Tomatensaus', 'Huisbereide gehaktballetjes', 16.50, 'Bereide gerechten', NULL, 'per kg', true, true),
    ('Gehaktbrood', 'Gevuld gehaktbrood met groenten', 14.90, 'Bereide gerechten', NULL, 'per stuk', true, false),
    ('Vol-au-vent', 'Klassieke Belgische vol-au-vent', 18.00, 'Bereide gerechten', NULL, 'per kg', true, true),
    ('Oude Kaas', 'Belegen oude kaas', 16.00, 'Kaas', NULL, 'per kg', true, false),
    ('Jonge Kaas', 'Romige jonge kaas', 12.00, 'Kaas', NULL, 'per kg', true, false),
    ('Cornichons', 'Knapperige ingelegde augurken', 6.50, 'Conserven', NULL, 'per pot', true, false),
    ('Zilveruitjes', 'Ingelegde zilveruitjes', 5.50, 'Conserven', NULL, 'per pot', true, false),
    ('Bouillon', 'Huisgemaakte runderbouillon', 8.00, 'Overige', NULL, 'per liter', true, false);
