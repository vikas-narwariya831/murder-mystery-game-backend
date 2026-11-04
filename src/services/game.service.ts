import { GameSession, LeaderboardEntry } from '../types/index.js';
import { gameSessions, leaderboard } from '../data/store.js';

export class GameService {
  static saveSession(sessionData: Partial<GameSession>): GameSession {
    const session: GameSession = {
      sessionId: sessionData.sessionId || String(Date.now()),
      playerName: sessionData.playerName || 'Detective',
      currentLevel: sessionData.currentLevel || 1,
      discoveredClues: sessionData.discoveredClues || [],
      isSafeOpened: Boolean(sessionData.isSafeOpened),
      score: sessionData.score || 0,
      timeRemainingSeconds: sessionData.timeRemainingSeconds || 1200,
      status: sessionData.status || 'investigating',
      updatedAt: new Date().toISOString()
    };

    gameSessions.set(session.sessionId, session);

    // If game won, record entry on leaderboard
    if (session.status === 'won') {
      const timeTaken = 1200 - (session.timeRemainingSeconds || 0);
      leaderboard.push({
        id: String(Date.now()),
        playerName: session.playerName,
        score: session.score || (1000 - Math.floor(timeTaken / 2)),
        timeTakenSeconds: timeTaken,
        completedAt: new Date().toISOString()
      });
      leaderboard.sort((a, b) => b.score - a.score);
    }

    return session;
  }

  static getSession(sessionId: string): GameSession | undefined {
    return gameSessions.get(sessionId);
  }

  static getLeaderboard(limit = 10): LeaderboardEntry[] {
    return leaderboard.slice(0, limit);
  }

  static getSessionCount(): number {
    return gameSessions.size;
  }
}
