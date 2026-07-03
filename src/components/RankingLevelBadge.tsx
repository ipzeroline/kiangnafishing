import type { RankingLevel } from "@/lib/db";

type Size = "sm" | "md" | "lg";

const sizeClass: Record<Size, { wrap: string; emblem: string; icon: string; level: string; name: string }> = {
  sm: { wrap: "gap-2 rounded-lg px-2 py-1.5", emblem: "h-7 w-7", icon: "h-6 w-6", level: "text-[9px]", name: "text-[10px]" },
  md: { wrap: "gap-2.5 rounded-lg px-3 py-2", emblem: "h-9 w-9", icon: "h-8 w-8", level: "text-[10px]", name: "text-xs" },
  lg: { wrap: "gap-3 rounded-lg px-4 py-3", emblem: "h-12 w-12", icon: "h-11 w-11", level: "text-xs", name: "text-sm" },
};

const palette = {
  deep: "#0a3540",
  pond: "#135a66",
  buoy: "#e8562a",
  gold: "#c9a227",
  bronze: "#b0764a",
  silver: "#94a3ad",
  ink: "#10333b",
};

export default function RankingLevelBadge({ level, size = "sm" }: { level: RankingLevel; size?: Size }) {
  const cls = sizeClass[size];
  return (
    <span
      className={`relative inline-flex items-center ${cls.wrap} overflow-hidden font-semibold text-deep`}
      style={{
        background: "linear-gradient(135deg, #ffffff 0%, #f7faf9 54%, #eef5f2 100%)",
        border: "1px solid rgba(16,51,59,.12)",
        boxShadow: `0 10px 24px rgba(10,53,64,.12), 0 0 0 1px ${level.color}26 inset`,
      }}
      title={`Level ${level.levelNo}: ${level.name}`}
    >
      <span className="absolute inset-x-0 bottom-0 h-1" style={{ backgroundColor: level.color }} />
      <span className="absolute inset-y-0 left-0 w-10 opacity-12" style={{ backgroundColor: level.color }} />
      <span
        className={`relative grid shrink-0 place-items-center rounded-lg ${cls.emblem}`}
        style={{
          background: `radial-gradient(circle at 35% 28%, #ffffff 0%, #ffffff 28%, ${level.color}20 64%, ${level.color}38 100%)`,
          boxShadow: `0 0 0 1px ${level.color}55 inset, 0 6px 14px ${level.color}24`,
        }}
      >
        <LevelIcon symbol={level.symbol} levelNo={level.levelNo} className={cls.icon} />
      </span>
      <span className="relative min-w-0 leading-tight">
        <span className={`block font-black uppercase tracking-wide ${cls.level}`} style={{ color: level.color }}>LEVEL {level.levelNo}</span>
        <span className={`block truncate font-bold text-deep ${cls.name}`}>{level.name}</span>
      </span>
    </span>
  );
}

function LevelIcon({ symbol, levelNo, className }: { symbol: string; levelNo: number; className: string }) {
  const key = symbol.toLowerCase();
  if (key.includes("มงกุฎ") || key.includes("hall")) return <CrownFishIcon className={className} />;
  if (key.includes("ถ้วยทองแดง")) return <TrophyIcon className={className} tone="bronze" />;
  if (key.includes("ถ้วย")) return <TrophyIcon className={className} tone="gold" />;
  if (key.includes("ปลาเงิน")) return <FishMedalIcon className={className} tone="silver" />;
  if (key.includes("ปลาใหญ่")) return <FishMedalIcon className={className} tone="gold" />;
  if (key.includes("คันเบ็ด")) return <RodIcon className={className} />;
  if (key.includes("ทุ่น")) return <FloatIcon className={className} />;
  if (key.includes("ตะขอ")) return <HookIcon className={className} />;
  if (levelNo >= 6) return <TrophyIcon className={className} tone="gold" />;
  if (levelNo >= 5) return <TrophyIcon className={className} tone="bronze" />;
  if (levelNo >= 4) return <FishMedalIcon className={className} tone="silver" />;
  if (levelNo >= 3) return <RodIcon className={className} />;
  if (levelNo >= 2) return <FloatIcon className={className} />;
  return <HookIcon className={className} />;
}

function SvgShell({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 64 64" className={`${className} drop-shadow-sm`} aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="white" />
      <circle cx="32" cy="32" r="29" fill="none" stroke="rgba(16,51,59,.18)" strokeWidth="2" />
      <circle cx="32" cy="32" r="22" fill="#edf3f1" />
      {children}
    </svg>
  );
}

