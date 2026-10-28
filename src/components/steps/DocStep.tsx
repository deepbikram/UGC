export default function DocStep({ title, minutes, html }: { title: string; minutes: number; html: string }) {
  return (
    <div>
      {/* The step header already carries the title, so this only sets expectations. */}
      <p className="mono mb-5" title={title}>{minutes} min read</p>
      <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
