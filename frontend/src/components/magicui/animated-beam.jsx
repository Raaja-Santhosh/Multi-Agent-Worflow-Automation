import React from 'react';
import { motion } from 'framer-motion';

export const AnimatedBeam = ({
  className = '',
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  duration = 3,
  delay = 0,
  pathColor = 'rgba(255, 255, 255, 0.1)',
  pathWidth = 2,
  gradientStartColor = '#ffffff',
  gradientStopColor = '#a1a1aa'
}) => {
  const id = React.useId();

  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full stroke-[2] ${className}`}
    >
      <defs>
        <linearGradient
          id={id}
          gradientUnits="userSpaceOnUse"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop stopColor={gradientStartColor} stopOpacity="0" />
          <stop stopColor={gradientStartColor} stopOpacity="1" />
          <stop stopColor={gradientStopColor} stopOpacity="1" />
          <stop stopColor={gradientStopColor} stopOpacity="0" />
        </linearGradient>
      </defs>

      <path
        d="M 10 50 Q 50 10 90 50"
        stroke={pathColor}
        strokeWidth={pathWidth}
        strokeLinecap="round"
        fill="none"
      />

      <motion.path
        d="M 10 50 Q 50 10 90 50"
        stroke={`url(#${id})`}
        strokeWidth={pathWidth}
        strokeLinecap="round"
        fill="none"
        initial={{ strokeDasharray: '10 100', strokeDashoffset: 100 }}
        animate={{ strokeDashoffset: [100, -100] }}
        transition={{
          repeat: Infinity,
          duration: duration,
          ease: 'linear',
          delay: delay
        }}
      />
    </svg>
  );
};
