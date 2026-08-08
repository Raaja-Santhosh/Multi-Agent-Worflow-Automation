import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal, GitBranch, Globe, Share2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative z-10 bg-[#08090a] border-t border-zinc-800 text-zinc-400 text-xs py-12 px-8 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand & Status Column */}
        <div className="md:col-span-2 space-y-4">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white font-bold text-xs">
              <Terminal size={12} className="text-zinc-300" />
            </div>
            <span className="text-sm font-bold tracking-tight text-white font-heading uppercase">
              ORCHESTRA<span className="text-zinc-500 font-normal">AI</span>
            </span>
          </Link>

          <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
            Distributed multi-agent orchestration platform. High-precision DAG state machines, sandboxed execution, and pgvector memory pipelines.
          </p>

          <div className="flex items-center space-x-2 text-[11px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-md w-fit">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>OPERATIONAL • v2.4.0 RELEASE</span>
          </div>
        </div>

        {/* Links Column 1: Workspace & Engine */}
        <div className="space-y-3">
          <h5 className="font-bold text-white uppercase tracking-wider font-mono text-[11px]">Platform Core</h5>
          <ul className="space-y-2 text-zinc-400">
            <li><Link to="/workspace" className="hover:text-white transition-colors">Interactive Workspace</Link></li>
            <li><Link to="/builder" className="hover:text-white transition-colors">Visual StateGraph Builder</Link></li>
            <li><Link to="/history" className="hover:text-white transition-colors">Execution History Archives</Link></li>
            <li><Link to="/architecture" className="hover:text-white transition-colors">System Architecture</Link></li>
            <li><Link to="/features" className="hover:text-white transition-colors">Specialized Agent Nodes</Link></li>
          </ul>
        </div>

        {/* Links Column 2: Resources & Research */}
        <div className="space-y-3">
          <h5 className="font-bold text-white uppercase tracking-wider font-mono text-[11px]">Research & Specs</h5>
          <ul className="space-y-2 text-zinc-400">
            <li><Link to="/docs" className="hover:text-white transition-colors">Documentation & API Docs</Link></li>
            <li><Link to="/about" className="hover:text-white transition-colors">arXiv:2505.00212 Benchmark</Link></li>
            <li><Link to="/about" className="hover:text-white transition-colors">arXiv:2511.03506 Memory Scoring</Link></li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto border-t border-zinc-800/80 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 font-mono">
        <p>© 2026 OrchestraAI Project. Open-Source Academic Multi-Agent OS.</p>
        <div className="flex space-x-4 mt-2 sm:mt-0">
          <Link to="/docs" className="hover:text-zinc-400">API Documentation</Link>
          <Link to="/workspace" className="hover:text-zinc-400">Launch Workspace</Link>
        </div>
      </div>
    </footer>
  );
}
