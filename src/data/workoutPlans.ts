import type { WorkoutPlan } from './types';

export const workoutPlans: WorkoutPlan[] = [
  {
    id: 'wp1',
    memberId: 'm1',
    trainerId: 't1',
    title: 'Fuerza — Bloque 3',
    createdAt: '2026-07-01',
    exercises: [
      { name: 'Sentadilla trasera', sets: 5, reps: '5', notes: 'Subir 2.5 kg respecto a la semana pasada' },
      { name: 'Press banca', sets: 4, reps: '6' },
      { name: 'Peso muerto rumano', sets: 3, reps: '8' },
      { name: 'Remo con barra', sets: 3, reps: '10' },
    ],
  },
  {
    id: 'wp2',
    memberId: 'm6',
    trainerId: 't3',
    title: 'Hipertrofia — Fase de definición',
    createdAt: '2026-06-15',
    exercises: [
      { name: 'Press inclinado mancuernas', sets: 4, reps: '10-12' },
      { name: 'Extensión de cuádriceps', sets: 4, reps: '12' },
      { name: 'Curl de bíceps', sets: 3, reps: '12', notes: 'Tempo lento en la fase excéntrica' },
      { name: 'Elevaciones laterales', sets: 3, reps: '15' },
    ],
  },
];
