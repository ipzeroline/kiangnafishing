"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

function useAct(url: string) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return {
    busy,
    act: async (body: Record<string, string>) => {
      setBusy(true);
      await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      setBusy(false);
      router.refresh();
    },
  };
}

export function TopupActions({ id }: { id: string }) {
  const { busy, act } = useAct("/api/admin/topup");
  return (
    <div className="flex gap-2">
      <button disabled={busy} onClick={() => act({ topupId: id, action: "approve" })}
        className="rounded-lg bg-pond px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">อนุมัติ</button>
      <button disabled={busy} onClick={() => act({ topupId: id, action: "reject" })}
        className="rounded-lg bg-buoy/10 px-3 py-1.5 text-xs font-semibold text-buoy disabled:opacity-50">ปฏิเสธ</button>
    </div>
  );
}

export function FishActions({ id }: { id: string }) {
  const { busy, act } = useAct("/api/admin/fish");
  return (
    <div className="flex gap-2">
      <button disabled={busy} onClick={() => act({ catchId: id, action: "approve" })}
        className="rounded-lg bg-pond px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">ยืนยัน</button>
      <button disabled={busy} onClick={() => act({ catchId: id, action: "reject" })}
        className="rounded-lg bg-buoy/10 px-3 py-1.5 text-xs font-semibold text-buoy disabled:opacity-50">ไม่ผ่าน</button>
    </div>
  );
}
