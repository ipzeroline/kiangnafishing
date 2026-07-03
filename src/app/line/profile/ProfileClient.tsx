"use client";

import { useEffect } from "react";
import LineLiffGate from "@/components/LineLiffGate";

export default function ProfileClient() {
  useEffect(() => {
    const id = window.setTimeout(() => {
      window.location.href = "/member";
    }, 800);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <LineLiffGate>
      <main className="grid min-h-dvh place-items-center bg-[#f5f8f7] px-4 text-center">
        <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-line">
          <h1 className="font-display text-2xl font-semibold text-deep">กำลังเปิดโปรไฟล์สมาชิก</h1>
          <p className="mt-2 text-sm text-dim">ระบบเชื่อม LINE แล้ว จะพาไปหน้าโปรไฟล์อัตโนมัติ</p>
        </div>
      </main>
    </LineLiffGate>
  );
}
