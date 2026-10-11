import { describe, expect, it } from "vitest";
import {
  pickDodgePosition,
  rectsOverlap,
  type DodgeInput,
  type Point,
  type Rect,
  type Size,
} from "./dodge";
import { mulberry32 } from "./rng";

// 390x844 telefon, 16px kenar boşluğu
const BOUNDS: Rect = { x: 16, y: 16, width: 358, height: 812 };
const BUTTON: Size = { width: 140, height: 48 };
const QUESTION: Rect = { x: 40, y: 150, width: 310, height: 120 };
const YES_BUTTON: Rect = { x: 120, y: 300, width: 150, height: 48 };

function input(overrides: Partial<DodgeInput> = {}): DodgeInput {
  return {
    bounds: BOUNDS,
    button: BUTTON,
    current: { x: 100, y: 600 },
    forbidden: [QUESTION, YES_BUTTON],
    minDistance: 120,
    ...overrides,
  };
}

function rectAt(point: Point, size: Size): Rect {
  return { x: point.x, y: point.y, width: size.width, height: size.height };
}

function isInside(point: Point, bounds: Rect, size: Size): boolean {
  return (
    point.x >= bounds.x &&
    point.y >= bounds.y &&
    point.x + size.width <= bounds.x + bounds.width &&
    point.y + size.height <= bounds.y + bounds.height
  );
}

describe("pickDodgePosition", () => {
  it("stays inside the bounds", () => {
    for (let seed = 0; seed < 200; seed += 1) {
      const point = pickDodgePosition(input({ rng: mulberry32(seed) }));
      expect(isInside(point, BOUNDS, BUTTON)).toBe(true);
    }
  });

  it("never overlaps the forbidden rects", () => {
    for (let seed = 0; seed < 200; seed += 1) {
      const point = pickDodgePosition(input({ rng: mulberry32(seed) }));
      const rect = rectAt(point, BUTTON);
      expect(rectsOverlap(rect, QUESTION)).toBe(false);
      expect(rectsOverlap(rect, YES_BUTTON)).toBe(false);
    }
  });

  it("moves at least minDistance away from the current position", () => {
    const current: Point = { x: 100, y: 600 };
    for (let seed = 0; seed < 200; seed += 1) {
      const point = pickDodgePosition(input({ current, rng: mulberry32(seed) }));
      expect(Math.hypot(point.x - current.x, point.y - current.y)).toBeGreaterThanOrEqual(120);
    }
  });

  it("is deterministic for the same rng", () => {
    const a = pickDodgePosition(input({ rng: mulberry32(7) }));
    const b = pickDodgePosition(input({ rng: mulberry32(7) }));
    expect(a).toEqual(b);
  });

  it("returns the bounds origin when the bounds are smaller than the button", () => {
    const tiny: Rect = { x: 8, y: 8, width: 100, height: 30 };
    const point = pickDodgePosition(
      input({ bounds: tiny, forbidden: [], current: { x: 300, y: 700 }, rng: mulberry32(1) }),
    );
    expect(point).toEqual({ x: 8, y: 8 });
  });

  it("falls back to a free spot when random sampling keeps hitting a forbidden rect", () => {
    // rng her zaman 0 -> aday hep sol-üst köşe; orası yasak bölge.
    const blockedCorner: Rect = { x: 16, y: 16, width: 400, height: 200 };
    const point = pickDodgePosition(
      input({ forbidden: [blockedCorner], current: { x: 16, y: 16 }, rng: () => 0 }),
    );
    expect(isInside(point, BOUNDS, BUTTON)).toBe(true);
    expect(rectsOverlap(rectAt(point, BUTTON), blockedCorner)).toBe(false);
  });

  it("still returns an in-bounds point when everything is forbidden", () => {
    const point = pickDodgePosition(input({ forbidden: [BOUNDS], rng: mulberry32(3) }));
    expect(isInside(point, BOUNDS, BUTTON)).toBe(true);
  });
});
