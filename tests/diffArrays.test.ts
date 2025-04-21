import { describe, test, expect } from "vitest";
import { diffArrays } from "../src/diffArrays";
import { ArrayDiffResult } from "../src/types";

describe("diffArrays()", () => {
  test("diffs simple arrays of numbers", () => {
    const a = [1, 2, 3];
    const b = [1, 4, 3, 5];

    const result: ArrayDiffResult<number> = diffArrays(a, b);

    expect(result).toEqual({
      added: [5],
      removed: [],
      changed: [{ index: 1, from: 2, to: 4 }],
      unchanged: [1, 3],
    });
  });

  test("detects full equality", () => {
    const a = ["a", "b", "c"];
    const b = ["a", "b", "c"];

    const result = diffArrays(a, b);

    expect(result).toEqual({
      added: [],
      removed: [],
      changed: [],
      unchanged: ["a", "b", "c"],
    });
  });

  test("detects completely different arrays", () => {
    const a = [1, 2, 3];
    const b = [4, 5, 6];

    const result = diffArrays(a, b);

    expect(result).toEqual({
      added: [],
      removed: [],
      changed: [
        { index: 0, from: 1, to: 4 },
        { index: 1, from: 2, to: 5 },
        { index: 2, from: 3, to: 6 },
      ],
      unchanged: [],
    });
  });

  test("handles one array being empty", () => {
    const a: string[] = [];
    const b = ["x", "y"];

    const result = diffArrays(a, b);

    expect(result).toEqual({
      added: ["x", "y"],
      removed: [],
      changed: [],
      unchanged: [],
    });
  });

  test("detects trailing removal from original array", () => {
    const a = ["a", "b", "c"];
    const b = ["a"];

    const result = diffArrays(a, b);

    expect(result).toEqual({
      added: [],
      removed: ["b", "c"],
      changed: [],
      unchanged: ["a"],
    });
  });

  test("compares nested objects shallowly by default", () => {
    const a = [{ id: 1 }, { id: 2 }];
    const b = [{ id: 1 }, { id: 3 }];

    const result = diffArrays(a, b);

    expect(result.changed.length).toBe(2);
    expect(result.changed).toContainEqual({ index: 0, from: { id: 1 }, to: { id: 1 } });
    expect(result.changed).toContainEqual({ index: 1, from: { id: 2 }, to: { id: 3 } });
  });
});
