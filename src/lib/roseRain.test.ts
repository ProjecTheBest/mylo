import { describe, expect, it } from "vitest";
import {
  buildRoses,
  FALLING_PALETTES,
  HERO_DELAY_S,
  HERO_DURATION_S,
  MAX_FALL_DELAY_S,
  MAX_FALL_DURATION_S,
  MIN_FALL_DURATION_S,
  ROSE_COUNT,
  ROSE_SEED,
} from "./roseRain";

describe("buildRoses", () => {
  const roses = buildRoses(ROSE_COUNT, ROSE_SEED);

  it("builds the requested number of roses with unique ids", () => {
    expect(roses).toHaveLength(ROSE_COUNT);
    expect(new Set(roses.map((rose) => rose.id)).size).toBe(ROSE_COUNT);
  });

  it("is deterministic for the same seed (server and client agree)", () => {
    expect(buildRoses(ROSE_COUNT, ROSE_SEED)).toEqual(roses);
  });

  it("differs for a different seed", () => {
    expect(buildRoses(ROSE_COUNT, ROSE_SEED + 1)).not.toEqual(roses);
  });

  it("keeps every value in its documented range", () => {
    for (const rose of roses) {
      expect(rose.left).toBeGreaterThanOrEqual(2);
      expect(rose.left).toBeLessThanOrEqual(96);
      expect(rose.delay).toBeGreaterThanOrEqual(0);
      expect(rose.delay).toBeLessThanOrEqual(MAX_FALL_DELAY_S);
      expect(rose.duration).toBeGreaterThanOrEqual(MIN_FALL_DURATION_S);
      expect(rose.duration).toBeLessThanOrEqual(MAX_FALL_DURATION_S);
      expect(rose.size).toBeGreaterThan(0);
    }
  });

  it("only uses non-red palettes so the final red rose stands out", () => {
    for (const rose of roses) {
      expect(FALLING_PALETTES).toContain(rose.palette);
    }
  });

  it("lands every falling rose before the hero rose lands", () => {
    const lastFallingLanding = Math.max(...roses.map((rose) => rose.delay + rose.duration));
    expect(lastFallingLanding).toBeLessThan(HERO_DELAY_S + HERO_DURATION_S);
  });

  it("starts the hero rose after the last falling rose has started", () => {
    const lastStart = Math.max(...roses.map((rose) => rose.delay));
    expect(HERO_DELAY_S).toBeGreaterThan(lastStart);
  });

  it("spreads start delays over time rather than bunching them", () => {
    const early = roses.filter((rose) => rose.delay < MAX_FALL_DELAY_S / 2).length;
    expect(early).toBeGreaterThan(ROSE_COUNT * 0.3);
    expect(early).toBeLessThan(ROSE_COUNT * 0.7);
  });
});
