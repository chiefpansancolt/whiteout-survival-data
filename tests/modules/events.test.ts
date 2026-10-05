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
      'king-of-icefield',
    ]);
    expect(events().byCategory('alliance').count()).toBe(12);
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
        ...(e.rewards ?? []),
        ...(e.allianceRankings ?? []).flatMap((r) => r.rewards),
        ...(e.days ?? [])
          .flatMap((d) => [...(d.milestones ?? []), ...(d.allianceMilestones ?? [])])
          .flatMap((m) => m.rewards ?? []),
        ...(e.personalRankings ?? []).flatMap((t) => t.rankings).flatMap((r) => r.rewards),
        ...(e.tiers ?? []).flatMap((t) => [
          ...(t.rewards ?? []),
          ...(t.rankings ?? []).flatMap((r) => [
            ...r.rewards,
            ...(r.levels ?? []).flatMap((l) => l.rewards),
          ]),
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
      .flatMap((e) => [
        ...(e.rewards ?? []),
        ...(e.personalRankings ?? []).flatMap((t) => t.rankings).flatMap((r) => r.rewards),
        ...(e.allianceRankings ?? []).flatMap((r) => r.rewards),
        ...(e.tiers ?? []).flatMap((t) => (t.rankings ?? []).flatMap((r) => r.rewards)),
      ])
      .map((reward) => reward.decorationId)
      .filter((id): id is string => id !== undefined);
    expect([...new Set(decorationIds)].sort()).toEqual([
      'cannon',
      'conquering-sword',
      'dragon-pagoda',
      'giant-horn',
      'serpent-sanctuary',
      'tundra-truck',
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
    expect(last[2].rewards[2]).toEqual({
      name: 'March Accelerator II',
      itemId: 'march-accelerator-ii',
      amount: 10,
    });
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

  it('transcribes batch 2 alliance events from the wiki text', () => {
    const showdown = events().find('alliance-showdown')!;
    expect(showdown.days!.map((d) => d.victoryPoints)).toEqual([1, 2, 2, 2, 2, 4]);
    expect(showdown.rewards!.map((r) => r.decorationId)).toEqual(['giant-horn', 'tundra-truck']);
    const mobilization = events().find('alliance-mobilization')!;
    expect(mobilization.tiers!.map((t) => t.name)).toEqual([
      'Rookie',
      'Junior',
      'Senior',
      'Elite',
      'Legendary',
    ]);
    expect(events().find('sunfire-castle')!.eventBuffId).toBe('castle-battle');
    expect(events().find('king-of-icefield')!.phases).toHaveLength(7);
    expect(
      events()
        .find('svs-state-of-power')!
        .phases!.map((p) => p.name),
    ).toEqual(['Matchmaking', 'Preparation', 'Battle', 'Field Triage']);
  });

  it('lists the 37 Alliance Mobilization missions with their base points', () => {
    const missions = events().find('alliance-mobilization')!.missions!;
    expect(missions).toHaveLength(37);
    expect([...new Set(missions.map((m) => m.group))]).toEqual([
      'Gather resources',
      'Train troops',
      'Use speedups',
      'Killing beasts',
      'Use gems',
      'Essence stones',
      'Chief Gear',
      'Chief gear charms',
      'Mythic shards (not general)',
    ]);
    expect(missions[0]).toEqual({ group: 'Gather resources', name: 'Gather 10M', points: 30 });
    expect(missions.find((m) => m.name === 'Train 120K power')!.points).toBe(430);
    expect(missions.find((m) => m.name === 'Use 50K gems')!.points).toBe(670);
    expect(missions.find((m) => m.name === 'Defeat 5 polar terrors')!.points).toBe(80);
    expect(missions.some((m) => /gems >|pack/i.test(m.name))).toBe(false);
  });

  it('lists Alliance Showdown scoring and personal milestones for each day', () => {
    const days = events().find('alliance-showdown')!.days!;
    expect(days.map((d) => d.day)).toEqual(['1', '2', '3', '4', '5', '6-7']);
    expect(days.map((d) => d.scoring.length)).toEqual([16, 15, 11, 19, 11, 21]);
    expect(days[0].scoring[0]).toEqual({ action: 'Escort 1 truck of any grade', points: 10000 });
    expect(days[3].scoring.find((a) => a.action.includes('Mithril'))!.points).toBe(67500);
    expect(
      days[3].scoring.filter((a) => a.action.startsWith('Train')).map((a) => a.points),
    ).toEqual([1, 1, 2, 3, 4, 7, 10, 14, 18, 24, 30, 36]);
    expect(days[0].milestones!.map((m) => m.scoreTotal)).toEqual([
      100, 25000, 50000, 87500, 125000,
    ]);
    expect(days[5].milestones!.map((m) => m.scoreTotal)).toEqual([
      100, 37500, 75000, 125000, 187500,
    ]);
    const lastRewards = days.map((d) => d.milestones![4].rewards![0].name);
    expect(lastRewards).toEqual([
      'Fire Crystal',
      'Mythic General Hero Shard',
      'Charm Design',
      'Charm Guide',
      'Design Plans',
      'Essence Stones',
    ]);
  });

  it('lists Alliance Showdown star and ranking rewards by star rating', () => {
    const showdown = events().find('alliance-showdown')!;
    expect(showdown.tiers!.map((t) => t.name)).toEqual([
      'Star rating 1-2',
      'Star rating 3-5',
      'Star rating 6-9',
      'Star rating 10+',
    ]);
    const top = showdown.tiers![3].rankings!;
    expect(top).toHaveLength(14);
    expect(top[0].rewards.map((r) => r.amount)).toEqual([3, 80000, 2500, 25, 10, 125]);
    expect(top[2].groupRanking).toBe('Winning alliance, alliance rank 1');
    expect(top[2].rewards.map((r) => r.amount)).toEqual([5, 500000, 30000, 70, 40, 40]);
    expect(showdown.tiers![0].rankings![13].rewards.map((r) => r.amount)).toEqual([1500, 5, 1]);
    expect(showdown.allianceRankings!.map((r) => r.groupRanking)).toEqual([
      'Daily: Winning alliance',
      'Daily: Losing or drawing alliance',
    ]);
  });

  it('lists Mercenary Prestige personal rewards by difficulty tier and level', () => {
    const tiers = events().find('mercenary-prestige')!.tiers!;
    expect(tiers.map((t) => t.name)).toEqual([
      "Champion's Initiation",
      'Epic Initiation',
      "Legend's Initiation",
      'Fearless Initiation',
    ]);
    tiers.forEach((t) =>
      expect(t.rankings!.map((r) => r.groupRanking)).toEqual([
        'Easy',
        'Normal',
        'Hard',
        'Nightmare',
        'Insane',
      ]),
    );
    const easy = tiers[0].rankings![0].rewards;
    expect(easy.map((r) => r.amount)).toEqual([5, 20, 18, 50, 500]);
    expect(easy[2]).toEqual({
      name: '1h General Speedup',
      itemId: 'speedup-general-1h',
      amount: 18,
    });
    const insane = tiers[3].rankings![4].rewards;
    expect(insane.map((r) => r.itemId)).toContain('chief-gear-variety-chest');
    expect(insane[insane.length - 1]).toMatchObject({
      name: 'Lv.2 Custom Resource Chest',
      note: 'The wiki page does not state this amount.',
    });
    expect(insane[insane.length - 1].amount).toBeUndefined();
  });

  it('lists the 5 Mercenary Prestige Captain rewards', () => {
    const captains = events().find('mercenary-prestige')!.allianceRankings!;
    expect(captains.map((c) => c.groupRanking)).toEqual([
      'Lv.1 Dr. Toxin Theodore',
      'Lv.2 Zenobia Queen of Violence',
      'Lv.3 Helios Cannon',
      'Lv.4 Callisto Mark II',
      'Lv.5 Behemoth',
    ]);
    expect(captains[4].rewards.map((r) => r.amount)).toEqual([2, 10, 3, 3, 30]);
  });

  it('lists 50 Mercenary Prestige enemy levels for each Champion and Epic difficulty', () => {
    const tiers = events().find('mercenary-prestige')!.tiers!;
    const [champion, epic] = tiers;
    ['Easy', 'Normal', 'Hard', 'Nightmare', 'Insane'].forEach((difficulty) => {
      [champion, epic].forEach((tier) => {
        const ranking = tier.rankings!.find((r) => r.groupRanking === difficulty)!;
        expect(ranking.levels!.map((l) => l.level)).toEqual(
          Array.from({ length: 50 }, (_, i) => i + 1),
        );
      });
    });
    expect(tiers[2].rankings!.every((r) => r.levels === undefined)).toBe(true);
    expect(tiers[3].rankings!.every((r) => r.levels === undefined)).toBe(true);
  });

  it('transcribes Mercenary Prestige enemy level details from the source tables', () => {
    const [champion, epic] = events().find('mercenary-prestige')!.tiers!;
    const easy = champion.rankings![0].levels!;
    expect(easy[0]).toMatchObject({
      level: 1,
      tier: 1,
      power: 900,
      bonus: 0,
      troops: { infantry: 100, lancer: 100, marksman: 100 },
      totalTroops: 300,
    });
    expect(easy.map((l) => l.tier).filter((t, i, a) => a.indexOf(t) === i)).toEqual([
      1, 2, 3, 4, 5, 6,
    ]);
    expect(easy[9].rewards.map((r) => [r.name, r.amount])).toEqual([
      ['Epic General Hero Shard', 1],
      ['Gems', 100],
      ['1h General Speedup', 1],
      ['Lv.1 Custom Resource Chest', 24],
      ['1K Hero XP', 5],
    ]);
    expect(easy[0].rewards.map((r) => r.amount)).toEqual([1, 60000, 60000, 12000, 3000]);
    const nightmare = champion.rankings![3].levels!;
    expect(nightmare[49].troops).toEqual({ infantry: 90000, lancer: 9000, marksman: 9000 });
    expect(nightmare[49].note).toContain('typo');
    const epicNightmare = epic.rankings![3].levels!;
    expect(epicNightmare[12].troops.infantry).toBe(52400);
    expect(epicNightmare[12].note).toContain('typo');
    const insane = epic.rankings![4].levels!;
    expect(insane[49].totalTroops).toBe(insane[49].troops.infantry * 3);
    expect(insane[49].rewards[0]).toMatchObject({ name: 'Mythic General Hero Shard', amount: 1 });
  });

  it('keeps every Mercenary Prestige level total equal to the sum of its troop counts', () => {
    const levels = events()
      .find('mercenary-prestige')!
      .tiers!.flatMap((t) => t.rankings!)
      .flatMap((r) => r.levels ?? []);
    expect(levels).toHaveLength(500);
    levels.forEach((l) =>
      expect(l.totalTroops).toBe(l.troops.infantry + l.troops.lancer + l.troops.marksman),
    );
  });

  it('lists Sunfire Castle personal ranking rewards for 22 rank groups', () => {
    const [ranking] = events().find('sunfire-castle')!.personalRankings!;
    expect(ranking.basedOn).toBe('Personal ranking');
    expect(ranking.rankings).toHaveLength(22);
    expect(ranking.rankings[0].rewards.map((r) => [r.name, r.amount])).toEqual([
      ['Gems', 17300],
      ['Charm Design', 180],
      ['Charm Guide', 240],
    ]);
    expect(ranking.rankings[21].groupRanking).toBe('501-550');
    expect(ranking.rankings[21].rewards.map((r) => r.amount)).toEqual([800, 6, 12]);
  });

  it('lists Sunfire Castle points milestones as tiers', () => {
    const tiers = events().find('sunfire-castle')!.tiers!;
    expect(tiers.map((t) => t.scoreTotal)).toEqual([
      70000, 170000, 250000, 350000, 450000, 1930000, 3410000,
    ]);
    expect(tiers[3].rewards!.map((r) => [r.itemId, r.amount])).toEqual([
      ['speedup-healing-5m', 100],
      ['iron', 140],
    ]);
    expect(tiers[6].rewards!.map((r) => r.amount)).toEqual([3, 23]);
  });

  it('lists SVS scoring and milestones for each preparation day and the battle phase', () => {
    const days = events().find('svs-state-of-power')!.days!;
    expect(days.map((d) => d.day)).toEqual(['1', '2', '3', '4', '5', 'Battle']);
    expect(days.map((d) => d.scoring.length)).toEqual([8, 17, 16, 16, 14, 23]);
    expect(days[3].scoring.find((a) => a.action === 'Use 1 Mithril')!.points).toBe(144000);
    expect(days.map((d) => d.milestones!.map((m) => m.scoreTotal))).toEqual([
      [30000, 100000, 200000],
      [40000, 120000, 270000],
      [80000, 150000, 300000],
      [80000, 150000, 300000],
      [40000, 130000, 250000],
      [48000, 120000, 250000],
    ]);
    expect(days[0].milestones![2].rewards![0]).toMatchObject({ name: 'Sunfire Token', amount: 10 });
    expect(days[5].milestones![2].rewards!.map((r) => r.amount)).toEqual([20, 13, 30, 2]);
    expect(days.map((d) => d.allianceMilestones![0].scoreTotal)).toEqual([
      145000, 145000, 369000, 498000, 145000, 17400000,
    ]);
    expect(days[2].allianceMilestones![1].rewards![1]).toMatchObject({
      itemId: 'march-accelerator-i',
    });
  });

  it('lists SVS ranking reward tables', () => {
    const tiers = events().find('svs-state-of-power')!.tiers!;
    expect(tiers.map((t) => t.rankings!.length)).toEqual([10, 10, 10, 7, 7, 7, 5]);
    expect(tiers[0].rankings![0].rewards[3]).toEqual({
      name: 'Lv.2 Custom Resource Chest',
      itemId: 'lv-2-custom-ressource-chest',
      amount: 150,
    });
    const [, total, battle, , , battleAlliance] = tiers;
    expect(total.rankings![0].rewards.map((r) => r.amount)).toEqual([5, 400, 100000, 40, 40]);
    expect(total.rankings![0].rewards[1]).toMatchObject({
      name: 'Hero of the Season Shard',
      itemId: 'mythic-general-hero-shard',
    });
    expect(battle.rankings![0].rewards.map((r) => r.amount)).toEqual([1, 100, 25000, 250, 1]);
    expect(battle.rankings![0].rewards[4]).toEqual({
      name: '7-day City Skin',
      skinId: 'svs-battle-city-skin',
      amount: 1,
    });
    expect(battle.rankings![0].rewards.slice(0, 2)).toEqual([
      { name: 'Lv.1 Conquering Sword', decorationId: 'conquering-sword', amount: 1 },
      {
        name: 'Battle Commendation Custom Chest - Gen Hero',
        itemId: 'battle-commendation-custom-chest-gen-hero',
        amount: 100,
      },
    ]);
    expect(battleAlliance.rankings![0].rewards.map((r) => r.amount)).toEqual([150, 2000, 5, 36]);
    expect(battleAlliance.rankings![6].rewards[1]).toEqual({
      name: 'Platinum Key',
      itemId: 'platinum-key',
      amount: 1,
    });
    expect(tiers[4].rankings![0].rewards[3]).toEqual({
      name: 'Lv.2 Custom Resource Chest',
      itemId: 'lv-2-custom-ressource-chest',
      amount: 200,
    });
  });

  it('lists SVS winner, runner-up, and matchmaking bye rewards', () => {
    const winners = events().find('svs-state-of-power')!.tiers![6].rankings!;
    expect(winners.map((r) => r.groupRanking)).toEqual([
      'Preparation phase: Winner',
      'Preparation phase: Runner-up',
      'Preparation phase: Matchmaking Bye',
      'Battle phase: Winner',
      'Battle phase: Runner-up',
    ]);
    expect(winners[0].rewards.map((r) => r.amount)).toEqual([30, 1500, 2, 2, 150]);
    expect(winners[2].rewards.map((r) => r.amount)).toEqual([5, 2000, 10, 100, 10]);
    expect(winners[3].rewards[3]).toMatchObject({ itemId: 'march-accelerator-i' });
    expect(winners[4].rewards.map((r) => r.amount)).toEqual([15, 500, 1, 1, 75]);
  });
});
