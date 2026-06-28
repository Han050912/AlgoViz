export interface AnalysisReport {
  complexity: {
    time: string;
    space: string;
  };
  summary: string;
  steps: AnalysisStep[];
}

export interface AnalysisStep {
  step: number;
  explanation: string;
  complexity_hint?: string;
}

export interface ComplexityBadgeProps {
  time: string;
  space: string;
}
