import { useCallback, useEffect, useRef, useState } from 'react';
import AmbientMusic from '../lib/ambientMusic.js';

const MUTE_KEY = 'flowerForMita.muted';

function readMuted() {
  try {
    return window.localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false; /* private mode */
  }
}

function writeMuted(value) {
  try {
    window.localStorage.setItem(MUTE_KEY, value);
  } catch {
    /* noop */
  }
}

/* The score only ever wakes on a gesture, and can always be hushed. */
export function useAmbientMusic() {
  const musicRef = useRef(null);
  const mutedRef = useRef(readMuted());
  const nudgeTimer = useRef(0);
  const [on, setOn] = useState(false);
  const [nudging, setNudging] = useState(false);

  const start = useCallback(async (explicit) => {
    if (explicit) {
      mutedRef.current = false;
      writeMuted('0');
    }
    if (!musicRef.current) musicRef.current = new AmbientMusic();
    const ok = await musicRef.current.start();
    setOn(!!ok);

    if (!ok && explicit) {
      /* a gentle shake of the button so it is clear what to press */
      window.clearTimeout(nudgeTimer.current);
      nudgeTimer.current = window.setTimeout(() => {
        setNudging(true);
        nudgeTimer.current = window.setTimeout(() => setNudging(false), 900);
      }, 50);
    }
    return ok;
  }, []);

  const stop = useCallback((explicit) => {
    if (musicRef.current) musicRef.current.stop();
    setOn(false);
    if (explicit) {
      mutedRef.current = true;
      writeMuted('1');
    }
  }, []);

  const toggle = useCallback(() => {
    if (on) stop(true);
    else start(true);
  }, [on, start, stop]);

  /* start quietly in the background — never before a gesture */
  const autostart = useCallback(() => {
    if (mutedRef.current || on) return;
    start(false);
  }, [on, start]);

  const mutedPref = useCallback(() => mutedRef.current, []);

  useEffect(() => {
    const onHide = () => {
      if (musicRef.current) musicRef.current.stop();
    };
    window.addEventListener('pagehide', onHide);
    return () => {
      window.removeEventListener('pagehide', onHide);
      window.clearTimeout(nudgeTimer.current);
      if (musicRef.current) musicRef.current.stop();
    };
  }, []);

  return { on, nudging, start, stop, toggle, autostart, mutedPref };
}
