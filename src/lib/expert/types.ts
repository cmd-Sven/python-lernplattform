export interface ExpertTaskValidation {
  requiredInOutput?: string[];
  requiredLines?: string[];
  requiredNumbers?: number[];
  requireInCode?: string[];
}

export interface ExpertTask {
  id: string;
  levelId: 1 | 2 | 3;
  order: 1 | 2;
  title: string;
  pytoIntroMessage: string;
  task: string;
  starterCode: string;
  mockInputs: string[];
  tips: string[];
  validation: ExpertTaskValidation;
}

export interface ExpertProgress {
  completedTaskIds: string[];
  completedLevels: number[];
  lastLevel: number;
}

export type ExpertValidationResult =
  | { ok: true }
  | {
      ok: false;
      kind: "syntax" | "structure" | "output";
      message: string;
      tipIndex: number;
    };
