import type { Member } from '../data/types';

export interface Achievement {
  id: string;
  label: string;
  description: string;
  unlocked: boolean;
}

function monthsSince(iso: string): number {
  const start = new Date(iso + 'T00:00:00');
  const now = new Date();
  return (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
}

export function computeAchievements(member: Member): Achievement[] {
  const months = monthsSince(member.joinDate);
  const firstWeight = member.weightHistory[0]?.weightKg;
  const lastWeight = member.weightHistory.at(-1)?.weightKg;
  const progressingToGoal =
    firstWeight !== undefined &&
    lastWeight !== undefined &&
    Math.abs(lastWeight - member.weightGoalKg) < Math.abs(firstWeight - member.weightGoalKg);

  return [
    {
      id: 'primeros-pasos',
      label: 'Primeros pasos',
      description: 'Completó su primer check-in',
      unlocked: member.checkIns >= 1,
    },
    {
      id: 'racha-7',
      label: 'Racha de hierro',
      description: '7 días seguidos entrenando',
      unlocked: member.currentStreakDays >= 7,
    },
    {
      id: 'racha-30',
      label: 'Imparable',
      description: '30 días seguidos entrenando',
      unlocked: member.currentStreakDays >= 30,
    },
    {
      id: 'checkins-50',
      label: 'Habitual',
      description: '50 check-ins acumulados',
      unlocked: member.checkIns >= 50,
    },
    {
      id: 'checkins-200',
      label: 'Veterano de sala',
      description: '200 check-ins acumulados',
      unlocked: member.checkIns >= 200,
    },
    {
      id: 'aniversario',
      label: 'Miembro fundador',
      description: '1 año o más en VULKAN',
      unlocked: months >= 12,
    },
    {
      id: 'rumbo-a-la-meta',
      label: 'Rumbo a la meta',
      description: 'Progreso medible hacia su peso objetivo',
      unlocked: progressingToGoal,
    },
  ];
}
