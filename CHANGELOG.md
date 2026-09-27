# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `buildings()`: first data module, covering the Furnace's full 80-level upgrade progression —
  standard Levels 1–30 and the 50-entry Fire Crystal extension (`30-1..30-4`, `FC 1` through `FC 9`
  with their sub-levels, and `FC 10`). Sourced from `wostools.net` (table data) and
  `whiteoutsurvival.wiki` (images and cross-checks).
- Embassy added to the `buildings()` dataset, with the same 80-level shape as the Furnace. Every
  standard level requires the Furnace at a matching or higher level.

Initial repository scaffold: build tooling, lint/format config, test harness, and the shared
`QueryBase<T>` query builder.
