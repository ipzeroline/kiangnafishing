"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "เข้าสู่ระบบไม่สำเร็จ");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="grid min-h-dvh bg-[#f5f8f7] lg:grid-cols-[minmax(0,1fr)_480px]">
      <section className="hidden bg-deep p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/45">เคียงนา Fishing Lake</p>
          <h1 className="mt-4 max-w-xl font-display text-5xl font-semibold leading-tight">Back Office</h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/70">ระบบจัดการหลังบ้านสำหรับผู้ได้รับอนุญาตเท่านั้น</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/8 p-5 text-sm text-white/70">
          การใช้งานทุกครั้งอยู่ภายใต้นโยบายความปลอดภัยและการตรวจสอบย้อนหลังของระบบ
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md rounded-card bg-white p-6 shadow-sm ring-1 ring-line">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-dim">Authorized access</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-deep">เข้าสู่ระบบหลังบ้าน</h2>
            <p className="mt-1 text-sm text-dim">กรอก username และ password ของผู้ใช้งานระบบ</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ink">Username</span>
              <input value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())}
                autoComplete="username" required
                className="w-full rounded-lg border border-line bg-white px-4 py-3 font-mono outline-none focus:border-pond focus:ring-2 focus:ring-pond/20" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ink">Password</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password" required
                className="w-full rounded-lg border border-line bg-white px-4 py-3 outline-none focus:border-pond focus:ring-2 focus:ring-pond/20" />
            </label>
            {error && <p className="rounded-lg bg-buoy/10 px-3 py-2 text-sm font-medium text-buoy">{error}</p>}
            <button disabled={loading}
              className="w-full rounded-lg bg-pond py-3.5 text-base font-semibold text-white shadow-sm shadow-pond/20 transition active:scale-[.98] disabled:opacity-60">
              {loading ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
