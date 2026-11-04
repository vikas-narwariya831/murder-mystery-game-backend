import { Request, Response } from 'express';
import { GeminiService } from '../services/gemini.service.js';

export class PuzzleController {
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
}
