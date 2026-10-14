import { HeroGearMilestone, HeroGearSlot } from './hero-gear';

export type EventUsage = Record<string, Record<string, number>>;

export interface EventScoreLine {
  action: string;
  points: number;
  count: number;
  subtotal: number;
}

export interface EventScore {
  base: number;
  /** 0 when no expert is used or the bonus does not apply. */
  bonus: number;
  total: number;
}

export interface EventScoreDay extends EventScore {
  day: string;
  name: string;
  lines: EventScoreLine[];
}

export interface EventScoreCalculation {
  days: EventScoreDay[];
  event: EventScore;
}

export type SvsUsage = EventUsage;

export interface SvsCalculatorOptions {
  /** From 1 to 10. Leave out when Valeria is not used. */
  valeriaLevel?: number;
}

export type SvsLineResult = EventScoreLine;

export type SvsScore = EventScore;

export interface SvsDayResult extends EventScoreDay {
  phase: 'preparation' | 'battle';
}

export interface SvsCalculation {
  /** 0 when Valeria is not used. */
  valeriaBonusPercent: number;
  days: SvsDayResult[];
  preparation: EventScore;
  battle: EventScore;
  event: EventScore;
}

export interface AllianceShowdownCalculatorOptions {
  /** From 1 to 10. Leave out when Baldur is not used. */
  dawnHymnLevel?: number;
}

export interface AllianceShowdownCalculation extends EventScoreCalculation {
  /** 0 when Baldur is not used. */
  dawnHymnBonusPercent: number;
}

export interface UpgradeRange {
  from: string | null;
  to: string;
}

export interface UpgradeMaterial {
  itemId: string;
  amount: number;
}

export interface UpgradeEventPoints {
  svs: number;
  allianceShowdown: number;
  kingOfIcefield: number;
  hallOfChief: number;
}

export interface UpgradeResult {
  /** Includes the steps inside a level. */
  steps: number;
  materials: UpgradeMaterial[];
  score: number;
  /** The `powerTotal` of the last level minus the `powerTotal` of the first level, summed over all ranges. */
  power: number;
  eventPoints: UpgradeEventPoints;
}

export type TroopType = 'infantry' | 'lancer' | 'marksman';

/** Tiers are 1 to 12. */
export type TroopCampAction =
  { mode: 'training'; tier: number } | { mode: 'promotion'; fromTier: number; toTier: number };

export interface TroopRun {
  action: TroopCampAction;
  count: number | 'max';
  /** 1 or more. Defaults to 1. */
  batches?: number;
}

export interface TroopCampConfig {
  level: string;
  /** Leave out when the camp only adds its level to the shared capacity. */
  runs?: TroopRun[];
}

export interface TroopCalculatorInput {
  camps: Record<TroopType, TroopCampConfig>;
  researchCapacity?: number;
  /** Adds 200 capacity, or 300 for the supreme buff. */
  ministerOfEducation?: 'regular' | 'supreme';
  /** Multiplies the total capacity by 3. */
  capacityBoost?: boolean;
  /** In percent, as the game shows it, without the buffs below. Defaults to 0. */
  trainingSpeedPercent?: number;
  /** Adds 10% training speed, or 15% for the supreme buff. */
  vicePresident?: 'regular' | 'supreme';
  /** Adds 30% training speed. */
  mobilize?: boolean;
  /** Adds 20% training speed. */
  advancedTraining?: boolean;
  /** From 0 to 75. Defaults to 0. */
  costReductionPercent?: Partial<Record<TroopType, number>>;
}

export interface TroopCampResult {
  /** In order. `seconds` covers all batches of the run. */
  runs: { troopsPerBatch: number; batches: number; seconds: number }[];
  /** Before any speedups. */
  seconds: number;
}

export interface TroopTierRow {
  tier: number;
  infantry: number;
  lancer: number;
  marksman: number;
  total: number;
}

export interface TroopEventPoints {
  svs: number;
  allianceShowdown: number;
  kingOfIcefield: number;
  /** For one season. Both seasons give the same points. */
  hallOfChief: number;
}

