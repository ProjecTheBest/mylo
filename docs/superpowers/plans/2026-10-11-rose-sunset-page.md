# Gül Yağmuru Gün Batımı Sayfası Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Açılışta güllerin yağdığı, en son kırmızı bir gülün düşüp kaldığı, gün batımı plajı sahnesinde iki butonlu (yeşil: konfeti + yazı değişimi, kırmızı: kaçan) tek sayfalık, mobil ve masaüstünde çalışan bir site.

**Architecture:** Next.js App Router tek sayfa. Sahne CSS/SVG katmanları (gökyüzü gradyanı, yükselen bulut şeritleri, güneş, deniz, kıyı); yağan güller seed'li deterministik spec'lerden üretilen SVG elemanları (CSS animasyonu, değişkenler CSS custom property ile ref üzerinden verilir); kaçan butonun yeni konumu saf bir fonksiyonla (`dodge.ts`) seçilir. Faz makinesi `raining → ready → accepted`, kırmızı gülün `animationend` olayıyla ilerler.

**Tech Stack:** Next.js (App Router), React 19, Tailwind CSS v4, TypeScript strict (`any` yok), pnpm, canvas-confetti, vitest, Playwright (doğrulama).

**Spec:** `docs/superpowers/specs/2026-10-11-rose-sunset-page-design.md`

## Global Constraints

- Paket yöneticisi **pnpm** (npm değil). TypeScript strict, **`any` yasak**.
- **Inline `style` yazılmaz.** Dinamik değerler yalnızca `setCssVars` (CSS custom property) ile verilir; JS hiçbir yerde `style.transform` yazmaz (Tailwind v4 ayrık `translate`/`scale`/`rotate` özellikleri kullanır).
- Production koduna **`console.*` bırakılmaz**.
- Placeholder metinler (birebir): soru **"Soru metni buraya"**, yeşil buton **"Yeşil buton"**, kırmızı buton **"Kırmızı buton"**, sonuç **"Sonuç metni buraya"**. Tüm metinler yalnızca `src/lib/content.ts` içinde.
- Dokunma hedefi en az **44×44 px** (`min-h-11 min-w-11`).
- Kırmızı butonun fareyle tetiklenme mesafesi **90 px**; dokunmada/`pointerdown`'da ve klavye odağında da kaçar. Hiçbir davranış hover'a bağımlı değil.
- Yükseklik için **`dvh`**; `viewport-fit=cover` + `env(safe-area-inset-*)`.
- Animasyonlar yalnızca `transform`-ailesi (`translate`, `scale`, `rotate`) ve `opacity` kullanır. `prefers-reduced-motion: reduce` iken gül yağmuru, parallax ve geçişler kapanır; sayfa son halinde açılır.
- Doğrulama boyutları: **390×844**, **844×390**, **768×1024**, **1440×900**.
- Konfeti yüklenemezse akış bozulmaz; hata gösterilmez, loglanmaz.
- Proje kökü `C:\Users\USER\Desktop\CODES\myLo` (git repo, dal `main`). Push yok.
- Next.js 16 notu (lessons-learned): bir Next API'sinden emin değilsen `node_modules/next/dist/docs/` oku, hafızadan "böyle bir şey yok" deme.

## Review Focus

Spec'in ima ettiği ama görev testlerinin doğrudan kapsamadığı, kullanıcıyı en olası ısıracak durumlar (en olasıdan başlayarak). Her birinin testi sahibi görevde:

1. Kırmızı butona geçiş animasyonu sürerken art arda hızlı dokunma (25 kez) → buton her zaman viewport içinde kalır. (Task 6, Playwright adımı)
2. Buton yerinden oynamışken ekran boyutu/yönü değişimi (dikey → yatay) → buton ekran dışında kalmaz. (Task 6, Playwright adımı)
3. Kısa yatay ekran (844×390) ve çok dar ekran (320×568): yazı, butonlar ve kırmızı gül taşmaz/üst üste binmez. (Task 7, ekran görüntüsü + ölçüm)
4. `canvas-confetti` modülü yüklenemezse `fireConfetti()` hata fırlatmaz, yazı yine de değişir. (Task 6, `confetti.test.ts`)
5. `prefers-reduced-motion` açık: gül yağmuru yok, `animationend` hiç gelmese bile yazı ve butonlar hemen görünür. (Task 5 ve Task 7, Playwright `emulate_media`)

---

## File Structure

