import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  Database,
  Radio,
  ShieldCheck,
  Terminal,
  ArrowRight,
  GitBranch,
  CheckCircle2,
  AlertTriangle,
  Code
} from 'lucide-react';

const FAULT_ATTRIBUTION_TREE = [
  {
    id: 'node-root',
    title: 'Execution Interruption Detected',
    type: 'root',
    confidence: '100%',
    description: 'Subprocess code interpreter timed out after 5000ms threshold.',
    children: [
      {
        id: 'cause-1',
        title: 'Memory Context Staleness (arXiv:2511.03506)',
        probability: 0.74,
        causalImpact: 'High',
        counterfactual: 'If decay half-life was 24h instead of 6h, vector similarity score would be 0.88 (+0.23).',
        recommendation: 'Trigger pgvector HNSW re-index & update decay half-life to 24h.'
      },
      {
        id: 'cause-2',
        title: 'Serper Web API Rate Limit Backoff',
        probability: 0.21,
        causalImpact: 'Medium',
        counterfactual: 'Serper API returned HTTP 429 after 15 requests/min burst.',
        recommendation: 'Activate Celery exponential retry backoff with jitter.'
      },
      {
        id: 'cause-3',
        title: 'Unbounded Subprocess Loop in Code Agent',
        probability: 0.05,
        causalImpact: 'Low',
        counterfactual: 'gVisor seccomp filter caught raw socket call.',
        recommendation: 'Enforce static AST syntax checks prior to gVisor container dispatch.'
      }
    ]
  }
];