export interface TroopCalculation {
  fireCrystalLevels: Record<TroopType, number>;
  tierPower: TroopTierRow[];
  totalPower: Omit<TroopTierRow, 'tier'>;
  /** All three camps share this capacity. */
  capacity: number;
  camps: Record<TroopType, TroopCampResult>;
  /** Promotion takes troops from the first tier and adds them to the second. */
  tiers: TroopTierRow[];
  totals: Omit<TroopTierRow, 'tier'>;
  /** The speed that the times use, with the buffs added. */
  trainingSpeedPercent: number;
  /** Promotion costs the difference between the two tiers. */
  resources: UpgradeMaterial[];
  /** The speedup time to finish all camps. */
  totalSeconds: number;
  /** The camps train at the same time. */
  longestCampSeconds: number;
  /** Rounded up. */
  speedupMinutesNeeded: number;
  speedupPointsPerMinute: { svs: number; allianceShowdown: number; kingOfIcefield: number };
  /** Training runs only. Promotion and power are not included. A tier with no scoring row gives 0. */
  eventPoints: TroopEventPoints;
}

/** Each tier of a research line is its own line with its own levels. */
export interface ResearchGoal {
  id: string;
  /** From 0 (not started) to the number of levels of the line. */
  current: number;
  goal: number;
}

export interface ResearchCalculatorOptions {
  /** In percent, as the game shows it, without the buffs below. Defaults to 0. */
  researchSpeedPercent?: number;
  /** Adds 10% research speed. */
  stateBuff?: boolean;
  /** Adds 10% research speed, or 15% for the supreme buff. */
  vicePresident?: 'regular' | 'supreme';
}

export interface ResearchItemResult {
  id: string;
  name: string;
  category: string;
  steps: number;
  resources: UpgradeMaterial[];
  power: number;
  /** Before the speed bonus. */
  baseSeconds: number;
}

/** A research level whose prerequisite is not met by the current or goal level of the other line. */
export interface UnmetResearchPrerequisite {
  id: string;
  level: number;
  requires: { id: string; level: number };
  /** The highest of the current and goal levels given for the required line. 0 when it is not given. */
  planned: number;
}

export interface ResearchEventPoints {
  /** Fire Crystal Shards. Speedups are not included. */
  svs: number;
  allianceShowdown: number;
  kingOfIcefield: number;
  hallOfChief: HallOfChiefPowerPoints[];
}

export interface ResearchCalculation {
  items: ResearchItemResult[];
  steps: number;
  resources: UpgradeMaterial[];
  power: number;
  /** Before the speed bonus. */
  baseSeconds: number;
  /** The speed that the time uses, with the buffs added. */
  researchSpeedPercent: number;
  /** Rounded down. */
  seconds: number;
  /** Their time counts as 0. */
  stepsWithoutTime: number;
  unmetPrerequisites: UnmetResearchPrerequisite[];
  /** As a level `label` of `buildings()`. */
  buildingRequirements: { id: string; level: string }[];
  /** Rounded up. */
  speedupMinutesNeeded: number;
  speedupPointsPerMinute: { svs: number; allianceShowdown: number; kingOfIcefield: number };
  eventPoints: ResearchEventPoints;
}

export interface PetGoal {
  id: string;
  /** From 1 to its max level. */
  current: number;
  goal: number;
  /** Valid only on a level that is a multiple of 10. */
  currentAdvanced?: boolean;
  /** Valid only on a level that is a multiple of 10. */
  goalAdvanced?: boolean;
}

export interface PetEventPoints {
  svs: number;
  allianceShowdown: number;
  kingOfIcefield: number;
}

export interface PetItemResult {
  id: string;
  name: string;
  levels: number;
  advancements: number;
  resources: UpgradeMaterial[];
  /** In percent. */
  troopAttack: number;
  /** In percent. */
  troopDefense: number;
  power: number;
  advancementScore: number;
  eventPoints: PetEventPoints;
}

export interface PetCalculation {
  items: PetItemResult[];
  levels: number;
  advancements: number;
  resources: UpgradeMaterial[];
  troopAttack: number;
  troopDefense: number;
  power: number;
  advancementScore: number;
  eventPoints: PetEventPoints;
}

