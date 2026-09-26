# Development Guide

This guide walks through the architecture, conventions, and step-by-step process for working with
this repository.

## Architecture Overview

```
src/
  index.ts                    # Re-exports all modules and types
  common/
    query-base.ts             # QueryBase<T> abstract base class
  types/
    index.ts                  # Re-exports all type files
    common.ts                 # Shared types (enums, unions, base interfaces)
    <module>.ts               # Per-module type definitions
  modules/
    <module>/
      index.ts                # Query class + factory function

data/
  <module>.json               # Flat JSON arrays of game data

images/
  <category>/                 # Bundled image assets, mirroring the paths in each entry's "img" field

sample/
  index.ts                    # Runs a handful of queries across every module

tests/
  helpers.ts                  # Shared QueryBase contract assertions
  index.test.ts               # Smoke test importing the top-level barrel
  modules/
    <module>.test.ts          # Per-module test file
```

## Query Builder Pattern

Every data module follows the same pattern built on `QueryBase<T>`:

### QueryBase provides 6 terminal methods

```ts
abstract class QueryBase<T extends { id: string; name: string }> {
  get(): T[]; // All results as array
  first(): T | undefined; // First result
  find(id: string): T | undefined; // Exact ID match
  findByName(name: string): T | undefined; // Case-insensitive name match
  search(query: string): T[]; // Case-insensitive partial name match
  count(): number; // Result count
}
```

### Rules

1. **Filter methods** return `new XxxQuery(filteredData)`. Never mutate.
2. **Sort methods** return `new XxxQuery(sortedData)`. Never mutate.
3. **Terminal methods** return data or primitives and end the chain.
4. The internal data const must not shadow the factory function name (e.g. `heroData`, not `heroes`)
5. Factory functions accept an optional `source` parameter for wrapping pre-filtered arrays

### Modules that don't fit the flat-list pattern

Some source data won't be a flat, filterable list (grouped tables, calendars, event schedules).
Follow the precedent set in `dinkum-data` and `stardew-valley-data`: use plain functions over the
grouped shape instead of forcing it through `QueryBase`, and document the exception in the module's
own README.

## Naming Conventions

| Thing               | Convention                       | Example                             |
| ------------------- | -------------------------------- | ----------------------------------- |
| Factory function    | Domain noun (camelCase)          | `heroes()`, `pets()`, `buildings()` |
| Query class         | PascalCase + `Query`             | `HeroQuery`, `PetQuery`             |
| Type interface      | PascalCase domain noun           | `Hero`, `Pet`, `Building`           |
| Data file           | kebab-case                       | `heroes.json`, `chief-gear.json`    |
| Type file           | kebab-case matching data file    | `hero.ts`, `chief-gear.ts`          |
| Module folder       | kebab-case matching data file    | `heroes/`, `chief-gear/`            |
| Internal data const | descriptive, avoids factory name | `heroData`, `chiefGearData`         |

## Import Conventions

```ts
// Within src/, use path aliases
import { QueryBase } from "@/common/query-base";
import data from "@/data/heroes.json";
import { Hero } from "@/types";
```

## Adding a New Data Module

### Step 1: Define the type

Create `src/types/<module>.ts` with an interface. `id` and `name` are required (the `QueryBase`
constraint). Add shared types (enums, unions, base interfaces) to `common.ts` if they don't already
exist.

Register in `src/types/index.ts`:

```ts
export * from "./<module>";
```

### Step 2: Create the data file

Create `data/<module>.json` as a flat JSON array. Image paths are relative to the package root and
must match the `images/` directory exactly (case-sensitive).

### Step 3: Create the query module

Create `src/modules/<module>/index.ts`:

```ts
import { QueryBase } from "@/common/query-base";
import data from "@/data/<module>.json";
import { Thing } from "@/types";

const thingData: Thing[] = data as Thing[];

/** Query builder for Thing data. All filter methods return a new ThingQuery for chaining. */
export class ThingQuery extends QueryBase<Thing> {
  constructor(data: Thing[] = thingData) {
    super(data);
  }
}

/** Returns a ThingQuery for all Thing data. Pass `source` to wrap a pre-filtered array. */
export function things(source: Thing[] = thingData): ThingQuery {
  return new ThingQuery(source);
}
```

**Key patterns:**

- Class-level JSDoc:
  `/** Query builder for X data. All filter and sort methods return a new XQuery for chaining. */`
- Factory JSDoc: `/** Returns an XQuery for all X data. Pass \`source\` to wrap a pre-filtered
  array. \*/`
- Filter/sort methods always spread `[...this.data]` before sorting
- Return `new ThingQuery(...)`, never `this`

### Step 4: Register the module export

Add to `src/index.ts`:

```ts
export * from "./modules/<module>";
```

### Step 5: Add images

Place image files under `images/`, mirroring the path used in each entry's `img` field.

### Step 6: Register in the sample script

Add the import and a couple of representative calls to `sample/index.ts`.

### Step 7: Write tests

Create `tests/modules/<module>.test.ts` using `testQueryBaseContract` from `tests/helpers.ts`, plus
tests for any module-specific filter/sort methods.

**Coverage notes:**

- `testQueryBaseContract` covers the shared `get`/`count`/`first`/`find`/`findByName`/`search`
  contract, so always call it first
- The class constructor's own default parameter is a separate branch from the factory function's
  default parameter; call `new ThingQuery()` directly with zero arguments to cover that branch
- Every sort method needs both `'asc'` and `'desc'` exercised
- Every optional-chaining filter (`?.`) needs a real dataset entry that has the field and one that
  doesn't

### Step 8: Format and validate

```bash
pnpm format          # Format all files
pnpm lint            # Type-check + ESLint
pnpm test:coverage   # Run test suite with the 100% coverage gate
pnpm sample          # Exercise queries end to end
```

## Checklist Summary

When adding a new module, make sure you've touched all of these:

- [ ] `src/types/<module>.ts`: type interface
- [ ] `src/types/index.ts`: re-export the type
- [ ] `data/<module>.json`: data file
- [ ] `src/modules/<module>/index.ts`: query class + factory
- [ ] `src/index.ts`: re-export the module
- [ ] `images/<category>/`: image assets
- [ ] `sample/index.ts`: a representative call or two
- [ ] `tests/modules/<module>.test.ts`: test file, including both constructor-default branches and
      both directions of every sort
- [ ] Run `pnpm format && pnpm lint && pnpm test:coverage && pnpm sample`

## Scripts Reference

| Command              | Description                            |
| -------------------- | -------------------------------------- |
| `pnpm build`         | Build with tsup (ESM + CJS + .d.ts)    |
| `pnpm dev`           | Build in watch mode                    |
| `pnpm lint`          | `tsc --noEmit && eslint .`             |
| `pnpm format`        | Prettier write (\*.ts, \*.md, \*.json) |
| `pnpm format:check`  | Prettier check (no write)              |
| `pnpm test`          | Jest test suite                        |
| `pnpm test:watch`    | Jest in watch mode                     |
| `pnpm test:coverage` | Jest with coverage report (100% gate)  |
| `pnpm sample`        | Run the sample script                  |
| `pnpm typecheck`     | TypeScript type-check only             |
