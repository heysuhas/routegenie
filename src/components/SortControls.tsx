import React from 'react';
import { Clock, DollarSign, Leaf, ArrowUpDown } from 'lucide-react';
import { SortOption } from '../types';

interface SortControlsProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const sortOptions: { value: SortOption; label: string; icon: React.ReactNode }[] = [
  { value: 'time', label: 'Time', icon: <Clock className="w-4 h-4" /> },
  { value: 'cost', label: 'Cost', icon: <DollarSign className="w-4 h-4" /> },
  { value: 'environmental', label: 'Eco-Friendly', icon: <Leaf className="w-4 h-4" /> },
];

export const SortControls: React.FC<SortControlsProps> = ({ currentSort, onSortChange }) => {
  return (
    <div className="flex items-center gap-4 mb-6 font-urbanist">
      <div className="flex items-center gap-2 text-primary-200">
        <ArrowUpDown className="w-5 h-5" />
        <span className="text-sm font-medium">Sort by:</span>
      </div>
      <div className="flex gap-2 bg-glass/80 backdrop-blur-glass rounded-xl p-2 shadow-neo-inset">
        {sortOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onSortChange(option.value)}
            className={
              `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ease-in-out font-urbanist ` +
              (currentSort === option.value
                ? 'bg-gradient-to-r from-primary-700 via-primary-600 to-cyan-600 text-white shadow-glass'
                : 'bg-secondary-800 text-primary-200 hover:bg-secondary-700 hover:text-white')
            }
          >
            {option.icon}
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};