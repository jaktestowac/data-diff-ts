import { test, expect } from 'vitest';
import { smartDiff } from '../src';

test('returns structured DiffResult by default', () => {
  const a = { name: 'Alice' };
  const b = { name: 'Bob' };

  const result = smartDiff(a, b);
  expect(result).toHaveProperty('changed');
  expect(result).not.toHaveProperty('user.name');
});

test('returns flattened dot-path diff when flatten = true', () => {
  const a = { user: { name: 'Alice' } };
  const b = { user: { name: 'Alicia' } };

  const result = smartDiff(a, b, { flatten: true });

  expect(result).toEqual({
    'user.name': { from: 'Alice', to: 'Alicia' }
  });
});
