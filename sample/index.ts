import { buildings, experts, facilities, heroes, items, pets, skins } from '../src';

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
