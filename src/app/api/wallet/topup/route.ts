import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "การเติมเงินต้องทำผ่าน LINE Official Account เท่านั้น" },
    { status: 410 }
  );
}
