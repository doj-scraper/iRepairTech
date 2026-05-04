import type { UIState, UIIntent, Severity } from './types';

/**
 * Central rule engine:
 * DB state → UI semantics
 */

export function mapInventoryPart(part: any) {
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

export function mapOrder(order: any) {
  let ui_state: UIState = 'muted';

  switch (order.status) {
    case 'pending':
      ui_state = 'warning';
      break;
    case 'paid':
      ui_state = 'success';
      break;
    case 'failed':
    case 'cancelled':
      ui_state = 'danger';
      break;
    case 'shipped':
      ui_state = 'success';
      break;
    default:
      ui_state = 'muted';
  }

  return {
    ...order,
    ui_state,
  };
}

export function mapRepairService(service: any) {
  return {
    ...service,
    ui_state: 'neutral' as UIState,
    ui_intent: 'service' as UIIntent,
    severity: 'normal' as Severity,
  };
}

