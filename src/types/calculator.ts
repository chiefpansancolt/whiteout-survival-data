import { HeroGearMilestone, HeroGearSlot } from './hero-gear';

/** How many times each scoring action was done, by event day id and then by action text from `events()`. */
export type EventUsage = Record<string, Record<string, number>>;

export interface EventScoreLine {
  action: string;
  points: number;
  count: number;
  /** `points` times `count`, before any expert bonus. */
  subtotal: number;
}

export interface EventScore {
  base: number;
  /** Extra points from the expert bonus. 0 when no expert is used or the bonus does not apply. */
  bonus: number;
  total: number;
}

export interface EventScoreDay extends EventScore {
  /** Day id from the event, such as `1`, `Battle`, or `s1-3`. */
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
  /** Level (1 to 10) of the Well Prepared skill of Valeria. Leave out when Valeria is not used. */
  valeriaLevel?: number;
}

export type SvsLineResult = EventScoreLine;

export type SvsScore = EventScore;

export interface SvsDayResult extends EventScoreDay {
  phase: 'preparation' | 'battle';
}

export interface SvsCalculation {
  /** The bonus of Valeria for the Preparation Phase, in percent. 0 when Valeria is not used. */
  valeriaBonusPercent: number;
  days: SvsDayResult[];
  preparation: EventScore;
  battle: EventScore;
  event: EventScore;
}

export interface AllianceShowdownCalculatorOptions {
  /** Level (1 to 10) of the Dawn Hymn skill of Baldur. Leave out when Baldur is not used. */
  dawnHymnLevel?: number;
}

export interface AllianceShowdownCalculation extends EventScoreCalculation {
  /** The point bonus of Baldur in percent. 0 when Baldur is not used. */
  dawnHymnBonusPercent: number;
}

/** One gear piece or one charm to upgrade, by `id` from `chiefGear()` or `chiefCharm()`. */
export interface UpgradeRange {
  /** The level the piece is at now. Use `null` for a piece that has no level yet. */
  from: string | null;
  to: string;
}

export interface UpgradeMaterial {
  itemId: string;
  amount: number;
}

/** Event points of the score of an upgrade, from the "Raise Chief Gear max score" and "Raise Chief Charm max score" rows. */
export interface UpgradeEventPoints {
  svs: number;
  allianceShowdown: number;
  kingOfIcefield: number;
  hallOfChief: number;
}

export interface UpgradeResult {
  /** The number of upgrade steps, including the steps inside a level. */
  steps: number;
  materials: UpgradeMaterial[];
  score: number;
  /** The `powerTotal` of the last level minus the `powerTotal` of the first level, summed over all ranges. */
  power: number;
  eventPoints: UpgradeEventPoints;
}

export type TroopType = 'infantry' | 'lancer' | 'marksman';

/** What a camp does in one batch. Tiers are 1 to 12. */
export type TroopCampAction =
  { mode: 'training'; tier: number } | { mode: 'promotion'; fromTier: number; toTier: number };

/** Troops in each batch, repeated for a number of batches. */
export interface TroopRun {
  action: TroopCampAction;
  /** Troops in each batch, or `max` for the capacity. */
  count: number | 'max';
  /** The number of batches, 1 or more. Defaults to 1. */
  batches?: number;
}

export interface TroopCampConfig {
  /** The `label` of a camp level in `buildings()`, such as `30` or `FC 3-2`. */
  level: string;
  /** A camp can train and promote, so it can have more than one run. Leave out when the camp only adds its level to the shared capacity. */
  runs?: TroopRun[];
}

export interface TroopCalculatorInput {
  camps: Record<TroopType, TroopCampConfig>;
  /** Training capacity from research. Defaults to 0. */
  researchCapacity?: number;
  /** Adds 200 capacity, or 300 for the supreme buff. */
  ministerOfEducation?: 'regular' | 'supreme';
  /** Multiplies the total capacity by 3. */
  capacityBoost?: boolean;
  /** Your training speed bonus in percent, as the game shows it, without the buffs below. Defaults to 0. */
  trainingSpeedPercent?: number;
  /** Adds 10% training speed, or 15% for the supreme buff. */
  vicePresident?: 'regular' | 'supreme';
  /** The Mobilize buff of the President. Adds 30% training speed. */
  mobilize?: boolean;
  /** Adds 20% training speed. */
  advancedTraining?: boolean;
  /** Percent off the resource cost for each troop type, from 0 to 75. Defaults to 0. */
  costReductionPercent?: Partial<Record<TroopType, number>>;
}

