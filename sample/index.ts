import { buildings } from '../src';

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
