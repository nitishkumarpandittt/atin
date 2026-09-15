/** Illustrated pack composition in brand colours. Decorative; replaced by an uploaded photo later. */
export function HeroVisual({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 560 560" className={className} role="presentation" aria-hidden focusable="false">
      <defs>
        <linearGradient id="hv-blue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1E8FE1" />
          <stop offset="1" stopColor="#0054B4" />
        </linearGradient>
        <linearGradient id="hv-navy" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0A63C9" />
          <stop offset="1" stopColor="#0A1F66" />
        </linearGradient>
        <linearGradient id="hv-green" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6CC43A" />
          <stop offset="1" stopColor="#008424" />
        </linearGradient>
        <linearGradient id="hv-glass" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".55" />
          <stop offset=".35" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hv-foil" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F4F7FB" />
          <stop offset="1" stopColor="#D5DEEA" />
        </linearGradient>
        <filter id="hv-shadow" x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="0" dy="18" stdDeviation="16" floodColor="#0A1F66" floodOpacity=".22" />
        </filter>
        <filter id="hv-soft" x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#0A1F66" floodOpacity=".18" />
        </filter>
      </defs>

      {/* Logo-style arc */}
      <circle cx="280" cy="286" r="228" fill="#ffffff" />
      <path d="M86 402 A228 228 0 1 1 452 440" fill="none" stroke="url(#hv-blue)" strokeWidth="14" strokeLinecap="round" />
      <path d="M118 448 C 190 380, 300 360, 470 250" fill="none" stroke="url(#hv-green)" strokeWidth="10" strokeLinecap="round" opacity=".9" />

      {/* Carton */}
      <g filter="url(#hv-shadow)">
        <path d="M150 210 L290 180 L290 400 L150 430 Z" fill="#ffffff" />
        <path d="M290 180 L352 204 L352 420 L290 400 Z" fill="#E3ECF8" />
        <path d="M150 210 L290 180 L352 204 L212 236 Z" fill="#F3F7FC" />
        <path d="M150 300 L290 270 L290 318 L150 348 Z" fill="url(#hv-navy)" />
        <path d="M150 348 L290 318 L290 330 L150 360 Z" fill="#4CAA1C" />
        <path d="M290 270 L352 294 L352 342 L290 318 Z" fill="#0A1F66" opacity=".85" />
        <text x="168" y="262" fontFamily="var(--font-jakarta), sans-serif" fontWeight="800" fontSize="30" fill="#0A1F66" transform="skewY(-12) translate(0 42)">ATIN</text>
        <path d="M232 247 q 18 -26 40 -18 q -10 22 -40 18 z" fill="#4CAA1C" transform="skewY(-12) translate(0 58)" />
      </g>

      {/* Syrup bottle */}
      <g filter="url(#hv-shadow)">
        <rect x="336" y="150" width="46" height="34" rx="6" fill="url(#hv-green)" />
        <rect x="330" y="176" width="58" height="16" rx="4" fill="#006B1D" />
        <path d="M322 214 q 0 -22 24 -24 h 26 q 24 2 24 24 v 196 q 0 16 -16 16 h -42 q -16 0 -16 -16 z" fill="url(#hv-blue)" />
        <rect x="322" y="264" width="74" height="96" fill="#ffffff" />
        <rect x="322" y="264" width="74" height="18" fill="#0A1F66" />
        <rect x="334" y="296" width="50" height="7" rx="3.5" fill="#0054B4" />
        <rect x="334" y="311" width="34" height="6" rx="3" fill="#C9D6E8" />
        <rect x="334" y="325" width="42" height="6" rx="3" fill="#C9D6E8" />
        <circle cx="376" cy="344" r="7" fill="#4CAA1C" />
        <path d="M322 214 q 0 -22 24 -24 h 8 v 236 h -16 q -16 0 -16 -16 z" fill="url(#hv-glass)" />
      </g>

      {/* Blister strip */}
      <g filter="url(#hv-shadow)" transform="rotate(-14 250 440)">
        <rect x="128" y="392" width="250" height="104" rx="18" fill="url(#hv-foil)" />
        {[0, 1, 2, 3, 4].map((i) =>
          [0, 1].map((j) => (
            <g key={`${i}-${j}`} filter="url(#hv-soft)">
              <rect x={148 + i * 46} y={408 + j * 44} width="34" height="30" rx="15" fill="#ffffff" />
              <rect x={154 + i * 46} y={414 + j * 44} width="22" height="6" rx="3" fill="#E3F1FD" />
            </g>
          )),
        )}
      </g>

      {/* Eye-drop vial */}
      <g filter="url(#hv-shadow)" transform="rotate(10 440 380)">
        <path d="M430 300 l10 -34 l10 34 z" fill="#ffffff" />
        <rect x="420" y="298" width="40" height="22" rx="5" fill="#0A1F66" />
        <rect x="414" y="318" width="52" height="98" rx="14" fill="#ffffff" />
        <rect x="414" y="346" width="52" height="40" fill="url(#hv-green)" />
        <rect x="424" y="360" width="30" height="5" rx="2.5" fill="#ffffff" opacity=".9" />
      </g>

      {/* Floating capsules and leaf */}
      <g className="motion-safe:animate-[float_6s_ease-in-out_infinite]">
        <g transform="rotate(-35 120 160)" filter="url(#hv-soft)">
          <rect x="88" y="146" width="64" height="28" rx="14" fill="#ffffff" />
          <path d="M120 146 h18 a14 14 0 0 1 0 28 h-18 z" fill="url(#hv-blue)" />
        </g>
      </g>
      <g className="motion-safe:animate-[float_8s_ease-in-out_infinite]">
        <g transform="rotate(28 470 170)" filter="url(#hv-soft)">
          <rect x="446" y="158" width="52" height="24" rx="12" fill="#ffffff" />
          <path d="M472 158 h14 a12 12 0 0 1 0 24 h-14 z" fill="url(#hv-green)" />
        </g>
      </g>
      <g className="motion-safe:animate-[float_7s_ease-in-out_infinite]">
        <path d="M84 290 c 40 -52 96 -48 112 -40 c -12 44 -58 78 -112 40 z" fill="url(#hv-green)" opacity=".95" />
        <path d="M92 286 c 30 -14 62 -26 96 -32" stroke="#ffffff" strokeOpacity=".7" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
      <circle cx="486" cy="470" r="9" fill="#1E8FE1" opacity=".5" />
      <circle cx="64" cy="200" r="6" fill="#4CAA1C" opacity=".6" />
    </svg>
  );
}
