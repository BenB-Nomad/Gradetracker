// Grade utilities and constants for UCD Grade Tracker
// Sources (UCD official):
// - Understanding Grades (letter → grade point; 21‑point calculation; module bands)
// - Standard Conversion Grade Scale (40% pass)
// - Alternative Linear Conversion Grade Scale (40% pass)
// Keep these definitions authoritative and centralized.

export type GradeLetter =
  | "A+"
  | "A"
  | "A-"
  | "B+"
  | "B"
  | "B-"
  | "C+"
  | "C"
  | "C-"
  | "D+"
  | "D"
  | "D-"
  | "E+"
  | "E"
  | "E-"
  | "F+"
  | "F"
  | "F-"
  | "G+"
  | "G"
  | "G-"
  | "NM" // No Mark (0)
  | "ABS"; // Absent (0)

export type ScaleKey = "standard_40" | "alt_linear_40";

export interface ScaleBand {
  grade: GradeLetter;
  lower: number; // inclusive lower bound (percent)
  upper: number; // exclusive upper bound except the top band can include 100
}

// Standard Conversion Grade Scale (40% pass)
// Boundary table per UCD, inclusive lower bounds. NM for 0 <= mark < 0.01.
export const STANDARD_40_SCALE: ScaleBand[] = [
  { grade: "A+", lower: 90, upper: 100.0001 },
  { grade: "A", lower: 80, upper: 90 },
  { grade: "A-", lower: 70, upper: 80 },
  { grade: "B+", lower: 66.67, upper: 70 },
  { grade: "B", lower: 63.33, upper: 66.67 },
  { grade: "B-", lower: 60, upper: 63.33 },
  { grade: "C+", lower: 56.67, upper: 60 },
  { grade: "C", lower: 53.33, upper: 56.67 },
  { grade: "C-", lower: 50, upper: 53.33 },
  { grade: "D+", lower: 46.67, upper: 50 },
  { grade: "D", lower: 43.33, upper: 46.67 },
  { grade: "D-", lower: 40, upper: 43.33 },
  { grade: "E+", lower: 36.67, upper: 40 },
  { grade: "E", lower: 33.33, upper: 36.67 },
  { grade: "E-", lower: 30, upper: 33.33 },
  { grade: "F+", lower: 26.67, upper: 30 },
  { grade: "F", lower: 23.33, upper: 26.67 },
  { grade: "F-", lower: 20, upper: 23.33 },
  { grade: "G+", lower: 16.67, upper: 20 },
  { grade: "G", lower: 13.33, upper: 16.67 },
  { grade: "G-", lower: 0.01, upper: 13.33 },
  { grade: "NM", lower: 0, upper: 0.01 },
];

// Alternative Linear Conversion Grade Scale (40% pass)
export const ALT_LINEAR_40_SCALE: ScaleBand[] = [
  { grade: "A+", lower: 95, upper: 100.0001 },
  { grade: "A", lower: 90, upper: 95 },
  { grade: "A-", lower: 85, upper: 90 },
  { grade: "B+", lower: 80, upper: 85 },
  { grade: "B", lower: 75, upper: 80 },
  { grade: "B-", lower: 70, upper: 75 },
  { grade: "C+", lower: 65, upper: 70 },
  { grade: "C", lower: 60, upper: 65 },
  { grade: "C-", lower: 55, upper: 60 },
  { grade: "D+", lower: 50, upper: 55 },
  { grade: "D", lower: 45, upper: 50 },
  { grade: "D-", lower: 40, upper: 45 },
  { grade: "E+", lower: 35, upper: 40 },
  { grade: "E", lower: 30, upper: 35 },
  { grade: "E-", lower: 25, upper: 30 },
  { grade: "F+", lower: 20, upper: 25 },
  { grade: "F", lower: 15, upper: 20 },
  { grade: "F-", lower: 10, upper: 15 },
  { grade: "G+", lower: 5, upper: 10 },
  { grade: "G", lower: 0.02, upper: 5 },
  { grade: "G-", lower: 0.01, upper: 0.02 },
  { grade: "NM", lower: 0, upper: 0.01 },
];

