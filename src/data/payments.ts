import type { Payment } from './types';

export const payments: Payment[] = [
  { id: 'p1', memberId: 'm1', amount: 49, date: '2026-07-05', plan: 'Pro', status: 'pagado' },
  { id: 'p2', memberId: 'm2', amount: 89, date: '2026-06-28', plan: 'Élite', status: 'pagado' },
  { id: 'p3', memberId: 'm3', amount: 29, date: '2026-06-30', plan: 'Básico', status: 'pendiente' },
  { id: 'p4', memberId: 'm4', amount: 49, date: '2026-06-10', plan: 'Pro', status: 'vencido' },
  { id: 'p5', memberId: 'm5', amount: 29, date: '2026-07-01', plan: 'Básico', status: 'pagado' },
  { id: 'p6', memberId: 'm6', amount: 89, date: '2026-07-03', plan: 'Élite', status: 'pagado' },
  { id: 'p7', memberId: 'm1', amount: 49, date: '2026-06-05', plan: 'Pro', status: 'pagado' },
  { id: 'p8', memberId: 'm2', amount: 89, date: '2026-05-28', plan: 'Élite', status: 'pagado' },
];
