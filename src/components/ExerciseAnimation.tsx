import { getMovementType, movementTips, movementPhotos, findLibraryExercise } from '../lib/exerciseLibrary';

export function ExerciseAnimation({ name, libraryKey, size = 88 }: { name: string; libraryKey?: string; size?: number }) {
  const libraryEntry = findLibraryExercise(libraryKey);
  const type = getMovementType(name);
  const photo = libraryEntry?.photo ?? movementPhotos[type];
  const tip = libraryEntry?.tip ?? movementTips[type];

  return (
    <div className="exercise-anim" style={{ width: size, height: size }} title={tip}>
      <img src={photo} alt={`Demostración: ${tip}`} />
    </div>
  );
}
