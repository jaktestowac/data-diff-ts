import { describe, test, expect } from "vitest";
import { diff } from "../src/diff";
import { smartDiff } from "../src/smartDiff";
import type { DiffResult } from "../src/types";
import type { FlatDiff } from "../src/flattenedDiff";

describe("diff() and smartDiff() with nested objects and arrays", () => {
  const a = {
    user: {
      name: "Alice",
      address: {
        city: "London",
        zip: "12345",
      },
      roles: [
        { name: "admin", active: true },
        { name: "editor", active: false },
      ],
    },
  };

  const b = {
    user: {
      name: "Alicia",
      address: {
        city: "London",
        zip: "54321",
      },
      roles: [
        { name: "admin", active: true },
        { name: "editor", active: true },
      ],
    },
  };

  test("diff() returns structured nested diff", () => {
    const result = diff(a, b) as DiffResult;

    expect(result.changed).toHaveProperty("user");

    const userDiff = result.changed["user"] as DiffResult;
    const addressDiff = userDiff.changed["address"] as DiffResult;

    expect(userDiff.changed).toHaveProperty("name");
    expect(userDiff.changed["name"]).toEqual({ from: "Alice", to: "Alicia" });

    expect(addressDiff.changed).toHaveProperty("zip");
    expect(addressDiff.changed["zip"]).toEqual({ from: "12345", to: "54321" });

    const rolesDiff = userDiff.changed["roles"] as any;
    expect(rolesDiff.changed[1]).toEqual({
      index: 1,
      from: { name: "editor", active: false },
      to: { name: "editor", active: true },
    });
  });

  test("smartDiff() returns flat diff with dot paths", () => {
    const result = smartDiff(a, b, { flatten: true }) as FlatDiff;

    expect(result).toEqual({
      "user.name": { from: "Alice", to: "Alicia" },
      "user.address.zip": { from: "12345", to: "54321" },
      "user.roles[1].active": { from: false, to: true },
    });
  });
});
