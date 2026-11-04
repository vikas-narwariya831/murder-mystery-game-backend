export interface GameSession {
  sessionId: string;
  playerName: string;
  currentLevel: number;
  discoveredClues: string[];
  isSafeOpened: boolean;
  score: number;
  timeRemainingSeconds: number;
  status: 'investigating' | 'won' | 'lost';
  updatedAt: string;
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  score: number;
  timeTakenSeconds: number;
  completedAt: string;
}

export interface CodeRiddle {
  codeSnippet: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface InterrogationRequest {
  suspectName?: string;
  suspectSystemPrompt?: string;
  history?: Array<{ role: 'user' | 'model'; text: string }>;
  userQuestion: string;
}
