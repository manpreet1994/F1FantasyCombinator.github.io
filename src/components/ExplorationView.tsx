import React, { useState, useMemo } from 'react';
import type { Driver, Constructor } from '../types';
import { SortIcon, SortUpIcon, SortDownIcon } from './icons';

type SortableKey<T> = keyof T;
type SortDirection = 'asc' | 'desc';

interface SortConfig<T> {
  key: SortableKey<T>;
  direction: SortDirection;
}

const useSortableData = <T extends { id: string }>(items: T[], initialConfig: SortConfig<T> | null = null) => {
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(initialConfig);

  const sortedItems = useMemo(() => {
    let sortableItems = [...items];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        const numA = Number(aValue);
        const numB = Number(bValue);

        let comparison = 0;
        if (!isNaN(numA) && !isNaN(numB)) {
          comparison = numA > numB ? 1 : -1;
        } else if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = aValue.localeCompare(bValue);
        }

        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key: SortableKey<T>) => {
    let direction: SortDirection = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return { items: sortedItems, requestSort, sortConfig };
};


interface TableHeaderProps<T> {
  label: string;
  sortKey: keyof T;
  requestSort: (key: keyof T) => void;
  sortConfig: SortConfig<T> | null;
  className?: string;
}

const SortableTableHeader = <T,>({ label, sortKey, requestSort, sortConfig, className }: TableHeaderProps<T>) => {
    const isSorted = sortConfig?.key === sortKey;
    const Icon = !isSorted ? SortIcon : sortConfig?.direction === 'asc' ? SortUpIcon : SortDownIcon;
    return (
        <th className={`p-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider ${className || ''}`}>
            <button onClick={() => requestSort(sortKey)} className="flex items-center space-x-1 group">
                <span>{label}</span>
                <Icon className={`w-4 h-4 text-slate-500 group-hover:text-slate-200 transition-colors ${isSorted ? 'text-slate-200' : ''}`} />
            </button>
        </th>
    );
};


interface ExplorationViewProps {
  drivers: Driver[];
  constructors: Constructor[];
}

const ExplorationView: React.FC<ExplorationViewProps> = ({ drivers, constructors }) => {
  const { items: sortedDrivers, requestSort: requestDriverSort, sortConfig: driverSortConfig } = useSortableData<Driver>(drivers, { key: 'season_score', direction: 'desc'});
  const { items: sortedConstructors, requestSort: requestConstructorSort, sortConfig: constructorSortConfig } = useSortableData<Constructor>(constructors, { key: 'season_score', direction: 'desc' });
  
  return (
    <div className="space-y-8">
      {/* Drivers Table */}
      <div className="bg-f1-light-dark rounded-lg overflow-hidden shadow-lg">
        <h2 className="p-4 text-xl font-bold text-white border-b border-f1-gray">Drivers</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-f1-gray">
            <thead>
              <tr>
                <SortableTableHeader<Driver> label="Name" sortKey="display_name" requestSort={requestDriverSort} sortConfig={driverSortConfig} />
                <SortableTableHeader<Driver> label="Price" sortKey="price" requestSort={requestDriverSort} sortConfig={driverSortConfig} className="w-32 text-right" />
                <SortableTableHeader<Driver> label="Total Pts" sortKey="season_score" requestSort={requestDriverSort} sortConfig={driverSortConfig} className="w-32 text-right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-f1-gray">
              {sortedDrivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-f1-gray/50 transition-colors">
                  <td className="p-3 whitespace-nowrap font-medium">{driver.display_name}</td>
                  <td className="p-3 whitespace-nowrap w-32 text-right text-cyan-400">${Number(driver.price).toFixed(1)}M</td>
                  <td className="p-3 whitespace-nowrap w-32 text-right font-semibold text-lg">{driver.season_score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Constructors Table */}
      <div className="bg-f1-light-dark rounded-lg overflow-hidden shadow-lg">
        <h2 className="p-4 text-xl font-bold text-white border-b border-f1-gray">Constructors</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-f1-gray">
            <thead>
              <tr>
                <SortableTableHeader<Constructor> label="Name" sortKey="display_name" requestSort={requestConstructorSort} sortConfig={constructorSortConfig} />
                <SortableTableHeader<Constructor> label="Price" sortKey="price" requestSort={requestConstructorSort} sortConfig={constructorSortConfig} className="w-32 text-right" />
                <SortableTableHeader<Constructor> label="Total Pts" sortKey="season_score" requestSort={requestConstructorSort} sortConfig={constructorSortConfig} className="w-32 text-right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-f1-gray">
              {sortedConstructors.map((constructor) => (
                <tr key={constructor.id} className="hover:bg-f1-gray/50 transition-colors">
                  <td className="p-3 whitespace-nowrap font-medium">{constructor.display_name}</td>
                  <td className="p-3 whitespace-nowrap w-32 text-right text-cyan-400">${Number(constructor.price).toFixed(1)}M</td>
                  <td className="p-3 whitespace-nowrap w-32 text-right font-semibold text-lg">{constructor.season_score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExplorationView;