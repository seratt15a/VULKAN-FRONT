export type MovementType = 'squat' | 'hinge' | 'press' | 'pull' | 'curl' | 'core' | 'lunge' | 'generic';

// Fallback only, used when a workout entry has no libraryKey (older data or a
// fully custom exercise name typed by the trainer).
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
// Cada foto fue revisada a mano — wger es editable por su comunidad y no todo
// lo que suben es confiable (encontramos capturas de Instagram y diagramas
// con marca de agua de terceros mezclados con las ilustraciones originales).
export const movementPhotos: Record<MovementType, string> = {
  squat: 'https://wger.de/media/exercise-images/1963/db285682-1ab3-4be0-ae00-5117ecce1ee6.png',
  hinge: 'https://wger.de/media/exercise-images/1003/772d6e47-3865-4944-9255-7435d0b06782.png',
  press: 'https://wger.de/media/exercise-images/925/67dbb1c9-b378-46f9-adb6-1f55b3d3007a.png',
  pull: 'https://wger.de/media/exercise-images/152/6c1a7459-266d-491a-bd50-7cbaea2bc771.png',
  curl: 'https://wger.de/media/exercise-images/1012/8270fdb8-28f1-4eff-b410-af8642085b3f.png',
  core: 'https://wger.de/media/exercise-images/91/Crunches-1.png',
  lunge: 'https://wger.de/media/exercise-images/113/Walking-lunges-1.png',
  generic: 'https://wger.de/media/exercise-images/960/da4d0560-da89-4bb5-b91f-746458fb04ad.png',
};

export interface LibraryExercise {
  key: string;
  name: string;
  photo: string;
  tip: string;
}

// Ejercicios que el entrenador puede elegir directamente — la foto queda
// fijada por la selección, no adivinada por el nombre que se escriba.
export const exerciseLibrary: LibraryExercise[] = [
  { key: 'squat-back', name: 'Sentadilla trasera', photo: movementPhotos.squat, tip: movementTips.squat },
  { key: 'squat-front', name: 'Sentadilla frontal', photo: movementPhotos.squat, tip: movementTips.squat },
  { key: 'deadlift', name: 'Peso muerto', photo: movementPhotos.hinge, tip: movementTips.hinge },
  { key: 'deadlift-rdl', name: 'Peso muerto rumano', photo: movementPhotos.hinge, tip: movementTips.hinge },
  { key: 'bench-press', name: 'Press banca', photo: movementPhotos.press, tip: movementTips.press },
  { key: 'military-press', name: 'Press militar', photo: movementPhotos.press, tip: movementTips.press },
  { key: 'incline-press', name: 'Press inclinado mancuernas', photo: movementPhotos.press, tip: movementTips.press },
  { key: 'barbell-row', name: 'Remo con barra', photo: movementPhotos.pull, tip: movementTips.pull },
  { key: 'pull-up', name: 'Dominadas', photo: movementPhotos.pull, tip: movementTips.pull },
  { key: 'lat-pulldown', name: 'Jalón al pecho', photo: movementPhotos.pull, tip: movementTips.pull },
  { key: 'bicep-curl', name: 'Curl de bíceps', photo: movementPhotos.curl, tip: movementTips.curl },
  { key: 'tricep-extension', name: 'Extensión de tríceps', photo: movementPhotos.curl, tip: 'Estira el codo por completo sin mover el hombro.' },
  { key: 'leg-extension', name: 'Extensión de cuádriceps', photo: movementPhotos.squat, tip: 'Controla el movimiento, evita el impulso.' },
  { key: 'lateral-raise', name: 'Elevaciones laterales', photo: movementPhotos.generic, tip: 'Sube hasta la altura del hombro, sin impulso.' },
  { key: 'plank', name: 'Plancha', photo: movementPhotos.core, tip: movementTips.core },
  { key: 'lunge', name: 'Zancada con mancuernas', photo: movementPhotos.lunge, tip: movementTips.lunge },
];

export function findLibraryExercise(key: string | undefined): LibraryExercise | undefined {
  return key ? exerciseLibrary.find((e) => e.key === key) : undefined;
}
