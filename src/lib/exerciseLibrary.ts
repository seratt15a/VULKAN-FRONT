export type MovementType = 'squat' | 'hinge' | 'press' | 'pull' | 'curl' | 'core' | 'lunge' | 'generic';

const keywordMap: [RegExp, MovementType][] = [
  [/sentadilla|squat/i, 'squat'],
  [/peso muerto|deadlift|rumano/i, 'hinge'],
  [/press|banca|hombro|militar|empuje/i, 'press'],
  [/remo|dominad|jal[oó]n|pull/i, 'pull'],
  [/curl|extensi[oó]n|tr[ií]ceps|b[ií]ceps/i, 'curl'],
  [/plancha|abdomin|core/i, 'core'],
  [/zancada|lunge/i, 'lunge'],
];

export function getMovementType(exerciseName: string): MovementType {
  const match = keywordMap.find(([regex]) => regex.test(exerciseName));
  return match ? match[1] : 'generic';
}

export const movementTips: Record<MovementType, string> = {
  squat: 'Baja controlando la rodilla, pecho arriba.',
  hinge: 'Cadera atrás, espalda neutra, empuja el piso.',
  press: 'Exhala al empujar, controla la bajada.',
  pull: 'Lleva el codo atrás, aprieta la espalda.',
  curl: 'Codo fijo, sube y baja controlado.',
  core: 'Cuerpo alineado, aprieta el abdomen.',
  lunge: 'Rodilla alineada con el pie, baja recto.',
  generic: 'Sigue el tempo indicado por tu entrenador.',
};

export const commonExercises = [
  'Sentadilla trasera',
  'Sentadilla frontal',
  'Peso muerto',
  'Peso muerto rumano',
  'Press banca',
  'Press militar',
  'Press inclinado mancuernas',
  'Remo con barra',
  'Dominadas',
  'Jalón al pecho',
  'Curl de bíceps',
  'Extensión de tríceps',
  'Extensión de cuádriceps',
  'Elevaciones laterales',
  'Plancha',
  'Zancada con mancuernas',
];
