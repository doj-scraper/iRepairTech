-- =========================================
-- LEGAL TERMS ACCEPTANCE FIELDS
-- =========================================
-- Required for compliance audit trail per spec v2.1

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS accepted_terms BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS accepted_terms_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS terms_version TEXT;

-- Indexes for compliance queries
CREATE INDEX IF NOT EXISTS idx_orders_accepted_terms ON public.orders(accepted_terms);
CREATE INDEX IF NOT EXISTS idx_orders_terms_version ON public.orders(terms_version);
