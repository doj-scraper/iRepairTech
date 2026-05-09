import { Badge } from '@/components/ui/badge';
import type { Order } from '@/lib/database.types';
import { mapOrder } from '@/lib/semantic/mapToUI';

type OrderStatusBadgeProps = {
  order: Order;
};

export function OrderStatusBadge({ order }: OrderStatusBadgeProps) {
  const { ui_state } = mapOrder(order);

  const variant =
    ui_state === 'success'
      ? 'success'
      : ui_state === 'warning'
        ? 'warning'
        : ui_state === 'danger'
          ? 'destructive'
          : 'secondary';

  return <Badge variant={variant}>{order.status.replace('_', ' ')}</Badge>;
}
