import React from 'react';
import { FloatingPanel } from '../../components/layout/FloatingPanel';
import { Button } from '../../components/ui/Button';
import { useModalStore } from '../../store/useModalStore';
import { Check, X } from 'lucide-react';

export const ValidationDeck = () => {
  const { closeModal } = useModalStore();

  return (
    <FloatingPanel 
      title="Human Validation" 
      onClose={closeModal}
      className="w-[600px]"
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-300">
          Verify if the AI correctly identified the species in this frame.
        </p>

        {/* Mock Video/Frame with Bounding Box */}
        <div className="relative w-full h-64 bg-black rounded-lg overflow-hidden border border-white/10 flex items-center justify-center">
           {/* Mock image placeholder */}
           <div className="absolute inset-0 bg-gradient-to-br from-green-900/40 to-blue-900/40 opacity-50"></div>
           <p className="text-white/30 text-sm z-0">Camera Frame Content</p>

           {/* Mock Bounding Box */}
           <div className="absolute top-10 left-20 w-40 h-32 border-2 border-primary bg-primary/10 z-10">
              <span className="absolute -top-6 left-0 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-t">
                Jaguar (94%)
              </span>
           </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5">
          <div className="flex-1">
            <h4 className="text-lg font-bold text-white">Panthera onca</h4>
            <p className="text-xs text-gray-400">Confidence: 94%</p>
          </div>
          <div className="flex gap-2">
            <Button variant="danger" className="w-12 h-12 rounded-full p-0 flex items-center justify-center">
              <X className="w-6 h-6" />
            </Button>
            <Button variant="primary" className="w-12 h-12 rounded-full p-0 flex items-center justify-center">
              <Check className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
    </FloatingPanel>
  );
};
