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

// Fotos reales de ejercicios de wger.de (base de datos abierta, CC BY-SA 3.0 — https://wger.de).
export const movementPhotos: Record<MovementType, string> = {
  squat: 'https://wger.de/media/exercise-images/1963/db285682-1ab3-4be0-ae00-5117ecce1ee6.png',
  hinge: 'https://wger.de/media/exercise-images/1003/772d6e47-3865-4944-9255-7435d0b06782.png',
  press: 'https://wger.de/media/exercise-images/925/67dbb1c9-b378-46f9-adb6-1f55b3d3007a.png',
  pull: 'https://wger.de/media/exercise-images/152/6c1a7459-266d-491a-bd50-7cbaea2bc771.png',
  curl: 'https://wger.de/media/exercise-images/1012/8270fdb8-28f1-4eff-b410-af8642085b3f.png',
  core: 'https://wger.de/media/exercise-images/1022/f74644fa-f43e-46bd-8603-6e3a2ee8ee2d.jpg',
  lunge: 'https://wger.de/media/exercise-images/984/5c7ffe68-e7b2-47f3-a22a-f9cc28640432.png',
  generic: 'https://wger.de/media/exercise-images/960/da4d0560-da89-4bb5-b91f-746458fb04ad.png',
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
