import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Utility to merge tailwind classes */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const FloatingPanel = ({ children, className, title, onClose }) => {
  return (
    <div className={cn(
      "pointer-events-auto",
      "bg-background/85 backdrop-blur-xl border border-white/10",
      "rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]",
      "p-5 flex flex-col gap-4 text-foreground transition-all duration-300",
      className
    )}>
      {title && (
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold tracking-wide text-primary-foreground">{title}</h3>
          {onClose && (
            <button 
              onClick={onClose}
              className="text-white/50 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          )}
        </div>
      )}
      {children}
    </div>
  );
};
