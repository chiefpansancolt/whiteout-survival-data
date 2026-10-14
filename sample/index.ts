import {
  buildings,
  castleAppointments,
  chiefCharm,
  chiefGear,
  chiefGearSetBonus,
  chiefGearSlots,
  chiefOrderReadyAt,
  chiefOrders,
  dailies,
  experts,
  facilities,
  fireCrystalShardTable,
  fireCrystalTable,
  heroes,
  heroGearEmpowerment,
  heroGearEnhancement,
  heroGearMasteryForging,
  highestTierAtCampLevel,
  items,
  pets,
  presidentSkills,
  research,
  researchTree,
  serverTimeline,
  serverTimelineStatus,
  skins,
  troopPower,
  troops,
} from '../src';

console.log('--- Buildings ---');
console.log('total buildings:', buildings().count());

const furnace = buildings().findByName('Furnace')!;
console.log('Furnace levels tracked:', furnace.levels.length);
console.log('Furnace max level:', furnace.maxLevelLabel);
console.log(
  'Furnace total power at max:',
  furnace.levels.reduce((sum, l) => sum + l.power, 0),
);

const embassy = buildings().findByName('Embassy')!;
console.log('Embassy levels tracked:', embassy.levels.length);
console.log(
  'Embassy total power at max:',
  embassy.levels.reduce((sum, l) => sum + l.power, 0),
);

const researchCenter = buildings().findByName('Research Center')!;
console.log('Research Center max level:', researchCenter.maxLevelLabel);
console.log(
  'Research Center total power at max:',
  researchCenter.levels.reduce((sum, l) => sum + l.power, 0),
);

const commandCenter = buildings().findByName('Command Center')!;
console.log('Command Center levels tracked:', commandCenter.levels.length);
console.log(
  'Command Center total power at max:',
  commandCenter.levels.reduce((sum, l) => sum + l.power, 0),
);

for (const campName of ['Infantry Camp', 'Marksman Camp', 'Lancer Camp']) {
  const camp = buildings().findByName(campName)!;
  console.log(`${campName} levels tracked:`, camp.levels.length);
  console.log(
    `${campName} total power at max:`,
    camp.levels.reduce((sum, l) => sum + l.power, 0),
  );
}

const warAcademy = buildings().findByName('War Academy')!;
console.log('War Academy levels tracked:', warAcademy.levels.length);
console.log(
  'War Academy total power at max:',
  warAcademy.levels.reduce((sum, l) => sum + l.power, 0),
);

for (const name of [
  'Infirmary',
  'Storehouse',
  'Barricade',
  "Hunter's Hut",
  'Sawmill',
  'Coal Mine',
  'Iron Mine',
  'Clinic',
  'Cookhouse',
  'Shelter',
]) {
  const b = buildings().findByName(name)!;
  console.log(`${name} levels tracked:`, b.levels.length);
  console.log(
    `${name} total power at max:`,
    b.levels.reduce((sum, l) => sum + l.power, 0),
  );
}

console.log('\n--- Facilities ---');
console.log('total facilities:', facilities().count());
console.log('Arena description:', facilities().findByName('Arena')?.description);

console.log('\n--- Heroes ---');
console.log('total heroes:', heroes().count());
console.log('Rare heroes:', heroes().byRarity('Rare').count());
console.log('Infantry heroes:', heroes().byClass('Infantry').count());
console.log('Smith exploration skills:', heroes().findByName('Smith')?.skills.exploration.length);

console.log('\n--- Experts ---');
console.log('total experts:', experts().count());
console.log('Generation 1 experts:', experts().byGeneration(1).count());
console.log('Agnes talent:', experts().findByName('Agnes')?.talent.name);

console.log('\n--- Pets ---');
console.log('total pets:', pets().count());
console.log('Legendary pets:', pets().byRarity('Legendary').count());
console.log('Cave Lion skill tiers:', pets().findByName('Cave Lion')?.skill.values.length);
console.log('Cave Lion unlock requirement:', pets().findByName('Cave Lion')?.unlockRequirement);

console.log('\n--- Items ---');
console.log('total items:', items().count());
console.log('Chest items:', items().byCategory('Chest').count());
console.log(
  'Splendid Labyrinth Treasure reward rates:',
  items().find('splendid-labyrinth-treasure')?.rewardRates?.length,
);

console.log('\n--- Skins ---');
console.log('total skins:', skins().count());
console.log('Avatar Frame skins:', skins().bySkinType('Avatar Frame').count());
console.log('Gilded Dragonboat bonus:', skins().find('gilded-dragonboat')?.bonus);

