import React from 'react';

export const SupervisorIcon = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M12 6L7 9V15L12 18L17 15V9L12 6Z" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.6" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </svg>
);

export const PlannerIcon = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="6" height="6" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <rect x="15" y="3" width="6" height="6" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <rect x="9" y="15" width="6" height="6" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M6 9V12C6 13.1046 6.89543 14 8 14H16C17.1046 14 18 13.1046 18 12V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M12 14V15" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export const ResearcherIcon = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
    <path d="M16 16L20 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="11" cy="11" r="3" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
  </svg>
);

export const MemoryIcon = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6C4 4.89543 7.58172 4 12 4C16.4183 4 20 4.89543 20 6M4 6C4 7.10457 7.58172 8 12 8C16.4183 8 20 7.10457 20 6M4 6V18C4 19.1046 7.58172 20 12 20C16.4183 20 20 19.1046 20 18V6" stroke="currentColor" strokeWidth="1.5" />
    <path d="M4 12C4 13.1046 7.58172 14 12 14C16.4183 14 20 13.1046 20 12" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export const BrowserIcon = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="4" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
    <path d="M3 9H21" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="6" cy="6.5" r="0.75" fill="currentColor" />
    <circle cx="8.5" cy="6.5" r="0.75" fill="currentColor" />
    <circle cx="11" cy="6.5" r="0.75" fill="currentColor" />
  </svg>
);

export const ToolIcon = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ReasoningIcon = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3L2 12L12 21L22 12L12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M12 7L7 12L12 17L17 12L12 7Z" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.5" />
  </svg>
);

export const ExecutionIcon = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M4 17L10 11L4 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 19H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
