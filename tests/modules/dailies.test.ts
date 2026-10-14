import { dailies, DailyTaskQuery } from '@/modules/dailies';
import { testQueryBaseContract } from '../helpers';

testQueryBaseContract('dailies', () => dailies());

describe('DailyTaskQuery', () => {
  it('accepts an explicit source array', () => {
    const subset = dailies().get().slice(0, 2);
    expect(new DailyTaskQuery(subset).count()).toBe(2);
  });

  it('uses default data when constructed without arguments', () => {
    expect(new DailyTaskQuery().count()).toBeGreaterThan(0);
  });
});

describe('daily tasks', () => {
  it('lists the steps of the daily routine in order, in the wording of the source', () => {
    expect(
      dailies()
        .get()
        .map((t) => t.name),
    ).toEqual([
      'Start by Checking Events Before Spending Anything',
      'Complete Daily Missions',
      'Clear Lighthouse Intel Throughout the Day',
      'Claim Your Daily VIP Reward',
      'Help Your Alliance and Make Contributions',
      'Keep Construction and Research Productive',
      'Keep Troop Training Queues Running',
      'Use Your Free Arena Attempts',
      'Collect Exploration Rewards',
      'Complete Pet Adventure and Pet Tasks',
      'Complete The Labyrinth After It Unlocks',
      'Check Shops Without Buying Everything',
      'Participate in Alliance Events When Scheduled',
      'Use Stamina With a Purpose',
      'Send Marches Gathering Before Logging Off',
    ]);
  });

  it('leaves the in-game daily missions to dailyMissions()', () => {
    for (const id of [
      'upgrade-1-building',
      'research-1-technology',
      'fight-in-1-or-5-arena-challenges',
      'complete-1-challenges-in-the-labyrinth',
      'dispatch-pets-to-hunt-for-treasure',
      'claim-5-online-rewards',
    ]) {
      expect(dailies().find(id)).toBeUndefined();
    }
  });

  it('gives every task a unique kebab-case id', () => {
    const ids = dailies()
      .get()
      .map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it('finds a task by id and by name', () => {
    expect(dailies().find('claim-your-daily-vip-reward')?.name).toBe('Claim Your Daily VIP Reward');
    expect(dailies().findByName('use stamina with a purpose')?.id).toBe(
      'use-stamina-with-a-purpose',
    );
  });

  it('has no icon or description for a task until a source states one', () => {
    for (const task of dailies().get()) {
      expect(task.img).toBeUndefined();
      expect(task.description).toBeUndefined();
    }
  });
});
