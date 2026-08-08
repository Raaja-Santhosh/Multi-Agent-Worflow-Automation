import React, { useState, useEffect } from 'react';
import { Play, Terminal, Grid, AlertTriangle, ArrowRight, Check, Cpu } from 'lucide-react';
import client from '../api/client';
import useAgentStream from '../hooks/useAgentStream';
import ActivityFeed from '../components/ActivityFeed';
import TaskTree from '../components/TaskTree';
import OutputPanel from '../components/OutputPanel';
import FailurePanel from '../components/FailurePanel';

export default function Dashboard() {
  const [goal, setGoal] = useState('');
  const [runId, setRunId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [runData, setRunData] = useState(null);
  const [currentSubtaskId, setCurrentSubtaskId] = useState(null);
  const [livePlan, setLivePlan] = useState(null);

  const { events, isConnected } = useAgentStream(runId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!goal.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setRunData(null);
      setCurrentSubtaskId(null);
      setLivePlan(null);

      const res = await client.post('/task-runs', { goal });
      setRunId(res.data.id);
      setRunData(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to trigger workflow. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (events.length === 0) return;
    const latestEvent = events[events.length - 1];

    if (latestEvent.data && latestEvent.data.subtasks) {
      setLivePlan(latestEvent.data);
    }

    if (latestEvent.data && latestEvent.data.subtask_id) {
      setCurrentSubtaskId(latestEvent.data.subtask_id);
    }

    if (latestEvent.status === 'complete' || latestEvent.status === 'failed') {
      fetchRunDetails();
    }
  }, [events]);

  useEffect(() => {
    if (!runId || (runData && (runData.status === 'complete' || runData.status === 'failed'))) {
      return;
    }

    const interval = setInterval(() => {
      fetchRunDetails();
    }, 3000);

    return () => clearInterval(interval);
  }, [runId, runData]);

  const fetchRunDetails = async () => {
    if (!runId) return;
    try {
      const res = await client.get(`/task-runs/${runId}`);
      setRunData(res.data);
    } catch (err) {
      console.error('Error syncing run status:', err);
    }
  };

  const isRunning = runData?.status === 'running' || runData?.status === 'pending';
  const isFailed = runData?.status === 'failed';

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-12 select-none relative z-10 text-zinc-100">
      
      {/* Refined Enterprise Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 pt-4">
        <div className="inline-flex items-center space-x-2 bg-zinc-900 border border-zinc-800 px-4 py-1.5 rounded-full text-xs font-mono font-medium text-zinc-300 backdrop-blur-md">
          <Cpu size={14} className="text-zinc-400" />
          <span className="uppercase tracking-widest text-[10px]">WORKFORCE CONSOLE</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white font-heading leading-tight">
          Autonomous Agent Swarm Workspace
        </h1>

        <p className="text-sm text-zinc-400 leading-relaxed font-normal max-w-xl mx-auto">
          Dispatch high-level computational objectives across your dedicated StateGraph worker network.
        </p>
      </div>

      {/* Feature Card Container (Task Intent Ingestion + System Architecture Capabilities) */}
      <div className="cosmo-card p-8 sm:p-10 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Objective Input */}
          <div className="lg:col-span-8 space-y-4">
            <div>
              <h2 className="text-xl font-bold text-white font-heading">Objective Ingestion</h2>
              <p className="text-xs text-zinc-400 mt-1">
                Specify your technical goal. The Planner node will generate a verified DAG execution matrix.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="relative">
                <textarea
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. Research top 5 SaaS competitors, analyze pricing tiers via sandboxed Python script, and generate executive brief"
                  disabled={isRunning || loading}
                  rows={3}
                  className="w-full bg-zinc-950/90 border border-zinc-800 rounded-2xl p-4 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700 transition-all duration-200 resize-none select-text font-sans"
                  required
                />
              </div>

              {error && (
                <div className="bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs rounded-xl p-3 flex items-start space-x-2">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                {runId && (
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="text-zinc-500 font-mono">Run:</span>
                    <span className="font-mono text-zinc-300 font-semibold">{runId.slice(0, 8)}...</span>
                    <span className={`ml-2 h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isRunning || loading || !goal.trim()}
                  className="bg-white hover:bg-zinc-200 text-black text-xs font-bold py-3 px-6 rounded-full transition-all duration-200 flex items-center space-x-2 disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-lg ml-auto"
                >
                  {loading ? (
                    <span>Initiating...</span>
                  ) : (
                    <>
                      <span>Dispatch Objective</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Platform Specifications */}
          <div className="lg:col-span-4 bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-mono uppercase font-bold text-zinc-300 tracking-wider">System Specifications</h3>
            <ul className="space-y-3 text-xs text-zinc-400">
              <li className="flex items-center space-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                <span className="text-zinc-300">StateGraph Finite State Machine</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                <span className="text-zinc-300">pgvector Epistemic Memory Cache</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                <span className="text-zinc-300">Sandboxed Python Subprocess Executor</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                <span className="text-zinc-300">ICML 2025 Failure Attribution Engine</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                <span className="text-zinc-300">Redis Pub/Sub Real-time Telemetry</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Failure panel display */}
      {isFailed && runId && (
        <FailurePanel runId={runId} />
      )}

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Task Decomposition Tree */}
        <div className="lg:col-span-5 h-[520px]">
          <TaskTree
            plan={livePlan || runData?.plan}
            currentSubtaskId={currentSubtaskId}
            runStatus={runData?.status}
          />
        </div>

        {/* Right: Live Telemetry & Output */}
        <div className="lg:col-span-7 space-y-8">
          <ActivityFeed events={events} />
          
          <OutputPanel
            result={runData?.result}
            status={runData?.status}
          />
        </div>
      </div>
    </div>
  );
}
