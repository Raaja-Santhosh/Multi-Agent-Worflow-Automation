import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ShimmerButton } from '../components/magicui/shimmer-button';
import { BentoGrid, BentoCard } from '../components/magicui/bento-grid';
import { DotPattern } from '../components/magicui/dot-pattern';
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
import { ArrowRight, CheckCircle2, Terminal, Play, ShieldCheck, Activity, Layers } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  const bespokeFeatures = [
    {
      name: 'Autonomous StateGraph Machine',
      description: 'Orchestrate deterministic multi-agent state routing with zero race conditions or infinite recursion loops.',
      Icon: SupervisorIcon,
      badge: 'Core Engine',
      className: 'md:col-span-2',
      background: <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/60 via-transparent to-transparent opacity-50" />
    },
    {
      name: 'Automated Failure Attribution',
      description: 'Pinpoints exact root cause failing agent steps directly addressing ICML 2025 research benchmark arXiv:2505.00212.',
      Icon: ReasonIconWrapper,
      badge: 'ICML 2025',
      className: 'md:col-span-1',
      background: <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-zinc-800/20 rounded-full blur-2xl" />
    },
    {
      name: 'pgvector Epistemic Memory',
      description: 'Confidence-weighted vector retrieval with time-decay freshness scoring preventing memory hallucination accumulation.',
      Icon: MemoryIcon,
      badge: 'arXiv:2511.03506',
      className: 'md:col-span-1',
      background: <div className="absolute -top-10 -left-10 w-48 h-48 bg-zinc-800/20 rounded-full blur-2xl" />
    },
    {
      name: 'Sandboxed Python Subprocess Executor',
      description: 'Isolated container runtime environment for algorithmic financial models and static AST code verification.',
      Icon: ExecutionIcon,
      badge: 'Secure Subprocess',
      className: 'md:col-span-2',
      background: <div className="absolute inset-0 bg-gradient-to-tl from-zinc-900/60 via-transparent to-transparent opacity-50" />
    }
  ];

  function ReasonIconWrapper(props) {
    return <ReasoningIcon {...props} />;
  }

  return (
    <div className="relative min-h-screen select-none overflow-hidden pb-24 text-zinc-100">
      {/* Magic UI Dot Pattern Overlay */}
      <DotPattern className="opacity-30" />

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-16 space-y-10 text-center">
        
        {/* Enterprise System Version Capsule */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center space-x-2 bg-zinc-900/90 border border-zinc-800/90 px-4 py-1.5 rounded-full text-xs font-mono font-medium text-zinc-300 backdrop-blur-md shadow-2xl"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>ORCHESTRAAI v2.4 • ACADEMIC MULTI-AGENT SWARM PROJECT</span>
        </motion.div>

        {/* Large Display Typography */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white font-heading leading-none">
            Multi-Agent <br />
            <span className="bg-gradient-to-r from-zinc-100 via-zinc-400 to-zinc-600 bg-clip-text text-transparent">
              Intelligence
            </span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed font-sans font-normal pt-2">
            Coordinate autonomous AI agents through one intelligent orchestration platform. 
            High-precision DAG task decomposition, sandboxed execution, and zero-hallucination memory pipelines.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <ShimmerButton onClick={() => navigate('/workspace')} className="text-sm py-4 px-8 font-bold">
            <Play size={15} className="fill-white" />
            <span>Open Interactive Workspace</span>
          </ShimmerButton>

          <Link
            to="/builder"
            className="text-xs font-semibold text-zinc-300 hover:text-white px-7 py-4 rounded-full border border-zinc-800 bg-zinc-950/80 hover:bg-zinc-900 transition-all backdrop-blur-md"
          >
            Visual StateGraph Builder
          </Link>
        </div>

        {/* Bespoke Awwwards 3D Visual Asset Hero Card */}
        <div className="pt-8 max-w-5xl mx-auto">
          <div className="cosmo-card p-2 sm:p-3 relative overflow-hidden rounded-3xl group">
            <img
              src="/assets/hero_network.jpg"
              alt="OrchestraAI 3D Multi-Agent Topology"
              className="w-full h-[380px] sm:h-[480px] object-cover rounded-2xl border border-zinc-800/80 transition-transform duration-700 group-hover:scale-[1.01]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#040406] via-transparent to-transparent opacity-80" />

            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between backdrop-blur-xl bg-zinc-950/80 border border-zinc-800 p-4 rounded-2xl text-left">
              <div>
                <p className="text-xs font-bold text-white font-heading">StateGraph Execution Mesh</p>
                <p className="text-[11px] text-zinc-400 font-mono">Real-time DAG subtask routing engine • 140ms latency</p>
              </div>
              <Link
                to="/workspace"
                className="text-xs font-semibold text-zinc-200 hover:text-white bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full transition-all flex items-center space-x-1.5"
              >
                <Play size={12} className="fill-white" />
                <span>Run Objective Now</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Magic UI Bento Grid Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 space-y-8 pt-16">
        <div className="text-center space-y-2">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-heading tracking-tight">
            Engineered For Technical Performance
          </h2>
          <p className="text-xs text-zinc-400 max-w-lg mx-auto font-mono">
            Zero sloppy AI tropes. Built on deterministic state reducers & academic benchmarks.
          </p>
        </div>

        <BentoGrid>
          {bespokeFeatures.map((feature, idx) => (
            <BentoCard key={idx} {...feature} href="/architecture" cta="Read Architecture Spec" />
          ))}
        </BentoGrid>
      </div>
    </div>
  );
}
