import { setCssVars } from "@/lib/cssVars";
import { buildRoses, ROSE_COUNT, ROSE_SEED } from "@/lib/roseRain";
import { Rose } from "./Rose";

const ROSES = buildRoses(ROSE_COUNT, ROSE_SEED);

export function RoseRain() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden="true">
      {ROSES.map((rose) => (
        <div
          key={rose.id}
          ref={(el) =>
            setCssVars(el, {
              "--rose-left": `${rose.left}%`,
              "--rose-size": `${rose.size}rem`,
              "--rose-dur": `${rose.duration}s`,
              "--rose-delay": `${rose.delay}s`,
              "--rose-spin": `${rose.spin}deg`,
              "--rose-sway": `${rose.swayAmp}rem`,
              "--rose-sway-dur": `${rose.swayDur}s`,
            })
          }
          className="rose-fall absolute top-0 left-[var(--rose-left)] w-[var(--rose-size)] max-sm:even:hidden"
        >
          <div className="rose-sway">
            <Rose palette={rose.palette} className="h-auto w-full drop-shadow-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
