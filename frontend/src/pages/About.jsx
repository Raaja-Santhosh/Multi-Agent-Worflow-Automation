import React from 'react';
import { ShieldCheck, Database, Terminal, ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12 select-none relative z-10 text-zinc-100">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3 pt-4">
        <div className="inline-flex items-center space-x-2 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-md text-[11px] font-mono text-zinc-400">
          <Terminal size={13} className="text-zinc-400" />
          <span>RESEARCH FOUNDATIONS & MISSION</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white font-heading leading-tight">
          Grounded in Peer-Reviewed AI Research
        </h1>

        <p className="text-sm text-zinc-400 leading-relaxed font-sans max-w-xl mx-auto">
          OrchestraAI addresses open challenges in LLM multi-agent failure attribution and long-term memory staleness.
        </p>
      </div>

      {/* Research Paper Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        
        {/* Paper 1: Failure Attribution */}
        <div className="cosmo-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 rounded">
              ICML 2025 SPOTLIGHT
            </span>
            <span className="text-[11px] font-mono text-zinc-500">arXiv:2505.00212</span>
          </div>

          <h3 className="text-lg font-bold text-white font-heading">
            Automated Failure Attribution in Multi-Agent Systems
          </h3>

          <p className="text-xs text-zinc-300 leading-relaxed font-sans">
            Existing diagnostic tools achieve only 53.5% accuracy in identifying the failure-responsible agent step. OrchestraAI implements causal counterfactual inference across 3-step log windows to pinpoint exact root-cause subtasks.
          </p>

          <div className="border-t border-zinc-800 pt-3">
            <Link
              to="/architecture"
              className="inline-flex items-center space-x-2 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
            >
              <span>Inspect Attribution Engine</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Paper 2: Epistemic Memory */}
        <div className="cosmo-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 rounded">
              MEMORY BENCHMARK
            </span>
            <span className="text-[11px] font-mono text-zinc-500">arXiv:2511.03506</span>
          </div>

          <h3 className="text-lg font-bold text-white font-heading">
            Time-Decay Freshness Scoring in Vector Memory
          </h3>

          <p className="text-xs text-zinc-300 leading-relaxed font-sans">
            Prevents stale vector embeddings from accumulating in long-running agent workflows. Combines cosine similarity distance with exponential decay half-life equations to evaluate vector confidence scores.
          </p>

          <div className="border-t border-zinc-800 pt-3">
            <Link
              to="/docs"
              className="inline-flex items-center space-x-2 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
            >
              <span>Read Memory Spec</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
