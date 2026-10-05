import React, { useId } from 'react';

/**
 * PicketLogo — Unified logo component for Picket.
 * Supports vector SVG and pure HTML/CSS modes, multiple sizes, and lockup variants.
 */
export default function PicketLogo({
  size = 'md',
  variant = 'mark',
  className = '',
  showWordmark = false,
  tagline = null,
  pureHtml = false,
  light = false,
  style = {},
}) {
  const id = useId().replace(/:/g, '');

  // Size mapping (in pixels)
  const sizeMap = {
    xs: 18,
    sm: 24,
    md: 32,
    lg: 44,
    xl: 64,
    '2xl': 80,
  };

  const pixelSize = typeof size === 'number' ? size : sizeMap[size] || 32;

  // Colors based on theme
  const backGradient = light
    ? ['#0D47A1', '#1976D2']
    : ['#1D4ED8', '#3B82F6'];

  const frontGradient = light
    ? ['#00BCD4', '#0097A7', '#0D47A1']
    : ['#00E5FF', '#26C6DA', '#1565C0'];

  // Pure HTML & CSS Mark (matching exact 44x54 aspect ratio and geometry)
  const renderPureHtmlMark = () => {
    const width = pixelSize * (26 / 32);
    const height = pixelSize;
    return (
      <div
        className="picket-html-mark shrink-0"
        role="img"
        aria-label="Picket mark"
        style={{
          position: 'relative',
          display: 'inline-block',
          width: `${width}px`,
          height: `${height}px`,
        }}
      >
        {/* Back Pillar: 17x40 at (4,6) rotated 14deg around (12.5, 26) */}
        <div
          style={{
            position: 'absolute',
            borderRadius: `${(8.5 / 54) * height}px`,
            width: `${(17 / 44) * width}px`,
            height: `${(40 / 54) * height}px`,
            left: `${(4 / 44) * width}px`,
            top: `${(6 / 54) * height}px`,
            transformOrigin: `${((12.5 - 4) / 17) * 100}% ${((26 - 6) / 40) * 100}%`,
            transform: 'rotate(14deg)',
            background: 'linear-gradient(180deg, #1565C0 0%, #1E88E5 100%)',
          }}
        />
        {/* Front Pillar: 15x38 at (20,3) rotated -6deg around (27.5, 22) */}
        <div
          style={{
            position: 'absolute',
            borderRadius: `${(7.5 / 54) * height}px`,
            width: `${(15 / 44) * width}px`,
            height: `${(38 / 54) * height}px`,
            left: `${(20 / 44) * width}px`,
            top: `${(3 / 54) * height}px`,
            transformOrigin: `${((27.5 - 20) / 15) * 100}% ${((22 - 3) / 38) * 100}%`,
            transform: 'rotate(-6deg)',
            background: 'linear-gradient(180deg, #26C6DA 0%, #1565C0 100%)',
          }}
        />
      </div>
    );
  };

  // Scalable Vector SVG Mark (Exact Original Geometry)
  const renderSvgMark = () => (
    <svg
      width={pixelSize * (26 / 32)}
      height={pixelSize}
      viewBox="0 0 44 54"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Picket logo"
      className="shrink-0"
    >
      <defs>
        <linearGradient
          id={`pk-g-back-${id}`}
          x1="6"
          y1="6"
          x2="20"
          y2="48"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#1565C0" />
          <stop offset="100%" stopColor="#1E88E5" />
        </linearGradient>

        <linearGradient
          id={`pk-g-front-${id}`}
          x1="22"
          y1="2"
          x2="34"
          y2="46"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#26C6DA" />
          <stop offset="100%" stopColor="#1565C0" />
        </linearGradient>
      </defs>

      {/* Back Pillar */}
      <rect
        x="4"
        y="6"
        width="17"
        height="40"
        rx="8.5"
        fill={`url(#pk-g-back-${id})`}
        transform="rotate(14 12.5 26)"
      />

      {/* Front Pillar */}
      <rect
        x="20"
        y="3"
        width="15"
        height="38"
        rx="7.5"
        fill={`url(#pk-g-front-${id})`}
        transform="rotate(-6 27.5 22)"
      />
    </svg>
  );

  const markElement = pureHtml ? renderPureHtmlMark() : renderSvgMark();

  // If badge variant: wrap inside sleek squircle tile
  if (variant === 'badge') {
    const badgePadding = Math.round(pixelSize * 0.4);
    return (
      <div
        className={`inline-flex items-center justify-center rounded-2xl relative overflow-hidden ${className}`}
        style={{
          background: 'linear-gradient(145deg, #0f172a 0%, #090d16 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          padding: `${badgePadding}px`,
          ...style,
        }}
      >
        {/* Inner ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(38, 198, 218, 0.15) 0%, transparent 70%)',
          }}
        />
        {markElement}
      </div>
    );
  }

  // If full lockup or showWordmark
  if (variant === 'full' || showWordmark) {
    const fontMultiplier = pixelSize <= 24 ? 0.75 : pixelSize <= 36 ? 0.7 : 0.65;
    const fontSize = Math.round(pixelSize * fontMultiplier);

    return (
      <div
        className={`inline-flex items-center gap-2.5 ${className}`}
        style={{ verticalAlign: 'middle', ...style }}
      >
        {markElement}
        <div className="flex flex-col justify-center leading-none">
          <span
            style={{
              fontFamily: 'var(--font-sans, "Geist", sans-serif)',
              fontWeight: 700,
              fontSize: `${fontSize}px`,
              letterSpacing: '-0.8px',
              color: light ? '#090d16' : 'var(--text-primary, #f8fafc)',
              lineHeight: 1,
            }}
          >
            picket
          </span>
          {tagline && (
            <span
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: `${Math.max(9, Math.round(fontSize * 0.45))}px`,
                fontWeight: 600,
                letterSpacing: '0.8px',
                color: 'var(--picket-cyan, #26C6DA)',
                textTransform: 'uppercase',
                marginTop: '3px',
              }}
            >
              {tagline}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Default: mark only
  return (
    <span className={`inline-flex items-center justify-center ${className}`} style={style}>
      {markElement}
    </span>
  );
}
