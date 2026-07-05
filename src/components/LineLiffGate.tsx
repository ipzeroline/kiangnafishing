"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    liff?: {
      init(input: { liffId: string }): Promise<void>;
      isInClient(): boolean;
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
      if (!window.liff.isInClient()) {
        setError("กรุณาเปิดเมนูนี้ผ่าน LINEเท่านั้น");
        return;
      }
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
        <main className="line-liff-loading">
          <div className="line-liff-card">
            <div className="line-liff-mark" aria-hidden="true">
              <span className="line-liff-ring" />
              <span className="line-liff-ring" />
              <div className="line-liff-fish">
                <svg viewBox="0 0 64 32">
                  <path d="M8 16c10-9 25-9 38 0-13 9-28 9-38 0Z" />
                  <path d="M46 16l11-8v16l-11-8Z" />
                  <circle cx="21" cy="14" r="2.1" />
                </svg>
              </div>
            </div>
            <div className="line-liff-copy">
              <p>Kiangna Fishing Lake</p>
              <h1>เคียงนา Fishing Lake</h1>
              <div className="line-liff-progress" aria-hidden="true"><span /></div>
              <p className={error ? "line-liff-error" : ""}>{error || "กำลังเชื่อมต่อ LINE..."}</p>
            </div>
          </div>
        </main>
      )}
      {ready && children}
    </>
  );
}
