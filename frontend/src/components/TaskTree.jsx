import React from 'react';
import { GitCommit, HelpCircle, CheckCircle2, Loader2, XCircle, Layers } from 'lucide-react';

export default function TaskTree({ plan, currentSubtaskId, runStatus }) {
  if (!plan || !plan.subtasks || plan.subtasks.length === 0) {
    return (
      <div className="cosmo-card p-6 flex flex-col items-center justify-center text-center h-full text-gray-500 min-h-[380px]">
        <div className="bg-white/[0.03] border border-white/10 p-4 rounded-2xl mb-3">
          <GitCommit size={28} className="text-gray-400 stroke-[1.5] animate-pulse" />
        </div>
        <h4 className="text-sm font-bold text-gray-300 font-heading">No Subtasks Planned Yet</h4>
        <p className="text-xs text-gray-500 mt-1 max-w-xs">
          The Planner agent will decompose your goal into executable subtasks here.
        </p>
      </div>
    );
  }

  const getSubtaskStatus = (subtask) => {
    if (runStatus === 'complete') return 'complete';
    if (runStatus === 'failed' && subtask.id === currentSubtaskId) return 'failed';
    if (subtask.id === currentSubtaskId) return 'running';
    
    const isCompleted = plan.subtasks.indexOf(subtask) < plan.subtasks.findIndex(s => s.id === currentSubtaskId);
    if (isCompleted && currentSubtaskId) return 'complete';

    return 'pending';
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'running':
        return {
          card: 'bg-white/[0.04] border-white/20 shadow-lg ring-1 ring-white/10',
          badge: 'bg-white/10 text-white border-white/20',
          text: 'text-white font-semibold',
          icon: <Loader2 size={16} className="animate-spin text-white" />
        };
      case 'complete':
        return {
          card: 'bg-black/40 border-white/5 opacity-80',
          badge: 'bg-white/5 text-gray-400 border-white/10',
          text: 'text-gray-400 line-through decoration-gray-700',
          icon: <CheckCircle2 size={16} className="text-gray-400" />
        };
      case 'failed':
        return {
          card: 'bg-red-950/20 border-red-500/30 shadow-lg',
          badge: 'bg-red-950/40 text-red-400 border-red-500/30',
          text: 'text-gray-200 font-semibold',
          icon: <XCircle size={16} className="text-red-400" />
        };
      default:
        return {
          card: 'bg-black/30 border-white/5 opacity-60',
          badge: 'bg-white/5 text-gray-500 border-white/10',
          text: 'text-gray-400',
          icon: <HelpCircle size={16} className="text-gray-600" />
        };
    }
  };

  return (
    <div className="cosmo-card p-6 flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
        <div className="flex items-center space-x-2">
          <div className="bg-white/5 p-2 rounded-xl text-gray-300 border border-white/10">
            <Layers size={16} />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm font-heading">Subtask Decomposition</h3>
            <p className="text-[10px] text-gray-500">LangGraph Execution Tree</p>
          </div>
        </div>
        <span className="text-[10px] uppercase font-bold tracking-widest bg-white/5 text-gray-300 border border-white/10 px-2.5 py-0.5 rounded-full">
          {plan.subtasks.length} Nodes
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
        {plan.subtasks.map((subtask, index) => {
          const status = getSubtaskStatus(subtask);
          const style = getStatusStyle(status);

          return (
            <div
              key={subtask.id}
              className={`p-4 rounded-2xl border transition-all duration-300 ${style.card} relative`}
            >
              {index < plan.subtasks.length - 1 && (
                <div className="absolute left-[29px] bottom-[-20px] top-[48px] w-0.5 bg-white/10 -z-10 border-dashed" />
              )}

              <div className="flex items-start space-x-3">
                <div className="mt-0.5 bg-black p-2 rounded-xl border border-white/10 shadow-md">
                  {style.icon}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 font-heading">
                      Node {index + 1}: <span className="font-mono text-white">{subtask.id}</span>
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${style.badge}`}>
                      {status}
                    </span>
                  </div>

                  <p className={`text-xs leading-relaxed ${style.text}`}>
                    {subtask.description}
                  </p>

                  <div className="border-t border-white/5 pt-2.5 mt-2.5 space-y-1 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-500 font-bold uppercase">Worker Type:</span>
                      <span className="font-mono text-xs text-gray-200 bg-black/60 border border-white/10 px-2 py-0.5 rounded-md">
                        {subtask.type}
                      </span>
                    </div>

                    {subtask.depends_on && subtask.depends_on.length > 0 && (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Depends On:</span>
                        <div className="flex gap-1">
                          {subtask.depends_on.map(dep => (
                            <span key={dep} className="font-mono text-[10px] bg-black border border-white/10 px-1.5 py-0.5 rounded text-gray-400">
                              {dep}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
