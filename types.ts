
export interface MathSolution {
  equation: string;
  latex: string;
  result: string;
  steps: string[];
  explanation: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  SOLVING = 'SOLVING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
