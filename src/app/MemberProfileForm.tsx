"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MemberProfileForm({ name, alias, pictureUrl }: { name: string; alias: string; pictureUrl: string }) {
  const router = useRouter();
  const [form, setForm] = useState({ name, alias });
  const [pictureData, setPictureData] = useState("");
  const [previewUrl, setPreviewUrl] = useState(pictureUrl);
  const [clearPicture, setClearPicture] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const displayName = form.alias || form.name || "สมาชิก";
  const canPreview = previewUrl.trim().startsWith("http://") || previewUrl.trim().startsWith("https://") || previewUrl.trim().startsWith("data:image/");

  function choosePicture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("กรุณาเลือกรูปภาพเท่านั้น");
      return;
    }
    if (file.size > 2_500_000) {
      setMessage("รูปโปรไฟล์ต้องไม่เกิน 2.5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      setPictureData(dataUrl);
      setPreviewUrl(dataUrl);
      setClearPicture(false);
      setMessage("");
    };
    reader.readAsDataURL(file);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const res = await fetch("/api/member/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, pictureData, clearPicture }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setMessage(data.error || "บันทึกไม่สำเร็จ");
      return;
    }
    setMessage("บันทึกข้อมูลแล้ว");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="rounded-card bg-white p-4 shadow-sm ring-1 ring-line sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex items-center gap-3 sm:w-48 sm:flex-col sm:items-start">
          {canPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt={displayName} className="h-20 w-20 shrink-0 rounded-2xl object-cover ring-1 ring-line" />
          ) : (
            <span className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-deep text-2xl font-bold text-white">{displayName.slice(0, 1)}</span>
          )}
          <div className="min-w-0">
            <h2 className="font-display text-lg font-semibold text-deep">แก้ไขข้อมูล</h2>
            <p className="mt-1 text-sm leading-relaxed text-dim">ใช้แสดงในระบบสมาชิกและกระดานอันดับ</p>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ink">ชื่อแสดง</span>
              <input value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
                className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-pond focus:ring-2 focus:ring-pond/15" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ink">นามแฝง</span>
              <input value={form.alias} onChange={(e) => setForm((current) => ({ ...current, alias: e.target.value }))}
                placeholder="เช่น มือปลาช่อน"
                className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-pond focus:ring-2 focus:ring-pond/15" />
            </label>
          </div>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-semibold text-deep hover:border-pond hover:text-pond">
              อัปโหลดรูปโปรไฟล์
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={choosePicture} className="sr-only" />
            </label>
            <button
              type="button"
              onClick={() => {
                setPictureData("");
                setPreviewUrl("");
                setClearPicture(true);
              }}
              className="rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-dim hover:border-buoy hover:text-buoy"
            >
              ลบรูป
            </button>
          </div>
          {message && <p className="mt-3 rounded-lg bg-mist px-3 py-2 text-sm text-deep">{message}</p>}
          <button disabled={busy} className="mt-4 w-full rounded-lg bg-pond px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50 sm:w-auto">
            {busy ? "กำลังบันทึก..." : "บันทึกข้อมูลสมาชิก"}
          </button>
        </div>
      </div>
    </form>
  );
}
