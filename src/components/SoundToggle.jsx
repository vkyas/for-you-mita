export default function SoundToggle({ on, nudging, onToggle }) {
  return (
    <button
      type="button"
      className={`sound-toggle${nudging ? ' is-nudging' : ''}`}
      aria-pressed={on}
      aria-label={on ? 'Mute background music' : 'Play background music'}
      onClick={onToggle}
    >
      <span className="sound-toggle__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M9 18V6.8c0-.5.3-.9.8-1l7-1.5c.7-.2 1.2.3 1.2 1v10"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <ellipse cx="6.8" cy="18.2" rx="2.5" ry="1.9" fill="currentColor" />
          <ellipse cx="16.7" cy="15.4" rx="2.5" ry="1.9" fill="currentColor" />
          <path
            className="sound-toggle__slash"
            d="M4 4l16 16"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span className="sound-toggle__label">{on ? 'Sound on' : 'Sound off'}</span>
    </button>
  );
}
