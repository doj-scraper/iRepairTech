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

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'fulfilled'
  | 'refunded'
  | 'expired'
  | 'awaiting_device'
  | 'device_received'
  | 'in_repair'
  | 'qa'
  | 'shipped'
  | 'completed'
  | 'failed'

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
  accepted_terms: boolean
  accepted_terms_at: string | null
  terms_version: string | null
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
export type OrderItemPartUpdate = Partial<Omit<OrderItemPart, 'id'>>

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
export type OrderItemServiceUpdate = Partial<Omit<OrderItemService, 'id'>>

// =========================================
// ORDER STATE
// =========================================

export type OrderStateTransition = {
  from_state: OrderStatus
  to_state: OrderStatus
}
export type OrderStateTransitionUpdate = Partial<OrderStateTransition>

export type OrderStateHistory = {
  id: string
  order_id: string | null
  from_state: OrderStatus | null
  to_state: OrderStatus | null
  changed_at: string
  metadata: Json | null
}

export type OrderStateHistoryInsert = Omit<OrderStateHistory, 'id' | 'changed_at'>
export type OrderStateHistoryUpdate = Partial<Omit<OrderStateHistory, 'id' | 'changed_at'>>

// =========================================
// INVENTORY RESERVATIONS
// =========================================

export type InventoryReservation = {
  id: string
  order_id: string
  part_id: string
  quantity: number
  status: 'reserved' | 'released' | 'consumed'
  created_at: string
  updated_at: string
}

export type InventoryReservationInsert = Omit<InventoryReservation, 'id' | 'created_at' | 'updated_at'>
export type InventoryReservationUpdate = Partial<Omit<InventoryReservation, 'id' | 'created_at'>>

// =========================================
// STRIPE EVENTS
// =========================================

export type StripeEvent = {
  id: string
  event_id: string
  type: string
  payload: Json
  processed: boolean
  created_at: string
}

export type StripeEventInsert = Omit<StripeEvent, 'id' | 'created_at'>
export type StripeEventUpdate = Partial<Omit<StripeEvent, 'id' | 'created_at'>>

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
export type ContactSubmissionUpdate = Partial<Omit<ContactSubmission, 'id' | 'created_at'>>

// =========================================
// DATABASE TABLES
// =========================================

export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: ProfileInsert; Update: ProfileUpdate; Relationships: [] }
      inventory_parts: { Row: InventoryPart; Insert: InventoryPartInsert; Update: InventoryPartUpdate; Relationships: [] }
      repair_services: { Row: RepairService; Insert: RepairServiceInsert; Update: RepairServiceUpdate; Relationships: [] }
      orders: { Row: Order; Insert: OrderInsert; Update: OrderUpdate; Relationships: [] }
      order_items_parts: { Row: OrderItemPart; Insert: OrderItemPartInsert; Update: OrderItemPartUpdate; Relationships: [] }
      order_items_services: { Row: OrderItemService; Insert: OrderItemServiceInsert; Update: OrderItemServiceUpdate; Relationships: [] }
      order_state_transitions: { Row: OrderStateTransition; Insert: OrderStateTransition; Update: OrderStateTransitionUpdate; Relationships: [] }
      order_state_history: { Row: OrderStateHistory; Insert: OrderStateHistoryInsert; Update: OrderStateHistoryUpdate; Relationships: [] }
      inventory_reservations: { Row: InventoryReservation; Insert: InventoryReservationInsert; Update: InventoryReservationUpdate; Relationships: [] }
      stripe_events: { Row: StripeEvent; Insert: StripeEventInsert; Update: StripeEventUpdate; Relationships: [] }
      contact_submissions: { Row: ContactSubmission; Insert: ContactSubmissionInsert; Update: ContactSubmissionUpdate; Relationships: [] }
    }
    Views: Record<string, never>
    Functions: {
      pg_advisory_lock: {
        Args: {
          lockid: number
        }
        Returns: boolean
      }
      pg_advisory_unlock: {
        Args: {
          lockid: number
        }
        Returns: boolean
      }
      reserve_inventory_for_order: {
        Args: {
          p_order_id: string
        }
        Returns: undefined
      }
      release_inventory_for_order: {
        Args: {
          p_order_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      order_status: OrderStatus
    }
    CompositeTypes: Record<string, never>
  }
}
