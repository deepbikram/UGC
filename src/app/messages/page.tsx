import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { messages, portalData } from "@/lib/clients";
import PortalShell from "@/components/PortalShell";
import Thread from "@/components/Thread";

export const dynamic = "force-dynamic";
export const metadata = { title: "Contact us" };

export default async function MessagesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  // ponytail: 2 trips (shell + thread), settings cached
  const [shell, s, thread] = await Promise.all([
    portalData(session.userId),
    getSettings(),
    messages(session.userId),
  ]);

  const whatsappHref = toWhatsAppHref(s.support_whatsapp || "https://wa.link/zthuqj");
  const emailHref = s.support_email ? `mailto:${s.support_email}` : "";

  return (
    <PortalShell name={session.name || session.email} role={session.role} portalName={s.portal_name} completedSteps={shell.done} unread={0}>
      <div className="max-w-3xl mx-auto fade-up">
        <p className="eyebrow mb-3">Contact us</p>
        <h1 className="text-[2rem] lg:text-[2.4rem] font-bold mb-2 title-grad">Talk to the team</h1>
        <p className="text-[var(--muted)] text-sm mb-8 max-w-xl">
          Questions about guidelines, payouts, or your videos — WhatsApp gets the fastest reply. Anything you send here stays attached to your project.
        </p>
        <div className="grid sm:grid-cols-2 gap-2.5 mb-8">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="card card-hover p-4 flex items-center gap-3"
          >
            <span className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(37,211,102,0.15)", border: "1px solid rgba(37,211,102,0.35)" }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="#25D366" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4 0-.5.1-.7l.5-.6c.1-.2.1-.4 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.2-.7.5-.9.9-1.1 2.2-.2 3.9a12 12 0 0 0 4.5 4.2c1.7.8 2.4.9 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2 0-.1-.2-.1-.5-.3Z" /></svg>
            </span>
            <span className="min-w-0">
              <span className="block text-[14px] font-semibold leading-tight">WhatsApp us</span>
              <span className="block text-[12.5px] text-[var(--muted)] truncate">Fastest reply · opens chat</span>
            </span>
            <span className="ml-auto text-[var(--muted)] shrink-0" aria-hidden="true">↗</span>
          </a>
          <a href={emailHref} className="card card-hover p-4 flex items-center gap-3">
            <span className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(216,207,192,0.1)", border: "1px solid var(--border-hi)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
            </span>
            <span className="min-w-0">
              <span className="block text-[14px] font-semibold leading-tight">Email us</span>
              <span className="block text-[12.5px] text-[var(--muted)] truncate">{s.support_email}</span>
            </span>
            <span className="ml-auto text-[var(--muted)] shrink-0" aria-hidden="true">↗</span>
          </a>
        </div>
        <Thread
          initial={thread.map((m) => ({ id: m.id, body: m.body, authorName: m.author_name, authorRole: m.author_role, createdAt: m.created_at }))}
          me={session.role}
          emptyLine="No messages yet. Ask us anything — scope, timing, a file you cannot find."
        />
      </div>
    </PortalShell>
  );
}

function toWhatsAppHref(raw: string): string {
  const v = (raw || "").trim();
  if (!v) return "https://wa.link/zthuqj";
  if (/^https?:\/\//i.test(v)) return v;
  const digits = v.replace(/\D/g, "");
  if (digits.length >= 7) return `https://wa.me/${digits}`;
  return "https://wa.link/zthuqj";
}
