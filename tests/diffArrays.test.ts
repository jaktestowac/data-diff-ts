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

    expect(result.changed.length).toBe(1);
    expect(result.changed).toEqual([
      {
        from: {
          id: 2,
        },
        index: 1,
        to: {
          id: 3,
        },
      },
    ]);
  });

  test("handles arrays with null and undefined", () => {
    const a = [null, undefined, 1];
    const b = [null, 2, 1];

    const result = diffArrays(a, b);
    expect(result.changed).toContainEqual({ index: 1, from: undefined, to: 2 });
    expect(result.unchanged).toContain(null);
    expect(result.unchanged).toContain(1);
  });

  test("handles arrays of objects with null/undefined properties", () => {
    const a = [{ x: null }, { x: 1 }];
    const b = [{ x: undefined }, { x: 1 }];

    const result = diffArrays(a, b);
    expect(result.changed).toContainEqual({ index: 0, from: { x: null }, to: { x: undefined } });
    expect(result.unchanged).not.toContainEqual([{ x: 1 }]); // shallow compare, so will be in changed
  });

  test("handles arrays with nested arrays", () => {
    const a = [
      [1, 2],
      [3, 4],
    ];
    const b = [
      [1, 2],
      [3, 5],
    ];

    const result = diffArrays(a, b);
    expect(result.changed).toContainEqual({ index: 1, from: [3, 4], to: [3, 5] });
  });

  test("handles empty arrays", () => {
    const a: any[] = [];
    const b: any[] = [];

    const result = diffArrays(a, b);
    expect(result.added).toEqual([]);
    expect(result.removed).toEqual([]);
    expect(result.changed).toEqual([]);
    expect(result.unchanged).toEqual([]);
  });

  test("detects type changes in arrays", () => {
    const a = [1, "a", { foo: 1 }];
    const b = [1, 2, [1, 2]];

    const result = diffArrays(a, b);
    expect(result.changed).toContainEqual({ index: 1, from: "a", to: 2 });
    expect(result.changed).toContainEqual({ index: 2, from: { foo: 1 }, to: [1, 2] });
  });

  test("arrays with nested objects and arrays", () => {
    const a = [{ x: [1, 2] }, { y: { z: 3 } }];
    const b = [{ x: [1, 2] }, { y: { z: 4 } }];

    const result = diffArrays(a, b, { deep: true });
    expect(result.changed).toContainEqual({ index: 1, from: { y: { z: 3 } }, to: { y: { z: 4 } } });
    expect(result.unchanged).toContainEqual({ x: [1, 2] });
  });

  test("arrays with only removals", () => {
    const a = [1, 2, 3];
    const b: number[] = [];

    const result = diffArrays(a, b);
    expect(result.removed).toEqual([1, 2, 3]);
    expect(result.added).toEqual([]);
    expect(result.changed).toEqual([]);
    expect(result.unchanged).toEqual([]);
  });

  test("arrays with only additions", () => {
    const a: number[] = [];
    const b = [4, 5, 6];

    const result = diffArrays(a, b);
    expect(result.added).toEqual([4, 5, 6]);
    expect(result.removed).toEqual([]);
    expect(result.changed).toEqual([]);
    expect(result.unchanged).toEqual([]);
  });

  test("arrays with all unchanged but different order", () => {
    const a = [1, 2, 3];
    const b = [3, 2, 1];

    const result = diffArrays(a, b);
    expect(result.changed).toContainEqual({ index: 0, from: 1, to: 3 });
    expect(result.changed).toContainEqual({ index: 2, from: 3, to: 1 });
    expect(result.unchanged).toContain(2);
  });
});
