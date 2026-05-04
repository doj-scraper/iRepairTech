-- =========================================
-- LEGAL AUDIT TRAIL
-- =========================================
-- Per spec v2.1: "CHECKOUT FLOW — MISSING SYSTEM BINDING"
-- These fields are required for compliance audit trail

-- Orders table legal tracking
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS accepted_terms boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS accepted_terms_at timestamptz,
ADD COLUMN IF NOT EXISTS terms_version text;

-- =========================================
-- PRODUCT DATA ENHANCEMENTS
-- =========================================
-- Per spec v2.1: "CRITICAL MISSING CONTENT"

-- Parts: device and component classification
ALTER TABLE public.inventory_parts 
ADD COLUMN IF NOT EXISTS device_model text,
ADD COLUMN IF NOT EXISTS component_type text,
ADD COLUMN IF NOT EXISTS quality_tier text,
ADD COLUMN IF NOT EXISTS compatibility text;

-- Parts: B2B technical specs
ALTER TABLE public.inventory_parts 
ADD COLUMN IF NOT EXISTS brightness integer,
ADD COLUMN IF NOT EXISTS color_gamut text,
ADD COLUMN IF NOT EXISTS failure_rate_estimate numeric(5,2);

-- Services: classification fields
ALTER TABLE public.repair_services 
ADD COLUMN IF NOT EXISTS service_type text,
ADD COLUMN IF NOT EXISTS turnaround_class text;

-- =========================================
-- INDEXES FOR NEW FIELDS
-- =========================================

CREATE INDEX IF NOT EXISTS idx_inventory_parts_device_model 
ON public.inventory_parts(device_model);

CREATE INDEX IF NOT EXISTS idx_inventory_parts_component_type 
ON public.inventory_parts(component_type);

CREATE INDEX IF NOT EXISTS idx_repair_services_service_type 
ON public.repair_services(service_type);
