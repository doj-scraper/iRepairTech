import type { UIState, UIIntent, Severity } from './types';
import type { InventoryPart, Order, RepairService } from '@/lib/database.types';

/**
 * Central rule engine:
 * DB state → UI semantics
 */

export function mapInventoryPart(part: InventoryPart) {
  const lowStock = part.stock_count <= 3;
  const outOfStock = part.stock_count === 0;

  let ui_state: UIState = 'neutral';
  let ui_intent: UIIntent = 'sellable';
  let severity: Severity = 'normal';

  if (outOfStock) {
    ui_state = 'danger';
    ui_intent = 'out_of_stock';
    severity = 'critical';
  } else if (lowStock) {
    ui_state = 'warning';
    ui_intent = 'low_stock';
    severity = 'high';
  }

  return {
    ...part,
    ui_state,
    ui_intent,
    severity,
  };
}

export function mapOrder(order: Order) {
  let ui_state: UIState = 'muted';

  switch (order.status) {
    case 'pending':
      ui_state = 'warning';
      break;
    case 'paid':
    case 'fulfilled':
      ui_state = 'success';
      break;
    case 'refunded':
    case 'expired':
      ui_state = 'danger';
      break;
    default:
      ui_state = 'muted';
  }

  return {
    ...order,
    ui_state,
  };
}

export function mapRepairService(service: RepairService) {
  return {
    ...service,
    ui_state: 'neutral' as UIState,
    ui_intent: 'service' as UIIntent,
    severity: 'normal' as Severity,
  };
}

