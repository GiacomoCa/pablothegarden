// Pablo the parrot — the festival mascot (the 2023 "Parrot Edition" namesake),
// here wearing DJ headphones to tie the electronic-music theme together.
// Pure inline SVG so it scales crisply and needs no image asset. Used by the
// floating easter-egg teaser and the game's start screen.

interface PabloSpriteProps {
  className?: string;
  title?: string;
}

export default function PabloSprite({ className, title }: PabloSpriteProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label={title ?? 'Pablo'}
      xmlns="http://www.w3.org/2000/svg"
    >
      {title ? <title>{title}</title> : null}

      {/* tail feathers */}
      <g>
        <path d="M40 92 Q18 96 8 110 Q26 104 44 100 Z" fill="#5CE1E6" />
        <path d="M42 96 Q22 104 14 118 Q34 110 48 104 Z" fill="#98FB98" />
        <path d="M46 98 Q30 110 26 120 Q42 114 52 108 Z" fill="#DDA0DD" />
      </g>

      {/* body */}
      <ellipse cx="58" cy="74" rx="30" ry="33" fill="#FFCDFF" />
      <ellipse cx="62" cy="80" rx="17" ry="18" fill="#FFFFFF" opacity="0.4" />

      {/* wing */}
      <path
        d="M44 60 Q26 70 34 96 Q48 100 56 84 Q56 66 44 60 Z"
        fill="#DDA0DD"
      />
      <path d="M40 84 Q44 94 52 94 Q50 86 46 82 Z" fill="#5CE1E6" />

      {/* head */}
      <circle cx="64" cy="44" r="25" fill="#FFCDFF" />

      {/* crest */}
      <g fill="#FFB347">
        <path d="M58 20 L54 6 L62 16 Z" />
        <path d="M66 18 L66 4 L72 17 Z" />
        <path d="M73 21 L80 9 L78 22 Z" />
      </g>

      {/* beak */}
      <path d="M86 44 Q104 41 86 56 Q83 50 86 44 Z" fill="#FFB347" />
      <path d="M86 51 Q98 50 86 58 Z" fill="#E8952F" />

      {/* cheek */}
      <circle cx="70" cy="52" r="5" fill="#98FB98" opacity="0.6" />

      {/* eye */}
      <circle cx="74" cy="40" r="8" fill="#FFFFFF" />
      <circle cx="76" cy="41" r="4" fill="#150526" />
      <circle cx="78" cy="39" r="1.4" fill="#FFFFFF" />

      {/* DJ headphones */}
      <path
        d="M44 44 Q44 18 78 20"
        fill="none"
        stroke="#150526"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <g>
        <ellipse cx="44" cy="46" rx="9" ry="13" fill="#150526" />
        <ellipse cx="44" cy="46" rx="9" ry="13" fill="none" stroke="#5CE1E6" strokeWidth="2.5" />
        {/* tiny equalizer */}
        <rect x="40" y="44" width="2" height="6" rx="1" fill="#FFCDFF" />
        <rect x="43.5" y="41" width="2" height="9" rx="1" fill="#FFCDFF" />
        <rect x="47" y="45" width="2" height="5" rx="1" fill="#FFCDFF" />
      </g>

      {/* feet */}
      <g stroke="#FFB347" strokeWidth="3" strokeLinecap="round">
        <line x1="54" y1="104" x2="54" y2="112" />
        <line x1="66" y1="104" x2="66" y2="112" />
      </g>
    </svg>
  );
}
