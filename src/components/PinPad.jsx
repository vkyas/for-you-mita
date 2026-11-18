import { useCallback, useEffect, useRef, useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CORRECT_PIN = '191126';
const PIN_LENGTH = 6;

const KEYPAD = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['C', '0', '⌫'],
];

function PinDot({ filled, active, success }) {
  const cls = [
    'pin-dot',
    filled ? 'is-filled' : '',
    active ? 'is-active' : '',
    success ? 'is-success' : '',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <span className={cls} aria-hidden="true">
      {success && (
        <svg viewBox="0 0 16 16" className="pin-dot__heart">
          <path
            d="M8 13.8C6.3 12.3 3.2 9.8 3.2 7.2c0-1.3 1-2.4 2.3-2.4 1.1 0 1.8.6 2.5 1.6.7-1 1.4-1.6 2.5-1.6 1.3 0 2.3 1.1 2.3 2.4 0 2.6-3.1 5.1-4.8 6.6Z"
            fill="currentColor"
          />
        </svg>
      )}
    </span>
  );
}

function PinPad({ onUnlock, onBack, reduce = false }) {
  const [pin, setPin] = useState('');
  const [status, setStatus] = useState('idle'); // idle | checking | error | success
  const containerRef = useRef(null);
  const processingRef = useRef(false);

  const addDigit = useCallback(
    (digit) => {
      if (processingRef.current) return;
      if (status === 'error' || status === 'success' || status === 'checking') return;
      setPin((prev) => {
        if (prev.length >= PIN_LENGTH) return prev;
        const next = prev + digit;
        if (next.length === PIN_LENGTH) {
          processingRef.current = true;
          /* auto-validate once full */
          setTimeout(() => {
            if (next === CORRECT_PIN) {
              setStatus('success');
              setTimeout(() => {
                processingRef.current = false;
                onUnlock();
              }, reduce ? 100 : 680);
            } else {
              setStatus('error');
              setTimeout(() => {
                setPin('');
                setStatus('idle');
                processingRef.current = false;
              }, reduce ? 200 : 1200);
            }
          }, reduce ? 50 : 120);
        }
        return next;
      });
    },
    [onUnlock, reduce, status],
  );

  const deleteDigit = useCallback(() => {
    if (processingRef.current) return;
    if (status !== 'idle') return;
    setPin((prev) => prev.slice(0, -1));
  }, [status]);

  const clearOrBack = useCallback(() => {
    if (processingRef.current) return;
    if (status !== 'idle') return;
    if (pin.length === 0) {
      onBack();
    } else {
      setPin('');
    }
  }, [pin, onBack, status]);

  /* physical keyboard */
  useEffect(() => {
    const handleKey = (e) => {
      if (e.target.closest && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA'))
        return;
      if (e.key === 'Escape') {
        onBack();
        return;
      }
      if (e.key === 'Backspace') {
        e.preventDefault();
        deleteDigit();
        return;
      }
      if (/^[0-9]$/.test(e.key)) {
        addDigit(e.key);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [addDigit, deleteDigit, onBack]);

  const handleKeyTap = (key) => {
    if (key === '⌫') deleteDigit();
    else if (key === 'C') clearOrBack();
    else addDigit(key);
  };

  return (
    <div className="pin-pad" ref={containerRef} role="group" aria-label="Enter secret PIN">
      <button
        type="button"
        className="pin-pad__back"
        onClick={onBack}
        aria-label="Back to bouquet"
      >
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M12.5 15l-5-5 5-5"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Back
      </button>

      <h1 className="pin-pad__heading" id="pin-title">One Little Secret</h1>

      <p className="pin-pad__subtitle">Can you remember our special day?</p>

      <p className="pin-pad__hint" aria-hidden="true">
        19 · 11 · 26
      </p>

      <div
        className={`pin-dots${status === 'error' ? ' is-shaking' : ''}`}
        role="status"
        aria-live="polite"
        aria-label={`${pin.length} of ${PIN_LENGTH} digits entered`}
      >
        {Array.from({ length: PIN_LENGTH }, (_, i) => (
          <PinDot
            key={i}
            filled={i < pin.length}
            active={i === pin.length && status === 'idle'}
            success={status === 'success'}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {status === 'error' && (
          <motion.p
            className="pin-pad__error"
            key="error"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            Not quite... try again, sweetheart.
          </motion.p>
        )}
      </AnimatePresence>

      <div
        className="pin-keypad"
        role="group"
        aria-label="Number pad"
      >
        {KEYPAD.map((row, ri) =>
          row.map((key) => {
            const label =
              key === '⌫'
                ? 'Delete last digit'
                : key === 'C'
                  ? pin.length === 0 ? 'Back to bouquet' : 'Clear all digits'
                  : `Digit ${key}`;
            return (
              <button
                key={`${ri}-${key}`}
                type="button"
                className={`pin-key${key === '⌫' || key === 'C' ? ' pin-key--action' : ''}`}
                onClick={() => handleKeyTap(key)}
                aria-label={label}
                disabled={status === 'checking' || status === 'success'}
              >
                {key}
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
}

export default memo(PinPad);
