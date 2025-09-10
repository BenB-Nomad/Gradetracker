import { describe, it, expect } from "vitest";
import {
  percentToLetter,
  aggregateBy21Point,
  computeGPA,
  LETTER_TO_CP_21,
} from "@/lib/grades";

describe("percentToLetter boundaries", () => {
  it("Standard 40: 90 -> A+", () => {
    expect(percentToLetter(90, "standard_40")).toBe("A+");
  });
  it("Standard 40: 89.99 -> A", () => {
    expect(percentToLetter(89.99, "standard_40")).toBe("A");
  });
  it("Alt Linear: 85 -> A-", () => {
    expect(percentToLetter(85, "alt_linear_40")).toBe("A-");
  });
});

describe("21-point aggregation example", () => {
  it("B+@20%, C-@30%, D@50% -> CP≈12.5 → C-", () => {
    const res = aggregateBy21Point([
      { weight: 20, letter: "B+" },
      { weight: 30, letter: "C-" },
      { weight: 50, letter: "D" },
    ]);
    // 17.5*0.2 + 12.5*0.3 + 10.5*0.5 = 3.5 + 3.75 + 5.25 = 12.5
    expect(Math.round(res.cpTotal * 100) / 100).toBe(12.5);
    expect(res.letter).toBe("C-");
  });
});

describe("GPA weighting", () => {
  it("ECTS-weighted average on 4.2 scale", () => {
    const modules = [
      { ects: 5, moduleGradePoint: 3.4 },
      { ects: 10, moduleGradePoint: 2.6 },
      { ects: 5, moduleGradePoint: 4.0 },
    ];
    const gpa = computeGPA(modules);
    const expected = (5 * 3.4 + 10 * 2.6 + 5 * 4.0) / 20; // 3.15
    expect(gpa).toBeCloseTo(Math.round(expected * 100) / 100, 2);
  });
});