export interface TroopCampResult {
  /** One entry for each run of the camp, in order. `seconds` covers all batches of the run. */
  runs: { troopsPerBatch: number; batches: number; seconds: number }[];
  /** The seconds for all runs of the camp, before any speedups. */
  seconds: number;
}

export interface TroopTierRow {
  tier: number;
  infantry: number;
  lancer: number;
  marksman: number;
  total: number;
}

export interface TroopCalculation {
  /** The most troops that a camp can queue in one batch. All three camps share this capacity. */
  capacity: number;
  camps: Record<TroopType, TroopCampResult>;
  /** The change in troops for each tier from 1 to 12. Promotion takes troops from the first tier and adds them to the second. */
  tiers: TroopTierRow[];
  /** The change in troops for each type, summed over all tiers. */
  totals: Omit<TroopTierRow, 'tier'>;
  /** The training speed in percent that the times use, with the buffs added. */
  trainingSpeedPercent: number;
  /** Meat, wood, coal, and iron for all runs, with the cost reduction applied. Promotion costs the difference between the two tiers. */
  resources: UpgradeMaterial[];
  /** The seconds of all camps added together, which is the speedup time to finish all of them. */
  totalSeconds: number;
  /** The seconds of the camp that takes the longest. The camps train at the same time. */
  longestCampSeconds: number;
}

/** One research line to upgrade. Each tier of a research line is its own line with its own levels. */
export interface ResearchGoal {
  /** The `id` of the research line in `research()`. */
  id: string;
  /** The level you have now, from 0 (not started) to the number of levels of the line. */
  current: number;
  goal: number;
}

export interface ResearchCalculatorOptions {
  /** Your research speed bonus in percent, as the game shows it, without the buffs below. Defaults to 0. */
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
  /** The research time of the steps before the speed bonus. */
  baseSeconds: number;
}

/** A research level whose prerequisite is not met by the current or goal level of the other line. */
export interface UnmetResearchPrerequisite {
  /** The research line and the level that needs the prerequisite. */
  id: string;
  level: number;
  requires: { id: string; level: number };
  /** The highest of the current and goal levels given for the required line. 0 when it is not given. */
  planned: number;
}

export interface ResearchCalculation {
  items: ResearchItemResult[];
  steps: number;
  resources: UpgradeMaterial[];
  power: number;
  /** The research time of all steps added together, before the speed bonus. */
  baseSeconds: number;
  /** The research speed in percent that the time uses, with the buffs added. */
  researchSpeedPercent: number;
  /** The research time after the speed bonus, rounded down. */
  seconds: number;
  /** The steps that have no research time in the data. Their time counts as 0. */
  stepsWithoutTime: number;
  unmetPrerequisites: UnmetResearchPrerequisite[];
  /** The highest level of each building that the steps need, as a level `label` of `buildings()`. */
  buildingRequirements: { id: string; level: string }[];
}

/** One pet to upgrade. Pets start at level 1. */
export interface PetGoal {
  /** The `id` of the pet in `pets()`. */
  id: string;
  /** The level of the pet now, from 1 to its max level. */
  current: number;
  goal: number;
  /** True when the pet is already advanced at `current`. Valid only on a level that is a multiple of 10. */
  currentAdvanced?: boolean;
  /** True to pay for the advancement at `goal`. Valid only on a level that is a multiple of 10. */
  goalAdvanced?: boolean;
}

/** Event points of the pet advancement score, from the "Pet advancement score increases by 1" row of each event. */
export interface PetEventPoints {
  svs: number;
  allianceShowdown: number;
  kingOfIcefield: number;
}

