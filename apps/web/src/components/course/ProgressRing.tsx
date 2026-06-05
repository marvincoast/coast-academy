interface ProgressRingProps {
  pct: number;       // 0-100
  size?: number;     // SVG width/height in px
  stroke?: number;   // stroke width in px
  className?: string;
}

/**
 * Circular progress ring used on module cards.
 * Uses SVG stroke-dashoffset animation.
 */
export function ProgressRing({
  pct,
  size = 48,
  stroke = 4,
  className,
}: ProgressRingProps) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  const color =
    pct === 100
      ? '#22c55e'   // green-500 — complete
      : pct > 0
        ? '#eab308' // yellow-500 — in progress
        : '#374151'; // gray-700 — not started

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      aria-hidden="true"
    >
      {/* Background track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#1f2937"
        strokeWidth={stroke}
      />
      {/* Progress arc */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
      {/* Percentage text */}
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize={size * 0.22}
        fill={pct === 100 ? '#22c55e' : '#d1d5db'}
        fontWeight="600"
      >
        {pct}%
      </text>
    </svg>
  );
}
