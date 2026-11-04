import { Request, Response } from 'express';
import { GameService } from '../services/game.service.js';
import { config } from '../config/env.js';

export class GameController {
  static getHealth(_req: Request, res: Response) {
    return res.json({
      status: 'online',
      service: 'Murder Mystery Forensic Engine Backend',
      hasApiKey: Boolean(config.geminiApiKey),
      activeSessions: GameService.getSessionCount(),
      timestamp: new Date().toISOString()
    });
  }

  static saveSession(req: Request, res: Response) {
    try {
      const { sessionId, playerName, currentLevel, discoveredClues, isSafeOpened, score, timeRemainingSeconds, status } = req.body;
      if (!sessionId) {
        return res.status(400).json({ error: 'sessionId is required' });
      }

      const session = GameService.saveSession({
        sessionId,
        playerName,
        currentLevel,
        discoveredClues,
        isSafeOpened,
        score,
        timeRemainingSeconds,
        status
      });

      return res.json({ success: true, session });
    } catch (error) {
      console.error('[GameController] Save session error:', error);
      return res.status(500).json({ error: 'Failed to save session' });
    }
  }

  static getSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const session = GameService.getSession(sessionId);

      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      return res.json({ success: true, session });
    } catch (error) {
      console.error('[GameController] Get session error:', error);
      return res.status(500).json({ error: 'Failed to fetch session' });
    }
  }

  static getLeaderboard(_req: Request, res: Response) {
    try {
      const list = GameService.getLeaderboard(10);
      return res.json({ success: true, leaderboard: list });
    } catch (error) {
      console.error('[GameController] Leaderboard error:', error);
      return res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
  }
}
