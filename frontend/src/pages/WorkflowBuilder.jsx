import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Play, Save, Settings, Layers, ArrowRight, ShieldCheck, Terminal, Cpu, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function WorkflowBuilder() {
  const navigate = useNavigate();

  const [workflowName, setWorkflowName] = useState('Custom Enterprise Swarm DAG');
  const [nodes, setNodes] = useState([
    { id: 'n1', agent: 'Planner', name: 'Task DAG Breakdown', role: 'Decomposes objective into DAG subtasks', timeout: 5 },
    { id: 'n2', agent: 'Memory', name: 'pgvector Epistemic Cache', role: 'Queries vector store with time-decay scoring', timeout: 3 },
    { id: 'n3', agent: 'Research', name: 'Web Search & Trafilatura Scraper', role: 'Scrapes live web sources for context', timeout: 10 },
    { id: 'n4', agent: 'Coder', name: 'Sandboxed Python Interpreter', role: 'Executes Python code in gVisor container', timeout: 5 },
    { id: 'n5', agent: 'Critic', name: 'ICML 2025 Verification & Report', role: 'Evaluates output quality against >0.8 score threshold', timeout: 4 }
  ]);

  const addNode = (agentType) => {
    const newNode = {
      id: `n${nodes.length + 1}`,
      agent: agentType,
      name: `Custom ${agentType} Node`,
      role: `Custom execution logic for ${agentType} worker`,
      timeout: 5
    };
    setNodes([...nodes, newNode]);
  };

  const removeNode = (id) => {
    setNodes(nodes.filter(n => n.id !== id));
  };

  const handleLaunchCustomSwarm = () => {
    navigate('/dashboard');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8 select-none relative z-10 text-zinc-100 font-sans">
      
      {/* Header */}
      <div className="cosmo-card p-6 bg-[#0d0e12] border border-zinc-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 text-[11px] font-mono font-medium flex items-center space-x-1.5">
              <Terminal size={12} className="text-zinc-400" />
              <span>VISUAL STATEGRAPH BUILDER</span>
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white font-heading tracking-tight">
            Visual StateGraph DAG Builder
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed font-sans">
            Visually configure custom worker agent swarms, tool bindings, timeout thresholds, and execution topologies.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleLaunchCustomSwarm}
            className="bg-white hover:bg-zinc-200 text-black text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer shadow-sm"
          >
            <Play size={13} />
            <span>Launch Custom Swarm</span>
          </button>
        </div>
      </div>

      {/* Builder Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Palette: Add Node */}
        <div className="lg:col-span-4 cosmo-card p-6 bg-[#0d0e12] border border-zinc-800 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white font-heading">Add Agent Worker Node</h3>
          <p className="text-xs text-zinc-400 font-mono">Select specialized worker templates to append to the DAG chain</p>

          <div className="grid grid-cols-1 gap-2.5 pt-2">
            {[
              { type: 'Supervisor', desc: 'State Machine Router' },
              { type: 'Planner', desc: 'DAG Task Breakdown' },
              { type: 'Research', desc: 'Web Scraper & Tavily Search' },
              { type: 'Memory', desc: 'pgvector Epistemic Cache' },
              { type: 'Coder', desc: 'Sandboxed Python Interpreter' },
              { type: 'Critic', desc: 'ICML 2025 Consensus Evaluator' },
              { type: 'SecurityAuditor', desc: 'AST Vulnerability Scanner' }
            ].map((tmpl) => (
              <button
                key={tmpl.type}
                onClick={() => addNode(tmpl.type)}
                className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 hover:border-zinc-700 text-left flex items-center justify-between transition-colors cursor-pointer group"
              >
                <div>
                  <p className="text-xs font-bold text-white font-heading">{tmpl.type} Agent</p>
                  <p className="text-[10px] text-zinc-500 font-mono">{tmpl.desc}</p>
                </div>
                <Plus size={14} className="text-zinc-500 group-hover:text-white transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Canvas: Connected Node Sequence */}
        <div className="lg:col-span-8 cosmo-card p-6 bg-[#0d0e12] border border-zinc-800 rounded-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white font-heading">Execution Node Sequence</h3>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">{nodes.length} Configured Worker Nodes in DAG Chain</p>
            </div>

            <button
              onClick={() => setNodes([])}
              className="text-xs text-rose-400 hover:text-rose-300 font-mono"
            >
              Clear Canvas
            </button>
          </div>

          <div className="space-y-3">
            {nodes.map((node, index) => (
              <React.Fragment key={node.id}>
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-mono font-bold text-zinc-400">
                      {index + 1}
                    </span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-xs font-bold text-white font-heading">{node.name}</h4>
                        <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.2 rounded">
                          {node.agent}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 font-mono mt-0.5">{node.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-[10px] font-mono text-zinc-500">Timeout: {node.timeout}s</span>
                    <button
                      onClick={() => removeNode(node.id)}
                      className="p-1.5 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {index < nodes.length - 1 && (
                  <div className="flex justify-center my-1">
                    <ArrowRight size={14} className="text-zinc-600 rotate-90" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
