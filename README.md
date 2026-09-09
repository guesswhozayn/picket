# Picket

Picket is a candidate screening and recruitment intelligence platform. It features an automated multi-agent evaluation pipeline that parses resumes, detects AI-generated content, conducts open-source intelligence (OSINT) checks, administers Proof-of-Work (PoW) technical challenges, and synchronizes real-time hiring pipelines via WebSockets.

## Table of Contents

- Overview
- Architecture and Monorepo Structure
- Multi-Agent Evaluation Architecture
- Key Features
- Technology Stack
- Project Directory Layout
- Environment Configuration
- Getting Started
- Monorepo Scripts
- API and Real-Time Event Architecture
- License

## Overview

High-volume hiring pipelines face growing challenges from resume spam, embellished qualifications, and artificial intelligence-generated credentials. Picket addresses these challenges through automated screening agents that run on background workers:
- Detecting AI-generated text and resume fabrication.
- Cross-referencing candidate claims against public engineering activity and OSINT signals.
- Issuing and evaluating dynamic Proof-of-Work technical challenges.
- Presenting candidate data through interactive Kanban, grid, and table pipeline views with live WebSocket updates.

## Architecture and Monorepo Structure

Picket is organized as an npm workspace monorepo divided into client and server packages:

```
picket/
├── package.json               # Root monorepo manifest
├── package-lock.json
├── client/                    # React single-page frontend application
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── App.jsx            # Routing, query client, and socket provider
│       ├── main.jsx           # Client entry point
│       ├── api/               # Axios REST API client methods
│       ├── context/           # Auth and global state contexts
│       └── components/        # UI views, pipeline boards, and charts
└── server/                    # Express backend and AI worker services
    ├── package.json
    ├── server.js              # Express, HTTP server, and Socket.io setup
    ├── config/                # Database and environment constants
    ├── middleware/            # Auth, file upload, and validation
    ├── models/                # Mongoose schemas (User, Candidate, Project)
    ├── routes/                # Express API route declarations
    └── services/              # BullMQ queue, email, and agent modules
        ├── agentQueue.js      # BullMQ queue coordinating background jobs
        └── agents/            # Autonomous evaluation agents
            ├── detectorAgent.js # AI text and fabrication analysis
            ├── osintAgent.js    # Public footprint and GitHub verification
            └── powAgent.js      # Proof-of-Work challenge generator
```

## Multi-Agent Evaluation Architecture

```
[ Candidate Resume PDF ]
          |
          v
+--------------------------------------------------------------+
|                       Picket REST API                        |
|  - Multer intercepts PDF upload                              |
|  - pdf-parse extracts raw textual payload                    |
|  - Candidate document stored in MongoDB with 'pending' state |
+------------------------------+-------------------------------+
                               |
                               v
+--------------------------------------------------------------+
|                     BullMQ Agent Queue                       |
|           (Redis-backed asynchronous job orchestrator)       |
+------------------------------+-------------------------------+
                               |
         +---------------------+---------------------+
         |                                           |
         v                                           v
+-----------------------+                 +--------------------+
|     Detector Agent    |                 |     OSINT Agent    |
| - AI content analysis |                 | - GitHub scraping  |
| - Fabrication signals |                 | - Public footprint |
| - Authenticity score  |                 | - Signal audit     |
+-----------+-----------+                 +----------+---------+
            |                                        |
            +-------------------+--------------------+
                                |
                                v
+--------------------------------------------------------------+
|                       PoW Agent                              |
| - Generates customized technical challenge tailored to role  |
| - Evaluates submitted candidate solutions                    |
+------------------------------+-------------------------------+
                               |
                               v
+--------------------------------------------------------------+
|                 Real-Time Updates via Socket.io              |
| - Candidate score and stage pushed live to Recruiter client  |
| - Analytics aggregates updated dynamically                   |
+--------------------------------------------------------------+
```

## Key Features

### Autonomous Multi-Agent Screening
- Detector Agent (`detectorAgent.js`): Scans resume text for linguistic patterns characteristic of AI-generated content, buzzword stuffing, and factual discrepancies.
- OSINT Agent (`osintAgent.js`): Queries public developer APIs and repository histories to verify mentioned open-source contributions, programming languages, and portfolio claims.
- Proof-of-Work Agent (`powAgent.js`): Formulates customized technical verification questions and benchmarks based on the specific job requirements.

### Interactive Recruitment Pipelines
- Kanban Pipeline View (`PipelineBoard.jsx`): Drag-and-drop candidate management across hiring stages (New, Screening, Interview, Offered, Rejected).
- Grid View (`PipelineGrid.jsx`): Visual cards featuring candidate confidence scores, key skills, and quick actions.
- Table View (`PipelineTable.jsx`): High-density data grid with sorting, multi-attribute filtering, and bulk stage changes.
- Candidate Drawer (`CandidateDrawer.jsx`): Deep-dive audit drawer displaying full resume text, agent evaluation breakdowns, OSINT findings, and interview notes.

### Real-Time Synchronization
- Bidirectional WebSockets via Socket.io ensure pipeline changes made by one recruiter are instantly reflected on all active team dashboards without page refreshes.

### Recruitment Analytics
- Comprehensive visualization suite (`AnalyticsPage.jsx`) displaying candidate funnel conversion rates, confidence score distributions, volume over time, and cross-project comparisons using custom charts.

## Technology Stack

