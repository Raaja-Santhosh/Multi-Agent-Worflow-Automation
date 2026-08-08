import React from 'react';
import { motion } from 'framer-motion';

export const ShimmerButton = ({
  children,
  onClick,
  className = '',
  shimmerColor = '#ffffff',
  shimmerSize = '0.1em',
  borderRadius = '9999px',
  shimmerDuration = '3s',
  background = 'rgba(10, 11, 15, 0.95)',
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      className={`group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border border-white/10 px-6 py-3 text-xs font-semibold text-white shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:border-white/25 hover:shadow-zinc-800/40 active:scale-[0.98] ${className}`}
      style={{
        borderRadius,
        background
      }}
      {...props}
    >
      {/* Shimmer moving gradient reflection */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-full w-full animate-shimmer bg-[linear-gradient(110deg,transparent,45%,rgba(255,255,255,0.15),55%,transparent)] bg-[length:200%_100%]" />
      </div>

      {/* Button Content */}
      <span className="relative z-10 flex items-center space-x-2 font-medium tracking-tight">
        {children}
      </span>
    </button>
  );
};
