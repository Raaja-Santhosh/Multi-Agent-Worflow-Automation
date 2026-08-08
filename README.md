<div align="center">

# 🎼 OrchestraAI

### Multi-Agent Workflow Automation Platform

**React · FastAPI · LangGraph · Celery · Redis · PostgreSQL · WebSockets**

[![Python Tests](https://img.shields.io/badge/tests-59%20passed-brightgreen)](backend/tests/)
[![Python](https://img.shields.io/badge/python-3.11+-blue)](https://python.org)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

*Coordinate autonomous AI agents through one intelligent orchestration platform.*

</div>

---

## Overview

OrchestraAI is a production-grade multi-agent orchestration platform where **LangGraph agents autonomously decompose complex natural language goals** into parallel subtasks, execute them through specialized workers, and stream live reasoning traces to the frontend via WebSockets.

Unlike a single LLM call, OrchestraAI provides:
- **DAG-based task decomposition** — Goals are broken into dependency-aware subtask graphs
- **Specialized agent roles** — Planner, Research, Analyze, Summarize, Write, and Critic agents
- **Autonomous quality control** — A Critic agent reviews every output and triggers retries
- **Real-time observability** — Live WebSocket telemetry stream showing agent reasoning
- **Fault tolerance** — Persistent state in PostgreSQL; resume from any failure point

---

## Architecture

```
┌─────────────┐     ┌──────────────────────────────────────────────┐
│   React UI  │◄───►│              FastAPI Gateway                 │
│  (Vite)     │ WS  │  ┌──────┐  ┌──────────┐  ┌──────────────┐  │
└─────────────┘     │  │ Auth │  │ Task API │  │ Admin/Metrics│  │
                    │  │(JWT) │  │(CRUD)    │  │(SQL Agg)     │  │
                    │  └──┬───┘  └────┬─────┘  └──────────────┘  │
                    │     │Rate       │                            │
                    │     │Limit      │ Celery .delay()            │
                    └─────┼───────────┼────────────────────────────┘
                          │           ▼
                    ┌─────┴─────┐  ┌─────────────────────────────┐
                    │ PostgreSQL│  │     Celery Worker            │
                    │  (State)  │  │  ┌─────────────────────────┐│
                    └───────────┘  │  │   LangGraph StateGraph  ││
                                   │  │                         ││
                    ┌───────────┐  │  │  Planner ──► Router ──┐ ││
                    │   Redis   │◄─┤  │               │       │ ││
                    │ (Pub/Sub) │  │  │  ┌─────────┐  ▼       │ ││
                    └───────────┘  │  │  │ Critic  │◄─Worker  │ ││
                                   │  │  └────┬────┘          │ ││
                                   │  │       └──► Router ────┘ ││
                                   │  └─────────────────────────┘│
                                   └─────────────────────────────┘
```

### Agent Pipeline (LangGraph StateGraph)

| Agent | Role | Key Behavior |
|-------|------|--------------|
| **Planner** | Decomposes goal into subtask DAG | Outputs JSON with `depends_on` fields for dependency ordering |
| **Router** | Conditional edge function | Routes to next available subtask; skips those with unmet dependencies |
| **Workers** | Execute subtasks (research/analyze/summarize/write) | Compile context from prior completed subtasks for chain-of-thought |
| **Critic** | Quality gate | Reviews each output; can trigger retries on failure |

### LLM Resilience

All agents use a **4-model fallback chain** via LangChain's `with_fallbacks()`:

```
gemini-2.0-flash → gemini-2.0-flash-lite → gemini-2.5-flash-lite → gemini-3.5-flash-lite
```

If the primary model hits a rate limit (429), the system automatically cascades to the next model with an independent quota pool — **zero downtime, zero human intervention**.

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | React 19 + Vite + Framer Motion | Real-time dashboard with smooth animations |
| **API** | FastAPI + Pydantic v2 | Async Python with automatic OpenAPI docs |
| **Agent Framework** | LangGraph + LangChain | Deterministic state machine for multi-agent workflows |
| **Task Queue** | Celery + Redis | Async job execution with retry semantics |
| **Real-time** | Redis Pub/Sub + WebSockets | Sub-100ms event delivery to frontend |
| **Database** | PostgreSQL + SQLAlchemy | Persistent task state, obs logs, user auth |
| **Auth** | JWT + bcrypt + slowapi | Rate-limited endpoints with constant-time password comparison |
| **Infra** | Docker Compose | One-command development environment |

---

## Quick Start

### Prerequisites
- Docker Desktop
- Node.js 18+
- A Gemini API key ([Get one here](https://aistudio.google.com/apikey))

### 1. Clone & Configure

```bash
git clone https://github.com/Raaja-Santhosh/Multi-Agent-Worflow-Automation.git
cd Multi-Agent-Worflow-Automation
```

Create `backend/.env`:
```env
DATABASE_URL=postgresql+asyncpg://postgres:password@postgres:5432/agentdb
REDIS_URL=redis://redis:6379/0
GOOGLE_API_KEY=your_gemini_api_key_here
```

### 2. Start Backend (Docker)

```bash
docker compose up --build -d
```

This launches: PostgreSQL, Redis, FastAPI (port 8000), and Celery Worker.

### 3. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Testing

```bash
cd backend
python -m pytest tests/ -v --tb=short
```

**59 tests** covering:

| Module | Tests | Coverage |
|--------|-------|----------|
| `test_llm_factory.py` | 18 | Content normalization, fallback chain config, env overrides |
| `test_router.py` | 17 | DAG dependency routing, edge cases, parametrized status sweep |
| `test_planner.py` | 9 | JSON parsing, code fences, failure paths, list content format |
| `test_workers.py` | 15 | Subtask execution, context compilation, failure handling |

All tests mock external dependencies (LLM, Redis, Postgres) for fast, reliable CI execution.

---

## API Endpoints

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| `POST` | `/api/auth/register` | Create account | 3/min |
| `POST` | `/api/auth/login` | Get JWT token | 5/min |
| `POST` | `/api/task-runs` | Submit a goal | — |
| `GET` | `/api/task-runs` | List all runs | — |
| `GET` | `/api/task-runs/{id}` | Get run details | — |
| `GET` | `/api/admin/metrics` | Dashboard metrics | — |
| `WS` | `/ws/task-runs/{id}` | Live telemetry stream | — |
| `GET` | `/health` | Health check | — |

---

## Project Structure

```
├── backend/
│   ├── agents/
│   │   ├── llm.py          # LLM factory with 4-model fallback chain
│   │   ├── planner.py      # Goal → subtask DAG decomposition
│   │   ├── workers.py      # Specialized execution agents
│   │   ├── critic.py       # Autonomous quality reviewer
│   │   ├── graph.py        # LangGraph StateGraph definition
│   │   ├── emit.py         # Redis pub/sub event emitter
│   │   └── state.py        # TypedDict state schema
│   ├── app/
│   │   ├── main.py         # FastAPI app with rate limiting
│   │   ├── auth/           # JWT auth + bcrypt + slowapi
│   │   ├── tasks/          # Celery task dispatch
│   │   ├── admin/          # SQL aggregation metrics
│   │   ├── websocket/      # Real-time event streaming
│   │   └── models/         # SQLAlchemy models
│   └── tests/              # 59 pytest unit tests
├── frontend/
│   ├── src/
│   │   ├── pages/          # Dashboard, Landing, Features, etc.
│   │   ├── components/     # TaskTree, ActivityFeed, OutputPanel
│   │   └── hooks/          # useAgentStream WebSocket hook
│   └── public/
└── docker-compose.yml      # One-command infrastructure
```

---

## License

MIT
