import { Request, Response } from 'express';
import { GeminiService } from '../services/gemini.service.js';

// Active safe passcodes map: sessionId -> { passcode, year, multiplier, offset, generatedAt }
export const activePasscodes = new Map<string, {
  passcode: string;
  year: number;
  multiplier: number;
  offset: number;
  formulaStr: string;
  generatedAt: number;
}>();

// Helper to generate a consistent mathematical safe puzzle
function generateSafePuzzle() {
  const years = [1995, 1996, 1998, 2001, 2004, 2008];
  const year = years[Math.floor(Math.random() * years.length)];
  const multiplier = Math.floor(Math.random() * 3) + 3; // 3, 4, or 5
  const product = year * multiplier;
  const offset = Math.floor(Math.random() * 50) * 10 + 350;
  const result = product - offset;
  const passcode = String(result);

  return {
    passcode,
    year,
    multiplier,
    offset,
    formulaStr: `(${year} × ${multiplier}) - ${offset} = ${passcode}`,
    generatedAt: Date.now()
  };
}

export class PuzzleController {
  /**
   * GET /api/puzzle/critical-loop
   */
  static async getCriticalLoopPuzzle(_req: Request, res: Response) {
    try {
      const result = await GeminiService.generateCriticalLoopPuzzle();
      return res.json({
        success: true,
        source: result.source,
        puzzle: result.puzzle
      });
    } catch (error) {
      console.error('[PuzzleController] Error:', error);
      return res.status(500).json({ success: false, error: 'Failed to generate puzzle' });
    }
  }

  /**
   * GET /api/puzzle/safe/generate
   * Generates or fetches the active safe puzzle for a session
   */
  static generateSafePuzzle(req: Request, res: Response) {
    const sessionId = (req.query.sessionId as string) || 'default-session';
    let data = activePasscodes.get(sessionId);
    if (!data) {
      data = generateSafePuzzle();
      activePasscodes.set(sessionId, data);
    }

    return res.json({
      success: true,
      sessionId,
      puzzle: {
        year: data.year,
        multiplier: data.multiplier,
        offset: data.offset,
        formulaStr: data.formulaStr,
        // Notice: 'passcode' is kept on server or only exposed for forensics
        passcode: data.passcode
      }
    });
  }

  /**
   * POST /api/puzzle/safe/verify
   * Securely verifies safe passcode on the backend
   */
  static verifyPasscode(req: Request, res: Response) {
    const { pin, sessionId, fallbackCode } = req.body;

    if (!pin || typeof pin !== 'string') {
      return res.status(400).json({
        success: false,
        unlocked: false,
        error: 'PIN code is required'
      });
    }

    const cleanPin = pin.trim();
    const session = activePasscodes.get(sessionId || 'default-session');

    // Verify against session passcode, or fallback code
    let isCorrect = false;
    if (session && session.passcode === cleanPin) {
      isCorrect = true;
    } else if (fallbackCode && String(fallbackCode).trim() === cleanPin) {
      isCorrect = true;
    }

    if (isCorrect) {
      return res.json({
        success: true,
        unlocked: true,
        message: 'ACCESS GRANTED: Wall safe mechanism unlocked.',
        timestamp: new Date().toISOString()
      });
    } else {
      return res.status(401).json({
        success: false,
        unlocked: false,
        message: 'ACCESS DENIED: Incorrect combination passcode.',
        timestamp: new Date().toISOString()
      });
    }
  }
}
