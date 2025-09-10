import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getClient, type AssessmentRow, type ModuleRow } from "@/lib/db";
import { computeModuleOutcome, percentToLetter, type ScaleKey, LETTER_TO_CP_21, weightHealth, letterLowerBound } from "@/lib/grades";
import Link from "next/link";
import { WhatIfPanel } from "@/components/WhatIfPanel";
import { AssessmentInput } from "@/components/AssessmentInput";
import { updateAssessment } from "@/app/actions";

export default async function ModulePage({ params }: { params: { id: string } }) {
  await requireUser();
  const supabase = getClient();
  const { data: module } = await supabase.from("modules").select("*").eq("id", params.id).single();
  if (!module) return notFound();
  const { data: assessments } = await supabase
    .from("assessments")
    .select("*")
    .eq("module_id", module.id)
    .order("created_at", { ascending: true });

  const components = (assessments ?? []).map((a: AssessmentRow) => ({
    weight: Number(a.weight),
    mark: a.status === "abs" || a.status === "nm" ? 0 : Number(a.mark ?? 0),
    status: a.status,
  }));
  const outcome = computeModuleOutcome(components, module.scale as ScaleKey, module.use_ucd_21 ? "ucd_21" : "simple");
  const { total, normalizedFactor } = weightHealth(components);

  return (
    <main className="p-6 space-y-6">
      <div className="rounded-md border p-4 space-y-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-lg font-semibold">{module.code ?? "Module"} · {module.title}</div>
            <div className="text-sm text-muted-foreground">ECTS {module.ects} · Scale: {module.scale === 'standard_40' ? 'Standard 40% Pass' : 'Alternative Linear 40% Pass'}</div>
          </div>
        </div>
        <div className="text-sm text-muted-foreground flex items-center gap-3">
          <span>Final: {outcome.moduleLetter} · GP {outcome.moduleGradePoint.toFixed(1)} {outcome.cpTotal != null ? `(CP ${outcome.cpTotal.toFixed(2)})` : ""}</span>
          <Link href={`/modules/${module.id}/export`} className="underline">Export CSV</Link>
        </div>
      </div>

      {total !== 100 && (
        <div className="rounded-md border p-3 bg-amber-50 text-amber-900 text-sm">
          Total weight is {total.toFixed(2)}%. Calculations normalize by ×{normalizedFactor.toFixed(4)}; also shown as-entered where relevant.
        </div>
      )}

      <AssessmentsTable moduleId={module.id} assessments={(assessments ?? []) as any} scale={module.scale as ScaleKey} />

      <WhatIfPanel
        components={(assessments ?? []).map(a => ({ id: a.id, name: a.name, weight: Number(a.weight), mark: a.mark == null ? 0 : Number(a.mark), status: a.status }))}
        scale={module.scale as ScaleKey}
        method={module.use_ucd_21 ? "ucd_21" : "simple"}
      />
    </main>
  );
}

function displayStatus(status: string) {
  return status.toUpperCase();
}

// status is edited via the Save form per row

function AssessmentsTable({ moduleId, assessments, scale }: { moduleId: string; assessments: AssessmentRow[]; scale: ScaleKey }) {
  return (
    <div className="rounded-md border overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/40 text-left">
            <th className="p-2">Name</th>
            <th className="p-2">Weight %</th>
            <th className="p-2">Mark %</th>
            <th className="p-2">Input</th>
            <th className="p-2">Letter</th>
            <th className="p-2">Contribution</th>
            <th className="p-2">Save</th>
          </tr>
        </thead>
        <tbody>
          {assessments.map((a) => (
            <tr key={a.id} className="border-t">
              <td className="p-2">{a.name}</td>
              <td className="p-2">{Number(a.weight)}%</td>
              <td className="p-2">{(() => {
                const disabled = a.status === "abs" || a.status === "nm";
                const mark = disabled ? 0 : Number(a.mark ?? 0);
                return disabled ? "—" : `${mark.toFixed(0)}%`;
              })()}</td>
              <td className="p-2"><AssessmentInput id={a.id} weight={Number(a.weight)} scale={scale} /></td>
              <td className="p-2">
                {(() => {
                  const disabled = a.status === "abs" || a.status === "nm";
                  const mark = disabled ? 0 : Number(a.mark ?? 0);
                  const letter = percentToLetter(mark, scale);
                  return letter;
                })()}
              </td>
              <td className="p-2">
                {(() => {
                  const mark = Number(a.mark ?? 0);
                  const letter = percentToLetter(mark, scale);
                  const gp = ((Number(a.weight) / 100) * LETTER_TO_CP_21[letter]);
                  return gp.toFixed(2);
                })()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Structure fixed: no add/delete controls */}
    </div>
  );
}


