import { createClientServer } from "@/lib/supabaseClient";
import { getSiteUrl } from "@/lib/config";
import { redirect } from "next/navigation";

export default async function MagicLinkPage({ searchParams }: { searchParams?: Promise<Record<string, string>> }) {
  const sp = searchParams ? await searchParams : undefined;
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-4">Magic link</h1>
        {sp?.message && (
          <div className="mb-4 rounded-md border p-3 text-sm bg-green-50 text-green-900">{sp.message}</div>
        )}
        {sp?.error && (
          <div className="mb-4 rounded-md border p-3 text-sm bg-red-50 text-red-900">{sp.error}</div>
        )}
        <form action={magicLink} className="space-y-4">
          <input required name="email" type="email" placeholder="Email" className="w-full border rounded-md p-2" />
          <button className="w-full rounded-md px-4 py-2 bg-foreground text-background">Send magic link</button>
        </form>
      </div>
    </main>
  );
}

async function magicLink(formData: FormData) {
  "use server";
  const supabase = createClientServer();
  const email = String(formData.get("email"));
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${getSiteUrl()}/api/auth/callback` },
  });
  if (error) redirect("/login/magic?error=Could%20not%20send%20magic%20link.");
  redirect("/login/magic?message=Check%20your%20email%20for%20the%20link.");
}


