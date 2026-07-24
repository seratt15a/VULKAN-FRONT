import { getMovementType, movementTips, movementPhotos } from '../lib/exerciseLibrary';

export function ExerciseAnimation({ name, size = 88 }: { name: string; size?: number }) {
  const type = getMovementType(name);

  return (
    <div className="exercise-anim" style={{ width: size, height: size }} title={movementTips[type]}>
      <img src={movementPhotos[type]} alt={`Demostración: ${movementTips[type]}`} />
    </div>
  );
}
