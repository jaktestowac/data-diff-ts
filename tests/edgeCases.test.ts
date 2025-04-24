import { describe, test, expect } from "vitest";
import { smartDiff } from "../src/smartDiff";
import type { FlatDiff } from "../src/flattenedDiff";

describe("Edge Cases for data-diff-ts", () => {
  test("diffing empty array vs empty object", () => {
    const a = { data: [] };
    const b = { data: {} };

    const result = smartDiff(a, b, { flatten: true }) as FlatDiff;
    expect(result).toEqual({
      data: { from: [], to: {} },
    });
  });

  test("handling mixed primitives and objects", () => {
    const a = {
      mixed: [1, "string", { key: "value" }, true, null],
    };

    const b = {
      mixed: [1, "string", { key: "changed" }, false, undefined],
    };

    const result = smartDiff(a, b, { flatten: true }) as FlatDiff;
    expect(result).toEqual({
      "mixed[2].key": { from: "value", to: "changed" },
      "mixed[3]": { from: true, to: false },
      "mixed[4]": { from: null, to: undefined },
    });
  });

  test("diffing objects with special JS objects like Date", () => {
    const dateA = new Date("2023-01-01");
    const dateB = new Date("2023-02-01");

    const a = { createdAt: dateA };
    const b = { createdAt: dateB };

    const result = smartDiff(a, b, { flatten: true }) as FlatDiff;
    expect(result).toEqual({});
  });

  test("diffing nested empty/non-empty arrays", () => {
    const a = {
      users: {
        admins: [],
        members: ["Alice", "Bob"],
      },
    };

    const b = {
      users: {
        admins: ["Charlie"],
        members: ["Alice"],
      },
    };

    const result = smartDiff(a, b, { flatten: true }) as FlatDiff;
    expect(result).toEqual({
      "users.admins[0]": { from: undefined, to: "Charlie" },
      "users.members[1]": { from: "Bob", to: undefined },
    });
  });

  test("diffing deeply nested complex structures", () => {
    const a = {
      org: {
        departments: [
          {
            name: "Engineering",
            teams: [
              {
                name: "Frontend",
                projects: [],
              },
            ],
          },
        ],
      },
    };

    const b = {
      org: {
        departments: [
          {
            name: "Engineering",
            teams: [
              {
                name: "Frontend",
                projects: [{ id: 1, status: "active" }],
              },
            ],
          },
        ],
      },
    };

    const result = smartDiff(a, b, { flatten: true }) as FlatDiff;
    expect(result).toEqual({
      "org.departments[0].teams[0].projects[0].id": {
        from: undefined,
        to: 1,
      },
      "org.departments[0].teams[0].projects[0].status": {
        from: undefined,
        to: "active",
      },
    });
  });

  test("handling array index structure changes", () => {
    const a = {
      items: [
        { type: "header", text: "Title" },
        { type: "paragraph", text: "Content" },
      ],
    };

    const b = {
      items: [
        { type: "paragraph", text: "Content" },
        { type: "header", text: "Title" },
      ],
    };

    const result = smartDiff(a, b, { flatten: true }) as FlatDiff;
    expect(result).toEqual({
      "items[0].type": { from: "header", to: "paragraph" },
      "items[0].text": { from: "Title", to: "Content" },
      "items[1].type": { from: "paragraph", to: "header" },
      "items[1].text": { from: "Content", to: "Title" },
    });
  });
});
