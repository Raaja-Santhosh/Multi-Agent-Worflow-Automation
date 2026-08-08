import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Terminal, Menu, X, ArrowRight, Play } from 'lucide-react';

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: 'Workspace', path: '/workspace' },
    { name: 'Visual Builder', path: '/builder' },
    { name: 'Execution History', path: '/history' },
    { name: 'Architecture', path: '/architecture' },
    { name: 'Workflow', path: '/workflow' },
    { name: 'Features', path: '/features' },
    { name: 'Docs', path: '/docs' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full px-8 py-4 bg-[#08090a]/90 backdrop-blur-md border-b border-zinc-800 flex items-center justify-between">
      {/* Brand Logo - Anchored Top-Left Corner */}
      <Link to="/" className="flex items-center space-x-2.5 group">
        <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white font-bold text-xs shadow-inner">
          <Terminal size={14} className="text-zinc-300" />
        </div>
        <span className="text-base font-bold tracking-tight text-white font-heading uppercase">
          ORCHESTRA<span className="text-zinc-500 font-normal">AI</span>
        </span>
      </Link>

      {/* Navigation Links */}
      <nav className="hidden lg:flex items-center space-x-6 text-xs font-medium">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`transition-colors duration-150 ${
              isActive(link.path)
                ? 'text-white font-semibold underline underline-offset-4 decoration-white/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {link.name}
          </Link>
        ))}
      </nav>

      {/* Actions */}
      <div className="hidden lg:flex items-center space-x-4">
        <button
          onClick={() => navigate('/workspace')}
          className="bg-white hover:bg-zinc-200 text-black text-xs font-bold px-4 py-2 rounded-lg transition-all duration-150 flex items-center space-x-1.5 cursor-pointer shadow-sm"
        >
          <Play size={12} className="fill-black" />
          <span>Open Workspace</span>
        </button>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden p-2 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white"
      >
        {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-6 right-6 bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl z-50 flex flex-col space-y-3 lg:hidden animate-fadeIn">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`text-sm font-medium py-1 transition-colors ${
                isActive(link.path) ? 'text-white font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="border-t border-zinc-800 pt-4">
            <button
              onClick={() => { setMobileMenuOpen(false); navigate('/workspace'); }}
              className="w-full bg-white text-black text-xs font-bold py-2.5 text-center rounded-lg flex items-center justify-center space-x-1.5"
            >
              <Play size={12} className="fill-black" />
              <span>Open Workspace</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
