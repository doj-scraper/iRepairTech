export interface CartItem {
  id: string;
  type: 'part' | 'service';
  quantity: number;
  name: string;
  price_cents: number;
}