console.log('\n--- Chief Gear ---');
console.log('gear slots:', chiefGearSlots().count());
console.log('Lancer slots:', chiefGearSlots().byTroopType('Lancer').count());
console.log('gear upgrade rows:', chiefGear().count());
console.log(
  'Mythic T2 Star 3 Stage 1 deployment capacity:',
  chiefGear().find('mythic-t2-star-3-stage-1')?.troopsDeploymentCapacity,
);

console.log('\n--- Chief Charm ---');
console.log('charm upgrade rows:', chiefCharm().count());
console.log('level 11 stage count:', chiefCharm().byLevel(11).count());

console.log('\n--- Research ---');
console.log('total research nodes:', research().count());
console.log('Battle research nodes:', research().byCategory('Battle').count());
console.log(
  'Lancer Armor I prerequisites:',
  research().find('lancer-armor-i')?.levels[0].prerequisites,
);

console.log('\n--- Hero Gear ---');
console.log('enhancement levels:', heroGearEnhancement().count());
console.log('empowerment levels:', heroGearEmpowerment().count());
console.log('mastery forging rows:', heroGearMasteryForging().count());
console.log('empowerment level 1 cost:', heroGearEmpowerment().find('level-1')?.cost);
console.log('empowerment level 100 cost:', heroGearEmpowerment().find('level-100')?.cost);

console.log('\n--- Server Timeline ---');
console.log('milestones:', serverTimeline().count());
const status = serverTimelineStatus('2026-07-01', '2026-10-11');
console.log('server age:', status.age);
console.log('unlocked milestones:', status.unlocked.length);
console.log('next unlock:', status.next?.name, status.next?.date);
console.log(
  'heroes unlocked:',
  status.unlocked.flatMap((m) => m.heroes.map((h) => h.name)).join(', '),
);

console.log('\n--- Fire Crystal Table ---');
const fireCrystal = fireCrystalTable();
console.log('buildings:', fireCrystal.rows.length);
console.log('columns:', fireCrystal.columns.length);
console.log('Furnace FC 1 Fire Crystals:', fireCrystal.rows[0].cells[0]);
console.log('FC 1 total:', fireCrystal.totals[0]);
console.log(
  'FC 6 to FC 10 columns:',
  fireCrystalTable(undefined, { from: 6, to: 10 }).columns.length,
);

console.log('\n--- Fire Crystal Shard Table ---');
const shards = fireCrystalShardTable();
console.log('columns:', shards.columns.length);
console.log('T11 Infantry unlock:', shards.rows[0].cells[0]);
console.log('T11 Infantry total:', shards.rows[shards.rows.length - 1].cells[0]);
console.log('T11 only columns:', fireCrystalShardTable(undefined, ['T11']).columns.length);
console.log('T12 Infantry Refined total:', shards.rows[shards.rows.length - 1].cells[2]);

console.log('\n--- Research Tree ---');
const tree = researchTree();
console.log('tabs:', tree.map((t) => `${t.name} (${t.nodes.length})`).join(', '));
console.log(
  'queues:',
  research()
    .get()
    .filter((n) => n.queue === 'warAcademy').length,
  'War Academy nodes',
);

console.log('\n--- Dailies ---');
console.log('daily routine steps:', dailies().count());
console.log('first step:', dailies().first()?.name);

console.log('\n--- Chief Orders ---');
const doubleTime = chiefOrders().find('double-time')!;
console.log('orders:', chiefOrders().count());
console.log(
  'Double Time ready again:',
  chiefOrderReadyAt(doubleTime, new Date('2026-10-12T10:00:00Z')).toISOString(),
);

console.log('\n--- Castle Appointments ---');
console.log('positions:', castleAppointments().count());
console.log(
  'ministers:',
  castleAppointments()
    .byKind('minister')
    .get()
    .map((a) => a.name),
);

console.log('\n--- President Skills ---');
console.log('skills:', presidentSkills().count());
console.log('Mobilize:', presidentSkills().find('mobilize')?.bonus?.value);

console.log('\n--- Troops ---');
const infantryTroop = troops().find('infantry')!;
console.log('camp level 19 trains tier:', highestTierAtCampLevel(infantryTroop, 19)?.tier);
console.log('tier 12 power:', infantryTroop.tiers[11].power);
console.log('tier 11 power at FC 10:', troopPower(infantryTroop, 11, 10));
console.log(
  'experts on the timeline:',
  serverTimeline()
    .get()
    .flatMap((m) => m.expertIds).length,
);

console.log('\n--- Chief Gear set bonus ---');
console.log(chiefGearSetBonus(Array(6).fill('mythic-t1-star-0')));
