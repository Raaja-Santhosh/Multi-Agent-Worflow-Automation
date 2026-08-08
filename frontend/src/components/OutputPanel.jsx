import React, { useState } from 'react';
import { FileText, Copy, Check, Download, Sparkles } from 'lucide-react';

export default function OutputPanel({ result, status }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result) return;
    const element = document.createElement('a');
    const file = new Blob([result], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'orchestra_ai_deliverable.md';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const renderMarkdown = (text) => {
    if (!text) return null;

    const lines = text.split('\n');
    let inCodeBlock = false;
    let codeContent = [];

    return lines.map((line, idx) => {
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          inCodeBlock = false;
          const content = codeContent.join('\n');
          codeContent = [];
          return (
            <pre key={idx} className="bg-[#050608] border border-white/10 rounded-2xl p-4 my-3 overflow-x-auto text-xs text-cyan-300 font-mono shadow-inner">
              <code>{content}</code>
            </pre>
          );
        } else {
          inCodeBlock = true;
          return null;
        }
      }

      if (inCodeBlock) {
        codeContent.push(line);
        return null;
      }

      if (line.startsWith('# ')) {
        return <h1 key={idx} className="text-2xl font-black text-white font-heading mt-6 mb-3 border-b border-white/10 pb-2">{line.replace('# ', '')}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={idx} className="text-xl font-bold text-gray-100 font-heading mt-5 mb-2.5">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-lg font-bold text-gray-200 font-heading mt-4 mb-2">{line.replace('### ', '')}</h3>;
      }

      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const cleanText = line.replace(/^[\s*-]+/, '').trim();
        return (
          <ul key={idx} className="list-disc list-inside ml-4 my-1 text-xs text-gray-300 leading-relaxed">
            <li>{parseInlineElements(cleanText)}</li>
          </ul>
        );
      }

      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        if (line.includes('---')) return null;
        
        const cells = line.split('|').map(c => c.trim()).filter(c => c);
        return (
          <div key={idx} className="overflow-x-auto my-3">
            <table className="min-w-full border-collapse border border-white/10 text-xs">
              <tbody>
                <tr className="bg-white/[0.03] border-b border-white/10">
                  {cells.map((cell, cIdx) => (
                    <td key={cIdx} className="px-4 py-2 border border-white/10 text-gray-300 font-medium">
                      {parseInlineElements(cell)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        );
      }

      if (line.trim() === '') {
        return <div key={idx} className="h-3" />;
      }

      return (
        <p key={idx} className="text-xs text-gray-300 leading-relaxed my-2 font-sans">
          {parseInlineElements(line)}
        </p>
      );
    });
  };

  const parseInlineElements = (text) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="font-bold text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={idx} className="bg-black/60 border border-white/10 font-mono text-[11px] text-cyan-300 px-1.5 py-0.5 rounded-md">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  return (
    <div className="cosmo-card rounded-3xl p-6 flex flex-col h-full min-h-[300px]">
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
        <div className="flex items-center space-x-2">
          <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-400 border border-emerald-500/20">
            <FileText size={16} />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Final Deliverable Report</h3>
            <p className="text-[10px] text-gray-500">Structured Output Document</p>
          </div>
        </div>

        {result && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/10 text-gray-300 hover:text-white transition-all text-xs flex items-center space-x-1.5 cursor-pointer"
              title="Copy to Clipboard"
            >
              {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span className="text-[11px] font-semibold">{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 transition-all text-xs flex items-center space-x-1.5 cursor-pointer"
              title="Download Markdown"
            >
              <Download size={12} />
              <span className="text-[11px] font-semibold">Download</span>
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin max-h-[500px]">
        {status === 'running' && !result && (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 my-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mb-3" />
            <p className="text-xs font-semibold text-gray-400">Synthesizing Deliverable...</p>
            <p className="text-[11px] mt-1 text-gray-500 max-w-xs">
              Agent nodes are compiling research findings into the final report.
            </p>
          </div>
        )}

        {!result && status !== 'running' && (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 my-12">
            <div className="bg-white/[0.03] border border-white/10 p-4 rounded-2xl mb-3">
              <FileText size={28} className="stroke-[1.5] opacity-40" />
            </div>
            <p className="text-xs font-semibold text-gray-400">No Output Generated</p>
            <p className="text-[11px] mt-1 text-gray-500 max-w-xs">
              Submit a goal prompt to receive your multi-agent output report here.
            </p>
          </div>
        )}

        {result && (
          <div className="prose prose-invert prose-sm max-w-none text-left select-text p-2">
            {renderMarkdown(result)}
          </div>
        )}
      </div>
    </div>
  );
}
