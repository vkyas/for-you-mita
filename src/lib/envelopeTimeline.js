/* ══════════════════════════════════════════════════════════════
   Smooth Envelope Opening Animation
   
   Desktop: Full cinematic sequence (~4.5s)
   Mobile: Smooth optimized sequence (~3.5s)
   
   Lebih smooth dan elegant, tidak terburu-buru
   ══════════════════════════════════════════════════════════════ */
import gsap from 'gsap';

const EASE_OUT = 'power3.out';
const EASE_SOFT = 'power2.out';
const EASE_SILK = 'power3.inOut';

const SHADOW_RISED = '0 34px 56px -30px rgba(95, 40, 58, .4), 0 1px 0 rgba(255, 255, 255, .8) inset';
const SHADOW_OPEN = '0 48px 80px -38px rgba(95, 40, 58, .42), 0 1px 0 rgba(255, 255, 255, .8) inset';

// Mobile optimization: Lighter shadows
const SHADOW_RISED_MOBILE = '0 20px 40px -20px rgba(95, 40, 58, .35), 0 1px 0 rgba(255, 255, 255, .8) inset';
const SHADOW_OPEN_MOBILE = '0 28px 50px -24px rgba(95, 40, 58, .38), 0 1px 0 rgba(255, 255, 255, .8) inset';

function parts(root) {
  return {
    seal: root.querySelector('.env-seal'),
    ring: root.querySelector('.env-seal-ring'),
    hint: root.querySelector('.env-hint'),
    addressing: root.querySelector('.env-addressing'),
    ornaments: Array.from(root.querySelectorAll('.env-ornament')),
    flap: root.querySelector('.env-flap'),
    card: root.querySelector('.env-card'),
    cardContent: root.querySelector('.env-card__content'),
    fading: Array.from(
      root.querySelectorAll('.env-back, .env-front, .env-flap, .env-seal, .envelope__shadow')
    )
  };
}

function cardFinal() {
  const small = window.matchMedia('(max-width: 600px)').matches;
  return small
    ? { yPercent: -53, rotate: 0, scale: 1.1 }
    : { yPercent: -56, rotate: 0, scale: 1.17 };
}

function isMobileDevice() {
  return window.matchMedia('(max-width: 768px)').matches ||
         window.matchMedia('(hover: none) and (pointer: coarse)').matches;
}

export function createEnvelopeTimeline(root, { onVeil, onEnterBouquet } = {}) {
  const p = parts(root);
  const tl = gsap.timeline({ paused: true });
  const isMobile = isMobileDevice();
  
  // Mobile: 0.85x timing (lebih smooth daripada 0.75x sebelumnya)
  // Desktop: 1.0x timing (full cinematic)
  const speedFactor = isMobile ? 0.85 : 1.0;
  const shadows = isMobile 
    ? { rised: SHADOW_RISED_MOBILE, open: SHADOW_OPEN_MOBILE }
    : { rised: SHADOW_RISED, open: SHADOW_OPEN };

  /* Wax seal cracks, shivers, and lifts away - smooth animation */
  tl.to(
    p.seal,
    {
      keyframes: [
        { scale: 1.12, rotate: -3, duration: 0.22 * speedFactor, ease: 'power1.out' },
        { yPercent: -54, scale: 0.94, rotate: 7, opacity: 0.8, duration: 0.35 * speedFactor, ease: 'power1.inOut' },
        { yPercent: -86, scale: 0.5, rotate: 18, opacity: 0, duration: 0.45 * speedFactor, ease: 'power1.in' }
      ]
    },
    0.1 * speedFactor
  );

  /* Soft ring of light where the seal used to be */
  tl.fromTo(
    p.ring,
    { opacity: 0.8, scale: 0.8 },
    { opacity: 0, scale: 1.8, duration: 1.2 * speedFactor, ease: EASE_OUT, immediateRender: false },
    0.12 * speedFactor
  );

  /* Hint, addressing and corner ornaments fade out gently */
  tl.to(p.hint, { opacity: 0, duration: 0.6 * speedFactor, ease: EASE_SOFT }, 0);
  tl.to([p.addressing, ...p.ornaments], { opacity: 0, duration: 0.7 * speedFactor, ease: EASE_SOFT }, 0);

  /* Flap swings open smoothly, then tucks behind the card */
  tl.to(p.flap, { rotateX: 168, duration: 1.4 * speedFactor, ease: EASE_SILK }, 0.35 * speedFactor);
  tl.set(p.flap, { zIndex: 1 }, 1.0 * speedFactor);

  /* Card rises out of the envelope - smooth and elegant */
  tl.to(
    p.card,
    {
      yPercent: -51,
      rotate: 0.4,
      scale: 1.015,
      boxShadow: shadows.rised,
      duration: 1.6 * speedFactor,
      ease: EASE_OUT
    },
    1.3 * speedFactor
  );
  tl.to(p.cardContent, { opacity: 1, duration: 1.0 * speedFactor, ease: EASE_SOFT }, 1.45 * speedFactor);

  /* Card opens to fill the frame while the paper fades */
  tl.to(p.card, { ...cardFinal(), boxShadow: shadows.open, duration: 1.6 * speedFactor, ease: EASE_OUT }, 2.6 * speedFactor);
  tl.to(p.fading, { opacity: 0, duration: 0.8 * speedFactor, ease: EASE_SOFT }, 2.6 * speedFactor);

  /* Hand over to the bouquet, and fade the whole envelope */
  tl.call(() => onVeil && onVeil(true), [], 3.9 * speedFactor);
  tl.to(root, { opacity: 0, duration: 0.7 * speedFactor, ease: EASE_SOFT }, 3.9 * speedFactor);
  tl.call(() => onEnterBouquet && onEnterBouquet(), [], 4.5 * speedFactor);

  return tl;
}

/* Reduced-motion bypass: land the card, let the veil and bouquet through */
export function applyEnvelopeFinal(root) {
  const p = parts(root);
  gsap.set([p.hint, p.addressing, ...p.ornaments, p.seal, p.ring], { opacity: 0 });
  gsap.set(p.flap, { rotateX: 168, zIndex: 1 });
  gsap.set(p.card, { ...cardFinal(), boxShadow: SHADOW_OPEN });
  gsap.set(p.cardContent, { opacity: 1 });
}
