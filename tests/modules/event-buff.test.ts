import { eventBuff, EventBuffQuery } from '@/modules/event-buff';
import { testQueryBaseContract } from '../helpers';

testQueryBaseContract('eventBuff', () => eventBuff());

describe('EventBuffQuery', () => {
  it('accepts an explicit source array', () => {
    const subset = eventBuff().get().slice(0, 1);
    expect(new EventBuffQuery(subset).count()).toBe(1);
  });

  it('uses default data when constructed without arguments', () => {
    expect(new EventBuffQuery().count()).toBeGreaterThan(0);
  });

  it('appliesFor() defaults to filtering on "yes"', () => {
    const facilityBuffEvents = eventBuff().appliesFor('facilityBuff');
    expect(facilityBuffEvents.count()).toBe(14);
    expect(facilityBuffEvents.get().every((e) => e.facilityBuff === 'yes')).toBe(true);
  });

  it('appliesFor() accepts an explicit applicability value', () => {
    const partialMarch = eventBuff().appliesFor('marchAccelerator', 'partial');
    expect(partialMarch.count()).toBe(4);
    expect(partialMarch.get().every((e) => e.marchAccelerator === 'partial')).toBe(true);
  });
});

describe('Event Buff applicability', () => {
  it('tracks 14 game modes', () => {
    expect(eventBuff().count()).toBe(14);
    expect(eventBuff().find('bear-hunt')).toBeDefined();
    expect(eventBuff().find('winter-siege')).toBeDefined();
  });

  it('Facility Buff applies to every tracked game mode', () => {
    expect(
      eventBuff()
        .get()
        .every((e) => e.facilityBuff === 'yes'),
    ).toBe(true);
  });

  it('Pet Skills and Daybreak Island apply to every tracked game mode, unlike most other buff sources', () => {
    expect(
      eventBuff()
        .get()
        .every((e) => e.petSkills === 'yes'),
    ).toBe(true);
    expect(
      eventBuff()
        .get()
        .every((e) => e.daybreakIsland === 'yes'),
    ).toBe(true);
  });

  it('Icefire Warhymn League and Winter Siege deny most buff sources except Pet Skills, Daybreak Island, and Facility Buff', () => {
    ['icefire-warhymn-league', 'winter-siege'].forEach((id) => {
      const event = eventBuff().find(id)!;
      expect(event.cityBonusWarsBuffs).toBe('no');
      expect(event.deploymentCapacity).toBe('no');
      expect(event.petSkills).toBe('yes');
      expect(event.daybreakIsland).toBe('yes');
      expect(event.presidentSkills).toBe('no');
      expect(event.ministerBuff).toBe('no');
      expect(event.territoryBonuses).toBe('no');
      expect(event.facilityBuff).toBe('yes');
      expect(event.marchAccelerator).toBe('no');
      expect(event.frostdragonTyrantTitles).toBe('no');
      expect(event.frostSphereDomainBonus).toBe('no');
    });
  });

  it('marks March Accelerator as partial for rally-restricted events, with a note explaining why', () => {
    ['bear-hunt', 'fortress-battle', 'facility', 'castle-battle'].forEach((id) => {
      const event = eventBuff().find(id)!;
      expect(event.marchAccelerator).toBe('partial');
      expect(event.notes).toContain('not applicable for rally');
    });
  });

  it('leaves notes unset for events with no caveats (Crazy Joe)', () => {
    expect(eventBuff().find('crazy-joe')!.notes).toBeUndefined();
  });
});
