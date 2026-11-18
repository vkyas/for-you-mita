import { useEffect, useRef } from 'react';
import { createPetalField } from '../lib/petalsField.js';

/* The drifting petal canvas lives outside the scenes, so it is
   created once and torn down with the app. */
export function usePetalField(canvasRef) {
  const fieldRef = useRef(null);

  useEffect(() => {
    const field = createPetalField(canvasRef.current);
    fieldRef.current = field;
    return () => {
      if (field) field.destroy();
      fieldRef.current = null;
    };
  }, []);

  return fieldRef;
}
