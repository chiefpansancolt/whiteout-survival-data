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
