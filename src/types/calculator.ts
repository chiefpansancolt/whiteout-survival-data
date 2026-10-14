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
  valeriaLevel?: number;
}

export type SvsLineResult = EventScoreLine;

export type SvsScore = EventScore;

export interface SvsDayResult extends EventScoreDay {
  phase: 'preparation' | 'battle';
}

export interface SvsCalculation {
  valeriaBonusPercent: number;
  days: SvsDayResult[];
  preparation: EventScore;
  battle: EventScore;
  event: EventScore;
}

export interface AllianceShowdownCalculatorOptions {
  dawnHymnLevel?: number;
}

export interface AllianceShowdownCalculation extends EventScoreCalculation {
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
  steps: number;
  materials: UpgradeMaterial[];
  score: number;
  power: number;
  eventPoints: UpgradeEventPoints;
}

export type TroopType = 'infantry' | 'lancer' | 'marksman';

export type TroopCampAction =
  { mode: 'training'; tier: number } | { mode: 'promotion'; fromTier: number; toTier: number };

export interface TroopRun {
  action: TroopCampAction;
  count: number | 'max';
  batches?: number;
}

export interface TroopCampConfig {
  level: string;
  runs?: TroopRun[];
}

export interface TroopCalculatorInput {
  camps: Record<TroopType, TroopCampConfig>;
  researchCapacity?: number;
  ministerOfEducation?: 'regular' | 'supreme';
  capacityBoost?: boolean;
  trainingSpeedPercent?: number;
  vicePresident?: 'regular' | 'supreme';
  mobilize?: boolean;
  advancedTraining?: boolean;
  costReductionPercent?: Partial<Record<TroopType, number>>;
}

export interface TroopCampResult {
  runs: { troopsPerBatch: number; batches: number; seconds: number }[];
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
  hallOfChief: number;
}

export interface TroopCalculation {
  fireCrystalLevels: Record<TroopType, number>;
  tierPower: TroopTierRow[];
  totalPower: Omit<TroopTierRow, 'tier'>;
  capacity: number;
  camps: Record<TroopType, TroopCampResult>;
  tiers: TroopTierRow[];
  totals: Omit<TroopTierRow, 'tier'>;
  trainingSpeedPercent: number;
  resources: UpgradeMaterial[];
  totalSeconds: number;
  longestCampSeconds: number;
  speedupMinutesNeeded: number;
  speedupPointsPerMinute: { svs: number; allianceShowdown: number; kingOfIcefield: number };
  /** Training runs only. Promotion and power are not included. A tier with no scoring row gives 0. */
  eventPoints: TroopEventPoints;
}

export interface ResearchGoal {
  id: string;
  current: number;
  goal: number;
}

export interface ResearchCalculatorOptions {
  researchSpeedPercent?: number;
  stateBuff?: boolean;
  vicePresident?: 'regular' | 'supreme';
}

export interface ResearchItemResult {
  id: string;
  name: string;
  category: string;
  steps: number;
  resources: UpgradeMaterial[];
  power: number;
  baseSeconds: number;
}

export interface UnmetResearchPrerequisite {
  id: string;
  level: number;
  requires: { id: string; level: number };
  planned: number;
}

export interface ResearchEventPoints {
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
  baseSeconds: number;
  researchSpeedPercent: number;
  seconds: number;
  stepsWithoutTime: number;
  unmetPrerequisites: UnmetResearchPrerequisite[];
  buildingRequirements: { id: string; level: string }[];
  speedupMinutesNeeded: number;
  speedupPointsPerMinute: { svs: number; allianceShowdown: number; kingOfIcefield: number };
  eventPoints: ResearchEventPoints;
}

export interface PetGoal {
  id: string;
  current: number;
  goal: number;
  currentAdvanced?: boolean;
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
  troopAttack: number;
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
  current: number;
  goal: number;
}

