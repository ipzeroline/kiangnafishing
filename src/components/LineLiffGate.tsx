"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    liff?: {
      init(input: { liffId: string }): Promise<void>;
      isLoggedIn(): boolean;
      login(input?: { redirectUri?: string }): void;
      getProfile(): Promise<{ userId: string; displayName: string; pictureUrl?: string }>;
      getIDToken(): string | null;
    };
  }
}

export default function LineLiffGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  async function boot() {
    try {
      const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
      if (!liffId) {
        setError("ยังไม่ได้ตั้งค่า NEXT_PUBLIC_LIFF_ID");
        return;
      }
      if (!window.liff) return;
      await window.liff.init({ liffId });
      if (!window.liff.isLoggedIn()) {
        window.liff.login({ redirectUri: window.location.href });
        return;
      }
      const profile = await window.liff.getProfile();
      const idToken = window.liff.getIDToken();
      const res = await fetch("/api/line/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...profile, idToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "เชื่อมต่อ LINE ไม่สำเร็จ");
        return;
      }
      setReady(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "LINE LIFF error");
    }
  }

  useEffect(() => {
    if (window.liff) void boot();
  }, []);

  return (
    <>
      <Script src="https://static.line-scdn.net/liff/edge/2/sdk.js" strategy="afterInteractive" onLoad={() => void boot()} />
      {!ready && (
        <main className="grid min-h-dvh place-items-center bg-[#f5f8f7] px-4 text-center">
          <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-line">
            <h1 className="font-display text-2xl font-semibold text-deep">เคียงนา Fishing Lake</h1>
            <p className="mt-2 text-sm text-dim">{error || "กำลังเชื่อมต่อ LINE..."}</p>
          </div>
        </main>
      )}
      {ready && children}
    </>
  );
}
