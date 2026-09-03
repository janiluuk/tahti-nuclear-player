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
import { forwardRef, memo, useRef } from 'react';

const SLIDE_DISTANCE = 8;
const SCALE_FACTOR = 0.995;
const TRANSITION_DURATION = 0.16;
const FAST_TRANSITION_DURATION = 0.1;

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

// Opacity-only, no exit choreography: used for high-frequency in-section
// navigation (Studio/Admin/Library sub-routes) where a slide + wait-for-exit
// transition would add perceptible delay to every click.
const fadeVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

const AnimatedOutlet = forwardRef<HTMLDivElement, { fast?: boolean }>(
  ({ fast = false }, ref) => {
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
        variants={fast ? fadeVariants : slideVariants}
        initial={reducedMotion ? false : 'enter'}
        animate="center"
        exit="exit"
        transition={{
          duration: reducedMotion
            ? 0
            : fast
              ? FAST_TRANSITION_DURATION
              : TRANSITION_DURATION,
          ease: 'easeOut',
        }}
      >
        <RouterContextProvider router={frozenRouter.current}>
          <Outlet />
        </RouterContextProvider>
      </motion.div>
    );
  },
);

// Memoized so a parent re-render for unrelated state (e.g. AppShell during a
// sidebar resize drag) doesn't re-run the router subscription and outlet
// tree below when `fast` hasn't actually changed.
export const RouteTransition = memo(function RouteTransition({
  fast = false,
}: {
  /** High-frequency in-section navigation (Studio/Admin/Library/Listen
   * tabs): skips the AnimatePresence remount-on-key cycle entirely instead
   * of just cheapening it, since every one of these pages re-declares the
   * same shared chrome (AdminGate/AdminPageLayout, StudioGate/StudioNav,
   * Listen's own tab bar) at the same position in the tree -- keying by
   * pathname forced that identical chrome to unmount and remount on every
   * click instead of letting React reconcile it in place, which is what
   * actually caused the visible flicker (not the animation style). */
  fast?: boolean;
}) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  if (fast) {
    return (
      <div className="min-h-full w-full">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-full w-full">
      <AnimatePresence mode="popLayout" initial={false}>
        <AnimatedOutlet key={pathname} fast={fast} />
      </AnimatePresence>
    </div>
  );
});
