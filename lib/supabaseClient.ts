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
        set: allowWrite
          ? (name: string, value: string, options: CookieOptions) => {
              cookieStore.set({ name, value, ...options });
            }
          : (name: string, value: string, options: CookieOptions) => {
              void name; void value; void options;
            },
        remove: allowWrite
          ? (name: string, options: CookieOptions) => {
              cookieStore.set({ name, value: "", ...options });
            }
          : (name: string, options: CookieOptions) => {
              void name; void options;
            },
      },
    }
  );
}


