import { events } from '@/modules/events';
import { items } from '@/modules/items';
import {
  TUNDRA_ALBUM_PUZZLES_PER_ALBUM,
  tundraAlbum,
  TundraAlbumQuery,
  tundraPuzzlePieceCounts,
} from '@/modules/tundra-album';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { testQueryBaseContract } from '../helpers';

testQueryBaseContract('tundraAlbum', () => tundraAlbum());

describe('TundraAlbumQuery', () => {
  it('accepts an explicit source array', () => {
    const subset = tundraAlbum().get().slice(0, 1);
    expect(new TundraAlbumQuery(subset).count()).toBe(1);
  });

  it('uses default data when constructed without arguments', () => {
    expect(new TundraAlbumQuery().count()).toBeGreaterThan(0);
  });
});

describe('Crystalline Mysteries', () => {
  const album = tundraAlbum().find('crystalline-mysteries')!;

  it('has the buff and the completion rewards of the album', () => {
    expect(album.name).toBe('Crystalline Mysteries');
    expect(album.buff).toEqual({
      stat: 'Troops Attack',
      statKey: 'troops-attack',
      value: '+2%',
      amount: 2,
      unit: 'percent',
    });
    expect(album.completionRewards).toEqual([
      { itemId: 'random-chief-charm-material-chest', amount: 70 },
      { itemId: 'fire-crystal', amount: 200 },
    ]);
  });

  it('gives the same buff as the Tundra Album event lists for it', () => {
    const reward = events()
      .find('tundra-album-2')!
      .rewards!.find((r) => r.name === 'Crystalline Mysteries buff')!;
    expect(reward.note).toBe('+2% troops attack');
  });

  it('has 9 puzzles, as every album does', () => {
    expect(TUNDRA_ALBUM_PUZZLES_PER_ALBUM).toBe(9);
    expect(album.puzzles).toHaveLength(TUNDRA_ALBUM_PUZZLES_PER_ALBUM);
    expect(album.puzzles.map((p) => p.name)).toEqual([
      'Fiery Crystal',
      'Mining the Fire',
      'Heirs of Empire',
      'Sins of Empire',
      'Fire Reborn',
      'The Burning Legion',
      'Promises of Fire',
      'Crystalline Rage',
      'Fire Crystal Era',
    ]);
  });

  it.each([
    ['fiery-crystal', [3, 3, 3, 3, 0]],
    ['mining-the-fire', [3, 5, 4, 2, 1]],
    ['heirs-of-empire', [3, 5, 4, 2, 1]],
    ['sins-of-empire', [3, 4, 4, 2, 2]],
    ['fire-reborn', [3, 3, 3, 3, 3]],
    ['the-burning-legion', [2, 4, 4, 4, 4]],
    ['promises-of-fire', [2, 3, 3, 5, 5]],
    ['crystalline-rage', [0, 2, 2, 7, 7]],
    ['fire-crystal-era', [0, 2, 2, 7, 7]],
  ])('has the pieces of %s at each star level: %j', (id, counts) => {
    const puzzle = album.puzzles.find((p) => p.id === id)!;
    expect(Object.values(tundraPuzzlePieceCounts(puzzle))).toEqual(counts);
    expect(puzzle.pieces).toHaveLength(counts.reduce((a, b) => a + b, 0));
  });

  it('has 144 pieces, and the pieces of a puzzle are in order of stars with unique ids', () => {
    const all = album.puzzles.flatMap((p) => p.pieces);
    expect(all).toHaveLength(144);
    expect(new Set(all.map((p) => p.id)).size).toBe(144);
    for (const puzzle of album.puzzles) {
      puzzle.pieces.forEach((piece, i) => expect(piece.id).toBe(`${puzzle.id}-${i + 1}`));
      const stars = puzzle.pieces.map((p) => p.stars);
      expect(stars).toEqual([...stars].sort((a, b) => a - b));
    }
    const totals = [1, 2, 3, 4, 5].map((s) => all.filter((p) => p.stars === s).length);
    expect(totals).toEqual([19, 31, 29, 35, 30]);
  });

  it('names each piece with the name of its puzzle, a dash, and its position', () => {
    for (const puzzle of album.puzzles) {
      puzzle.pieces.forEach((piece, i) => expect(piece.name).toBe(`${puzzle.name} - ${i + 1}`));
    }
    const puzzle = album.puzzles[0];
    expect(puzzle.pieces.map((p) => p.name).slice(0, 3)).toEqual([
      'Fiery Crystal - 1',
      'Fiery Crystal - 2',
      'Fiery Crystal - 3',
    ]);
    expect(album.puzzles[5].pieces[17].name).toBe('The Burning Legion - 18');
    const names = album.puzzles.flatMap((p) => p.pieces.map((piece) => piece.name));
    expect(new Set(names).size).toBe(144);
  });

  it('finds a piece by its name through the id of the album and the puzzle', () => {
    const piece = album.puzzles
      .flatMap((p) => p.pieces)
      .find((p) => p.name === 'Mining the Fire - 15')!;
    expect(piece.id).toBe('mining-the-fire-15');
    expect(piece.stars).toBe(5);
  });

  it('gives each puzzle its reward item and amount', () => {
    const rewards = album.puzzles.map((p) => [p.id, p.reward.itemId, p.reward.amount]);
    expect(rewards).toEqual([
      ['fiery-crystal', 'enhancement-xp-component', 7],
      ['mining-the-fire', 'essence-stones', 3],
      ['heirs-of-empire', 'chief-gear-materials-chest', 3],
      ['sins-of-empire', 'essence-stones', 3],
      ['fire-reborn', 'mythic-general-hero-shard', 2],
      ['the-burning-legion', 'fire-crystal', 24],
      ['promises-of-fire', 'fire-crystal', 30],
      ['crystalline-rage', 'fire-crystal', 30],
      ['fire-crystal-era', 'fire-crystal', 30],
    ]);
  });

  it('links every known reward item to items()', () => {
    const rewards = [...album.completionRewards, ...album.puzzles.map((p) => p.reward)];
    const linked = rewards.filter((r) => r.itemId !== undefined);
    expect(linked).toHaveLength(11);
    for (const reward of linked) expect(items().find(reward.itemId!)).toBeDefined();
  });
});

