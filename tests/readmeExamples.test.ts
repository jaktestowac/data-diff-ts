import { describe, test, expect } from "vitest";
import { diff, diffArrays, smartDiff } from "../src";

describe("README.md examples", () => {
  test("Basic Object Diff example", () => {
    const a = { name: "Alice", age: 25 };
    const b = { name: "Alicia", age: 25 };

    const result = diff(a, b);

    expect(result).toEqual({
      added: {},
      removed: {},
      changed: {
        name: { from: "Alice", to: "Alicia" },
      },
      unchanged: {
        age: 25,
      },
    });
  });

  test("Flattened Output example", () => {
    const a = { user: { name: "Alice", email: "alice@example.com" } };
    const b = { user: { name: "Alicia", email: "alice@example.com" } };

    const flat = smartDiff(a, b, { flatten: true });

    expect(flat).toEqual({
      "user.name": { from: "Alice", to: "Alicia" },
    });

    // Without flattening
    const nested = smartDiff(a, b);

    expect(nested).toEqual({
      added: {},
      changed: {
        user: {
          added: {},
          changed: {
            name: {
              from: "Alice",
              to: "Alicia",
            },
          },
          removed: {},
          unchanged: {
            email: "alice@example.com",
          },
        },
      },
      removed: {},
      unchanged: {},
    });
  });

  test("Compare Arrays example", () => {
    const a = ["a", "b", "c"];
    const b = ["a", "x", "c", "d"];

    const result = diffArrays(a, b);

    expect(result).toEqual({
      added: ["d"],
      removed: [],
      changed: [{ index: 1, from: "b", to: "x" }],
      unchanged: ["a", "c"],
    });
  });

  test("Deeply Nested Structure example", () => {
    const a = {
      user: {
        name: "Alice",
        address: {
          city: "London",
          zip: "12345",
        },
      },
    };

    const b = {
      user: {
        name: "Alicia",
        address: {
          city: "Paris",
          zip: "54321",
        },
      },
    };

    const result = smartDiff(a, b, { flatten: true });

    expect(result).toEqual({
      "user.name": { from: "Alice", to: "Alicia" },
      "user.address.city": { from: "London", to: "Paris" },
      "user.address.zip": { from: "12345", to: "54321" },
    });
  });

  test("Detect Object Differences in Arrays example", () => {
    const a = {
      users: [
        { name: "Alice", active: true },
        { name: "Bob", active: false },
      ],
    };

    const b = {
      users: [
        { name: "Alice", active: true },
        { name: "Bob", active: true },
      ],
    };

    const result = smartDiff(a, b, { flatten: true });

    expect(result).toEqual({
      "users[1].active": { from: false, to: true },
    });
  });
});
