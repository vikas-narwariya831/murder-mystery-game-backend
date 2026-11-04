import { Request, Response } from 'express';
import { GeminiService } from '../services/gemini.service.js';

export class InterrogationController {
  static async askSuspect(req: Request, res: Response) {
    try {
      const { suspectName, suspectSystemPrompt, history, userQuestion } = req.body;
      const reply = await GeminiService.interrogateSuspect({
        suspectName,
        suspectSystemPrompt,
        history,
        userQuestion
      });

      return res.json({
        success: true,
        reply
      });
    } catch (error) {
      console.error('[InterrogationController] Error:', error);
      return res.status(500).json({ success: false, error: 'Failed to interrogate suspect' });
    }
  }
}
