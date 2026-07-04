"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

type Result = { ok?: boolean; already?: boolean; message?: string; error?: string };

function ScanInner() {
  const params = useSearchParams();
  const auto = params.get("d"); // QR ที่สแกนด้วยกล้องมือถือจะเปิดหน้านี้พร้อม payload
  const [memberCode, setMemberCode] = useState("");
  const [pin, setPin] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const fired = useRef(false);

  async function checkin(body: Record<string, string>) {
    setLoading(true); setResult(null);
    const res = await fetch("/api/admin/checkin", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);
    setResult(data);
    if (navigator.vibrate) navigator.vibrate(res.ok ? 80 : [60, 60, 60]);
  }

  useEffect(() => {
    if (auto && !fired.current) { fired.current = true; checkin({ payload: auto }); }
  }, [auto]);

  return (
    <main className="admin-shell min-h-dvh bg-[#f5f8f7] text-ink">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-line bg-deep px-5 py-6 text-white lg:block">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/45">เคียงนา Fishing Lake</p>
          <h1 className="mt-2 font-display text-2xl font-semibold">Back Office</h1>
        </div>
        <nav className="space-y-1 text-sm">
          <Link href="/admin" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">Dashboard</Link>
          <Link href="/admin/scan" className="block rounded-lg bg-white/12 px-3 py-2.5 font-semibold text-white">รับสมาชิกเข้าบ่อ</Link>
          <Link href="/admin/members" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">สมาชิก</Link>
          <Link href="/admin/credits" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">เครดิต / แต้ม</Link>
          <Link href="/admin/fish-stockings" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">ตารางลงปลา</Link>
          <Link href="/admin/fish" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">ผลงานปลา</Link>
          <Link href="/admin/fish-species" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">ชนิดปลา</Link>
          <Link href="/admin/member-ranking" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">Ranking สมาชิก</Link>
          <Link href="/admin/ranking-levels" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">Level Ranking</Link>
          <Link href="/admin/events" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">Event</Link>
          <Link href="/admin/rewards" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">คูปอง / รางวัล</Link>
          <Link href="/admin/reports" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">รายงาน</Link>
          <Link href="/admin/employees" className="block rounded-lg px-3 py-2.5 text-white/72 hover:bg-white/10 hover:text-white">ผู้ใช้งานระบบ</Link>
        </nav>
      </aside>
      <section className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-line bg-[#f5f8f7]/90 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-dim">Front Gate</p>
              <h1 className="font-display text-2xl font-semibold text-deep">รับสมาชิกเข้าบ่อ</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/admin" className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-deep ring-1 ring-line">กลับ Dashboard</Link>
              <LogoutButton />
            </div>
          </div>
        </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8 xl:grid-cols-[minmax(0,1fr)_420px]">

        {result && (
          <div className={`rounded-card p-6 ${result.ok ? "bg-pond text-white" : "bg-buoy text-white"} xl:col-span-2`}>
            <p className="font-display text-xl font-semibold">{result.message || result.error}</p>
          </div>
        )}
        {loading && <p className="rounded-card bg-white p-4 text-sm text-dim ring-1 ring-line xl:col-span-2">กำลังตรวจสอบ…</p>}

        <section className="rounded-card bg-white p-6 shadow-sm ring-1 ring-line">
          <h2 className="font-display text-xl font-semibold text-deep">สแกน QR</h2>
          <p className="mt-2 text-sm leading-relaxed text-dim">
            เปิดกล้องมือถือ (หรือแอปสแกน) ส่องที่ QR ของสมาชิก ระบบจะเปิดหน้านี้และตัดเงินให้อัตโนมัติ
          </p>
        </section>

        <section className="rounded-card bg-white p-6 shadow-sm ring-1 ring-line">
          <h2 className="font-display text-xl font-semibold text-deep">พิมพ์รหัสสำรอง</h2>
          <p className="mt-2 text-sm text-dim">ใช้รหัส 6 หลักใต้ QR ของสมาชิก</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <input value={memberCode} onChange={(e) => setMemberCode(e.target.value.toUpperCase())}
              placeholder="รหัสสมาชิก เช่น FP0001"
              className="w-full rounded-lg border border-line px-3 py-3 font-mono text-sm outline-none focus:border-pond" />
            <input value={pin} onChange={(e) => setPin(e.target.value.toUpperCase())}
              placeholder="รหัส 6 หลัก" maxLength={6}
              className="w-full rounded-lg border border-line px-3 py-3 font-mono text-sm tracking-widest outline-none focus:border-pond" />
          </div>
          <button disabled={loading || !memberCode}
            onClick={async () => {
              // แปลงรหัสสมาชิก + PIN → payload โดยให้เซิร์ฟเวอร์ตรวจ (ใช้ memberCode ตรงๆ กรณีเร่งด่วน)
              if (pin.length === 6) {
                const res = await fetch(`/api/admin/resolve?memberCode=${memberCode}`);
                const d = await res.json();
                if (d.userId) return checkin({ payload: `${d.userId}.${pin}` });
              }
              checkin({ memberCode });
            }}
            className="mt-4 w-full rounded-lg bg-deep py-3 font-semibold text-white transition active:scale-[.98] disabled:opacity-40">
            {pin.length === 6 ? "ตรวจรหัสและเช็คอิน" : "เช็คอินด้วยรหัสสมาชิก (โหมดเร่งด่วน)"}
          </button>
        </section>
      </div>
      </section>
    </main>
  );
}

export default function ScanPage() {
  return <Suspense><ScanInner /></Suspense>;
}
