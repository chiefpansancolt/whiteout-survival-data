import { allianceFacility } from '@/modules/alliance/facility';
import { alliancePrestige } from '@/modules/alliance/prestige';
import { allianceTech } from '@/modules/alliance/tech';
import { buildings } from '@/modules/buildings';
import { castleAppointments } from '@/modules/castle-appointments';
import { chiefCharm } from '@/modules/chief-charm';
import {
  CHIEF_GEAR_SET_BONUS,
  chiefGear,
  chiefGearSetBonus,
  chiefGearSetBonuses,
  chiefGearSlots,
} from '@/modules/chief-gear';
import { chiefOrders } from '@/modules/chief-orders';
import { COLLECTION_MAX_LEVEL, collectionMedallionAt } from '@/modules/collection-reward-levels';
import { decoration, treeOfLife } from '@/modules/daybreak-island';
import { experts } from '@/modules/experts';
import { heroes } from '@/modules/heroes';
import { PET_REFINEMENT_STATS, pets } from '@/modules/pets';
import { presidentSkills } from '@/modules/president-skills';
import { research } from '@/modules/research';
import { skins } from '@/modules/skins';
import { tundraAlbum } from '@/modules/tundra-album';
import { vip } from '@/modules/vip';
import {
  BuffCalculation,
  BuffCategory,
  BuffGroup,
  BuffGroupId,
  BuffPet,
  BuffProfile,
  BuffSource,
  BuffSourceGroup,
  BuffSourceType,
  BuffUnit,
  BuildingLevel,
  Pet,
} from '@/types';

export const BUFF_VIP_MAX_LEVEL = 12;
export const BUFF_TREE_OF_LIFE_MAX_LEVEL = 10;
export const BUFF_EXPERT_MAX_AFFINITY_LEVEL = 100;
export const BUFF_COLLECTION_MAX_LEVEL = COLLECTION_MAX_LEVEL;
export const BUFF_EXPERT_ADVANCEMENT_INTERVAL = 10;
export const BUFF_CHARMS_PER_GEAR_SLOT = 3;
export const BUFF_STARTING_MARCH_QUEUE = 1;
export const BUFF_MARCH_QUEUE_PACK = 1;

const EXPERT_BUFFS: Record<string, { progression: string; statKeys: string[]; unit: BuffUnit }[]> =
  {
    'gareth|Porcupine': [
      { progression: "Troops' Defense", statKeys: ['troops-defense'], unit: 'percent' },
    ],
    'gareth|Undefeated Will': [
      { progression: "Troops' Health", statKeys: ['troops-health'], unit: 'percent' },
    ],
    'gareth|Fearsome Reputation': [
      { progression: 'Lethality Down', statKeys: ['enemy-lethality-reduction'], unit: 'percent' },
    ],
    'gareth|Rallying Cry': [
      { progression: 'Infirmary Capacity', statKeys: ['infirmary-capacity'], unit: 'flat' },
      { progression: 'Healing Speed', statKeys: ['healing-speed'], unit: 'percent' },
    ],
    'romulus|Last Line': [
      {
        progression: 'Troop Attack',
        statKeys: ['troops-attack', 'troops-defense'],
        unit: 'percent',
      },
    ],
    "romulus|Commander's Crest": [
      {
        progression: 'Deployment Capacity',
        statKeys: ['troops-deployment-capacity'],
        unit: 'flat',
      },
    ],
    'romulus|One Heart': [
      { progression: 'Rally Capacity', statKeys: ['rally-capacity'], unit: 'flat' },
    ],
    'romulus|Spirit of Aeetis': [
      {
        progression: 'Troop Lethality',
        statKeys: ['troops-lethality', 'troops-health'],
        unit: 'percent',
      },
    ],
    'agnes|Project Management': [
      { progression: 'Speed Boost (Hours)', statKeys: ['construction-speed-boost'], unit: 'hours' },
      { progression: 'Increases Research Speed', statKeys: ['research-speed'], unit: 'percent' },
    ],
  };

/** The expert skills and talents that give a stat that always applies. The other skills add nothing. */
export const BUFF_EXPERT_SKILLS: readonly { expertId: string; skill: string }[] = Object.keys(
  EXPERT_BUFFS,
).map((key) => {
  const [expertId, skill] = key.split('|');
  return { expertId, skill };
});

const TROOP_STATS = ['attack', 'defense', 'lethality', 'health'];
const TROOP_TYPES = ['troops', 'infantry', 'lancer', 'marksman'];

