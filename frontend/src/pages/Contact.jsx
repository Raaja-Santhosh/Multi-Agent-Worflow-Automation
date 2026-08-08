import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Terminal } from 'lucide-react';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    teamSize: '10-50',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12 select-none relative z-10 text-zinc-100">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3 pt-4">
        <div className="inline-flex items-center space-x-2 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-md text-[11px] font-mono text-zinc-400">
          <Terminal size={13} className="text-zinc-400" />
          <span>ENTERPRISE ARCHITECTURE INQUIRY</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white font-heading leading-tight">
          System Architecture Consultation
        </h1>

        <p className="text-sm text-zinc-400 leading-relaxed font-sans max-w-xl mx-auto">
          Consult with our systems team regarding dedicated StateGraph clusters, pgvector deployment, and SOC2 compliance.
        </p>
      </div>

      <div className="max-w-xl mx-auto cosmo-card p-8 sm:p-10 relative overflow-hidden">
        {submitted ? (
          <div className="text-center py-12 space-y-4 animate-fadeIn">
            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center text-zinc-200">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-2xl font-bold text-white font-heading">Architecture Request Received</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
              Our engineering team will reach out within 2 hours with a custom system design proposal.
            </p>
            <div className="pt-4">
              <button
                onClick={() => setSubmitted(false)}
                className="text-xs text-zinc-300 font-semibold hover:underline"
              >
                Send another inquiry
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Alex Vance"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">Work Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="alex@enterprise.com"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">Company Name</label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Acme Corp"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">Engineering Team</label>
                <select
                  value={formData.teamSize}
                  onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-zinc-600"
                >
                  <option value="1-10">1-10 Developers</option>
                  <option value="10-50">10-50 Developers</option>
                  <option value="50-200">50-200 Developers</option>
                  <option value="200+">200+ Enterprise</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">Workflow Requirements</label>
              <textarea
                rows={3}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Describe your multi-agent StateGraph requirements..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-white hover:bg-zinc-200 text-black text-xs font-bold py-3 px-6 rounded-lg transition-all duration-150 flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
            >
              <span>Submit Consultation Request</span>
              <ArrowRight size={14} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
