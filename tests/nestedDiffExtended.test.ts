import { describe, test, expect } from "vitest";
import { diff } from "../src/diff";
import { smartDiff } from "../src/smartDiff";
import type { DiffResult } from "../src/types";
import type { FlatDiff } from "../src/flattenedDiff";

describe("diff() and smartDiff() with deeply nested objects and arrays", () => {
  const a = {
    user: {
      name: "Alice",
      address: {
        city: "London",
        zip: "12345",
        coordinates: {
          lat: 51.5074,
          lon: -0.1278,
        },
      },
      roles: [
        { name: "admin", active: true },
        { name: "editor", active: false },
      ],
      preferences: {
        notifications: {
          email: true,
          sms: false,
        },
        theme: "light",
      },
    },
  };

  const b = {
    user: {
      name: "Alicia",
      address: {
        city: "Paris",
        zip: "54321",
        coordinates: {
          lat: 48.8566,
          lon: 2.3522,
        },
      },
      roles: [
        { name: "admin", active: true },
        { name: "editor", active: true },
      ],
      preferences: {
        notifications: {
          email: false,
          sms: false,
        },
        theme: "dark",
      },
    },
  };

  test("diff() returns deeply structured nested diff", () => {
    const result = diff(a, b) as DiffResult;
    const userDiff = result.changed["user"] as DiffResult;

    expect(userDiff.changed["name"]).toEqual({ from: "Alice", to: "Alicia" });

    const addressDiff = userDiff.changed["address"] as DiffResult;
    expect(addressDiff.changed["city"]).toEqual({ from: "London", to: "Paris" });
    expect(addressDiff.changed["zip"]).toEqual({ from: "12345", to: "54321" });

    const coordinatesDiff = addressDiff.changed["coordinates"] as DiffResult;
    expect(coordinatesDiff.changed["lat"]).toEqual({ from: 51.5074, to: 48.8566 });
    expect(coordinatesDiff.changed["lon"]).toEqual({ from: -0.1278, to: 2.3522 });

    const rolesDiff = userDiff.changed["roles"] as any;
    expect(rolesDiff.changed[1]).toEqual({
      index: 1,
      from: { name: "editor", active: false },
      to: { name: "editor", active: true },
    });

    const prefsDiff = userDiff.changed["preferences"] as DiffResult;
    const notifDiff = prefsDiff.changed["notifications"] as DiffResult;
    expect(notifDiff.changed["email"]).toEqual({ from: true, to: false });
    expect(prefsDiff.changed["theme"]).toEqual({ from: "light", to: "dark" });
  });

  test("smartDiff() returns flattened diff with deeply nested dot paths", () => {
    const result = smartDiff(a, b, { flatten: true }) as FlatDiff;

    expect(result).toEqual({
      "user.name": { from: "Alice", to: "Alicia" },
      "user.address.city": { from: "London", to: "Paris" },
      "user.address.zip": { from: "12345", to: "54321" },
      "user.address.coordinates.lat": { from: 51.5074, to: 48.8566 },
      "user.address.coordinates.lon": { from: -0.1278, to: 2.3522 },
      "user.roles[1].active": { from: false, to: true },
      "user.preferences.notifications.email": { from: true, to: false },
      "user.preferences.theme": { from: "light", to: "dark" },
    });
  });
});