describe('Crystalline Mysteries images', () => {
  const album = tundraAlbum().find('crystalline-mysteries')!;
  const exists = (img: string) => existsSync(join(__dirname, '../..', img));

  it('has an image for every puzzle and every piece, and the files exist', () => {
    const images = album.puzzles.flatMap((p) => [p.img, ...p.pieces.map((piece) => piece.img)]);
    expect(images).toHaveLength(9 + 144);
    for (const img of images) {
      expect(img).toBeDefined();
      expect(exists(img!)).toBe(true);
    }
  });

  it('names each image file after its id in the folder of the album', () => {
    for (const puzzle of album.puzzles) {
      expect(puzzle.img).toBe(`/images/tundra-album/${album.id}/${puzzle.id}.png`);
      for (const piece of puzzle.pieces) {
        expect(piece.img).toBe(`/images/tundra-album/${album.id}/${piece.id}.png`);
      }
    }
  });

  it('has no image file in the folder that the data does not use', () => {
    const used = new Set(
      album.puzzles.flatMap((p) => [p.img, ...p.pieces.map((piece) => piece.img)]),
    );
    const folder = join(__dirname, '../../images/tundra-album', album.id);
    const files = readdirSync(folder).map((f) => `/images/tundra-album/${album.id}/${f}`);
    expect(files.filter((f) => !used.has(f))).toEqual([]);
    expect(files).toHaveLength(153);
  });
});

