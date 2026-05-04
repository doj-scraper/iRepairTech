export type UIState =
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger'
  | 'muted';

export type UIIntent =
  | 'sellable'
  | 'service'
  | 'low_stock'
  | 'out_of_stock'
  | 'processing'
  | 'completed';

export type Severity =
  | 'normal'
  | 'low'
  | 'high'
  | 'critical';

/**
 * DB → UI Projection Contract
 */
export interface SemanticEntity {
  ui_state: UIState;
  ui_intent: UIIntent;
  severity: Severity;
}

