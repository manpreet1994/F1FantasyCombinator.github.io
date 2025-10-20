
import React from 'react';

const PredictionView: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-f1-light-dark rounded-lg shadow-lg min-h-[400px]">
      <div className="w-16 h-16 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-f1-red">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">AI Predictions Coming Soon!</h2>
      <p className="text-slate-400 max-w-md text-center">
        Our advanced AI model is in the workshop, getting tuned up to provide you with the best fantasy team predictions. Check back soon for data-driven team suggestions based on your budget.
      </p>
    </div>
  );
};

export default PredictionView;
