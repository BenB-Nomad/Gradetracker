"use client";
import * as React from "react";

type Props = {
  name?: string;
  value?: "standard_40" | "alt_linear_40";
  defaultValue?: "standard_40" | "alt_linear_40";
  onChange?: (v: "standard_40" | "alt_linear_40") => void;
};

export function GradeScalePicker({ name, value, defaultValue, onChange }: Props) {
  return (
    <label className="text-sm flex items-center gap-2">
      <span>Scale</span>
      <select
        name={name}
        value={value}
        defaultValue={defaultValue}
        onChange={(e) => onChange?.(e.currentTarget.value as ("standard_40" | "alt_linear_40"))}
        className="border rounded-md p-1 text-sm"
      >
        <option value="standard_40">Standard 40% Pass</option>
        <option value="alt_linear_40">Alternative Linear 40% Pass</option>
      </select>
    </label>
  );
}


