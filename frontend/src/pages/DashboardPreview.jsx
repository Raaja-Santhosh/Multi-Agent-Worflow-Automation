import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Layers,
  Database,
  Activity,
  Terminal,
  Cpu,
  Clock,
  ShieldCheck,
  Server,
  Play,
  ArrowRight,
  Sliders,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const mockTelemetryData = [
  { time: '00:00', prompt: 1200, completion: 450 },
  { time: '04:00', prompt: 2100, completion: 890 },
  { time: '08:00', prompt: 4500, completion: 1800 },
  { time: '12:00', prompt: 8200, completion: 3400 },
  { time: '16:00', prompt: 6100, completion: 2600 },
  { time: '20:00', prompt: 3900, completion: 1500 },
  { time: '23:59', prompt: 2400, completion: 980 }
];

export default function DashboardPreview() {
  const [activeTab, setActiveTab] = useState('fleet');

  const fleetAgents = [
    { name: 'Supervisor Orchestrator', status: 'ACTIVE', load: '14%', latency: '22ms', role: 'State Machine Reducer' },
    { name: 'Planner Agent', status: 'ACTIVE', load: '32%', latency: '45ms', role: 'DAG Task Breakdown' },
    { name: 'Research Intelligence', status: 'ACTIVE', load: '68%', latency: '120ms', role: 'Vector Search & Scraper' },
    { name: 'Memory Epistemic Cache', status: 'ACTIVE', load: '21%', latency: '18ms', role: 'pgvector Freshness Index' }
  ];

  return (
    <div className="min-h-screen bg-[#08090a] text-zinc-100 py-8 px-6 font-sans select-none">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header - Clean Vercel Style */}
        <div className="cosmo-card p-6 bg-[#0d0e12] border border-zinc-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 text-[11px] font-mono font-medium flex items-center space-x-1.5">
                <Terminal size={12} className="text-zinc-400" />
                <span>ENTERPRISE WORKFORCE CONSOLE</span>
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white font-heading tracking-tight">
              Enterprise Multi-Agent Dashboard
            </h1>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              Real-time agent swarm telemetry, state machine execution visualizer, and token cost analytics.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button className="bg-white hover:bg-zinc-200 text-black text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer shadow-sm">
              <Play size={13} />
              <span>Trigger Test Workflow</span>
            </button>
          </div>
        </div>

        {/* Metric Cards Row - Solid Clean Slate */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="cosmo-card p-5 bg-[#0d0e12] border border-zinc-800 rounded-xl space-y-2">
            <span className="text-xs font-sans font-medium text-zinc-400">Agent Fleet Status</span>
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-extrabold text-white font-heading">8 / 10</p>
              <span className="text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-0.5 rounded">
                80% Active
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 font-mono">Planner, Memory, Coder online</p>
          </div>

          <div className="cosmo-card p-5 bg-[#0d0e12] border border-zinc-800 rounded-xl space-y-2">
            <span className="text-xs font-sans font-medium text-zinc-400">Celery Worker Queue</span>
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-extrabold text-white font-heading">3 Tasks</p>
              <span className="text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-0.5 rounded">
                14/16 Workers
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 font-mono">Throughput: 58 tasks/min</p>
          </div>

          <div className="cosmo-card p-5 bg-[#0d0e12] border border-zinc-800 rounded-xl space-y-2">
            <span className="text-xs font-sans font-medium text-zinc-400">Total Tool Executions</span>
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-extrabold text-white font-heading">1,428</p>
              <span className="text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-0.5 rounded">
                +14.2%
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 font-mono">Serper, Code Sandbox, RAG</p>
          </div>

          <div className="cosmo-card p-5 bg-[#0d0e12] border border-zinc-800 rounded-xl space-y-2">
            <span className="text-xs font-sans font-medium text-zinc-400">Cost Today (Est.)</span>
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-extrabold text-white font-heading">$1.482</p>
              <span className="text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-0.5 rounded">
                Cap: $15.00
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 font-mono">p90 Latency: 255ms</p>
          </div>
        </div>

        {/* StateGraph Timeline Row */}
        <div className="cosmo-card p-6 bg-[#0d0e12] border border-zinc-800 rounded-2xl space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white font-heading">StateGraph Workflow Timeline (#wf-8821)</h3>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">Interactive LangGraph step execution visualizer</p>
            </div>
            <span className="text-xs font-mono bg-zinc-900 border border-zinc-800 text-zinc-300 px-3 py-1 rounded">
              Step 4: Python Code Synthesis
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs font-mono">
            {[
              { step: 'STEP 1', title: 'Intent Analysis', status: 'DONE', time: '142ms' },
              { step: 'STEP 2', title: 'Vector Knowledge', status: 'DONE', time: '68ms' },
              { step: 'STEP 3', title: 'Serper Web Search', status: 'DONE', time: '410ms' },
              { step: 'STEP 4', title: 'Code Synthesis', status: 'RUNNING', time: '820ms', active: true },
              { step: 'STEP 5', title: 'ICML Attribution', status: 'PENDING', time: '--' }
            ].map((st, i) => (
              <div
                key={i}
                className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2 ${
                  st.active
                    ? 'bg-zinc-900 border-zinc-600 text-white'
                    : 'bg-zinc-950/80 border-zinc-800 text-zinc-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500 font-bold">{st.step}</span>
                  <span className="text-[10px] text-zinc-400">{st.time}</span>
                </div>
                <p className="text-xs font-bold text-white font-heading">{st.title}</p>
                <span className="text-[10px] font-mono text-zinc-500">{st.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Telemetry Chart & Memory Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Recharts Telemetry (Clean Dark Stroke) */}
          <div className="lg:col-span-8 cosmo-card p-6 bg-[#0d0e12] border border-zinc-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white font-heading">Token Usage Telemetry</h3>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">Prompt vs Completion token distribution over time</p>
              </div>
              <div className="flex items-center space-x-3 text-xs font-mono text-zinc-400">
                <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded bg-zinc-200" /><span>Prompt Tokens</span></span>
                <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded bg-zinc-600" /><span>Completion</span></span>
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockTelemetryData}>
                  <XAxis dataKey="time" stroke="#52525b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#52525b" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#090a0d', borderColor: '#27272a', borderRadius: '8px', fontSize: '11px', color: '#fff' }} />
                  <Area type="monotone" dataKey="prompt" stroke="#e4e4e7" fill="rgba(228, 228, 231, 0.08)" strokeWidth={2} />
                  <Area type="monotone" dataKey="completion" stroke="#71717a" fill="rgba(113, 113, 122, 0.08)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right: Memory Confidence Engine */}
          <div className="lg:col-span-4 cosmo-card p-6 bg-[#0d0e12] border border-zinc-800 rounded-2xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-white font-heading">Memory Confidence Engine</h3>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">arXiv:2511.03506 vector decay score index</p>
            </div>

            <div className="space-y-3 font-mono text-xs pt-2">
              {[
                { title: 'User Auth Service Spec', score: '98%', status: 'Active' },
                { title: 'Redis Cluster Failover', score: '85%', status: 'Active' },
                { title: 'pgvector Cosine Index', score: '74%', status: 'Decaying' }
              ].map((item, idx) => (
                <div key={idx} className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white font-heading text-xs">{item.title}</p>
                    <p className="text-[10px] text-zinc-500">{item.status}</p>
                  </div>
                  <span className="text-xs font-bold text-zinc-300 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                    {item.score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
