import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { queryOne } from "@/lib/db";

export async function GET(req: Request) {
  const staff = await getSessionUser();
  if (!staff || (staff.role !== "STAFF" && staff.role !== "ADMIN")) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const memberCode = new URL(req.url).searchParams.get("memberCode") || "";
  const u = await queryOne<{ id: string }>("SELECT id FROM users WHERE memberCode=?", [memberCode.toUpperCase()]);
  return NextResponse.json({ userId: u?.id ?? null });
}