export const BUFF_GROUPS: readonly {
  id: BuffGroupId;
  name: string;
  /** The stat keys of the group in the order of the group. A stat that is not listed comes after them. */
  statKeys: readonly string[];
}[] = [
  {
    id: 'military',
    name: 'Military',
    statKeys: [
      'march-queue',
      'troops-deployment-capacity',
      'rally-capacity',
      'troops-march-speed',
      'wilderness-march-speed',
      'training-capacity',
      'training-speed',
      'healing-speed',
      ...TROOP_TYPES.flatMap((type) => TROOP_STATS.map((stat) => `${type}-${stat}`)),
      'infirmary-capacity',
      'reinforce-capacity',
      'troop-formation',
    ],
  },
  {
    id: 'resources',
    name: 'Resources',
    statKeys: [
      'meat-gathering-speed',
      'wood-gathering-speed',
      'coal-gathering-speed',
      'iron-gathering-speed',
    ],
  },
  {
    id: 'resource-output',
    name: 'Resource Output',
    statKeys: ['meat-output', 'wood-output', 'coal-output', 'iron-output'],
  },
  {
    id: 'growth',
    name: 'Growth',
    statKeys: [
      'construction-speed',
      'research-speed',
      'hunting-march-speed',
      'resource-consumption-reduction',
      'construction-speed-boost',
      'resource-production-speed',
      'storehouse-capacity',
    ],
  },
  { id: 'alliance', name: 'Alliance', statKeys: [] },
  { id: 'other', name: 'Other', statKeys: [] },
];

/**
 * Returns the group of a stat. The stats that the groups list belong to their group, and a stat
 * whose key starts with `alliance-` or `enemy-alliance-` belongs to `alliance`. Every other stat is
 * in `other`.
 */
const ALLIANCE_STAT_KEYS = ['ally-assists', 'ally-help-time', 'rally-governor-cap'];

export function buffGroupOf(statKey: string): BuffGroupId {
  const listed = BUFF_GROUPS.find((group) => group.statKeys.includes(statKey));
  if (listed) return listed.id;
  return ALLIANCE_STAT_KEYS.includes(statKey) || /^(enemy-)?alliance-/.test(statKey)
    ? 'alliance'
    : 'other';
}

interface BuffEntry {
  statKey: string;
  unit: BuffUnit;
  source: BuffSource;
}

const HERO_BUFF_STAT_KEYS: Record<string, string> = {
  'Training Speed': 'training-speed',
  'Research Speed': 'research-speed',
  'Healing Speed': 'healing-speed',
  'Building Upgrade Speed': 'construction-speed',
  'Gathering Speed (Iron)': 'iron-gathering-speed',
  'Gathering Speed (Wood)': 'wood-gathering-speed',
  'Gathering Speed (Coal)': 'coal-gathering-speed',
  'Gathering Speed (Meat)': 'meat-gathering-speed',
  'Mine Output (Iron)': 'iron-mine-output',
  'Mine Output (Coal)': 'coal-mine-output',
  'Sawmill Output': 'sawmill-output',
  "Hunter's Hut Output": 'hunters-hut-output',
  'March Speed (Hunting)': 'hunting-march-speed',
  'March Speed (Wilderness)': 'wilderness-march-speed',
  'Stamina Cost Reduction': 'stamina-cost-reduction',
  'Resource Consumption Reduction': 'resource-consumption-reduction',
};

/** These skills only apply while you use the hero, so they add nothing to the city total. */
export const BUFF_HERO_ONLY_SKILLS: readonly { heroId: string; skill: string }[] = [
  { heroId: 'smith', skill: 'Burnished Iron' },
  { heroId: 'eugene', skill: 'Woodland Inheritor' },
  { heroId: 'charlie', skill: 'Demolitions Expert' },
  { heroId: 'cloris', skill: 'Top Hunter' },
  { heroId: 'gina', skill: 'Endurance Training' },
  { heroId: 'gina', skill: 'Quick Paced' },
  { heroId: 'lumak-bokan', skill: 'Emerald Warrior' },
];

const isHeroOnlySkill = (heroId: string, skill: string): boolean =>
  BUFF_HERO_ONLY_SKILLS.some((s) => s.heroId === heroId && s.skill === skill);

const ALLIANCE_FACILITY_STAT_KEYS: Record<string, string> = {
  construction: 'construction-speed',
  defense: 'troops-defense',
  expedition: 'troops-march-speed',
  gathering: 'resource-gathering-speed',
  production: 'resource-production-speed',
  tech: 'research-speed',
  training: 'training-speed',
  weapons: 'troops-attack',
};

/** A stat that counts in each of the stats on its right. It has no category of its own. */
const GENERAL_STAT_KEYS: Record<string, string[]> = {
  'resource-gathering-speed': [
    'meat-gathering-speed',
    'wood-gathering-speed',
    'coal-gathering-speed',
    'iron-gathering-speed',
  ],
};

