BEGIN;

-- gen_random_bytes() can live in Supabase's extensions schema and is therefore
-- unavailable to this security-definer-style trigger with a restricted search_path.
-- PostgreSQL's gen_random_uuid() remains available through pg_catalog.
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

COMMIT;
