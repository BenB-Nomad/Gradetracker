import Link from "next/link";
import { getSessionUserOrNull } from "@/lib/auth";

export async function SiteHeader() {
  const user = await getSessionUserOrNull();
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-screen-xl px-4 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="font-semibold">UCD Grade Tracker</Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/dashboard" className="hover:underline">Dashboard</Link>
          {!user && <Link href="/login" className="hover:underline">Sign in</Link>}
          {!user && <Link href="/signup" className="hover:underline">Sign up</Link>}
        </nav>
      </div>
    </header>
  );
}


