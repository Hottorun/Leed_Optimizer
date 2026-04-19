type AcleaLogoProps = {
  /** Size of the two-square mark in px. Defaults to 18. */
  markSize?: number
  /** Font size for the wordmark in px. Defaults to 16. */
  fontSize?: number
  /** Gap between mark and wordmark in px. Defaults to 8. */
  gap?: number
  /** Accent color for the solid square. Defaults to #5c3fff. */
  accent?: string
  /** Foreground color (outlined square + text). Defaults to currentColor. */
  fg?: string
  className?: string
}

export function AcleaLogo({
  markSize = 18,
  fontSize = 16,
  gap = 8,
  accent = "#5c3fff",
  fg = "currentColor",
  className,
}: AcleaLogoProps) {
  const half = markSize / 2
  return (
    <div className={className} style={{ display: "flex", alignItems: "center", gap }}>
      {/* Two-square mark */}
      <svg
        width={markSize}
        height={markSize}
        viewBox={`0 0 ${markSize} ${markSize}`}
        fill="none"
        aria-hidden="true"
      >
        {/* Top-left: outlined square */}
        <rect
          x="1"
          y="1"
          width={half - 1}
          height={half - 1}
          fill="none"
          stroke={fg}
          strokeWidth="1.5"
        />
        {/* Bottom-right: solid accent square */}
        <rect
          x={half + 1}
          y={half + 1}
          width={half - 2}
          height={half - 2}
          fill={accent}
        />
      </svg>

      {/* Wordmark */}
      <span
        style={{
          fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
          fontWeight: 400,
          fontSize,
          letterSpacing: "-0.03em",
          lineHeight: 1,
          color: fg === "currentColor" ? undefined : fg,
        }}
      >
        aclea
      </span>
    </div>
  )
}
