import { useId } from 'react';

/*
 * The art of the error pages, all decorative (aria-hidden): a big code whose zeros are powder
 * compacts, soft powder clouds and specks behind it. Every colour is a theme token, so it follows
 * light, dark and high contrast; every animation stops with reduced motion (styles' base.css).
 */

/**
 * The powder still left in an empty compact: the pan minus a circle shifted up and right, which
 * leaves a crescent along the lower left (clipped to the pan).
 */
const LEFTOVER =
  'M-72 0a72 72 0 1 0 144 0a72 72 0 1 0-144 0ZM-56-8a64 64 0 1 0 128 0a64 64 0 1 0-128 0Z';
/** Loose powder left in the empty pan, as [x, y, radius]. */
const LOOSE = [
  [-18, 30, 2.6],
  [-4, 42, 1.8],
  [-34, 14, 1.6],
  [6, 24, 1.2],
  [-26, 46, 1.4],
] as const;
/** A four-point sparkle, 20 units across. */
const SPARKLE = 'M0-10C1-3 3-1 10 0C3 1 1 3 0 10C-1 3-3 1-10 0C-3-1-1-3 0-10Z';
/** Cracks through the pressed powder, from one point near the middle. */
const CRACKS = [
  'M6-4L24-22L30-44L46-52',
  'M6-4L-16 6L-36-4L-62 10',
  'M6-4L12 20L30 34L48 46',
  'M-16 6L-22 30L-40 44',
];
/** The piece that broke off at the lower right, and the crumbs falling from it. */
const CHUNK = 'M30 34L48 46L58 30L44 22Z';
const CRUMBS = [
  { x: 76, y: 64, r: 7, delay: '[animation-delay:450ms]' },
  { x: 96, y: 82, r: 5, delay: '[animation-delay:600ms]' },
  { x: 62, y: 90, r: 5.5, delay: '[animation-delay:700ms]' },
  { x: 108, y: 100, r: 3.5, delay: '[animation-delay:820ms]' },
  { x: 84, y: 108, r: 4, delay: '[animation-delay:900ms]' },
  { x: 120, y: 112, r: 2.5, delay: '[animation-delay:980ms]' },
] as const;

/** A powder compact seen from above: brand-gradient case, then an empty or a cracked pan. */
export function Compact({ cracked }: { cracked: boolean }) {
  const id = useId();
  const ref = (name: string) => `url(#${id}-${name})`;
  return (
    <svg
      viewBox="-100 -100 200 200"
      overflow="visible"
      focusable="false"
      aria-hidden="true"
      data-compact={cracked ? 'cracked' : 'empty'}
      className={`mx-[0.04em] size-[0.74em] shrink-0 drop-shadow-[0_0.06em_0.08em_rgba(var(--brand-rgb),0.35)] ${
        cracked ? 'animate-compact-jolt' : 'animate-compact-float'
      }`}
    >
      <defs>
        <linearGradient id={`${id}-case`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--gradient-from)" />
          <stop offset="1" stopColor="var(--gradient-to)" />
        </linearGradient>
        {/* light from the top left, on powder and on bare metal alike */}
        <radialGradient id={`${id}-glare`} cx="0.32" cy="0.28" r="0.8">
          <stop offset="0" stopColor="#fff" stopOpacity="0.6" />
          <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--surface)" />
          <stop offset="0.45" stopColor="var(--border-strong)" />
          <stop offset="0.6" stopColor="var(--surface-muted)" />
          <stop offset="1" stopColor="var(--border-strong)" />
        </linearGradient>
        <clipPath id={`${id}-pan`}>
          <circle r="72" />
        </clipPath>
        <radialGradient id={`${id}-well`} r="0.5">
          <stop offset="0.8" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.28" />
        </radialGradient>
      </defs>
      <circle r="96" fill={ref('case')} />
      {/* gloss on the rim */}
      <path
        d="M-66-62A92 92 0 0 1 18-90"
        fill="none"
        stroke="#fff"
        strokeOpacity="0.45"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle r="82" fill="#000" fillOpacity="0.2" />
      {cracked ? (
        <>
          <circle r="72" fill="var(--accent)" />
          <circle r="56" fill="none" stroke="#fff" strokeOpacity="0.22" strokeWidth="1.5" />
          {/* the hole the chunk left: bare metal */}
          <path d={CHUNK} fill={ref('metal')} />
          <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            {CRACKS.map((d) => (
              <path key={d} d={d} stroke="#000" strokeOpacity="0.45" strokeWidth="3.5" />
            ))}
            {CRACKS.map((d) => (
              <path
                key={`${d}-lit`}
                d={d}
                transform="translate(-1.2 -1.2)"
                stroke="#fff"
                strokeOpacity="0.4"
                strokeWidth="1"
              />
            ))}
          </g>
          <circle r="72" fill={ref('glare')} />
          <circle r="72" fill={ref('well')} />
          <path
            d={CHUNK}
            fill="var(--accent)"
            stroke="#000"
            strokeOpacity="0.25"
            strokeWidth="1.5"
            className="animate-crumb-fall [animation-delay:300ms]"
            transform="translate(34 30) rotate(18 44 38)"
          />
          {CRUMBS.map(({ x, y, r, delay }) => (
            <circle
              key={`${String(x)}-${String(y)}`}
              cx={x}
              cy={y}
              r={r}
              fill="var(--accent)"
              className={`animate-crumb-fall ${delay}`}
            />
          ))}
        </>
      ) : (
        <>
          {/* bare metal: a diagonal sheen and brushed rings */}
          <circle r="72" fill={ref('metal')} />
          <g fill="none" stroke="#fff" strokeOpacity="0.16" strokeWidth="1">
            <circle r="60" />
            <circle r="46" />
            <circle r="32" />
            <circle r="18" />
          </g>
          <path d={LEFTOVER} fill="var(--accent)" fillRule="evenodd" clipPath={ref('pan')} />
          {LOOSE.map(([x, y, r]) => (
            <circle key={`${String(x)}-${String(y)}`} cx={x} cy={y} r={r} fill="var(--accent)" />
          ))}
          <circle r="72" fill={ref('glare')} />
          <circle r="72" fill={ref('well')} />
          <path
            d={SPARKLE}
            fill="#fff"
            transform="translate(26 -28) scale(1.4)"
            className="animate-sparkle origin-center transform-fill"
          />
          <path
            d={SPARKLE}
            fill="#fff"
            transform="translate(-6 -48) scale(0.7)"
            className="animate-sparkle origin-center transform-fill [animation-delay:-1.2s]"
          />
        </>
      )}
    </svg>
  );
}

