import { DiffResult } from './types';
import { diffArrays } from './diffArrays';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isArray(value: unknown): value is Array<unknown> {
  return Array.isArray(value);
}

export function diff(objA: Record<string, any>, objB: Record<string, any>): DiffResult {
  const result: DiffResult = {
    added: {},
    removed: {},
    changed: {},
    unchanged: {}
  };

  const allKeys = new Set([...Object.keys(objA), ...Object.keys(objB)]);

  for (const key of allKeys) {
    const valA = objA[key];
    const valB = objB[key];

    if (!(key in objA)) {
      result.added[key] = valB;
    } else if (!(key in objB)) {
      result.removed[key] = valA;
    } else if (isObject(valA) && isObject(valB)) {
      const nested = diff(valA, valB);
      const hasChanges =
        Object.keys(nested.added).length > 0 ||
        Object.keys(nested.removed).length > 0 ||
        Object.keys(nested.changed).length > 0;

      if (hasChanges) {
        result.changed[key] = nested;
      } else {
        result.unchanged[key] = valA;
      }
    } else if (isArray(valA) && isArray(valB)) {
      const arrayResult = diffArrays(valA, valB);
      const hasChanges =
        arrayResult.added.length > 0 ||
        arrayResult.removed.length > 0 ||
        arrayResult.changed.length > 0;

      if (hasChanges) {
        result.changed[key] = arrayResult;
      } else {
        result.unchanged[key] = valA;
      }
    } else if (valA !== valB) {
      result.changed[key] = { from: valA, to: valB };
    } else {
      result.unchanged[key] = valA;
    }
  }

  return result;
}
