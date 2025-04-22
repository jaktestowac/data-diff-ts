import { ArrayDiffResult } from "./types";

function isPrimitive(value: unknown): boolean {
  return value === null || (typeof value !== "object" && typeof value !== "function");
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

    if (
      options?.deep && typeof valA === "object" && typeof valB === "object"
        ? JSON.stringify(valA) === JSON.stringify(valB)
        : valA === valB
    ) {
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
