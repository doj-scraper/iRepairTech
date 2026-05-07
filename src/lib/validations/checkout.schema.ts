/**
 * Checkout validation schemas
 * Re-exports from checkout.dto.ts for use in API routes
 * The canonical schemas live in src/types/dtos/checkout.dto.ts
 */

export { checkoutRequestSchema, checkoutItemSchema } from '@/types/dtos/checkout.dto';
export type { CheckoutRequest, CheckoutItem } from '@/types/dtos/checkout.dto';
