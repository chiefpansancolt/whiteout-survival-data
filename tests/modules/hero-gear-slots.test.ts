import { HeroGearSlotQuery, heroGearSlots } from '@/modules/hero-gear-slots';
import { heroGearStats } from '@/modules/hero-gear-stats';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { testQueryBaseContract } from '../helpers';

testQueryBaseContract('heroGearSlots', () => heroGearSlots());

describe('HeroGearSlotQuery', () => {
  it('accepts an explicit source array', () => {
    expect(new HeroGearSlotQuery(heroGearSlots().get().slice(0, 2)).count()).toBe(2);
  });

  it('uses default data when constructed without arguments', () => {
    expect(new HeroGearSlotQuery().count()).toBe(4);
  });
});

describe('hero gear slots', () => {
  it('lists Goggles, Gloves, Belt, and Boots in that order', () => {
    expect(
      heroGearSlots()
        .get()
        .map((s) => [s.id, s.name]),
    ).toEqual([
      ['goggles', 'Goggles'],
      ['gloves', 'Gloves'],
      ['belt', 'Belt'],
      ['boots', 'Boots'],
    ]);
  });

  it('has an icon file for each slot and troop type', () => {
    for (const slot of heroGearSlots().get()) {
      expect(Object.keys(slot.images)).toEqual(['infantry', 'lancer', 'marksman']);
      for (const [troopType, img] of Object.entries(slot.images)) {
        expect(img).toBe(`/images/hero-gear/${slot.id}-${troopType}.png`);
        expect(existsSync(join(__dirname, '../..', img))).toBe(true);
      }
    }
  });

  it('gives each icon a transparent background, as a PNG with an alpha channel', () => {
    const PNG_COLOR_TYPE_OFFSET = 25;
    const RGBA = 6;
    for (const slot of heroGearSlots().get()) {
      for (const img of Object.values(slot.images)) {
        const png = readFileSync(join(__dirname, '../..', img));
        expect(png[PNG_COLOR_TYPE_OFFSET]).toBe(RGBA);
      }
    }
  });

  it('has an icon for each entry of heroGearStats()', () => {
    for (const stats of heroGearStats().get()) {
      expect(heroGearSlots().find(stats.slot)!.images[stats.troopType]).toBe(
        `/images/hero-gear/${stats.id}.png`,
      );
    }
  });

  it('matches the slots of heroGearStats(), with one entry for each troop type', () => {
    for (const slot of heroGearSlots().get()) {
      const stats = heroGearStats().bySlot(slot.id);
      expect(stats.get().map((s) => s.troopType)).toEqual(['infantry', 'lancer', 'marksman']);
    }
    expect(
      new Set(
        heroGearStats()
          .get()
          .map((s) => s.slot),
      ),
    ).toEqual(
      new Set(
        heroGearSlots()
          .get()
          .map((s) => s.id),
      ),
    );
  });
});
