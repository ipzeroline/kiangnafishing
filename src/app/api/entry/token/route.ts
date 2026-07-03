import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { error: "QR เข้าบ่อต้องสร้างผ่าน LINE เท่านั้น" },
    { status: 410 }
  );
}
