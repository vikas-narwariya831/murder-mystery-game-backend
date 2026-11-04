# Murder Mystery Forensic Engine Backend 🕵️‍♂️💻

Standalone high-performance Express & TypeScript backend API for the **Murder Mystery 3D Escape Room Game**.

## 🌟 Features
- **Server-Side AI Proxy:** Securely calls Google Gemini API without exposing credentials on the client.
- **Dynamic Logic Puzzle Generator:** Procedurally generates or serves critical loop trace puzzles for safe unlocking.
- **AI Suspect Interrogation:** Live AI-powered cross-examination for suspects (Evelyn Cross, Marcus Vance, A.R.I.A.).
- **Game Session State Persistence:** Saves/loads player progress, current level, scores, and discovered clues.
- **Forensic Leaderboard:** Tracks fastest solving times and detective scores.

---

## 🛠️ Tech Stack
- **Node.js** (v20+)
- **Express.js** (REST API)
- **TypeScript** with `tsx` runtime
- **CORS & Dotenv**

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
FRONTEND_URL=http://localhost:5173
```

### 3. Start Development Server
```bash
npm run dev
```
Server runs on: `http://localhost:5000`

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Backend status & AI availability |
| `GET` | `/api/puzzle/critical-loop` | Generates a 4-choice algorithmic trace puzzle |
| `POST` | `/api/interrogation/ask` | Interrogates suspect with prompt & chat history |
| `POST` | `/api/session/save` | Saves player's investigation session & score |
| `GET` | `/api/session/:sessionId` | Retrieves saved session state |
| `GET` | `/api/leaderboard` | Returns top 10 detective leaderboard entries |
