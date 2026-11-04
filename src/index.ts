import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { apiRouter } from './routes/api.routes.js';

const app = express();

// Middlewares
app.use(cors({
  origin: config.frontendUrl || '*',
  credentials: true
}));
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Murder Mystery Backend API',
    status: 'online',
    version: '1.0.0',
    documentation: '/api'
  });
});

// Mount API routes
app.use('/api', apiRouter);

// Start Server
app.listen(config.port, () => {
  console.log(`=================================================`);
  console.log(`🕵️‍♂️ [Forensic Engine Backend] Running on http://localhost:${config.port}`);
  console.log(`📡 [API Routes Active]:`);
  console.log(`   - GET  /`);
  console.log(`   - GET  /api`);
  console.log(`   - GET  /api/health`);
  console.log(`   - GET  /api/puzzle/critical-loop`);
  console.log(`   - POST /api/interrogation/ask`);
  console.log(`   - POST /api/session/save`);
  console.log(`   - GET  /api/session/:sessionId`);
  console.log(`   - GET  /api/leaderboard`);
  console.log(`=================================================`);
});
