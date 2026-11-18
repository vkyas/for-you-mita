import { useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Scene from "./Scene.jsx";
import {
  createEnvelopeTimeline,
  applyEnvelopeFinal,
} from "../lib/envelopeTimeline.js";
import { useFocusOnMount } from "../hooks/useFocusOnMount.js";

export default function Envelope({
  active,
  reduce,
  focusDelay,
  onOpen,
  onVeil,
  onEnterBouquet,
}) {
  const rootRef = useRef(null);
  const tlRef = useRef(null);
  const timerRef = useRef(0);
  const [busy, setBusy] = useState(false);

  useFocusOnMount("envelope", focusDelay);

  /* callbacks stay fresh without rebuilding the timeline */
  const cbRef = useRef({ onOpen, onVeil, onEnterBouquet });
  cbRef.current = { onOpen, onVeil, onEnterBouquet };

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reduce) return undefined;

    const tl = createEnvelopeTimeline(root, {
      onVeil: (value) => cbRef.current.onVeil(value),
      onEnterBouquet: () => cbRef.current.onEnterBouquet(),
    });
    tlRef.current = tl;
    return () => {
      tl.kill();
      tlRef.current = null;
    };
  }, [reduce]);

  useLayoutEffect(
    () => () => {
      window.clearTimeout(timerRef.current);
    },
    [],
  );

  const handleOpen = () => {
    if (busy) return;
    setBusy(true);
    cbRef.current.onOpen();

    if (reduce) {
      applyEnvelopeFinal(rootRef.current);
      timerRef.current = window.setTimeout(
        () => cbRef.current.onEnterBouquet(),
        240,
      );
      return;
    }
    if (tlRef.current) tlRef.current.play();
  };

  return (
    <Scene
      name="envelope"
      labelledBy="envelope-kicker"
      active={active}
      reduce={reduce}
    >
      <div className="envelope-glow" aria-hidden="true"></div>

      <motion.div
        className="envelope-wrap"
        initial={reduce ? false : { opacity: 0, y: 26, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: reduce ? 0 : 1.15,
          delay: reduce ? 0 : 0.05,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <h1 className="env-kicker" id="envelope-kicker">
          I have something for you
        </h1>

        <button
          ref={rootRef}
          className={`envelope${busy ? " is-busy" : ""}`}
          id="envelope"
          type="button"
          disabled={busy}
          aria-label="Open the envelope"
          aria-describedby="envelope-hint"
          onClick={handleOpen}
        >
          <span className="envelope__shadow" aria-hidden="true"></span>
          <span className="envelope__3d" aria-hidden="true">
            <span className="env-back"></span>

            <span className="env-card" id="env-card">
              <span className="env-card__border"></span>
              <span className="env-card__corner env-card__corner--tl"></span>
              <span className="env-card__corner env-card__corner--br"></span>
              <span className="env-card__content">
                <svg
                  className="env-card__sprig"
                  viewBox="0 0 120 90"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M60 84C58 66 60 50 68 34C74 22 82 16 92 14"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M62 60C48 56 40 44 42 32C56 34 64 44 62 60Z"
                    stroke="currentColor"
                    strokeWidth="1.1"
                  />
                  <path
                    d="M66 46C78 40 86 30 86 18C72 20 64 30 66 46Z"
                    stroke="currentColor"
                    strokeWidth="1.1"
                  />
                  <path
                    d="M70 34C68 22 76 12 88 10C90 22 82 32 70 34Z"
                    stroke="currentColor"
                    strokeWidth="1.1"
                  />
                  <circle
                    cx="94"
                    cy="12"
                    r="5.5"
                    stroke="currentColor"
                    strokeWidth="1.1"
                  />
                  <circle cx="94" cy="12" r="1.8" fill="currentColor" />
                  <path
                    d="M60 84C56 78 48 76 42 79"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    opacity=".65"
                  />
                </svg>
                <span className="env-card__for">Miftahul Janah</span>
                <span className="env-card__rule"></span>
                <span className="env-card__note">
                  a little flower,
                  <br />a little love
                </span>
              </span>
            </span>

            <span className="env-front">
              <span className="env-front__left"></span>
              <span className="env-front__right"></span>
              <span className="env-front__bottom"></span>
            </span>

            <span className="env-flap">
              <span className="env-flap__outside">
                <span className="env-flap__crease"></span>
              </span>
              <span className="env-flap__lining">
                <span className="env-flap__lining-mark"></span>
              </span>
            </span>

            <span className="env-seal" id="env-seal">
              <span className="env-seal-ring" aria-hidden="true"></span>
              <svg viewBox="0 0 120 120" aria-hidden="true">
                <defs>
                  <radialGradient id="waxGrad" cx="38%" cy="30%" r="78%">
                    <stop offset="0%" stopColor="#E2A3AF" />
                    <stop offset="52%" stopColor="#B96680" />
                    <stop offset="100%" stopColor="#87405A" />
                  </radialGradient>
                  <linearGradient id="waxHeart" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#F4CBD3" stopOpacity=".9" />
                    <stop offset="100%" stopColor="#A9556E" stopOpacity=".65" />
                  </linearGradient>
                </defs>
                <path
                  d="M60 9C79 7 97 16 104 33C111 50 110 71 99 87C88 103 72 112 55 110C38 108 22 99 15 83C8 67 10 46 21 30C32 14 44 11 60 9Z"
                  fill="url(#waxGrad)"
                />
                <path
                  d="M60 9C79 7 97 16 104 33C111 50 110 71 99 87C88 103 72 112 55 110C38 108 22 99 15 83C8 67 10 46 21 30C32 14 44 11 60 9Z"
                  fill="none"
                  stroke="#6E3049"
                  strokeOpacity=".35"
                  strokeWidth="1.2"
                />
                <path
                  d="M60 89C46 78 32 65 32 51C32 40 41 33 51 33C56 33 60 36 62 40C65 36 69 33 75 33C85 33 93 41 93 50C93 65 77 78 60 89Z"
                  fill="url(#waxHeart)"
                  opacity=".92"
                />
                <path
                  d="M60 89C46 78 32 65 32 51C32 40 41 33 51 33C56 33 60 36 62 40C65 36 69 33 75 33C85 33 93 41 93 50C93 65 77 78 60 89Z"
                  fill="none"
                  stroke="#7A344D"
                  strokeWidth="1.4"
                  strokeOpacity=".55"
                />
                <path
                  d="M43 32C42 25 47 20 54 19"
                  stroke="#FFDCE1"
                  strokeOpacity=".5"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="84" cy="83" r="2" fill="#6E3049" opacity=".25" />
              </svg>
            </span>

            <span className="env-ornament env-ornament--tl">
              <svg viewBox="0 0 88 88" fill="none">
                <path
                  d="M8 76C20 58 32 46 52 34C66 26 74 20 80 10"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
                <path
                  d="M36 48C30 40 32 32 40 28C46 35 44 43 36 48Z"
                  stroke="currentColor"
                  strokeWidth=".9"
                />
                <path
                  d="M46 39C54 33 62 33 67 38C61 44 53 44 46 39Z"
                  stroke="currentColor"
                  strokeWidth=".9"
                />
                <path
                  d="M56 32C52 25 55 18 62 15C66 22 63 29 56 32Z"
                  stroke="currentColor"
                  strokeWidth=".9"
                />
                <circle cx="72" cy="22" r="2" fill="currentColor" />
              </svg>
            </span>
            <span className="env-ornament env-ornament--br">
              <svg viewBox="0 0 88 88" fill="none">
                <path
                  d="M8 76C20 58 32 46 52 34C66 26 74 20 80 10"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
                <path
                  d="M36 48C30 40 32 32 40 28C46 35 44 43 36 48Z"
                  stroke="currentColor"
                  strokeWidth=".9"
                />
                <path
                  d="M46 39C54 33 62 33 67 38C61 44 53 44 46 39Z"
                  stroke="currentColor"
                  strokeWidth=".9"
                />
                <path
                  d="M56 32C52 25 55 18 62 15C66 22 63 29 56 32Z"
                  stroke="currentColor"
                  strokeWidth=".9"
                />
                <circle cx="72" cy="22" r="2" fill="currentColor" />
              </svg>
            </span>

            <span className="env-addressing">
              {/* <span className="env-addressing__to">For Mita</span> */}
              <span className="env-addressing__cta">Open Your Gift</span>
            </span>
          </span>
          <span className="env-hint" id="envelope-hint">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 4v15M7 14l5 5 5-5"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Press the wax seal</span>
          </span>
        </button>
      </motion.div>
    </Scene>
  );
}