export default function Architecture() {
  const [activeTab, setActiveTab] = useState('stategraph');

  const stateNodes = [
    { id: 'entry', title: '1. Input Ingestion', type: 'TypedDict { prompt: str }', role: 'ENTRY' },
    { id: 'router', title: '2. Orchestrator Router', type: 'PlannerState { plan: List[Task] }', role: 'LLM ROUTER', active: true },
    { id: 'tools', title: '3. Tool Execution Node', type: 'ToolState { calls: List[Call] }', role: 'BRANCH NODE' },
    { id: 'critic', title: '4. Critic & Refiner', type: 'EvalResult { score: float }', role: 'CONDITIONAL' },
    { id: 'exit', title: '5. Output Synthesizer', type: 'FinalOutput { response: str }', role: 'EXIT NODE' }
  ];

  return (
    <div className="min-h-screen bg-[#08090a] text-zinc-100 py-10 px-6 font-sans select-none">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Architecture Header Hero Banner - Clean Linear Style */}
        <div className="cosmo-card p-8 relative overflow-hidden bg-[#0d0e12] border border border-zinc-800 rounded-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center space-x-2.5">
                <span className="px-2.5 py-1 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 text-[11px] font-mono font-medium flex items-center space-x-1.5">
                  <Terminal size={12} className="text-zinc-400" />
                  <span>Technical System Architecture</span>
                </span>
                <span className="px-2.5 py-1 rounded text-[11px] font-mono bg-zinc-900 text-zinc-500 border border-zinc-800">
                  OrchestraAI v2.4
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-heading tracking-tight">
                Distributed Multi-Agent Architecture
              </h1>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                StateGraph finite state machines, pgvector memory embedding pipelines, Redis Pub/Sub event bus, gVisor sandboxed Python executor, and ICML 2025 Failure Attribution Engine.
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-col gap-2 min-w-[220px]">
              {[
                { id: 'stategraph', label: 'StateGraph Machine', icon: GitBranch },
                { id: 'pgvector', label: 'pgvector RAG Pipeline', icon: Database },
                { id: 'redis', label: 'Redis Event Bus', icon: Radio },
                { id: 'sandbox', label: 'Python Sandbox', icon: ShieldCheck },
                { id: 'icml', label: 'ICML 2025 Failure Engine', icon: Layers }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-mono text-left transition-colors cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-zinc-800 text-white font-semibold border border-zinc-700'
                        : 'bg-zinc-950/60 text-zinc-400 hover:text-zinc-200 border border-zinc-900'
                    }`}
                  >
                    <Icon size={14} className="shrink-0 text-zinc-400" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* StateGraph Section */}
        {activeTab === 'stategraph' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="cosmo-card p-6 space-y-6 bg-[#0d0e12] border border-zinc-800 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white font-heading">StateGraph Execution Topology</h2>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">LangGraph-compatible state transition engine with conditional routing</p>
                </div>
                <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400">
                  Deterministic State Router
                </span>
              </div>

              {/* Node Sequence Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {stateNodes.map((node) => (
                  <div
                    key={node.id}
                    className={`p-4 rounded-xl border text-xs flex flex-col justify-between space-y-3 transition-colors ${
                      node.active
                        ? 'bg-zinc-900 border-zinc-600 text-white shadow-lg'
                        : 'bg-zinc-950/80 border-zinc-800/80 text-zinc-400'
                    }`}
                  >
                    <div>
                      <span className="text-[11px] text-zinc-400 font-medium font-sans">{node.role}</span>
                      <h4 className="text-xs font-bold text-white mt-1 font-heading">{node.title}</h4>
                    </div>
                    <div className="bg-zinc-950 p-2 rounded border border-zinc-800 text-[10px] text-zinc-400 font-mono overflow-x-auto">
                      {node.type}
                    </div>
                  </div>
                ))}
              </div>

              {/* Code Chrome Block - Monaco Dark Style */}
              <div className="bg-[#050507] border border-zinc-800 rounded-xl overflow-hidden">
                <div className="bg-zinc-900/90 px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-400">
                  <div className="flex items-center space-x-2">
                    <Code size={14} className="text-zinc-400" />
                    <span>StateGraph Reducer Definition (Python)</span>
                  </div>
                  <span className="text-[10px] text-zinc-500">Node: ORCHESTRATOR</span>
                </div>

                <div className="p-4 text-xs font-mono text-zinc-300 leading-relaxed overflow-x-auto">
                  <pre className="text-zinc-300">
{`from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated, List

class AgentState(TypedDict):
    messages: List[dict]
    memory_context: List[dict]
    tool_outputs: List[dict]
    current_node: str
    retry_count: int

def orchestrator_router_node(state: AgentState) -> AgentState:
    """StateGraph Node: Evaluates task plan and dispatches worker nodes."""
    plan = planner_llm.invoke(state["messages"])
    if state["retry_count"] > 3:
        return {"current_node": "critic_evaluator", "status": "RETRY_EXCEEDED"}
    return {"current_node": "tool_execution", "plan": plan}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* pgvector Section */}
        {activeTab === 'pgvector' && (
          <div className="cosmo-card p-6 space-y-4 bg-[#0d0e12] border border-zinc-800 rounded-2xl animate-fadeIn">
            <h2 className="text-lg font-bold text-white font-heading">pgvector Epistemic Memory Pipeline</h2>
            <p className="text-xs text-zinc-400 font-mono">arXiv:2511.03506 time-decay vector confidence indexing</p>

            <div className="bg-[#050507] border border-zinc-800 rounded-xl p-4 text-xs font-mono text-zinc-300">
              <p className="text-zinc-400">// Confidence score decay formula:</p>
              <p className="text-white mt-1">Score = (CosineSimilarity * 0.6) + (ExpDecay(t_hours, half_life=24h) * 0.4)</p>
            </div>
          </div>
        )}

        {/* Redis Event Bus */}
        {activeTab === 'redis' && (
          <div className="cosmo-card p-6 space-y-4 bg-[#0d0e12] border border-zinc-800 rounded-2xl animate-fadeIn">
            <h2 className="text-lg font-bold text-white font-heading">Redis Pub/Sub Low-Latency Event Bus</h2>
            <p className="text-xs text-zinc-400 font-mono">&lt; 1.5ms WebSocket state stream propagation</p>
          </div>
        )}

        {/* Python Sandbox */}
        {activeTab === 'sandbox' && (
          <div className="cosmo-card p-6 space-y-4 bg-[#0d0e12] border border-zinc-800 rounded-2xl animate-fadeIn">
            <h2 className="text-lg font-bold text-white font-heading">Sandboxed Subprocess Execution Environment</h2>
            <p className="text-xs text-zinc-400 font-mono">gVisor seccomp isolated Python 3.11 container runner</p>
          </div>
        )}

        {/* ICML 2025 Engine */}
        {activeTab === 'icml' && (
          <div className="cosmo-card p-6 space-y-4 bg-[#0d0e12] border border-zinc-800 rounded-2xl animate-fadeIn">
            <h2 className="text-lg font-bold text-white font-heading">ICML 2025 Failure Attribution Engine</h2>
            <p className="text-xs text-zinc-400 font-mono">arXiv:2505.00212 causal counterfactual inference</p>
          </div>
        )}

      </div>
    </div>
  );
}
