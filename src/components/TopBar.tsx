"use client";
import { useRouter } from "next/navigation";

export default function TopBar({ title, back }: { title: string; back?: boolean }) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-[#f5f8f7]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
      {back && (
        <button onClick={() => router.back()} aria-label="ย้อนกลับ"
          className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-deep ring-1 ring-line hover:bg-mist">←</button>
      )}
        <h1 className="font-display text-2xl font-semibold text-deep">{title}</h1>
      </div>
    </header>
  );
}
