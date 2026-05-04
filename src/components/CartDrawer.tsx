'use client';

import { useCart } from '@/store/cart';
import Link from 'next/link';
import { useState } from 'react';

export function CartDrawer() {
  const [open, setOpen] = useState(false);
  const items = useCart((s) => s.items);
  const removeItem = useCart((s) => s.removeItem);
  const updateQuantity = useCart((s) => s.updateQuantity);

  const total = items.reduce((sum, i) => sum + i.quantity * 1000, 0);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 hover:bg-muted rounded"
      >
        🛒
        {items.length > 0 && (
          <span className="absolute top-0 right-0 bg-danger text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {items.length}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}>
          <div
            className="absolute right-0 top-0 h-full w-96 bg-background border-l border-border shadow-lg p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6">Cart</h2>

            {items.length === 0 ? (
              <p className="text-muted">Your cart is empty</p>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center border-b pb-4"
                    >
                      <div className="flex-1">
                        <p className="font-semibold">Item {item.id.slice(0, 8)}</p>
                        <p className="text-sm text-muted">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                          className="px-2 py-1 bg-muted rounded"
                        >
                          −
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="px-2 py-1 bg-muted rounded"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="ml-2 text-danger hover:bg-danger hover:text-white px-2 py-1 rounded"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between font-bold text-lg mb-4">
                    <span>Total:</span>
                    <span>${(total / 100).toFixed(2)}</span>
                  </div>

                  <Link
                    href="/checkout"
                    onClick={() => setOpen(false)}
                    className="block w-full bg-primary text-white text-center py-3 rounded font-semibold hover:opacity-90"
                  >
                    Checkout
                  </Link>
                </div>
              </>
            )}

            <button
              onClick={() => setOpen(false)}
              className="w-full text-muted hover:text-foreground py-2"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </>
  );
}

