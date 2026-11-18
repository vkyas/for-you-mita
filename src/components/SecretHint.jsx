import { memo } from 'react';

function SecretHint({ onClick, visible = true, reduce = false }) {
  if (!visible) return null;

  return (
    <button
      type="button"
      className={`secret-hint${reduce ? ' is-reduced' : ''}`}
      onClick={onClick}
      aria-label="Discover secret message"
      title="A little secret awaits..."
    >
      <span className="secret-hint__glow" aria-hidden="true" />
      <span className="secret-hint__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          {/* Subtle sparkle accents */}
          <path
            d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinecap="round"
            className="secret-hint__rays"
          />
          {/* Center glowing heart */}
          <path
            d="M12 18.5C9.5 16.3 5.5 13.2 5.5 9.5c0-1.9 1.5-3.5 3.5-3.5 1.5 0 2.4.9 3 1.8.6-.9 1.5-1.8 3-1.8 2 0 3.5 1.6 3.5 3.5 0 3.7-4 6.8-6.5 9Z"
            fill="currentColor"
            fillOpacity="0.88"
          />
        </svg>
      </span>
      <span className="secret-hint__tooltip" aria-hidden="true">
        A secret awaits
      </span>
    </button>
  );
}

export default memo(SecretHint);