const FOUR_TROOP_STATS = ['troops-attack', 'troops-defense', 'troops-health', 'troops-lethality'];
const LETHALITY_AND_HEALTH = ['troops-lethality', 'troops-health'];

const ISLAND_STAT_KEYS: Record<string, string[]> = {
  'Troops’ Attack': ['troops-attack'],
  'Troops’ Defense': ['troops-defense'],
  'Troops Attack': ['troops-attack'],
  'Troops Defense': ['troops-defense'],
  'Troops Health': ['troops-health'],
  'Troops Lethality': ['troops-lethality'],
  'Troops’ Attack, Defense, Health, Lethality': FOUR_TROOP_STATS,
  'Troops’ Lethality & Health': LETHALITY_AND_HEALTH,
  "Troops' Lethality, Troops' Health": LETHALITY_AND_HEALTH,
  'Infantry Attack': ['infantry-attack'],
  'Infantry Defense': ['infantry-defense'],
  'Lancer Attack': ['lancer-attack'],
  'Lancer Defense': ['lancer-defense'],
  'Marksman Attack': ['marksman-attack'],
  'Marksman Defense': ['marksman-defense'],
  'Construction Speed': ['construction-speed'],
  'Research Speed': ['research-speed'],
  'Training Speed': ['training-speed'],
  'Healing Speed': ['healing-speed'],
  'Resource Gathering Speed': ['resource-gathering-speed'],
  'Iron Gathering Speed': ['iron-gathering-speed'],
  'Wood Gathering Speed': ['wood-gathering-speed'],
  'Coal Gathering Speed': ['coal-gathering-speed'],
  'Meat Gathering Speed': ['meat-gathering-speed'],
  'Hunting March Speed': ['hunting-march-speed'],
  'Troop March Speed': ['troops-march-speed'],
  'Troop Deployment Capacity': ['troops-deployment-capacity'],
  'Troops Deployment Capacity': ['troops-deployment-capacity'],
};

interface BuildingBuff {
  field: string;
  statKey: string;
  unit: BuffUnit;
}

const campBuffs = (): BuildingBuff[] => [
  { field: 'trainingCapacity', statKey: 'training-capacity', unit: 'flat' },
  { field: 'trainingSpeedBonusPercent', statKey: 'training-speed', unit: 'percent' },
];

export const BUFF_ENTERTAINMENT_BUILDINGS: readonly string[] = [
  'the-bakery',
  'the-vinyl-shop',
  'tea-milk-shop',
  'cinema',
  'cafe',
  'gym',
  'farm',
  'yoga-studio',
  'climbing-gym',
];

const entertainmentBuffs = (): Record<string, BuildingBuff[]> =>
  Object.fromEntries(
    BUFF_ENTERTAINMENT_BUILDINGS.map((id) => [
      id,
      [{ field: 'troopDeploymentCapacity', statKey: 'troops-deployment-capacity', unit: 'flat' }],
    ]),
  );

const BUILDING_BUFFS: Record<string, BuildingBuff[]> = {
  'research-center': [
    { field: 'researchSpeedBonusPercent', statKey: 'research-speed', unit: 'percent' },
  ],
  'war-academy': [
    { field: 'researchSpeedBonusPercent', statKey: 'research-speed', unit: 'percent' },
  ],
  embassy: [
    { field: 'allyAssists', statKey: 'ally-assists', unit: 'flat' },
    { field: 'allyHelpTimeSeconds', statKey: 'ally-help-time', unit: 'seconds' },
    { field: 'reinforceCapacity', statKey: 'reinforce-capacity', unit: 'flat' },
  ],
  'command-center': [
    { field: 'rallyCapacity', statKey: 'rally-capacity', unit: 'flat' },
    { field: 'marchCapacity', statKey: 'troops-deployment-capacity', unit: 'flat' },
  ],
  infirmary: [{ field: 'infirmaryCapacity', statKey: 'infirmary-capacity', unit: 'flat' }],
  storehouse: [{ field: 'storehouseCapacity', statKey: 'storehouse-capacity', unit: 'flat' }],
  'infantry-camp': campBuffs(),
  'lancer-camp': campBuffs(),
  'marksman-camp': campBuffs(),
  ...entertainmentBuffs(),
};

const NAME_EXCEPTIONS: Record<string, string> = {
  'hunters-hut-output': "Hunter's Hut Output",
};

