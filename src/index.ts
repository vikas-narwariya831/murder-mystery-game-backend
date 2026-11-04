import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

// In-Memory Database for Game Sessions & Leaderboard
interface GameSession {
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

interface LeaderboardEntry {
  id: string;
  playerName: string;
  score: number;
  timeTakenSeconds: number;
  completedAt: string;
}

const gameSessions: Map<string, GameSession> = new Map();
const leaderboard: LeaderboardEntry[] = [
  { id: '1', playerName: 'Agent Phoenix', score: 980, timeTakenSeconds: 340, completedAt: new Date().toISOString() },
  { id: '2', playerName: 'CyberSherlock', score: 920, timeTakenSeconds: 410, completedAt: new Date().toISOString() },
  { id: '3', playerName: 'Detective Panda', score: 870, timeTakenSeconds: 460, completedAt: new Date().toISOString() }
];

// Fallback pool of high quality critical loop / algorithmic puzzles if offline/no API key/quota exhausted
interface CodeRiddle {
  codeSnippet: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

const FALLBACK_RIDDLES: CodeRiddle[] = [
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

const MODEL_CANDIDATES = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-3.8-flash'
];

/* ─────────────────────────────────────────────────────────────
   1. HEALTH CHECK & STATUS ENDPOINT
───────────────────────────────────────────────────────────── */
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    service: 'Murder Mystery Forensic Engine Backend',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY),
    activeSessions: gameSessions.size,
    timestamp: new Date().toISOString()
  });
});

/* ─────────────────────────────────────────────────────────────
   2. SECURE AI PUZZLE GENERATOR (SERVER-SIDE GEMINI API)
───────────────────────────────────────────────────────────── */
app.get('/api/puzzle/critical-loop', async (_req: Request, res: Response) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (apiKey) {
    for (const model of MODEL_CANDIDATES) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const prompt = `You are a cybersecurity puzzle generator for an interactive detective murder mystery game.
Generate ONE critical, tricky JavaScript / Python loop code trace puzzle.
The puzzle must contain:
1. A short clean code snippet (4-7 lines) with loops (for, while, nested or accumulator loop) that requires careful mental tracing.
2. A clear critical question about its execution output.
3. Exactly 4 multiple-choice options.
4. The correct 0-indexed option index (0, 1, 2, or 3).
5. A short 1-line forensic explanation.

Output ONLY valid JSON strictly matching this schema, without markdown formatting or code fences:
{
  "codeSnippet": "let x = 0;...",
  "question": "What is the final value...",
  "options": ["A", "B", "C", "D"],
  "correctOptionIndex": 1,
  "explanation": "..."
}`;

        const geminiRes = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              responseMimeType: 'application/json'
            }
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText.replace(/```json|```/g, '').trim()) as CodeRiddle;
            if (parsed.codeSnippet && parsed.question && Array.isArray(parsed.options) && parsed.options.length === 4) {
              return res.json({ success: true, source: `gemini (${model})`, puzzle: parsed });
            }
          }
        }
      } catch (err) {
        console.warn(`[Backend] Gemini ${model} failed, trying next candidate...`, err);
      }
    }
  }

  // Graceful Server-Side Fallback
  const randomFallback = FALLBACK_RIDDLES[Math.floor(Math.random() * FALLBACK_RIDDLES.length)];
  return res.json({ success: true, source: 'offline-cached-pool', puzzle: randomFallback });
});

/* ─────────────────────────────────────────────────────────────
   3. AI SUSPECT INTERROGATION PROXY (SECURE SERVER-SIDE)
───────────────────────────────────────────────────────────── */
app.post('/api/interrogation/ask', async (req: Request, res: Response) => {
  const { suspectName, suspectSystemPrompt, history, userQuestion } = req.body;
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (apiKey) {
    for (const model of MODEL_CANDIDATES) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const systemInstruction = `${suspectSystemPrompt || 'You are an interrogation suspect in a murder mystery.'}
Keep your answer under 2 sentences, sharp, realistic, and tense. Never admit guilt directly unless trapped by incontrovertible evidence.`;

        // Format history
        const contents = [];
        if (Array.isArray(history)) {
          for (const msg of history.slice(-6)) {
            contents.push({
              role: msg.role === 'user' ? 'user' : 'model',
              parts: [{ text: msg.text }]
            });
          }
        }
        contents.push({
          role: 'user',
          parts: [{ text: userQuestion || 'Explain your whereabouts!' }]
        });

        const geminiRes = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            systemInstruction: { parts: [{ text: systemInstruction }] },
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 150
            }
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) {
            return res.json({ success: true, reply: reply.trim() });
          }
        }
      } catch (err) {
        console.warn(`[Backend] Interrogation ${model} failed, trying fallback...`, err);
      }
    }
  }

  // Smart Contextual Fallback
  return res.json({
    success: true,
    reply: `I have rights under corporate security protocols. My lawyer is reviewing your evidence.`
  });
});

/* ─────────────────────────────────────────────────────────────
   4. GAME SESSIONS & PROGRESS PERSISTENCE
───────────────────────────────────────────────────────────── */
// Save / Update Game State
app.post('/api/session/save', (req: Request, res: Response) => {
  const { sessionId, playerName, currentLevel, discoveredClues, isSafeOpened, score, timeRemainingSeconds, status } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId is required' });
  }

  const session: GameSession = {
    sessionId,
    playerName: playerName || 'Detective',
    currentLevel: currentLevel || 1,
    discoveredClues: discoveredClues || [],
    isSafeOpened: Boolean(isSafeOpened),
    score: score || 0,
    timeRemainingSeconds: timeRemainingSeconds || 1200,
    status: status || 'investigating',
    updatedAt: new Date().toISOString()
  };

  gameSessions.set(sessionId, session);

  // If game won, record to leaderboard
  if (status === 'won') {
    const timeTaken = 1200 - (timeRemainingSeconds || 0);
    leaderboard.push({
      id: String(Date.now()),
      playerName: session.playerName,
      score: session.score || (1000 - Math.floor(timeTaken / 2)),
      timeTakenSeconds: timeTaken,
      completedAt: new Date().toISOString()
    });
    // Sort descending
    leaderboard.sort((a, b) => b.score - a.score);
  }

  return res.json({ success: true, session });
});

// Load Game State
app.get('/api/session/:sessionId', (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const session = gameSessions.get(sessionId);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  return res.json({ success: true, session });
});

/* ─────────────────────────────────────────────────────────────
   5. LEADERBOARD ENDPOINT
───────────────────────────────────────────────────────────── */
app.get('/api/leaderboard', (_req: Request, res: Response) => {
  return res.json({
    success: true,
    leaderboard: leaderboard.slice(0, 10)
  });
});

/* ─────────────────────────────────────────────────────────────
   START SERVER
───────────────────────────────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`[Forensic Backend] Running on http://localhost:${PORT}`);
  console.log(`[API Routes]: /api/health, /api/puzzle/critical-loop, /api/interrogation/ask, /api/session, /api/leaderboard`);
});
