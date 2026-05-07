/**
 * Cart Item Types
 * Used for cart state management and API communication
 */

export type CartItemType = 'part' | 'service'

export type CartItemBase = {
  id: string
  type: CartItemType
  quantity: number
}

export type CartItemPart = CartItemBase & {
  type: 'part'
}

export type CartItemService = CartItemBase & {
  type: 'service'
}

export type CartItem = CartItemPart | CartItemService

// API request/response types

export type AddToCartRequest = {
  id: string
  type: CartItemType
  quantity: number
}

export type UpdateCartRequest = {
  id: string
  quantity: number
}

export type CartResponse = {
  items: CartItem[]
  total: number
}
