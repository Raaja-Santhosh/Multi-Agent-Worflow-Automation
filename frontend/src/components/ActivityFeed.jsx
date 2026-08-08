import React, { useEffect, useRef } from 'react';
import { Terminal, CheckCircle2, XCircle, AlertCircle, Loader2, ArrowRight, Activity } from 'lucide-react';

export default function ActivityFeed({ events }) {
  const feedEndRef = useRef(null);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  const getAgentBadge = (agent) => {
    switch (agent?.toLowerCase()) {
      case 'planner':
        return 'border-purple-500/30 text-purple-300 bg-purple-950/40';
      case 'researcher':
        return 'border-cyan-500/30 text-cyan-300 bg-cyan-950/40';
      case 'analyst':
        return 'border-amber-500/30 text-amber-300 bg-amber-950/40';
      case 'summarizer':
        return 'border-indigo-500/30 text-indigo-300 bg-indigo-950/40';
      case 'writer':
        return 'border-emerald-500/30 text-emerald-300 bg-emerald-950/40';
      case 'critic':
        return 'border-pink-500/30 text-pink-300 bg-pink-950/40';
      case 'memory':
        return 'border-blue-500/30 text-blue-300 bg-blue-950/40';
      default:
        return 'border-white/10 text-gray-400 bg-black/40';
    }
  };

  const getStatusIcon = (status, isLatest) => {
    switch (status) {
      case 'running':
        // Only spin if it's the absolute latest event in the feed
        return isLatest ? <Loader2 size={14} className="animate-spin text-cyan-400" /> : <CheckCircle2 size={14} className="text-emerald-400 opacity-50" />;
      case 'complete':
        return <CheckCircle2 size={14} className="text-emerald-400" />;
      case 'retrying':
        return isLatest ? <AlertCircle size={14} className="text-amber-400 animate-pulse" /> : <AlertCircle size={14} className="text-amber-400 opacity-50" />;
      case 'failed':
        return <XCircle size={14} className="text-rose-400" />;
      default:
        return <Activity size={14} className="text-gray-400" />;
    }
  };

  return (
    <div className="cosmo-card rounded-3xl p-6 flex flex-col h-[420px]">
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
        <div className="flex items-center space-x-2">
          <div className="bg-cyan-500/10 p-2 rounded-xl text-cyan-400 border border-cyan-500/20">
            <Terminal size={16} />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Agent Telemetry Stream</h3>
            <p className="text-[10px] text-gray-500">Real-Time WebSocket Event Feed</p>
          </div>
        </div>

        {events.length > 0 && (
          <span className="flex items-center space-x-2 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-full text-[10px] text-cyan-300 font-bold tracking-wider">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <span>STREAMING</span>
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
        {events.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 my-8">
            <div className="bg-white/[0.03] border border-white/10 p-4 rounded-2xl mb-3">
              <Terminal size={28} className="stroke-[1.5] opacity-40" />
            </div>
            <p className="text-xs font-semibold text-gray-400">Telemetry Feed Ready</p>
            <p className="text-[11px] mt-1 max-w-xs text-gray-500">
              Live agent traces and tool output messages will stream here when an objective is executing.
            </p>
          </div>
        ) : (
          events.map((event, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 p-3.5 bg-white/[0.02] hover:bg-white/[0.04] rounded-2xl border border-white/5 transition-all duration-200 animate-fadeIn"
            >
              <div className="mt-0.5 bg-black/60 p-1.5 rounded-xl border border-white/10 shrink-0">
                {getStatusIcon(event.status, index === events.length - 1)}
              </div>

              <div className="flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getAgentBadge(event.agent)}`}>
                      {event.agent}
                    </span>

                    {event.tool && event.tool !== 'none' && (
                      <>
                        <ArrowRight size={10} className="text-gray-600" />
                        <span className="text-[10px] font-mono bg-black/60 text-cyan-300 border border-white/10 px-2 py-0.5 rounded-md">
                          {event.tool}
                        </span>
                      </>
                    )}
                  </div>

                  <span className="text-[10px] text-gray-500 font-mono">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed font-sans select-text">
                  {event.message}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={feedEndRef} />
      </div>
    </div>
  );
}
