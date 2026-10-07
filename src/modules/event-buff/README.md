# Event Buffs

Which buff sources apply in each of 14 game modes. Use it to check whether a buff, such as pet
skills or the facility buff, counts in a mode like Bear Hunt or Canyon Clash.

## Usage

```ts
import { eventBuff } from "whiteout-survival-data";

// Modes where facility buffs fully apply
const facilityModes = eventBuff().appliesFor("facilityBuff").get();

// Modes where March Accelerator applies only in part
const partial = eventBuff().appliesFor("marchAccelerator", "partial").get();

// One mode, with its footnote
const bearHunt = eventBuff().findByName("Bear Hunt");
console.log(bearHunt?.petSkills, bearHunt?.notes);
```

## Query methods

| Method                                   | Returns     | Description                                             |
| ---------------------------------------- | ----------- | ------------------------------------------------------- |
| `appliesFor(buffSource, applicability?)` | event query | Modes where one buff source has the given applicability |

`applicability` is `'yes'`, `'no'`, or `'partial'`. The default is `'yes'`. `buffSource` is one of
the 11 buff fields of an entry. The terminal methods `get`, `first`, `find`, `findByName`, `search`,
and `count` are described in [How It Works](../../../README.md#how-it-works).

## Data

The module holds 14 entries from `data/event-buff.json`, one for each game mode: Bear Hunt, Crazy
Joe, Alliance Championship, Foundry Battle, Canyon Clash, Fortress Battle, Facility, Castle Battle,
Tundra Trade Route, Frostfire Mine, Frostdragon Tyrant, Tundra Arms League, Icefire Warhymn League,
and Winter Siege.

Each entry has 11 buff fields, all of type `BuffApplicability`: `cityBonusWarsBuffs`,
`deploymentCapacity`, `petSkills`, `daybreakIsland`, `presidentSkills`, `ministerBuff`,
`territoryBonuses`, `facilityBuff`, `marchAccelerator`, `frostdragonTyrantTitles`, and
`frostSphereDomainBonus`. `petSkillsAutoApplied` is `true` where pet skills take effect without the
player activating them. `notes` holds the footnote of the source image and is absent for modes with
no caveat.

## Notes

The data comes from a user-provided "Applicable Buff List" screenshot, not from a wiki page. The
screenshot is a matrix of 11 buff sources and 14 game modes.

The module is not nested under `alliance/`, because most of the buff sources (pet skills, president
skills, Frostdragon Tyrant, Frost Sphere) belong to other systems.

Several cells in the screenshot show a warning icon, for example "March Accelerator: not applicable
for rally". The value `'partial'` keeps that case apart from a plain yes or no. The `notes` text is
copied verbatim from the footnotes of the screenshot.

`petSkillsAutoApplied` is `true` for Alliance Championship, Icefire Warhymn League, and Winter
Siege.

Pet skills, Daybreak Island, and the facility buff are never marked `'no'` in any mode. This
includes the two PvP league modes, Icefire Warhymn League and Winter Siege, which deny almost every
other source.
