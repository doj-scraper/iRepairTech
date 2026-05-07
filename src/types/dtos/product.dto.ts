/**
 * Product DTO Types
 * Used for catalog and product display
 */

import type { InventoryPart, RepairService } from '@/lib/database.types'

// =========================================
// SEMANTIC UI MAPPING
// =========================================

export type UIIntent = 'success' | 'warning' | 'danger' | 'neutral'

export type UIState = 'in-stock' | 'low-stock' | 'out-of-stock' | 'unavailable'

// =========================================
// PRODUCT DTOs
// =========================================

export type ProductPartDTO = {
  id: string
  name: string
  description: string | null
  image_url: string | null
  price_cents: number
  stock_count: number
  moq: number
  sku: string
  ui_state: UIState
  ui_intent: UIIntent
  severity: 'low' | 'medium' | 'high'
}

export type ProductServiceDTO = {
  id: string
  name: string
  description: string | null
  image_url: string | null
  price_cents: number
  estimated_hours: number | null
  sku: string
}

export type ProductDTO = ProductPartDTO | ProductServiceDTO

// =========================================
// MAPPING FUNCTIONS TYPE SIGNATURES
// =========================================

export type MapInventoryPartFn = (part: InventoryPart) => ProductPartDTO

export type MapRepairServiceFn = (service: RepairService) => ProductServiceDTO
