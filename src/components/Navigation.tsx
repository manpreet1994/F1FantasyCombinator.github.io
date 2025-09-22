
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
          ? 'bg-f1-red text-white' 
          : 'text-slate-300 hover:bg-f1-gray'
        }`}
    >
      {title}
    </button>
  );
};

const Navigation: React.FC<NavigationProps> = ({ activeView, setActiveView }) => {
  return (
    <nav className="p-4 flex justify-center items-center">
      <div className="flex space-x-2 bg-f1-light-dark p-1 rounded-lg">
        <NavItem title="Exploration" isActive={activeView === 'EXPLORATION'} onClick={() => setActiveView('EXPLORATION')} />
        <NavItem title="Comparison" isActive={activeView === 'COMPARISON'} onClick={() => setActiveView('COMPARISON')} />
        <NavItem title="Prediction" isActive={activeView === 'PREDICTION'} onClick={() => setActiveView('PREDICTION')} />
      </div>
    </nav>
  );
};

export default Navigation;
