import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, useReducedMotion } from 'framer-motion';
import Envelope from './components/Envelope.jsx';
import BouquetScene from './components/BouquetScene.jsx';
import SoundToggle from './components/SoundToggle.jsx';
import Veil from './components/Veil.jsx';
import { useAmbientMusic } from './hooks/useAmbientMusic.js';
import { usePetalField } from './hooks/usePetalField.js';

const FOCUS = { envelope: 360, envelopeAgain: 60, bouquet: 420 };

export default function App() {
  const reduce = !!useReducedMotion();
  /* the play opens straight on the envelope */
  const [view, setView] = useState({ scene: 'envelope', delay: reduce ? 40 : FOCUS.envelope });
  const [veilOn, setVeilOn] = useState(false);
  const canvasRef = useRef(null);
  const petalsRef = usePetalField(canvasRef);
  const music = useAmbientMusic();

  const goto = useCallback(
    (scene, delay) => {
      setView({ scene, delay: delay === undefined ? (reduce ? 40 : FOCUS[scene]) : delay });
    },
    [reduce]
  );

  /* the leaving scene must stop being reachable the instant we move on */
  useLayoutEffect(() => {
    document.querySelectorAll('.scene').forEach((section) => {
      const isActive = section.dataset.sceneName === view.scene;
      section.setAttribute('aria-hidden', String(!isActive));
      section.style.pointerEvents = isActive ? 'auto' : 'none';
      section.classList.toggle('is-active', isActive);
    });
  }, [view.scene]);

  /* ── act one: pressing the seal ───────────────────────────── */
  const handleEnvelopeOpen = () => {
    music.autostart();
  };

  const handleVeil = useCallback((value) => setVeilOn(value), []);

  const handleEnterBouquet = useCallback(
    () => goto('bouquet', reduce ? 40 : FOCUS.bouquet),
    [goto, reduce]
  );

  /* the bouquet is on stage — let the veil drift away */
  const handleBouquetMounted = useCallback(() => {
    window.setTimeout(() => setVeilOn(false), 140);
  }, []);

  /* ── act two: quiet little actions ────────────────────────── */
  const swapWithVeil = (move) => {
    setVeilOn(true);
    window.setTimeout(move, 480);
    window.setTimeout(() => setVeilOn(false), 840);
  };

  const handleReplay = () => {
    swapWithVeil(() => goto('envelope', reduce ? 40 : FOCUS.envelopeAgain));
  };

  const celebrate = useCallback(
    (x, y) => {
      const field = petalsRef.current;
      if (field) field.celebrate(x, y);
    },
    [petalsRef]
  );

  return (
    <>
      <canvas id="ambient-canvas" ref={canvasRef} aria-hidden="true"></canvas>
      <div className="grain" aria-hidden="true"></div>
      <div className="pointer-glow" aria-hidden="true"></div>

      <SoundToggle on={music.on} nudging={music.nudging} onToggle={music.toggle} />

      <main id="app">
        <AnimatePresence initial={false}>
          {view.scene === 'envelope' && (
            <Envelope
              key="envelope"
              active
              reduce={reduce}
              focusDelay={view.delay}
              onOpen={handleEnvelopeOpen}
              onVeil={handleVeil}
              onEnterBouquet={handleEnterBouquet}
            />
          )}

          {view.scene === 'bouquet' && (
            <BouquetScene
              key="bouquet"
              active
              reduce={reduce}
              focusDelay={view.delay}
              celebrate={celebrate}
              onReplay={handleReplay}
              onMounted={handleBouquetMounted}
            />
          )}
        </AnimatePresence>
      </main>

      <Veil on={veilOn} />
    </>
  );
}
