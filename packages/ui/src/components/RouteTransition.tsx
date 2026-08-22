import {
  Outlet,
  RouterContextProvider,
  useRouter,
  useRouterState,
} from '@tanstack/react-router';
import {
  AnimatePresence,
  motion,
  useIsPresent,
  useReducedMotion,
} from 'motion/react';
import { forwardRef, useRef } from 'react';

const SLIDE_DISTANCE = 8;
const SCALE_FACTOR = 0.995;
const TRANSITION_DURATION = 0.16;

const slideVariants = {
  enter: {
    x: SLIDE_DISTANCE,
    scale: SCALE_FACTOR,
    opacity: 0,
  },
  center: {
    x: 0,
    scale: 1,
    opacity: 1,
  },
  exit: {
    x: -SLIDE_DISTANCE,
    scale: SCALE_FACTOR,
    opacity: 0,
  },
};

const AnimatedOutlet = forwardRef<HTMLDivElement>((_, ref) => {
  const router = useRouter();
  const isPresent = useIsPresent();
  const reducedMotion = useReducedMotion();
  const frozenState = useRef(router.__store.state);
  const frozenRouter = useRef(router);

  if (isPresent) {
    frozenState.current = router.__store.state;
    frozenRouter.current = router;
  } else if (frozenRouter.current === router) {
    const snapshot = frozenState.current;
    const storeProxy = Object.create(router.__store) as typeof router.__store;
    Object.defineProperty(storeProxy, 'state', { get: () => snapshot });
    Object.defineProperty(storeProxy, 'get', { value: () => snapshot });

    const routerProxy = Object.create(router) as typeof router;
    Object.defineProperty(routerProxy, '__store', { value: storeProxy });
    frozenRouter.current = routerProxy;
  }

  return (
    <motion.div
      ref={ref}
      className="min-h-full w-full"
      variants={slideVariants}
      initial={reducedMotion ? false : 'enter'}
      animate="center"
      exit="exit"
      transition={{
        duration: reducedMotion ? 0 : TRANSITION_DURATION,
        ease: 'easeOut',
      }}
    >
      <RouterContextProvider router={frozenRouter.current}>
        <Outlet />
      </RouterContextProvider>
    </motion.div>
  );
});

export const RouteTransition = () => {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  return (
    <div className="min-h-full w-full">
      <AnimatePresence mode="wait" initial={false}>
        <AnimatedOutlet key={pathname} />
      </AnimatePresence>
    </div>
  );
};
