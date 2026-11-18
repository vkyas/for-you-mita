import { motion } from 'framer-motion';

/* One act of the play. Framer Motion crossfades the sections the way
   the original CSS did: the leaving scene keeps fading underneath
   while the arriving one comes up over it. */
export default function Scene({ name, labelledBy, active, reduce, extra, children }) {
  return (
    <motion.section
      className={`scene scene--${name}${active ? ' is-active' : ''}${extra ? ` ${extra}` : ''}`}
      id={`scene-${name}`}
      data-scene-name={name}
      aria-labelledby={labelledBy}
      aria-hidden={!active}
      style={{ pointerEvents: active ? 'auto' : 'none' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduce ? 0 : 0.9, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {children}
    </motion.section>
  );
}
