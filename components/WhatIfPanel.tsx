"use client";
import * as React from "react";
import { computeModuleOutcome, type ScaleKey } from "@/lib/grades";

type Pending = { id: string; name: string | null; weight: number; mark: number | null; status: "entered" | "abs" | "nm" | "pending" };

export function WhatIfPanel({
  components,
  scale,
  method,
}: {
  components: Pending[];
  scale: ScaleKey;
  method: "ucd_21" | "simple";
}) {
  const [overrides, setOverrides] = React.useState<Record<string, number>>({});
  const merged = components.map((c) => ({
    weight: c.weight,
    status: c.status,
    mark: c.status === "pending" ? (overrides[c.id] ?? (c.mark ?? 0)) : (c.status === "abs" || c.status === "nm" ? 0 : (c.mark ?? 0)),
  }));
  const outcome = computeModuleOutcome(merged, scale, method);

  return (
    <div className="rounded-md border p-3 space-y-3">
      <div className="font-medium">What‑if</div>
      {components.filter(c => c.status === "pending").length === 0 ? (
        <div className="text-sm text-muted-foreground">No pending components.</div>
      ) : (
        <div className="space-y-2">
          {components.filter(c => c.status === "pending").map(c => (
            <div key={c.id} className="flex items-center gap-3">
              <div className="w-40 truncate text-sm">{c.name ?? "Pending"}</div>
              <input
                type="range"
                min={0}
                max={100}
                step={0.5}
                value={overrides[c.id] ?? 0}
                onChange={(e) => {
                  const val = Number((e.target as HTMLInputElement).value);
                  setOverrides((s) => ({ ...s, [c.id]: val }));
                }}
              />
              <div className="w-16 text-right text-sm">{(overrides[c.id] ?? 0).toFixed(1)}%</div>
            </div>
          ))}
        </div>
      )}
      <div className="text-sm">Predicted: <span className="font-medium">{outcome.moduleLetter}</span> · GP {outcome.moduleGradePoint.toFixed(1)}{outcome.cpTotal != null ? ` (CP ${outcome.cpTotal.toFixed(2)})` : ""}</div>
    </div>
  );
}


