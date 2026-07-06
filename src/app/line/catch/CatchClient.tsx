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
      <main className="min-h-dvh bg-[#f5f8f7] px-3 py-3">
        <div className="mx-auto flex min-h-[calc(100dvh-1.5rem)] max-w-md flex-col gap-3">
          <section className="rounded-2xl bg-deep p-4 text-white shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/55">LINE Catch</p>
                <h1 className="mt-1 font-display text-2xl font-semibold">ส่งผลงานปลา</h1>
                <p className="mt-1 text-xs text-white/65">รูป 1 ใบ · น้ำหนัก · ชนิดปลา</p>
              </div>
              <div className="flex shrink-0 flex-col gap-1.5">
                <a href="/line/profile" className="rounded-full bg-white px-3 py-1.5 text-center text-xs font-semibold text-deep">
                  บัญชี
                </a>
                <a href="/catch" className="rounded-full bg-white/12 px-3 py-1.5 text-center text-xs font-semibold text-white">
                  อัลบั้ม
                </a>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] font-semibold text-white/65">
              <span className="rounded-xl bg-white/10 px-2 py-2">ถ่ายรูป</span>
              <span className="rounded-xl bg-white/10 px-2 py-2">กรอกน้ำหนัก</span>
              <span className="rounded-xl bg-white/10 px-2 py-2">รอตรวจ</span>
            </div>
          </section>

          <form onSubmit={submit} className="flex flex-1 flex-col rounded-2xl bg-white p-4 shadow-sm ring-1 ring-line">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-pond">ข้อมูลผลงาน</p>
                <h2 className="mt-1 font-display text-xl font-semibold text-deep">รายการใหม่</h2>
              </div>
              <p className="rounded-full bg-mist px-3 py-1.5 text-xs font-semibold text-dim">{form.caption.length}/180</p>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-dim">ชนิดปลา</span>
              <select value={form.species} onChange={(e) => setForm((v) => ({ ...v, species: e.target.value }))}
                  className="h-12 w-full rounded-xl border border-line bg-white px-3 text-sm font-semibold text-deep outline-none focus:border-pond">
                {species.map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-dim">น้ำหนัก (กก.)</span>
              <input type="number" step="0.01" min="0" value={form.weightKg} onChange={(e) => setForm((v) => ({ ...v, weightKg: e.target.value }))}
                  className="h-12 w-full rounded-xl border border-line px-3 text-sm font-semibold text-deep outline-none focus:border-pond" />
            </label>
            </div>

            <label className="mt-3 block">
              <span className="mb-1 block text-xs font-semibold text-dim">รูปภาพผลงานปลา</span>
              <input type="file" accept="image/*" disabled={busy || processingImage} onChange={(e) => readImage(e.target.files?.[0])}
                className="w-full rounded-xl border border-line px-3 py-3 text-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-mist file:px-3 file:py-2 file:font-semibold file:text-deep focus:border-pond" />
              {form.imageData && (
                <div className="mt-3 overflow-hidden rounded-xl bg-mist ring-1 ring-line" style={{ aspectRatio: "4 / 3" }}>
                  {/* Preview is the exact normalized image that will be uploaded. */}
                  <img src={form.imageData} alt="ตัวอย่างรูปผลงานปลา" className="h-full w-full object-cover" />
                </div>
              )}
              {processingImage
                ? <span className="mt-2 block text-xs font-medium text-pond">กำลังปรับรูปภาพให้เป็นขนาดมาตรฐาน...</span>
                : form.imageData
                  ? <span className="mt-2 block text-xs font-medium text-pond">ปรับรูปเป็น 4:3 แล้ว พร้อมส่งตรวจ</span>
                  : <span className="mt-2 block text-xs text-dim">เลือก 1 รูปจากอัลบั้ม หรือถ่ายใหม่ ระบบจะจัดภาพให้เท่ากันอัตโนมัติ</span>}
            </label>

            <label className="mt-3 block">
              <span className="mb-1 block text-xs font-semibold text-dim">แคปชั่น</span>
              <input value={form.caption} onChange={(e) => setForm((v) => ({ ...v, caption: e.target.value }))}
                maxLength={180}
                placeholder="เช่น ตัวนี้ลากคันแทบหลุดมือ"
                className="h-12 w-full rounded-xl border border-line px-3 text-sm outline-none focus:border-pond" />
            </label>

            <div className="mt-3 rounded-xl bg-mist p-3 text-xs leading-relaxed text-dim">
              เจ้าหน้าที่จะตรวจสอบรูปภาพและน้ำหนักก่อนยืนยันเข้าสู่กระดานอันดับ
            </div>
            {message && <p className="mt-3 rounded-xl bg-mist px-3 py-2 text-xs leading-relaxed text-deep">{message}</p>}
            <button disabled={busy || processingImage || !form.species || !form.weightKg || !form.imageData} className="mt-auto w-full rounded-xl bg-pond py-3.5 font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50">
            {busy ? "กำลังส่ง..." : processingImage ? "กำลังปรับรูป..." : "ส่งผลงานปลา"}
          </button>
            <a href="/catch" className="mt-3 block rounded-xl bg-mist px-3 py-2.5 text-center text-sm font-semibold text-pond">ดูอัลบั้มของฉัน</a>
          </form>
        </div>
      </main>
    </LineLiffGate>
  );
}
