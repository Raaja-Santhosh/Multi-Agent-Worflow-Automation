import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Code2, Terminal, Copy, Check, ChevronRight, Search, FileText, Layers, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DocumentationPreview() {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('quickstart');

  const samplePythonCode = `from orchestra_ai import StateGraph, AgentNode, TavilySearchTool, MemoryStore

# 1. Initialize State Graph
graph = StateGraph()

# 2. Add Specialized Agent Nodes
graph.add_node("planner", AgentNode.planner(model="claude-sonnet-4-6"))
graph.add_node("researcher", AgentNode.researcher(tools=[TavilySearchTool()]))
graph.add_node("critic", AgentNode.critic(threshold=0.8))

# 3. Connect Execution Edges
graph.add_edge("planner", "researcher")
graph.add_edge("researcher", "critic")

# 4. Run Async Orchestration
result = graph.run("Research top 5 CRMs and generate comparative analysis")
print(result.deliverable)`;

  const handleCopy = () => {
    navigator.clipboard.writeText(samplePythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12 select-none relative z-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 pt-4">
        <div className="inline-flex items-center space-x-2 bg-white/[0.04] border border-white/10 px-4 py-1.5 rounded-full text-xs font-semibold text-gray-300 backdrop-blur-md">
          <BookOpen size={14} className="text-cyan-400" />
          <span className="uppercase tracking-widest text-[10px]">DEVELOPER DOCUMENTATION</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white font-heading leading-tight">
          OrchestraAI Technical Guide & SDK
        </h1>

        <p className="text-sm text-gray-400 leading-relaxed max-w-2xl mx-auto">
          Complete API specifications, LangGraph state machine definitions, custom tool handlers, and WebSocket telemetry schemas.
        </p>
      </div>

      {/* Docs Layout split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-3 cosmo-card p-4 space-y-2">
          <div className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Getting Started</div>
          <button
            onClick={() => setActiveTab('quickstart')}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
              activeTab === 'quickstart' ? 'bg-white/10 text-white border border-white/10' : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>Python SDK Quickstart</span>
            <ChevronRight size={14} />
          </button>
          <button
            onClick={() => setActiveTab('rest-api')}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
              activeTab === 'rest-api' ? 'bg-white/10 text-white border border-white/10' : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>REST API Spec</span>
            <ChevronRight size={14} />
          </button>
          <button
            onClick={() => setActiveTab('websocket')}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
              activeTab === 'websocket' ? 'bg-white/10 text-white border border-white/10' : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>WebSocket Event Stream</span>
            <ChevronRight size={14} />
          </button>
          <button
            onClick={() => setActiveTab('memory')}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
              activeTab === 'memory' ? 'bg-white/10 text-white border border-white/10' : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>pgvector Memory Store</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Code & Content Main Area */}
        <div className="lg:col-span-9 cosmo-card p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center space-x-2">
              <Code2 size={18} className="text-cyan-400" />
              <h3 className="text-base font-bold text-white font-heading">
                {activeTab === 'quickstart' && 'Python SDK Quickstart Example'}
                {activeTab === 'rest-api' && 'REST API Endpoints Specification'}
                {activeTab === 'websocket' && 'WebSocket JSON Event Schema'}
                {activeTab === 'memory' && 'pgvector Memory Confidence Formula'}
              </h3>
            </div>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-gray-300 hover:text-white text-xs flex items-center space-x-1.5 cursor-pointer"
            >
              {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span className="text-[11px] font-semibold">{copied ? 'Copied Code' : 'Copy SDK Code'}</span>
            </button>
          </div>

          {activeTab === 'quickstart' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-300 leading-relaxed">
                Install the official OrchestraAI Python package via pip to define custom agent graphs:
              </p>

              <div className="bg-[#020305] border border-white/10 rounded-2xl p-4 font-mono text-xs text-cyan-300">
                $ pip install orchestra-ai tavily-python sentence-transformers
              </div>

              <pre className="bg-[#020305] border border-white/10 rounded-2xl p-4 font-mono text-xs text-gray-200 overflow-x-auto">
                <code>{samplePythonCode}</code>
              </pre>
            </div>
          )}

          {activeTab === 'rest-api' && (
            <div className="space-y-4 text-xs">
              <p className="text-gray-300">FastAPI backend REST API endpoint endpoints:</p>
              <div className="space-y-2 font-mono">
                <div className="p-3 bg-black/60 border border-white/10 rounded-xl flex items-center justify-between">
                  <span className="text-emerald-400 font-bold">POST /api/task-runs</span>
                  <span className="text-gray-400">Trigger new autonomous goal run</span>
                </div>
                <div className="p-3 bg-black/60 border border-white/10 rounded-xl flex items-center justify-between">
                  <span className="text-blue-400 font-bold">GET /api/task-runs/&#123;id&#125;</span>
                  <span className="text-gray-400">Retrieve task run details & deliverable</span>
                </div>
                <div className="p-3 bg-black/60 border border-white/10 rounded-xl flex items-center justify-between">
                  <span className="text-rose-400 font-bold">GET /api/task-runs/&#123;id&#125;/attribution</span>
                  <span className="text-gray-400">ICML 2025 failure attribution root cause</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'websocket' && (
            <div className="space-y-4 text-xs">
              <p className="text-gray-300">WebSocket JSON payload streamed over <code className="text-cyan-300 font-mono">ws://localhost:8000/ws/&#123;run_id&#125;</code>:</p>
              <pre className="bg-[#020305] border border-white/10 rounded-2xl p-4 font-mono text-xs text-cyan-300 overflow-x-auto">
{`{
  "run_id": "b83d9a1f-4c2e-4b9a-8f1d-92a10b3e5f60",
  "agent": "researcher",
  "tool": "web_search",
  "status": "running",
  "message": "Searching Tavily for top 5 CRM pricing tiers...",
  "data": { "subtask_id": "subtask_1" },
  "timestamp": "2026-08-05T12:00:00Z"
}`}
              </pre>
            </div>
          )}

          {activeTab === 'memory' && (
            <div className="space-y-4 text-xs">
              <p className="text-gray-300">pgvector Memory Confidence Index formula (arXiv:2511.03506):</p>
              <pre className="bg-[#020305] border border-white/10 rounded-2xl p-4 font-mono text-xs text-amber-300 overflow-x-auto">
{`freshness = max(0, 1.0 - (days_since_created / 30))
similarity = cosine_similarity_score  # pgvector embedding
confidence = (freshness * 0.4) + (similarity * 0.6)

if confidence >= 0.5:
    inject_as = "[VERIFIED MEMORY — use as established context]"
else:
    inject_as = "[LOW CONFIDENCE — treat as hint, verify with tool call]"`}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
