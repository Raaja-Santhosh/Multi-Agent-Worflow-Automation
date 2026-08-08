<div align="center">

# 🎼 OrchestraAI
**The Autonomous Multi-Agent Swarm Orchestrator**

[![Python Tests](https://img.shields.io/badge/tests-59%20passed-brightgreen)](backend/tests/)
[![Python](https://img.shields.io/badge/python-3.11+-blue)](https://python.org)
[![React](https://img.shields.io/badge/react-19-61DAFB)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-009688)](https://fastapi.tiangolo.com)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

*Coordinate autonomous AI agents through one intelligent orchestration platform.*

[**Live Demo**](http://localhost:5173) • [**Architecture**](#architecture) • [**Getting Started**](#quick-start)

</div>

---

## ⚡ What is OrchestraAI?

OrchestraAI isn't just another LLM chatbot wrapper. It is a **production-grade multi-agent orchestration platform** that takes a single high-level goal and autonomously builds a specialized workforce to solve it. 

Using **LangGraph**, it dynamically breaks down complex objectives into a dependency-aware Directed Acyclic Graph (DAG) of subtasks. Then, it dispatches specialized agents (Researchers, Analyzers, Writers) to execute them in parallel, complete with real-time WebSocket telemetry, cross-session memory, sandboxed Python execution, and an autonomous Critic for quality control.

### ✨ Key Capabilities

- **🧠 Dynamic DAG Decomposition:** The Planner node breaks down your goal into a verifiable, dependency-aware graph of subtasks.
- **🛡️ Autonomous Critic Retry Loop:** Outputs are automatically scored. If the Critic gives a score below 0.6, the subtask is re-routed and retried autonomously.
- **🔍 Real-Time Web Search:** Research agents access live internet data via Tavily to pull facts, pricing, and citations rather than hallucinating.
- **💾 Cross-Session Memory:** `pgvector` injects past learnings into new plans, giving the platform long-term epistemic memory.
- **🐍 Sandboxed Execution:** Analyzers can securely execute generated Python code to crunch numbers or parse complex data structures.
- **🔄 LLM Resilience Chain:** Built-in 4-model fallback chain (Gemini 2.0 Flash → Flash Lite → 2.5 Flash Lite → 3.5 Flash Lite) ensures zero downtime during API rate limits.
- **📡 Sub-100ms Observability:** Watch the swarm "think" in real-time on the React dashboard via Redis Pub/Sub and WebSockets.

---

## 🏗️ Architecture

At its core, OrchestraAI separates the web gateway from the heavy-lifting agent swarm to ensure enterprise scalability.

```text
┌─────────────┐     ┌──────────────────────────────────────────────┐
│   React UI  │◄───►│              FastAPI Gateway                 │
│  (Vite)     │ WS  │  ┌──────┐  ┌──────────┐  ┌──────────────┐  │
│             │     │  │ Auth │  │ Task API │  │ Admin/Metrics│  │
└─────────────┘     │  │(JWT) │  │(CRUD)    │  │(SQL Agg)     │  │
                    │  └──┬───┘  └────┬─────┘  └──────────────┘  │
                    │     │Rate       │                            │
                    │     │Limit      │ Celery .delay()            │
                    └─────┼───────────┼────────────────────────────┘
                          │           ▼
                    ┌─────┴─────┐  ┌─────────────────────────────┐
                    │ PostgreSQL│  │     Celery Worker            │
                    │ (pgvector)│  │  ┌─────────────────────────┐│
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

---

## 🚀 Quick Start

### Prerequisites
- Docker Desktop
- Node.js 18+
- [Gemini API Key](https://aistudio.google.com/apikey)
- [Tavily API Key](https://tavily.com/) (For Web Search)

### 1. Clone & Configure

```bash
git clone https://github.com/Raaja-Santhosh/Multi-Agent-Worflow-Automation.git
cd Multi-Agent-Worflow-Automation
```

Create `backend/.env` with your API keys:
```env
DATABASE_URL=postgresql+asyncpg://postgres:password@postgres:5432/agentdb
REDIS_URL=redis://redis:6379/0
GOOGLE_API_KEY=your_gemini_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
MEMORY_ENABLED=true
ENABLE_CODE_EXEC=true
```

### 2. Launch the Swarm (Backend)

We use Docker Compose to spin up the entire infrastructure (PostgreSQL, Redis, FastAPI, Celery).

```bash
docker compose up --build -d
```

### 3. Launch the Dashboard (Frontend)

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Testing

The backend boasts a comprehensive test suite (59 tests) fully mocked for CI/CD integration, covering LLM fallback chains, DAG cycle detection, and JSON parsing edge cases.

```bash
cd backend
python -m pytest tests/ -v --tb=short
```

---

## 📂 Project Structure

```text
├── backend/
│   ├── agents/             # The brain: Planner, Workers, Critic, Memory, LangGraph
│   ├── app/                # The gateway: FastAPI, JWT, WebSockets, DB Models
│   └── tests/              # 59 Pytest unit tests (Mocked LLM & DB)
├── frontend/
│   ├── src/
│   │   ├── components/     # TaskTree, ActivityFeed, OutputPanel
│   │   ├── pages/          # Dashboard, Architecture, Pricing, etc.
│   │   └── hooks/          # Real-time WebSocket hook (useAgentStream)
└── docker-compose.yml      # Infrastructure orchestration
```

---
<div align="center">
<i>Built for the future of asynchronous work.</i>
</div>