const SOURCE_ORDER: BuffSourceType[] = [
  'account',
  'hero',
  'expert',
  'research',
  'allianceTech',
  'allianceFacility',
  'alliancePrestige',
  'vip',
  'building',
  'castleAppointment',
  'treeOfLife',
  'decoration',
  'pet',
  'skin',
  'tundraAlbum',
  'collection',
  'chiefGear',
  'chiefGearSet',
  'chiefCharm',
  'chiefOrder',
  'presidentSkill',
];

const SOURCE_GROUP_NAMES: Record<string, string> = {
  account: 'Account',
  hero: 'Heroes',
  expert: 'Experts',
  research: 'Research (Research Center)',
  warAcademyResearch: 'Research (War Academy)',
  allianceTech: 'Alliance Tech',
  allianceFacility: 'Alliance Facilities',
  alliancePrestige: 'Alliance Prestige Buildings',
  vip: 'VIP',
  building: 'Buildings',
  castleAppointment: 'Castle position',
  island: 'My Island',
  pet: 'Pets',
  skin: 'Skins',
  tundraAlbum: 'Tundra Album',
  collection: 'Collection',
  chiefGear: 'Chief Gear',
  chiefGearSet: 'Chief Gear set bonus',
  chiefCharm: 'Chief Charms',
  chiefOrder: 'Chief Orders',
  presidentSkill: 'President skills',
};

function sourceGroupIdOf(source: BuffSource): string {
  if (source.type === 'treeOfLife' || source.type === 'decoration') return 'island';
  const warAcademy =
    source.type === 'research' && research().find(source.id)?.queue === 'warAcademy';
  return warAcademy ? 'warAcademyResearch' : source.type;
}

function bySource(groups: BuffGroup[]): BuffSourceGroup[] {
  const categories = groups.flatMap((group) => group.categories);
  return Object.entries(SOURCE_GROUP_NAMES)
    .map(([id, name]) => ({
      id,
      name,
      stats: categories.flatMap((category) => {
        const mine = category.sources.filter((source) => sourceGroupIdOf(source) === id);
        if (mine.length === 0) return [];
        const total = round(mine.reduce((sum, source) => sum + source.amount, 0));
        return [{ statKey: category.statKey, name: category.name, unit: category.unit, total }];
      }),
    }))
    .filter((sourceGroup) => sourceGroup.stats.length > 0);
}

function categoryName(statKey: string): string {
  return (
    NAME_EXCEPTIONS[statKey] ??
    statKey
      .split('-')
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(' ')
  );
}

function checkLevel(name: string, level: number, max: number): void {
  if (!Number.isInteger(level) || level < 0 || level > max) {
    throw new RangeError(`${name} must be a whole number from 0 to ${max}`);
  }
}

function found<T>(kind: string, id: string, entry: T | undefined): T {
  if (entry === undefined) throw new Error(`Unknown ${kind}: ${id}`);
  return entry;
}

function entry(
  type: BuffSourceType,
  id: string,
  label: string,
  statKey: string,
  unit: BuffUnit,
  amount: number,
): BuffEntry {
  return { statKey, unit, source: { type, id, label, amount } };
}

function heroEntries(profile: BuffProfile): BuffEntry[] {
  return (profile.heroSkills ?? []).flatMap(({ heroId, skills }) => {
    const hero = found('hero', heroId, heroes().find(heroId));
    const allSkills = [
      ...hero.skills.exploration,
      ...hero.skills.expedition,
      ...(hero.skills.talent ? [hero.skills.talent] : []),
    ];
    return Object.entries(skills).flatMap(([skillName, level]) => {
      const skill = found(
        `skill of ${heroId}`,
        skillName,
        allSkills.find((s) => s.name === skillName),
      );
      checkLevel(`The level of ${skillName} of ${heroId}`, level, skill.levels.length);
      if (level === 0 || isHeroOnlySkill(hero.id, skill.name)) return [];
      const label = `Hero: ${hero.name}, Skill: ${skill.name} Lv ${level}`;
      return skill.levels[level - 1].effects
        .filter((effect) => effect.name in HERO_BUFF_STAT_KEYS)
        .map((effect) =>
          entry('hero', hero.id, label, HERO_BUFF_STAT_KEYS[effect.name], 'percent', effect.amount),
        );
    });
  });
}

function accountEntries(profile: BuffProfile): BuffEntry[] {
  const start = entry(
    'account',
    'starting-march-queue',
    'Account: Starting March Queue',
    'march-queue',
    'flat',
    BUFF_STARTING_MARCH_QUEUE,
  );
  if (!profile.marchQueuePack) return [start];
  return [
    start,
    entry(
      'account',
      'march-queue-pack',
      'Account: March Queue pack',
      'march-queue',
      'flat',
      BUFF_MARCH_QUEUE_PACK,
    ),
  ];
}

