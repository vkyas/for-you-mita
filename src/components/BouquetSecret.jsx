import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BouquetTitle from './BouquetTitle.jsx';
import PinPad from './PinPad.jsx';
import LoveLetter from './LoveLetter.jsx';

const CARD_VARIANTS = {
  initial: { opacity: 0, y: 12, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.22, 0.61, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.98,
    transition: { duration: 0.28, ease: [0.22, 0.61, 0.36, 1] },
  },
};

function BouquetSecret({
  letterState,
  onOpenPin,
  onBack,
  onUnlock,
  onReplay,
  revealed,
  reduce = false,
  titleDone = true,
  onTitleDone,
}) {
  return (
    <div className="bouquet-secret">
      <AnimatePresence mode="wait">
        {letterState === 'locked' && (
          <motion.div
            key="locked"
            className="bouquet-secret__pane bouquet-secret__pane--locked"
            variants={CARD_VARIANTS}
            initial={reduce ? false : 'initial'}
            animate="animate"
            exit={reduce ? false : 'exit'}
          >
            <BouquetTitle
              active={revealed}
              reduce={reduce}
              onDone={onTitleDone}
            />

            {revealed && (
              <motion.div
                className="bouquet-teaser"
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: reduce ? 0 : 0.15 }}
              >
                <button
                  type="button"
                  className="teaser-card"
                  onClick={onOpenPin}
                  aria-label="Unlock the hidden love letter"
                >
                  <span className="teaser-card__heart" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </span>
                  <span className="teaser-card__body">
                    <span className="teaser-card__prompt">
                      A little secret is tucked inside…
                    </span>
                    <span className="teaser-card__action">
                      Tap to open <span aria-hidden="true">&rarr;</span>
                    </span>
                  </span>
                </button>

                <div className="bouquet-actions">
                  <button
                    className="link-btn"
                    id="replay"
                    type="button"
                    onClick={onReplay}
                  >
                    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path
                        d="M16 10a6 6 0 1 1-1.8-4.3M16 3v4h-4"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Unwrap it again
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {letterState === 'pin-entry' && (
          <motion.div
            key="pin-entry"
            className="bouquet-secret__pane bouquet-secret__pane--pin"
            variants={CARD_VARIANTS}
            initial={reduce ? false : 'initial'}
            animate="animate"
            exit={reduce ? false : 'exit'}
          >
            <PinPad
              onUnlock={onUnlock}
              onBack={onBack}
              reduce={reduce}
            />
          </motion.div>
        )}

        {letterState === 'unlocked' && (
          <motion.div
            key="unlocked"
            className="bouquet-secret__pane bouquet-secret__pane--unlocked"
            variants={CARD_VARIANTS}
            initial={reduce ? false : 'initial'}
            animate="animate"
            exit={reduce ? false : 'exit'}
          >
            <LoveLetter
              onReplay={onReplay}
              reduce={reduce}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default memo(BouquetSecret);
