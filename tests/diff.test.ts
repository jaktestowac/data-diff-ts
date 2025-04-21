import { describe, test, expect } from 'vitest';
import { diff } from '../src/diff';
import type { DiffResult } from '../src/types';

describe('diff()', () => {
  test('detects flat changes', () => {
    const a = { name: 'Alice', age: 25 };
    const b = { name: 'Alicia', age: 25 };

    const result = diff(a, b) as DiffResult;

    expect(result.added).toEqual({});
    expect(result.removed).toEqual({});
    expect(result.unchanged).toEqual({ age: 25 });
    expect(result.changed).toHaveProperty('name');
    expect(result.changed['name']).toEqual({ from: 'Alice', to: 'Alicia' });
  });

  test('detects removed and added keys', () => {
    const a = { email: 'a@example.com', active: true };
    const b = { active: true, role: 'admin' };

    const result = diff(a, b) as DiffResult;

    expect(result.added).toEqual({ role: 'admin' });
    expect(result.removed).toEqual({ email: 'a@example.com' });
    expect(result.unchanged).toEqual({ active: true });
    expect(result.changed).toEqual({});
  });

  test('detects nested object changes', () => {
    const a = { user: { name: 'Alice', zip: '123' } };
    const b = { user: { name: 'Alicia', zip: '123' } };

    const result = diff(a, b) as DiffResult;

    expect(result.changed).toHaveProperty('user');
    const userDiff = result.changed['user'] as DiffResult;
    expect(userDiff.changed).toEqual({ name: { from: 'Alice', to: 'Alicia' } });
    expect(userDiff.unchanged).toEqual({ zip: '123' });
  });

  test('detects array changes inside objects', () => {
    const a = { tags: ['qa', 'test', 'ci'] };
    const b = { tags: ['qa', 'dev', 'ci'] };

    const result = diff(a, b) as DiffResult;

    expect(result.changed).toHaveProperty('tags');
    const arrayResult = result.changed['tags'] as any;
    expect(arrayResult.changed).toEqual([
      { index: 1, from: 'test', to: 'dev' }
    ]);
  });

  test('returns full unchanged if objects are the same', () => {
    const a = { id: 1, title: 'Test' };
    const b = { id: 1, title: 'Test' };

    const result = diff(a, b) as DiffResult;

    expect(result.added).toEqual({});
    expect(result.removed).toEqual({});
    expect(result.changed).toEqual({});
    expect(result.unchanged).toEqual({ id: 1, title: 'Test' });
  });
});