function expertEntries(profile: BuffProfile): BuffEntry[] {
  return (profile.experts ?? []).flatMap(({ expertId, skills }) => {
    const expert = found('expert', expertId, experts().find(expertId));
    const all = [...expert.skills, expert.talent];
    return Object.entries(skills).flatMap(([skillName, level]) => {
      const skill = found(
        `skill of ${expertId}`,
        skillName,
        all.find((s) => s.name === skillName),
      );
      checkLevel(`The level of ${skillName} of ${expertId}`, level, skill.maxLevel);
      if (level === 0) return [];
      const kind = skill === expert.talent ? 'Talent' : 'Skill';
      const label = `Expert: ${expert.name}, ${kind}: ${skill.name} Lv ${level}`;
      return (EXPERT_BUFFS[`${expertId}|${skillName}`] ?? []).flatMap((buff) => {
        const amount = skill.progressions.find((p) => p.label === buff.progression)!.values[
          level - 1
        ];
        return buff.statKeys.map((statKey) =>
          entry('expert', expertId, label, statKey, buff.unit, amount),
        );
      });
    });
  });
}

function expertAffinityEntries(profile: BuffProfile): BuffEntry[] {
  return Object.entries(profile.expertAffinity ?? {}).flatMap(([expertId, affinity]) => {
    const expert = found('expert', expertId, experts().find(expertId));
    const { level, advanced = false } = affinity;
    checkLevel(`The affinity level of ${expertId}`, level, BUFF_EXPERT_MAX_AFFINITY_LEVEL);
    if (level === 0) return [];
    const awaitsAdvancement = level % BUFF_EXPERT_ADVANCEMENT_INTERVAL === 0 && !advanced;
    const { statBonus } = expert.affinityLevels[(awaitsAdvancement ? level - 1 : level) - 1];
    if (statBonus === undefined) {
      throw new Error(
        `The stat bonus of ${expertId} at affinity level ${level} is not in the data yet`,
      );
    }
    const label = `Expert: ${expert.name}, Affinity Lv ${level}${awaitsAdvancement ? ', not advanced' : ''}`;
    return expert.baseBonuses.map((bonus) =>
      entry('expert', expertId, label, bonus.statKey, bonus.unit as BuffUnit, statBonus),
    );
  });
}

function researchEntries(profile: BuffProfile): BuffEntry[] {
  return Object.entries(profile.researchLevels ?? {}).flatMap(([id, level]) => {
    const node = found('research node', id, research().find(id));
    checkLevel(`The research level of ${id}`, level, node.levels.length);
    if (level === 0) return [];
    return node.levels[level - 1].bonus
      .filter((bonus) => bonus.statKey !== undefined)
      .map((bonus) =>
        entry(
          'research',
          id,
          `Research: ${node.name} Lv ${level}`,
          bonus.statKey!,
          bonus.unit as BuffUnit,
          bonus.totalAmount!,
        ),
      );
  });
}

function allianceTechEntries(profile: BuffProfile): BuffEntry[] {
  return Object.entries(profile.allianceTech ?? {}).flatMap(([id, level]) => {
    const node = found('Alliance Tech node', id, allianceTech().find(id));
    checkLevel(`The Alliance Tech level of ${id}`, level, node.levels.length);
    if (level === 0 || node.statKey === undefined) return [];
    const { amount, unit } = node.levels[level - 1];
    return [
      entry(
        'allianceTech',
        id,
        `Alliance Tech: ${node.name} Lv ${level}`,
        node.statKey,
        unit as BuffUnit,
        amount as number,
      ),
    ];
  });
}

function allianceFacilityEntries(profile: BuffProfile): BuffEntry[] {
  return Object.entries(profile.allianceFacilities ?? {}).flatMap(([id, levels]) => {
    const facility = found('Alliance Facility', id, allianceFacility().find(id));
    const held = facility.levels.filter((l) => levels.includes(l.level));
    if (levels.length !== new Set(levels).size) {
      throw new RangeError(`The Alliance Facility ${id} can hold each level once`);
    }
    if (held.length !== levels.length) {
      const valid = facility.levels.map((l) => l.level).join(', ');
      throw new RangeError(`The levels of the Alliance Facility ${id} must be from ${valid}`);
    }
    return held.map((row) =>
      entry(
        'allianceFacility',
        id,
        `Alliance Facility: ${facility.name} Lv ${row.level}`,
        ALLIANCE_FACILITY_STAT_KEYS[id],
        'percent',
        row.boosterPercent,
      ),
    );
  });
}

