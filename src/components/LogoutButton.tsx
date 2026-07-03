"use client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); router.push("/login"); router.refresh(); }}
      className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-deep ring-1 ring-line hover:bg-mist">
      ออกจากระบบ
    </button>
  );
}
