import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  SupervisorIcon,
  PlannerIcon,
  ResearcherIcon,
  MemoryIcon,
  BrowserIcon,
  ToolIcon,
  ReasoningIcon,
  ExecutionIcon
} from '../components/icons/CustomIcons';
import { ArrowRight, CheckCircle2, Search, Code2, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Features() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const agentsList = [
    {
      id: 'supervisor',
      name: 'Supervisor Agent',
      category: 'orchestration',
      role: 'Master Graph Orchestrator',
      accuracy: '99.98%',
      description: 'Maintains state consistency, manages edge transitions, and delegates work to specialized worker sub-agents.',
      Icon: SupervisorIcon,
      tools: ['State Machine Reducer', 'Redis Pub/Sub Stream', 'Event Bus Dispatcher']
    },
    {
      id: 'planner',
      name: 'Planner Agent',
      category: 'orchestration',
      role: 'DAG Task Strategist',
      accuracy: '98.5%',
      description: 'Decomposes high-level natural language goals into a directed acyclic graph (DAG) of executable subtasks with explicit dependencies.',
      Icon: PlannerIcon,
      tools: ['Tree-of-Thought Decomposition', 'Dependency Graph Resolver', 'Subtask Parameter Formatter']
    },
    {
      id: 'researcher',
      name: 'Research Agent',
      category: 'search',
      role: 'Web & Document Intelligence',
      accuracy: '96.2%',
      description: 'Crawls web documentation, pricing tables, and PDFs using Tavily Search & Trafilatura content extractors.',
      Icon: ResearcherIcon,
      tools: ['Tavily Search API', 'Trafilatura Page Reader', 'HTML Clean & Markdown Converter']
    },
    {
      id: 'memory',
      name: 'Memory Agent',
      category: 'storage',
      role: 'Epistemic Vector Store',
      accuracy: '99.1%',
      description: 'Manages cross-session vector embeddings using pgvector with time-decay confidence scoring (arXiv:2511.03506).',
      Icon: MemoryIcon,
      tools: ['pgvector Cosine Search', 'Time-Decay Freshness Scorer', 'Memory Confidence Evaluator']
    },
    {
      id: 'browser',
      name: 'Browser Agent',
      category: 'search',
      role: 'Headless DOM Automation',
      accuracy: '94.8%',
      description: 'Performs dynamic JavaScript SPA interactions, form filling, and DOM element extractions.',
      Icon: BrowserIcon,
      tools: ['Headless Chromium Runner', 'DOM Visual Grounding', 'Screenshot State Capture']
    },
    {
      id: 'tool',
      name: 'Tool Agent',
      category: 'execution',
      role: 'External API Dispatcher',
      accuracy: '99.5%',
      description: 'Parses OpenAPI schemas, injects OAuth2 authorization headers, and executes third-party REST API webhooks.',
      Icon: ToolIcon,
      tools: ['OpenAPI Schema Parser', 'OAuth2 Token Injector', 'Webhook Payload Validator']
    },
    {
      id: 'reasoning',
      name: 'Reasoning Agent',
      category: 'orchestration',
      role: 'Critic & Quality Verification',
      accuracy: '97.4%',
      description: 'Evaluates worker agent output against quality thresholds (>0.8 score). Triggers automated re-prompt retries upon low scores.',
      Icon: ReasoningIcon,
      tools: ['Chain-of-Thought Evaluator', 'ICML 2025 Attribution Engine', 'Auto-Healing Retry Prompting']
    },
    {
      id: 'execution',
      name: 'Execution Agent',
      category: 'execution',
      role: 'Sandboxed Python Runtime',
      accuracy: '99.9%',
      description: 'Safely executes Python 3.11 scripts, data processing loops, and AST static validations inside isolated subprocess containers.',
      Icon: ExecutionIcon,
      tools: ['Sandboxed Python Subprocess', 'Memory-Bounded Resource Monitor', 'Traceback Diagnostic Reader']
    }
  ];

  const filteredAgents = agentsList.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          agent.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || agent.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12 select-none relative z-10 text-zinc-100">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 pt-4">
        <div className="inline-flex items-center space-x-2 bg-zinc-900 border border-zinc-800 px-4 py-1.5 rounded-full text-xs font-mono font-medium text-zinc-300 backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          <span>SPECIALIZED AGENT SWARM FLEET</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white font-heading leading-tight">
          8 Autonomous Agent Nodes. <br />
          <span className="text-zinc-400 font-normal">Zero Manual Intervention.</span>
        </h1>

        <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl mx-auto font-sans">
          Each agent operates as a specialized worker node inside the StateGraph pipeline with custom tool bindings and real-time telemetry.
        </p>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-950/80 border border-zinc-800/80 p-4 rounded-2xl backdrop-blur-xl">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 text-zinc-500" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search agent capabilities..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto">
          {['all', 'orchestration', 'search', 'execution', 'storage'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider font-semibold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-zinc-800 text-white border border-zinc-700'
                  : 'bg-zinc-900/50 text-zinc-400 hover:text-zinc-200 border border-zinc-800/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Agent Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredAgents.map((agent, index) => {
          const IconComp = agent.Icon;
          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="cosmo-card p-6 flex flex-col justify-between space-y-4 hover:border-zinc-700 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200">
                    <IconComp className="w-5 h-5 text-zinc-300" />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded-md border border-zinc-800">
                    {agent.accuracy}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white font-heading">{agent.name}</h3>
                  <p className="text-[11px] text-zinc-400 font-mono mt-0.5">{agent.role}</p>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  {agent.description}
                </p>
              </div>

              <div className="border-t border-zinc-800/80 pt-3 space-y-1.5">
                <p className="text-[10px] font-mono uppercase font-bold text-zinc-400">Tool Bindings:</p>
                <div className="flex flex-wrap gap-1">
                  {agent.tools.map((t, idx) => (
                    <span key={idx} className="text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-0.5 rounded">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
