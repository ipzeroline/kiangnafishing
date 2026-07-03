"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "ข้อมูลสมาชิก", icon: "⌂" },
  { href: "/wallet", label: "รายละเอียด", icon: "฿" },
  { href: "/entry", label: "LINE เมนู", icon: "▣", center: true },
  { href: "/ranking", label: "อันดับ", icon: "▦" },
  { href: "/catch", label: "ผลงานปลา", icon: "▤" },
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <nav className="member-nav">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-line bg-deep px-5 py-6 text-white md:block">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/45">เคียงนา Fishing Lake</p>
          <h2 className="mt-2 font-display text-2xl font-semibold">ข้อมูลสมาชิก</h2>
        </div>
        <div className="space-y-1 text-sm">
          {items.map((it) => {
            const active = path === it.href;
            return (
              <Link key={it.href} href={it.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition
                  ${active ? "bg-white/12 text-white" : "text-white/72 hover:bg-white/10 hover:text-white"}`}>
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white/10 text-sm">{it.icon}</span>
                {it.label}
              </Link>
            );
          })}
        </div>
      </aside>
      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 items-end border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-lg shadow-deep/10 backdrop-blur md:hidden">
        {items.map((it) => {
          const active = path === it.href;
          if (it.center) {
            return (
              <Link key={it.href} href={it.href} aria-label={it.label}
                className="flex -translate-y-4 flex-col items-center">
                <span className={`flex h-14 w-14 items-center justify-center rounded-full text-xl shadow-lg shadow-deep/30 ring-4 ring-surface transition
                  ${active ? "bg-buoy" : "bg-pond"} text-white`}>
                  {it.icon}
                </span>
                <span className={`mt-1 text-[11px] font-semibold ${active ? "text-buoy" : "text-pond"}`}>{it.label}</span>
              </Link>
            );
          }
          return (
            <Link key={it.href} href={it.href}
              className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition
                ${active ? "text-pond" : "text-dim"}`}>
              <span className="text-base leading-none">{it.icon}</span>
              {it.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
