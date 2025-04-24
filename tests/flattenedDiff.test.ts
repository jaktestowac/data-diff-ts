import { describe, test, expect } from "vitest";
import { diffFlattened } from "../src/flattenedDiff";
import type { FlatDiff } from "../src/flattenedDiff";

describe("diffFlattened()", () => {
  test("detects flat changes", () => {
    const a = { name: "Alice", age: 25 };
    const b = { name: "Alicia", age: 25 };

    const result: FlatDiff = diffFlattened(a, b);

    expect(result).toEqual({
      name: { from: "Alice", to: "Alicia" },
    });
  });

  test("detects nested object changes", () => {
    const a = { user: { city: "London", zip: "12345" } };
    const b = { user: { city: "Paris", zip: "12345" } };

    const result: FlatDiff = diffFlattened(a, b);

    expect(result).toEqual({
      "user.city": { from: "London", to: "Paris" },
    });
  });

  test("detects array item changes", () => {
    const a = { tags: ["qa", "test", "ci"] };
    const b = { tags: ["qa", "dev", "ci"] };

    const result: FlatDiff = diffFlattened(a, b);

    expect(result).toEqual({
      "tags[1]": { from: "test", to: "dev" },
    });
  });

  test("detects deep object inside array changes", () => {
    const a = {
      users: [{ name: "Alice" }, { name: "Bob" }],
    };
    const b = {
      users: [{ name: "Alicia" }, { name: "Bob" }],
    };

    const result: FlatDiff = diffFlattened(a, b);

    expect(result).toEqual({
      "users[0].name": { from: "Alice", to: "Alicia" },
    });
  });

  test("returns empty object when no changes", () => {
    const a = { version: 1, meta: { env: "prod" } };
    const b = { version: 1, meta: { env: "prod" } };

    const result: FlatDiff = diffFlattened(a, b);

    expect(result).toEqual({});
  });

  test("detects null to value change", () => {
    const a = { avatar: null };
    const b = { avatar: "img.png" };

    const result: FlatDiff = diffFlattened(a, b);
    expect(result).toEqual({
      avatar: { from: null, to: "img.png" },
    });
  });

  test("detects undefined to value change", () => {
    const a = { foo: undefined };
    const b = { foo: 123 };

    const result: FlatDiff = diffFlattened(a, b);
    expect(result).toEqual({
      foo: { from: undefined, to: 123 },
    });
  });

  test("returns empty object for empty objects", () => {
    const a = {};
    const b = {};

    const result: FlatDiff = diffFlattened(a, b);
    expect(result).toEqual({});
  });

  test("detects nested empty object to non-empty object", () => {
    const a = { settings: {} };
    const b = { settings: { enabled: true } };

    const result: FlatDiff = diffFlattened(a, b);
    expect(result).toEqual({
      "settings.enabled": { from: undefined, to: true },
    });
  });

  test("detects array length changes", () => {
    const a = { arr: [1, 2] };
    const b = { arr: [1, 2, 3] };

    const result: FlatDiff = diffFlattened(a, b);
    expect(result).toEqual({
      "arr[2]": { from: undefined, to: 3 },
    });
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

    const result: FlatDiff = diffFlattened(a, b);
    expect(result).toEqual({
      "items[1].val": { from: "b", to: "c" },
    });
  });

  test("detects nested removal", () => {
    const a = { user: { name: "Alice", age: 30 } };
    const b = { user: { name: "Alice" } };

    const result: FlatDiff = diffFlattened(a, b);
    expect(result).toEqual({
      "user.age": { from: 30, to: undefined },
    });
  });

  test("detects nested addition", () => {
    const a = { user: { name: "Alice" } };
    const b = { user: { name: "Alice", age: 30 } };

    const result: FlatDiff = diffFlattened(a, b);
    expect(result).toEqual({
      "user.age": { from: undefined, to: 30 },
    });
  });

  test("detects type change: object to primitive", () => {
    const a = { foo: { bar: 1 } };
    const b = { foo: 42 };

    const result: FlatDiff = diffFlattened(a, b);
    expect(result).toEqual({
      foo: { from: { bar: 1 }, to: 42 },
    });
  });

  test("detects type change: array to object", () => {
    const a = { foo: [1, 2, 3] };
    const b = { foo: { bar: 1 } };

    const result: FlatDiff = diffFlattened(a, b);
    expect(result).toEqual({
      foo: { from: [1, 2, 3], to: { bar: 1 } },
    });
  });

  test("detects type change: primitive to array", () => {
    const a = { foo: 1 };
    const b = { foo: [1] };

    const result: FlatDiff = diffFlattened(a, b);
    expect(result).toEqual({
      foo: { from: 1, to: [1] },
    });
  });

  test("compares null and undefined at root", () => {
    const a = { a: null };
    const b = { a: undefined };

    const result: FlatDiff = diffFlattened(a, b);
    expect(result).toEqual({
      a: { from: null, to: undefined },
    });
  });

  test("arrays with different types", () => {
    const a = { arr: [1, "a", true] };
    const b = { arr: [1, "b", false] };

    const result: FlatDiff = diffFlattened(a, b);
    expect(result).toEqual({
      "arr[1]": { from: "a", to: "b" },
      "arr[2]": { from: true, to: false },
    });
  });

  test("unchanged nested arrays/objects", () => {
    const a = { arr: [{ x: 1 }, { y: 2 }], obj: { foo: "bar" } };
    const b = { arr: [{ x: 1 }, { y: 2 }], obj: { foo: "bar" } };

    const result: FlatDiff = diffFlattened(a, b);
    expect(result).toEqual({});
  });
});
