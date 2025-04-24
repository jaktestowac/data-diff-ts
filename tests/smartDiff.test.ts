import { test, expect } from "vitest";
import { smartDiff } from "../src";

test("returns structured DiffResult by default", () => {
  const a = { name: "Alice" };
  const b = { name: "Bob" };

  const result = smartDiff(a, b);
  expect(result).toHaveProperty("changed");
  expect(result).not.toHaveProperty("user.name");
});

test("returns flattened dot-path diff when flatten = true", () => {
  const a = { user: { name: "Alice" } };
  const b = { user: { name: "Alicia" } };

  const result = smartDiff(a, b, { flatten: true });

  expect(result).toEqual({
    "user.name": { from: "Alice", to: "Alicia" },
  });
});

test("handles null to value change in flatten mode", () => {
  const a = { avatar: null };
  const b = { avatar: "img.png" };

  const result = smartDiff(a, b, { flatten: true });
  expect(result).toEqual({
    avatar: { from: null, to: "img.png" },
  });
});

test("handles undefined to value change in flatten mode", () => {
  const a = { foo: undefined };
  const b = { foo: 123 };

  const result = smartDiff(a, b, { flatten: true });
  expect(result).toEqual({
    foo: { from: undefined, to: 123 },
  });
});

test("returns empty object for empty objects in flatten mode", () => {
  const a = {};
  const b = {};

  const result = smartDiff(a, b, { flatten: true });
  expect(result).toEqual({});
});

test("detects nested empty object to non-empty object in flatten mode", () => {
  const a = { settings: {} };
  const b = { settings: { enabled: true } };

  const result = smartDiff(a, b, { flatten: true });
  expect(result).toEqual({
    "settings.enabled": { from: undefined, to: true },
  });
});

test("detects array length changes in flatten mode", () => {
  const a = { arr: [1, 2] };
  const b = { arr: [1, 2, 3] };

  const result = smartDiff(a, b, { flatten: true });
  expect(result).toEqual({
    "arr[2]": { from: undefined, to: 3 },
  });
});

test("detects nested array of objects with changes in flatten mode", () => {
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

  const result = smartDiff(a, b, { flatten: true });
  expect(result).toEqual({
    "items[1].val": { from: "b", to: "c" },
  });
});
