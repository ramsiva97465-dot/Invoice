import React from 'react';

// Subscription/workspace UI removed for single-company production build.
export const Subscription: React.FC = () => {
  return (
    <div className="space-y-3 font-sans">
      <h3 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">Subscription</h3>
      <p className="text-xs text-slate-400">This app is single-company billing only. Subscription management has been removed.</p>
    </div>
  );
};


