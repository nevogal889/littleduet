import { canPlayClass, isFreeClass, isEntitled } from '@/lib/entitlement';
import { makeClass } from './fixtures';

describe('entitlement', () => {
  it('class 1 of every song is free', () => {
    expect(isFreeClass(makeClass('a', 1))).toBe(true);
    expect(isFreeClass(makeClass('b', 1))).toBe(true);
    expect(isFreeClass(makeClass('a', 2))).toBe(false);
  });

  it('free users can play class 1 only', () => {
    const free = { active: false };
    expect(canPlayClass(makeClass('a', 1), free)).toBe(true);
    expect(canPlayClass(makeClass('a', 2), free)).toBe(false);
    expect(canPlayClass(makeClass('a', 8), free)).toBe(false);
  });

  it('subscribers (including trial) can play every class', () => {
    const sub = { active: true, trial: true, plan: 'monthly' as const };
    expect(canPlayClass(makeClass('a', 5), sub)).toBe(true);
  });

  it('an expired subscription is not entitled', () => {
    expect(isEntitled({ active: true, expiresAt: 1000 }, 2000)).toBe(false);
    expect(isEntitled({ active: true, expiresAt: 3000 }, 2000)).toBe(true);
    expect(isEntitled({ active: true }, 2000)).toBe(true);
  });
});
