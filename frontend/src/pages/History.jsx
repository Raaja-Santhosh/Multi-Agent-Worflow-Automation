import React, { useState, useEffect } from 'react';
import { History, Eye, Calendar, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw, X, ArrowLeft, Layers } from 'lucide-react';
import client from '../api/client';
import OutputPanel from '../components/OutputPanel';
import TaskTree from '../components/TaskTree';
import FailurePanel from '../components/FailurePanel';

export default function HistoryPage() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedRun, setSelectedRun] = useState(null);
  const [selectedRunDetails, setSelectedRunDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchRuns = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await client.get('/task-runs');
      setRuns(res.data);
    } catch (err) {
      console.warn('Backend runs offline; displaying mock COSMOQ history logs:', err);
      setRuns(getMockRuns());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  const getMockRuns = () => {
    return [
      {
        id: 'b83d9a1f-4c2e-4b9a-8f1d-92a10b3e5f60',
        goal: 'Research top 5 CRM tools, compare pricing tiers, and generate executive summary report',
        status: 'complete',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        plan: {
          subtasks: [
            { id: 'subtask_1', type: 'research', description: 'Search web for top 5 CRMs and pricing URLs', depends_on: [], expected_output: 'JSON list of tools' },
            { id: 'subtask_2', type: 'analyze', description: 'Execute Python comparison script across pricing tiers', depends_on: ['subtask_1'], expected_output: 'Comparison table' },
            { id: 'subtask_3', type: 'write', description: 'Synthesize executive summary deliverable', depends_on: ['subtask_2'], expected_output: 'Markdown report' }
          ]
        },
        result: '# CRM Comparison Report 2026\n\n## Overview\nWe evaluated **Salesforce**, **HubSpot**, **Zoho CRM**, **Pipedrive**, and **Freshsales**.\n\n| Tool | Entry Tier | Enterprise Tier |\n| --- | --- | --- |\n| HubSpot | $20/mo | $1,500/mo |\n| Salesforce | $25/mo | $300/mo |\n| Zoho CRM | $14/mo | $52/mo |'
      },
      {
        id: 'a12c4e5f-9b8a-7c6d-5e4f-3a2b1c0d9e8f',
        goal: 'Scrape pricing tiers for Enterprise SaaS platforms and calculate cost per user',
        status: 'failed',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        plan: {
          subtasks: [
            { id: 'subtask_1', type: 'research', description: 'Fetch URL content for enterprise landing pages', depends_on: [], expected_output: 'HTML text' }
          ]
        },
        result: null
      }
    ];
  };

  const handleSelectRun = async (run) => {
    setSelectedRun(run);
    try {
      setDetailsLoading(true);
      const res = await client.get(`/task-runs/${run.id}`);
      setSelectedRunDetails(res.data);
    } catch (err) {
      console.warn('Failed to fetch run details from backend; showing local run context:', err);
      setSelectedRunDetails(run);
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedRun(null);
    setSelectedRunDetails(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'complete':
        return (
          <span className="flex items-center space-x-1.5 text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full font-semibold">
            <CheckCircle size={12} />
            <span>Success</span>
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center space-x-1.5 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 px-3 py-1 rounded-full font-semibold">
            <XCircle size={12} />
            <span>Failed</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center space-x-1.5 text-xs text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-full font-semibold animate-pulse">
            <AlertCircle size={12} />
            <span>Running</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8 select-none">
      {!selectedRun ? (
        <>
          <div className="flex items-center justify-between border-b border-white/10 pb-6">
            <div>
              <div className="inline-flex items-center space-x-2 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full text-xs text-cyan-300 font-semibold mb-2">
                <History size={14} className="text-cyan-400" />
                <span>Execution Archives</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white font-heading">
                Workflow Execution History
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Browse, inspect, and audit historical multi-agent execution logs and deliverables.
              </p>
            </div>

            <button
              onClick={fetchRuns}
              disabled={loading}
              className="p-3 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/10 text-gray-300 hover:text-white transition-all cursor-pointer"
              title="Refresh logs"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, idx) => (
                <div key={idx} className="h-20 cosmo-card rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : runs.length === 0 ? (
            <div className="cosmo-card rounded-3xl p-12 text-center text-gray-500">
              <History size={40} className="stroke-[1.5] mx-auto mb-3 opacity-40" />
              <p className="text-sm font-semibold text-gray-400">No Runs Logged Yet</p>
              <p className="text-xs mt-1 text-gray-500">Submit an objective on the Workspace page to generate logs.</p>
            </div>
          ) : (
            <div className="cosmo-card rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/10 text-left text-xs">
                  <thead className="bg-black/60 text-gray-400 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Goal Description</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Started At</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {runs.map((run) => (
                      <tr key={run.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 max-w-md select-text">
                          <p className="text-gray-200 font-medium truncate">{run.goal}</p>
                          <p className="text-[10px] text-gray-500 font-mono mt-0.5">{run.id}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(run.status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                          <div className="flex items-center space-x-1.5 text-[11px]">
                            <Calendar size={12} className="text-gray-500" />
                            <span>{new Date(run.created_at).toLocaleDateString()}</span>
                            <Clock size={12} className="text-gray-500 ml-1.5" />
                            <span>{new Date(run.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleSelectRun(run)}
                            className="inline-flex items-center space-x-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-sm"
                          >
                            <Eye size={12} />
                            <span>Inspect</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-8 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-white/10 pb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={closeDetails}
                className="p-3 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/10 text-gray-300 hover:text-white transition-all cursor-pointer"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono text-gray-500">Run Inspector</span>
                  {selectedRunDetails && getStatusBadge(selectedRunDetails.status)}
                </div>
                <h1 className="text-xl font-bold text-white font-heading mt-1 select-text">
                  {selectedRunDetails?.goal || selectedRun.goal}
                </h1>
              </div>
            </div>
            <button
              onClick={closeDetails}
              className="p-3 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/10 text-gray-300 hover:text-white transition-all cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {detailsLoading ? (
            <div className="h-[400px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400" />
            </div>
          ) : (
            <>
              {selectedRunDetails?.status === 'failed' && (
                <FailurePanel runId={selectedRun.id} />
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-5 h-[500px]">
                  <TaskTree
                    plan={selectedRunDetails?.plan}
                    currentSubtaskId={null}
                    runStatus={selectedRunDetails?.status}
                  />
                </div>

                <div className="lg:col-span-7">
                  <OutputPanel
                    result={selectedRunDetails?.result}
                    status={selectedRunDetails?.status}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
