import React from 'react';
import { cn } from '../layout/FloatingPanel';

export const Button = ({ children, variant = 'primary', className, ...props }) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 active:scale-95 disabled:opacity-50 disabled:pointer-events-none px-4 py-2 text-sm";
  
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20",
    secondary: "bg-white/10 text-white hover:bg-white/20 border border-white/5",
    danger: "bg-red-500/90 text-white hover:bg-red-500 shadow-lg shadow-red-500/20",
    ghost: "bg-transparent hover:bg-white/10 text-white",
  };

  return (
    <button className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
    </button>
  );
};
