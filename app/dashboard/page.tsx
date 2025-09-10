import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getClient, type ModuleRow } from "@/lib/db";
import { computeGPA, computeModuleOutcome, type ScaleKey } from "@/lib/grades";
import { enrollModuleFromCatalog } from "@/app/actions";
import { DEFAULT_CATALOG, type CatalogItem } from "@/lib/catalog";

export default async function DashboardPage() {
  await requireUser();
  const supabase = getClient();
  const { data: modules } = await supabase
    .from("modules")
    .select("id, code, title, ects, scale, use_ucd_21")
    .order("created_at", { ascending: false });
  const { data: catalog } = await supabase.from("module_catalog").select("code,title,ects,default_scale").order("code");
  let gpa = 0;
  if (modules && modules.length) {
    const outcomes: { ects: number; moduleGradePoint: number }[] = [];
    for (const m of modules) {
      const { data: comps } = await supabase
        .from("assessments")
        .select("weight, mark, status")
        .eq("module_id", m.id);
      const compsTyped: { weight: number; mark: number; status: "entered" | "abs" | "nm" | "pending" }[] = (comps ?? []).map((c) => ({
        weight: Number(c.weight),
        mark: c.mark == null ? 0 : Number(c.mark),
        status: c.status as "entered" | "abs" | "nm" | "pending",
      }));
      const outcome = computeModuleOutcome(compsTyped, m.scale as ScaleKey, m.use_ucd_21 ? "ucd_21" : "simple");
      outcomes.push({ ects: m.ects, moduleGradePoint: outcome.moduleGradePoint });
    }
    gpa = computeGPA(outcomes);
  }

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <form action={enrollModuleFromCatalog} className="flex items-center gap-2">
          <select name="code" className="border rounded-md p-2 text-sm">
            {(((catalog && catalog.length ? catalog : DEFAULT_CATALOG) as CatalogItem[])).map((c) => (
              <option key={c.code} value={c.code}>{c.code} — {c.title}</option>
            ))}
          </select>
          <button className="rounded-md px-3 py-2 border">Enroll</button>
        </form>
      </div>
      <div className="rounded-md border p-4">
        <div className="text-sm text-muted-foreground">ECTS-weighted GPA</div>
        <div className="text-3xl font-semibold">{gpa.toFixed(2)}</div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(modules ?? []).map((m: ModuleRow) => (
          <Link key={m.id} href={`/modules/${m.id}`} className="rounded-md border p-4 hover:bg-muted/40">
            <div className="font-medium">{m.code ?? "Untitled"}</div>
            <div className="text-sm text-muted-foreground">{m.title ?? "Module"}</div>
            <div className="mt-2 text-xs text-muted-foreground">ECTS: {m.ects} · Scale: {m.scale === "standard_40" ? "Standard 40%" : "Alt Linear 40%"}</div>
          </Link>
        ))}
        {(!modules || modules.length === 0) && (
          <div className="text-sm text-muted-foreground">No modules yet. Add your first module.</div>
        )}
      </div>
    </main>
  );
}

// no inline add; enrollment uses catalog above