export interface ExpertSkillGoal {
  name: string;
  /** From 1 to the max level of the skill. */
  current: number;
  goal: number;
}

export interface ExpertGoal {
  id: string;
  /** From 1 to 100. */
  level?: {
    current: number;
    goal: number;
    /** Valid only on a level that has an advancement cost. */
    currentAdvanced?: boolean;
    /** Valid only on a level that has an advancement cost. */
    goalAdvanced?: boolean;
  };
  skills?: ExpertSkillGoal[];
}

export interface ExpertLearningQueueOption {
  label: string;
  minutes: number;
  exp: number;
}

export interface ExpertItemResult {
  id: string;
  name: string;
  levels: number;
  advancements: number;
  /** For all skills. */
  skillLevels: number;
  sigils: number;
  books: number;
  exp: number;
  learningMinutes: number;
  affinity: number;
}

export interface ExpertEventPoints {
  /** Books of Knowledge and expert sigils. Speedups are not included. */
  svs: number;
  allianceShowdown: number;
}

export interface ExpertCalculation {
  items: ExpertItemResult[];
  levels: number;
  advancements: number;
  skillLevels: number;
  sigils: number;
  books: number;
  exp: number;
  learningMinutes: number;
  affinity: number;
  speedupPointsPerMinute: { svs: number; allianceShowdown: number };
  eventPoints: ExpertEventPoints;
}

export interface BuildingGoal {
  id: string;
  /** Use `null` for a building that is not built. */
  current: string | null;
  /** Such as `"30"`, `"30-1"`, or `"FC 3"`. */
  goal: string;
}

export interface BuildingCalculatorOptions {
  /** A building that is not listed counts as not built. */
  buildingLevels?: Record<string, string | null>;
  /** The speed bonuses add up. Defaults to 0. */
  constructionSpeedPercent?: number;
}

export interface BuildingStep {
  buildingId: string;
  name: string;
  level: string;
  /** The step is not inside a goal range. */
  prerequisite: boolean;
  cost: UpgradeMaterial[];
  power: number;
  /** Before the speed bonus. */
  baseSeconds: number;
}

export interface HallOfChiefPowerPoints {
  pointsPerPower: number;
  days: string[];
  points: number;
}

export type BuildingHallOfChiefPoints = HallOfChiefPowerPoints;

export interface BuildingEventPoints {
  /** Speedups are not included. */
  svs: number;
  kingOfIcefield: number;
  hallOfChief: BuildingHallOfChiefPoints[];
}

export interface UnmetBuildingPrerequisite {
  /** The building is not in `buildings()`. */
  building: string;
  level: string;
}

export interface BuildingCalculation {
  steps: BuildingStep[];
  resources: UpgradeMaterial[];
  power: number;
  /** Before the speed bonus. */
  baseSeconds: number;
  constructionSpeedPercent: number;
  /** Rounded down. */
  seconds: number;
  /** Rounded up. */
  speedupMinutesNeeded: number;
  /** The caller multiplies them with the minutes the user spends. */
  speedupPointsPerMinute: { svs: number; kingOfIcefield: number };
  eventPoints: BuildingEventPoints;
  /** They add no steps. */
  unmetPrerequisites: UnmetBuildingPrerequisite[];
}

export interface HeroGearMasteryForgingRange {
  /** Use `null` for a piece with no mastery forging yet. */
  current: string | null;
  goal: string;
}

/** Each from 0 to 100. */
export interface HeroGearLevelRange {
  current: number;
  goal: number;
}

export interface HeroGearPiece {
  slot: HeroGearSlot;
  troopType: TroopType;
}

/** Leave out a track that does not change. */
export interface HeroGearGoal {
  /** Set it to get `stats` in the result. */
  piece?: HeroGearPiece;
  masteryForging?: HeroGearMasteryForgingRange;
  enhancement?: HeroGearLevelRange;
  /** Empowerment starts after enhancement level 100. */
  empowerment?: HeroGearLevelRange;
}

export interface HeroGearTrackResult {
  steps: number;
  resources: UpgradeMaterial[];
}

