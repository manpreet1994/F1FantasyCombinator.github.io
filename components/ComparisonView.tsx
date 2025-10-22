import React, { useState, useMemo, useEffect } from 'react';
import type { Driver, Constructor } from '../types';

type ComparisonMode = 'drivers' | 'constructors';

interface ComparisonViewProps {
  drivers: Driver[];
  constructors: Constructor[];
}

const ComparisonSelector: React.FC<{
  label: string;
  options: { id: string; display_name: string }[];
  selectedValue: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabledValue?: string;
}> = ({ label, options, selectedValue, onChange, disabledValue }) => (
  <div className="flex-1">
    <label className="block text-sm font-medium text-slate-400 mb-1">{label}</label>
    <select
      value={selectedValue}
      onChange={onChange}
      className="w-full bg-slate-800 border border-slate-600 text-slate-200 rounded-md p-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
    >
      <option value="">Select...</option>
      {options.map((opt) => (
        <option key={opt.id} value={opt.id} disabled={opt.id === disabledValue}>
          {opt.display_name}
        </option>
      ))}
    </select>
  </div>
);

const StatCard: React.FC<{ title: string; value: string | number; color?: string }> = ({ title, value, color = 'text-slate-100' }) => (
  <div className="bg-slate-800/80 p-4 rounded-lg text-center">
    <p className="text-sm text-slate-400 uppercase">{title}</p>
    <p className={`text-2xl font-bold ${color} mt-1`}>{value}</p>
  </div>
);

const ComparisonView: React.FC<ComparisonViewProps> = ({ drivers, constructors }) => {
  const [mode, setMode] = useState<ComparisonMode>('drivers');
  const [selection1, setSelection1] = useState('');
  const [selection2, setSelection2] = useState('');

  const [recharts, setRecharts] = useState<any>(null);
  const LineChart = recharts?.LineChart;
  const Line = recharts?.Line;
  const XAxis = recharts?.XAxis;
  const YAxis = recharts?.YAxis;
  const CartesianGrid = recharts?.CartesianGrid;
  const Tooltip = recharts?.Tooltip;
  const Legend = recharts?.Legend;
  const ResponsiveContainer = recharts?.ResponsiveContainer;

  const handleModeChange = (newMode: ComparisonMode) => {
    setMode(newMode);
    setSelection1('');
    setSelection2('');
  };

  const { item1, item2, options } = useMemo(() => {
    const data = mode === 'drivers' ? drivers : constructors;
    return {
      item1: data.find((d) => d.id === selection1),
      item2: data.find((d) => d.id === selection2),
      options: data.sort((a,b) => a.display_name.localeCompare(b.display_name)),
    };
  }, [mode, selection1, selection2, drivers, constructors]);

  const chartData = useMemo(() => {
    if (!item1 || !item2) return [];

    const allRounds = new Set([...Object.keys(item1.scores_by_race), ...Object.keys(item2.scores_by_race)]);
    const sortedRounds = Array.from(allRounds).sort((a, b) => parseInt(a) - parseInt(b));
    
    return sortedRounds.map((round) => ({
      name: `R${round}`,
      [item1.display_name]: parseInt(item1.scores_by_race[round] || '0'),
      [item2.display_name]: parseInt(item2.scores_by_race[round] || '0'),
    }));
  }, [item1, item2]);

  useEffect(() => {
    const loadRecharts = async () => {
      try {
        const rechartsModule = await import('recharts');
        setRecharts(rechartsModule);
      } catch (error) {
        console.error('Failed to load Recharts', error);
      }
    };
    loadRecharts();
  }, []);

  return (
    <div className="bg-slate-800/50 p-6 rounded-lg shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-slate-100">Compare {mode === 'drivers' ? 'Drivers' : 'Constructors'}</h2>
        <div className="flex space-x-1 bg-slate-900/70 p-1 rounded-lg">
          <button onClick={() => handleModeChange('drivers')} className={`px-3 py-1 text-sm rounded-md transition-colors ${mode === 'drivers' ? 'bg-sky-500 text-white' : 'text-slate-300 hover:bg-slate-700/50'}`}>Drivers</button>
          <button onClick={() => handleModeChange('constructors')} className={`px-3 py-1 text-sm rounded-md transition-colors ${mode === 'constructors' ? 'bg-sky-500 text-white' : 'text-slate-300 hover:bg-slate-700/50'}`}>Constructors</button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <ComparisonSelector label="Selection 1" options={options} selectedValue={selection1} onChange={(e) => setSelection1(e.target.value)} disabledValue={selection2} />
        <ComparisonSelector label="Selection 2" options={options} selectedValue={selection2} onChange={(e) => setSelection2(e.target.value)} disabledValue={selection1} />
      </div>

      {item1 && item2 ? (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard title="Price" value={`$${Number(item1.price).toFixed(1)}M`} color="text-cyan-400" />
              <StatCard title="Total Points" value={item1.season_score} />
              <StatCard title="Price" value={`$${Number(item2.price).toFixed(1)}M`} color="text-cyan-400" />
              <StatCard title="Total Points" value={item2.season_score} />
          </div>

          {/* Chart */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-slate-200">Points per Race</h3>
            <div className="w-full h-80">
              {recharts ? (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                        <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                        <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(2, 6, 23, 0.8)', // slate-950 with opacity
                                borderColor: '#334155', // slate-700
                                color: '#cbd5e1', // slate-300
                            }}
                            cursor={{ fill: 'rgba(14, 165, 233, 0.1)' }} // sky-500 with opacity
                        />
                        <Legend wrapperStyle={{ color: '#cbd5e1' }} />
                        <Line type="monotone" dataKey={item1.display_name} stroke="#38bdf8" strokeWidth={2} activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey={item2.display_name} stroke="#ED64A6" strokeWidth={2} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full bg-slate-800/80 rounded-md">
                  <p className="text-slate-400">Loading chart...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 text-slate-400">
          <p>Select two {mode} to begin comparison.</p>
        </div>
      )}
    </div>
  );
};

export default ComparisonView;