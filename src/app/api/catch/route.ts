import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "การส่งผลงานปลาต้องดำเนินผ่าน LINE Official Account เท่านั้น" },
    { status: 410 }
  );
}
