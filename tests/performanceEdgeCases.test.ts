import { describe, test, expect } from "vitest";
import { smartDiff } from "../src/smartDiff";
import type { FlatDiff } from "../src/flattenedDiff";

describe("Performance Edge Cases for data-diff-ts", () => {
  test("diffing large flat arrays", () => {
    // Create arrays with 1000 elements
    const a = { numbers: Array.from({ length: 1000 }, (_, i) => i) };
    const b = { numbers: Array.from({ length: 1000 }, (_, i) => (i === 500 ? i + 1 : i)) };

    const result = smartDiff(a, b, { flatten: true }) as FlatDiff;
    expect(result).toEqual({
      "numbers[500]": { from: 500, to: 501 },
    });
  });

  test("diffing objects with many properties", () => {
    // Create objects with 100 properties
    const a: Record<string, any> = { config: {} };
    const b: Record<string, any> = { config: {} };

    for (let i = 0; i < 100; i++) {
      a.config[`prop${i}`] = `value${i}`;
      b.config[`prop${i}`] = i === 50 ? `changed${i}` : `value${i}`;
    }

    const result = smartDiff(a, b, { flatten: true }) as FlatDiff;
    expect(result).toEqual({
      "config.prop50": { from: "value50", to: "changed50" },
    });
  });

  test("diffing deeply nested structures with minimal changes", () => {
    // Create a deeply nested structure with 10 levels
    function createNestedObject(depth: number, value: string): any {
      if (depth === 0) return value;
      return { nested: createNestedObject(depth - 1, value) };
    }

    const a = createNestedObject(10, "original");
    const b = createNestedObject(10, "changed");

    const result = smartDiff(a, b, { flatten: true }) as FlatDiff;

    // The deepest path should be the only difference
    const deepPath = Array(10).fill("nested").join(".");
    expect(result).toEqual({
      [deepPath]: { from: "original", to: "changed" },
    });
  });

  test("diffing large array of objects with minimal changes", () => {
    // Create an array with 100 objects, each with 5 properties
    const createItems = (changeIndex = -1, changeProp = "") => {
      return Array.from({ length: 100 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        status: i % 2 === 0 ? "active" : "inactive",
        value: i * 10,
        tags: [`tag-${i % 5}`],
        ...(i === changeIndex && changeProp ? { [changeProp]: "changed" } : {}),
      }));
    };

    const a = { items: createItems() };
    const b = { items: createItems(42, "name") };

    const result = smartDiff(a, b, { flatten: true }) as FlatDiff;
    expect(result).toEqual({
      "items[42].name": { from: "Item 42", to: "changed" },
    });
  });
});