/** The big code: each 0 or O is a compact (empty, or cracked for errors); other characters stay text. */
export function ErrorCode({ code, cracked }: { code: string; cracked: boolean }) {
  return (
    <div
      aria-hidden="true"
      data-error-code={code}
      className="font-display animate-scale-in flex items-center justify-center text-[clamp(6rem,24vw,13rem)] leading-none font-medium tracking-tight"
    >
      {/* codes are short ASCII ("404", "Oops"), so one character per glyph */}
      {Array.from(code, (character, index) =>
        character === '0' || character === 'O' ? (
          <Compact key={`${String(index)}-compact`} cracked={cracked} />
        ) : (
          <span key={`${String(index)}-${character}`} className="text-brand-gradient px-[0.02em]">
            {character}
          </span>
        ),
      )}
    </div>
  );
}

/** Specks of powder as [x, y, radius, colour] on a 100 × 60 field. */
const SPECKS: readonly (readonly [number, number, number, 0 | 1 | 2])[] = [
  [6, 12, 0.3, 0],
  [14, 44, 0.45, 1],
  [21, 8, 0.25, 2],
  [27, 52, 0.35, 0],
  [33, 18, 0.2, 1],
  [9, 30, 0.25, 2],
  [40, 6, 0.4, 0],
  [46, 56, 0.25, 2],
  [58, 4, 0.3, 1],
  [63, 50, 0.45, 0],
  [70, 14, 0.25, 2],
  [76, 40, 0.35, 1],
  [83, 8, 0.45, 0],
  [88, 28, 0.25, 2],
  [94, 50, 0.35, 1],
  [97, 16, 0.2, 0],
  [52, 34, 0.18, 2],
  [18, 24, 0.18, 0],
  [80, 54, 0.2, 2],
  [3, 54, 0.3, 1],
];
const SPECK_COLOURS = ['var(--brand)', 'var(--secondary)', 'var(--accent)'];
const SPECK_DELAYS = [
  '[animation-delay:-0.4s]',
  '[animation-delay:-1.3s]',
  '[animation-delay:-2.1s]',
  '[animation-delay:-2.9s]',
];

/** Soft powder clouds in the brand colours and specks that twinkle, behind the content. */
export function PowderBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      data-powder-backdrop=""
    >
      <div className="bg-brand/20 animate-powder-drift absolute -top-24 -left-20 size-80 rounded-full blur-3xl" />
      <div className="bg-secondary/15 animate-powder-drift absolute top-1/4 -right-24 size-96 rounded-full blur-3xl [animation-delay:-6s]" />
      <div className="bg-accent/20 animate-powder-drift absolute -bottom-28 left-1/4 size-80 rounded-full blur-3xl [animation-delay:-11s]" />
      <svg
        viewBox="0 0 100 60"
        preserveAspectRatio="xMidYMid slice"
        focusable="false"
        className="absolute inset-0 size-full"
      >
        {SPECKS.map(([x, y, r, colour], index) => (
          <circle
            key={`${String(x)}-${String(y)}`}
            cx={x}
            cy={y}
            r={r}
            fill={SPECK_COLOURS[colour]}
            className={`animate-speck-twinkle ${SPECK_DELAYS[index % SPECK_DELAYS.length] ?? ''}`}
          />
        ))}
      </svg>
    </div>
  );
}
