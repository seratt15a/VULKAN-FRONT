import type { GymClass } from './types';

export const classes: GymClass[] = [
  { id: 'c1', name: 'Fuerza Base', category: 'Fuerza', trainerId: 't1', day: 'Lun', startTime: '07:00', durationMin: 60, capacity: 12, bookedIds: ['m1', 'm2', 'm5'], waitlistIds: [], attendedIds: ['m1', 'm2'] },
  { id: 'c2', name: 'Powerlifting Avanzado', category: 'Fuerza', trainerId: 't1', day: 'Mié', startTime: '18:00', durationMin: 75, capacity: 2, bookedIds: ['m1', 'm4'], waitlistIds: ['m6'], attendedIds: [] },
  { id: 'c3', name: 'HIIT Quema Total', category: 'HIIT', trainerId: 't2', day: 'Mar', startTime: '06:30', durationMin: 45, capacity: 16, bookedIds: ['m2', 'm3', 'm5', 'm6'], waitlistIds: [], attendedIds: [] },
  { id: 'c4', name: 'Funcional Explosivo', category: 'HIIT', trainerId: 't2', day: 'Jue', startTime: '19:00', durationMin: 50, capacity: 16, bookedIds: ['m1'], waitlistIds: [], attendedIds: [] },
  { id: 'c5', name: 'Hipertrofia Piernas', category: 'Hipertrofia', trainerId: 't3', day: 'Lun', startTime: '17:00', durationMin: 60, capacity: 12, bookedIds: ['m2', 'm4', 'm6'], waitlistIds: [], attendedIds: [] },
  { id: 'c6', name: 'Hipertrofia Torso', category: 'Hipertrofia', trainerId: 't3', day: 'Vie', startTime: '17:00', durationMin: 60, capacity: 12, bookedIds: [], waitlistIds: [], attendedIds: [] },
  { id: 'c7', name: 'Movilidad & Recuperación', category: 'Movilidad', trainerId: 't4', day: 'Mié', startTime: '08:00', durationMin: 45, capacity: 20, bookedIds: ['m3', 'm5'], waitlistIds: [], attendedIds: [] },
  { id: 'c8', name: 'Yoga Flow', category: 'Movilidad', trainerId: 't4', day: 'Sáb', startTime: '09:00', durationMin: 60, capacity: 20, bookedIds: ['m2', 'm6'], waitlistIds: [], attendedIds: [] },
  { id: 'c9', name: 'Cardio Boxing', category: 'Cardio', trainerId: 't2', day: 'Sáb', startTime: '10:30', durationMin: 45, capacity: 18, bookedIds: ['m1', 'm3'], waitlistIds: [], attendedIds: [] },
];
