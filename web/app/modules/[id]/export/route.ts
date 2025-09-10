import { NextResponse } from "next/server";
import { getClient } from "@/lib/db";
import { computeModuleOutcome, percentToLetter, type ScaleKey, LETTER_TO_CP_21 } from "@/lib/grades";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const supabase = getClient();
  const { data: module } = await supabase.from("modules").select("*").eq("id", params.id).single();
  if (!module) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { data: assessments } = await supabase
    .from("assessments")
    .select("*")
    .eq("module_id", params.id)
    .order("created_at", { ascending: true });

  const scale = module.scale as ScaleKey;
  const rows = (assessments ?? []).map((a) => {
    const mark = a.status === "abs" || a.status === "nm" ? 0 : Number(a.mark ?? 0);
    const letter = percentToLetter(mark, scale);
    const cp = LETTER_TO_CP_21[letter];
    const weightedCp = (Number(a.weight) / 100) * cp;
    return {
      name: a.name ?? "",
      weight: Number(a.weight).toFixed(2),
      mark: mark.toFixed(2),
      status: a.status,
      letter,
      cp: cp.toFixed(2),
      weighted_cp: weightedCp.toFixed(4),
    };
  });

  const header = ["Name", "Weight%", "Mark%", "Status", "Letter", "CalcPt", "WeightedCP"];
  const csv = [header.join(",")] 
    .concat(rows.map(r => [r.name, r.weight, r.mark, r.status, r.letter, r.cp, r.weighted_cp].join(",")))
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=module_${params.id}.csv`,
    },
  });
}
