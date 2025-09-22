
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import ExplorationView from './components/ExplorationView';
import ComparisonView from './components/ComparisonView';
import PredictionView from './components/PredictionView';
import { fetchFantasyData, fetchRaceSchedule } from './services/dataService';
import type { FantasyData, RaceInfo, View } from './types';


const StaleDataBanner: React.FC<{ onDismiss: () => void }> = ({ onDismiss }) => {
  return (
    <div className="bg-yellow-500/10 border border-yellow-400 text-yellow-300 px-4 py-3 rounded-md relative mb-4" role="alert">
      <strong className="font-bold">Stale Data!</strong>
      <span className="block sm:inline ml-2">Could not fetch the latest fantasy data. Showing cached information.</span>
      <button onClick={onDismiss} className="absolute top-0 bottom-0 right-0 px-4 py-3">
        <svg className="fill-current h-6 w-6 text-yellow-400" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
      </button>
    </div>
  );
}

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('EXPLORATION');
  const [fantasyData, setFantasyData] = useState<FantasyData | null>(null);
  const [raceInfo, setRaceInfo] = useState<RaceInfo>({ currentRace: null, upcomingRace: null });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isStale, setIsStale] = useState<boolean>(false);
  const [showStaleBanner, setShowStaleBanner] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const { data, isStale } = await fetchFantasyData();
    setFantasyData(data);
    setIsStale(isStale);
    setShowStaleBanner(isStale);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    fetchRaceSchedule().then(setRaceInfo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderView = () => {
    if (isLoading && !fantasyData) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-f1-red"></div>
        </div>
      );
    }

    if (!fantasyData) {
      return <div className="text-center p-8 text-slate-400">Failed to load fantasy data. Please try refreshing.</div>;
    }

    switch (activeView) {
      case 'EXPLORATION':
        return <ExplorationView drivers={fantasyData.drivers} constructors={fantasyData.constructors} />;
      case 'COMPARISON':
        return <ComparisonView drivers={fantasyData.drivers} constructors={fantasyData.constructors} />;
      case 'PREDICTION':
        return <PredictionView />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-f1-dark font-sans">
      <Header raceInfo={raceInfo} onRefresh={loadData} isLoading={isLoading} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Navigation activeView={activeView} setActiveView={setActiveView} />
        {showStaleBanner && <StaleDataBanner onDismiss={() => setShowStaleBanner(false)} />}
        <div className="mt-4">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;
