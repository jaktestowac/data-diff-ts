import { ArrayDiffResult } from "./types";

function isPrimitive(value: unknown): boolean {
  return value === null || (typeof value !== "object" && typeof value !== "function");
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== "object" || a === null || b === null) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const keysA = Object.keys(a as object);
  const keysB = Object.keys(b as object);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!deepEqual((a as any)[key], (b as any)[key])) return false;
  }
  return true;
}

export function diffArrays<T>(a: T[], b: T[], options?: { deep?: boolean }): ArrayDiffResult<T> {
  const result: ArrayDiffResult<T> = {
    added: [],
    removed: [],
    unchanged: [],
    changed: [],
  };

  // First, handle items at same indices
  const minLength = Math.min(a.length, b.length);

  for (let i = 0; i < minLength; i++) {
    const valA = a[i];
    const valB = b[i];

    let equal: boolean;
    if (options?.deep) {
      equal = deepEqual(valA, valB);
    } else if (isPrimitive(valA) && isPrimitive(valB)) {
      equal = valA === valB;
    } else {
      // For complex objects (like objects or arrays), handle them differently
      if (typeof valA === "object" && typeof valB === "object" && valA !== null && valB !== null) {
        // Compare objects by their structure, not reference
        // This ensures we properly detect changes in nested objects
        if (JSON.stringify(valA) === JSON.stringify(valB)) {
          equal = true;
        } else {
          equal = false;
        }
      } else {
        // For non-primitives, treat as unchanged if reference-equal (shallow)
        equal = valA === valB;
      }
    }

    if (equal) {
      result.unchanged.push(valA);
    } else {
      result.changed.push({ index: i, from: valA, to: valB });
    }
  }

  // Then handle additions (items present in b but not in a)
  if (b.length > a.length) {
    for (let i = a.length; i < b.length; i++) {
      result.added.push(b[i]);
    }
  }

  // Then handle removals (items present in a but not in b)
  if (a.length > b.length) {
    for (let i = b.length; i < a.length; i++) {
      result.removed.push(a[i]);
    }
  }

  return result;
}
