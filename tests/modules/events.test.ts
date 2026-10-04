import { decoration } from '@/modules/daybreak-island';
import { eventBuff } from '@/modules/event-buff';
import { events, EventsQuery } from '@/modules/events';
import { items } from '@/modules/items';
import { skins } from '@/modules/skins';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { testQueryBaseContract } from '../helpers';

testQueryBaseContract('events', () => events());

describe('EventsQuery', () => {
  it('accepts an explicit source array', () => {
    const subset = events().get().slice(0, 1);
    expect(new EventsQuery(subset).count()).toBe(1);
  });

  it('uses default data when constructed without arguments', () => {
    expect(new EventsQuery().count()).toBeGreaterThan(0);
  });

  it('filters by category', () => {
    const solo = events().byCategory('solo');
    expect(solo.get().map((e) => e.id)).toEqual([
      'frostfire-mine',
      'icefire-warhymn-league',
      'tundra-trade-route',
    ]);
    expect(events().byCategory('alliance').count()).toBe(7);
    expect(events().byCategory('rookie').count()).toBe(0);
  });
});

describe('Events data', () => {
  it('registers every file in data/events', () => {
    const files = readdirSync(join(__dirname, '../../data/events'))
      .map((f) => f.replace('.json', ''))
      .sort();
    expect(
      events()
        .get()
        .map((e) => e.id)
        .sort(),
    ).toEqual(files);
  });

  it('links each event to an icon in images/events', () => {
    events()
      .get()
      .forEach((e) => {
        expect(e.img).toBe(`/images/events/${e.id}.png`);
        expect(existsSync(join(__dirname, '../..', e.img))).toBe(true);
      });
  });

  it('points every eventBuffId at an existing event buff row', () => {
    events()
      .get()
      .filter((e) => e.eventBuffId !== undefined)
      .forEach((e) => expect(eventBuff().find(e.eventBuffId!)).toBeDefined());
  });

  it('transcribes stated details from the wiki', () => {
    const joe = events().find('crazy-joe')!;
    expect(joe.frequency).toContain('Tuesday and Thursday');
    const championship = events().find('alliance-championship')!;
    expect(championship.phases!.map((p) => p.name)).toEqual([
      'Sign-up',
      'Matchmaking',
      'Preparation',
      'Battle',
      'Completion',
    ]);
    expect(championship.tiers!.map((t) => t.name)).toEqual([
      'Iron',
      'Bronze',
      'Silver',
      'Gold',
      'Diamond',
      'Ultimate',
    ]);
    expect(events().find('foundry-battle')!.frequency).toBeUndefined();
  });

  it('lists 4 group rankings per Alliance Championship tier with speedup, chest, and badge rewards', () => {
    const championship = events().find('alliance-championship')!;
    championship.tiers!.forEach((tier) => {
      expect(tier.rankings!.map((r) => r.groupRanking)).toEqual(['1', '2-3', '4-5', '6']);
      tier.rankings!.forEach((r) =>
        expect(r.rewards.map((reward) => reward.name)).toEqual([
          '5m General Speedup',
          '1k Secured Resource Supply Chest',
          'Championship Badge',
        ]),
      );
    });
  });

  it('transcribes Alliance Championship tier rewards from the source table', () => {
    const [iron, , , , , ultimate] = events().find('alliance-championship')!.tiers!;
    expect(iron.rankings![0]).toEqual({
      groupRanking: '1',
      starChange: 4,
      rewards: [
        { name: '5m General Speedup', itemId: 'speedup-general-5m', amount: 14 },
        {
          name: '1k Secured Resource Supply Chest',
          itemId: 'ressources-supply-chest',
          amount: 185,
        },
        { name: 'Championship Badge', itemId: 'championship-badge', amount: 9500 },
      ],
    });
    expect(ultimate.rankings!.map((r) => r.starChange)).toEqual([2, 1, -1, -2]);
  });

  it('links every reward itemId to an existing item', () => {
    const itemIds = events()
      .get()
      .flatMap((e) => [
        ...(e.allianceRankings ?? []).flatMap((r) => r.rewards),
        ...(e.personalRankings ?? []).flatMap((t) => t.rankings).flatMap((r) => r.rewards),
        ...(e.tiers ?? []).flatMap((t) => [
          ...(t.rewards ?? []),
          ...(t.rankings ?? []).flatMap((r) => r.rewards),
        ]),
      ])
      .map((reward) => reward.itemId)
      .filter((id): id is string => id !== undefined);
    expect(itemIds.length).toBeGreaterThan(0);
    itemIds.forEach((id) => expect(items().find(id)).toBeDefined());
  });

  it('lists Bear Hunt score tiers in ascending order with their rewards', () => {
    const tiers = events().find('bear-hunt')!.tiers!;
    expect(tiers).toHaveLength(51);
    expect(tiers[0]).toEqual({
      name: 'Tier 1',
      scoreTotal: 10000,
      rewards: [
        { name: '100 Enhancement XP Component', itemId: 'enhancement-xp-component', amount: 2 },
        { name: 'Alliance Tokens', itemId: 'alliance-token', amount: 5000 },
        {
          name: 'Lv. 3 Custom Secured Resource Chest',
          itemId: 'lv-3-custom-ressource-chest',
          amount: 50,
        },
      ],
    });
    expect(tiers[50].scoreTotal).toBe(72000000000);
    tiers
      .slice(1)
      .forEach((tier, i) => expect(tier.scoreTotal!).toBeGreaterThan(tiers[i].scoreTotal!));
  });

  it('lists Canyon Clash personal rewards by merit range and legion rank', () => {
    const tiers = events().find('canyon-clash')!.tiers!;
    expect(tiers.map((t) => t.scoreTotal)).toEqual([5000, 30000, 60000, 90000, 120000]);
    tiers.forEach((tier) =>
      expect(tier.rankings!.map((r) => r.groupRanking)).toEqual(['1', '2', '3']),
    );
    const [first, second] = tiers[4].rankings!;
    expect(first.rewards.map((r) => r.amount)).toEqual([18000, 3, 60, 5, 10, 20]);
    expect(second.rewards.map((r) => r.name)).not.toContain('100 Gems');
    const secondPlaceLowestRange = tiers[0].rankings![1].rewards;
    expect(secondPlaceLowestRange[secondPlaceLowestRange.length - 1]).toEqual({
      name: '100 Gems',
      itemId: 'gems',
      amount: 3,
    });
  });

  it('lists Canyon Clash alliance rewards for the top 3 placements', () => {
    const rankings = events().find('canyon-clash')!.allianceRankings!;
    expect(rankings.map((r) => r.groupRanking)).toEqual(['1', '2', '3']);
    expect(rankings[0].rewards.map((r) => [r.name, r.amount])).toEqual([
      ['Lost Coin', 3000],
      ['100 Gems', 6],
      ['Gold Key', 4],
      ['10K Meat', 80],
      ['10K Wood', 80],
    ]);
  });

  it('lists the 20 Crazy Joe waves with their targets and rules', () => {
    const waves = events().find('crazy-joe')!.waves!;
    expect(waves.map((w) => w.wave)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
    expect(waves.filter((w) => w.target === 'headquarters').map((w) => w.wave)).toEqual([10, 20]);
    expect(
      waves.filter((w) => w.rule === 'Elite wave targeting online Chiefs').map((w) => w.wave),
    ).toEqual([7, 14, 17]);
    expect(waves.filter((w) => w.target === 'city')).toHaveLength(18);
    expect(waves[0]).toEqual({ wave: 1, target: 'city', rule: 'Regular city-defense wave' });
  });

  it('lists the 21 Crazy Joe difficulties with the points required to unlock each', () => {
    const tiers = events().find('crazy-joe')!.tiers!;
    expect(tiers).toHaveLength(21);
    expect(tiers[0]).toEqual({ name: 'Difficulty 1', scoreTotal: 0 });
    expect(tiers[1].scoreTotal).toBe(12726000);
    expect(tiers[20]).toEqual({ name: 'Difficulty 21', scoreTotal: 37851450 });
    tiers
      .slice(1)
      .forEach((tier, i) => expect(tier.scoreTotal!).toBeGreaterThan(tiers[i].scoreTotal!));
  });

  it('lists Crazy Joe alliance ranking rewards for ranks 1 to 10', () => {
    const rankings = events().find('crazy-joe')!.allianceRankings!;
    expect(rankings.map((r) => r.groupRanking)).toEqual(
      Array.from({ length: 10 }, (_, i) => String(i + 1)),
    );
    expect(rankings[0].rewards.map((r) => [r.name, r.amount])).toEqual([
      ['Polishing Solution', 5],
      ['Hardened Alloy', 450],
      ['Meat', 320000],
      ['Wood', 320000],
      ['Coal', 64000],
      ['Iron', 16000],
    ]);
    expect(rankings[9].rewards.map((r) => r.amount)).toEqual([1, 60, 50000, 50000, 10000, 2500]);
  });

  it('lists Foundry Battle personal rewards by merit range for the winning and defeated sides', () => {
    const tiers = events().find('foundry-battle')!.tiers!;
    expect(tiers.map((t) => t.scoreTotal)).toEqual([2000, 20000, 42000, 90000, 180000]);
    tiers.forEach((tier) =>
      expect(tier.rankings!.map((r) => r.groupRanking)).toEqual(['Winner', 'Defeat']),
    );
    const [winner, defeat] = tiers[4].rankings!;
    expect(winner.rewards.map((r) => r.amount)).toEqual([12000, 20, 10, 16, 3, 20, 60]);
    expect(winner.rewards[3]).toEqual({
      name: 'Lucky Hero Gear Chest',
      itemId: 'lucky-hero-gear-chest',
      amount: 16,
    });
    expect(defeat.rewards.map((r) => r.amount)).toEqual([6000, 10, 5, 14, 2, 10, 35]);
    expect(tiers[0].rankings![1].rewards.map((r) => r.name)).not.toContain('Shot Token');
  });

  it('lists Foundry Battle alliance rewards for the top 2 placements', () => {
    const rankings = events().find('foundry-battle')!.allianceRankings!;
    expect(rankings.map((r) => r.groupRanking)).toEqual(['1', '2']);
    expect(rankings[0].rewards.map((r) => r.amount)).toEqual([2000, 6, 2, 4, 80, 80, 16]);
    expect(rankings[0].rewards[2]).toMatchObject({
      name: 'Advanced Teleporter',
      itemId: 'advanced-teleporter',
    });
    expect(rankings[1].rewards.map((r) => r.amount)).toEqual([1500, 3, 1, 2, 40, 40, 8]);
  });

  it('lists Frostdragon Tyrant personal points milestones as tiers', () => {
    const tiers = events().find('frostdragon-tyrant')!.tiers!;
    expect(tiers.map((t) => t.scoreTotal)).toEqual([
      150000, 350000, 500000, 700000, 900000, 3800000, 6700000,
    ]);
    expect(tiers[0].rewards).toEqual([
      { name: '1h Troop Healing Speedup', itemId: 'speedup-healing-1h', amount: 30 },
      { name: '10K Meat', itemId: 'meat', amount: 500 },
    ]);
  });

  it('lists Frostdragon Tyrant personal rankings by occupation time and by points', () => {
    const [occupation, points] = events().find('frostdragon-tyrant')!.personalRankings!;
    expect(occupation.basedOn).toBe('Capital occupation time');
    expect(occupation.rankings.map((r) => r.groupRanking)).toEqual([
      '1',
      '2',
      '3',
      '4-10',
      '11-20',
      '21-50',
      '51-100',
    ]);
    expect(occupation.rankings[0].rewards.map((r) => r.name)).toContain('Triumph of Tyrant');
    expect(occupation.rankings[0].rewards[0]).toMatchObject({ itemId: 'triumph-of-tyrant' });
    expect(occupation.rankings[3].rewards[0]).toMatchObject({ itemId: 'trail-of-heroes' });
    expect(occupation.rankings[0].rewards[5]).toEqual({
      name: 'Custom Mythic Hero Gear Chest',
      itemId: 'custom-mythic-hero-gear-chest',
      amount: 5,
    });
    expect(points.basedOn).toBe('Personal points');
    expect(points.rankings).toHaveLength(20);
    expect(points.rankings[0].rewards.map((r) => r.amount)).toEqual([30000, 300, 400]);
    expect(points.rankings[19].rewards.map((r) => r.amount)).toEqual([2000, 30, 50]);
  });

  it('lists the Frostdragon Tyrant Old Guard rewards', () => {
    const oldGuard = events()
      .find('frostdragon-tyrant')!
      .rewards!.filter((r) => r.note === 'Alliance-wide reward for defeating the Old Guard.');
    expect(oldGuard.map((r) => [r.name, r.amount])).toEqual([
      ['1K Gems', 1],
      ['Fire Crystal', 10],
      ['1h Construction Speedup', 5],
      ['1h Troop Training Speedup', 5],
      ['1h Research Speedup', 5],
      ['Resource Chest', 500],
    ]);
  });

  it('links every reward decorationId to an existing decoration', () => {
    const decorationIds = events()
      .get()
      .flatMap((e) => (e.personalRankings ?? []).flatMap((t) => t.rankings))
      .flatMap((r) => r.rewards)
      .map((reward) => reward.decorationId)
      .filter((id): id is string => id !== undefined);
    expect([...new Set(decorationIds)].sort()).toEqual([
      'cannon',
      'dragon-pagoda',
      'serpent-sanctuary',
      'war-chariot',
    ]);
    decorationIds.forEach((id) => expect(decoration().find(id)).toBeDefined());
  });

  it('lists Tundra Arms League legion ranking rewards for 8 rank groups', () => {
    const [legion] = events().find('tundra-arms-league')!.personalRankings!;
    expect(legion.basedOn).toBe('Legion ranking');
    expect(legion.rankings.map((r) => r.groupRanking)).toEqual([
      '1',
      '2',
      '3',
      '4',
      '5-8',
      '9-16',
      '17-32',
      '33+',
    ]);
    expect(legion.rankings[0].rewards.map((r) => r.amount)).toEqual([
      1, 1, 5, 3600, 50000, 3, 150, 60,
    ]);
    expect(legion.rankings[0].rewards[1]).toMatchObject({ decorationId: 'war-chariot' });
    expect(legion.rankings[7].rewards.map((r) => r.amount)).toEqual([100, 15000, 36, 20]);
  });

  it('lists Tundra Arms League alliance ranking rewards', () => {
    const rankings = events().find('tundra-arms-league')!.allianceRankings!;
    expect(rankings).toHaveLength(8);
    expect(rankings[0].rewards.map((r) => r.amount)).toEqual([36000, 6000, 6, 20]);
    expect(rankings[7].rewards.map((r) => r.amount)).toEqual([1500, 2000, 1, 2]);
  });

  it('lists Tundra Arms League combatant rewards by arsenal points and phase', () => {
    const event = events().find('tundra-arms-league')!;
    expect(event.tiers!.map((t) => t.scoreTotal)).toEqual([2000, 20000, 42000, 90000, 180000]);
    const last = event.tiers![4].rankings!;
    expect(last.map((r) => r.groupRanking)).toEqual([
      'Elimination: Winner',
      'Elimination: Defeat',
      'Championship: Winner',
      'Championship: Defeat',
    ]);
    expect(last[2].rewards.map((r) => r.amount)).toEqual([100, 10000, 10, 20, 20]);
    expect(last[2].rewards[4]).toEqual({
      name: 'Lv.2 Custom Ressource Chest',
      itemId: 'lv-2-custom-ressource-chest',
      amount: 20,
    });
    const [, result] = event.personalRankings!;
    expect(result.rankings[2].rewards.map((r) => r.amount)).toEqual([3000, 8, 2, 5, 30]);
  });

  it('links Tundra Arms League march skin rewards to existing skins', () => {
    const [legion] = events().find('tundra-arms-league')!.personalRankings!;
    const skinIds = legion.rankings
      .flatMap((r) => r.rewards.map((reward) => reward.skinId))
      .filter(Boolean);
    expect(skinIds).toEqual([
      'hornwrath-herald',
      'fireclaw-hunter',
      'fireclaw-hunter',
      'fireclaw-hunter',
    ]);
    skinIds.forEach((id) => expect(skins().find(id!)).toBeDefined());
  });
});
