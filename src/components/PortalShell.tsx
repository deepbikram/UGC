"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { JOURNEY, isModuleUnlocked, journeyStats } from "@/lib/journey";
import { initials } from "@/lib/format";
import Logo from "./Logo";

function CheckCircle() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <circle cx="12" cy="12" r="10" stroke="var(--accent)" strokeWidth="1.5" />
      <path d="M7.8 12.2l2.8 2.8 5.6-6" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ProgressRing({ number, pct }: { number: number; pct: number }) {
  const r = 10;
  const c = 2 * Math.PI * r;
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" className="shrink-0 -rotate-90">
      <circle cx="12" cy="12" r={r} stroke="#302f2c" strokeWidth="2" fill="none" />
      <circle cx="12" cy="12" r={r} stroke="var(--accent)" strokeWidth="2" fill="none" strokeLinecap="round" strokeDasharray={`${(pct / 100) * c} ${c}`} />
      <text x="12" y="12" textAnchor="middle" dominantBaseline="central" fill="#8d8b85" fontSize="9.5" fontWeight="600" transform="rotate(90 12 12)">
        {number}
      </text>
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3f3e3a" strokeWidth="1.5" className="shrink-0">
      <rect x="6" y="10.5" width="12" height="8.5" rx="2" />
      <path d="M8.5 10.5V8.2a3.5 3.5 0 117 0v2.3" />
    </svg>
  );
}

type NavItem = { href: string; label: string; badge?: number; match: (p: string) => boolean; icon: React.ReactNode };

const ICONS = {
  home: <><path d="M4 11.5L12 5l8 6.5" /><path d="M6.5 10.5V19h11v-8.5" /></>,
  board: <><rect x="4" y="5" width="16" height="14" rx="2.5" /><path d="M4 9.5h16M9.5 9.5V19" /></>,
  files: <><path d="M6 4.5h7l5 5V19a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 016 19V6a1.5 1.5 0 011.5-1.5z" /><path d="M13 4.5V10h5" /></>,
  chat: <><path d="M20 12.5c0 3.9-3.6 7-8 7a9 9 0 01-2.8-.44L4.5 20.5l1.3-3.5A6.7 6.7 0 014 12.5c0-3.9 3.6-7 8-7s8 3.1 8 7z" /></>,
  users: <><circle cx="12" cy="9" r="3.2" /><path d="M5.5 19.5c0-3.4 2.9-5.6 6.5-5.6s6.5 2.2 6.5 5.6" /></>,
  pulse: <><path d="M3 12.5h4l2.5-6 4 12 2.5-6H21" /></>,
  cog: <><circle cx="12" cy="12" r="2.6" /><path d="M12 4.5V7M12 17v2.5M19.5 12H17M7 12H4.5M17.3 6.7l-1.8 1.8M8.5 15.5l-1.8 1.8M17.3 17.3l-1.8-1.8M8.5 8.5L6.7 6.7" /></>,
};

const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Creators", match: (p) => p === "/admin" || p.startsWith("/admin/clients"), icon: ICONS.users },
  { href: "/admin/work", label: "Videos", match: (p) => p.startsWith("/admin/work"), icon: ICONS.board },
  { href: "/admin/content", label: "Content", match: (p) => p.startsWith("/admin/content"), icon: ICONS.files },
  { href: "/admin/activity", label: "Activity", match: (p) => p.startsWith("/admin/activity"), icon: ICONS.pulse },
  { href: "/admin/settings", label: "Settings", match: (p) => p.startsWith("/admin/settings"), icon: ICONS.cog },
];