function HookIcon({ className }: { className: string }) {
  return (
    <SvgShell className={className}>
      <path d="M35 11v26c0 7-5 13-12 13s-12-6-12-13c0-4 2-8 5-10" fill="none" stroke={palette.pond} strokeWidth="5" strokeLinecap="round" />
      <path d="M35 11c7 3 11 8 12 15" fill="none" stroke={palette.buoy} strokeWidth="5" strokeLinecap="round" />
      <circle cx="35" cy="11" r="4" fill={palette.gold} />
      <path d="M18 28l-5-1 2 6" fill="none" stroke={palette.deep} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </SvgShell>
  );
}

function FloatIcon({ className }: { className: string }) {
  return (
    <SvgShell className={className}>
      <path d="M32 9c8 8 11 15 11 24 0 11-5 18-11 18s-11-7-11-18c0-9 3-16 11-24Z" fill={palette.pond} />
      <path d="M22 32h20" stroke={palette.buoy} strokeWidth="7" strokeLinecap="round" />
      <path d="M26 48h12" stroke={palette.gold} strokeWidth="4" strokeLinecap="round" />
      <path d="M30 16c-2 6-3 10-3 15" stroke="rgba(255,255,255,.45)" strokeWidth="3" strokeLinecap="round" />
    </SvgShell>
  );
}

function RodIcon({ className }: { className: string }) {
  return (
    <SvgShell className={className}>
      <path d="M16 49C26 34 37 23 51 14" fill="none" stroke={palette.deep} strokeWidth="5" strokeLinecap="round" />
      <path d="M41 19c9 7 10 16 4 26" fill="none" stroke={palette.pond} strokeWidth="3" strokeLinecap="round" />
      <path d="M45 45c0 4-3 7-7 7s-7-3-7-7" fill="none" stroke={palette.buoy} strokeWidth="3" strokeLinecap="round" />
      <circle cx="18" cy="48" r="5" fill={palette.gold} />
      <circle cx="51" cy="14" r="3" fill={palette.buoy} />
    </SvgShell>
  );
}

function FishMedalIcon({ className, tone }: { className: string; tone: "silver" | "gold" }) {
  const body = tone === "gold" ? palette.gold : palette.silver;
  return (
    <SvgShell className={className}>
      <path d="M13 34c8-11 20-13 33-5l6-5v20l-6-5c-13 8-25 6-33-5Z" fill={body} />
      <path d="M44 29l8-5v20l-8-5Z" fill={palette.pond} opacity=".92" />
      <circle cx="26" cy="32" r="3" fill={palette.deep} />
      <path d="M35 45l5 9 5-9" fill="none" stroke={palette.buoy} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M36 14h8l-4 8Z" fill={palette.buoy} />
    </SvgShell>
  );
}

function TrophyIcon({ className, tone }: { className: string; tone: "bronze" | "gold" }) {
  const cup = tone === "gold" ? palette.gold : palette.bronze;
  return (
    <SvgShell className={className}>
      <path d="M22 14h20v13c0 8-4 14-10 14s-10-6-10-14V14Z" fill={cup} />
      <path d="M22 18H12v6c0 7 5 12 12 12M42 18h10v6c0 7-5 12-12 12" fill="none" stroke={cup} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M32 41v8M22 53h20" stroke={palette.deep} strokeWidth="5" strokeLinecap="round" />
      <path d="M28 27h8" stroke="white" strokeWidth="5" strokeLinecap="round" />
      <path d="M26 17h12" stroke="rgba(255,255,255,.45)" strokeWidth="3" strokeLinecap="round" />
    </SvgShell>
  );
}

function CrownFishIcon({ className }: { className: string }) {
  return (
    <SvgShell className={className}>
      <path d="M16 35c8-10 20-11 31-4l5-4v16l-5-4c-11 7-23 6-31-4Z" fill={palette.gold} />
      <path d="M47 31l5-4v16l-5-4Z" fill={palette.buoy} />
      <circle cx="27" cy="34" r="2.6" fill={palette.deep} />
      <path d="M20 22l6 5 6-9 6 9 6-5v11H20V22Z" fill={palette.buoy} />
      <path d="M24 52h16" stroke={palette.deep} strokeWidth="4" strokeLinecap="round" />
      <circle cx="32" cy="18" r="3" fill={palette.gold} />
    </SvgShell>
  );
}
