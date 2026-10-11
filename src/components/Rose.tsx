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
