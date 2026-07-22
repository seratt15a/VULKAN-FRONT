import type { Role } from '../data/types';

/**
 * Temporary credential store used until the real backend/auth service exists.
 * AuthContext.login() is the only place that reads this — swapping it for a
 * real API call later won't require touching any page or component.
 */
export const DEMO_PASSWORD = 'vulkan2026';

export interface DemoAccount {
  email: string;
  role: Role;
  memberId?: string;
  trainerId?: string;
}

export const demoAccounts: DemoAccount[] = [
  { email: 'admin@vulkangym.com', role: 'admin' },
  { email: 'andres.reyes@gmail.com', role: 'member', memberId: 'm1' },
  { email: 'laura.mendez@gmail.com', role: 'member', memberId: 'm2' },
  { email: 'jorge.salinas@gmail.com', role: 'member', memberId: 'm3' },
  { email: 'sofia.navarro@gmail.com', role: 'member', memberId: 'm4' },
  { email: 'ricardo.palma@gmail.com', role: 'member', memberId: 'm5' },
  { email: 'daniela.cruz@gmail.com', role: 'member', memberId: 'm6' },
  { email: 'marco.diaz@vulkangym.com', role: 'trainer', trainerId: 't1' },
  { email: 'valeria.ruiz@vulkangym.com', role: 'trainer', trainerId: 't2' },
  { email: 'diego.torres@vulkangym.com', role: 'trainer', trainerId: 't3' },
  { email: 'camila.soto@vulkangym.com', role: 'trainer', trainerId: 't4' },
];

export function findDemoAccount(email: string): DemoAccount | undefined {
  const normalized = email.trim().toLowerCase();
  return demoAccounts.find((a) => a.email === normalized);
}
