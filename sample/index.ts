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
