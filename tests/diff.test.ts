import { describe, test, expect } from "vitest";
import { diff } from "../src/diff";
import type { DiffResult } from "../src/types";
import { smartDiff } from "../src";

describe("diff()", () => {
  test("detects flat changes", () => {
    const a = { name: "Alice", age: 25 };
    const b = { name: "Alicia", age: 25 };

    const result = diff(a, b) as DiffResult;

    expect(result.added).toEqual({});
    expect(result.removed).toEqual({});
    expect(result.unchanged).toEqual({ age: 25 });
    expect(result.changed).toHaveProperty("name");
    expect(result.changed["name"]).toEqual({ from: "Alice", to: "Alicia" });
  });

  test("detects removed and added keys", () => {
    const a = { email: "a@example.com", active: true };
    const b = { active: true, role: "admin" };

    const result = diff(a, b) as DiffResult;

    expect(result.added).toEqual({ role: "admin" });
    expect(result.removed).toEqual({ email: "a@example.com" });
    expect(result.unchanged).toEqual({ active: true });
    expect(result.changed).toEqual({});
  });

  test("detects nested object changes", () => {
    const a = { user: { name: "Alice", zip: "123" } };
    const b = { user: { name: "Alicia", zip: "123" } };

    const result = diff(a, b) as DiffResult;

    expect(result.changed).toHaveProperty("user");
    const userDiff = result.changed["user"] as DiffResult;
    expect(userDiff.changed).toEqual({ name: { from: "Alice", to: "Alicia" } });
    expect(userDiff.unchanged).toEqual({ zip: "123" });
  });

  test("detects array changes inside objects", () => {
    const a = { tags: ["qa", "test", "ci"] };
    const b = { tags: ["qa", "dev", "ci"] };

    const result = diff(a, b) as DiffResult;

    expect(result.changed).toHaveProperty("tags");
    const arrayResult = result.changed["tags"] as any;
    expect(arrayResult.changed).toEqual([{ index: 1, from: "test", to: "dev" }]);
  });

  test("returns full unchanged if objects are the same", () => {
    const a = { id: 1, title: "Test" };
    const b = { id: 1, title: "Test" };

    const result = diff(a, b) as DiffResult;

    expect(result.added).toEqual({});
    expect(result.removed).toEqual({});
    expect(result.changed).toEqual({});
    expect(result.unchanged).toEqual({});
  });

  test("handles null values", () => {
    const a = { avatar: null };
    const b = { avatar: "img.png" };

    const result = diff(a, b) as DiffResult;
    expect(result.changed).toHaveProperty("avatar");
    expect(result.changed["avatar"]).toEqual({ from: null, to: "img.png" });
  });

  test("handles undefined values", () => {
    const a = { foo: undefined };
    const b = { foo: 123 };

    const result = diff(a, b) as DiffResult;
    expect(result.changed).toHaveProperty("foo");
    expect(result.changed["foo"]).toEqual({ from: undefined, to: 123 });
  });

  test("compares empty objects", () => {
    const a = {};
    const b = {};

    const result = diff(a, b) as DiffResult;
    expect(result.added).toEqual({});
    expect(result.removed).toEqual({});
    expect(result.changed).toEqual({});
    expect(result.unchanged).toEqual({});
  });

  test("detects array length changes", () => {
    const a = { arr: [1, 2] };
    const b = { arr: [1, 2, 3] };

    const result = diff(a, b) as DiffResult;
    expect(result.changed).toHaveProperty("arr");
    const arrDiff = result.changed["arr"] as any;
    expect(arrDiff.added).toEqual([3]);
    expect(arrDiff.removed).toEqual([]);
    expect(arrDiff.changed).toEqual([]);
    expect(arrDiff.unchanged).toEqual([1, 2]);
  });

  test("detects nested empty object to non-empty object", () => {
    const a = { settings: {} };
    const b = { settings: { enabled: true } };

    const result = diff(a, b) as DiffResult;
    expect(result.changed).toHaveProperty("settings");
    const settingsDiff = result.changed["settings"] as DiffResult;
    expect(settingsDiff.added).toEqual({ enabled: true });
    expect(settingsDiff.removed).toEqual({});
    expect(settingsDiff.changed).toEqual({});
    expect(settingsDiff.unchanged).toEqual({});
  });

  test("detects nested array of objects with changes", () => {
    const a = {
      items: [
        { id: 1, val: "a" },
        { id: 2, val: "b" },
      ],
    };
    const b = {
      items: [
        { id: 1, val: "a" },
        { id: 2, val: "c" },
      ],
    };

    const result = diff(a, b) as DiffResult;
    expect(result.changed).toHaveProperty("items");
    const itemsDiff = result.changed["items"] as any;
    expect(itemsDiff.changed).toContainEqual({ index: 1, from: { id: 2, val: "b" }, to: { id: 2, val: "c" } });
  });

  test("detects nested removal", () => {
    const a = { user: { name: "Alice", age: 30 } };
    const b = { user: { name: "Alice" } };

    const result = diff(a, b) as DiffResult;
    const userDiff = result.changed["user"] as DiffResult;
    expect(userDiff.removed).toEqual({ age: 30 });
  });

  test("detects nested addition", () => {
    const a = { user: { name: "Alice" } };
    const b = { user: { name: "Alice", age: 30 } };

    const result = diff(a, b) as DiffResult;
    const userDiff = result.changed["user"] as DiffResult;
    expect(userDiff.added).toEqual({ age: 30 });
  });

  test("detects type change: object to primitive", () => {
    const a = { foo: { bar: 1 } };
    const b = { foo: 42 };

    const result = diff(a, b) as DiffResult;
    expect(result.changed["foo"]).toEqual({ from: { bar: 1 }, to: 42 });
  });

  test("detects type change: array to object", () => {
    const a = { foo: [1, 2, 3] };
    const b = { foo: { bar: 1 } };

    const result = diff(a, b) as DiffResult;
    expect(result.changed["foo"]).toEqual({ from: [1, 2, 3], to: { bar: 1 } });
  });

  test("detects type change: primitive to array", () => {
    const a = { foo: 1 };
    const b = { foo: [1] };

    const result = diff(a, b) as DiffResult;
    expect(result.changed["foo"]).toEqual({ from: 1, to: [1] });
  });

  test("compares null and undefined at root", () => {
    const a = null as any;
    const b = undefined as any;

    const result = diff({ a }, { a: b }) as DiffResult;
    expect(result.changed["a"]).toEqual({ from: null, to: undefined });
  });

  test("compares arrays with different types", () => {
    const a = { arr: [1, "a", true] };
    const b = { arr: [1, "b", false] };

    const result = diff(a, b) as DiffResult;
    const arrDiff = result.changed["arr"] as any;
    expect(arrDiff.changed).toContainEqual({ index: 1, from: "a", to: "b" });
    expect(arrDiff.changed).toContainEqual({ index: 2, from: true, to: false });
  });

  test("unchanged nested arrays/objects", () => {
    const a = { arr: [{ x: 1 }, { y: 2 }], obj: { foo: "bar" } };
    const b = { arr: [{ x: 1 }, { y: 2 }], obj: { foo: "bar" } };

    const result = diff(a, b) as DiffResult;
    expect(result).toEqual({
      added: {},
      changed: {
        obj: {
          added: {},
          changed: {},
          removed: {},
          unchanged: {},
        },
      },
      removed: {},
      unchanged: {
        arr: [
          {
            x: 1,
          },
          {
            y: 2,
          },
        ],
      },
    });
  });
});
