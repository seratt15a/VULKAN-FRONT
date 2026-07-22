import { describe, expect, it } from 'vitest';
import { getNotifications } from './notifications';
import type { GymClass, Member, Payment } from '../data/types';

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
    checkIns: 10,
    trainerId: 't1',
    currentStreakDays: 3,
    weightGoalKg: 80,
    weightHistory: [],
    emergencyContact: { name: '', phone: '', relationship: '' },
    bodyMeasurements: [],
    progressPhotos: [],
    freezeRequest: null,
    ...overrides,
  };
}

function makeClass(overrides: Partial<GymClass> = {}): GymClass {
  return {
    id: 'c1',
    name: 'Test Class',
    category: 'Fuerza',
    trainerId: 't1',
    day: 'Lun',
    startTime: '07:00',
    durationMin: 60,
    capacity: 10,
    bookedIds: [],
    waitlistIds: [],
    attendedIds: [],
    ...overrides,
  };
}

function makePayment(overrides: Partial<Payment> = {}): Payment {
  return {
    id: 'p1',
    memberId: 'm1',
    amount: 49,
    date: '2024-01-01',
    plan: 'Pro',
    status: 'pagado',
    ...overrides,
  };
}

describe('getNotifications', () => {
  it('returns nothing without a session', () => {
    expect(getNotifications(null, { members: [], classes: [], payments: [] })).toEqual([]);
  });

  it('flags overdue members and pending payments for admin', () => {
    const members = [makeMember({ id: 'm1', name: 'Vencido', status: 'vencida' })];
    const payments = [makePayment({ memberId: 'm1', status: 'pendiente' })];
    const notifications = getNotifications({ role: 'admin' }, { members, classes: [], payments });

    expect(notifications.some((n) => n.severity === 'danger' && n.message.includes('Vencido'))).toBe(true);
    expect(notifications.some((n) => n.severity === 'warning' && n.message.includes('pendiente'))).toBe(true);
  });

  it('flags near-full classes for admin and trainer', () => {
    const classes = [makeClass({ id: 'c1', trainerId: 't1', capacity: 10, bookedIds: Array(9).fill('x') })];
    const adminNotifications = getNotifications({ role: 'admin' }, { members: [], classes, payments: [] });
    const trainerNotifications = getNotifications({ role: 'trainer', trainerId: 't1' }, { members: [], classes, payments: [] });

    expect(adminNotifications.some((n) => n.message.includes('casi llena'))).toBe(true);
    expect(trainerNotifications.some((n) => n.message.includes('casi llena'))).toBe(true);
  });

  it('does not flag a trainer for classes that are not theirs', () => {
    const classes = [makeClass({ id: 'c1', trainerId: 't2', capacity: 10, bookedIds: Array(9).fill('x') })];
    const notifications = getNotifications({ role: 'trainer', trainerId: 't1' }, { members: [], classes, payments: [] });
    expect(notifications).toEqual([]);
  });

  it('warns a member whose own payment is due soon', () => {
    const soon = new Date();
    soon.setDate(soon.getDate() + 2);
    const members = [makeMember({ id: 'm1', status: 'activa', nextPaymentDate: soon.toISOString().slice(0, 10) })];
    const notifications = getNotifications({ role: 'member', memberId: 'm1' }, { members, classes: [], payments: [] });
    expect(notifications.some((n) => n.message.includes('próximo pago'))).toBe(true);
  });

  it('tells an overdue member their membership is overdue', () => {
    const members = [makeMember({ id: 'm1', status: 'vencida' })];
    const notifications = getNotifications({ role: 'member', memberId: 'm1' }, { members, classes: [], payments: [] });
    expect(notifications.some((n) => n.severity === 'danger')).toBe(true);
  });
});
