export interface MonacoEditorProps {
  code: string;
  language: string;
  currentLine: number | null;
  onCodeChange: (code: string) => void;
  onLanguageChange: (lang: string) => void;
  onAnalyze: () => void;
  onResetCode?: () => void;
  onRun?: () => void;
  isRunning?: boolean;
  projectId?: string;
}