function alliancePrestigeEntries(profile: BuffProfile): BuffEntry[] {
  return Object.entries(profile.alliancePrestige ?? {}).flatMap(([id, tier]) => {
    const building = found('Alliance Prestige Building', id, alliancePrestige().find(id));
    const level = building.levels.find((l) => l.name === tier);
    if (level === undefined) {
      const tiers = building.levels.map((l) => l.name).join(', ');
      throw new RangeError(
        `The tier of the Alliance Prestige Building ${id} must be one of ${tiers}`,
      );
    }
    return level.bonuses.map((bonus) =>
      entry(
        'alliancePrestige',
        id,
        `Alliance Prestige: ${building.name} ${tier}`,
        bonus.statKey,
        bonus.unit as BuffUnit,
        bonus.amount,
      ),
    );
  });
}

function vipEntries(profile: BuffProfile): BuffEntry[] {
  const level = profile.vipLevel ?? 0;
  checkLevel('vipLevel', level, BUFF_VIP_MAX_LEVEL);
  if (level === 0) return [];
  return vip()
    .find(`vip-${level}`)!
    .bonuses.map((bonus) =>
      entry(
        'vip',
        `vip-${level}`,
        `VIP ${level}`,
        bonus.statKey,
        bonus.unit as BuffUnit,
        bonus.amount,
      ),
    );
}

/** A Fire Crystal sub-level has no stats of its own. It keeps the stats of the full level before it. */
function fullLevelOf(levels: BuildingLevel[], level: BuildingLevel): BuildingLevel {
  const before = levels.filter((l) => l.order <= level.order && l.fcSubLevel === undefined);
  return before[before.length - 1];
}

function buildingEntries(profile: BuffProfile): BuffEntry[] {
  return Object.entries(profile.buildingLevels ?? {}).flatMap(([id, label]) => {
    const building = found('building', id, buildings().find(id));
    const level = found(
      `level of ${id}`,
      label,
      building.levels.find((l) => l.label === label),
    );
    const fields = level as unknown as Record<string, number>;
    const fullLevelFields = fullLevelOf(building.levels, level) as unknown as Record<
      string,
      number
    >;
    return (BUILDING_BUFFS[id] ?? []).map((buff) =>
      entry(
        'building',
        id,
        `Building: ${building.name} Lv ${label}`,
        buff.statKey,
        buff.unit,
        fields[buff.field] ?? fullLevelFields[buff.field],
      ),
    );
  });
}

function castleEntries(profile: BuffProfile): BuffEntry[] {
  if (profile.castleAppointment === undefined) return [];
  const position = found(
    'castle appointment',
    profile.castleAppointment,
    castleAppointments().find(profile.castleAppointment),
  );
  return position.bonuses.map((bonus) =>
    entry(
      'castleAppointment',
      position.id,
      `Castle: ${position.name}`,
      bonus.statKey,
      bonus.unit as BuffUnit,
      bonus.amount,
    ),
  );
}

function islandEntries(
  type: BuffSourceType,
  id: string,
  label: string,
  buff: { stat: string; amount: number; unit: string },
): BuffEntry[] {
  return (ISLAND_STAT_KEYS[buff.stat] ?? []).map((statKey) =>
    entry(type, id, label, statKey, buff.unit as BuffUnit, buff.amount),
  );
}

function treeOfLifeEntries(profile: BuffProfile): BuffEntry[] {
  const level = profile.treeOfLifeLevel ?? 0;
  checkLevel('treeOfLifeLevel', level, BUFF_TREE_OF_LIFE_MAX_LEVEL);
  return treeOfLife()
    .get()
    .filter((row) => row.level <= level)
    .flatMap((row) =>
      islandEntries('treeOfLife', row.id, `Tree of Life Lv ${row.level}`, row.buff),
    );
}

function decorationEntries(profile: BuffProfile): BuffEntry[] {
  return (profile.decorations ?? []).flatMap(({ id, level }) => {
    const item = found('decoration', id, decoration().find(id));
    const levels = item.levels ?? [];
    checkLevel(`The level of ${id}`, level, levels.length);
    if (level === 0) return [];
    return islandEntries(
      'decoration',
      id,
      `Decoration: ${item.name} Lv ${level}`,
      levels[level - 1].buff,
    );
  });
}

