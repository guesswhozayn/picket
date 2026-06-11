# Picket - Anti-Synthetic Recruiter Platform

Picket is a modern candidate screening platform utilizing local Transformers.js classification and free-tier LLM agents (Gemini & Groq) to verify applicant authenticity.

---

## How to Run the Project

### Prerequisites
1. **Node.js**: Ensure Node.js 18+ is installed.
2. **MongoDB**: Ensure local MongoDB instance is running.
3. **Redis**: Ensure local Redis instance is running (for BullMQ).

---

### Step 1: Start Redis & MongoDB
If you use Docker, you can start both instantly:
```bash
docker run -d --name picket-redis -p 6379:6379 redis:alpine
docker run -d --name picket-mongo -p 27017:27017 mongo:latest
```

---

### Step 2: Configure Environment
Copy `.env` variables or verify your setup in `backend/.env`:
```bash
# backend/.env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/synthetic_recruiter
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
FRONTEND_URL=http://localhost:5173

# Free API Keys
GEMINI_API_KEY=your_key_here
GROQ_API_KEY=your_key_here
```

---

### Step 3: Run the Backend
In a terminal, navigate to the `backend` folder and start the dev server:
```bash
cd backend
npm install
npm run dev
```

---

### Step 4: Run the Frontend
In another terminal, navigate to the `frontend` folder and start the dev server:
```bash
cd frontend
npm install
npm run dev
```

The application will be accessible at [http://localhost:5173](http://localhost:5173).
