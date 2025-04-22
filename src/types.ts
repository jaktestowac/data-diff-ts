export interface ArrayDiffResult<T> {
  added: T[];
  removed: T[];
  unchanged: T[];
  changed: Array<{ index: number; from: T; to: T }>;
}

export interface DiffResult {
  added: Record<string, unknown>;
  removed: Record<string, unknown>;
  changed: Record<string, { from: unknown; to: unknown } | DiffResult | ArrayDiffResult<unknown>>;

  unchanged: Record<string, unknown>;
}

export function isFlatChange(value: unknown): value is { from: unknown; to: unknown } {
  return (
    typeof value === "object" && value !== null && "from" in value && "to" in value && Object.keys(value).length === 2
  );
}

export function isDiffResult(value: unknown): value is DiffResult {
  return (
    typeof value === "object" &&
    value !== null &&
    "added" in value &&
    "removed" in value &&
    "changed" in value &&
    "unchanged" in value
  );
}

export function isArrayDiffResult(value: unknown): value is ArrayDiffResult<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    "added" in value &&
    "removed" in value &&
    "changed" in value &&
    "unchanged" in value &&
    Array.isArray((value as any).added)
  );
}
