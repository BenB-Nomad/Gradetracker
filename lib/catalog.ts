export type CatalogItem = {
  code: string;
  title: string;
  ects: number;
  default_scale: 'standard_40' | 'alt_linear_40';
};

export const DEFAULT_CATALOG: CatalogItem[] = [
  { code: 'FDSC10010', title: 'Food Diet & Health', ects: 5, default_scale: 'alt_linear_40' },
  { code: 'MEEN30100', title: 'Engineering Thermodynamics II', ects: 5, default_scale: 'standard_40' },
  { code: 'MEEN30090', title: 'Materials Science & Engineering II', ects: 5, default_scale: 'standard_40' },
  { code: 'MEEN30030', title: 'Mechanical Engineering Design II', ects: 5, default_scale: 'standard_40' },
  { code: 'EEEN30250', title: 'Electrical Machines for Mechanical Engineers', ects: 5, default_scale: 'alt_linear_40' },
  { code: 'ACM30030', title: 'Multivariable Calculus Eng II', ects: 5, default_scale: 'standard_40' },
];

export const DEFAULT_ASSESSMENTS: Record<string, { name: string; weight: number }[]> = {
  FDSC10010: [
    { name: 'End-of-trimester Online Exam', weight: 70 },
    { name: 'Mid-trimester Online Quiz', weight: 15 },
    { name: 'Late-trimester Online Quiz', weight: 15 },
  ],
  MEEN30100: [
    { name: 'Final Exam (must-pass)', weight: 50 },
    { name: 'Second midterm/quizzes', weight: 20 },
    { name: 'First midterm/quizzes', weight: 10 },
    { name: 'Lab practice', weight: 20 },
  ],
  MEEN30090: [
    { name: 'Final Exam', weight: 50 },
    { name: 'Mid-semester in-class exam', weight: 20 },
    { name: 'Materials Design Project (CES) Lab + Report', weight: 15 },
    { name: 'Materials Characterisation Lab + Report', weight: 15 },
  ],
  MEEN30030: [
    { name: 'Short CAD exercise', weight: 10 },
    { name: 'Group design report', weight: 50 },
    { name: 'Group presentation', weight: 15 },
    { name: 'Group prototype development', weight: 15 },
    { name: 'In-class tests series', weight: 10 },
  ],
  EEEN30250: [
    { name: 'Final Exam', weight: 50 },
    { name: 'Online Class Tests (Weeks 3/6/9/12) total', weight: 20 },
    { name: 'Lab Report 1: Induction motor', weight: 10 },
    { name: 'Lab Report 2: Synchronous generator', weight: 10 },
    { name: 'Lab Report 3: Stepper motor', weight: 10 },
  ],
  ACM30030: [
    { name: 'Final Exam', weight: 70 },
    { name: 'Two Midterm Tests', weight: 30 },
  ],
};


