# Picket - Project Context & Architecture Map

> [!NOTE]
> This file serves as the single source of truth for the project's structure, tech stack, and workflows. **AI Coding Assistants should read this file first** to avoid scanning the entire project, which conserves token usage.

*Last Refactored / Updated:* 2026-06-12 17:37:53 UTC
*Automated Update Script:* Run `node scripts/update-context.js` to refresh the directory map and timestamp.

---

## 1. System Overview
**Picket** is an automated candidate verification and assessment platform. It allows hiring managers to:
1. Upload candidate profiles/resumes.
2. Process them through an asynchronous queue (`BullMQ` + `Redis`).
3. Run automated analysis agents (a Gemini-based **Detector Agent** for AI-plagiarism and prompt-injections, and a Tavily + Gemini **OSINT Agent** to fact-check candidate digital footprints).
4. Send automated email assessment notifications to candidates who pass initial signal checks.
5. Conduct interactive **Proof of Work (PoW) Challenges** for candidates using a React-based assessment portal.

---

## 2. Tech Stack

### Backend
- **Core:** Node.js (CommonJS modules - `require()`), Express
- **Database:** MongoDB via Mongoose
- **Queue/Asynchrony:** BullMQ (powered by Redis via `ioredis`)
- **WebSockets:** Socket.io (for real-time pipeline status updates in the client)
- **APIs & LLMs:** Google Gemini (2.5 Flash), Groq (Llama 3.3), Tavily (Search API)

### Frontend
- **Core:** React 19 (Vite, ES Modules), React Router DOM v7
- **Styling:** TailwindCSS v4 mixed with Vanilla CSS (Theme variables defined in `index.css`)
- **State/Data Fetching:** TanStack React Query v5, Axios
- **Real-Time:** Socket.io Client
- **Icons:** Lucide React

---

## 3. Directory Structure
Below is the directory map. This tree is automatically generated and updated.

<!-- DIRECTORY_TREE_START -->
.
├── backend
│   ├── config
│   │   └── env.js
│   ├── middleware
│   │   └── auth.js
│   ├── models
│   │   ├── Candidate.js
│   │   ├── Project.js
│   │   └── User.js
│   ├── routes
│   │   ├── analytics.js
│   │   ├── auth.js
│   │   ├── candidates.js
│   │   └── projects.js
│   ├── services
│   │   ├── agents
│   │   │   ├── detectorAgent.js
│   │   │   ├── osintAgent.js
│   │   │   └── powAgent.js
│   │   ├── agentQueue.js
│   │   └── emailService.js
│   ├── package.json
│   ├── seed.js
│   └── server.js
├── frontend
│   ├── public
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── src
│   │   ├── api
│   │   │   └── index.js
│   │   ├── assets
│   │   │   ├── hero.png
│   │   │   ├── react.svg
│   │   │   └── vite.svg
│   │   ├── components
│   │   │   ├── auth
│   │   │   │   ├── AuthLayout.jsx
│   │   │   │   ├── AuthPages.jsx
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   ├── ProfileMenu.jsx
│   │   │   │   ├── RegisterPage.jsx
│   │   │   │   └── SplashScreen.jsx
│   │   │   ├── charts
│   │   │   │   ├── ConfidenceDonut.jsx
│   │   │   │   ├── FunnelChart.jsx
│   │   │   │   ├── ProjectComparison.jsx
│   │   │   │   └── VolumeBarChart.jsx
│   │   │   ├── landing
│   │   │   │   └── LandingPage.jsx
│   │   │   ├── AnalyticsPage.jsx
│   │   │   ├── CandidateDrawer.jsx
│   │   │   ├── CandidatesPage.jsx
│   │   │   ├── CandidatesToolbar.jsx
│   │   │   ├── NewProjectModal.jsx
│   │   │   ├── PipelineTable.jsx
│   │   │   ├── PoWChallenge.jsx
│   │   │   ├── ProjectDetailView.jsx
│   │   │   ├── ProjectsView.jsx
│   │   │   ├── SettingsPage.jsx
│   │   │   └── UploadModal.jsx
│   │   ├── context
│   │   │   └── AuthContext.jsx
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── landing.css
│   │   └── main.jsx
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
├── scripts
│   └── update-context.js
└── context.md
<!-- DIRECTORY_TREE_END -->

---

## 4. Key Workflows & Data Pipelines

### A. Candidate Analysis & Queue Flow
1. **Upload:** User uploads a resume file (`pdf-parse` extracts raw text) via POST `/api/candidates`.
2. **Job Insertion:** The route handler calls `addCandidateJob({ candidateId })`, adding a task to the `candidateAnalysis` BullMQ queue.
3. **Queue Processing:** The worker in `backend/services/agentQueue.js` picks up the job and runs the following in parallel:
   - **Detector Agent (`detectorAgent.js`):** Calls Gemini 2.5 Flash to analyze text for AI-generation boilerplate or prompt injection patterns. Falls back to static keywords (`delve`, `tapestry`, `ignore instructions`, etc.) if API keys are missing.
   - **OSINT Agent (`osintAgent.js`):** Performs web/social footprint search via Tavily, then feeds results to Gemini 2.5 Flash to evaluate profile consistency.
4. **Status & Pipeline Decision:**
   - Scores are averaged. If AI/Bot probability is high, status is set to `high_noise` or `audit_required`.
   - If signal is clear, status is `high_signal`.
5. **Email Outbox:** For candidates categorized as `high_signal` or `audit_required`, an assessment email with a unique PoW Challenge URL (`/?assess=candidateId`) is dispatched.
6. **Real-time Notify:** `Socket.io` broadcasts `candidate_updated` to the frontend dashboard.

### B. Proof of Work (PoW) Challenge Flow
1. Candidate visits `/?assess=candidateId`.
2. The system checks URL queries, switches App to assessment mode, and renders `PoWChallenge.jsx`.
3. Challenge generation is dynamic (using Groq Llama 3.3 / Gemini 2.5 Flash based on the Project's name/skills, falling back to static math/pattern riddles).
4. Candidate submits the answer; backend evaluates correctness and updates the database state.

---

## 5. Coding & Style Conventions

1. **CommonJS Backend:** The backend uses standard Node.js module exports (`module.exports`) and imports (`require`). Do not use ES modules syntax (`import`/`export`) in backend files.
2. **ESM Frontend:** The frontend uses ES Modules (`import React from 'react'`).
3. **Theme & CSS System:** Avoid arbitrary Tailwind classes for core color schemes. Always reference the CSS variables declared in `frontend/src/index.css` (e.g., `var(--bg)`, `var(--text-primary)`, `var(--sh-card)`). This ensures theme switching (Light/Dark mode) works correctly.
4. **Error Handling:** Avoid letting server routes crash. Implement try-catch blocks and make sure async errors are delegated to the global error handler middleware in `server.js`.
5. **MongoDB Relations:** 
   - `User` has `settings.apiKeys` (Gemini, Groq, Tavily) allowing "Bring Your Own Key" (BYOK).
   - `Candidate` belongs to a `Project` and is `uploadedBy` a `User`.

---

## 6. How to Update This Context File

Whenever a **refactor**, **database schema modification**, **new dependency addition**, or **architectural change** occurs, you MUST:
1. Update sections 1, 2, 4, or 5 if there are structural changes.
2. Run the update script to refresh the file tree and timestamp:
   ```bash
   node scripts/update-context.js
   ```
3. Commit the updated `context.md` along with your code changes.
