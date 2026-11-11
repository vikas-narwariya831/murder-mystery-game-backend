import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { apiRouter } from './routes/api.routes.js';

const app = express();

// Middlewares - CORS configured for production frontend & preview deployments
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      const cleanOrigin = origin.replace(/\/+$/, '');
      const isExplicitlyAllowed = config.frontendUrls.some(
        (allowed) => allowed.replace(/\/+$/, '') === cleanOrigin
      );
      const isVercelDomain = cleanOrigin.endsWith('.vercel.app');

      if (isExplicitlyAllowed || isVercelDomain) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
  })
);

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
  console.log(`   - POST /api/puzzle/safe/verify`);
  console.log(`   - POST /api/interrogation/ask`);
  console.log(`   - POST /api/session/save`);
  console.log(`   - GET  /api/session/:sessionId`);
  console.log(`   - GET  /api/leaderboard`);
  console.log(`=================================================`);
});

export default app;