| Dosya | Sorumluluk |
|---|---|
| `src/lib/content.ts` | Tüm yazılar (placeholder) |
| `src/lib/rng.ts` | Seed'li rastgele sayı üreteci `mulberry32` |
| `src/lib/dodge.ts` | Kaçan butonun yeni konumunu seçen saf fonksiyon |
| `src/lib/dodge.test.ts` | `dodge.ts` birim testleri |
| `src/lib/roseRain.ts` | Yağan gül spec'lerini üreten saf fonksiyon + zamanlama sabitleri |
| `src/lib/roseRain.test.ts` | `roseRain.ts` birim testleri |
| `src/lib/cssVars.ts` | Elemana CSS custom property yazan yardımcı (inline style yok) |
| `src/lib/useIsClient.ts` | Sunucuda `false`, istemcide `true` (effect'siz) |
| `src/lib/useReducedMotion.ts` | `prefers-reduced-motion` abonesi |
| `src/lib/viewport.ts` | Güvenli alan (safe-area) ölçümü |
| `src/lib/confetti.ts` | `fireConfetti()` — dinamik import, hata yutan |
| `src/lib/confetti.test.ts` | `confetti.ts` birim testleri |
| `src/lib/useDodge.ts` | Kaçan buton davranışı (hook) |
| `src/components/Scene.tsx` | Gün batımı plajı sahnesi |
| `src/components/Rose.tsx` | SVG gül (palet + opsiyonel sap) |
| `src/components/RoseRain.tsx` | Yağan güller |
| `src/components/HeroRose.tsx` | En son düşüp kalan kırmızı gül |
| `src/components/ChoiceButtons.tsx` | Yazı ve iki buton |
| `src/app/globals.css` | Tailwind + animasyon sınıfları |
| `src/app/layout.tsx` | Metadata, viewport, `lang="tr"` |
| `src/app/page.tsx` | Parçaları birleştirir, faz makinesi |
| `vitest.config.ts` | vitest ayarı |

---

### Task 1: Proje iskeleti, bağımlılıklar, vitest

**Files:**
- Create: Next.js iskeleti (`create-next-app`), `vitest.config.ts`
- Modify: `package.json` (script ve bağımlılıklar)

**Interfaces:**
- Produces: `pnpm lint`, `pnpm build`, `pnpm test` komutları çalışır; `@/*` alias'ı `src/*`'a işaret eder.

- [ ] **Step 1: Araç sürümlerini kaydet**

Run: `node -v; pnpm -v`
Expected: Node ve pnpm sürümleri yazdırılır (pnpm sürümünü not et; v11 ise Step 3'e bak).

- [ ] **Step 2: Next.js iskeletini kur**

`myLo/` içinde `.git/` ve `docs/` var; `create-next-app` bunları çakışma saymaz. Proje kökünde çalıştır:

Run: `pnpm create next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --yes`
Expected: iskelet kurulur, `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/globals.css`, `package.json`, `pnpm-lock.yaml` oluşur. Bir bayrak reddedilirse `pnpm create next-app@latest --help` çıktısına göre aynı seçenekleri (TypeScript, Tailwind, ESLint, App Router, `src/` dizini, `@/*` alias, pnpm) etkinleştir.

- [ ] **Step 3: pnpm 11 build-script onayı gerekirse**

Eğer kurulum `ERR_PNPM_IGNORED_BUILDS` ile biterse (pnpm 11: build script'leri onaysız çalışmaz), kökteki `pnpm-workspace.yaml` dosyasına (pnpm'in ürettiği taslakta placeholder'ı `true` yapmak yeterli; yoksa oluştur) şunu yaz ve `pnpm install`'ı yeniden çalıştır. Paket adlarını hata çıktısındakilerle eşle:

```yaml
allowBuilds:
  sharp: true
  unrs-resolver: true
```

Not: pnpm 11'de `package.json` içindeki `"pnpm"` alanı OKUNMAZ; ayar `pnpm-workspace.yaml`'dadır.

- [ ] **Step 4: Çalışma zamanı ve test bağımlılıklarını ekle**

Run: `pnpm add canvas-confetti`
Run: `pnpm add -D vitest @types/canvas-confetti`
Expected: üçü de `package.json`'a eklenir.

- [ ] **Step 5: vitest ayarı ve test script'i**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

`package.json` içindeki `"scripts"` bölümüne ekle (mevcutları koru):

```json
"test": "vitest run --passWithNoTests"
```

- [ ] **Step 6: Next 16 viewport/metadata API'sini doğrula**

Run: `Grep` ile `node_modules/next/dist/docs/` altında `viewportFit` ara.
Expected: `Viewport` tipinde `viewportFit` desteklendiği doğrulanır. Bulunamazsa ilgili dokümanı (`generate-viewport`) oku ve Task 4'teki `viewport` nesnesini ona göre uyarla.

- [ ] **Step 7: Taban doğrulama**

Run: `pnpm lint; pnpm build; pnpm test`
Expected: üçü de başarılı (test: "No test files found" ama `--passWithNoTests` ile exit 0).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js app with vitest and canvas-confetti" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 2: `dodge.ts` — kaçan butonun konum seçimi (TDD)

**Files:**
- Create: `src/lib/rng.ts`, `src/lib/dodge.ts`
- Test: `src/lib/dodge.test.ts`

**Interfaces:**
- Produces:
  - `mulberry32(seed: number): () => number` (`src/lib/rng.ts`)
  - `interface Point { x: number; y: number }`, `interface Size { width: number; height: number }`, `interface Rect extends Point, Size {}`
  - `interface DodgeInput { bounds: Rect; button: Size; current: Point; forbidden: readonly Rect[]; minDistance: number; rng?: () => number }`
  - `rectsOverlap(a: Rect, b: Rect): boolean`
  - `pickDodgePosition(input: DodgeInput): Point` — dönen nokta butonun sol-üst köşesidir (viewport koordinatı); `bounds` içinde kalır.

- [ ] **Step 1: `rng.ts` yaz**

Create `src/lib/rng.ts`:

```ts
/** Seed'li, deterministik [0, 1) üreteci (mulberry32). */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
```

- [ ] **Step 2: Başarısız testi yaz**

Create `src/lib/dodge.test.ts`:

```ts
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
```

- [ ] **Step 3: Testin başarısız olduğunu doğrula**

Run: `pnpm test`
Expected: FAIL — `./dodge` bulunamıyor (`Failed to resolve import "./dodge"`).

- [ ] **Step 4: Minimal gerçekleştirmeyi yaz**

Create `src/lib/dodge.ts`:

```ts
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
```

- [ ] **Step 5: Testin geçtiğini doğrula**

Run: `pnpm test`
Expected: PASS — 7 test geçer.

- [ ] **Step 6: Lint ve commit**

Run: `pnpm lint`
Expected: hata yok.

```bash
git add src/lib/rng.ts src/lib/dodge.ts src/lib/dodge.test.ts
git commit -m "feat: add dodge position picker" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 3: `roseRain.ts` — yağan gül spec'leri ve zamanlama sözleşmesi (TDD)

**Files:**
- Create: `src/lib/roseRain.ts`
- Test: `src/lib/roseRain.test.ts`

**Interfaces:**
- Consumes: `mulberry32` (`./rng`).
- Produces:
  - `type FallingPalette = "pink" | "peach" | "white"`
  - `interface RoseSpec { id: number; left: number /* % */; size: number /* rem */; duration: number /* s */; delay: number /* s */; spin: number /* deg */; swayAmp: number /* rem */; swayDur: number /* s */; palette: FallingPalette }`
  - sabitler: `ROSE_COUNT = 30`, `ROSE_SEED`, `MAX_FALL_DELAY_S = 2`, `MIN_FALL_DURATION_S = 2.4`, `MAX_FALL_DURATION_S = 3.4`, `HERO_DELAY_S = 2.6`, `HERO_DURATION_S = 3`, `FALLING_PALETTES`
  - `buildRoses(count: number, seed: number): RoseSpec[]`

- [ ] **Step 1: Başarısız testi yaz**

Create `src/lib/roseRain.test.ts`:

```ts
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
```

- [ ] **Step 2: Testin başarısız olduğunu doğrula**

Run: `pnpm test`
Expected: FAIL — `./roseRain` bulunamıyor.

- [ ] **Step 3: Gerçekleştirmeyi yaz**

Create `src/lib/roseRain.ts`:

```ts
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
```

- [ ] **Step 4: Testin geçtiğini doğrula**

Run: `pnpm test`
Expected: PASS — `dodge` (7) ve `roseRain` (8) testleri geçer.

- [ ] **Step 5: Lint ve commit**

Run: `pnpm lint`
Expected: hata yok.

```bash
git add src/lib/roseRain.ts src/lib/roseRain.test.ts
git commit -m "feat: add deterministic rose rain spec builder" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Sahne, global CSS, layout ve içerik dosyası

**Files:**
- Create: `src/lib/content.ts`, `src/components/Scene.tsx`
- Modify: `src/app/globals.css` (tamamen değiştir), `src/app/layout.tsx` (tamamen değiştir), `src/app/page.tsx` (tamamen değiştir)

**Interfaces:**
- Consumes: yok.
- Produces:
  - `content: { pageTitle; pageDescription; question; yesLabel; noLabel; result }` (`as const`)
  - `Scene()` bileşeni (propsuz)
  - CSS sınıfları (`globals.css`, `@layer components`): `.cloud-rise-slow`, `.cloud-rise-fast`, `.scene-zoom`, `.rose-fall` (değişkenler `--rose-dur`, `--rose-delay`, `--rose-spin`), `.rose-sway` (`--rose-sway`, `--rose-sway-dur`), `.hero-land` (`--hero-dur`, `--hero-delay`), `.fade-up`.

- [ ] **Step 1: `content.ts` yaz**

Create `src/lib/content.ts`:

```ts
/** Sayfadaki tüm yazılar burada. Kendi metinlerinle değiştir. */
export const content = {
  pageTitle: "Sayfa başlığı",
  pageDescription: "Sayfa açıklaması",
  question: "Soru metni buraya",
  yesLabel: "Yeşil buton",
  noLabel: "Kırmızı buton",
  result: "Sonuç metni buraya",
} as const;
```

- [ ] **Step 2: `globals.css`'i yaz**

Replace the entire contents of `src/app/globals.css` with:

```css
@import "tailwindcss";

@layer base {
  html,
  body {
    height: 100%;
  }

  body {
    background: #1d1b4b;
    overscroll-behavior: none;
  }
}

@layer components {
  .cloud-rise-slow {
    animation: cloud-rise 80s linear infinite;
  }

  .cloud-rise-fast {
    animation: cloud-rise 42s linear infinite;
  }

  .scene-zoom {
    transform-origin: 50% 62%;
    animation: scene-zoom 7s ease-out both;
  }

  .rose-fall {
    animation: rose-fall var(--rose-dur) linear var(--rose-delay) both;
  }

  .rose-sway {
    animation: rose-sway var(--rose-sway-dur) ease-in-out infinite alternate;
  }

  .hero-land {
    animation: hero-land var(--hero-dur) cubic-bezier(0.2, 0.7, 0.2, 1) var(--hero-delay) both;
  }

  .fade-up {
    animation: fade-up 900ms ease-out both;
  }

  @media (prefers-reduced-motion: reduce) {
    .cloud-rise-slow,
    .cloud-rise-fast,
    .scene-zoom,
    .rose-fall,
    .rose-sway,
    .hero-land,
    .fade-up {
      animation: none;
    }
  }
}

@keyframes cloud-rise {
  from {
    translate: 0 0;
  }
  to {
    translate: 0 -50%;
  }
}

@keyframes scene-zoom {
  from {
    scale: 1;
  }
  to {
    scale: 1.1;
  }
}

@keyframes rose-fall {
  from {
    translate: 0 -35dvh;
    rotate: 0deg;
  }
  to {
    translate: 0 135dvh;
    rotate: var(--rose-spin);
  }
}

@keyframes rose-sway {
  from {
    translate: calc(var(--rose-sway) * -1) 0;
  }
  to {
    translate: var(--rose-sway) 0;
  }
}

@keyframes hero-land {
  0% {
    translate: 0 -120dvh;
    rotate: -30deg;
  }
  75% {
    translate: 0 1.5dvh;
    rotate: 5deg;
  }
  90% {
    translate: 0 -0.8dvh;
    rotate: -2deg;
  }
  100% {
    translate: 0 0;
    rotate: 0deg;
  }
}

@keyframes fade-up {
  from {
    opacity: 0;
    translate: 0 1.5rem;
  }
  to {
    opacity: 1;
    translate: 0 0;
  }
}
```

- [ ] **Step 3: `layout.tsx`'i yaz**

Replace the entire contents of `src/app/layout.tsx` with:

```tsx
import type { Metadata, Viewport } from "next";
import { content } from "@/lib/content";
import "./globals.css";

export const metadata: Metadata = {
  title: content.pageTitle,
  description: content.pageDescription,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1d1b4b",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body className="font-serif antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 4: `Scene.tsx`'i yaz**

Create `src/components/Scene.tsx`:

```tsx
/** Her şerit kendi içinde kapalı: bulutlar y=100..900 arasında, dikiş yerinde kesilmez. */
function CloudTile() {
  return (
    <svg
      viewBox="0 0 1000 1000"
      preserveAspectRatio="xMidYMid slice"
      className="h-1/2 w-full"
      aria-hidden="true"
      focusable="false"
    >
      <g fill="#ffb6a3" opacity="0.38">
        <ellipse cx="170" cy="200" rx="170" ry="34" />
        <ellipse cx="300" cy="228" rx="120" ry="26" />
        <ellipse cx="760" cy="330" rx="190" ry="38" />
        <ellipse cx="880" cy="356" rx="110" ry="24" />
      </g>
      <g fill="#ff8fa3" opacity="0.3">
        <ellipse cx="520" cy="560" rx="210" ry="40" />
        <ellipse cx="640" cy="588" rx="130" ry="26" />
        <ellipse cx="120" cy="700" rx="150" ry="32" />
      </g>
      <g fill="#ffd9a8" opacity="0.28">
        <ellipse cx="820" cy="780" rx="180" ry="34" />
        <ellipse cx="380" cy="860" rx="200" ry="30" />
      </g>
    </svg>
  );
}

export function Scene() {
  return (
    <div
      className="absolute inset-0 overflow-hidden bg-[linear-gradient(to_bottom,#1d1b4b_0%,#5a2a6b_30%,#c4476b_52%,#ff8f5a_62%)]"
      aria-hidden="true"
    >
      <div className="absolute inset-0 overflow-hidden opacity-60">
        <div className="cloud-rise-slow absolute inset-x-0 top-0 h-[200%]">
          <CloudTile />
          <CloudTile />
        </div>
      </div>
      <div className="absolute inset-0 overflow-hidden">
        <div className="cloud-rise-fast absolute inset-x-0 top-0 h-[200%]">
          <CloudTile />
          <CloudTile />
        </div>
      </div>
      <div className="scene-zoom absolute inset-0">
        <div className="absolute top-[62%] left-1/2 size-[64vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,214,140,0.7),rgba(255,214,140,0)_70%)]" />
        <div className="absolute top-[62%] left-1/2 size-[22vmin] -translate-x-1/2 -translate-y-[65%] rounded-full bg-[radial-gradient(circle,#fff3c4,#ffc766_70%,#ff9b52)]" />
        <div className="absolute inset-x-0 top-[62%] bottom-0 bg-[linear-gradient(to_bottom,#e0735a,#7a3a6e_45%,#2b2352)]" />
        <div className="absolute top-[62%] left-1/2 h-[22%] w-[12vmin] -translate-x-1/2 bg-linear-to-b from-[#ffd08a]/80 to-transparent blur-md" />
        <div className="absolute -inset-x-[25%] -bottom-[14%] h-[30%] rounded-[50%] bg-[linear-gradient(to_bottom,#f1b97c,#c98150)]" />
      </div>
    </div>
  );
}
```

- [ ] **Step 5: `page.tsx`'i (şimdilik yalnızca sahne) yaz**

Replace the entire contents of `src/app/page.tsx` with:

```tsx
import { Scene } from "@/components/Scene";

export default function Home() {
  return (
    <main className="relative h-dvh w-full overflow-hidden">
      <Scene />
    </main>
  );
}
```

- [ ] **Step 6: Derleme ve lint**

Run: `pnpm lint; pnpm build`
Expected: ikisi de başarılı. (Tailwind arbitrary değerlerinde hata çıkarsa terminal çıktısındaki sınıfı düzelt.)

- [ ] **Step 7: Görsel doğrulama**

Run (arka planda): `pnpm dev`
Playwright MCP ile (`browser_navigate` → `http://localhost:3000`, `browser_resize`, `browser_take_screenshot`) dört boyutta (390×844, 844×390, 768×1024, 1440×900) ekran görüntüsü al.
Expected: her boyutta üstte koyu mordan turuncuya inen gün batımı gökyüzü, ufukta güneş, altında deniz ve kıyı; yatay kaydırma çubuğu yok; sahne boşluk bırakmadan tüm ekranı kaplıyor. Playwright tarayıcısı kurulu değilse (lessons-learned: "Chromium distribution 'chrome' is not found") `claude-in-chrome` araçlarıyla aynı kontrolü yap, o da olmazsa `curl -s http://localhost:3000` ile HTML'in 200 döndüğünü doğrula ve görsel kontrolü kullanıcıya bırak, bunu açıkça raporla.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add sunset beach scene, global animations and content file" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Güller — yağmur, kırmızı gül ve faz makinesi

**Files:**
- Create: `src/lib/cssVars.ts`, `src/lib/useIsClient.ts`, `src/lib/useReducedMotion.ts`, `src/components/Rose.tsx`, `src/components/RoseRain.tsx`, `src/components/HeroRose.tsx`
- Modify: `src/app/page.tsx` (tamamen değiştir)

**Interfaces:**
- Consumes: `buildRoses`, `ROSE_COUNT`, `ROSE_SEED`, `HERO_DELAY_S`, `HERO_DURATION_S`, `FallingPalette` (`@/lib/roseRain`); CSS sınıfları (Task 4); `Scene`.
- Produces:
  - `setCssVars(el: HTMLElement | null, vars: Readonly<Record<string, string>>): void`
  - `useIsClient(): boolean`, `useReducedMotion(): boolean`
  - `type PaletteName = "red" | "pink" | "peach" | "white"`; `Rose({ palette, withStem?, className? })`
  - `RoseRain()` (propsuz), `HeroRose({ onLanded: () => void })`
  - `page.tsx` faz makinesi: `type Phase = "raining" | "ready" | "accepted"`

- [ ] **Step 1: Yardımcıları yaz**

Create `src/lib/cssVars.ts`:

```ts
/** Inline `style` yazmadan elemana CSS custom property atar. */
export function setCssVars(el: HTMLElement | null, vars: Readonly<Record<string, string>>): void {
  if (!el) return;
  for (const [name, value] of Object.entries(vars)) {
    el.style.setProperty(name, value);
  }
}
```

Create `src/lib/useIsClient.ts`:

```ts
import { useSyncExternalStore } from "react";

const subscribe = (): (() => void) => () => {};

/** Sunucuda ve hydration'da `false`, sonrasında `true`. Effect/setState gerektirmez. */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
```

Create `src/lib/useReducedMotion.ts`:

```ts
import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void): () => void {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
```

- [ ] **Step 2: `Rose.tsx`'i yaz**

Create `src/components/Rose.tsx`:

```tsx
export type PaletteName = "red" | "pink" | "peach" | "white";

interface Palette {
  light: string;
  base: string;
  dark: string;
}

const PALETTES: Record<PaletteName, Palette> = {
  red: { light: "#e0364f", base: "#b3122f", dark: "#7a0a1f" },
  pink: { light: "#ffc2d4", base: "#ff8fb0", dark: "#d94f7d" },
  peach: { light: "#ffd9bf", base: "#ffb28a", dark: "#e3774a" },
  white: { light: "#ffffff", base: "#fbe9ee", dark: "#e3b9c6" },
};

const OUTER_ANGLES = [0, 72, 144, 216, 288] as const;
const MID_ANGLES = [36, 108, 180, 252, 324] as const;

interface RoseProps {
  palette: PaletteName;
  withStem?: boolean;
  className?: string;
}

export function Rose({ palette, withStem = false, className }: RoseProps) {
  const colors = PALETTES[palette];
  return (
    <svg
      viewBox={withStem ? "0 0 100 170" : "0 0 100 100"}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {withStem && (
        <g>
          <path
            d="M50 92 C 48 120, 52 145, 50 170"
            stroke="#2f7d3a"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          <path d="M50 128 C 66 118, 80 122, 86 112 C 80 134, 62 138, 50 128 Z" fill="#3a9a48" />
          <path d="M50 146 C 34 138, 20 142, 14 132 C 20 154, 38 158, 50 146 Z" fill="#2f7d3a" />
        </g>
      )}
      {OUTER_ANGLES.map((angle) => (
        <ellipse
          key={`outer-${angle}`}
          cx="50"
          cy="27"
          rx="19"
          ry="23"
          transform={`rotate(${angle} 50 50)`}
          fill={colors.light}
        />
      ))}
      {MID_ANGLES.map((angle) => (
        <ellipse
          key={`mid-${angle}`}
          cx="50"
          cy="33"
          rx="15"
          ry="18"
          transform={`rotate(${angle} 50 50)`}
          fill={colors.base}
        />
      ))}
      {OUTER_ANGLES.map((angle) => (
        <ellipse
          key={`inner-${angle}`}
          cx="50"
          cy="40"
          rx="10"
          ry="12"
          transform={`rotate(${angle} 50 50)`}
          fill={colors.dark}
          opacity="0.85"
        />
      ))}
      <circle cx="50" cy="50" r="7" fill={colors.dark} />
      <path
        d="M50 50 m-4 0 a4 4 0 1 1 4 4 a7 7 0 0 1 -7 -7"
        fill="none"
        stroke={colors.light}
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}
```

- [ ] **Step 3: `RoseRain.tsx` ve `HeroRose.tsx`'i yaz**

Create `src/components/RoseRain.tsx`:

```tsx
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
```

Create `src/components/HeroRose.tsx`:

```tsx
import { setCssVars } from "@/lib/cssVars";
import { HERO_DELAY_S, HERO_DURATION_S } from "@/lib/roseRain";
import { Rose } from "./Rose";

const HERO_VARS = {
  "--hero-dur": `${HERO_DURATION_S}s`,
  "--hero-delay": `${HERO_DELAY_S}s`,
} as const;

const applyHeroVars = (el: HTMLDivElement | null): void => setCssVars(el, HERO_VARS);

interface HeroRoseProps {
  /** İniş animasyonu bittiğinde çağrılır. */
  onLanded: () => void;
}

export function HeroRose({ onLanded }: HeroRoseProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[3dvh] z-10 flex justify-center">
      <div
        ref={applyHeroVars}
        className="hero-land h-[38dvh]"
        onAnimationEnd={(event) => {
          if (event.target === event.currentTarget) onLanded();
        }}
      >
        <Rose palette="red" withStem className="h-full w-auto drop-shadow-2xl" />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: `page.tsx`'i faz makinesiyle yaz**

Replace the entire contents of `src/app/page.tsx` with:

```tsx
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
```

- [ ] **Step 5: Lint ve derleme**

Run: `pnpm lint; pnpm build; pnpm test`
Expected: üçü de başarılı. Lint `react-hooks/*` kurallarından şikayet ederse (ör. `refs`, `purity`) bulguyu kuralın önerdiği şekilde değil, "render bu değere gerçekten ihtiyaç duyuyor mu?" diye sorarak düzelt (lessons-learned 2026-07-28).

- [ ] **Step 6: Görsel doğrulama (animasyon aşamaları)**

`pnpm dev` açıkken Playwright MCP ile 390×844'te: sayfayı yükle, `browser_wait_for` ile ~1,5 sn bekleyip ekran görüntüsü al (güller yağıyor olmalı), ~3,5 sn'de bir tane daha (kırmızı gül yukarıdan iniyor), ~7 sn'de bir tane daha.
Expected: (a) ~1,5 sn: ekranda birden çok pembe/şeftali/beyaz gül düşüyor; (b) ~3,5 sn: kırmızı gül üstten iniyor; (c) ~7 sn: ekranda yalnızca kırmızı gül alt-ortada duruyor, başka gül yok. 390 px genişlikte `document.querySelectorAll(".rose-fall")` içinden `display: none` olmayanların sayısı 15 olmalı (yarısı gizli), 1440 px'te 30.

Run (`browser_evaluate`): `() => [...document.querySelectorAll(".rose-fall")].filter((el) => getComputedStyle(el).display !== "none").length`
Expected: 390 px'te `15`, 1440 px'te `30` (yağmur bitmeden, sayfa yüklendikten hemen sonra ölç; ~6 sn sonra elemanlar kaldırılmış olur ve sonuç `0` döner).

- [ ] **Step 7: Hareket azaltma doğrulaması (Review Focus #5)**

Playwright MCP `browser_emulate_media` ile `reducedMotion: "reduce"` ayarla, sayfayı yeniden yükle, ekran görüntüsü al.
Run (`browser_evaluate`): `() => ({ rain: document.querySelectorAll(".rose-fall").length, hero: document.querySelectorAll(".hero-land").length })`
Expected: `{ rain: 0, hero: 1 }`; kırmızı gül hemen alt-ortada duruyor.

- [ ] **Step 8: Hydration uyarısı kontrolü**

Run: `browser_console_messages` (tür: error/warning).
Expected: "Hydration failed" / "did not match" uyarısı yok.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add rose rain, hero rose and phase machine" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Butonlar — konfeti, kaçan buton, yazı değişimi

**Files:**
- Create: `src/lib/confetti.ts`, `src/lib/viewport.ts`, `src/lib/useDodge.ts`, `src/components/ChoiceButtons.tsx`
- Test: `src/lib/confetti.test.ts`
- Modify: `src/app/page.tsx` (tamamen değiştir)

**Interfaces:**
- Consumes: `pickDodgePosition`, `Point`, `Rect` (`@/lib/dodge`); `setCssVars`; `content`; `HeroRose`, `RoseRain`, `Scene`; `useIsClient`, `useReducedMotion`.
- Produces:
  - `fireConfetti(): Promise<void>` — hata fırlatmaz.
  - `readSafeInsets(): Insets` (`{ top; right; bottom; left }`, px)
  - `useDodge(getForbidden: () => ReadonlyArray<HTMLElement | null>): { slotRef; buttonRef; dodge: (from?: Point) => void }`
  - `ChoiceButtons({ accepted: boolean; onAccept: () => void })`

- [ ] **Step 1: Başarısız konfeti testini yaz**

Create `src/lib/confetti.test.ts`:

```ts
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
```

- [ ] **Step 2: Testin başarısız olduğunu doğrula**

Run: `pnpm test`
Expected: FAIL — `./confetti` bulunamıyor.

- [ ] **Step 3: `confetti.ts`'i yaz**

Create `src/lib/confetti.ts`:

```ts
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
```

- [ ] **Step 4: Testin geçtiğini doğrula**

Run: `pnpm test`
Expected: PASS — `confetti` (2), `dodge` (7), `roseRain` (8) testleri geçer. Fabrika-fırlatan `vi.doMock` biçimi import'ta farklı davranıp ikinci test başarısız olursa, fabrikayı `() => ({ get default(): never { throw new Error("chunk load failed"); } })` ile değiştir.

- [ ] **Step 5: `viewport.ts`'i yaz**

Create `src/lib/viewport.ts`:

```ts
export interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** `env(safe-area-inset-*)` değerlerini px olarak okur (çentik, ev çubuğu). */
export function readSafeInsets(): Insets {
  const probe = document.createElement("div");
  probe.className =
    "pointer-events-none invisible fixed top-0 left-0 pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)]";
  document.body.appendChild(probe);
  const computed = getComputedStyle(probe);
  const insets: Insets = {
    top: parseFloat(computed.paddingTop) || 0,
    right: parseFloat(computed.paddingRight) || 0,
    bottom: parseFloat(computed.paddingBottom) || 0,
    left: parseFloat(computed.paddingLeft) || 0,
  };
  probe.remove();
  return insets;
}
```

- [ ] **Step 6: `useDodge.ts`'i yaz**

Create `src/lib/useDodge.ts`:

```ts
import { useCallback, useEffect, useRef, type RefObject } from "react";
import { setCssVars } from "./cssVars";
import { pickDodgePosition, type Point, type Rect } from "./dodge";
import { readSafeInsets } from "./viewport";

const MARGIN_PX = 16;
const APPROACH_PX = 90;
const COOLDOWN_MS = 250;
const MAX_MIN_DISTANCE_PX = 150;

interface UseDodge {
  /** Butonun doğal yerini tutan, dönüşüm almayan sarmalayıcı. */
  slotRef: RefObject<HTMLSpanElement | null>;
  buttonRef: RefObject<HTMLButtonElement | null>;
  /** Butonu yeni bir konuma kaçırır. `from` verilirse o noktanın çevresi de yasak bölge sayılır. */
  dodge: (from?: Point) => void;
}

export function useDodge(getForbidden: () => ReadonlyArray<HTMLElement | null>): UseDodge {
  const slotRef = useRef<HTMLSpanElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const lastDodgeAt = useRef(0);

  const dodge = useCallback(
    (from?: Point) => {
      const slot = slotRef.current;
      const button = buttonRef.current;
      if (!slot || !button) return;

      const slotRect = slot.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      const insets = readSafeInsets();
      const bounds: Rect = {
        x: insets.left + MARGIN_PX,
        y: insets.top + MARGIN_PX,
        width: window.innerWidth - insets.left - insets.right - MARGIN_PX * 2,
        height: window.innerHeight - insets.top - insets.bottom - MARGIN_PX * 2,
      };

      const forbidden: Rect[] = getForbidden().flatMap((el) => (el ? [el.getBoundingClientRect()] : []));
      if (from) {
        forbidden.push({
          x: from.x - APPROACH_PX,
          y: from.y - APPROACH_PX,
          width: APPROACH_PX * 2,
          height: APPROACH_PX * 2,
        });
      }

      const next = pickDodgePosition({
        bounds,
        button: { width: buttonRect.width, height: buttonRect.height },
        current: { x: buttonRect.left, y: buttonRect.top },
        forbidden,
        minDistance: Math.min(MAX_MIN_DISTANCE_PX, Math.min(bounds.width, bounds.height) * 0.35),
      });

      setCssVars(button, {
        "--dx": `${next.x - slotRect.left}px`,
        "--dy": `${next.y - slotRect.top}px`,
      });
      lastDodgeAt.current = performance.now();
    },
    [getForbidden],
  );

  useEffect(() => {
    const onPointerMove = (event: PointerEvent): void => {
      if (event.pointerType !== "mouse") return;
      const button = buttonRef.current;
      if (!button || performance.now() - lastDodgeAt.current < COOLDOWN_MS) return;
      const rect = button.getBoundingClientRect();
      const isNear =
        event.clientX > rect.left - APPROACH_PX &&
        event.clientX < rect.right + APPROACH_PX &&
        event.clientY > rect.top - APPROACH_PX &&
        event.clientY < rect.bottom + APPROACH_PX;
      if (isNear) dodge({ x: event.clientX, y: event.clientY });
    };

    // Yeniden boyutlanma/yön değişiminde buton doğal yerine döner; orası her zaman ekrandadır.
    const onViewportChange = (): void => {
      setCssVars(buttonRef.current, { "--dx": "0px", "--dy": "0px" });
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("resize", onViewportChange);
    window.addEventListener("orientationchange", onViewportChange);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onViewportChange);
      window.removeEventListener("orientationchange", onViewportChange);
    };
  }, [dodge]);

  return { slotRef, buttonRef, dodge };
}
```

- [ ] **Step 7: `ChoiceButtons.tsx`'i yaz**

Create `src/components/ChoiceButtons.tsx`:

```tsx
"use client";

import { useCallback, useRef } from "react";
import { fireConfetti } from "@/lib/confetti";
import { content } from "@/lib/content";
import { useDodge } from "@/lib/useDodge";

interface ChoiceButtonsProps {
  accepted: boolean;
  onAccept: () => void;
}

export function ChoiceButtons({ accepted, onAccept }: ChoiceButtonsProps) {
  const questionRef = useRef<HTMLHeadingElement | null>(null);
  const yesRef = useRef<HTMLButtonElement | null>(null);
  const getForbidden = useCallback(() => [questionRef.current, yesRef.current], []);
  const { slotRef, buttonRef, dodge } = useDodge(getForbidden);

  const handleAccept = (): void => {
    onAccept();
    void fireConfetti();
  };

  return (
    <div className="fade-up absolute inset-0 z-20 flex flex-col items-center gap-6 px-6 pt-[max(3rem,16dvh,calc(env(safe-area-inset-top)_+_1rem))] pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center">
      <h1
        ref={questionRef}
        aria-live="polite"
        className="max-w-[20ch] font-serif text-[clamp(1.75rem,7vw,3.5rem)] leading-tight font-semibold text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.45)]"
      >
        <span key={accepted ? "result" : "question"} className="fade-up inline-block">
          {accepted ? content.result : content.question}
        </span>
      </h1>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          ref={yesRef}
          type="button"
          onClick={handleAccept}
          className="min-h-11 min-w-11 touch-manipulation rounded-full bg-emerald-500 px-8 py-3 text-lg font-semibold text-white shadow-lg shadow-emerald-950/40 transition-colors hover:bg-emerald-400 active:scale-95"
        >
          {content.yesLabel}
        </button>
        {!accepted && (
          <span ref={slotRef} className="inline-block">
            <button
              ref={buttonRef}
              type="button"
              onPointerDown={(event) => {
                event.preventDefault();
                dodge({ x: event.clientX, y: event.clientY });
              }}
              onFocus={() => dodge()}
              className="min-h-11 min-w-11 touch-manipulation rounded-full bg-red-600 px-8 py-3 text-lg font-semibold text-white shadow-lg shadow-red-950/40 [translate:var(--dx,0px)_var(--dy,0px)] transition-[translate] duration-300 ease-out motion-reduce:transition-none"
            >
              {content.noLabel}
            </button>
          </span>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 8: `page.tsx`'e butonları bağla**

Replace the entire contents of `src/app/page.tsx` with:

```tsx
"use client";

import { useState } from "react";
import { ChoiceButtons } from "@/components/ChoiceButtons";
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
      {isClient && current !== "raining" && (
        <ChoiceButtons accepted={current === "accepted"} onAccept={() => setPhase("accepted")} />
      )}
    </main>
  );
}
```

- [ ] **Step 9: Lint, test, derleme**

Run: `pnpm lint; pnpm test; pnpm build`
Expected: üçü de başarılı.

- [ ] **Step 10: Etkileşim doğrulaması — fare, dokunma, yeşil buton**

`pnpm dev` açıkken Playwright MCP ile 1440×900'de sayfayı aç, ~7 sn bekle (`ready`). Aşağıdaki yardımcıyı `browser_evaluate` ile kullan (kırmızı butonun konumu):

```js
() => {
  const button = [...document.querySelectorAll("button")].find((el) => el.textContent?.trim() === "Kırmızı buton");
  if (!button) return null;
  const r = button.getBoundingClientRect();
  return { left: r.left, top: r.top, inside: r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight };
}
```

1. Konumu kaydet. `browser_hover` ile kırmızı butonun üstüne gel, ~400 ms bekle, konumu tekrar ölç. Expected: `left`/`top` değişmiş, `inside: true`.
2. 390×844'e `browser_resize` et, sayfayı yenile, ~7 sn bekle. Dokunma simülasyonu (`browser_evaluate`):
   ```js
   () => {
     const button = [...document.querySelectorAll("button")].find((el) => el.textContent?.trim() === "Kırmızı buton");
     const r = button.getBoundingClientRect();
     button.dispatchEvent(new PointerEvent("pointerdown", { pointerType: "touch", bubbles: true, cancelable: true, clientX: r.left + 5, clientY: r.top + 5 }));
   }
   ```
   ~400 ms sonra konumu ölç. Expected: buton başka yere geçmiş, `inside: true`, yazı ve yeşil butonla çakışmıyor (ekran görüntüsüyle de doğrula).
3. Yeşil butona tıkla (`browser_click`). Expected: ekrandaki yazı "Sonuç metni buraya" olur, kırmızı buton kaybolur, `document.querySelector("canvas")` bir konfeti tuvali döndürür (`browser_evaluate`: `() => !!document.querySelector("canvas")` → `true`), ekran görüntüsünde konfeti görünür.

- [ ] **Step 11: Review Focus #1 — art arda hızlı dokunma**

390×844'te, sayfa `ready` iken `browser_evaluate` (async):

```js
async () => {
  const button = [...document.querySelectorAll("button")].find((el) => el.textContent?.trim() === "Kırmızı buton");
  for (let i = 0; i < 25; i += 1) {
    const r = button.getBoundingClientRect();
    button.dispatchEvent(new PointerEvent("pointerdown", { pointerType: "touch", bubbles: true, cancelable: true, clientX: r.left + 5, clientY: r.top + 5 }));
    await new Promise((resolve) => setTimeout(resolve, 40));
  }
  await new Promise((resolve) => setTimeout(resolve, 500));
  const r = button.getBoundingClientRect();
  return { inside: r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight, rect: [r.left, r.top, r.right, r.bottom] };
}
```
Expected: `inside: true`.

- [ ] **Step 12: Review Focus #2 — buton yerinden oynamışken yön değişimi**

390×844'te kırmızı butonu bir kez kaçır (Step 10.2'deki gibi), sonra `browser_resize` ile 844×390 yap, ~500 ms bekle, Step 10'daki konum yardımcısını çalıştır.
Expected: `inside: true`; buton doğal yerine dönmüş.

- [ ] **Step 13: Klavye doğrulaması**

390×844'te sayfayı yenile, ~7 sn bekle. `browser_press_key` ile `Tab` (yeşil butona odak), `Enter`.
Expected: Enter yeşil butonu çalıştırır (yazı değişir). Sayfayı yenile, `Tab`, `Tab` (kırmızıya odak): buton kaçar, `inside: true`.

- [ ] **Step 14: Commit**

```bash
git add -A
git commit -m "feat: add choice buttons with confetti and dodging button" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Son doğrulama (tüm boyutlar, hareket azaltma, üretim derlemesi)

**Files:**
- Yok (yalnızca doğrulama; bulgu çıkarsa ilgili dosyayı düzelt ve ayrı commit at).

**Interfaces:**
- Consumes: tüm önceki görevler.
- Produces: kanıtlanmış, çalışan site.

- [ ] **Step 1: Tam kalite kapısı**

Run: `pnpm lint; pnpm test; pnpm build`
Expected: lint temiz, 17 test geçer (dodge 7 + roseRain 8 + confetti 2), build başarılı.

- [ ] **Step 2: Üretim derlemesini çalıştır**

Dev sunucusunu durdur. Run (arka planda): `pnpm start`
Expected: `http://localhost:3000` 200 döner (`curl -s -o NUL -w "%{http_code}" http://localhost:3000`).

- [ ] **Step 3: Boyut matrisi (Review Focus #3)**

Playwright MCP ile şu boyutların her biri için: `browser_resize` → sayfayı yükle → ~7 sn bekle → ekran görüntüsü → ölçüm:
`390×844`, `844×390`, `768×1024`, `1440×900`, ve ek olarak `320×568`.

Her boyutta `browser_evaluate`:

```js
() => {
  const rect = (el) => (el ? el.getBoundingClientRect() : null);
  const question = rect(document.querySelector("h1"));
  const buttons = [...document.querySelectorAll("button")].map((el) => rect(el));
  const hero = rect(document.querySelector(".hero-land"));
  return {
    hScroll: document.documentElement.scrollWidth > innerWidth,
    vScroll: document.documentElement.scrollHeight > innerHeight,
    question: question && [question.left, question.top, question.right, question.bottom],
    buttonsInside: buttons.every((r) => r.left >= 0 && r.right <= innerWidth && r.bottom <= innerHeight),
    heroTop: hero && hero.top,
    lastButtonBottom: Math.max(...buttons.map((r) => r.bottom)),
  };
}
```
Expected (her boyutta): `hScroll: false`, `vScroll: false`, `buttonsInside: true`, `question.left >= 0` ve `question.right <= innerWidth`; ekran görüntüsünde yazı ve butonlar kırmızı gülle üst üste binmiyor ve kesilmiyor. 844×390 ve 320×568'de `lastButtonBottom` ile `heroTop` yakınsa (üst üste biniyorsa) `HeroRose.tsx`'teki `h-[38dvh]` değerini küçült (ör. `h-[30dvh]`) ve ölçümü tekrarla.

- [ ] **Step 4: Hareket azaltma (Review Focus #5)**

`browser_emulate_media` ile `reducedMotion: "reduce"`, 390×844'te sayfayı yükle, beklemeden ekran görüntüsü al.
Expected: yazı ve iki buton ilk saniyede görünür; `document.querySelectorAll(".rose-fall").length === 0`; yeşil butona basınca yazı değişir (konfeti çıkmaz, `disableForReducedMotion`); kırmızı buton yine de kaçar. Ardından `reducedMotion`'ı `no-preference`'a geri al.

- [ ] **Step 5: Konsol temizliği**

Run: `browser_console_messages` (hata/uyarı).
Expected: hydration uyarısı yok, çalışma zamanı hatası yok.

- [ ] **Step 6: Placeholder metinlerin doğrulanması**

Run (`browser_evaluate`, `ready` iken): `() => document.body.innerText`
Expected: "Soru metni buraya", "Yeşil buton", "Kırmızı buton" görünür; yeşile bastıktan sonra "Sonuç metni buraya".

- [ ] **Step 7: Bulgu varsa düzelt, yoksa kapat**

Bulgu çıktıysa ilgili dosyayı düzelt, `pnpm lint; pnpm test; pnpm build` ve ilgili ölçümü tekrarla, sonra:

```bash
git add -A
git commit -m "fix: address final verification findings" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

Bulgu yoksa commit gerekmez. `pnpm start` sürecini durdur.
