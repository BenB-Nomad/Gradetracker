import { createClientServer } from "@/lib/supabaseClient";
import { getSiteUrl } from "@/lib/config";
import { redirect } from "next/navigation";

export default async function SignupPage({ searchParams }: { searchParams?: Promise<Record<string, string>> }) {
  const sp = searchParams ? await searchParams : undefined;
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-4">Create account</h1>
        {sp?.message && (
          <div className="mb-4 rounded-md border p-3 text-sm bg-green-50 text-green-900">{sp.message}</div>
        )}
        {sp?.error && (
          <div className="mb-4 rounded-md border p-3 text-sm bg-red-50 text-red-900">{sp.error}</div>
        )}
        <form action={signup} className="space-y-4">
          <input required name="email" type="email" placeholder="Email" className="w-full border rounded-md p-2" />
          <input required name="password" type="password" placeholder="Password" className="w-full border rounded-md p-2" />
          <button className="w-full rounded-md px-4 py-2 bg-foreground text-background">Sign up</button>
        </form>
        <div className="h-px bg-border my-6" />
        <div className="text-sm text-muted-foreground">Already have an account? <a className="underline" href="/login">Sign in</a>.</div>
      </div>
    </main>
  );
}

async function signup(formData: FormData) {
  "use server";
  const supabase = createClientServer();
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getSiteUrl()}/api/auth/callback`,
    },
  });
  if (error) {
    const msg = String(error.message || "");
    if (/security|seconds|rate/i.test(msg)) {
      redirect("/signup?error=Please%20wait%20before%20trying%20again.");
    }
    redirect("/signup?error=Sign%20up%20failed.%20Try%20again.");
  }
  if (data?.session) {
    // Email confirmation disabled → session available immediately
    redirect("/dashboard");
  }
  // Try to sign in immediately (works if email confirmation is disabled)
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) {
    redirect("/signup?error=Sign%20in%20after%20sign%20up%20failed.%20Check%20settings.");
  }
  redirect("/dashboard");
}


