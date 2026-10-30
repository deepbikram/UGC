// The Band9Prep mark, served from public/brand so swapping art never needs a
// rebuild — just replace the file. The wordmark beside it stays type.

export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/b9.jpg"
      alt=""
      width={size}
      height={size}
      aria-hidden
      className="shrink-0"
      style={{ borderRadius: Math.max(6, Math.round(size * 0.24)) }}
    />
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
