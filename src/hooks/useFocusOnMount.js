import { useEffect } from 'react';

/* Move focus to a scene's heading / control once it has settled in. */
export function useFocusOnMount(id, delay) {
  useEffect(() => {
    if (delay == null) return undefined;
    const timer = window.setTimeout(() => {
      document.getElementById(id)?.focus({ preventScroll: true });
    }, delay);
    return () => window.clearTimeout(timer);
  }, [id, delay]);
}
