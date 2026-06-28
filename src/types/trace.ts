// TraceStep — 单步执行轨迹
export interface TraceStep {
  step: number;
  line: number;
  action: string;
  function: string;
  call_stack: string[];
  locals: Record<string, unknown>;
  globals: Record<string, unknown>;
  output?: string;
}

// TraceData — 完整轨迹
export interface TraceData {
  steps: TraceStep[];
  total_steps: number;
  language: string;
}

// DataStructure 类型
export type DataStructureType = 'array' | 'linked_list' | 'tree' | 'graph' | 'hashmap';

export interface DataStructureState {
  type: DataStructureType;
  data: unknown;
}
