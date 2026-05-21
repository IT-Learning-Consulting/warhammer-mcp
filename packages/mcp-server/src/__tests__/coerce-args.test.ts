import { describe, it, expect } from 'vitest';
import { coerceArgsBySchema } from '../coerce-args.js';

const schema = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: { type: 'object', properties: { qty: { type: 'number' } } },
    },
  },
};

describe('coerceArgsBySchema', () => {
  it('coerces string items in an array', () => {
    const result = coerceArgsBySchema(schema, { items: [{ qty: '3' }, { qty: '7' }] });
    expect(result).toEqual({ items: [{ qty: 3 }, { qty: 7 }] });
  });
  it('coerces string-encoded array with nested strings', () => {
    const result = coerceArgsBySchema(schema, { items: '[{"qty":"5"}]' });
    expect(result).toEqual({ items: [{ qty: 5 }] });
  });
});
