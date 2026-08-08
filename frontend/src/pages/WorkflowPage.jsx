import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, FastForward, CheckCircle2, ArrowRight, Code, Activity, Terminal } from 'lucide-react';
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

export default function WorkflowPage() {
  const [activeStage, setActiveStage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState('payload');

  const workflowNodes = [
    { id: 'user', name: 'User Input', role: 'Prompt Ingestion', latency: 15, Icon: Terminal },
    { id: 'orchestrator', name: 'Orchestrator', role: 'Swarm Dispatcher', latency: 25, Icon: SupervisorIcon },
    { id: 'planner', name: 'Planner Agent', role: 'DAG Breakdown', latency: 42, Icon: PlannerIcon },
    { id: 'research', name: 'Research Agent', role: 'Vector & Search Query', latency: 85, Icon: ResearcherIcon },
    { id: 'memory', name: 'Memory Agent', role: 'Context Cache', latency: 18, Icon: MemoryIcon },
    { id: 'tool', name: 'Tool Calling', role: 'API Integration', latency: 65, Icon: ToolIcon },
    { id: 'execution', name: 'Execution Agent', role: 'Sandbox Runtime', latency: 72, Icon: ExecutionIcon },
    { id: 'verification', name: 'Verification', role: 'Consensus & Logic', latency: 38, Icon: ReasoningIcon },
    { id: 'response', name: 'Final Output', role: 'Response Stream', latency: 12, Icon: CheckCircle2 }
  ];

  const nodePayloads = {
    user: {
      prompt: "Build a production-ready authentication service with OAuth2 & JWT tokens in Python",
      user_id: "usr_882941",
      priority: "HIGH",
      timestamp: "2026-08-05T21:12:00Z"
    },
    orchestrator: {
      routing_target: "planner_agent",
      swarm_mode: "DAG_PARALLEL",
      cluster_health: "OPTIMAL"
    },
    planner: {
      dag_tasks: [
        "Validate JWT token schema",
        "Generate OAuth2 authentication handler script",
        "Run gVisor static code verification"
      ]
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8 select-none relative z-10 text-zinc-100 font-sans">
      
      {/* Header Banner - Clean Linear Style */}
      <div className="cosmo-card p-6 bg-[#0d0e12] border border-zinc-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 text-[11px] font-mono font-medium flex items-center space-x-1.5">
              <Terminal size={12} className="text-zinc-400" />
              <span>ORCHESTRATION PIPELINE INSPECTOR</span>
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white font-heading tracking-tight">
            Agent Workflow Pipeline Inspector
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed font-sans">
            Visualize, step through, and audit real-time payload states across the 9-stage orchestration chain.
          </p>
        </div>

        {/* Simulation Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="bg-white hover:bg-zinc-200 text-black text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer shadow-sm"
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span>{isPlaying ? 'Pause Swarm' : 'Start Swarm'}</span>
          </button>

          <button
            onClick={() => setActiveStage((prev) => (prev + 1) % workflowNodes.length)}
            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
          >
            Next Step
          </button>

          <button
            onClick={() => { setActiveStage(0); setIsPlaying(false); }}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Node Flow Horizontal Bar */}
      <div className="cosmo-card p-6 bg-[#0d0e12] border border-zinc-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white font-heading">Orchestration Flow Sequence</h3>
          <span className="text-[11px] font-mono text-zinc-500">Click any node to inspect payload state</span>
        </div>

        <div className="flex items-center space-x-3 overflow-x-auto pb-2">
          {workflowNodes.map((node, index) => {
            const IconComp = node.Icon;
            const isActive = index === activeStage;
            const isDone = index < activeStage;

            return (
              <React.Fragment key={node.id}>
                <button
                  onClick={() => setActiveStage(index)}
                  className={`p-3.5 rounded-xl border text-left flex flex-col justify-between min-w-[130px] transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-zinc-900 border-zinc-500 text-white shadow-md'
                      : isDone
                      ? 'bg-zinc-950/80 border-zinc-800/80 text-zinc-300'
                      : 'bg-zinc-950/40 border-zinc-900 text-zinc-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <IconComp className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                    <span className="text-[10px] font-mono text-zinc-500">{node.latency}ms</span>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs font-bold text-white font-heading truncate">{node.name}</p>
                    <p className="text-[10px] text-zinc-500 font-mono truncate">{node.role}</p>
                  </div>
                </button>

                {index < workflowNodes.length - 1 && (
                  <ArrowRight size={14} className="text-zinc-600 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Inspector Panel */}
      <div className="cosmo-card p-6 bg-[#0d0e12] border border-zinc-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-white font-heading">Inspector:</span>
            <span className="text-xs font-mono text-zinc-300 bg-zinc-900 px-2.5 py-0.5 rounded border border-zinc-800">
              {workflowNodes[activeStage].name}
            </span>
          </div>

          <div className="flex items-center space-x-2 text-xs font-sans">
            {['payload', 'trace'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-colors cursor-pointer ${
                  activeTab === tab
                    ? 'bg-zinc-800 text-white border border-zinc-700'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800/60'
                }`}
              >
                {tab === 'payload' ? 'Node Payload JSON' : 'Trace Waterfall'}
              </button>
            ))}
          </div>
        </div>

        {/* JSON Reader - Monaco Dark Style */}
        <div className="bg-[#050507] border border-zinc-800 rounded-xl p-4 font-mono text-xs text-zinc-300 overflow-x-auto">
          <pre className="text-zinc-300">
            {JSON.stringify(nodePayloads[workflowNodes[activeStage].id] || { node_id: workflowNodes[activeStage].id, status: "WAITING_EXECUTION" }, null, 2)}
          </pre>
        </div>
      </div>

    </div>
  );
}
