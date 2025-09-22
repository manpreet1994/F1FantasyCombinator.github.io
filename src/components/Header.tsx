import React from 'react';
import type { RaceInfo } from '../types';

interface HeaderProps {
  raceInfo: RaceInfo;
  onRefresh: () => void;
  isLoading: boolean;
}

const Header: React.FC<HeaderProps> = ({ raceInfo, onRefresh, isLoading }) => {
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return new Date(dateString + 'T00:00:00Z').toLocaleDateString('en-US', options);
  };

  return (
    <header className="grid grid-cols-3 items-center p-4 md:p-6 border-b border-f1-gray">
      {/* Last Race */}
      <div className="text-sm text-left">
        <p className="text-slate-400 font-medium tracking-wide">LAST RACE</p>
        <p className="font-bold text-slate-100">{raceInfo.currentRace?.name || 'N/A'}</p>
      </div>
      
      {/* Title and Refresh Button */}
      <div className="flex justify-center items-center gap-x-4">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight font-['Titillium_Web']">
            F1 <span className="text-f1-red">Fantasy Combinator</span>
        </h1>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-2 rounded-full text-slate-300 hover:bg-f1-light-dark hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Refresh data"
        >
          <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0M6.182 6.182a8.25 8.25 0 0111.664 0m0 0l3.181-3.183m-3.181 3.183V4.5" />
          </svg>
        </button>
      </div>

      {/* Upcoming Race */}
      <div className="text-sm text-right">
        <p className="text-slate-400 font-medium tracking-wide">UPCOMING RACE</p>
        <p className="font-bold text-f1-red">{raceInfo.upcomingRace?.name || 'N/A'}</p>
        <p className="text-slate-300">{raceInfo.upcomingRace ? formatDate(raceInfo.upcomingRace.date) : 'TBD'}</p>
      </div>
    </header>
  );
};

export default Header;