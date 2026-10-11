/** Kalp silüeti (canvas-confetti `shapeFromPath` için SVG yolu). */
const HEART_PATH =
  "M167 72c19,-38 37,-56 75,-56 42,0 76,33 76,75 0,76 -76,151 -151,227 -76,-76 -151,-151 -151,-227 0,-42 33,-75 75,-75 38,0 57,18 76,56z";

const HEART_COLORS = ["#e0364f", "#ff5d8f", "#ff8fb0", "#ffc2d4", "#b3122f"];

/** Kalp şeklinde konfeti patlatır. Modül yüklenemezse sessizce vazgeçer; akış bozulmaz. */
export async function fireConfetti(): Promise<void> {
  try {
    const { default: confetti } = await import("canvas-confetti");
    const heart = confetti.shapeFromPath({ path: HEART_PATH });
    const base = {
      zIndex: 50,
      disableForReducedMotion: true,
      shapes: [heart],
      scalar: 2,
      colors: HEART_COLORS,
    };
    confetti({ ...base, particleCount: 60, spread: 90, origin: { x: 0.5, y: 0.7 } });
    confetti({ ...base, particleCount: 30, angle: 60, spread: 70, origin: { x: 0, y: 0.8 } });
    confetti({ ...base, particleCount: 30, angle: 120, spread: 70, origin: { x: 1, y: 0.8 } });
  } catch {
    // Konfeti olmadan da akış devam eder.
  }
}
