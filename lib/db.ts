import { createClientServer } from "@/lib/supabaseClient";

export type Profile = {
  id: string;
  full_name: string | null;
  created_at: string;
};

export type ModuleRow = {
  id: string;
  user_id: string;
  code: string | null;
  title: string | null;
  ects: number;
  scale: "standard_40" | "alt_linear_40";
  use_ucd_21: boolean;
  created_at: string;
};

export type AssessmentRow = {
  id: string;
  module_id: string;
  name: string | null;
  weight: number;
  mark: number | null;
  status: "entered" | "abs" | "nm" | "pending";
  created_at: string;
};

export function getClient() {
  return createClientServer({ allowCookieWrite: false });
}


