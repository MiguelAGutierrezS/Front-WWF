import React, { useState } from 'react';
import { FloatingPanel } from '../../components/layout/FloatingPanel';
import { useModalStore } from '../../store/useModalStore';
import { UploadCloud } from 'lucide-react';

export const UploadWidget = () => {
  const { closeModal } = useModalStore();
  const [isDragging, setIsDragging] = useState(false);

  return (
    <FloatingPanel 
      title="Upload Footage" 
      onClose={closeModal}
      className="w-80"
    >
      <div 
        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors ${
          isDragging ? 'border-primary bg-primary/10' : 'border-white/20 hover:border-primary/50'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
      >
        <UploadCloud className="w-10 h-10 text-primary mb-3" />
        <p className="text-sm font-medium text-white mb-1">Drag & drop video files</p>
        <p className="text-xs text-gray-400">or click to browse</p>
        <input type="file" multiple className="hidden" />
      </div>
    </FloatingPanel>
  );
};