describe('Daybreak Island', () => {
  const album = tundraAlbum().find('daybreak-island')!;
  const exists = (img: string) => existsSync(join(__dirname, '../..', img));

  it('has the buff and the completion rewards of the album', () => {
    expect(album.name).toBe('Daybreak Island');
    expect(album.buff).toEqual({
      stat: 'Troops Defense',
      statKey: 'troops-defense',
      value: '+2%',
      amount: 2,
      unit: 'percent',
    });
    expect(album.completionRewards).toEqual([
      { itemId: 'mythic-general-decoration-component', amount: 16 },
      { itemId: 'speedup-general-8h', amount: 15 },
    ]);
  });

  it('gives the same buff as the Tundra Album event lists for it', () => {
    const reward = events()
      .find('tundra-album-2')!
      .rewards!.find((r) => r.name === 'Daybreak Island buff')!;
    expect(reward.note).toBe('+2% troops defense');
  });

  it('has the 9 puzzles of the album in the order of the game', () => {
    expect(album.puzzles).toHaveLength(TUNDRA_ALBUM_PUZZLES_PER_ALBUM);
    expect(album.puzzles.map((p) => p.name)).toEqual([
      'Daybreak Island Legend',
      'Island of Dreams',
      'Tree of Life',
      'Call of the Sea',
      'Distant Resonance',
      'Caravan Visit',
      'New Home',
      'Daybreak Song',
      'Island Splendors',
    ]);
  });

  it.each([
    ['daybreak-island-legend', [4, 4, 3, 1, 0]],
    ['island-of-dreams', [3, 3, 4, 2, 0]],
    ['tree-of-life', [3, 3, 3, 3, 0]],
    ['call-of-the-sea', [3, 5, 4, 2, 1]],
    ['distant-resonance', [3, 4, 4, 2, 2]],
    ['caravan-visit', [3, 3, 3, 3, 3]],
    ['new-home', [2, 4, 4, 4, 4]],
    ['daybreak-song', [2, 3, 3, 5, 5]],
    ['island-splendors', [0, 2, 2, 7, 7]],
  ])('has the pieces of %s at each star level: %j', (id, counts) => {
    const puzzle = album.puzzles.find((p) => p.id === id)!;
    expect(Object.values(tundraPuzzlePieceCounts(puzzle))).toEqual(counts);
    expect(puzzle.pieces).toHaveLength(counts.reduce((a, b) => a + b, 0));
  });

  it('has 135 pieces, named and numbered by puzzle, in order of stars', () => {
    const all = album.puzzles.flatMap((p) => p.pieces);
    expect(all).toHaveLength(135);
    expect(new Set(all.map((p) => p.id)).size).toBe(135);
    for (const puzzle of album.puzzles) {
      puzzle.pieces.forEach((piece, i) => {
        expect(piece.id).toBe(`${puzzle.id}-${i + 1}`);
        expect(piece.name).toBe(`${puzzle.name} - ${i + 1}`);
      });
      const stars = puzzle.pieces.map((p) => p.stars);
      expect(stars).toEqual([...stars].sort((a, b) => a - b));
    }
    const totals = [1, 2, 3, 4, 5].map((s) => all.filter((p) => p.stars === s).length);
    expect(totals).toEqual([23, 31, 30, 29, 22]);
  });

  it('gives each puzzle its reward', () => {
    expect(album.puzzles.map((p) => [p.id, p.reward.itemId, p.reward.amount])).toEqual([
      ['daybreak-island-legend', 'polishing-solution', 30],
      ['island-of-dreams', 'enhancement-xp-component', 7],
      ['tree-of-life', 'speedup-general-3h', 3],
      ['call-of-the-sea', 'chief-gear-materials-chest', 3],
      ['distant-resonance', 'lucky-hero-gear-chest', 4],
      ['caravan-visit', 'design-plans', 10],
      ['new-home', 'mythic-general-decoration-component', 1],
      ['daybreak-song', 'mythic-general-decoration-component', 1],
      ['island-splendors', 'mythic-general-hero-shard', 3],
    ]);
  });

  it('links every known reward item to items()', () => {
    const rewards = [...album.completionRewards, ...album.puzzles.map((p) => p.reward)];
    const linked = rewards.filter((r) => r.itemId !== undefined);
    expect(linked).toHaveLength(11);
    for (const reward of linked) expect(items().find(reward.itemId!)).toBeDefined();
  });

  it('has an image file for every puzzle and piece, named after its id, and none unused', () => {
    const images = album.puzzles.flatMap((p) => [p.img, ...p.pieces.map((piece) => piece.img)]);
    expect(images).toHaveLength(9 + 135);
    for (const puzzle of album.puzzles) {
      expect(puzzle.img).toBe(`/images/tundra-album/${album.id}/${puzzle.id}.png`);
      for (const piece of puzzle.pieces) {
        expect(piece.img).toBe(`/images/tundra-album/${album.id}/${piece.id}.png`);
      }
    }
    for (const img of images) expect(exists(img!)).toBe(true);
    const folder = join(__dirname, '../../images/tundra-album', album.id);
    const files = readdirSync(folder).map((f) => `/images/tundra-album/${album.id}/${f}`);
    expect(files.filter((f) => !images.includes(f))).toEqual([]);
    expect(files).toHaveLength(144);
  });
});

