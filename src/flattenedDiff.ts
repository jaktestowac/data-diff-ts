import { diff } from "./diff";
import { isDiffResult, isArrayDiffResult } from "./types";

export type FlatDiff = Record<string, { from: unknown; to: unknown }>;

function buildPath(base: string, key: string | number): string {
  const isIndex = typeof key === "number" || /^[0-9]+$/.test(key as string);

  if (isIndex) {
    return `${base}[${key}]`;
  }

  return base ? `${base}.${key}` : key;
}

export function diffFlattened(a: Record<string, any>, b: Record<string, any>, prefix = ""): FlatDiff {
  const flat: FlatDiff = {};
  const nested = diff(a, b);

  for (const [key, val] of Object.entries(nested.changed)) {
    const path = buildPath(prefix, key);

    if (isDiffResult(val)) {
      Object.assign(flat, diffFlattened(a[key] || {}, b[key] || {}, path));
    } else if (isArrayDiffResult(val)) {
      val.changed.forEach((entry) => {
        const subKey = `${path}[${entry.index}]`;
        if (isDiffResult(entry.from) && isDiffResult(entry.to)) {
          Object.assign(flat, diffFlattened(entry.from, entry.to, subKey));
        } else {
          flat[subKey] = { from: entry.from, to: entry.to };
        }
      });
    } else {
      flat[path] = val as { from: unknown; to: unknown };
    }
  }

  return flat;
}
