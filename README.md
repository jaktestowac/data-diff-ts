# data-diff-ts

> Lightweight TypeScript utility for comparing objects and arrays.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## ✨ Features

- 🔎 Deep diff between objects
- ✅ Detects added, removed, changed, unchanged
- 🧠 Designed for testing, debugging, automation
- 🌱 Zero dependencies

---

## 📦 Install

```bash
npm install data-diff-ts
```

## 📦 Usage

### Basic Object Diff

```typescript
import { diff } from "data-diff-ts";

const a = { name: "Alice", age: 25 };
const b = { name: "Alicia", age: 25 };

const result = diff(a, b);

console.log(result);
/*
{
  added: {},
  removed: {},
  changed: {
    name: { from: 'Alice', to: 'Alicia' }
  },
  unchanged: {
    age: 25
  }
}
*/
```

### Flattened Output (dot notation)

```typescript
import { smartDiff } from "data-diff-ts";

const a = { user: { name: "Alice", email: "alice@example.com" } };
const b = { user: { name: "Alicia", email: "alice@example.com" } };

const flat = smartDiff(a, b, { flatten: true });

console.log(flat);
/*
{
  "user.name": { from: "Alice", to: "Alicia" }
}
*/

// Without flattening
const nested = smartDiff(a, b);

console.log(nested);
/*
{
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
}
*/
```

### Compare Arrays

```typescript
import { diffArrays } from "data-diff-ts";

const a = ["a", "b", "c"];
const b = ["a", "x", "c", "d"];

const result = diffArrays(a, b);

console.log(result);
/*
{
  added: ['d'],
  removed: [],
  changed: [
    { index: 1, from: 'b', to: 'x' }
  ],
  unchanged: ['a', 'c']
}
*/
```

### Deeply Nested Structure

```typescript
import { smartDiff } from "data-diff-ts";

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

console.log(result);
/*
{
  "user.name": { from: "Alice", to: "Alicia" },
  "user.address.city": { from: "London", to: "Paris" },
  "user.address.zip": { from: "12345", to: "54321" }
}
*/
```

### Detect Object Differences in Arrays

```typescript
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

console.log(result);
/*
{
  "users[1].active": { from: false, to: true }
}
*/
```

## 📄 License

MIT © jaktestowac.pl

Powered by [jaktestowac.pl](https://www.jaktestowac.pl/) team!
