import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import { PaymentModal } from './PaymentModal';

export const UpgradeButton: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setModalOpen(true)}
        className="text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-400 text-white px-4 py-2 rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all flex items-center gap-1.5"
      >
        <Zap className="h-4 w-4" />
        Upgrade to Pro
      </button>

      <PaymentModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
      />
    </>
  );
};
