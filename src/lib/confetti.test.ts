import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.resetModules();
  vi.doUnmock("canvas-confetti");
});

describe("fireConfetti", () => {
  it("fires three bursts of heart-shaped confetti when canvas-confetti loads", async () => {
    const heart = { kind: "heart" };
    const shapeFromPath = vi.fn(() => heart);
    const confetti = Object.assign(vi.fn(), { shapeFromPath });
    vi.doMock("canvas-confetti", () => ({ default: confetti }));
    const { fireConfetti } = await import("./confetti");

    await fireConfetti();

    expect(shapeFromPath).toHaveBeenCalledTimes(1);
    expect(confetti).toHaveBeenCalledTimes(3);
    for (const [options] of confetti.mock.calls) {
      expect(options).toMatchObject({ shapes: [heart] });
    }
  });

  it("resolves without throwing when canvas-confetti fails to load", async () => {
    vi.doMock("canvas-confetti", () => {
      throw new Error("chunk load failed");
    });
    const { fireConfetti } = await import("./confetti");

    await expect(fireConfetti()).resolves.toBeUndefined();
  });
});
