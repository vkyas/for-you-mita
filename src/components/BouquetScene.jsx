import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion } from "framer-motion";
import Scene from "./Scene.jsx";
import BouquetSecret from "./BouquetSecret.jsx";
import SecretHint from "./SecretHint.jsx";
import { buildBouquetSVG, buildSparkleSpots } from "../lib/bouquetArt.js";
import {
  createBloomTimeline,
  createPushTimeline,
} from "../lib/bloomTimeline.js";
import { useFocusOnMount } from "../hooks/useFocusOnMount.js";

const REVEAL_AFTER = 380; // the message lands just after the bloom
const FOCUS_AFTER_MOUNT = 420;
const TITLE_GRACE = 4200; // never leave the note hidden if the typewriter stalls

export default function BouquetScene({
  active,
  reduce,
  focusDelay = reduce ? 40 : FOCUS_AFTER_MOUNT,
  celebrate,
  onReplay,
  onMounted,
}) {
  const [phase, setPhase] = useState(reduce ? "revealed" : "blooming");
  const [titleDone, setTitleDone] = useState(reduce);
  const [letterState, setLetterState] = useState('locked');
  const revealed = phase === "revealed";
  const noteIn = revealed && (reduce || titleDone);
  const actionsIn = noteIn;

  const markup = useMemo(
    () => `<div class="bouquet-push">${buildBouquetSVG()}</div>`,
    [],
  );
  const sparkles = useMemo(() => buildSparkleSpots(), []);

  const holderRef = useRef(null);
  const tlRef = useRef(null);
  const pushRef = useRef(null);
  const timersRef = useRef([]);
  const doneRef = useRef(false);
  const finishRef = useRef(null);

  useFocusOnMount("bouquet-title", focusDelay);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    if (tlRef.current) {
      tlRef.current.kill();
      tlRef.current = null;
    }
    /* the cinematic push only starts now — bloom done, or Skip pressed */
    if (pushRef.current) pushRef.current.play();
    setPhase("bloomed");
    const timer = window.setTimeout(
      () => setPhase("revealed"),
      reduce ? 0 : REVEAL_AFTER,
    );
    timersRef.current.push(timer);
  }, [reduce]);
  finishRef.current = finish;

  const handleTitleDone = useCallback(() => setTitleDone(true), []);

  /* if the typewriter is interrupted or throttled, let the note through anyway */
  useEffect(() => {
    if (reduce) {
      setTitleDone(true);
      return undefined;
    }
    if (!revealed || titleDone) return undefined;
    const timer = window.setTimeout(() => setTitleDone(true), TITLE_GRACE);
    return () => window.clearTimeout(timer);
  }, [reduce, revealed, titleDone]);

  /* the bloom starts the moment the scene is on stage */
  useLayoutEffect(() => {
    if (reduce) return undefined;
    const holder = holderRef.current;
    if (!holder) return undefined;

    const tl = createBloomTimeline(holder);
    tl.eventCallback(
      "onComplete",
      () => finishRef.current && finishRef.current(),
    );
    tlRef.current = tl;
    pushRef.current = createPushTimeline(holder);
    tl.play();

    return () => {
      tl.kill();
      tlRef.current = null;
      if (pushRef.current) {
        pushRef.current.kill();
        pushRef.current = null;
      }
    };
  }, [reduce]);

  /* release the veil, and tidy timers on the way out */
  useEffect(() => {
    if (onMounted) onMounted();
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.length = 0;
    };
  }, [onMounted]);

  const handleSkip = () => {
    const tl = tlRef.current;
    if (tl) tl.progress(1); // land every bud on its final frame
    finish();
    const timer = window.setTimeout(() => {
      document.getElementById("bouquet-title")?.focus({ preventScroll: true });
    }, 460);
    timersRef.current.push(timer);
  };

  const handleStageClick = (event) => {
    if (!revealed) return;
    if (event.target.closest && event.target.closest("button")) return;
    if (letterState === 'pin-entry') {
      setLetterState('locked');
      return;
    }
    if (celebrate) celebrate(event.clientX, event.clientY);
  };

  const handleReplay = useCallback(() => {
    setLetterState('locked');
    onReplay?.();
  }, [onReplay]);

  const sceneLabel =
    letterState === 'locked'
      ? 'bouquet-title'
      : letterState === 'pin-entry'
        ? 'pin-title'
        : 'love-letter-title';

  const extra = [
    phase === "blooming" ? "is-blooming" : "",
    phase !== "blooming" ? "is-bloomed" : "",
    revealed ? "is-revealed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Scene
      name="bouquet"
      labelledBy={sceneLabel}
      active={active}
      reduce={reduce}
      extra={extra}
    >
      <div className="bouquet-ambient" aria-hidden="true"></div>

      <div className="bouquet-layout">
        <div
          className="bouquet-stage"
          id="bouquet-stage"
          onClick={handleStageClick}
        >
          <div className="stage-glow" aria-hidden="true"></div>

          <div
            className="bouquet-holder"
            id="bouquet-holder"
            ref={holderRef}
            dangerouslySetInnerHTML={{ __html: markup }}
          ></div>

          <div
            className="sparkle-field"
            id="sparkle-field"
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: sparkles }}
          ></div>

          <p className="bloom-caption" id="bloom-caption" aria-hidden="true">
            A little something, blooming
            <span className="bloom-caption__dots">…</span>
          </p>

          <button
            className="skip-bloom"
            id="skip-bloom"
            type="button"
            onClick={handleSkip}
          >
            Skip
          </button>

          <SecretHint
            onClick={() => setLetterState('pin-entry')}
            visible={revealed && letterState === 'locked'}
            reduce={reduce}
          />
        </div>

        <motion.div
          className="bouquet-message"
          id="bouquet-message"
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
          transition={{
            duration: reduce ? 0 : 1.6,
            ease: [0.22, 0.61, 0.36, 1],
          }}
        >
          <span className="bouquet-message__mark" aria-hidden="true">
            <svg viewBox="0 0 40 40" fill="none">
              <path
                d="M20 34C20 26 20 20 20 14"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
              />
              <path
                d="M20 24C13 23 8 18 8 11C15 12 20 17 20 24Z"
                stroke="currentColor"
                strokeWidth=".9"
              />
              <path
                d="M20 18C27 17 32 12 32 5C25 6 20 11 20 18Z"
                stroke="currentColor"
                strokeWidth=".9"
              />
              <circle
                cx="20"
                cy="9"
                r="4.5"
                stroke="currentColor"
                strokeWidth=".9"
              />
            </svg>
          </span>

          <BouquetSecret
            letterState={letterState}
            onOpenPin={() => setLetterState('pin-entry')}
            onBack={() => setLetterState('locked')}
            onUnlock={() => setLetterState('unlocked')}
            onReplay={handleReplay}
            revealed={revealed}
            reduce={reduce}
            titleDone={titleDone}
            onTitleDone={handleTitleDone}
          />
        </motion.div>
      </div>
    </Scene>
  );
}
