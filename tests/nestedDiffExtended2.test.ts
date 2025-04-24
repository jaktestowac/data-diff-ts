import { describe, test, expect } from "vitest";
import { smartDiff } from "../src/smartDiff";
import type { FlatDiff } from "../src/flattenedDiff";

describe("Nested Structure Tests", () => {
  test("mixed primitive types in nested structure", () => {
    const a = {
      stats: {
        count: 42,
        isActive: true,
        label: "test",
      },
    };
    const b = {
      stats: {
        count: 50,
        isActive: true,
        label: "prod",
      },
    };

    const result = smartDiff(a, b, { flatten: true }) as FlatDiff;

    expect(result).toEqual({
      "stats.count": { from: 42, to: 50 },
      "stats.label": { from: "test", to: "prod" },
    });
  });

  test("nested arrays containing objects", () => {
    const a = {
      data: {
        items: [
          { id: 1, value: "one" },
          { id: 2, value: "two" },
        ],
      },
    };
    const b = {
      data: {
        items: [
          { id: 1, value: "one" },
          { id: 2, value: "modified" },
        ],
      },
    };

    const result = smartDiff(a, b, { flatten: true }) as FlatDiff;

    expect(result).toEqual({
      "data.items[1].value": { from: "two", to: "modified" },
    });
  });

  test("deeply nested object with null values", () => {
    const a = {
      user: {
        profile: {
          avatar: null,
          settings: {
            theme: "dark",
          },
        },
      },
    };
    const b = {
      user: {
        profile: {
          avatar: "profile.jpg",
          settings: {
            theme: "light",
          },
        },
      },
    };

    const result = smartDiff(a, b, { flatten: true }) as FlatDiff;

    expect(result).toEqual({
      "user.profile.avatar": { from: null, to: "profile.jpg" },
      "user.profile.settings.theme": { from: "dark", to: "light" },
    });
  });

  test("nested properties with empty objects", () => {
    const a = {
      settings: {
        general: {},
        advanced: { debug: false },
      },
    };
    const b = {
      settings: {
        general: { enabled: true },
        advanced: { debug: true },
      },
    };

    const result = smartDiff(a, b, { flatten: true }) as FlatDiff;

    expect(result).toEqual({
      "settings.general.enabled": { from: undefined, to: true },
      "settings.advanced.debug": { from: false, to: true },
    });
  });

  test("array of arrays with changes", () => {
    const a = {
      matrix: [
        [1, 2],
        [3, 4],
      ],
    };
    const b = {
      matrix: [
        [1, 2],
        [3, 5],
      ],
    };

    const result = smartDiff(a, b, { flatten: true }) as FlatDiff;

    expect(result).toEqual({
      "matrix[1][1]": { from: 4, to: 5 },
    });
  });

  test("objects with arrays at multiple levels", () => {
    const a = {
      level1: {
        tags: ["a", "b"],
        level2: {
          items: [
            { id: 1, tags: ["x", "y"] },
            { id: 2, tags: ["z"] },
          ],
        },
      },
    };
    const b = {
      level1: {
        tags: ["a", "c"],
        level2: {
          items: [
            { id: 1, tags: ["x", "y"] },
            { id: 2, tags: ["z", "new"] },
          ],
        },
      },
    };

    const result = smartDiff(a, b, { flatten: true }) as FlatDiff;

    expect(result).toEqual({
      "level1.tags[1]": { from: "b", to: "c" },
      "level1.level2.items[1].tags[1]": { from: undefined, to: "new" },
    });
  });

  test("deeply nested mixed structure", () => {
    const a = {
      company: {
        departments: [
          {
            name: "Engineering",
            teams: [
              {
                name: "Frontend",
                members: [{ id: 1, role: "dev" }],
              },
            ],
          },
        ],
      },
    };
    const b = {
      company: {
        departments: [
          {
            name: "Engineering",
            teams: [
              {
                name: "Frontend",
                members: [{ id: 1, role: "lead" }],
              },
            ],
          },
        ],
      },
    };

    const result = smartDiff(a, b, { flatten: true }) as FlatDiff;

    expect(result).toEqual({
      "company.departments[0].teams[0].members[0].role": { from: "dev", to: "lead" },
    });
  });
});
