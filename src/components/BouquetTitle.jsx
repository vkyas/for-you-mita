import { useCallback, useEffect, useRef, useState } from 'react';
import { useTypewriter } from 'react-simple-typewriter';

/* the greeting gets a natural little beat before the name lands */
const LEAD_WORDS = ['For You,'];
const NAME_WORDS = ['Mita'];
const LEAD_SPEED = 64;
const NAME_SPEED = 84;
const NAME_PAUSE = 260;

function Cursor({ done = false }) {
  return <span className={`bouquet-title__cursor${done ? ' is-done' : ''}`} aria-hidden="true" />;
}

function TypedName({ onDone }) {
  const [text, { isDone }] = useTypewriter({
    words: NAME_WORDS,
    loop: 1,
    typeSpeed: NAME_SPEED,
    delaySpeed: 0
  });

  useEffect(() => {
    if (isDone) onDone();
  }, [isDone, onDone]);

  return <em className={isDone ? 'is-complete' : 'is-typing'}>{text}</em>;
}

function TypedTitle({ onDone }) {
  const [lead, { isDone: leadDone }] = useTypewriter({
    words: LEAD_WORDS,
    loop: 1,
    typeSpeed: LEAD_SPEED,
    delaySpeed: 0
  });
  const [nameStarted, setNameStarted] = useState(false);
  const [nameDone, setNameDone] = useState(false);

  useEffect(() => {
    if (!leadDone) return undefined;
    const timer = window.setTimeout(() => setNameStarted(true), NAME_PAUSE);
    return () => window.clearTimeout(timer);
  }, [leadDone]);

  const handleNameDone = useCallback(() => {
    setNameDone(true);
    onDone();
  }, [onDone]);

  return (
    <>
      <span>{leadDone ? LEAD_WORDS[0] : lead}</span>
      {nameStarted && (
        <>
          {' '}
          <TypedName onDone={handleNameDone} />
        </>
      )}
      <Cursor done={nameDone} />
    </>
  );
}

export default function BouquetTitle({ active = true, reduce = false, onDone }) {
  const doneRef = useRef(false);
  const handleDone = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone?.();
  }, [onDone]);

  return (
    <h1 className="bouquet-title" id="bouquet-title" tabIndex={-1}>
      {/* the full words stay available to assistive tech while the visual layer types */}
      <span className="sr-only">For You, Mita</span>
      <span className="bouquet-title__live" aria-hidden="true">
        {reduce ? (
          <>
            For You, <em>Mita</em>
          </>
        ) : active ? (
          <TypedTitle onDone={handleDone} />
        ) : (
          <Cursor />
        )}
      </span>
    </h1>
  );
}
