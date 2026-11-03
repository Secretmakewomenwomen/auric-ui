import { useSyncExternalStore } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { CustomEase } from 'gsap/CustomEase';
import { Flip } from 'gsap/Flip';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(useGSAP, CustomEase, Flip, ScrollTrigger);
export const docsEase = CustomEase.create('auricui-docs', '0.2,0.8,0.2,1');
export { gsap, useGSAP, Flip, ScrollTrigger };

const preference = '(prefers-reduced-motion: reduce)';
const subscribe = (listener: () => void) => {
  const media = window.matchMedia(preference);
  media.addEventListener('change', listener);
  return () => media.removeEventListener('change', listener);
};
/** Reading and controls remain available when animation is disabled or JS has not run. */
export function useMotionAllowed() {
  return useSyncExternalStore(subscribe, () => !window.matchMedia(preference).matches, () => false);
}
