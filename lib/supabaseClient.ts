import { createBrowserClient, createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClientBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export function createClientServer(opts?: { allowCookieWrite?: boolean }) {
  const cookieStore = cookies();
  const allowWrite = opts?.allowCookieWrite === true;
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          if (!allowWrite) return; // Only allowed in Server Actions/Route Handlers
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          if (!allowWrite) return;
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );
}


