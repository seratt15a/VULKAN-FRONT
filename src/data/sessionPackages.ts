import type { SessionPackage } from './types';

export const sessionPackages: SessionPackage[] = [
  { id: 'pkg1', memberId: 'm6', totalSessions: 10, usedSessions: 3, purchaseDate: '2026-06-01', expirationDate: '2026-09-01', price: 450 },
  { id: 'pkg2', memberId: 'm5', totalSessions: 5, usedSessions: 5, purchaseDate: '2026-05-10', expirationDate: '2026-08-10', price: 250 },
];