export default function PortalShell({
  name,
  role,
  portalName,
  view = "client",
  completedSteps = [],
  unread = 0,
  children,
}: {
  name: string;
  role: string;
  portalName: string;
  view?: "client" | "admin";
  completedSteps?: string[];
  unread?: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const completed = new Set(completedSteps);
  const stats = journeyStats(completed);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => setDrawerOpen(false), [pathname]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const clientTail: NavItem[] = [
    { href: "/deliverables", label: "My videos", match: (p) => p.startsWith("/deliverables"), icon: ICONS.board },
    { href: "/files", label: "Content", match: (p) => p.startsWith("/files"), icon: ICONS.files },
    { href: "/messages", label: "Contact us", badge: unread, match: (p) => p.startsWith("/messages"), icon: ICONS.chat },
  ];

  function IconLink({ item }: { item: NavItem }) {
    const active = item.match(pathname);
    return (
      <Link
        href={item.href}
        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${active ? "bg-[var(--panel-hi)]" : "hover:bg-[var(--panel-2)]"}`}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "var(--accent)" : "#8d8b85"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
          {item.icon}
        </svg>
        <span className={`text-[14.5px] font-medium ${active ? "text-white" : "text-neutral-300"}`}>{item.label}</span>
        {item.badge ? (
          <span className="ml-auto num text-[10.5px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center" style={{ background: "var(--accent)", color: "#17150f" }}>
            {item.badge}
          </span>
        ) : active ? (
          <span className="ml-auto w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--accent)", boxShadow: "0 0 8px var(--accent-glow)" }} />
        ) : null}
      </Link>
    );
  }

  const nav =
    view === "client" ? (
      <>
        <div className="px-6 pb-6">
          <div className="flex items-baseline justify-between mb-2">
            <span className="eyebrow">Progress</span>
            <span className="text-xs font-semibold text-neutral-300 num">
              {stats.done}/{stats.total} · {stats.pct}%
            </span>
          </div>
          <div className="bar bar-thin">
            <div className={`bar-fill ${stats.pct === 100 ? "bar-fill-done" : ""}`} style={{ width: `${stats.pct}%` }} />
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          <div className="space-y-0.5 mb-5">
            <IconLink item={{ href: "/", label: "Overview", match: (p) => p === "/", icon: ICONS.home }} />
          </div>

          <p className="eyebrow px-3 mb-2.5">Your program</p>
          <div className="space-y-0.5 mb-5">
            {JOURNEY.map((mod, i) => {
              const href = `/module/${mod.slug}`;
              const active = pathname === href;
              const unlocked = role === "admin" || isModuleUnlocked(i, completed);
              if (!unlocked) {
                return (
                  <div key={mod.slug} className="flex items-center gap-3 px-3 py-2 select-none" title="Finish the module before this one to unlock">
                    <LockIcon />
                    <span className="text-[14px] text-[#403f3b] truncate">{mod.title}</span>
                  </div>
                );
              }
              const done = mod.steps.filter((s) => completed.has(s.id)).length;
              const total = mod.steps.length;
              const isComplete = total > 0 && done === total;
              const pct = total ? Math.round((done / total) * 100) : 0;
              return (
                <Link
                  key={mod.slug}
                  href={href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${active ? "bg-[var(--panel-hi)]" : "hover:bg-[var(--panel-2)]"}`}
                >
                  {isComplete ? <CheckCircle /> : <ProgressRing number={i + 1} pct={pct} />}
                  <div className="flex-1 min-w-0">
                    <p className={`text-[14px] leading-tight truncate ${active ? "text-white font-semibold" : "font-medium text-neutral-200"}`}>{mod.title}</p>
                    {!isComplete && done > 0 && <p className="text-[11px] text-[var(--muted)] mt-0.5 num">{done}/{total} steps</p>}
                  </div>
                  {active && <span className="w-1 h-4 rounded-full shrink-0" style={{ background: "var(--accent)", boxShadow: "0 0 10px var(--accent-glow)" }} />}
                </Link>
              );
            })}
          </div>

          <p className="eyebrow px-3 mb-2.5">Program</p>
          <div className="space-y-0.5">
            {clientTail.map((item) => (
              <IconLink key={item.href} item={item} />
            ))}
          </div>
        </nav>
      </>
    ) : (
      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        <p className="eyebrow px-3 mb-2.5">Manage</p>
        <div className="space-y-0.5">
          {ADMIN_NAV.map((item) => (
            <IconLink key={item.href} item={{ ...item, badge: item.href === "/admin/messages" ? unread : undefined }} />
          ))}
        </div>
      </nav>
    );

  const userMenu = (
    <div className="px-4 py-4 border-t border-[var(--border)]">
      <div className="relative" ref={menuRef}>
        {menuOpen && (
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-[var(--panel-2)] border border-[var(--border-hi)] rounded-xl overflow-hidden shadow-2xl rise-in">
            {role === "admin" && (
              <>
                <p className="eyebrow px-4 pt-3 pb-1.5">Switch view</p>
                {(["client", "admin"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => {
                      setMenuOpen(false);
                      router.push(v === "admin" ? "/admin" : "/");
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors hover:bg-[var(--panel-hi)] ${view === v ? "text-white" : "text-neutral-400"}`}
                  >
                    {v === "admin" ? "Admin" : "Creator view"}
                    {view === v && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
                <div className="border-t border-[var(--border)]" />
              </>
            )}
            <Link href="/account" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm text-neutral-400 hover:bg-[var(--panel-hi)] hover:text-white transition-colors">
              Account
            </Link>
            <button onClick={logout} className="w-full px-4 py-2.5 text-sm text-left text-neutral-400 hover:bg-[var(--panel-hi)] hover:text-white transition-colors">
              Log out
            </button>
          </div>
        )}
        <button onClick={() => setMenuOpen((v) => !v)} className="w-full flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-[var(--panel-2)] transition-colors">
          <span className="w-8 h-8 rounded-full bg-[var(--panel-hi)] border border-[var(--border)] flex items-center justify-center text-[11px] font-semibold shrink-0">
            {initials(name)}
          </span>
          <span className="flex-1 min-w-0 text-left">
            <span className="block text-sm font-medium truncate">{name || "Creator"}</span>
            <span className="block text-xs text-[var(--muted)]">{role === "admin" ? `Admin · ${view} view` : "Creator"}</span>
          </span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8d8b85" strokeWidth="2" strokeLinecap="round" className="shrink-0">
            <path d="M8 9l4-4 4 4M16 15l-4 4-4-4" />
          </svg>
        </button>
      </div>
    </div>
  );

  const sidebarInner = (
    <>
      <div className="px-6 pt-7 pb-6">
        <Link href={view === "admin" ? "/admin" : "/"} className="inline-block">
          <Logo size={28} name="Creator Partnership" />
        </Link>
        {view === "admin" && (
          <p className="eyebrow mt-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)", boxShadow: "0 0 8px var(--accent-glow)" }} />
            Admin
          </p>
        )}
      </div>
      {nav}
      {userMenu}
    </>
  );

  return (
    <div className="min-h-screen lg:flex">
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between h-14 px-4 bg-[#0d0d0c]/95 backdrop-blur border-b border-[var(--border)]">
        <button onClick={() => setDrawerOpen(true)} aria-label="Open menu" className="p-2 -ml-2 text-neutral-300 hover:text-white">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        </button>
        <Link href={view === "admin" ? "/admin" : "/"}>
          <Logo size={22} name="Creator Partnership" />
        </Link>
        {view === "client" ? <span className="text-xs font-semibold text-neutral-300 num">{stats.pct}%</span> : <span className="w-9" />}
      </header>

      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[290px] max-w-[85vw] bg-[#0d0d0c] border-r border-[var(--border)] flex flex-col overflow-y-auto drawer-in">
            <button onClick={() => setDrawerOpen(false)} aria-label="Close menu" className="absolute top-5 right-4 p-2 text-neutral-400 hover:text-white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
            {sidebarInner}
          </aside>
        </div>
      )}

      <aside className="hidden lg:flex w-[272px] shrink-0 bg-[#0d0d0c] border-r border-[var(--border)] flex-col fixed inset-y-0 z-10">
        {sidebarInner}
      </aside>

      <main className="flex-1 min-w-0 lg:ml-[272px] px-4 py-7 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}
