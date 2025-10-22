
import React from 'react';
import type { View } from '../types';

interface NavigationProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const NavItem: React.FC<{ title: string; isActive: boolean; onClick: () => void }> = ({ title, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 
        ${isActive 
          ? 'bg-sky-500 text-white' 
          : 'text-slate-300 hover:bg-slate-700/50'
        }`}
    >
      {title}
    </button>
  );
};

const Navigation: React.FC<NavigationProps> = ({ activeView, setActiveView }) => {
  return (
    <nav className="mb-4 flex justify-center items-center">
      <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-lg">
        <NavItem title="Exploration" isActive={activeView === 'EXPLORATION'} onClick={() => setActiveView('EXPLORATION')} />
        <NavItem title="Comparison" isActive={activeView === 'COMPARISON'} onClick={() => setActiveView('COMPARISON')} />
        <NavItem title="Prediction" isActive={activeView === 'PREDICTION'} onClick={() => setActiveView('PREDICTION')} />
      </div>
    </nav>
  );
};

export default Navigation;