export const LETTER_TO_CP_21: Record<GradeLetter, number> = {
  "A+": 20.5,
  A: 19.5,
  "A-": 18.5,
  "B+": 17.5,
  B: 16.5,
  "B-": 15.5,
  "C+": 14.5,
  C: 13.5,
  "C-": 12.5,
  "D+": 11.5,
  D: 10.5,
  "D-": 9.5,
  "E+": 8.5, // maps to FM+ on module outcome bands
  E: 7.5, // FM
  "E-": 6.5, // FM-
  "F+": 5.5,
  F: 4.5,
  "F-": 3.5,
  "G+": 2.5,
  G: 1.5,
  "G-": 0.5,
  NM: 0,
  ABS: 0,
};

export const LETTER_TO_GRADE_POINT_42: Record<GradeLetter, number> & {
  // Explicitly include FM+/FM/FM- mapped via E+/E/E- result letters for module outcome
  // For component letters E+/E/E-, module outcome letter will be FM+/FM/FM- → GP 0.0
} = {
  "A+": 4.2,
  A: 4.0,
  "A-": 3.8,
  "B+": 3.6,
  B: 3.4,
  "B-": 3.2,
  "C+": 3.0,
  C: 2.8,
  "C-": 2.6,
  "D+": 2.4,
  D: 2.2,
  "D-": 2.0,
  "E+": 0.0,
  E: 0.0,
  "E-": 0.0,
  "F+": 0.0,
  F: 0.0,
  "F-": 0.0,
  "G+": 0.0,
  G: 0.0,
  "G-": 0.0,
  NM: 0.0,
  ABS: 0.0,
};

export function percentToLetter(markPercent: number, scale: ScaleKey): GradeLetter {
  if (!Number.isFinite(markPercent)) return "NM";
  const bounded = Math.max(0, Math.min(100, markPercent));
  const table = scale === "standard_40" ? STANDARD_40_SCALE : ALT_LINEAR_40_SCALE;
  for (const band of table) {
    if (bounded >= band.lower && bounded < band.upper) return band.grade;
  }
  // Fallback (should not occur)
  return "NM";
}

export function letterLowerBound(scale: ScaleKey, letter: GradeLetter): number | null {
  const table = scale === "standard_40" ? STANDARD_40_SCALE : ALT_LINEAR_40_SCALE;
  const band = table.find(b => b.grade === letter);
  return band ? band.lower : null;
}

export function MODULE_CP_TO_LETTER(cp: number): { letter: GradeLetter; gradePoint: number } {
  // Module outcome bands per UCD, using aggregated CP.
  // ≥20 A+, ≥19 A, ≥18 A-, ≥17 B+, ... ≥9 D-. Below 9 becomes FM+/FM/FM- based on range, else NM/ABS if 0.
  const c = Math.max(0, cp);
  const pick = (letter: GradeLetter) => ({ letter, gradePoint: LETTER_TO_GRADE_POINT_42[letter] });
  if (c >= 20) return pick("A+");
  if (c >= 19) return pick("A");
  if (c >= 18) return pick("A-");
  if (c >= 17) return pick("B+");
  if (c >= 16) return pick("B");
  if (c >= 15) return pick("B-");
  if (c >= 14) return pick("C+");
  if (c >= 13) return pick("C");
  if (c >= 12) return pick("C-");
  if (c >= 11) return pick("D+");
  if (c >= 10) return pick("D");
  if (c >= 9) return pick("D-");
  if (c > 8) return { letter: "E+", gradePoint: 0.0 }; // FM+
  if (c > 7) return { letter: "E", gradePoint: 0.0 }; // FM
  if (c > 6) return { letter: "E-", gradePoint: 0.0 }; // FM-
  if (c === 0) return { letter: "NM", gradePoint: 0.0 }; // Could also be ABS; module-level ABS is not distinguished by CP alone
  // 0 < c <= 6 → treat as fail below FM- bands; map to F-/G etc → still GP 0.0. Use closest band semantics
  if (c > 5) return { letter: "F+", gradePoint: 0.0 };
  if (c > 4) return { letter: "F", gradePoint: 0.0 };
  if (c > 3) return { letter: "F-", gradePoint: 0.0 };
  if (c > 2) return { letter: "G+", gradePoint: 0.0 };
  if (c > 1) return { letter: "G", gradePoint: 0.0 };
  if (c > 0) return { letter: "G-", gradePoint: 0.0 };
  return { letter: "NM", gradePoint: 0.0 };
}

