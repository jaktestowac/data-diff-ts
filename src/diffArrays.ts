import { ArrayDiffResult } from "./types";

  function isPrimitive(value: unknown): boolean {
    return value === null || (typeof value !== 'object' && typeof value !== 'function');
  }
  
  export function diffArrays<T>(
    a: T[],
    b: T[],
    options?: { deep?: boolean }
  ): ArrayDiffResult<T> {
    const result: ArrayDiffResult<T> = {
      added: [],
      removed: [],
      unchanged: [],
      changed: []
    };
  
    const maxLength = Math.max(a.length, b.length);
  
    for (let i = 0; i < maxLength; i++) {
      const valA = a[i];
      const valB = b[i];
  
      if (i >= a.length) {
        result.added.push(valB);
      } else if (i >= b.length) {
        result.removed.push(valA);
      } else if (
        options?.deep && typeof valA === 'object' && typeof valB === 'object'
          ? JSON.stringify(valA) === JSON.stringify(valB)
          : valA === valB
      ) {
        result.unchanged.push(valA);
      } else {
        result.changed.push({ index: i, from: valA, to: valB });
      }
    }
  
    return result;
  }
  