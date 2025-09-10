import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-xl w-full text-center space-y-6">
        <h1 className="text-3xl font-semibold">UCD Grade Tracker</h1>
        <p className="text-muted-foreground">Track modules, compute UCD 21-point results, and see your GPA.</p>
        <div className="flex gap-3 justify-center">
          <Link className="rounded-md px-4 py-2 bg-foreground text-background" href="/login">Sign in</Link>
          <Link className="rounded-md px-4 py-2 border" href="/login">Sign up</Link>
        </div>
      </div>
    </main>
  );
}