export interface HeroGearMasteryForgingResult extends HeroGearTrackResult {
  /** In percent. */
  statsUpPercent: number;
}

export interface HeroGearLevelResult extends HeroGearTrackResult {
  /** The `power` of the goal level minus the `power` of the current level. */
  power: number;
}

/** A track that needs the enhancement of the piece at a level before it can go on. */
export interface HeroGearEnhancementRequirement {
  track: 'masteryForging' | 'empowerment';
  enhancementLevel: number;
}

/** Empowerment needs the mastery forging of the piece to reach a row. */
export interface HeroGearMasteryForgingRequirement {
  track: 'empowerment';
  masteryForgingRowId: string;
}

export type HeroGearRequirement =
  HeroGearEnhancementRequirement | HeroGearMasteryForgingRequirement;

export interface HeroGearEventPoints {
  svs: number;
  allianceShowdown: number;
  kingOfIcefield: number;
}

export interface HeroGearStatValues {
  /** Attack for Goggles and Boots. Defense for Gloves and Belt. */
  combatStat: number;
  health: number;
  /** Lethality for Goggles and Boots. Health for Gloves and Belt. In percent. */
  percentStat: number;
}

export interface HeroGearStatsResult {
  combatStatName: 'Attack' | 'Defense';
  percentStatName: 'Lethality' | 'Health';
  current: HeroGearStatValues;
  goal: HeroGearStatValues;
  gain: HeroGearStatValues;
  milestones: HeroGearMilestone[];
}

export interface HeroGearCalculation {
  masteryForging: HeroGearMasteryForgingResult;
  enhancement: HeroGearLevelResult;
  empowerment: HeroGearLevelResult;
  resources: UpgradeMaterial[];
  power: number;
  /** Level 0 has no power. */
  currentPower: number;
  goalPower: number;
  eventPoints: HeroGearEventPoints;
  /** Only the tracks in the goal are checked. */
  unmetRequirements: HeroGearRequirement[];
  /** `null` when the goal has no `piece`. */
  stats: HeroGearStatsResult | null;
}

/** The star is 0 to 5 and the tier is 0 to 5. The tier is 0 at 5 stars. */
export interface HeroStars {
  star: number;
  tier: number;
}

export interface HeroStarsRange {
  current: HeroStars;
  goal: HeroStars;
}

export interface HeroSkillGoal {
  name: string;
  /** From 1 to the last level of the skill. */
  current: number;
  goal: number;
}

/** From 0 (none) to 10. */
export interface HeroWidgetRange {
  current: number;
  goal: number;
}

/** Leave out a track that does not change. */
export interface HeroUpgradeGoal {
  id: string;
  stars?: HeroStarsRange;
  skills?: HeroSkillGoal[];
  widgets?: HeroWidgetRange;
}

export interface HeroUpgradeStars {
  steps: number;
  shards: number;
}

export interface HeroUpgradeSkills {
  levels: number;
  manuals: UpgradeMaterial[];
}

export interface HeroUpgradeWidgets {
  levels: number;
  widgets: number;
  unlockedSkills: string[];
}

export interface HeroUpgradeEventPoints {
  svs: number;
  allianceShowdown: number;
  kingOfIcefield: number;
  hallOfChief: number;
}

export interface UnmetHeroSkillRequirement {
  skill: string;
  level: number;
  starRequired: number;
}

export interface HeroUpgradeCalculation {
  stars: HeroUpgradeStars;
  skills: HeroUpgradeSkills;
  widgets: HeroUpgradeWidgets;
  resources: UpgradeMaterial[];
  eventPoints: HeroUpgradeEventPoints;
  /** Checked only when the goal has `stars`. */
  unmetRequirements: UnmetHeroSkillRequirement[];
}

export interface BeastRun {
  /** The level of the beasts, from 1 to 30. */
  level: number;
  /** The number of beast hunts at that level. */
  count: number;
}

