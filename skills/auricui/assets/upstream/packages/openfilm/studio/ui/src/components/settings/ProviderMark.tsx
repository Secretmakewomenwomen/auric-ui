import { MARKS } from '@/lib/provider-marks';

/** A provider's or an agent's mark (lib/provider-marks.ts), or, for one with none yet, its letter in a rounded square. */
export function ProviderMark({ id, size = 18 }: { id: string; size?: number }) {
  const mark = MARKS[id];
  return (
    <span className="inline-flex shrink-0 items-center justify-center text-[var(--text)]" style={{ width: size, height: size }} aria-hidden>
      {mark ? (
        <svg width={size} height={size} viewBox={mark.viewBox} fill="currentColor" fillRule="evenodd" className="block">
          {mark.parts ? mark.parts.map((part) => <path key={part.d} d={part.d} fillOpacity={part.opacity} />) : <path d={mark.d} />}
        </svg>
      ) : id ? (
        <svg width={size} height={size} viewBox="0 0 24 24" className="block">
          {/* the letter cut out of a solid square, as heavy as the other marks */}
          <mask id={`provider-mark-${id}`}>
            <rect width="24" height="24" fill="white" />
            <text x="12" y="17" textAnchor="middle" fontSize="15" fontWeight="700" fill="black" fontFamily="inherit">{id[0]!.toUpperCase()}</text>
          </mask>
          <rect x="1" y="1" width="22" height="22" rx="6" fill="currentColor" mask={`url(#provider-mark-${id})`} />
        </svg>
      ) : null}
    </span>
  );
}
