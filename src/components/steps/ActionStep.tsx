export default function ActionStep({ label, url, note }: { label: string; url: string; note: string }) {
  return (
    <div>
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-light">
          {label} ↗
        </a>
      ) : (
        <p className="text-sm text-[var(--muted)]">
          No link has been added for this step yet. We will be in touch to arrange it — mark the step complete once it is booked.
        </p>
      )}
      {note && <p className="help mt-3 max-w-lg">{note}</p>}
    </div>
  );
}
