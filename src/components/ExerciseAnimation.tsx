import { getMovementType, movementTips } from '../lib/exerciseLibrary';

export function ExerciseAnimation({ name, size = 56 }: { name: string; size?: number }) {
  const type = getMovementType(name);

  return (
    <div className={`exercise-anim exercise-anim-${type}`} style={{ width: size, height: size }} title={movementTips[type]}>
      <svg viewBox="0 0 100 100">
        <g className="exercise-anim-bar">
          <rect className="exercise-anim-rod" x="30" y="46" width="40" height="8" rx="4" />
          <circle className="exercise-anim-weight" cx="26" cy="50" r="14" />
          <circle className="exercise-anim-weight" cx="74" cy="50" r="14" />
        </g>
      </svg>
    </div>
  );
}
