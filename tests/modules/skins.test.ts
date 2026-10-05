import { SkinQuery, skins } from '@/modules/skins';
import { testQueryBaseContract } from '../helpers';

testQueryBaseContract('skins', () => skins());

describe('SkinQuery', () => {
  it('accepts an explicit source array', () => {
    const subset = skins().get().slice(0, 1);
    expect(new SkinQuery(subset).count()).toBe(1);
  });

  it('uses default data when constructed without arguments', () => {
    expect(new SkinQuery().count()).toBeGreaterThan(0);
  });

  it('bySkinType() filters to the given skin type', () => {
    const avatarFrames = skins().bySkinType('Avatar Frame');
    expect(avatarFrames.count()).toBe(69);
    expect(avatarFrames.get().every((s) => s.skinType === 'Avatar Frame')).toBe(true);
  });
});

describe('Skin catalog', () => {
  it('tracks 191 skins across 7 skin types', () => {
    expect(skins().count()).toBe(191);
    expect(skins().bySkinType('Avatar Frame').count()).toBe(69);
    expect(skins().bySkinType('Nameplate').count()).toBe(20);
    expect(skins().bySkinType('March Skin').count()).toBe(48);
    expect(skins().bySkinType('City Skin').count()).toBe(37);
    expect(skins().bySkinType('Teleport Skin').count()).toBe(5);
    expect(skins().bySkinType('Name Card').count()).toBe(10);
    expect(skins().bySkinType('Chief Profile').count()).toBe(2);
  });

  it('parses a clean Bonus line into a structured stat/value pair', () => {
    const gildedDragonboat = skins().find('gilded-dragonboat')!;
    expect(gildedDragonboat.bonus).toEqual({ stat: 'Troops Attack', value: '+2%' });
  });

  it('leaves bonus unset for skins with no stat bonus', () => {
    const birthdayAvatarFrame = skins().find('birthday-avatar-frame')!;
    expect(birthdayAvatarFrame.bonus).toBeUndefined();
  });

  it('distinguishes same-named skins across different skin types by id', () => {
    const gardenOfDelightsFrame = skins().find('garden-of-delights-2')!;
    const gardenOfDelightsCard = skins().find('garden-of-delights')!;
    expect(gardenOfDelightsFrame.skinType).toBe('Avatar Frame');
    expect(gardenOfDelightsCard.skinType).toBe('Name Card');
    expect(gardenOfDelightsFrame.name).toBe(gardenOfDelightsCard.name);
  });
});
