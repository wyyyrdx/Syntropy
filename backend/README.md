# Syntropy Backend

Syntropy is an AI-powered app that turns handwritten notes into interactive concept maps and quizzes. This service owns image upload, user auth, session management, and orchestrating the async AI processing job.

## Tech stack

- Node.js + Express 5
- SQLite (`better-sqlite3`)
- JWT auth (`jsonwebtoken` + `bcryptjs`)
- Multer for image uploads
- Swagger (`swagger-jsdoc` + `swagger-ui-express`) for live API docs

## Project structure

```
backend/
├── server.js                       # entry point
├── src/
│   ├── app.js                      # Express app setup, middleware, route mounting
│   ├── config/
│   │   ├── db.js                   # SQLite connection, applies schema.sql on boot
│   │   └── swagger.js              # Swagger/OpenAPI config
│   ├── controllers/
│   │   ├── authController.js       # register / login logic
│   │   └── notesController.js      # upload + status logic, async AI job
│   ├── middleware/
│   │   ├── upload.js               # multer config (image validation, storage)
│   │   └── requireAuth.js          # JWT verification, attaches req.user
│   └── routes/
│       ├── index.js                # aggregates all routers under /api
│       ├── health.js
│       ├── auth.js
│       └── notes.js
├── ai/
│   ├── generate.js                 # client for the AI engineer's FastAPI /generate service
│   └── matching.js                 # TBD - confirm scope with AI engineer
├── database/
│   └── schema.sql                  # users, sessions, notes, concepts, concept_edges, questions
├── data/                           # SQLite db file lives here (gitignored)
└── uploads/                        # uploaded note images (gitignored)
```

## Setup

```bash
cd backend
npm install
cp .env.example .env   # then fill in the values below
npm run dev
```

Server runs on `http://localhost:3000` by default.

### Environment variables

| Variable | Description | Example |
|---|---|---|
| `PORT` | Backend port | `3000` |
| `DB_PATH` | SQLite file location | `./data/syntropy.db` |
| `UPLOAD_DIR` | Where uploaded images are stored | `./uploads` |
| `JWT_SECRET` | Secret used to sign auth tokens | any long random string |
| `AI_SERVICE_URL` | Full URL to the AI engineer's `/generate` endpoint | `http://localhost:8000/generate` |
| `AI_UPLOADS_PATH_PREFIX` | Path prefix the AI service uses to find the uploaded image. Use `/app/uploads` for the future docker-compose setup, or the absolute local path to this backend's `uploads/` folder when running the AI service natively (no Docker) on the same machine | `C:/Users/you/Syntropy/backend/uploads` |
| `GEMINI_API_KEY` | Only needed if you're running the AI service yourself locally (its own env, not this backend's) | — |

## Running the AI service locally (no Docker)

The AI engineer's FastAPI service lives in `ai-models/` on their branch and isn't started by this backend automatically.

```bash
cd ai-models
pip install -r requirements.txt
$env:GEMINI_API_KEY = "your-key-here"     # PowerShell
uvicorn main:app --host 0.0.0.0 --port 8000
```

Keep it running in its own terminal, alongside `npm run dev` for the backend in another. Docker Compose to unify both into a single command is still pending (see "Known gaps" below).

## API overview

Full interactive docs (try requests straight from the browser): **`http://localhost:3000/api/docs`**

| Method | Endpoint | Auth required | Description |
|---|---|---|---|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/register` | No | Create account, returns `{ token, user }` |
| POST | `/api/auth/login` | No | Log in, returns `{ token, user }` |
| POST | `/api/notes/upload` | Yes | Upload a note image (`multipart/form-data`, field name `image`). Returns `{ session_id, status: "pending" }` immediately; processing happens in the background |
| GET | `/api/notes/status/:sessionId` | Yes | Poll for `pending` / `processing` / `completed` / `failed`. Returns the full concept graph (nodes, edges, questions) once completed |

All protected routes expect `Authorization: Bearer <token>`. A session's data is only visible to the user who created it.

## How upload → AI → status works

1. `POST /notes/upload` saves the image, creates a `sessions` row (`status: pending`), and responds right away with a `session_id` it does not wait for the AI call.
2. In the background, the server calls the AI service's `/generate` endpoint with the image path, and stores the returned concept graph (or the error, on failure) once it resolves.
3. The frontend polls `GET /notes/status/:sessionId` until `status` becomes `completed` or `failed`.

## AI service contract (confirmed with AI engineer)

- Endpoint: `POST /generate`, body `{ "image_path": "<path as seen by the AI service>" }`
- Success: full concept graph JSON (`subject_title`, `raw_transcription`, `nodes`, `edges`, `questions`)
- Failure: FastAPI `HTTPException` → `{ "detail": "..." }`
- Timeout: 60s client-side (extraction usually takes 10-15s)

## Known gaps / next steps

- `docker-compose.yml` to run backend + AI service together (not written yet)
- `ai/matching.js` — empty, scope unconfirmed with the AI engineer
- `src/routes/team.js` — team/collaboration endpoints not built yet
- Auth tokens expire after 7 days, no refresh flow (fine for hackathon scope)
