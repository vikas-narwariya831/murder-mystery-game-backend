import { CodeRiddle, GameSession, LeaderboardEntry } from '../types/index.js';

export const FALLBACK_RIDDLES: CodeRiddle[] = [
  {
    codeSnippet: `let total = 0;\nfor (let i = 1; i <= 4; i++) {\n  total += (i * 2);\n}\nconsole.log(total);`,
    question: "Analyze this loop execution. What is the final value printed by console.log?",
    options: ["18", "20", "24", "16"],
    correctOptionIndex: 1,
    explanation: "Iteration i=1: 2 | i=2: 4 (sum=6) | i=3: 6 (sum=12) | i=4: 8 (sum=20). Total is 20."
  },
  {
    codeSnippet: `let count = 100;\nwhile (count > 20) {\n  count -= 25;\n}\nconsole.log(count);`,
    question: "Trace the while loop iteration carefully. What does count terminate at?",
    options: ["0", "20", "25", "15"],
    correctOptionIndex: 0,
    explanation: "100 -> 75 -> 50 -> 25 -> 0. When count reaches 0, 0 > 20 is false, loop exits."
  },
  {
    codeSnippet: `let x = 1;\nfor (let step = 0; step < 4; step++) {\n  if (step % 2 === 0) x *= 2;\n  else x += 3;\n}\nconsole.log(x);`,
    question: "Trace step 0 to 3. What is the final value of x?",
    options: ["13", "10", "15", "8"],
    correctOptionIndex: 0,
    explanation: "step 0 (even): 1*2=2 | step 1 (odd): 2+3=5 | step 2 (even): 5*2=10 | step 3 (odd): 10+3=13."
  },
  {
    codeSnippet: `let buffer = [];\nfor (let i = 3; i >= 0; i--) {\n  buffer.push(i * 3);\n}\nconsole.log(buffer[1] + buffer[3]);`,
    question: "What is the evaluated output of buffer[1] + buffer[3]?",
    options: ["6", "9", "12", "15"],
    correctOptionIndex: 0,
    explanation: "buffer is [9, 6, 3, 0]. buffer[1] is 6, buffer[3] is 0. 6 + 0 = 6."
  },
  {
    codeSnippet: `let sum = 0;\nfor (let k = 10; k > 0; k -= 3) {\n  sum += k;\n}\nconsole.log(sum);`,
    question: "What is the final value of sum after the loop finishes?",
    options: ["22", "18", "25", "15"],
    correctOptionIndex: 0,
    explanation: "Iterations: k=10 (sum=10), k=7 (sum=17), k=4 (sum=21), k=1 (sum=22). Next k=-2 breaks loop. Total is 22."
  },
  {
    codeSnippet: `let acc = 2;\nfor (let i = 0; i < 3; i++) {\n  acc = (acc * 2) - 1;\n}\nconsole.log(acc);`,
    question: "Carefully trace accumulator acc through 3 iterations. What is logged?",
    options: ["9", "7", "11", "5"],
    correctOptionIndex: 0,
    explanation: "Start=2. i=0: 2*2-1 = 3. i=1: 3*2-1 = 5. i=2: 5*2-1 = 9."
  }
];

export const gameSessions = new Map<string, GameSession>();

export const leaderboard: LeaderboardEntry[] = [
  { id: '1', playerName: 'Agent Phoenix', score: 980, timeTakenSeconds: 340, completedAt: new Date().toISOString() },
  { id: '2', playerName: 'CyberSherlock', score: 920, timeTakenSeconds: 410, completedAt: new Date().toISOString() },
  { id: '3', playerName: 'Detective Panda', score: 870, timeTakenSeconds: 460, completedAt: new Date().toISOString() }
];
