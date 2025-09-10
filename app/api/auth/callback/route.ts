import { NextResponse } from "next/server";
import { createClientServer } from "@/lib/supabaseClient";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  if (!token_hash || !type) return NextResponse.redirect(new URL("/login?error=Invalid%20auth%20callback", request.url));

  // allow cookie writes in route handler
  const supabase = createClientServer({ allowCookieWrite: true });
  const { error } = await supabase.auth.verifyOtp({ type: type as "email" | "magiclink" | "recovery" | "invite" | "signup" | "email_change", token_hash });
  if (error) return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url));
  return NextResponse.redirect(new URL("/dashboard", request.url));
}


