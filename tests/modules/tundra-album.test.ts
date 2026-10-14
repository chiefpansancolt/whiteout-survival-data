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
      ['island-splendors', 'mythic-general-decoration-component', 3],
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
      { itemId: 'enhancement-xp-component', amount: 100 },
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
      ['war-on-winter', 'coal', 2500],
      ['exploration-journal', 'polishing-solution', 30],
      ['hunting-guild', 'enhancement-xp-component', 7],
      ['the-raging-bear', 'speedup-general-3h', 3],
      ['treasure-kingdom', 'essence-stones', 3],
      ['wealth-is-knowledge', 'charm-guide', 8],
      ['ruins-of-old', 'mythic-general-decoration-component', 2],
      ['cryptid-days', 'speedup-troop-8h', 2],
      ['call-of-the-stars', 'lucky-hero-gear-chest', 4],
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
