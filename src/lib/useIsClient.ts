import { useSyncExternalStore } from "react";

const subscribe = (): (() => void) => () => {};

/** Sunucuda ve hydration'da `false`, sonrasında `true`. Effect/setState gerektirmez. */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
