import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export const BentoGrid = ({ children, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[22rem] ${className}`}>
      {children}
    </div>
  );
};

export const BentoCard = ({
  name,
  className = '',
  background,
  Icon,
  description,
  href,
  cta = 'Learn more',
  badge
}) => {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-zinc-950/80 border border-zinc-800/80 p-6 shadow-2xl backdrop-blur-xl hover:border-zinc-700/80 hover:shadow-zinc-900/50 ${className}`}
    >
      {/* Background Graphic / Canvas */}
      <div className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-60 group-hover:opacity-90">
        {background}
      </div>

      {/* Top Header & Icon */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-200 shadow-inner group-hover:scale-105 group-hover:border-zinc-600 transition-all duration-300">
          <Icon size={20} />
        </div>

        {badge && (
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400 bg-zinc-900/90 border border-zinc-800 px-2.5 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>

      {/* Bottom Content & Hover Action */}
      <div className="relative z-10 space-y-2 mt-auto">
        <h3 className="text-lg font-bold text-white tracking-tight font-heading group-hover:text-zinc-100">
          {name}
        </h3>
        <p className="text-xs text-zinc-400 leading-relaxed font-sans line-clamp-2">
          {description}
        </p>

        {href && (
          <div className="pt-2">
            <span className="inline-flex items-center space-x-1 text-xs font-semibold text-zinc-300 group-hover:text-white transition-colors">
              <span>{cta}</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        )}
      </div>

      {/* Subtle Linear Spotlight Glow on Hover */}
      <div className="absolute -inset-px rounded-3xl pointer-events-none border border-transparent group-hover:border-zinc-500/20 transition-colors" />
    </motion.div>
  );
};
