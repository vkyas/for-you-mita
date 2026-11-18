import { memo } from 'react';
import { motion } from 'framer-motion';

const NOTE_VARIANTS = {
  hidden: {},
  show: { transition: { staggerChildren: 0.16, delayChildren: 0.08 } },
};

const NOTE_ITEM = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.22, 0.61, 0.36, 1] },
  },
};

const NOTE_DIVIDER = {
  hidden: { opacity: 0, scaleX: 0.5 },
  show: {
    opacity: 1,
    scaleX: 1,
    transition: { duration: 0.8, ease: [0.22, 0.61, 0.36, 1] },
  },
};

function LoveLetter({ onReplay, reduce = false }) {
  return (
    <motion.div
      className="love-letter"
      initial={reduce ? false : 'hidden'}
      animate="show"
      variants={NOTE_VARIANTS}
    >
      <motion.h1 className="love-letter__heading" id="love-letter-title" variants={NOTE_ITEM}>
        A Bloom Just for You
      </motion.h1>

      <motion.p className="love-letter__message" variants={NOTE_ITEM}>
        I may not have everything figured out, but I'll always try my best for us.
        <em>
          I hope these flowers make you smile. I'm happy to have you in my life,
          and I hope we get to make many more memories together.
        </em>
      </motion.p>

      <motion.div
        className="love-letter__divider"
        variants={NOTE_DIVIDER}
        aria-hidden="true"
      >
        <span className="love-letter__divider-line" />
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M12 20.2C8.5 17.5 3.6 13.9 3.6 9.4c0-2.2 1.7-4 3.9-4 1.9 0 3.3 1.1 4.5 2.8 1.2-1.7 2.6-2.8 4.5-2.8 2.2 0 3.9 1.8 3.9 4 0 4.5-4.9 8.1-8.4 10.8Z"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinejoin="round"
          />
        </svg>
        <span className="love-letter__divider-line" />
      </motion.div>

      <motion.p className="love-letter__sign" variants={NOTE_ITEM}>
        With love, Vicky.
      </motion.p>

      <motion.div className="bouquet-actions" variants={NOTE_ITEM}>
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
      </motion.div>
    </motion.div>
  );
}

export default memo(LoveLetter);