export interface ExpertGoal {
  id: string;
  level?: {
    current: number;
    goal: number;
    currentAdvanced?: boolean;
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
  skillLevels: number;
  sigils: number;
  books: number;
  exp: number;
  learningMinutes: number;
  affinity: number;
}

export interface ExpertEventPoints {
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
  current: string | null;
  goal: string;
}

export interface BuildingCalculatorOptions {
  buildingLevels?: Record<string, string | null>;
  constructionSpeedPercent?: number;
}

export interface BuildingStep {
  buildingId: string;
  name: string;
  level: string;
  prerequisite: boolean;
  cost: UpgradeMaterial[];
  power: number;
  baseSeconds: number;
}

export interface HallOfChiefPowerPoints {
  pointsPerPower: number;
  days: string[];
  points: number;
}

export type BuildingHallOfChiefPoints = HallOfChiefPowerPoints;

export interface BuildingEventPoints {
  svs: number;
  kingOfIcefield: number;
  hallOfChief: BuildingHallOfChiefPoints[];
}

export interface UnmetBuildingPrerequisite {
  building: string;
  level: string;
}

export interface BuildingCalculation {
  steps: BuildingStep[];
  resources: UpgradeMaterial[];
  power: number;
  baseSeconds: number;
  constructionSpeedPercent: number;
  seconds: number;
  speedupMinutesNeeded: number;
  speedupPointsPerMinute: { svs: number; kingOfIcefield: number };
  eventPoints: BuildingEventPoints;
  unmetPrerequisites: UnmetBuildingPrerequisite[];
}

export interface HeroGearMasteryForgingRange {
  current: string | null;
  goal: string;
}

export interface HeroGearLevelRange {
  current: number;
  goal: number;
}

export interface HeroGearPiece {
  slot: HeroGearSlot;
  troopType: TroopType;
}

export interface HeroGearGoal {
  piece?: HeroGearPiece;
  masteryForging?: HeroGearMasteryForgingRange;
  enhancement?: HeroGearLevelRange;
  empowerment?: HeroGearLevelRange;
}

export interface HeroGearTrackResult {
  steps: number;
  resources: UpgradeMaterial[];
}

export interface HeroGearMasteryForgingResult extends HeroGearTrackResult {
  statsUpPercent: number;
}

export interface HeroGearLevelResult extends HeroGearTrackResult {
  power: number;
}

export interface HeroGearEnhancementRequirement {
  track: 'masteryForging' | 'empowerment';
  enhancementLevel: number;
}

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
  combatStat: number;
  health: number;
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
  currentPower: number;
  goalPower: number;
  eventPoints: HeroGearEventPoints;
  unmetRequirements: HeroGearRequirement[];
  stats: HeroGearStatsResult | null;
}

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
  current: number;
  goal: number;
}

export interface HeroWidgetRange {
  current: number;
  goal: number;
}

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
  unmetRequirements: UnmetHeroSkillRequirement[];
}

export interface BeastRun {
  level: number;
  count: number;
}

export interface BeastCalculatorInput {
  stamina?: number;
  staminaCans?: number;
  beastLevel: number;
  beastRuns?: BeastRun[];
  polarTerrors?: number;
  ginaSkillLevel?: number;
}

export interface BeastHunts {
  count: number;
  staminaLeft: number;
}

export interface BeastPlannedHunts {
  beasts: number;
  polarTerrors: number;
  staminaNeeded: number;
  staminaShort: number;
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
  pointsPerBeast: number;
  pointsPerPolarTerror: number;
  beastRuns: BeastEventRun[];
  plannedPoints: number;
  beastPoints: number;
  polarTerrorPoints: number;
}

export interface BeastCalculation {
  totalStamina: number;
  ginaReductionPercent: number;
  beastStaminaCost: number;
  polarTerrorStaminaCost: number;
  planned: BeastPlannedHunts;
  beasts: BeastHunts;
  polarTerrors: BeastHunts;
  events: BeastEventPoints[];
}

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
  | 'collection'
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
  skills: Record<string, number>;
}

export interface BuffExpertSkills {
  expertId: string;
  skills: Record<string, number>;
}

export interface BuffExpertAffinity {
  level: number;
  advanced?: boolean;
}

export interface BuffDecoration {
  id: string;
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
  refined?: boolean;
  refinement?: Partial<Record<BuffPetRefinementStatKey, number>>;
}

export interface BuffProfile {
  marchQueuePack?: boolean;
  heroSkills?: BuffHeroSkills[];
  experts?: BuffExpertSkills[];
  expertAffinity?: Record<string, BuffExpertAffinity>;
  researchLevels?: Record<string, number>;
  allianceTech?: Record<string, number>;
  allianceFacilities?: Record<string, number[]>;
  alliancePrestige?: Record<string, string>;
  vipLevel?: number;
  buildingLevels?: Record<string, string>;
  skins?: string[];
  tundraAlbums?: string[];
  collectionLevel?: number;
  decorations?: BuffDecoration[];
  treeOfLifeLevel?: number;
  castleAppointment?: string;
  chiefOrders?: string[];
  presidentSkills?: string[];
  pets?: BuffPet[];
  chiefGear?: Record<string, string>;
  chiefCharms?: Record<string, string[]>;
}

export interface BuffSource {
  type: BuffSourceType;
  id: string;
  label: string;
  amount: number;
}

export interface BuffCategory {
  statKey: string;
  group: BuffGroupId;
  name: string;
  unit: BuffUnit;
  total: number;
  sources: BuffSource[];
}

export interface BuffGroup {
  id: BuffGroupId;
  name: string;
  categories: BuffCategory[];
}

export interface BuffSourceStat {
  statKey: string;
  name: string;
  unit: BuffUnit;
  total: number;
}

export interface BuffSourceGroup {
  id: string;
  name: string;
  stats: BuffSourceStat[];
}

export interface BuffCalculation {
  categories: BuffCategory[];
  groups: BuffGroup[];
  bySource: BuffSourceGroup[];
}
