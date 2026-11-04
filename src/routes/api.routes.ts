import { Router } from 'express';
import { GameController } from '../controllers/game.controller.js';
import { PuzzleController } from '../controllers/puzzle.controller.js';
import { InterrogationController } from '../controllers/interrogation.controller.js';

export const apiRouter = Router();

// Root /api Welcome
apiRouter.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Murder Mystery Backend API',
    status: 'online',
    version: '1.0.0',
    endpoints: [
      '/api/health',
      '/api/puzzle/critical-loop',
      '/api/puzzle/safe/generate',
      '/api/puzzle/safe/verify',
      '/api/interrogation/ask',
      '/api/session/save',
      '/api/session/:sessionId',
      '/api/leaderboard'
    ]
  });
});

// 1. Health & Telemetry
apiRouter.get('/health', GameController.getHealth);

// 2. Safe Passcode Generation & Verification
apiRouter.get('/puzzle/safe/generate', PuzzleController.generateSafePuzzle);
apiRouter.post('/puzzle/safe/verify', PuzzleController.verifyPasscode);

// 3. Cybersecurity AI Puzzle
apiRouter.get('/puzzle/critical-loop', PuzzleController.getCriticalLoopPuzzle);

// 4. Suspect Interrogation AI Proxy
apiRouter.post('/interrogation/ask', InterrogationController.askSuspect);

// 5. Session & Save Progress
apiRouter.post('/session/save', GameController.saveSession);
apiRouter.get('/session/:sessionId', GameController.getSession);

// 6. Forensic Leaderboard
apiRouter.get('/leaderboard', GameController.getLeaderboard);