describe('Explore the World', () => {
  const album = tundraAlbum().find('explore-the-world')!;
  const exists = (img: string) => existsSync(join(__dirname, '../..', img));

  it('has the buff and the completion rewards of the album', () => {
    expect(album.name).toBe('Explore the World');
    expect(album.buff).toEqual({
      stat: 'Troops Attack',
      statKey: 'troops-attack',
      value: '+2%',
      amount: 2,
      unit: 'percent',
    });
    expect(album.completionRewards).toEqual([
      { itemId: 'speedup-troop-8h', amount: 30 },
      { itemId: 'enhancement-xp-component', amount: 100, size: 100 },
    ]);
  });

  it('gives the same buff as the Tundra Album event lists for it', () => {
    const reward = events()
      .find('tundra-album-2')!
      .rewards!.find((r) => r.name === 'Explore the World buff')!;
    expect(reward.note).toBe('+2% troops attack');
  });

  it('has the 9 puzzles of the album in the order of the game', () => {
    expect(album.puzzles).toHaveLength(TUNDRA_ALBUM_PUZZLES_PER_ALBUM);
    expect(album.puzzles.map((p) => p.name)).toEqual([
      'War on Winter',
      'Exploration Journal',
      'Hunting Guild',
      'The Raging Bear',
      'Treasure Kingdom',
      'Wealth Is Knowledge',
      'Ruins of Old',
      'Cryptid Days',
      'Call of the Stars',
    ]);
  });

  it.each([
    ['war-on-winter', [4, 3, 2, 0, 0]],
    ['exploration-journal', [4, 4, 3, 1, 0]],
    ['hunting-guild', [3, 3, 4, 2, 0]],
    ['the-raging-bear', [3, 3, 3, 3, 0]],
    ['treasure-kingdom', [3, 5, 4, 2, 1]],
    ['wealth-is-knowledge', [3, 4, 4, 2, 2]],
    ['ruins-of-old', [3, 3, 3, 3, 3]],
    ['cryptid-days', [2, 4, 4, 4, 4]],
    ['call-of-the-stars', [2, 3, 3, 5, 5]],
  ])('has the pieces of %s at each star level: %j', (id, counts) => {
    const puzzle = album.puzzles.find((p) => p.id === id)!;
    expect(Object.values(tundraPuzzlePieceCounts(puzzle))).toEqual(counts);
    expect(puzzle.pieces).toHaveLength(counts.reduce((a, b) => a + b, 0));
  });

  it('has 126 pieces, named and numbered by puzzle, in order of stars', () => {
    const all = album.puzzles.flatMap((p) => p.pieces);
    expect(all).toHaveLength(126);
    expect(new Set(all.map((p) => p.id)).size).toBe(126);
    for (const puzzle of album.puzzles) {
      puzzle.pieces.forEach((piece, i) => {
        expect(piece.id).toBe(`${puzzle.id}-${i + 1}`);
        expect(piece.name).toBe(`${puzzle.name} - ${i + 1}`);
      });
      const stars = puzzle.pieces.map((p) => p.stars);
      expect(stars).toEqual([...stars].sort((a, b) => a - b));
    }
    const totals = [1, 2, 3, 4, 5].map((s) => all.filter((p) => p.stars === s).length);
    expect(totals).toEqual([27, 32, 30, 22, 15]);
  });

  it('gives each puzzle its reward, linked to an item of items()', () => {
    expect(album.puzzles.map((p) => [p.id, p.reward.itemId, p.reward.amount])).toEqual([
      ['war-on-winter', 'hardened-alloy', 2500],
      ['exploration-journal', 'polishing-solution', 30],
      ['hunting-guild', 'enhancement-xp-component', 7],
      ['the-raging-bear', 'speedup-general-3h', 3],
      ['treasure-kingdom', 'essence-stones', 3],
      ['wealth-is-knowledge', 'charm-guide', 8],
      ['ruins-of-old', 'mythic-general-hero-shard', 2],
      ['cryptid-days', 'speedup-troop-8h', 2],
      ['call-of-the-stars', 'random-chief-charm-material-chest', 4],
    ]);
    const rewards = [...album.completionRewards, ...album.puzzles.map((p) => p.reward)];
    for (const reward of rewards) expect(items().find(reward.itemId!)).toBeDefined();
  });

  it('has an image file for every puzzle and piece, named after its id, and none unused', () => {
    const images = album.puzzles.flatMap((p) => [p.img, ...p.pieces.map((piece) => piece.img)]);
    expect(images).toHaveLength(9 + 126);
    for (const puzzle of album.puzzles) {
      expect(puzzle.img).toBe(`/images/tundra-album/${album.id}/${puzzle.id}.png`);
      for (const piece of puzzle.pieces) {
        expect(piece.img).toBe(`/images/tundra-album/${album.id}/${piece.id}.png`);
      }
    }
    for (const img of images) expect(exists(img!)).toBe(true);
    const folder = join(__dirname, '../../images/tundra-album', album.id);
    const files = readdirSync(folder).map((f) => `/images/tundra-album/${album.id}/${f}`);
    expect(files.filter((f) => !images.includes(f))).toEqual([]);
    expect(files).toHaveLength(135);
  });
});

