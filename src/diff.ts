import { DiffResult } from "./types";
import { diffArrays } from "./diffArrays";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isArray(value: unknown): value is Array<unknown> {
  return Array.isArray(value);
}

export function diff(objA: Record<string, any>, objB: Record<string, any>): DiffResult | {} {
  const result: DiffResult = {
    added: {},
    removed: {},
    changed: {},
    unchanged: {},
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
      // When comparing objects, we need to handle empty objects specially
      if (Object.keys(valA).length === 0 && Object.keys(valB).length > 0) {
        // Empty object to object with keys
        const nested: DiffResult = {
          added: { ...valB },
          removed: {},
          changed: {},
          unchanged: {},
        };
        result.changed[key] = nested;
      } else {
        const nested = diff(valA, valB) as DiffResult;

        const hasChanges =
          Object.keys(nested.added).length > 0 ||
          Object.keys(nested.removed).length > 0 ||
          Object.keys(nested.changed).length > 0;
        if (hasChanges) {
          result.changed[key] = nested;
        }

        if (Object.keys(nested).length === 0) {
          result.unchanged[key] = valA;
        } else {
          result.changed[key] = nested;
        }
      }
    } else if (isArray(valA) && isArray(valB)) {
      const arrayResult = diffArrays(valA, valB, { deep: true });
      const hasChanges =
        arrayResult.added.length > 0 || arrayResult.removed.length > 0 || arrayResult.changed.length > 0;
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

  // If there are no changes, additions, or removals, return empty object
  if (
    Object.keys(result.added).length === 0 &&
    Object.keys(result.removed).length === 0 &&
    Object.keys(result.changed).length === 0
  ) {
    return {
      added: {},
      removed: {},
      changed: {},
      unchanged: {},
    };
  }

  return result;
}
