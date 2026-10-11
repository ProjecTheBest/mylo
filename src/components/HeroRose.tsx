import { useEffect } from "react";
import { setCssVars } from "@/lib/cssVars";
import { HERO_DELAY_S, HERO_DURATION_S } from "@/lib/roseRain";
import { Rose } from "./Rose";

const HERO_VARS = {
  "--hero-dur": `${HERO_DURATION_S}s`,
  "--hero-delay": `${HERO_DELAY_S}s`,
} as const;

/** `animationend` hiç gelmezse (animasyonlar zorla kapatılmış, iptal) arayüzü yine de açmak için yedek süre. */
const LANDING_FALLBACK_MS = (HERO_DELAY_S + HERO_DURATION_S) * 1000 + 1500;

const applyHeroVars = (el: HTMLDivElement | null): void => setCssVars(el, HERO_VARS);

interface HeroRoseProps {
  /** İniş animasyonu bittiğinde (veya yedek süre dolduğunda) çağrılır; birden çok çağrı zararsız olmalı. */
  onLanded: () => void;
}

export function HeroRose({ onLanded }: HeroRoseProps) {
  useEffect(() => {
    const timer = window.setTimeout(onLanded, LANDING_FALLBACK_MS);
    return () => window.clearTimeout(timer);
  }, [onLanded]);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[3dvh] z-10 flex justify-center">
      <div
        ref={applyHeroVars}
        className="hero-land h-[38dvh] [@media(max-height:500px)]:h-[32dvh]"
        onAnimationEnd={(event) => {
          if (event.target === event.currentTarget) onLanded();
        }}
      >
        <Rose palette="red" withStem className="h-full w-auto drop-shadow-2xl" />
      </div>
    </div>
  );
}