describe('Song of Heroes', () => {
  const album = tundraAlbum().find('song-of-heroes')!;
  const exists = (img: string) => existsSync(join(__dirname, '../..', img));

  it('has the buff and the completion rewards of the album', () => {
    expect(album.name).toBe('Song of Heroes');
    expect(album.buff).toEqual({
      stat: 'Resource Gathering Speed',
      statKey: 'resource-gathering-speed',
      value: '+5%',
      amount: 5,
      unit: 'percent',
    });
    expect(album.completionRewards).toEqual([
      { itemId: 'mythic-general-hero-shard', amount: 40 },
      { itemId: 'lucky-hero-gear-chest', amount: 50 },
    ]);
  });

  it('gives the same buff as the Tundra Album event lists for it', () => {
    const reward = events()
      .find('tundra-album-2')!
      .rewards!.find((r) => r.name === 'Song of Heroes buff')!;
    expect(reward.note).toBe('+5% resource gathering speed');
  });

  it('has the 9 puzzles of the album in the order of the game', () => {
    expect(album.puzzles).toHaveLength(TUNDRA_ALBUM_PUZZLES_PER_ALBUM);
    expect(album.puzzles.map((p) => p.name)).toEqual([
      'Dauntless Heroes',
      'Snow Angel',
      'Everyday Champions',
      "Arcadia's Legacy",
      '"I Am the Fire."',
      'Artisan Architect',
      'Life Vs Death',
      'The Icebreakers',
      'Epic of a New World',
    ]);
  });

  it.each([
    ['dauntless-heroes', [5, 3, 1, 0, 0]],
    ['snow-angel', [4, 3, 2, 0, 0]],
    ['everyday-champions', [4, 4, 3, 1, 0]],
    ['arcadias-legacy', [3, 3, 4, 2, 0]],
    ['i-am-the-fire', [3, 3, 3, 3, 0]],
    ['artisan-architect', [3, 5, 4, 2, 1]],
    ['life-vs-death', [3, 4, 4, 2, 2]],
    ['the-icebreakers', [3, 3, 3, 3, 3]],
    ['epic-of-a-new-world', [2, 4, 4, 4, 4]],
  ])('has the pieces of %s at each star level: %j', (id, counts) => {
    const puzzle = album.puzzles.find((p) => p.id === id)!;
    expect(Object.values(tundraPuzzlePieceCounts(puzzle))).toEqual(counts);
    expect(puzzle.pieces).toHaveLength(counts.reduce((a, b) => a + b, 0));
  });

  it('has 117 pieces, named and numbered by puzzle, in order of stars', () => {
    const all = album.puzzles.flatMap((p) => p.pieces);
    expect(all).toHaveLength(117);
    expect(new Set(all.map((p) => p.id)).size).toBe(117);
    for (const puzzle of album.puzzles) {
      puzzle.pieces.forEach((piece, i) => {
        expect(piece.id).toBe(`${puzzle.id}-${i + 1}`);
        expect(piece.name).toBe(`${puzzle.name} - ${i + 1}`);
      });
      const stars = puzzle.pieces.map((p) => p.stars);
      expect(stars).toEqual([...stars].sort((a, b) => a - b));
    }
    const totals = [1, 2, 3, 4, 5].map((s) => all.filter((p) => p.stars === s).length);
    expect(totals).toEqual([30, 32, 28, 17, 10]);
  });

  it('gives each puzzle its reward, linked to an item of items()', () => {
    expect(album.puzzles.map((p) => [p.id, p.reward.itemId, p.reward.amount])).toEqual([
      ['dauntless-heroes', 'enhancement-xp-component', 45],
      ['snow-angel', 'hardened-alloy', 2500],
      ['everyday-champions', 'polishing-solution', 30],
      ['arcadias-legacy', 'enhancement-xp-component', 7],
      ['i-am-the-fire', 'speedup-general-3h', 3],
      ['artisan-architect', 'chief-gear-materials-chest', 3],
      ['life-vs-death', 'lucky-hero-gear-chest', 4],
      ['the-icebreakers', 'design-plans', 10],
      ['epic-of-a-new-world', 'lucky-hero-gear-chest', 6],
    ]);
    const rewards = [...album.completionRewards, ...album.puzzles.map((p) => p.reward)];
    for (const reward of rewards) expect(items().find(reward.itemId!)).toBeDefined();
  });

  it('has an image file for every puzzle and piece, named after its id, and none unused', () => {
    const images = album.puzzles.flatMap((p) => [p.img, ...p.pieces.map((piece) => piece.img)]);
    expect(images).toHaveLength(9 + 117);
    for (const puzzle of album.puzzles) {
      expect(puzzle.img).toBe(`/images/tundra-album/${album.id}/${puzzle.id}.png`);
      for (const piece of puzzle.pieces) {
        expect(piece.img).toBe(`/images/tundra-album/${album.id}/${piece.id}.png`);
      }
    }
    for (const img of images) expect(exists(img!)).toBe(true);
    const folder = join(__dirname, '../../images/tundra-album', album.id);
    const files = readdirSync(folder).map((f) => `/images/tundra-album/${album.id}/${f}`);
    expect(files.filter((f) => !images.includes(f))).toEqual([]);
    expect(files).toHaveLength(126);
  });
});

