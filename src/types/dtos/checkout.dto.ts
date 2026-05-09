/**
 * Checkout Request/Response Types
 * Used for checkout API communication with Zod validation
 */

import { z } from 'zod'
import { CartItemType } from './cart.dto'

// =========================================
// CHECKOUT ITEM SCHEMAS
// =========================================

export const checkoutItemSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['part', 'service']),
  quantity: z.number().int().positive(),
})

export const checkoutRequestSchema = z.object({
  items: z.array(checkoutItemSchema).min(1, 'At least one item is required'),
  email: z.string().email('Valid email is required'),
  acceptedTerms: z.literal(true, {
    errorMap: () => ({ message: 'Purchasing terms must be accepted before checkout' }),
  }),
})

// =========================================
// CHECKOUT TYPES
// =========================================

export type CheckoutItem = z.infer<typeof checkoutItemSchema>

export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>

export type CheckoutResponse = {
  url: string
  orderId: string
}

export type CheckoutError = {
  error: string
  details?: Record<string, string[]>
}

// =========================================
// QUOTED ITEM (With fetched prices)
// =========================================

export type QuotedItemBase = {
  id: string
  type: CartItemType
  quantity: number
  name: string
  price_cents: number
}

export type QuotedItemPart = QuotedItemBase & {
  type: 'part'
  stock_count?: number
}

export type QuotedItemService = QuotedItemBase & {
  type: 'service'
}

export type QuotedItem = QuotedItemPart | QuotedItemService
