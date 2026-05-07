/**
 * Database types generated from Supabase schema
 * These types represent the database tables and their relationships
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// =========================================
// ORDER STATUS ENUM
// =========================================

export type OrderStatus = 'pending' | 'paid' | 'fulfilled' | 'refunded' | 'expired'

// =========================================
// PROFILES
// =========================================

export type Profile = {
  id: string
  email: string
  role: 'customer' | 'admin'
  created_at: string
}

export type ProfileInsert = Pick<Profile, 'id' | 'email'> & {
  role?: Profile['role']
}

export type ProfileUpdate = Partial<Pick<Profile, 'email' | 'role'>>

// =========================================
// INVENTORY PARTS
// =========================================

export type InventoryPart = {
  id: string
  sku: string
  name: string
  description: string | null
  image_url: string | null
  price_cents: number
  stock_count: number
  moq: number
  is_active: boolean
  created_at: string
}

export type InventoryPartInsert = Omit<InventoryPart, 'id' | 'created_at'>
export type InventoryPartUpdate = Partial<Omit<InventoryPart, 'id' | 'created_at'>>

// =========================================
// REPAIR SERVICES
// =========================================

export type RepairService = {
  id: string
  sku: string
  name: string
  description: string | null
  image_url: string | null
  price_cents: number
  estimated_hours: number | null
  is_active: boolean
  created_at: string
}

export type RepairServiceInsert = Omit<RepairService, 'id' | 'created_at'>
export type RepairServiceUpdate = Partial<Omit<RepairService, 'id' | 'created_at'>>

// =========================================
// ORDERS
// =========================================

export type Order = {
  id: string
  user_id: string | null
  stripe_session_id: string
  total_cents: number
  status: OrderStatus
  created_at: string
  updated_at: string
}

export type OrderInsert = Omit<Order, 'id' | 'created_at' | 'updated_at'>
export type OrderUpdate = Partial<Omit<Order, 'id' | 'created_at'>>

// =========================================
// ORDER ITEMS (PARTS)
// =========================================

export type OrderItemPart = {
  id: string
  order_id: string
  part_id: string
  quantity: number
  price_cents: number
}

export type OrderItemPartInsert = Omit<OrderItemPart, 'id'>

// =========================================
// ORDER ITEMS (SERVICES)
// =========================================

export type OrderItemService = {
  id: string
  order_id: string
  service_id: string
  price_cents: number
}

export type OrderItemServiceInsert = Omit<OrderItemService, 'id'>

// =========================================
// STRIPE EVENTS
// =========================================

export type StripeEvent = {
  id: string
  stripe_event_id: string
  event_type: string
  payload: Json
  processed: boolean
  created_at: string
}

// =========================================
// CONTACT SUBMISSIONS
// =========================================

export type ContactSubmission = {
  id: string
  name: string
  email: string
  subject: string
  message: string
  created_at: string
}

export type ContactSubmissionInsert = Omit<ContactSubmission, 'id' | 'created_at'>

// =========================================
// DATABASE TABLES
// =========================================

export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: ProfileInsert; Update: ProfileUpdate }
      inventory_parts: { Row: InventoryPart; Insert: InventoryPartInsert; Update: InventoryPartUpdate }
      repair_services: { Row: RepairService; Insert: RepairServiceInsert; Update: RepairServiceUpdate }
      orders: { Row: Order; Insert: OrderInsert; Update: OrderUpdate }
      order_items_parts: { Row: OrderItemPart; Insert: OrderItemPartInsert }
      order_items_services: { Row: OrderItemService; Insert: OrderItemServiceInsert }
      stripe_events: { Row: StripeEvent; Insert: Omit<StripeEvent, 'id' | 'created_at'> }
      contact_submissions: { Row: ContactSubmission; Insert: ContactSubmissionInsert }
    }
    Enums: {
      order_status: OrderStatus
    }
  }
}
