import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { currentEntryCode } from "@/lib/token";

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "MEMBER") return NextResponse.json({ error: "ต้องเปิดผ่าน LINE" }, { status: 401 });
  const { code, msLeft } = currentEntryCode(user.id);
  return NextResponse.json({
    ok: true,
    payload: `${user.id}.${code}`,
    pin: code,
    msLeft,
    memberCode: user.memberCode,
    name: user.alias || user.name,
  });
}
