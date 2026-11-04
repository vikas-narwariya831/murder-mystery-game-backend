import { config } from '../config/env.js';
import { CodeRiddle, InterrogationRequest } from '../types/index.js';
import { FALLBACK_RIDDLES } from '../data/store.js';

export class GeminiService {
  /**
   * Generates a tricky loop/algorithm code trace puzzle using Gemini AI.
   */
  static async generateCriticalLoopPuzzle(): Promise<{ puzzle: CodeRiddle; source: string }> {
    if (config.geminiApiKey) {
      for (const model of config.modelCandidates) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4000);

          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.geminiApiKey}`;

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
            const data = (await geminiRes.json()) as any;
            const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (rawText) {
              const parsed = JSON.parse(rawText.replace(/```json|```/g, '').trim()) as CodeRiddle;
              if (parsed.codeSnippet && parsed.question && Array.isArray(parsed.options) && parsed.options.length === 4) {
                return { puzzle: parsed, source: `gemini (${model})` };
              }
            }
          }
        } catch (err) {
          console.warn(`[GeminiService] ${model} attempt failed:`, err);
        }
      }
    }

    // Fallback if AI quota exceeded or offline
    const randomFallback = FALLBACK_RIDDLES[Math.floor(Math.random() * FALLBACK_RIDDLES.length)];
    return { puzzle: randomFallback, source: 'offline-cached-pool' };
  }

  /**
   * Generates interactive suspect interrogation responses via Gemini AI.
   */
  static async interrogateSuspect(payload: InterrogationRequest): Promise<string> {
    const { suspectSystemPrompt, history, userQuestion } = payload;

    if (config.geminiApiKey) {
      for (const model of config.modelCandidates) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4000);

          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.geminiApiKey}`;

          const systemInstruction = `${suspectSystemPrompt || 'You are an interrogation suspect in a murder mystery.'}
Keep your answer under 2 sentences, sharp, realistic, and tense. Never admit guilt directly unless trapped by incontrovertible evidence.`;

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
            const data = (await geminiRes.json()) as any;
            const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (reply) {
              return reply.trim();
            }
          }
        } catch (err) {
          console.warn(`[GeminiService] Interrogation ${model} failed:`, err);
        }
      }
    }

    return "I have rights under corporate security protocols. My lawyer is reviewing your evidence.";
  }
}
