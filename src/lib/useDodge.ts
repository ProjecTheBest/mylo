import { useCallback, useEffect, useRef, type RefObject } from "react";
import { setCssVars } from "./cssVars";
import { pickDodgePosition, type Point, type Rect } from "./dodge";
import { readSafeInsets } from "./viewport";

const MARGIN_PX = 16;
const APPROACH_PX = 90;
const COOLDOWN_MS = 250;
const MAX_MIN_DISTANCE_PX = 150;

interface UseDodge {
  /** Butonun doğal yerini tutan, dönüşüm almayan sarmalayıcı. */
  slotRef: RefObject<HTMLSpanElement | null>;
  buttonRef: RefObject<HTMLButtonElement | null>;
  /** Butonu yeni bir konuma kaçırır. `from` verilirse o noktanın çevresi de yasak bölge sayılır. */
  dodge: (from?: Point) => void;
}

export function useDodge(getForbidden: () => ReadonlyArray<HTMLElement | null>): UseDodge {
  const slotRef = useRef<HTMLSpanElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const lastDodgeAt = useRef(0);

  const dodge = useCallback(
    (from?: Point) => {
      const slot = slotRef.current;
      const button = buttonRef.current;
      if (!slot || !button) return;

      const slotRect = slot.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      const insets = readSafeInsets();
      const bounds: Rect = {
        x: insets.left + MARGIN_PX,
        y: insets.top + MARGIN_PX,
        width: window.innerWidth - insets.left - insets.right - MARGIN_PX * 2,
        height: window.innerHeight - insets.top - insets.bottom - MARGIN_PX * 2,
      };

      const forbidden: Rect[] = getForbidden().flatMap((el) => (el ? [el.getBoundingClientRect()] : []));
      if (from) {
        forbidden.push({
          x: from.x - APPROACH_PX,
          y: from.y - APPROACH_PX,
          width: APPROACH_PX * 2,
          height: APPROACH_PX * 2,
        });
      }

      const next = pickDodgePosition({
        bounds,
        button: { width: buttonRect.width, height: buttonRect.height },
        current: { x: buttonRect.left, y: buttonRect.top },
        forbidden,
        minDistance: Math.min(MAX_MIN_DISTANCE_PX, Math.min(bounds.width, bounds.height) * 0.35),
      });

      setCssVars(button, {
        "--dx": `${next.x - slotRect.left}px`,
        "--dy": `${next.y - slotRect.top}px`,
      });
      lastDodgeAt.current = performance.now();
    },
    [getForbidden],
  );

  useEffect(() => {
    const onPointerMove = (event: PointerEvent): void => {
      if (event.pointerType !== "mouse") return;
      const button = buttonRef.current;
      if (!button || performance.now() - lastDodgeAt.current < COOLDOWN_MS) return;
      const rect = button.getBoundingClientRect();
      const isNear =
        event.clientX > rect.left - APPROACH_PX &&
        event.clientX < rect.right + APPROACH_PX &&
        event.clientY > rect.top - APPROACH_PX &&
        event.clientY < rect.bottom + APPROACH_PX;
      if (isNear) dodge({ x: event.clientX, y: event.clientY });
    };

    // Yeniden boyutlanma/yön değişiminde buton doğal yerine döner; orası her zaman ekrandadır.
    const onViewportChange = (): void => {
      setCssVars(buttonRef.current, { "--dx": "0px", "--dy": "0px" });
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("resize", onViewportChange);
    window.addEventListener("orientationchange", onViewportChange);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onViewportChange);
      window.removeEventListener("orientationchange", onViewportChange);
    };
  }, [dodge]);

  return { slotRef, buttonRef, dodge };
}
