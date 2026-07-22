import { describe, expect, it } from 'vitest';
import { computeAchievements } from './achievements';
import type { Member } from '../data/types';

function makeMember(overrides: Partial<Member> = {}): Member {
  return {
    id: 'm1',
    name: 'Test Member',
    email: 'test@example.com',
    avatar: '',
    plan: 'Pro',
    status: 'activa',
    joinDate: '2024-01-01',
    nextPaymentDate: '2099-01-01',
    monthlyFee: 49,
    checkIns: 0,
    trainerId: 't1',
    currentStreakDays: 0,
    weightGoalKg: 80,
    weightHistory: [],
    emergencyContact: { name: '', phone: '', relationship: '' },
    ...overrides,
  };
}

describe('computeAchievements', () => {
  it('unlocks nothing for a brand-new member with no activity', () => {
    const member = makeMember({ joinDate: new Date().toISOString().slice(0, 10) });
    const achievements = computeAchievements(member);
    expect(achievements.every((a) => !a.unlocked)).toBe(true);
  });

  it('unlocks "primeros pasos" after the first check-in', () => {
    const member = makeMember({ checkIns: 1 });
    const achievements = computeAchievements(member);
    expect(achievements.find((a) => a.id === 'primeros-pasos')?.unlocked).toBe(true);
  });

  it('unlocks streak achievements based on currentStreakDays', () => {
    const short = computeAchievements(makeMember({ currentStreakDays: 5 }));
    const week = computeAchievements(makeMember({ currentStreakDays: 7 }));
    const month = computeAchievements(makeMember({ currentStreakDays: 30 }));

    expect(short.find((a) => a.id === 'racha-7')?.unlocked).toBe(false);
    expect(week.find((a) => a.id === 'racha-7')?.unlocked).toBe(true);
    expect(month.find((a) => a.id === 'racha-30')?.unlocked).toBe(true);
  });

  it('unlocks "miembro fundador" after a year of membership', () => {
    const overYear = new Date();
    overYear.setFullYear(overYear.getFullYear() - 2);
    const member = makeMember({ joinDate: overYear.toISOString().slice(0, 10) });
    expect(computeAchievements(member).find((a) => a.id === 'aniversario')?.unlocked).toBe(true);
  });

  it('unlocks "rumbo a la meta" only when weight is trending toward the goal', () => {
    const improving = makeMember({
      weightGoalKg: 80,
      weightHistory: [
        { date: '2024-01-01', weightKg: 95 },
        { date: '2024-02-01', weightKg: 88 },
      ],
    });
    const worsening = makeMember({
      weightGoalKg: 80,
      weightHistory: [
        { date: '2024-01-01', weightKg: 85 },
        { date: '2024-02-01', weightKg: 90 },
      ],
    });

    expect(computeAchievements(improving).find((a) => a.id === 'rumbo-a-la-meta')?.unlocked).toBe(true);
    expect(computeAchievements(worsening).find((a) => a.id === 'rumbo-a-la-meta')?.unlocked).toBe(false);
  });
});
