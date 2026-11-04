import { Router } from 'express';
import { GameController } from '../controllers/game.controller.js';
import { PuzzleController } from '../controllers/puzzle.controller.js';
import { InterrogationController } from '../controllers/interrogation.controller.js';

export const apiRouter = Router();

// 1. Health & Telemetry
apiRouter.get('/health', GameController.getHealth);

// 2. Cybersecurity AI Puzzle
apiRouter.get('/puzzle/critical-loop', PuzzleController.getCriticalLoopPuzzle);

// 3. Suspect Interrogation AI Proxy
apiRouter.post('/interrogation/ask', InterrogationController.askSuspect);

// 4. Session & Save Progress
apiRouter.post('/session/save', GameController.saveSession);
apiRouter.get('/session/:sessionId', GameController.getSession);

// 5. Forensic Leaderboard
apiRouter.get('/leaderboard', GameController.getLeaderboard);
