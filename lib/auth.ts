import { redirect } from "next/navigation";
import { createClientServer } from "@/lib/supabaseClient";

export async function getSessionUserOrNull() {
  const supabase = createClientServer({ allowCookieWrite: false });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
}

export async function requireUser() {
  const user = await getSessionUserOrNull();
  if (!user) redirect("/login");
  return user;
}


