import React from 'react';
import { FloatingPanel } from '../../components/layout/FloatingPanel';
import { useModalStore } from '../../store/useModalStore';

export const ProjectModal = () => {
  const { modalData, closeModal } = useModalStore();

  return (
    <FloatingPanel 
      title={modalData?.name || "Project Overview"} 
      onClose={closeModal}
      className="w-[500px]"
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-300">
          This project aggregates data from 12 active camera traps across the national park.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
            <h5 className="text-white/60 text-xs uppercase mb-1">Total Detections</h5>
            <p className="text-2xl font-bold text-primary">1,248</p>
          </div>
          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
            <h5 className="text-white/60 text-xs uppercase mb-1">Unique Species</h5>
            <p className="text-2xl font-bold text-blue-400">24</p>
          </div>
        </div>

        <div className="pt-2">
          <button className="w-full py-2 bg-primary/20 text-primary hover:bg-primary/30 rounded-lg transition-colors border border-primary/30">
            View Full Report
          </button>
        </div>
      </div>
    </FloatingPanel>
  );
};
