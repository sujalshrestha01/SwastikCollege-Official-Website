
/** Tail ribbon shapes used by FlyingKites to animate the tail. */
export const TAIL_SHAPES = [
  "M50 100 C42 112 60 118 48 130 S58 150 46 165",
  "M50 100 C58 112 40 120 52 132 S40 150 54 166",
  "M50 100 C46 114 56 122 46 134 S52 152 42 164",
];

export default function Kite({
  color,
  accent,
  size = 120,
  string = "none",
  stringColor = "#ffffff",
  className = "",
}) {
  const stringPath =
    string === "down-left"
      ? "M50 100 C42 155 15 205 -35 255 S-145 365 -205 455 S-295 590 -360 760"
      : "M50 100 C58 155 85 205 135 255 S245 365 305 455 S395 590 460 760";

  return (
    <svg
      className={className}
      width={size}
      height={size * 1.35}
      viewBox="0 0 100 135"
      overflow="visible"
      aria-hidden="true"
    >
      {string !== "none" && (
        <path
          data-kite-string
          d={stringPath}
          fill="none"
          stroke={stringColor}
          strokeWidth="0.8"
          strokeLinecap="round"
          opacity="0.95"
          vectorEffect="non-scaling-stroke"
        />
      )}

      {/* Tail ribbon */}
      <g data-kite-tail>
        <path
          data-kite-tail-path
          d={TAIL_SHAPES[0]}
          fill="none"
          stroke={accent}
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        <path
          d="M47 112 l-7 -4 l2 8 Z M53 138 l7 -4 l-2 8 Z"
          fill={accent}
        />
      </g>

      {/* Kite sail */}
      <g data-kite-body>
        <path
          d="M50 0 L95 50 L50 100 L5 50 Z"
          fill={color}
        />

        <path
          data-kite-shade
          d="M50 0 L95 50 L50 50 Z"
          fill="#000"
          opacity="0.12"
        />

        <path
          d="M50 50 L50 100 L5 50 Z"
          fill="#fff"
          opacity="0.1"
        />

        {/* Bamboo spars */}
        <path
          d="M50 0 L50 100 M5 50 L95 50"
          stroke="#3b2414"
          strokeWidth="1.3"
          opacity="0.7"
        />

        {/* Decorative rings */}
        <circle
          cx="30"
          cy="42"
          r="9"
          fill="none"
          stroke="#fff"
          strokeWidth="2.2"
          opacity="0.85"
        />

        <circle
          cx="30"
          cy="42"
          r="3.5"
          fill="#fff"
          opacity="0.85"
        />

        <circle
          cx="68"
          cy="60"
          r="6"
          fill="none"
          stroke={accent}
          strokeWidth="2"
        />
      </g>
    </svg>
  );
}
