import { useEffect, useRef } from 'react';
import { animate } from 'animejs';
import useReducedMotion from '../hooks/useReducedMotion';

export default function AnimatedLogo({ className = "" }) {
  const pathRef1 = useRef(null);
  const pathRef2 = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;
    
    if (pathRef1.current) {
      const length1 = pathRef1.current.getTotalLength();
      pathRef1.current.setAttribute('stroke-dasharray', length1);
      pathRef1.current.setAttribute('stroke-dashoffset', length1);
      animate(pathRef1.current, {
        strokeDashoffset: [length1, 0],
        duration: 2500,
        ease: 'inOutQuart',
        loop: true,
        alternate: true
      });
    }

    if (pathRef2.current) {
      const length2 = pathRef2.current.getTotalLength();
      pathRef2.current.setAttribute('stroke-dasharray', length2);
      pathRef2.current.setAttribute('stroke-dashoffset', length2);
      animate(pathRef2.current, {
        strokeDashoffset: [length2, 0],
        duration: 2500,
        ease: 'inOutQuart',
        delay: 500,
        loop: true,
        alternate: true
      });
    }

  }, [prefersReducedMotion]);

  return (
    <svg className={className} width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        ref={pathRef1}
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
        fill="url(#goldGradient)"
        stroke="url(#goldGradient)"
        strokeWidth="0.5"
      />
      <path
        ref={pathRef2}
        d="M11 16.5l-4.5-4.5 1.41-1.41L11 13.67l6.59-6.59L19 8.5l-8 8z"
        fill="none"
        stroke="url(#goldGradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="goldGradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C8A96E" />
          <stop offset="1" stopColor="#D4B87A" />
        </linearGradient>
      </defs>
    </svg>
  );
}
