/** Konfeti patlatır. Modül yüklenemezse sessizce vazgeçer; akış bozulmaz. */
export async function fireConfetti(): Promise<void> {
  try {
    const { default: confetti } = await import("canvas-confetti");
    const base = { zIndex: 50, disableForReducedMotion: true };
    confetti({ ...base, particleCount: 120, spread: 90, origin: { x: 0.5, y: 0.7 } });
    confetti({ ...base, particleCount: 60, angle: 60, spread: 70, origin: { x: 0, y: 0.8 } });
    confetti({ ...base, particleCount: 60, angle: 120, spread: 70, origin: { x: 1, y: 0.8 } });
  } catch {
    // Konfeti olmadan da akış devam eder.
  }
}