export interface PetItemResult {
  id: string;
  name: string;
  /** The levels gained. */
  levels: number;
  /** The advancements paid for. */
  advancements: number;
  resources: UpgradeMaterial[];
  /** The gain in Troop Attack, in percent. */
  troopAttack: number;
  /** The gain in Troop Defense, in percent. */
  troopDefense: number;
  /** The gain in troops power. */
  power: number;
  /** The pet advancement score of the advancements paid for. */
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

/** One skill of an expert to level up, by the skill `name` in `experts()`. */
export interface ExpertSkillGoal {
  name: string;
  /** The skill level now, from 1 to the max level of the skill. */
  current: number;
  goal: number;
}

/** One expert to upgrade. */
export interface ExpertGoal {
  /** The `id` of the expert in `experts()`. */
  id: string;
  /** The affinity level range, from 1 to 100. */
  level?: {
    current: number;
    goal: number;
    /** True when the expert is already advanced at `current`. Valid only on a level that has an advancement cost. */
    currentAdvanced?: boolean;
    /** True to pay for the advancement at `goal`. Valid only on a level that has an advancement cost. */
    goalAdvanced?: boolean;
  };
  skills?: ExpertSkillGoal[];
}

export interface ExpertItemResult {
  id: string;
  name: string;
  /** The affinity levels gained. */
  levels: number;
  /** The advancements paid for. */
  advancements: number;
  /** The skill levels gained, for all skills. */
  skillLevels: number;
  /** Expert sigils for the advancements. */
  sigils: number;
  /** Books of Knowledge for the skill levels. */
  books: number;
  /** Skill EXP for the skill levels. */
  exp: number;
  /** Affinity points for the affinity levels. */
  affinity: number;
}

export interface ExpertCalculation {
  items: ExpertItemResult[];
  levels: number;
  advancements: number;
  skillLevels: number;
  sigils: number;
  books: number;
  exp: number;
  affinity: number;
}

/** One building to upgrade, by `id` from `buildings()`. */
export interface BuildingGoal {
  id: string;
  /** The level `label` of the building now. Use `null` for a building that is not built. */
  current: string | null;
  /** The level `label` to reach, such as `"30"`, `"30-1"`, or `"FC 3"`. */
  goal: string;
}

export interface BuildingCalculatorOptions {
  /** The level `label` of the buildings you already have, by building `id`. A building that is not listed counts as not built. */
  buildingLevels?: Record<string, string | null>;
  /** The total construction speed in percent, from 0 up. The speed bonuses add up. Defaults to 0. */
  constructionSpeedPercent?: number;
}

export interface BuildingStep {
  buildingId: string;
  name: string;
  /** The level `label` that this step reaches. */
  level: string;
  /** True for a step that a goal needs as a prerequisite. The step is not inside a goal range. */
  prerequisite: boolean;
  cost: UpgradeMaterial[];
  /** The power that this step adds. */
  power: number;
  /** The build time before the speed bonus. */
  baseSeconds: number;
}

/** The Hall of Chief points of the power gained, for the stages that score construction power. */
export interface BuildingHallOfChiefPoints {
  pointsPerPower: number;
  /** The names of the event days that use this multiplier. */
  days: string[];
  points: number;
}

export interface BuildingEventPoints {
  /** Points of Fire Crystals and Refined Fire Crystals. Speedups are not included. */
  svs: number;
  kingOfIcefield: number;
  hallOfChief: BuildingHallOfChiefPoints[];
}

export interface UnmetBuildingPrerequisite {
  /** The building name as the data states it. The building is not in `buildings()`. */
  building: string;
  level: string;
}

export interface BuildingCalculation {
  steps: BuildingStep[];
  resources: UpgradeMaterial[];
  power: number;
  /** The build time of all steps added together, before the speed bonus. */
  baseSeconds: number;
  constructionSpeedPercent: number;
  /** The build time after the speed bonus, rounded down. */
  seconds: number;
  /** The minutes of speedups that cover the build time, rounded up. */
  speedupMinutesNeeded: number;
  /** The points of one speedup minute. The caller multiplies them with the minutes the user spends. */
  speedupPointsPerMinute: { svs: number; kingOfIcefield: number };
  eventPoints: BuildingEventPoints;
  /** Prerequisites on a building that is not in `buildings()`. They add no steps. */
  unmetPrerequisites: UnmetBuildingPrerequisite[];
}

/** The mastery forging rows to pay for, by `id` from `heroGearMasteryForging()`. */
export interface HeroGearMasteryForgingRange {
  /** The row the piece is at now. Use `null` for a piece with no mastery forging yet. */
  current: string | null;
  goal: string;
}

/** A level range of enhancement or empowerment, each from 0 to 100. */
export interface HeroGearLevelRange {
  current: number;
  goal: number;
}

/** The stats depend on the slot and on the troop type of the gear set. */
export interface HeroGearPiece {
  slot: HeroGearSlot;
  troopType: TroopType;
}

/** One hero gear piece to upgrade. Leave out a track that does not change. */
export interface HeroGearGoal {
  /** The piece for the stats gain in the result. */
  piece?: HeroGearPiece;
  masteryForging?: HeroGearMasteryForgingRange;
  /** Levels from `heroGearEnhancement()`. */
  enhancement?: HeroGearLevelRange;
  /** Levels from `heroGearEmpowerment()`. Empowerment starts after enhancement level 100. */
  empowerment?: HeroGearLevelRange;
}

export interface HeroGearTrackResult {
  /** The number of levels or sub-stages that the track adds. */
  steps: number;
  resources: UpgradeMaterial[];
}

export interface HeroGearMasteryForgingResult extends HeroGearTrackResult {
  /** The `statsUpPercent` of the last row minus the `statsUpPercent` of the first row, in percent. */
  statsUpPercent: number;
}

export interface HeroGearLevelResult extends HeroGearTrackResult {
  /** The `power` of the goal level minus the `power` of the current level. */
  power: number;
}

/** A track that needs the enhancement of the piece at a level before it can go on. */
export interface HeroGearRequirement {
  track: 'masteryForging' | 'empowerment';
  /** The enhancement level that the piece needs. */
  enhancementLevel: number;
}

/** The points that the Essence Stones and the Mithril earn in each event. */
export interface HeroGearEventPoints {
  svs: number;
  allianceShowdown: number;
  kingOfIcefield: number;
}

export interface HeroGearStatValues {
  /** Attack for Goggles and Boots. Defense for Gloves and Belt. */
  combatStat: number;
  /** The flat health. */
  health: number;
  /** Lethality for Goggles and Boots. Health for Gloves and Belt. In percent. */
  percentStat: number;
}

/** The stats of one piece before the plan, after the plan, and the gain between them. */
export interface HeroGearStatsResult {
  combatStatName: 'Attack' | 'Defense';
  percentStatName: 'Lethality' | 'Health';
  /** The stats at the current levels and the current mastery forging. */
  current: HeroGearStatValues;
  /** The stats at the goal levels and the goal mastery forging. */
  goal: HeroGearStatValues;
  gain: HeroGearStatValues;
  /** The Mithril milestone bonuses that the plan unlocks. */
  milestones: HeroGearMilestone[];
}

export interface HeroGearCalculation {
  masteryForging: HeroGearMasteryForgingResult;
  enhancement: HeroGearLevelResult;
  empowerment: HeroGearLevelResult;
  /** The resources of all tracks added together. */
  resources: UpgradeMaterial[];
  /** The power gained from enhancement and empowerment. */
  power: number;
  /** The power of the piece at the current levels. Level 0 has no power. */
  currentPower: number;
  /** The power of the piece at the goal levels. */
  goalPower: number;
  eventPoints: HeroGearEventPoints;
  /** The requirements that the plan does not meet. Only the tracks in the goal are checked. */
  unmetRequirements: HeroGearRequirement[];
  /** The stats of the piece. `null` when the goal has no `piece`. */
  stats: HeroGearStatsResult | null;
}

/** A hero star label such as 3.1: the star from 0 to 5 and the tier from 0 to 5. The tier is 0 at 5 stars. */
export interface HeroStars {
  star: number;
  tier: number;
}

export interface HeroStarsRange {
  current: HeroStars;
  goal: HeroStars;
}

/** One skill of the hero, by `name` from the exploration or expedition skills of `heroes()`. */
export interface HeroSkillGoal {
  name: string;
  /** The skill level now, from 1 to the last level of the skill. */
  current: number;
  goal: number;
}

/** The exclusive weapon levels, from 0 (none) to 10. */
export interface HeroWidgetRange {
  current: number;
  goal: number;
}

/** One hero to upgrade. Leave out a track that does not change. */
export interface HeroUpgradeGoal {
  /** The `id` of the hero in `heroes()`. */
  id: string;
  stars?: HeroStarsRange;
  skills?: HeroSkillGoal[];
  widgets?: HeroWidgetRange;
}

export interface HeroUpgradeStars {
  /** The tier steps from the current star label to the goal label. */
  steps: number;
  /** The shards of the steps. The shard of the hero and the general shard of its rarity count the same. */
  shards: number;
}

export interface HeroUpgradeSkills {
  levels: number;
  /** The manual item of the rarity of the hero, for each manual type. */
  manuals: UpgradeMaterial[];
}

export interface HeroUpgradeWidgets {
  levels: number;
  widgets: number;
  /** The names of the exclusive weapon skills that the levels unlock. */
  unlockedSkills: string[];
}

/** Event points of the shards used to ascend the hero and of the Widgets. */
export interface HeroUpgradeEventPoints {
  svs: number;
  allianceShowdown: number;
  kingOfIcefield: number;
  hallOfChief: number;
}

/** A skill level that needs more stars than the goal reaches. */
export interface UnmetHeroSkillRequirement {
  skill: string;
  level: number;
  starRequired: number;
}

export interface HeroUpgradeCalculation {
  stars: HeroUpgradeStars;
  skills: HeroUpgradeSkills;
  widgets: HeroUpgradeWidgets;
  /** The general shard item of the rarity of the hero, and the manuals. */
  resources: UpgradeMaterial[];
  eventPoints: HeroUpgradeEventPoints;
  /** Skill levels that need a higher star than the star goal. Checked only when the goal has `stars`. */
  unmetRequirements: UnmetHeroSkillRequirement[];
}