describe('Rekindled Flames', () => {
  const album = tundraAlbum().find('rekindled-flames')!;
  const exists = (img: string) => existsSync(join(__dirname, '../..', img));

  it('has the buff and the completion rewards of the album', () => {
    expect(album.name).toBe('Rekindled Flames');
    expect(album.buff).toEqual({
      stat: 'Resource Production Speed',
      statKey: 'resource-production-speed',
      value: '+5%',
      amount: 5,
      unit: 'percent',
    });
    expect(album.completionRewards).toEqual([
      { itemId: 'speedup-general-8h', amount: 30 },
      { itemId: 'mythic-general-hero-shard', amount: 20 },
    ]);
  });

  it('gives the same buff as the Tundra Album event lists for it', () => {
    const reward = events()
      .find('tundra-album-2')!
      .rewards!.find((r) => r.name === 'Rekindled Flames buff')!;
    expect(reward.note).toBe('+5% resource production speed');
  });

  it('has the 9 puzzles of the album in the order of the game', () => {
    expect(album.puzzles).toHaveLength(TUNDRA_ALBUM_PUZZLES_PER_ALBUM);
    expect(album.puzzles.map((p) => p.name)).toEqual([
      'Furnace',
      'City Founding',
      'Dawn Alliance',
      'Decisions',
      'Menace Afoot',
      'Heroes',
      'Food Power',
      'A New Order',
      'True Explorer',
    ]);
  });

  it.each([
    ['furnace', [7, 2, 0, 0, 0]],
    ['city-founding', [5, 3, 1, 0, 0]],
    ['dawn-alliance', [4, 3, 2, 0, 0]],
    ['decisions', [4, 4, 3, 1, 0]],
    ['menace-afoot', [3, 3, 4, 2, 0]],
    ['heroes', [3, 3, 3, 3, 0]],
    ['food-power', [3, 5, 4, 2, 1]],
    ['a-new-order', [3, 4, 4, 2, 2]],
    ['true-explorer', [3, 3, 3, 3, 3]],
  ])('has the pieces of %s at each star level: %j', (id, counts) => {
    const puzzle = album.puzzles.find((p) => p.id === id)!;
    expect(Object.values(tundraPuzzlePieceCounts(puzzle))).toEqual(counts);
    expect(puzzle.pieces).toHaveLength(counts.reduce((a, b) => a + b, 0));
  });

  it('has 108 pieces, named and numbered by puzzle, in order of stars', () => {
    const all = album.puzzles.flatMap((p) => p.pieces);
    expect(all).toHaveLength(108);
    expect(new Set(all.map((p) => p.id)).size).toBe(108);
    for (const puzzle of album.puzzles) {
      puzzle.pieces.forEach((piece, i) => {
        expect(piece.id).toBe(`${puzzle.id}-${i + 1}`);
        expect(piece.name).toBe(`${puzzle.name} - ${i + 1}`);
      });
      const stars = puzzle.pieces.map((p) => p.stars);
      expect(stars).toEqual([...stars].sort((a, b) => a - b));
    }
    const totals = [1, 2, 3, 4, 5].map((s) => all.filter((p) => p.stars === s).length);
    expect(totals).toEqual([35, 30, 24, 13, 6]);
  });

  it('gives each puzzle its reward, linked to an item of items()', () => {
    expect(album.puzzles.map((p) => [p.id, p.reward.itemId, p.reward.amount])).toEqual([
      ['furnace', 'hardened-alloy', 2000],
      ['city-founding', 'enhancement-xp-component', 45],
      ['dawn-alliance', 'speedup-general-1h', 6],
      ['decisions', 'polishing-solution', 30],
      ['menace-afoot', 'enhancement-xp-component', 7],
      ['heroes', 'speedup-general-3h', 3],
      ['food-power', 'essence-stones', 3],
      ['a-new-order', 'charm-guide', 8],
      ['true-explorer', 'mythic-general-hero-shard', 2],
    ]);
    const rewards = [...album.completionRewards, ...album.puzzles.map((p) => p.reward)];
    for (const reward of rewards) expect(items().find(reward.itemId!)).toBeDefined();
  });

  it('has an image file for every puzzle and piece, named after its id, and none unused', () => {
    const images = album.puzzles.flatMap((p) => [p.img, ...p.pieces.map((piece) => piece.img)]);
    expect(images).toHaveLength(9 + 108);
    for (const puzzle of album.puzzles) {
      expect(puzzle.img).toBe(`/images/tundra-album/${album.id}/${puzzle.id}.png`);
      for (const piece of puzzle.pieces) {
        expect(piece.img).toBe(`/images/tundra-album/${album.id}/${piece.id}.png`);
      }
    }
    for (const img of images) expect(exists(img!)).toBe(true);
    const folder = join(__dirname, '../../images/tundra-album', album.id);
    const files = readdirSync(folder).map((f) => `/images/tundra-album/${album.id}/${f}`);
    expect(files.filter((f) => !images.includes(f))).toEqual([]);
    expect(files).toHaveLength(117);
  });
});

