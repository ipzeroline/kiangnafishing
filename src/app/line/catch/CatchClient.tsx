"use client";

import { useState } from "react";
import LineLiffGate from "@/components/LineLiffGate";

const CATCH_IMAGE_WIDTH = 1600;
const CATCH_IMAGE_HEIGHT = 1200;
const CATCH_IMAGE_QUALITY = 0.86;

function normalizeCatchImage(file: File) {
  return new Promise<string>((resolve, reject) => {
    const imageUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(imageUrl);
      const canvas = document.createElement("canvas");
      canvas.width = CATCH_IMAGE_WIDTH;
      canvas.height = CATCH_IMAGE_HEIGHT;
      const context = canvas.getContext("2d");

      if (!context) {
        reject(new Error("canvas unavailable"));
        return;
      }

      context.fillStyle = "#f4f7f5";
      context.fillRect(0, 0, CATCH_IMAGE_WIDTH, CATCH_IMAGE_HEIGHT);

      const scale = Math.max(CATCH_IMAGE_WIDTH / image.width, CATCH_IMAGE_HEIGHT / image.height);
      const drawWidth = image.width * scale;
      const drawHeight = image.height * scale;
      const drawX = (CATCH_IMAGE_WIDTH - drawWidth) / 2;
      const drawY = (CATCH_IMAGE_HEIGHT - drawHeight) / 2;

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
      resolve(canvas.toDataURL("image/jpeg", CATCH_IMAGE_QUALITY));
    };

    image.onerror = () => {
      URL.revokeObjectURL(imageUrl);
      reject(new Error("image load failed"));
    };

    image.src = imageUrl;
  });
}

export default function CatchClient({ species }: { species: string[] }) {
  const [form, setForm] = useState({ species: species[0] || "", weightKg: "", caption: "", imageData: "" });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);

  async function readImage(file: File | undefined) {
    if (!file) {
      setForm((value) => ({ ...value, imageData: "" }));
      return;
    }
    setMessage("");
    if (!file.type.startsWith("image/")) {
      setMessage("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      return;
    }
    if (file.size > 7 * 1024 * 1024) {
      setMessage("ขนาดรูปภาพต้องไม่เกิน 7MB");
      return;
    }
    setProcessingImage(true);
    try {
      const normalizedImage = await normalizeCatchImage(file);
      setForm((value) => ({ ...value, imageData: normalizedImage }));
      setMessage("จัดรูปภาพเป็นสัดส่วน 4:3 เรียบร้อยแล้ว");
    } catch {
      setMessage("ปรับรูปภาพไม่สำเร็จ กรุณาเลือกรูปใหม่");
    } finally {
      setProcessingImage(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const res = await fetch("/api/line/catch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setMessage(data.error || "ส่งผลงานปลาไม่สำเร็จ");
      return;
    }
    setForm({ species: species[0] || "", weightKg: "", caption: "", imageData: "" });
    setMessage("ส่งผลงานปลาเรียบร้อยแล้ว กรุณารอเจ้าหน้าที่ตรวจสอบ");
  }

  return (
    <LineLiffGate>
      <main className="min-h-dvh bg-[#f5f8f7] px-4 py-6">
        <form onSubmit={submit} className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-sm ring-1 ring-line">
          <p className="text-xs font-semibold uppercase tracking-widest text-dim">LINE Catch</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-deep">ส่งผลงานปลา</h1>
          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ink">ชนิดปลา</span>
              <select value={form.species} onChange={(e) => setForm((v) => ({ ...v, species: e.target.value }))}
                className="w-full rounded-lg border border-line px-3 py-3 outline-none focus:border-pond">
                {species.map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ink">น้ำหนัก (กก.)</span>
              <input type="number" step="0.01" min="0" value={form.weightKg} onChange={(e) => setForm((v) => ({ ...v, weightKg: e.target.value }))}
                className="w-full rounded-lg border border-line px-3 py-3 outline-none focus:border-pond" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ink">รูปภาพผลงานปลา</span>
              <input type="file" accept="image/*" disabled={busy || processingImage} onChange={(e) => readImage(e.target.files?.[0])}
                className="w-full rounded-lg border border-line px-3 py-3 text-sm outline-none file:mr-3 file:rounded-md file:border-0 file:bg-mist file:px-3 file:py-2 file:font-semibold file:text-deep focus:border-pond" />
              {form.imageData && (
                <div className="mt-3 overflow-hidden rounded-lg bg-mist ring-1 ring-line" style={{ aspectRatio: "4 / 3" }}>
                  {/* Preview is the exact normalized image that will be uploaded. */}
                  <img src={form.imageData} alt="ตัวอย่างรูปผลงานปลา" className="h-full w-full object-cover" />
                </div>
              )}
              {processingImage
                ? <span className="mt-2 block text-xs font-medium text-pond">กำลังปรับรูปภาพให้เป็นขนาดมาตรฐาน...</span>
                : form.imageData
                  ? <span className="mt-2 block text-xs font-medium text-pond">ระบบปรับรูปเป็น 4:3 ขนาด 1600x1200 แล้ว พร้อมบันทึกเข้า Cloudinary</span>
                  : <span className="mt-2 block text-xs text-dim">เลือกได้ 1 รูปจากอัลบั้ม หรือถ่ายใหม่จากตัวเลือกของเครื่อง ระบบจะจัดภาพให้เท่ากันอัตโนมัติ</span>}
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ink">แคปชั่นโดนๆ</span>
              <input value={form.caption} onChange={(e) => setForm((v) => ({ ...v, caption: e.target.value }))}
                maxLength={180}
                placeholder="เช่น ตัวนี้ลากคันแทบหลุดมือ"
                className="w-full rounded-lg border border-line px-3 py-3 outline-none focus:border-pond" />
              <span className="mt-1 block text-xs text-dim">{form.caption.length}/180 ตัวอักษร</span>
            </label>
          </div>
          <p className="mt-4 text-sm text-dim">หลังส่งรายการแล้ว เจ้าหน้าที่จะตรวจสอบรูปภาพและน้ำหนักก่อนยืนยันเข้าสู่กระดานอันดับ</p>
          {message && <p className="mt-4 rounded-lg bg-mist px-3 py-2 text-sm text-deep">{message}</p>}
          <button disabled={busy || processingImage || !form.species || !form.weightKg} className="mt-5 w-full rounded-lg bg-pond py-3 font-semibold text-white disabled:opacity-50">
            {busy ? "กำลังส่ง..." : processingImage ? "กำลังปรับรูป..." : "ส่งผลงานปลา"}
          </button>
          <a href="/catch" className="mt-3 block text-center text-sm font-semibold text-pond">ดูอัลบั้มของฉัน</a>
        </form>
      </main>
    </LineLiffGate>
  );
}
