import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from './FloatingPanel';

export const SlidePanel = ({ onClose, title, children, footer, className }) => {
  return (
    <>
      {/* Dimmer backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] pointer-events-auto"
      />

      {/* Drawer Container */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 250, damping: 25 }}
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-full max-w-sm pointer-events-auto",
          "bg-gray-900 border-l border-white/10 shadow-2xl flex flex-col",
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0 bg-gray-900/50">
            <h3 className="text-lg font-bold text-white">{title}</h3>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-red-500 transition-colors rounded-full hover:bg-red-500/20 hover:text-red-400 cursor-pointer"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {children}
        </div>
        
        {footer && (
          <div className="p-4 border-t border-white/10 bg-gray-900 shrink-0">
            {footer}
          </div>
        )}
      </motion.div>
    </>
  );
};
