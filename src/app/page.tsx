"use client";

import { useState } from "react";
import { HeroRose } from "@/components/HeroRose";
import { RoseRain } from "@/components/RoseRain";
import { Scene } from "@/components/Scene";
import { useIsClient } from "@/lib/useIsClient";
import { useReducedMotion } from "@/lib/useReducedMotion";

type Phase = "raining" | "ready" | "accepted";

export default function Home() {
  const isClient = useIsClient();
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("raining");
  // Hareket azaltma açıksa iniş animasyonu hiç oynamaz; doğrudan `ready` say.
  const current: Phase = phase === "raining" && reducedMotion ? "ready" : phase;

  return (
    <main className="relative h-dvh w-full overflow-hidden">
      <Scene />
      {isClient && current === "raining" && <RoseRain />}
      {isClient && (
        <HeroRose onLanded={() => setPhase((previous) => (previous === "raining" ? "ready" : previous))} />
      )}
    </main>
  );
}