### Client Workspace (`client/`)
- Framework: React 19.2, Vite 8
- State and Server Cache: TanStack React Query v5
- Real-Time Communication: Socket.io-client 4.8
- Styling: Tailwind CSS v4, PostCSS, Autoprefixer
- Icons: Lucide React
- HTTP Client: Axios

### Server Workspace (`server/`)
- Runtime: Node.js, Express 5
- Database: MongoDB with Mongoose 9
- Task Queues: BullMQ 5, Redis (`ioredis` 5)
- Real-Time Engine: Socket.io 4.8
- Document Processing: pdf-parse, Multer 2
- Security: JSON Web Tokens (JWT), Bcryptjs, CORS, Dotenv

## Project Directory Layout

```
picket/
├── client/
│   └── src/
│       ├── api/               # Axios client wrappers for candidates and projects
│       ├── components/
│       │   ├── CandidatesPage.jsx    # Candidate management view
│       │   ├── CandidateDrawer.jsx   # Candidate detail drawer
│       │   ├── PipelineBoard.jsx     # Kanban board component
│       │   ├── PipelineGrid.jsx      # Grid view component
│       │   ├── PipelineTable.jsx     # Table view component
│       │   ├── PoWChallenge.jsx      # Technical challenge modal
│       │   ├── UploadModal.jsx       # Multi-file PDF upload modal
│       │   ├── AnalyticsPage.jsx     # Recruitment analytics dashboard
│       │   ├── charts/               # Confidence, Funnel, and Volume charts
│       │   └── auth/                 # Login and registration screens
│       ├── context/                  # Authentication context provider
│       ├── index.css                 # Global styling and Tailwind imports
│       └── main.jsx                  # React application mount
└── server/
    ├── config/                       # Mongoose connection configuration
    ├── middleware/                   # JWT verification and Multer upload handlers
    ├── models/
    │   ├── Candidate.js              # Candidate model with scores and pipeline stage
    │   ├── Project.js                # Hiring project model with required skills
    │   └── User.js                   # Recruiter and admin user model
    ├── routes/
    │   ├── analytics.js              # Pipeline metric aggregation endpoints
    │   ├── auth.js                   # User signup, login, and session checks
    │   ├── candidates.js             # Candidate upload, retrieval, and updates
    │   └── projects.js               # Project CRUD endpoints
    ├── services/
    │   ├── agentQueue.js             # BullMQ queue configuration and worker logic
    │   ├── agents/                   # Detector, OSINT, and PoW agent routines
    │   └── emailService.js           # Recruiter notifications
    └── server.js                     # HTTP server and WebSocket gateway
```

## Environment Configuration

Create a `.env` file in the `server` directory:

| Variable | Description | Example / Default |
| --- | --- | --- |
| PORT | Server listening port | 5000 |
| MONGODB_URI | MongoDB connection URI | mongodb://127.0.0.1:27017/picket |
| JWT_SECRET | Secret key for JWT signing | your-jwt-secret |
| REDIS_HOST | Redis host for BullMQ agent queues | 127.0.0.1 |
| REDIS_PORT | Redis port | 6379 |
| REDIS_PASSWORD | Redis password (if authentication enabled) | |
| CLIENT_URL | Client frontend URL for CORS and socket origins | http://localhost:5173 |

## Getting Started

### Prerequisites
- Node.js version 18.x or higher
- npm version 9.x or higher
- MongoDB instance running locally or on MongoDB Atlas
- Redis instance running on port 6379

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   git clone <repository-url>
   cd picket
   ```

2. Install dependencies for all workspaces:
   ```bash
   npm install
   ```

3. Configure environment variables in `server/.env` as described above.

### Running in Development

To run both backend server and frontend client concurrently:
```bash
npm run dev
```

To run workspaces separately:
- Backend server only:
  ```bash
  npm run dev --workspace=server
  ```
- Frontend client only:
  ```bash
  npm run dev --workspace=client
  ```

Access the client at `http://localhost:5173` and the server at `http://localhost:5000`.

### Production Build

Compile the frontend bundle:
```bash
npm run build
```

Run the backend server in production:
```bash
npm run start
```

## Monorepo Scripts

- `npm run dev`: Concurrently runs server (nodemon) and client (Vite).
- `npm run build`: Compiles production assets across workspaces.
- `npm run start`: Starts production server in `server/`.

## API and Real-Time Event Architecture

### REST Endpoints

#### Authentication (`/api/auth`)
- `POST /register`: Create a recruiter account.
- `POST /login`: Authenticate and receive JWT.
- `GET /me`: Return current user profile.

#### Candidates (`/api/candidates`)
- `POST /upload`: Upload one or more resume PDF files.
- `GET /`: Retrieve candidate list with filters by project, stage, and score.
- `GET /:id`: Retrieve full candidate record including agent reports.
- `PATCH /:id/stage`: Update candidate hiring stage (triggers WebSocket event).
- `POST /:id/evaluate`: Manually re-trigger the agent evaluation pipeline.

#### Projects (`/api/projects`)
- `GET /`: List recruitment projects.
- `POST /`: Create a new project with title, description, and required skills.
- `GET /:id`: Retrieve project details and associated candidates.

#### Analytics (`/api/analytics`)
- `GET /overview`: Returns aggregate pipeline counts, pass rates, and score distributions.

### WebSocket Events (`Socket.io`)
- `candidate:created`: Broadcast when a new resume is parsed and added.
- `candidate:updated`: Broadcast when candidate details or stages change.
- `agent:progress`: Broadcast when an evaluation agent completes a sub-task.
- `agent:completed`: Broadcast when the full multi-agent pipeline finishes.

## License

This project is licensed under the ISC License.
