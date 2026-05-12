import { describe, it, expect, beforeEach } from 'vitest';
import { useCart } from '@/store/cart';
import type { CartItem } from '@/lib/schema';

const mockPart: CartItem = {
  id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  type: 'part',
  quantity: 1,
  name: 'iPhone 13 Screen',
  price_cents: 4999,
};

const mockService: CartItem = {
  id: 'ffffffff-0000-1111-2222-333333333333',
  type: 'service',
  quantity: 1,
  name: 'Battery Replacement',
  price_cents: 2999,
};

describe('useCart', () => {
  beforeEach(() => {
    // Reset store state between tests without touching the persist layer.
    useCart.setState({ items: [] });
  });

  // ---------------------------------------------------------------------------
  // addItem
  // ---------------------------------------------------------------------------
  describe('addItem', () => {
    it('adds a new item to an empty cart', () => {
      useCart.getState().addItem(mockPart);

      const { items } = useCart.getState();
      expect(items).toHaveLength(1);
      expect(items[0]).toEqual(mockPart);
    });

    it('increments quantity when adding an already-present item', () => {
      useCart.getState().addItem(mockPart);
      useCart.getState().addItem({ ...mockPart, quantity: 3 });

      const { items } = useCart.getState();
      expect(items).toHaveLength(1);
      expect(items[0]?.quantity).toBe(4);
    });

    it('adds a second item as a new entry', () => {
      useCart.getState().addItem(mockPart);
      useCart.getState().addItem(mockService);

      expect(useCart.getState().items).toHaveLength(2);
    });

    it('treats items with the same id but different types as distinct entries', () => {
      useCart.getState().addItem(mockPart);
      // Same UUID as mockPart but type is 'service'
      useCart.getState().addItem({ ...mockService, id: mockPart.id });

      expect(useCart.getState().items).toHaveLength(2);
    });
  });

  // ---------------------------------------------------------------------------
  // removeItem
  // ---------------------------------------------------------------------------
  describe('removeItem', () => {
    it('removes an item by id and type', () => {
      useCart.getState().addItem(mockPart);
      useCart.getState().addItem(mockService);
      useCart.getState().removeItem(mockPart.id, mockPart.type);

      const { items } = useCart.getState();
      expect(items).toHaveLength(1);
      expect(items[0]!.id).toBe(mockService.id);
    });

    it('does nothing when the item does not exist', () => {
      useCart.getState().addItem(mockPart);
      useCart.getState().removeItem('non-existent-id', 'part');

      expect(useCart.getState().items).toHaveLength(1);
    });

    it('does nothing when type does not match', () => {
      useCart.getState().addItem(mockPart); // type: 'part'
      useCart.getState().removeItem(mockPart.id, 'service'); // wrong type

      expect(useCart.getState().items).toHaveLength(1);
    });
  });

  // ---------------------------------------------------------------------------
  // updateQuantity
  // ---------------------------------------------------------------------------
  describe('updateQuantity', () => {
    it('updates the quantity of a cart item', () => {
      useCart.getState().addItem(mockPart);
      useCart.getState().updateQuantity(mockPart.id, mockPart.type, 10);

      expect(useCart.getState().items[0]!.quantity).toBe(10);
    });

    it('removes the item when the new quantity is zero', () => {
      useCart.getState().addItem(mockPart);
      useCart.getState().updateQuantity(mockPart.id, mockPart.type, 0);

      expect(useCart.getState().items).toHaveLength(0);
    });

    it('removes the item when the new quantity is negative', () => {
      useCart.getState().addItem(mockPart);
      useCart.getState().updateQuantity(mockPart.id, mockPart.type, -5);

      expect(useCart.getState().items).toHaveLength(0);
    });

    it('does not affect other items', () => {
      useCart.getState().addItem(mockPart);
      useCart.getState().addItem(mockService);
      useCart.getState().updateQuantity(mockPart.id, mockPart.type, 7);

      const { items } = useCart.getState();
      expect(items).toHaveLength(2);
      const part = items.find((i) => i.id === mockPart.id && i.type === 'part');
      expect(part!.quantity).toBe(7);
      const service = items.find((i) => i.id === mockService.id && i.type === 'service');
      expect(service!.quantity).toBe(1);
    });
  });

  // ---------------------------------------------------------------------------
  // clear
  // ---------------------------------------------------------------------------
  describe('clear', () => {
    it('empties the cart', () => {
      useCart.getState().addItem(mockPart);
      useCart.getState().addItem(mockService);
      useCart.getState().clear();

      expect(useCart.getState().items).toHaveLength(0);
    });

    it('is a no-op on an already-empty cart', () => {
      useCart.getState().clear();

      expect(useCart.getState().items).toHaveLength(0);
    });
  });
});
