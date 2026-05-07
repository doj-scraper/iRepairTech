/**
 * Order DTOs
 * Extended order types for API responses
 */

import type { Order, OrderItemPart, OrderItemService } from '@/lib/database.types';

export type OrderWithItems = Order & {
  order_items_parts: OrderItemPart[];
  order_items_services: OrderItemService[];
};

export type OrderSummary = Pick<Order, 'id' | 'status' | 'total_cents' | 'created_at'>;
