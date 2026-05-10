-- =========================================
-- ADD NEW ENUM VALUES
-- =========================================
-- Must be in separate transaction from usage

ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'awaiting_device';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'device_received';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'in_repair';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'qa';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'shipped';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'completed';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'failed';
