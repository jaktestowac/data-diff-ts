import { describe, test, expect } from "vitest";
import { smartDiff } from "../src/smartDiff";
import type { FlatDiff } from "../src/flattenedDiff";

describe("Advanced Data Structures Tests", () => {
  test("diffing objects with different array orders", () => {
    const a = {
      user: {
        roles: ["admin", "editor", "viewer"],
      },
    };

    const b = {
      user: {
        roles: ["viewer", "admin", "editor"],
      },
    };

    const result = smartDiff(a, b, { flatten: true }) as FlatDiff;
    expect(result).toEqual({
      "user.roles[0]": { from: "admin", to: "viewer" },
      "user.roles[1]": { from: "editor", to: "admin" },
      "user.roles[2]": { from: "viewer", to: "editor" },
    });
  });

  test("diffing objects with non-string keys", () => {
    const numKey1 = 123;
    const numKey2 = 456;

    const a = { [numKey1]: "value1", [numKey2]: "value2" };
    const b = { [numKey1]: "changed", [numKey2]: "value2" };

    const result = smartDiff(a, b, { flatten: true }) as FlatDiff;
    expect(result).toEqual({
      "[123]": { from: "value1", to: "changed" },
    });
  });

  test("diffing objects with non-string keys 2", () => {
    const numKey1 = "123";
    const numKey2 = "456";

    const a = { [numKey1]: "value1", [numKey2]: "value2" };
    const b = { [numKey1]: "changed", [numKey2]: "value2" };

    const result = smartDiff(a, b, { flatten: true }) as FlatDiff;
    expect(result).toEqual({
      "[123]": { from: "value1", to: "changed" },
    });
  });

  test("diffing objects with non-string keys 3", () => {
    const numKey1 = "123";
    const numKey2 = "456";
    const numKey3 = "789";

    const a = { [numKey1]: "value1", [numKey2]: { [numKey3]: "value2" } };
    const b = { [numKey1]: "value12", [numKey2]: { [numKey3]: "value22" } };

    const result = smartDiff(a, b, { flatten: true }) as FlatDiff;
    expect(result).toEqual({
      "[123]": { from: "value1", to: "value12" },
      "[456][789]": { from: "value2", to: "value22" },
    });
  });

  test("diffing objects with different value types at the same path", () => {
    const a = {
      settings: {
        timeout: 1000,
        retries: 3,
        options: { logging: true },
      },
    };

    const b = {
      settings: {
        timeout: "1000ms", // string instead of number
        retries: [1, 2, 3], // array instead of number
        options: false, // boolean instead of object
      },
    };

    const result = smartDiff(a, b, { flatten: true }) as FlatDiff;
    expect(result).toEqual({
      "settings.timeout": { from: 1000, to: "1000ms" },
      "settings.retries": { from: 3, to: [1, 2, 3] },
      "settings.options": { from: { logging: true }, to: false },
    });
  });

  test("diffing mixed structure with array order changes and property changes", () => {
    const a = {
      config: {
        features: ["f1", "f2", "f3"],
        options: { debug: true, timeout: 1000 },
      },
    };

    const b = {
      config: {
        features: ["f3", "f1", "f4"], // order changed and item replaced
        options: { debug: true, timeout: 2000 }, // property changed
      },
    };

    const result = smartDiff(a, b, { flatten: true }) as FlatDiff;
    expect(result).toHaveProperty("config.features[0]");
    expect(result).toHaveProperty("config.features[1]");
    expect(result).toHaveProperty("config.features[2]");
    expect(result).toHaveProperty("config.options.timeout");
    expect(result["config.options.timeout"]).toEqual({ from: 1000, to: 2000 });
  });

  test("diffing arrays with different length and structure", () => {
    const a = {
      matrix: [
        [1, 2, 3],
        [4, 5, 6],
      ],
    };

    const b = {
      matrix: [
        [1, 2],
        [4, 5, 6],
        [7, 8],
      ],
    };

    const result = smartDiff(a, b, { flatten: true }) as FlatDiff;
    expect(result).toHaveProperty("matrix[0][2]"); // Missing in b
    expect(result).toHaveProperty("matrix[2][0]"); // New in b
    expect(result).toHaveProperty("matrix[2][1]"); // New in b
  });
});
