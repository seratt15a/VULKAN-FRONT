import type { Role } from '../data/types';

export const homeByRole: Record<Role, string> = {
  member: '/',
  admin: '/admin',
  trainer: '/entrenador',
};