export interface BeastCalculatorInput {
  /** Defaults to 0. */
  stamina?: number;
  /** Stamina cans, 10 stamina each. Defaults to 0. */
  staminaCans?: number;
  /** The level of the beasts that the stamina left after the planned runs hunts, from 1 to 30. */
  beastLevel: number;
  /** Beast hunts that you plan, such as the beasts of Intel missions. Defaults to none. */
  beastRuns?: BeastRun[];
  /** Polar Terror hunts that you plan. Defaults to 0. */
  polarTerrors?: number;
  /** The level of Gina's Endurance Training skill, from 1 to 5. Leave out when Gina is not used. */
  ginaSkillLevel?: number;
}

export interface BeastHunts {
  count: number;
  staminaLeft: number;
}

export interface BeastPlannedHunts {
  /** The beast hunts of all `beastRuns`. */
  beasts: number;
  polarTerrors: number;
  staminaNeeded: number;
  /** 0 when the stamina pays for the planned hunts. */
  staminaShort: number;
  /** 0 when the stamina is short. */
  staminaLeft: number;
}

export interface BeastEventRun {
  level: number;
  count: number;
  pointsPerBeast: number;
  points: number;
}

export interface BeastEventPoints {
  eventId: string;
  name: string;
  /** For the beast level of the input. */
  pointsPerBeast: number;
  pointsPerPolarTerror: number;
  /** The points of each beast run that you plan, at the level of the run. */
  beastRuns: BeastEventRun[];
  /** The points of the planned beast runs and Polar Terrors. */
  plannedPoints: number;
  /** The planned points and the points of hunting beasts with the stamina left. */
  beastPoints: number;
  /** The planned points and the points of hunting Polar Terrors with the stamina left. */
  polarTerrorPoints: number;
}

export interface BeastCalculation {
  totalStamina: number;
  /** 0 when Gina is not used. */
  ginaReductionPercent: number;
  /** The stamina of one beast after Gina's reduction, rounded to a whole number. */
  beastStaminaCost: number;
  /** The stamina of one Polar Terror after Gina's reduction, rounded to a whole number. */
  polarTerrorStaminaCost: number;
  planned: BeastPlannedHunts;
  /** The beasts that the stamina left after the planned hunts pays for. */
  beasts: BeastHunts;
  /** The Polar Terrors that the stamina left after the planned hunts pays for. */
  polarTerrors: BeastHunts;
  events: BeastEventPoints[];
}

/** `hours` and `seconds` are a time that is saved each time, such as the 8 hours of Agnes. */
export type BuffUnit = 'percent' | 'flat' | 'hours' | 'seconds';

export type BuffGroupId =
  'military' | 'resources' | 'resource-output' | 'growth' | 'alliance' | 'other';

export type BuffSourceType =
  | 'account'
  | 'hero'
  | 'expert'
  | 'research'
  | 'allianceTech'
  | 'allianceFacility'
  | 'alliancePrestige'
  | 'vip'
  | 'building'
  | 'skin'
  | 'tundraAlbum'
  | 'decoration'
  | 'treeOfLife'
  | 'castleAppointment'
  | 'chiefOrder'
  | 'presidentSkill'
  | 'pet'
  | 'chiefGear'
  | 'chiefGearSet'
  | 'chiefCharm';

export interface BuffHeroSkills {
  heroId: string;
  /** The level of each skill that the hero has, by skill name. A level of 0 adds nothing. */
  skills: Record<string, number>;
}

export interface BuffExpertSkills {
  expertId: string;
  /** The level of each skill or talent that the expert has, by name. A level of 0 adds nothing. */
  skills: Record<string, number>;
}

export interface BuffDecoration {
  id: string;
  /** The level of the decoration. */
  level: number;
}

export type BuffPetRefinementStatKey =
  | 'infantry-lethality'
  | 'infantry-health'
  | 'lancer-lethality'
  | 'lancer-health'
  | 'marksman-lethality'
  | 'marksman-health';

export interface BuffPet {
  id: string;
  level: number;
  /** Use the refined value of the level when it has one. Defaults to false. */
  refined?: boolean;
  /**
   * The refinement of the pet, in percent, for each stat that it rolled. A value is from 0 to the
   * maximum refinement of the pet. A stat that is left out counts as 0.
   */
  refinement?: Partial<Record<BuffPetRefinementStatKey, number>>;
}

