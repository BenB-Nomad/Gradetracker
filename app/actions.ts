"use server";
import { z } from "zod";
import { getClient } from "@/lib/db";
import { DEFAULT_CATALOG, DEFAULT_ASSESSMENTS } from "@/lib/catalog";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const moduleSchema = z.object({
  code: z.string().max(50).optional().nullable(),
  title: z.string().max(200).optional().nullable(),
  ects: z.number().int().min(0).max(60).default(5),
  scale: z.enum(["standard_40", "alt_linear_40"]),
  use_ucd_21: z.boolean().default(true),
});

export async function createModule(input: z.infer<typeof moduleSchema>) {
  const user = await requireUser();
  const supabase = getClient();
  const parsed = moduleSchema.parse(input);
  const { data, error } = await supabase
    .from("modules")
    .insert({ ...parsed, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateModule(id: string, input: Partial<z.infer<typeof moduleSchema>>) {
  await requireUser();
  const supabase = getClient();
  const parsed = moduleSchema.partial().parse(input);
  const { data, error } = await supabase
    .from("modules")
    .update(parsed)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteModule(id: string) {
  await requireUser();
  const supabase = getClient();
  const { error } = await supabase.from("modules").delete().eq("id", id);
  if (error) throw error;
  return { ok: true } as const;
}

// Create a default module with a unique code per user, avoiding unique violations
export async function createDefaultModule() {
  const user = await requireUser();
  const supabase = getClient();
  const base = {
    user_id: user.id,
    title: "New Module",
    ects: 5,
    scale: "standard_40" as const,
    use_ucd_21: true,
  };
  // Try NEW, NEW-2, NEW-3... to avoid unique(user_id, code) conflicts
  for (let i = 0; i < 25; i++) {
    const code = i === 0 ? "NEW" : `NEW-${i + 1}`;
    const { data, error } = await supabase
      .from("modules")
      .insert({ ...base, code })
      .select()
      .single();
    if (!error && data) return data;
    if (error && (error as { code?: string } | null)?.code !== "23505") throw error;
  }
  throw new Error("Could not create a unique module code. Please try again.");
}

const assessmentSchema = z.object({
  module_id: z.string().uuid(),
  name: z.string().max(200).optional().nullable(),
  weight: z.number().min(0).max(100),
  mark: z.number().min(0).max(100).optional().nullable(),
  status: z.enum(["entered", "abs", "nm", "pending"]).default("pending"),
});

export async function createAssessment(input: z.infer<typeof assessmentSchema>) {
  await requireUser();
  const supabase = getClient();
  const parsed = assessmentSchema.parse(input);
  const { data, error } = await supabase
    .from("assessments")
    .insert(parsed)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateAssessment(id: string, input: Partial<z.infer<typeof assessmentSchema>>) {
  await requireUser();
  const supabase = getClient();
  const parsed = assessmentSchema.partial().parse(input);
  const { data, error } = await supabase
    .from("assessments")
    .update(parsed)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteAssessment(id: string) {
  await requireUser();
  const supabase = getClient();
  const { error } = await supabase.from("assessments").delete().eq("id", id);
  if (error) throw error;
  return { ok: true } as const;
}

const enrollSchema = z.object({ code: z.string().min(2).max(32) });
export async function enrollModuleFromCatalog(formData: FormData) {
  const user = await requireUser();
  const parsed = enrollSchema.safeParse({ code: String(formData.get("code")) });
  if (!parsed.success) throw new Error("Invalid module code");
  const supabase = getClient();
  let mod: { code: string; title: string; ects: number; default_scale: "standard_40" | "alt_linear_40" } | null = null;
  const { data: dbcat } = await supabase
    .from("module_catalog")
    .select("code,title,ects,default_scale")
    .eq("code", parsed.data.code)
    .maybeSingle();
  mod = dbcat ?? DEFAULT_CATALOG.find(c => c.code === parsed.data.code);
  if (!mod) throw new Error("Module not found");
  const { data: inserted, error } = await supabase.from("modules").insert({
    user_id: user.id,
    code: mod.code,
    title: mod.title,
    ects: mod.ects,
    scale: mod.default_scale,
    use_ucd_21: true,
  }).select('id').single();
  if (error && (error as { code?: string } | null)?.code !== "23505") throw error; // ignore duplicate enrollment
  const moduleId = inserted?.id;
  if (moduleId) {
    const defs = DEFAULT_ASSESSMENTS[mod.code] || [];
    if (defs.length) {
      // Insert assessments if none exist yet for this module
      const { data: existing } = await supabase.from('assessments').select('id').eq('module_id', moduleId).limit(1);
      if (!existing || existing.length === 0) {
        await supabase.from('assessments').insert(
          defs.map(d => ({ module_id: moduleId, name: d.name, weight: d.weight, status: 'pending', mark: null }))
        );
      }
    }
  }
  revalidatePath('/dashboard');
  return { ok: true } as const;
}


