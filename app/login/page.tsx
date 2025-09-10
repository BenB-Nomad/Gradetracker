import { createClientServer } from "@/lib/supabaseClient";
import { redirect } from "next/navigation";

export default async function LoginPage({ searchParams }: { searchParams?: Promise<Record<string, string>> }) {
  const sp = searchParams ? await searchParams : undefined;
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
        {sp?.message && (
          <div className="mb-4 rounded-md border p-3 text-sm bg-green-50 text-green-900">{sp.message}</div>
        )}
        {sp?.error && (
          <div className="mb-4 rounded-md border p-3 text-sm bg-red-50 text-red-900">{sp.error}</div>
        )}
        <form action={login} className="space-y-4">
          <input required name="email" type="email" placeholder="Email" className="w-full border rounded-md p-2" />
          <input required name="password" type="password" placeholder="Password" className="w-full border rounded-md p-2" />
          <button className="w-full rounded-md px-4 py-2 bg-foreground text-background">Sign in</button>
        </form>
        <div className="h-px bg-border my-6" />
        <div className="text-sm text-muted-foreground">No account? <a className="underline" href="/signup">Create one</a>.</div>
      </div>
    </main>
  );
}

async function login(formData: FormData) {
  "use server";
  const supabase = createClientServer();
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const msg = String(error.message || "").toLowerCase();
    if (msg.includes("email not confirmed")) {
      redirect("/login?error=Email%20not%20confirmed.%20Check%20your%20inbox%20or%20resend%20confirmation.");
    }
    redirect("/login?error=Sign%20in%20failed.%20Check%20your%20credentials.");
  }
  redirect("/dashboard");
}

async function magicLink(formData: FormData) {
  "use server";
  const supabase = createClientServer();
  const email = String(formData.get("email"));
  const { error } = await supabase.auth.signInWithOtp({ email });
  if (error) redirect("/login?error=Could%20not%20send%20magic%20link.");
}

// confirmation resend and magic link kept available on dedicated pages when needed


