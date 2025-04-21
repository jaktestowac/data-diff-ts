import { describe, test, expect } from 'vitest';
import { diffFlattened } from '../src/flattenedDiff';
import type { FlatDiff } from '../src/flattenedDiff';

describe('diffFlattened()', () => {
  test('detects flat changes', () => {
    const a = { name: 'Alice', age: 25 };
    const b = { name: 'Alicia', age: 25 };

    const result: FlatDiff = diffFlattened(a, b);

    expect(result).toEqual({
      'name': { from: 'Alice', to: 'Alicia' }
    });
  });

  test('detects nested object changes', () => {
    const a = { user: { city: 'London', zip: '12345' } };
    const b = { user: { city: 'Paris', zip: '12345' } };

    const result: FlatDiff = diffFlattened(a, b);

    expect(result).toEqual({
      'user.city': { from: 'London', to: 'Paris' }
    });
  });

  test('detects array item changes', () => {
    const a = { tags: ['qa', 'test', 'ci'] };
    const b = { tags: ['qa', 'dev', 'ci'] };

    const result: FlatDiff = diffFlattened(a, b);

    expect(result).toEqual({
      'tags[1]': { from: 'test', to: 'dev' }
    });
  });

  test('detects deep object inside array changes', () => {
    const a = {
      users: [{ name: 'Alice' }, { name: 'Bob' }]
    };
    const b = {
      users: [{ name: 'Alicia' }, { name: 'Bob' }]
    };

    const result: FlatDiff = diffFlattened(a, b);

    expect(result).toEqual({
      'users[0].name': { from: 'Alice', to: 'Alicia' }
    });
  });

  test('returns empty object when no changes', () => {
    const a = { version: 1, meta: { env: 'prod' } };
    const b = { version: 1, meta: { env: 'prod' } };

    const result: FlatDiff = diffFlattened(a, b);

    expect(result).toEqual({});
  });
});
