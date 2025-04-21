import { diff } from './diff';
import { diffFlattened, FlatDiff } from './flattenedDiff';
import { DiffResult } from './types';

export interface SmartDiffOptions {
  flatten?: boolean;
}

export function smartDiff(
  a: Record<string, any>,
  b: Record<string, any>,
  options?: SmartDiffOptions
): DiffResult | FlatDiff {
  if (options?.flatten) {
    return diffFlattened(a, b);
  }

  return diff(a, b);
}
