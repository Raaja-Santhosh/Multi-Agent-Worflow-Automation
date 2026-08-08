import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col justify-center items-center text-center px-4 relative z-10 select-none text-zinc-100">
      <div className="cosmo-card p-10 max-w-md w-full space-y-6">
        <div className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-full w-14 h-14 mx-auto flex items-center justify-center text-zinc-300">
          <AlertCircle size={28} />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded">
            404 — ROUTE NOT FOUND
          </span>
          <h1 className="text-3xl font-extrabold text-white font-heading mt-2">Page Not Found</h1>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
            The requested page URL path could not be resolved by the router.
          </p>
        </div>

        <div className="pt-2">
          <Link
            to="/"
            className="bg-white hover:bg-zinc-200 text-black text-xs font-semibold px-5 py-2.5 rounded-lg transition-all duration-150 inline-flex items-center space-x-2 cursor-pointer shadow-sm"
          >
            <ArrowLeft size={14} />
            <span>Return to Workspace Root</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