function petRefinementEntries(
  pet: Pet,
  refinement: NonNullable<BuffPet['refinement']>,
  label: string,
): BuffEntry[] {
  Object.keys(refinement).forEach((statKey) => {
    found(
      'pet refinement stat',
      statKey,
      PET_REFINEMENT_STATS.find((s) => s.statKey === statKey),
    );
  });
  return PET_REFINEMENT_STATS.flatMap(({ stat, statKey }) => {
    const value = refinement[statKey] ?? 0;
    if (!Number.isFinite(value) || value < 0 || value > pet.maxRefinementPercent) {
      throw new RangeError(
        `The ${statKey} refinement of ${pet.id} must be a number from 0 to ${pet.maxRefinementPercent}`,
      );
    }
    return value === 0
      ? []
      : [entry('pet', pet.id, `${label} Refinement ${stat}`, statKey, 'percent', value)];
  });
}

function petEntries(profile: BuffProfile): BuffEntry[] {
  return (profile.pets ?? []).flatMap(({ id, level, refined, refinement }) => {
    const pet = found('pet', id, pets().find(id));
    checkLevel(`The level of ${id}`, level, pet.maxLevel);
    if (level === 0) return [];
    const row = pet.levels[level - 1];
    const label = `Pet: ${pet.name}`;
    const valueOf = (stat: { value: number; refinedValue?: number }) =>
      refined && stat.refinedValue !== undefined ? stat.refinedValue : stat.value;
    return [
      entry(
        'pet',
        id,
        `${label} Lv ${level}`,
        'troops-attack',
        'percent',
        valueOf(row.troopAttack),
      ),
      entry(
        'pet',
        id,
        `${label} Lv ${level}`,
        'troops-defense',
        'percent',
        valueOf(row.troopDefense),
      ),
      ...petRefinementEntries(pet, refinement ?? {}, label),
    ];
  });
}

function chiefGearEntries(profile: BuffProfile): BuffEntry[] {
  const worn = Object.entries(profile.chiefGear ?? {}).map(([slotId, levelId]) => ({
    slot: found('Chief Gear slot', slotId, chiefGearSlots().find(slotId)),
    level: found('Chief Gear level', levelId, chiefGear().find(levelId)),
  }));
  const pieces = worn.flatMap(({ slot, level }) => {
    const type = slot.troopType.toLowerCase();
    const label = `Chief Gear: ${slot.name} ${level.name}`;
    return ['attack', 'defense'].map((stat) =>
      entry('chiefGear', slot.id, label, `${type}-${stat}`, 'percent', level.statTotalPercent),
    );
  });
  const set = chiefGearSetBonus(worn.map(({ level }) => level.id));
  const setBonuses = [set.threePiece, set.sixPiece]
    .filter((bonus) => bonus.tierId !== undefined)
    .flatMap((bonus) => {
      const tier = chiefGearSetBonuses().find(bonus.tierId!)!;
      const label = `Chief Gear Set: ${bonus.pieces} pieces ${tier.name}`;
      return CHIEF_GEAR_SET_BONUS.troopTypes.map((type) =>
        entry(
          'chiefGearSet',
          bonus.tierId!,
          label,
          `${type}-${bonus.stat.toLowerCase()}`,
          'percent',
          bonus.percent,
        ),
      );
    });
  return [...pieces, ...setBonuses];
}

function chiefCharmEntries(profile: BuffProfile): BuffEntry[] {
  return Object.entries(profile.chiefCharms ?? {}).flatMap(([slotId, levelIds]) => {
    const slot = found('Chief Gear slot', slotId, chiefGearSlots().find(slotId));
    if (levelIds.length > BUFF_CHARMS_PER_GEAR_SLOT) {
      throw new RangeError(
        `The ${slotId} slot can hold at most ${BUFF_CHARMS_PER_GEAR_SLOT} Chief Charms`,
      );
    }
    const type = slot.troopType.toLowerCase();
    return levelIds.flatMap((levelId) => {
      const level = found('Chief Charm level', levelId, chiefCharm().find(levelId));
      const label = `Chief Charm: ${slot.name} ${level.name}`;
      return ['lethality', 'health'].map((stat) =>
        entry('chiefCharm', slot.id, label, `${type}-${stat}`, 'percent', level.statTotalPercent),
      );
    });
  });
}

function skinEntries(profile: BuffProfile): BuffEntry[] {
  return (profile.skins ?? []).flatMap((id) => {
    const skin = found('skin', id, skins().find(id));
    if (skin.bonus === undefined) return [];
    return [
      entry(
        'skin',
        id,
        `Skin: ${skin.name}`,
        skin.bonus.statKey,
        skin.bonus.unit as BuffUnit,
        skin.bonus.amount,
      ),
    ];
  });
}

function tundraAlbumEntries(profile: BuffProfile): BuffEntry[] {
  return (profile.tundraAlbums ?? []).map((id) => {
    const album = found('Tundra Album', id, tundraAlbum().find(id));
    return entry(
      'tundraAlbum',
      id,
      `Tundra Album: ${album.name}`,
      album.buff.statKey,
      album.buff.unit as BuffUnit,
      album.buff.amount,
    );
  });
}

