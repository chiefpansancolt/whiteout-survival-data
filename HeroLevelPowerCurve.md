# Hero Level Power – Spec for Claude Code

Sep 29, 2026 · @Christopher Pezza

Every hero's level power follows one shared 80-level curve: the gain at level L is the hero's
level-1 start power × base\[L\] / 250, so a new Mythic generation needs only its level-1 start
value.

## The formula

Level power is the same curve for every hero. Only the level-1 start value changes.

- **Gain at level L** (L = 1 to 80): `gain(L) = start × base[L] / 250`, where `base` is the array in
  the next section. Level 1 is the start value itself, because `base[1] = 250`.
- **Running total:** `total(L) = start × (base[1] + … + base[L]) / 250`. The base array sums to
  9,330, so `total(80) = start × 37.32`.
- **Integer math only:** compute `start * base[L] // 250` and assert the remainder is 0. Every start
  value so far is a multiple of 50, which keeps every result an exact integer.
- **Worked examples:** Epic at level 2 is 4000 × 55 / 250 = 880. Rare at level 80 is 3250 × 310 /
  250 = 4030. Mythic Gen 1 at level 80 total is 5000 × 37.32 = 186,600.

## Base curve

The array has 80 entries. Entry 0 is level 1, entry 79 is level 80. Copy it as-is: the dips at
levels 3, 19, 52 and 67 and the jump at level 80 were measured in game on Rare and Epic, so do not
smooth them.

```json
[
  250, 55, 50, 55, 60, 55, 60, 60, 60, 60, 65, 65, 65, 65, 65, 70, 70, 75, 70, 75, 75, 75, 80, 80,
  80, 85, 85, 85, 85, 90, 90, 90, 95, 95, 95, 100, 100, 100, 105, 105, 105, 110, 110, 110, 115, 115,
  120, 120, 120, 125, 130, 125, 130, 135, 135, 135, 140, 140, 145, 145, 150, 150, 155, 155, 155,
  165, 160, 165, 170, 170, 175, 175, 180, 185, 185, 185, 190, 195, 200, 310
]
```

Sanity checks: the array has 80 entries, sums to 9,330, and Rare (start 3250) gives a level-2 gain
of 715 and a level-80 gain of 4030.

## Heroes and start values

The multiplier is `start / 250`, the factor applied to each `base[L]` value. Rare #1 and Rare #2
were measured separately and are identical.

| Hero         | Level-1 start | Multiplier | Measured in game      | Level 80 total      |
| ------------ | ------------- | ---------- | --------------------- | ------------------- |
| Rare         | 3250          | 13         | Levels 1–80           | 121,290             |
| Epic         | 4000          | 16         | Levels 1–80           | 149,280             |
| Mythic Gen 1 | 5000          | 20         | Gains for levels 1–80 | 186,600             |
| Mythic Gen 2 | 6000          | 24         | Gains for levels 1–80 | 223,920             |
| Mythic Gen 3 | 7500          | 30         | Levels 1–22           | 279,900 (projected) |
| Mythic Gen 4 | 9250          | 37         | Levels 1–10           | 345,210 (projected) |
| Mythic Gen 5 | 11100         | 44.4       | Levels 1–11           | 414,252 (projected) |

Running totals every generated file should reproduce:

| Hero         | Level 10 | Level 20 | Level 40 | Level 60 | Level 80 |
| ------------ | -------- | -------- | -------- | -------- | -------- |
| Rare         | 9,945    | 18,850   | 42,185   | 74,815   | 121,290  |
| Epic         | 12,240   | 23,200   | 51,920   | 92,080   | 149,280  |
| Mythic Gen 1 | 15,300   | 29,000   | 64,900   | 115,100  | 186,600  |
| Mythic Gen 2 | 18,360   | 34,800   | 77,880   | 138,120  | 223,920  |
| Mythic Gen 3 | 22,950   | 43,500   | 97,350   | 172,650  | 279,900  |
| Mythic Gen 4 | 28,305   | 53,650   | 120,065  | 212,935  | 345,210  |
| Mythic Gen 5 | 33,966   | 64,380   | 144,078  | 255,522  | 414,252  |

Start values rise roughly 20–25% per generation, but there is no clean formula behind that. Do not
extrapolate a Gen 6 start value. Gen 5 is the least certain: its multiplier of 44.4 gives gains such
as 2,442 and 2,886 that are not multiples of 5, so a small rounding difference in game is possible.

## Task for Claude Code

1. **Read the existing hero JSON first.** Match its schema, key names and number format exactly. Do
   not invent a new shape. Each level needs whatever fields the file already uses for gain and
   running total.
2. **Write one generator** that takes a start value and the base array and returns the 80 gains and
   80 running totals using integer math. Fail loudly on a non-integer result.
3. **Fill Rare (start 3250) and Epic (start 4000)** with it.
4. **Verify against the checkpoint table** in the previous section. Any mismatch is a bug in the
   generator or the base array, so stop and report it.
5. **Add Mythic Gens 1–5** with the start values from the table using the same generator. Mark Gens
   3–5 as projected if the schema has a field for that.

### Adding a new Mythic generation later

Only the level-1 start value is needed, and it should be a multiple of 50. The first few in-game
gains are a check, not an input. For any start, the expected gains are:

| Level | Expected gain |
| ----- | ------------- |
| 2     | start × 0.22  |
| 3     | start × 0.20  |
| 4     | start × 0.22  |
| 5     | start × 0.24  |

If the in-game gains for levels 2–5 match, generate the full 80 levels. If they do not, report the
mismatch and do not generate silently, because that would mean the curve changed for that
generation.
