import { describe, it, expect } from 'vitest';
import { checkoutItemSchema, checkoutRequestSchema } from '@/types/dtos/checkout.dto';

const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';

// ---------------------------------------------------------------------------
// checkoutItemSchema
// ---------------------------------------------------------------------------
describe('checkoutItemSchema', () => {
  it('accepts a valid part item', () => {
    const result = checkoutItemSchema.safeParse({
      id: VALID_UUID,
      type: 'part',
      quantity: 1,
    });
    expect(result.success).toBe(true);
  });

  it('accepts a valid service item', () => {
    const result = checkoutItemSchema.safeParse({
      id: VALID_UUID,
      type: 'service',
      quantity: 5,
    });
    expect(result.success).toBe(true);
  });

  it('rejects a non-UUID id', () => {
    const result = checkoutItemSchema.safeParse({
      id: 'not-a-uuid',
      type: 'part',
      quantity: 1,
    });
    expect(result.success).toBe(false);
  });

  it('rejects quantity of zero', () => {
    const result = checkoutItemSchema.safeParse({
      id: VALID_UUID,
      type: 'part',
      quantity: 0,
    });
    expect(result.success).toBe(false);
  });

  it('rejects a negative quantity', () => {
    const result = checkoutItemSchema.safeParse({
      id: VALID_UUID,
      type: 'part',
      quantity: -1,
    });
    expect(result.success).toBe(false);
  });

  it('rejects a non-integer quantity', () => {
    const result = checkoutItemSchema.safeParse({
      id: VALID_UUID,
      type: 'part',
      quantity: 1.5,
    });
    expect(result.success).toBe(false);
  });

  it('rejects an unknown item type', () => {
    const result = checkoutItemSchema.safeParse({
      id: VALID_UUID,
      type: 'unknown',
      quantity: 1,
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// checkoutRequestSchema
// ---------------------------------------------------------------------------
describe('checkoutRequestSchema', () => {
  const validItem = { id: VALID_UUID, type: 'part' as const, quantity: 1 };

  it('accepts a valid checkout request', () => {
    const result = checkoutRequestSchema.safeParse({
      items: [validItem],
      email: 'buyer@example.com',
      acceptedTerms: true,
    });
    expect(result.success).toBe(true);
  });

  it('accepts multiple items', () => {
    const result = checkoutRequestSchema.safeParse({
      items: [
        validItem,
        { id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', type: 'service', quantity: 2 },
      ],
      email: 'buyer@example.com',
      acceptedTerms: true,
    });
    expect(result.success).toBe(true);
  });

  it('rejects an empty items array', () => {
    const result = checkoutRequestSchema.safeParse({
      items: [],
      email: 'buyer@example.com',
      acceptedTerms: true,
    });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid email address', () => {
    const result = checkoutRequestSchema.safeParse({
      items: [validItem],
      email: 'not-an-email',
      acceptedTerms: true,
    });
    expect(result.success).toBe(false);
  });

  it('rejects when acceptedTerms is false', () => {
    const result = checkoutRequestSchema.safeParse({
      items: [validItem],
      email: 'buyer@example.com',
      acceptedTerms: false,
    });
    expect(result.success).toBe(false);
  });

  it('rejects when acceptedTerms is missing', () => {
    const result = checkoutRequestSchema.safeParse({
      items: [validItem],
      email: 'buyer@example.com',
    });
    expect(result.success).toBe(false);
  });

  it('rejects when email is missing', () => {
    const result = checkoutRequestSchema.safeParse({
      items: [validItem],
      acceptedTerms: true,
    });
    expect(result.success).toBe(false);
  });
});
