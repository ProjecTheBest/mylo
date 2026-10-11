import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.resetModules();
  vi.doUnmock("canvas-confetti");
});

describe("fireConfetti", () => {
  it("fires three bursts when canvas-confetti loads", async () => {
    const confetti = vi.fn();
    vi.doMock("canvas-confetti", () => ({ default: confetti }));
    const { fireConfetti } = await import("./confetti");

    await fireConfetti();

    expect(confetti).toHaveBeenCalledTimes(3);
  });

  it("resolves without throwing when canvas-confetti fails to load", async () => {
    vi.doMock("canvas-confetti", () => {
      throw new Error("chunk load failed");
    });
    const { fireConfetti } = await import("./confetti");

    await expect(fireConfetti()).resolves.toBeUndefined();
  });
});
