// The Portico lockup: an arch — the entryway a portico is — drawn inline so it
// stays crisp at any size and inherits the page font for the wordmark.

export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden className="shrink-0">
      <rect x="1.5" y="1.5" width="61" height="61" rx="15" fill="#121211" />
      <rect x="1.5" y="1.5" width="61" height="61" rx="15" stroke="#2e2d2a" strokeWidth="2" />
      <path
        d="M17 48V29.5a15 15 0 0 1 30 0V48"
        stroke="var(--accent, #d8cfc0)"
        strokeWidth="4.6"
        strokeLinecap="round"
      />
      <path d="M12 52.5h40" stroke="#f4f3ef" strokeWidth="4.6" strokeLinecap="round" />
      <path d="M32 48V33" stroke="#f4f3ef" strokeWidth="3" strokeLinecap="round" opacity="0.32" />
    </svg>
  );
}

export default function Logo({
  size = 28,
  name = "Portico",
  wordmark = true,
  stacked = false,
  className = "",
}: {
  size?: number;
  name?: string;
  wordmark?: boolean;
  stacked?: boolean;
  className?: string;
}) {
  const text = wordmark ? (
    <span
      className="font-semibold uppercase whitespace-nowrap leading-none text-[var(--text)]"
      style={{ fontSize: stacked ? Math.round(size * 0.3) : Math.round(size * 0.44), letterSpacing: "0.17em" }}
    >
      {name}
    </span>
  ) : null;

  if (stacked) {
    return (
      <span className={`inline-flex flex-col items-center gap-4 ${className}`}>
        <LogoMark size={size} />
        {text}
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <LogoMark size={size} />
      {text}
    </span>
  );
}