const NEW_ALBUMS = [
  {
    id: 'tundra-alliance',
    name: 'Tundra Alliance',
    stat: 'Troops Attack',
    statKey: 'troops-attack',
    eventNote: '+2% troops attack',
    completion: [
      ['lucky-hero-gear-chest', 100],
      ['essence-stones', 40],
    ],
    pieces: 141,
    puzzles: [
      ['alliance-building', 'Alliance-Building', [3, 3, 4, 2, 0], 'polishing-solution', 35],
      ['one-heart', 'One Heart', [3, 3, 3, 3, 0], 'enhancement-xp-component', 7],
      ['heroes-aid', "Heroes' Aid", [3, 5, 4, 2, 1], 'essence-stones', 3],
      ['alliance-resources', 'Alliance Resources', [3, 4, 4, 2, 2], 'charm-guide', 8],
      ['twisted-obsession', 'Twisted Obsession', [3, 3, 3, 3, 3], 'mythic-general-hero-shard', 2],
      ['virtues-and-crimes', 'Virtues and Crimes', [2, 4, 4, 4, 4], 'speedup-general-8h', 2],
      [
        'children-of-the-new-world',
        'Children of the "New World"',
        [2, 3, 3, 5, 5],
        'chief-gear-materials-chest',
        5,
      ],
      ['horn-of-command', 'Horn of Command', [2, 3, 3, 5, 5], 'essence-stones', 5],
      ['battlefield-epic', 'Battlefield Epic', [0, 2, 2, 7, 7], 'mythic-general-hero-shard', 3],
    ],
  },
  {
    id: 'battlefield-epic',
    name: 'Battlefield Epic',
    stat: 'Troops Defense',
    statKey: 'troops-defense',
    eventNote: '+2% troops defense',
    completion: [
      ['chief-gear-materials-chest', 80],
      ['design-plans', 100],
    ],
    pieces: 144,
    puzzles: [
      ['imperial-foundry', 'Imperial Foundry', [3, 3, 3, 3, 0], 'speedup-general-3h', 3],
      ['king-of-the-battlefield', 'King of the Battlefield', [3, 5, 4, 2, 1], 'essence-stones', 3],
      ['orichalcum', 'Orichalcum', [3, 5, 4, 2, 1], 'chief-gear-materials-chest', 3],
      ['city-of-kings', 'City of Kings', [3, 4, 4, 2, 2], 'lucky-hero-gear-chest', 4],
      ['pilots-paradise', "Pilot's Paradise", [3, 3, 3, 3, 3], 'design-plans', 10],
      ['great-contest', 'Great Contest', [2, 4, 4, 4, 4], 'lucky-hero-gear-chest', 6],
      ['canyon-clash', 'Canyon Clash', [2, 3, 3, 5, 5], 'speedup-troop-8h', 2],
      ['heros-glory', "Hero's Glory", [0, 2, 2, 7, 7], 'charm-design', 15],
      ['grand-banquet', 'Grand Banquet', [0, 2, 2, 7, 7], 'mythic-general-hero-shard', 3],
    ],
  },
  {
    id: 'spectacular-adventures',
    name: 'Spectacular Adventures',
    stat: 'Troops Attack',
    statKey: 'troops-attack',
    eventNote: '+2% troops attack',
    completion: [
      ['random-chief-charm-material-chest', 70],
      ['charm-design', 100],
    ],
    pieces: 144,
    puzzles: [
      ['fishing-tournament', 'Fishing Tournament', [3, 3, 3, 3, 0], 'polishing-solution', 35],
      ['snowbusters', 'Snowbusters', [3, 5, 4, 2, 1], 'essence-stones', 3],
      ['bandit', 'Bandit', [3, 5, 4, 2, 1], 'chief-gear-materials-chest', 3],
      ['red-haired-joe', 'Red-Haired Joe', [3, 4, 4, 2, 2], 'charm-guide', 8],
      ['a-queen-arises', 'A "Queen" Arises', [3, 3, 3, 3, 3], 'mythic-general-hero-shard', 2],
      ['the-eagles', 'The Eagles', [2, 4, 4, 4, 4], 'lucky-hero-gear-chest', 6],
      ['bounty-hunter', 'Bounty Hunter', [2, 3, 3, 5, 5], 'speedup-general-8h', 2],
      ['wandering-merchant', 'Wandering Merchant', [0, 2, 2, 7, 7], 'mythic-general-hero-shard', 3],
      ['tundra-adventure', 'Tundra Adventure', [0, 2, 2, 7, 7], 'design-plans', 15],
    ],
  },
];

