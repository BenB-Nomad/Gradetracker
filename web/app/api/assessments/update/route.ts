import { NextResponse } from "next/server";
import { getClient } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function POST(req: Request) {
  await requireUser();
  const supabase = getClient();
  const body = await req.json().catch(() => ({}));
  const id = String(body.id || "");
  const mark = Number(body.mark ?? NaN);
  if (!id || Number.isNaN(mark)) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  const { error } = await supabase.from("assessments").update({ mark, status: "entered" }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}


