import React from 'react';
import { motion } from 'framer-motion';
import { Database, ShieldCheck, TrendingUp, Cpu, ArrowRight, CheckCircle2, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Solutions() {
  const solutionsList = [
    {
      id: 'data-pipeline',
      title: 'Enterprise Competitive Intelligence & ETL',
      subtitle: 'Structured Extraction from Unstructured Web Feeds',
      description: 'Deploy Research and Browser agents to continuously scrape, clean, and summarize multi-source competitor documentation, SEC filings, and product updates.',
      Icon: Database,
      capabilities: [
        'Multi-source DOM parsing & HTML markdown conversion',
        'Automatic schema extraction into PostgreSQL / JSON',
        'Vector similarity deduplication via pgvector'
      ],
      metrics: 'Latency < 450ms per document'
    },
    {
      id: 'devsecops',
      title: 'Autonomous DevSecOps & Code Audit',
      subtitle: 'Static Analysis & gVisor Subprocess Sandbox Execution',
      description: 'Execute Code and Reasoning agents in gVisor sandboxes to audit pull requests, run static AST verifications, and detect security vulnerabilities before deployment.',
      Icon: ShieldCheck,
      capabilities: [
        'AST static code validation & vulnerability scanning',
        'Isolated Python 3.11 subprocess execution',
        'Automated pull request diff generation'
      ],
      metrics: 'Zero host memory leaks'
    },
    {
      id: 'financial-modelling',
      title: 'Quantitative Financial & Risk Analytics',
      subtitle: 'Deterministic Mathematical Modeling',
      description: 'Orchestrate Execution agents to compute Monte Carlo portfolio simulations, Black-Scholes options pricing, and automated risk reporting.',
      Icon: TrendingUp,
      capabilities: [
        'NumPy & SciPy math computation in sandboxed containers',
        'Real-time token usage telemetry tracking',
        'ICML 2025 Failure Attribution for calculation errors'
      ],
      metrics: '99.9% state machine consistency'
    },
    {
      id: 'self-healing',
      title: 'Infrastructure Automation Loops',
      subtitle: 'StateGraph Exception Handling & Recovery',
      description: 'When worker steps fail due to rate limits or API timeouts, the Supervisor agent evaluates surrounding logs and applies exponential backoff auto-healing retries.',
      Icon: Cpu,
      capabilities: [
        'Automatic failure attribution (arXiv:2505.00212)',
        'Contextual retry prompt injection',
        'Redis Pub/Sub WebSocket incident alerts'
      ],
      metrics: 'Automated 3-step error recovery'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12 select-none relative z-10 text-zinc-100">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3 pt-4">
        <div className="inline-flex items-center space-x-2 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-md text-[11px] font-mono text-zinc-400">
          <Terminal size={13} className="text-zinc-400" />
          <span>ENTERPRISE ARCHITECTURE SOLUTIONS</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white font-heading leading-tight">
          System Infrastructure Solutions
        </h1>

        <p className="text-sm text-zinc-400 leading-relaxed font-sans max-w-xl mx-auto">
          Deterministic multi-agent state machines tailored for high-throughput enterprise workloads.
        </p>
      </div>

      {/* Solutions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {solutionsList.map((sol, index) => {
          const IconComp = sol.Icon;
          return (
            <motion.div
              key={sol.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="cosmo-card p-6 flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200">
                    <IconComp size={20} />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2.5 py-1 rounded border border-zinc-800">
                    {sol.metrics}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white font-heading">{sol.title}</h3>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">{sol.subtitle}</p>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  {sol.description}
                </p>

                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <p className="text-[10px] font-mono uppercase font-bold text-zinc-400">Technical Capabilities:</p>
                  <ul className="space-y-1.5">
                    {sol.capabilities.map((cap, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-xs text-zinc-300">
                        <CheckCircle2 size={14} className="text-zinc-400 mt-0.5 shrink-0" />
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/architecture"
                  className="inline-flex items-center space-x-2 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
                >
                  <span>Inspect System Architecture</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
