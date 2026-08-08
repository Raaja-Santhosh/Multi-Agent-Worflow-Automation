import React, { useState, useEffect } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Clock, HelpCircle, ArrowRight, ShieldAlert } from 'lucide-react';
import client from '../api/client';
import { Link } from 'react-router-dom';

export default function FailurePanel({ runId }) {
  const [attribution, setAttribution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandLogs, setExpandLogs] = useState(false);

  useEffect(() => {
    if (!runId) return;

    const fetchAttribution = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await client.get(`/task-runs/${runId}/attribution`);
        setAttribution(res.data);
      } catch (err) {
        console.error('Failed to load failure attribution:', err);
        setError('Failure diagnostic trace not available for this run.');
      } finally {
        setLoading(false);
      }
    };

    fetchAttribution();
  }, [runId]);

  if (loading) {
    return (
      <div className="bg-[#0d0e12] border border-zinc-800 border-l-4 border-l-amber-500 rounded-xl p-5 animate-pulse flex items-center space-x-3">
        <HelpCircle className="text-amber-400 shrink-0" size={20} />
        <div>
          <h4 className="text-xs font-bold text-zinc-200">Executing Causal Failure Attribution (arXiv:2505.00212)...</h4>
          <p className="text-[11px] text-zinc-500 mt-0.5 font-mono">Evaluating counterfactual trace paths across StateGraph nodes</p>
        </div>
      </div>
    );
  }

  if (error || !attribution) {
    return (
      <div className="bg-[#0d0e12] border border-zinc-800 rounded-xl p-4 text-center">
        <p className="text-xs text-zinc-500 font-mono">{error || 'No failure attribution diagnostic compiled.'}</p>
      </div>
    );
  }

  const { root_cause_agent, root_cause_step, confidence, explanation, surrounding_logs } = attribution;

  return (
    <div className="bg-[#0d0e12] border border-zinc-800 border-l-4 border-l-rose-500 rounded-xl p-6 space-y-5 shadow-xl">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-rose-950/40 border border-rose-800/60 p-2.5 rounded-lg text-rose-400">
            <AlertTriangle size={20} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40">
                Root Cause Attribution
              </span>
              <span className="text-xs text-zinc-500 font-mono">
                Confidence: <strong className="text-zinc-300">{(confidence * 100).toFixed(0)}%</strong>
              </span>
            </div>
            <h3 className="text-sm font-bold text-white font-heading mt-1">Diagnostic Failure Analysis</h3>
          </div>
        </div>
        <span className="text-[10px] font-mono text-zinc-500">arXiv:2505.00212</span>
      </div>

      <div className="bg-zinc-950 border border-zinc-800/80 rounded-lg p-3.5">
        <p className="text-xs leading-relaxed text-zinc-300 font-sans">
          {explanation}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-lg p-3 flex items-center justify-between">
          <span className="text-zinc-500">Responsible Node:</span>
          <span className="font-bold text-zinc-200 capitalize">{root_cause_agent || 'Unknown'}</span>
        </div>

        <div className="bg-zinc-950 border border-zinc-800/80 rounded-lg p-3 flex items-center justify-between">
          <span className="text-zinc-500">Failing Tool / Action:</span>
          <span className="font-bold text-rose-400">{root_cause_step || 'none'}</span>
        </div>
      </div>

      <div className="border-t border-zinc-800/80 pt-3">
        <button
          onClick={() => setExpandLogs(!expandLogs)}
          className="flex items-center justify-between w-full text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <span className="font-medium">Inspect 3-Step Surrounding Trace Window</span>
          {expandLogs ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {expandLogs && surrounding_logs && (
          <div className="mt-3 space-y-2.5 animate-fadeIn">
            {surrounding_logs.map((log, idx) => {
              const isRoot = log.agent === root_cause_agent && log.tool === root_cause_step;
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border text-xs font-mono ${
                    isRoot
                      ? 'bg-rose-950/20 border-rose-800/60'
                      : 'bg-zinc-950 border-zinc-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${log.success ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'}`}>
                        {log.success ? 'PASS' : 'FAIL'}
                      </span>
                      <span className="font-bold text-zinc-200 capitalize">{log.agent}</span>
                      {log.tool && log.tool !== 'none' && (
                        <span className="text-zinc-500">→ {log.tool}</span>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-500">{log.latency_ms}ms</span>
                  </div>
                  {log.error_msg && (
                    <p className="mt-2 text-rose-300 text-[11px] whitespace-pre-wrap">{log.error_msg}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