describe.each(NEW_ALBUMS)('$name', (spec) => {
  const album = tundraAlbum().find(spec.id)!;
  const exists = (img: string) => existsSync(join(__dirname, '../..', img));
  const pieces = album.puzzles.flatMap((p) => p.pieces);

  it('has the buff and the completion rewards of the album', () => {
    expect(album.name).toBe(spec.name);
    expect(album.buff).toEqual({
      stat: spec.stat,
      statKey: spec.statKey,
      value: '+2%',
      amount: 2,
      unit: 'percent',
    });
    expect(album.completionRewards.map((r) => [r.itemId, r.amount])).toEqual(spec.completion);
  });

  it('gives the same buff as the Tundra Album event lists for it', () => {
    const reward = events()
      .find('tundra-album-2')!
      .rewards!.find((r) => r.name.replace('\u2019', "'") === `${spec.name} buff`)!;
    expect(reward.note).toBe(spec.eventNote);
  });

  it('has the 9 puzzles of the album in the order of the game, with their ids', () => {
    expect(album.puzzles).toHaveLength(TUNDRA_ALBUM_PUZZLES_PER_ALBUM);
    expect(album.puzzles.map((p) => [p.id, p.name])).toEqual(spec.puzzles.map((p) => [p[0], p[1]]));
  });

  it('has the pieces of each puzzle at each star level, and each reward linked to an item', () => {
    expect(
      album.puzzles.map((p) => [
        p.id,
        p.name,
        Object.values(tundraPuzzlePieceCounts(p)),
        p.reward.itemId,
        p.reward.amount,
      ]),
    ).toEqual(spec.puzzles);
    const rewards = [...album.completionRewards, ...album.puzzles.map((p) => p.reward)];
    for (const reward of rewards) expect(items().find(reward.itemId!)).toBeDefined();
  });

  it('has its pieces named and numbered by puzzle, in order of stars', () => {
    expect(pieces).toHaveLength(spec.pieces);
    expect(new Set(pieces.map((p) => p.id)).size).toBe(spec.pieces);
    for (const puzzle of album.puzzles) {
      puzzle.pieces.forEach((piece, i) => {
        expect(piece.id).toBe(`${puzzle.id}-${i + 1}`);
        expect(piece.name).toBe(`${puzzle.name} - ${i + 1}`);
      });
      const stars = puzzle.pieces.map((p) => p.stars);
      expect(stars).toEqual([...stars].sort((a, b) => a - b));
    }
  });

  it('has an image for every puzzle and every piece, and no unused file', () => {
    const images = [...album.puzzles.map((p) => p.img), ...pieces.map((p) => p.img)].filter(
      (img): img is string => img !== undefined,
    );
    expect(images).toHaveLength(9 + spec.pieces);
    for (const puzzle of album.puzzles) {
      expect(puzzle.img).toBe(`/images/tundra-album/${album.id}/${puzzle.id}.png`);
    }
    for (const piece of pieces) {
      expect(piece.img).toBe(`/images/tundra-album/${album.id}/${piece.id}.png`);
    }
    for (const img of images) expect(exists(img)).toBe(true);
    const folder = join(__dirname, '../../images/tundra-album', album.id);
    const files = readdirSync(folder).map((f) => `/images/tundra-album/${album.id}/${f}`);
    expect(files.filter((f) => !images.includes(f))).toEqual([]);
    expect(files).toHaveLength(images.length);
  });
});

describe('tundraPuzzlePieceCounts', () => {
  it('counts the pieces of a puzzle by stars', () => {
    const puzzle = tundraAlbum().find('crystalline-mysteries')!.puzzles[1];
    expect(tundraPuzzlePieceCounts(puzzle)).toEqual({ 1: 3, 2: 5, 3: 4, 4: 2, 5: 1 });
    expect(tundraPuzzlePieceCounts({ ...puzzle, pieces: [] })).toEqual({
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    });
  });
});

describe('the size of an Enhancement XP Component reward', () => {
  const rewards = tundraAlbum()
    .get()
    .flatMap((album) => [...album.completionRewards, ...album.puzzles.map((p) => p.reward)]);

  it('is set on every Enhancement XP Component reward and on no other reward', () => {
    for (const reward of rewards) {
      expect(reward.size !== undefined).toBe(reward.itemId === 'enhancement-xp-component');
    }
  });

  it('is the 10 component for 45 of them and the 100 component for the rest', () => {
    const components = rewards.filter((r) => r.size !== undefined);
    expect(components).toHaveLength(9);
    for (const reward of components) expect(reward.size).toBe(reward.amount === 45 ? 10 : 100);
    expect(components.filter((r) => r.size === 10)).toHaveLength(2);
  });
});