function collectionEntries(profile: BuffProfile): BuffEntry[] {
  const level = profile.collectionLevel ?? 0;
  checkLevel('collectionLevel', level, BUFF_COLLECTION_MAX_LEVEL);
  const medallion = collectionMedallionAt(level);
  if (medallion === undefined) return [];
  return medallion.buffs.map((buff) =>
    entry(
      'collection',
      medallion.id,
      `Collection: ${medallion.name}`,
      buff.statKey,
      buff.unit as BuffUnit,
      buff.amount,
    ),
  );
}

function chiefOrderEntries(profile: BuffProfile): BuffEntry[] {
  return (profile.chiefOrders ?? []).flatMap((id) => {
    const order = found('Chief Order', id, chiefOrders().find(id));
    if (order.bonus === undefined) return [];
    return [
      entry(
        'chiefOrder',
        id,
        `Chief Order: ${order.name}`,
        order.bonus.statKey,
        order.bonus.unit as BuffUnit,
        order.bonus.amount,
      ),
    ];
  });
}

function presidentSkillEntries(profile: BuffProfile): BuffEntry[] {
  return (profile.presidentSkills ?? []).flatMap((id) => {
    const skill = found('President skill', id, presidentSkills().find(id));
    if (skill.bonus === undefined) return [];
    return [
      entry(
        'presidentSkill',
        id,
        `President Skill: ${skill.name}`,
        skill.bonus.statKey,
        skill.bonus.unit as BuffUnit,
        skill.bonus.amount,
      ),
    ];
  });
}

const round = (value: number): number => Math.round(value * 10000) / 10000;

/**
 * Adds up the speed boosts and other buffs that the sources of a profile give, one category for
 * each stat and unit, with the list of sources of each. See `docs/buffs.md`.
 *
 * @param profile What you have: hero skill levels, research and Alliance Tech levels, the VIP level,
 * building levels, skins, decorations, the Tree of Life level, a castle position, active Chief
 * Orders and President skills, pets, completed Tundra Albums, and the collection level. A section that is left out adds nothing.
 * @throws Error when an id or a skill name is not in the data.
 * @throws RangeError when a level is not a whole number from 0 to the top level of the source.
 */
export function calculateBuffs(profile: BuffProfile = {}): BuffCalculation {
  const entries = [
    ...accountEntries(profile),
    ...heroEntries(profile),
    ...expertEntries(profile),
    ...expertAffinityEntries(profile),
    ...researchEntries(profile),
    ...allianceTechEntries(profile),
    ...allianceFacilityEntries(profile),
    ...alliancePrestigeEntries(profile),
    ...vipEntries(profile),
    ...buildingEntries(profile),
    ...castleEntries(profile),
    ...treeOfLifeEntries(profile),
    ...decorationEntries(profile),
    ...petEntries(profile),
    ...skinEntries(profile),
    ...tundraAlbumEntries(profile),
    ...collectionEntries(profile),
    ...chiefGearEntries(profile),
    ...chiefCharmEntries(profile),
    ...chiefOrderEntries(profile),
    ...presidentSkillEntries(profile),
  ]
    .sort((a, b) => SOURCE_ORDER.indexOf(a.source.type) - SOURCE_ORDER.indexOf(b.source.type))
    .flatMap((e) =>
      (GENERAL_STAT_KEYS[e.statKey] ?? [e.statKey]).map((statKey) => ({ ...e, statKey })),
    );

  const categories = new Map<string, BuffCategory>();
  for (const { statKey, unit, source } of entries) {
    const key = `${statKey}|${unit}`;
    const category = categories.get(key) ?? {
      statKey,
      group: buffGroupOf(statKey),
      name: categoryName(statKey),
      unit,
      total: 0,
      sources: [],
    };
    category.sources.push(source);
    category.total = round(category.total + source.amount);
    categories.set(key, category);
  }
  const sorted = [...categories.values()].sort(
    (a, b) => a.name.localeCompare(b.name) || a.unit.localeCompare(b.unit),
  );
  const groups: BuffGroup[] = BUFF_GROUPS.map((group) => {
    const rank = (category: BuffCategory) => {
      const index = group.statKeys.indexOf(category.statKey);
      return index < 0 ? group.statKeys.length : index;
    };
    return {
      id: group.id,
      name: group.name,
      categories: sorted
        .filter((category) => category.group === group.id)
        .sort((a, b) => rank(a) - rank(b)),
    };
  }).filter((group) => group.categories.length > 0);
  return { categories: sorted, groups, bySource: bySource(groups) };
}
