import { mulberry32 } from "./rng";

export type FallingPalette = "pink" | "peach" | "white";

export const FALLING_PALETTES: readonly FallingPalette[] = ["pink", "peach", "white"];

export const ROSE_COUNT = 30;
export const ROSE_SEED = 20261011;

export const MAX_FALL_DELAY_S = 2;
export const MIN_FALL_DURATION_S = 2.4;
export const MAX_FALL_DURATION_S = 3.4;

/** Kırmızı gülün iniş zamanlaması; CSS `--hero-delay` / `--hero-dur` bu değerlerden beslenir. */
export const HERO_DELAY_S = 2.6;
export const HERO_DURATION_S = 3;

export interface RoseSpec {
  id: number;
  /** Soldan konum, yüzde. */
  left: number;
  /** Genişlik, rem. */
  size: number;
  /** Düşüş süresi, saniye. */
  duration: number;
  /** Başlama gecikmesi, saniye. */
  delay: number;
  /** Düşerken toplam dönüş, derece. */
  spin: number;
  /** Yan sallanma genliği, rem. */
  swayAmp: number;
  /** Yan sallanma periyodu, saniye. */
  swayDur: number;
  palette: FallingPalette;
}

export function buildRoses(count: number, seed: number): RoseSpec[] {
  const rng = mulberry32(seed);
  const between = (min: number, max: number): number => min + rng() * (max - min);

  return Array.from({ length: count }, (_, id): RoseSpec => ({
    id,
    left: between(2, 94),
    size: between(2.2, 4.2),
    duration: between(MIN_FALL_DURATION_S, MAX_FALL_DURATION_S),
    delay: Math.min(MAX_FALL_DELAY_S, (id / count) * MAX_FALL_DELAY_S + between(0, 0.15)),
    spin: Math.round(between(-300, 300)),
    swayAmp: between(0.8, 2.2),
    swayDur: between(0.9, 1.6),
    palette: FALLING_PALETTES[Math.floor(rng() * FALLING_PALETTES.length)] ?? "pink",
  }));
}
