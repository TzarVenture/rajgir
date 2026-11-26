/**
 * Wavy hill line with a small stupa: a heritage motif used to join homepage sections (design guide: hills, pagodas,
 * mountain contours). `fill` is the colour of the section BELOW the divider so the shape blends into it.
 */
export function HillDivider({ fill = "#F8F8F6", className = "", flip = false }: { fill?: string; className?: string; flip?: boolean }) {
  return (
    <div className={`pointer-events-none w-full leading-[0] ${className}`} aria-hidden style={flip ? { transform: "scaleY(-1)" } : undefined}>
      <svg viewBox="0 0 1440 150" preserveAspectRatio="none" className="block h-[70px] w-full sm:h-[110px]" focusable="false">
        <path d="M0 96 C 120 40 220 120 360 82 C 500 44 560 18 700 60 C 840 102 930 46 1070 40 C 1210 34 1330 84 1440 58 L1440 150 L0 150 Z" fill="#FFC928" opacity="0.28" />
        <path d="M0 112 C 140 70 260 132 400 104 C 540 76 640 52 780 92 C 920 132 1040 78 1180 76 C 1300 74 1380 108 1440 96 L1440 150 L0 150 Z" fill="#F5A623" opacity="0.32" />
        {/* stupa on the ridge */}
        <g transform="translate(1085 14)" fill="#C78A12" opacity="0.75">
          <rect x="-2" y="0" width="4" height="14" />
          <path d="M-10 36 C -10 18 10 18 10 36 Z" />
          <rect x="-14" y="36" width="28" height="4" rx="1" />
          <rect x="-18" y="40" width="36" height="4" rx="1" />
        </g>
        <path d="M0 126 C 160 98 300 140 460 120 C 620 100 760 84 920 116 C 1080 148 1240 104 1440 122 L1440 150 L0 150 Z" fill={fill} />
      </svg>
    </div>
  );
}
