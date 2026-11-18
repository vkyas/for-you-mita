/* ══════════════════════════════════════════════════════════════
   Mobile-Optimized Bouquet Bloom Choreography
   
   Performance profile:
   - Desktop: Full animation with subtle scale
   - Mobile: Simplified with smoother, more elegant timing
   
   Timing: Mobile 1.8s (smooth), Desktop 2.2s (refined)
   ══════════════════════════════════════════════════════════════ */
import gsap from "gsap";

const EASE_SOFT = "power2.out";
const EASE_GENTLE = "power1.out";
const EASE_SMOOTH = "power2.inOut";

// Detect mobile/tablet devices
const isMobileDevice = () => {
  return window.matchMedia('(max-width: 768px)').matches ||
         window.matchMedia('(hover: none) and (pointer: coarse)').matches;
};

export function createBloomTimeline(holder) {
  const tl = gsap.timeline({ paused: true });
  const isMobile = isMobileDevice();

  if (isMobile) {
    // MOBILE PROFILE: Smooth and elegant, optimized for performance
    // Total duration: ~1.8s (lebih smooth daripada 0.9s sebelumnya)
    
    // Foundation elements (0-0.6s) - lebih lambat dan smooth
    tl.fromTo(
      ".wrap-blade__anim",
      { opacity: 0 },
      { 
        opacity: 1, 
        duration: 0.5,
        ease: EASE_GENTLE,
        stagger: 0.025
      },
      0
    );

    tl.fromTo(
      ".stem-draw",
      { opacity: 0 },
      { 
        opacity: 1, 
        duration: 0.45,
        ease: EASE_GENTLE,
        stagger: 0.02
      },
      0.08
    );

    tl.fromTo(
      ".greenery-anim",
      { opacity: 0 },
      { 
        opacity: 1, 
        duration: 0.45,
        ease: EASE_SOFT,
        stagger: 0.02
      },
      0.12
    );

    // Flowers in smooth waves (0.3-1.6s) - durasi lebih panjang
    const flowers = Array.from(holder.querySelectorAll(".flower"));
    const third = Math.ceil(flowers.length / 3);
    
    // Wave 1: Back layer - smooth fade in
    tl.fromTo(
      flowers.slice(0, third),
      { opacity: 0 },
      { 
        opacity: 1, 
        duration: 0.7,
        ease: EASE_SMOOTH
      },
      0.3
    );
    
    // Wave 2: Middle layer - overlap untuk smooth transition
    tl.fromTo(
      flowers.slice(third, third * 2),
      { opacity: 0 },
      { 
        opacity: 1, 
        duration: 0.7,
        ease: EASE_SMOOTH
      },
      0.6
    );
    
    // Wave 3: Front layer + focal - final reveal
    tl.fromTo(
      flowers.slice(third * 2),
      { opacity: 0 },
      { 
        opacity: 1, 
        duration: 0.7,
        ease: EASE_SMOOTH
      },
      0.9
    );

    // Ribbon (1.0-1.6s) - gentle finish
    tl.fromTo(
      ".ribbon-anim",
      { opacity: 0 },
      { 
        opacity: 1, 
        duration: 0.6,
        ease: EASE_SOFT
      },
      1.0
    );
    
    // Mobile bloom completes at ~1.8s
    
  } else {
    // DESKTOP PROFILE: Full refined animation with subtle scale
    // Total duration: ~2.2s
    
    // Foundation elements (0-0.55s)
    tl.fromTo(
      ".wrap-blade__anim",
      { opacity: 0 },
      { 
        opacity: 1, 
        duration: 0.45,
        ease: EASE_GENTLE,
        stagger: 0.025
      },
      0
    );

    tl.fromTo(
      ".stem-draw",
      { opacity: 0 },
      { 
        opacity: 1, 
        duration: 0.4,
        ease: EASE_GENTLE,
        stagger: 0.02
      },
      0.06
    );

    tl.fromTo(
      ".greenery-anim",
      { opacity: 0 },
      { 
        opacity: 1, 
        duration: 0.4,
        ease: EASE_SOFT,
        stagger: 0.02
      },
      0.09
    );

    // Flowers with subtle scale and smooth stagger (0.35-1.9s)
    const flowers = holder.querySelectorAll(".flower");
    
    tl.fromTo(
      flowers,
      { opacity: 0, scale: 0.96 },
      { 
        opacity: 1, 
        scale: 1,
        duration: 0.6,
        ease: EASE_SOFT,
        stagger: {
          each: 0.035,
          from: "center"
        }
      },
      0.35
    );

    // Ribbon (1.3-1.9s)
    tl.fromTo(
      ".ribbon-anim",
      { opacity: 0 },
      { 
        opacity: 1, 
        duration: 0.6,
        ease: EASE_SOFT
      },
      1.3
    );
    
    // Desktop bloom completes at ~2.2s
  }

  return tl;
}

/* Post-bloom fade - gentle and elegant */
export function createPushTimeline(holder) {
  const tl = gsap.timeline({ paused: true });
  const pushElement = holder.querySelector(".bouquet-push");
  const isMobile = isMobileDevice();
  
  if (pushElement) {
    tl.fromTo(
      pushElement,
      { opacity: 0.96 },
      { 
        opacity: 1, 
        duration: isMobile ? 1.8 : 2.2, 
        ease: "power1.out" 
      },
      0
    );
  }
  
  return tl;
}
