export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rect extends Point, Size {}

export interface DodgeInput {
  /** Butonun sol-üst köşesinin yerleşebileceği alanı belirleyen sınır (viewport koordinatı). */
  bounds: Rect;
  button: Size;
  /** Butonun şu anki sol-üst köşesi. */
  current: Point;
  forbidden: readonly Rect[];
  minDistance: number;
  rng?: () => number;
}

const RANDOM_ATTEMPTS = 40;
const GRID_STEPS = 8;

export function rectsOverlap(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/**
 * Butonun sol-üst köşesi için yeni bir konum seçer. Her zaman `bounds` içinde bir nokta döner
 * (sınır butondan küçükse sınırın sol-üst köşesi). Önce rastgele dener; olmazsa ızgarada
 * yasak bölgelerle çakışmayan ve mevcut konumdan en uzak noktayı seçer.
 */
export function pickDodgePosition({
  bounds,
  button,
  current,
  forbidden,
  minDistance,
  rng = Math.random,
}: DodgeInput): Point {
  const minX = bounds.x;
  const minY = bounds.y;
  const maxX = Math.max(minX, bounds.x + bounds.width - button.width);
  const maxY = Math.max(minY, bounds.y + bounds.height - button.height);

  const isFree = (point: Point): boolean => {
    const rect: Rect = { ...point, ...button };
    return !forbidden.some((blocked) => rectsOverlap(rect, blocked));
  };
  const distanceFromCurrent = (point: Point): number =>
    Math.hypot(point.x - current.x, point.y - current.y);

  for (let attempt = 0; attempt < RANDOM_ATTEMPTS; attempt += 1) {
    const candidate: Point = {
      x: minX + rng() * (maxX - minX),
      y: minY + rng() * (maxY - minY),
    };
    if (isFree(candidate) && distanceFromCurrent(candidate) >= minDistance) {
      return candidate;
    }
  }

  let best: Point = { x: minX, y: minY };
  let bestIsFree = false;
  let bestDistance = -1;
  for (let i = 0; i <= GRID_STEPS; i += 1) {
    for (let j = 0; j <= GRID_STEPS; j += 1) {
      const candidate: Point = {
        x: minX + ((maxX - minX) * i) / GRID_STEPS,
        y: minY + ((maxY - minY) * j) / GRID_STEPS,
      };
      const free = isFree(candidate);
      const distance = distanceFromCurrent(candidate);
      if ((free && !bestIsFree) || (free === bestIsFree && distance > bestDistance)) {
        best = candidate;
        bestIsFree = free;
        bestDistance = distance;
      }
    }
  }
  return best;
}
