"use client";
import * as React from "react";
import { useRouter } from "next/navigation";

type Props = {
  id: string;
  weight: number;
  scale: "standard_40" | "alt_linear_40";
};

export function AssessmentInput({ id, weight }: Props) {
  const router = useRouter();
  const [mode, setMode] = React.useState<"raw" | "%" | "letter">("raw");
  const [value, setValue] = React.useState<string>("");
  const [isSaving, startSaving] = React.useTransition();
  const [error, setError] = React.useState<string>("");

  async function onApply() {
    setError("");
    let markPct = 0;
    if (mode === "%") {
      markPct = Number(value || 0);
    } else if (mode === "raw") {
      const raw = Number(value || 0);
      markPct = weight > 0 ? (raw / weight) * 100 : 0;
    } else {
      // letter: use minimal bound → handled server-side previously; here approximate mapping
      const letter = String(value || "").toUpperCase();
      const map: Record<string, number> = {
        "A+": 95, A: 90, "A-": 85, "B+": 80, B: 75, "B-": 70,
        "C+": 65, C: 60, "C-": 55, "D+": 50, D: 45, "D-": 40,
        "E+": 35, E: 30, "E-": 25, "F+": 20, F: 15, "F-": 10,
        "G+": 5, G: 3, "G-": 1, NM: 0, ABS: 0,
      };
      markPct = map[letter] ?? 0;
    }
    startSaving(async () => {
      const res = await fetch("/api/assessments/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, mark: markPct }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Save failed");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <select value={mode} onChange={(e) => setMode(e.currentTarget.value as any)} className="border rounded p-1 text-sm">
        <option value="raw">Mark</option>
        <option value="%">Percent</option>
        <option value="letter">Letter</option>
      </select>
      <input
        value={value}
        onChange={(e) => setValue(e.currentTarget.value)}
        placeholder={mode === "raw" ? `/ ${weight}` : mode === "%" ? "%" : "A, B+, ..."}
        className="w-24 border rounded p-1 text-sm"
      />
      <button type="button" onClick={onApply} disabled={isSaving} className="rounded-md px-2 py-1 border hover:bg-muted active:scale-95 transition">
        {isSaving ? "Saving..." : "Apply"}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}