export interface BuffProfile {
  /** True when the March Queue pack was bought. It adds 1 March Queue. */
  marchQueuePack?: boolean;
  heroSkills?: BuffHeroSkills[];
  experts?: BuffExpertSkills[];
  /** Research level by node id. A level of 0 adds nothing. */
  researchLevels?: Record<string, number>;
  /** Alliance Tech level by node id. A level of 0 adds nothing. */
  allianceTech?: Record<string, number>;
  /**
   * The levels of each Alliance Facility that your alliance holds, by facility id. Each level must be
   * one of the levels of the facility and can be listed once. The boosters of the levels add up.
   */
  allianceFacilities?: Record<string, number[]>;
  /**
   * The tier of each Alliance Prestige Building that your alliance holds, by building id, such as
   * `{ 'championship-statue': 'Gold' }`. One tier for each building. The tier must be one of the
   * tiers of the building.
   */
  alliancePrestige?: Record<string, string>;
  /** From 0 to 12. */
  vipLevel?: number;
  /** Level label by building id, such as `"30"` or `"FC 10"`. */
  buildingLevels?: Record<string, string>;
  /** Ids of the skins that you own. */
  skins?: string[];
  /** Ids of the Tundra Albums that are complete. The buff of an album counts when it is complete. */
  tundraAlbums?: string[];
  /** List a decoration once for each copy that you have placed. */
  decorations?: BuffDecoration[];
  /** From 0 to 10. */
  treeOfLifeLevel?: number;
  /** The id of the castle position that you hold. */
  castleAppointment?: string;
  /** Ids of the Chief Orders that are active. */
  chiefOrders?: string[];
  /** Ids of the President skills that are active. */
  presidentSkills?: string[];
  pets?: BuffPet[];
  /** The id of the Chief Gear level of the piece worn in each slot, by slot id such as `cap`. */
  chiefGear?: Record<string, string>;
  /** The ids of the Chief Charm levels in each gear slot, by slot id such as `cap`. A slot holds up to 3 charms. */
  chiefCharms?: Record<string, string[]>;
}

export interface BuffSource {
  type: BuffSourceType;
  /** The id of the hero, research node, building, and so on that gives the buff. */
  id: string;
  /** For example `Hero: Ling Xue, Skill: Total Control Lv 4`. */
  label: string;
  amount: number;
}

export interface BuffCategory {
  /** For example `training-speed`. */
  statKey: string;
  /** The group of the stat; such as `military`. */
  group: BuffGroupId;
  /** For example `Training Speed`. */
  name: string;
  unit: BuffUnit;
  /** The sum of the amounts of all sources. */
  total: number;
  sources: BuffSource[];
}

export interface BuffGroup {
  id: BuffGroupId;
  /** For example `Military`. */
  name: string;
  categories: BuffCategory[];
}

/** The total of one stat from one source group. */
export interface BuffSourceStat {
  /** For example `training-speed`. */
  statKey: string;
  /** For example `Training Speed`. */
  name: string;
  unit: BuffUnit;
  /** The sum of the amounts of the sources of the group for this stat. */
  total: number;
}

/** Everything that one kind of source gives, such as all research or all heroes. */
export interface BuffSourceGroup {
  /**
   * For example `hero`. It is a source type, with three differences: research is split in
   * `research` (Research Center) and `warAcademyResearch`, and the Tree of Life and the island
   * decorations are one group, `island`.
   */
  id: string;
  /** For example `Heroes`. */
  name: string;
  /** In the order of the stat groups. */
  stats: BuffSourceStat[];
}

export interface BuffCalculation {
  /** One category for each stat key and unit that a source gives, in the order of the names. */
  categories: BuffCategory[];
  /** The same categories in groups, in the order of the groups. A group with no category is left out. */
  groups: BuffGroup[];
  /**
   * The same numbers by source: one entry for each kind of source that gives something, with the
   * total of each stat that it gives. It has no source lists. A source group with nothing is left out.
   */
  bySource: BuffSourceGroup[];
}