export function aggregateBy21Point(components: { weight: number; letter: GradeLetter }[]): {
  cpTotal: number;
  letter: GradeLetter;
  gradePoint: number;
} {
  const totalWeight = components.reduce((s, c) => s += c.weight, 0);
  const normalized = totalWeight === 100 || totalWeight === 0 ? 1 : 100 / totalWeight;
  let cpTotal = 0;
  for (const c of components) {
    const w = c.weight * normalized / 100; // weight fraction
    const cp = LETTER_TO_CP_21[c.letter];
    cpTotal += w * cp;
  }
  const { letter, gradePoint } = MODULE_CP_TO_LETTER(cpTotal);
  return { cpTotal, letter, gradePoint };
}

export function simpleAverage(
  components: { weight: number; mark: number }[],
  scale: ScaleKey
): { modulePercent: number; moduleLetter: GradeLetter; moduleGradePoint: number } {
  const totalWeight = components.reduce((s, c) => s += c.weight, 0);
  const normalized = totalWeight === 100 || totalWeight === 0 ? 1 : 100 / totalWeight;
  let finalPercent = 0;
  for (const c of components) {
    const w = c.weight * normalized / 100;
    const boundedMark = Math.max(0, Math.min(100, c.mark ?? 0));
    finalPercent += w * boundedMark;
  }
  const moduleLetter = percentToLetter(finalPercent, scale);
  const moduleGradePoint = LETTER_TO_GRADE_POINT_42[moduleLetter];
  return { modulePercent: finalPercent, moduleLetter, moduleGradePoint };
}

export function computeModuleOutcome(
  components: { weight: number; mark?: number; status?: "entered" | "abs" | "nm" | "pending" }[],
  scale: ScaleKey,
  method: "ucd_21" | "simple"
): { modulePercent?: number; moduleLetter: GradeLetter; moduleGradePoint: number; cpTotal?: number } {
  if (method === "simple") {
    // Treat ABS/NM as 0% for averaging
    const inputs = components.map(c => ({ weight: c.weight, mark: (c.status === "abs" || c.status === "nm") ? 0 : (c.mark ?? 0) }));
    const res = simpleAverage(inputs, scale);
    return { modulePercent: res.modulePercent, moduleLetter: res.moduleLetter, moduleGradePoint: res.moduleGradePoint };
  }
  // UCD 21‑point aggregation: convert each component to a letter, then to CP, weight and sum
  const letters = components.map(c => {
    const mark = (c.status === "abs" || c.status === "nm") ? 0 : (c.mark ?? 0);
    const letter = percentToLetter(mark, scale);
    return { weight: c.weight, letter };
  });
  const { cpTotal, letter, gradePoint } = aggregateBy21Point(letters);
  return { cpTotal, moduleLetter: letter, moduleGradePoint: gradePoint };
}

export function computeGPA(modules: { ects: number; moduleGradePoint: number }[]): number {
  const totals = modules.reduce(
    (acc, m) => {
      const ects = Math.max(0, m.ects || 0);
      acc.weighted += ects * (m.moduleGradePoint ?? 0);
      acc.ects += ects;
      return acc;
    },
    { weighted: 0, ects: 0 }
  );
  if (totals.ects === 0) return 0;
  const gpa = totals.weighted / totals.ects;
  // UCD guidance: show to 2 decimal places
  return Math.round(gpa * 100) / 100;
}

export function weightHealth(components: { weight: number }[]): { total: number; normalizedFactor: number } {
  const total = components.reduce((s, c) => s + (c.weight || 0), 0);
  const normalizedFactor = total === 100 || total === 0 ? 1 : 100 / total;
  return { total, normalizedFactor };
}


