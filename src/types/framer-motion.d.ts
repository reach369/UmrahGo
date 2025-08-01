declare module 'framer-motion' {
  export const motion: any;
  export const AnimatePresence: any;
  export const useAnimation: any;
  export const useMotionValue: any;
  export const useTransform: any;
  export const useSpring: any;
  export const useInView: any;
  export const useScroll: any;
  export const useVelocity: any;
  export const useViewportScroll: any;
  
  export interface Variants {
    [key: string]: any;
  }
  
  export interface Transition {
    type?: string;
    delay?: number;
    duration?: number;
    ease?: string | number[];
    damping?: number;
    mass?: number;
    stiffness?: number;
    velocity?: number;
    restSpeed?: number;
    restDelta?: number;
  }
} 