import dotenv from 'dotenv';

dotenv.config();

const envFrontends = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((u) => u.trim()).filter(Boolean)
  : [];

export const config = {
  port: process.env.PORT || 5000,
  geminiApiKey: process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '',
  frontendUrl: process.env.FRONTEND_URL || 'https://murder-mystery-3d.vercel.app',
  frontendUrls: [
    'https://murder-mystery-3d.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
    ...envFrontends
  ],
  modelCandidates: [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-3.8-flash'
  ]
};
