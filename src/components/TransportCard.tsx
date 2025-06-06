import React from 'react';
import { Car, Bus, PersonStanding, Clock, IndianRupee, Leaf } from 'lucide-react';
import { TransportOption } from '../types';

interface TransportCardProps {
  option: TransportOption;
  distance: number;
}

const iconMap = {
  Car,
  Bus,
  PersonStanding,
};

const carbonColors = {
  low: 'text-green-600 bg-green-100',
  medium: 'text-amber-600 bg-amber-100',
  high: 'text-red-600 bg-red-100',
};

const carbonLabels = {
  low: 'Low Impact',
  medium: 'Medium Impact',
  high: 'High Impact',
};

export const TransportCard: React.FC<TransportCardProps> = ({ option, distance }) => {
  const IconComponent = iconMap[option.icon as keyof typeof iconMap] || Car;
  
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatCost = (cost: { min: number; max: number }) => {
    if (cost.min === 0 && cost.max === 0) return 'Free';
    if (cost.min === cost.max) return `₹${cost.min}`;
    return `₹${cost.min}-${cost.max}`;
  };

  return (
    <div className="bg-glass/90 backdrop-blur-glass rounded-2xl border border-primary-800/40 p-7 hover:shadow-glass shadow-neo transition-all duration-300 ease-in-out hover:scale-[1.02] group cursor-pointer font-urbanist">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-4 bg-primary-700/40 rounded-xl group-hover:bg-primary-600/40 transition-colors duration-300 shadow-neo-inset">
            <IconComponent className="w-7 h-7 text-primary-300 drop-shadow-glow" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-lg tracking-tight">
              {option.name}
            </h3>
            <p className="text-sm text-primary-200 font-medium">{option.description}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${carbonColors[option.carbonImpact]} bg-opacity-20 border border-primary-800/30`}>
          <div className="flex items-center gap-1">
            <Leaf className="w-4 h-4" />
            {carbonLabels[option.carbonImpact]}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary-200">
            <Clock className="w-5 h-5" />
            <span className="text-sm font-urbanist">Duration</span>
          </div>
          <span className="font-semibold text-white">
            {formatDuration(option.duration)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary-200">
            <IndianRupee className="w-5 h-5" />
            <span className="text-sm font-urbanist">Cost</span>
          </div>
          <span className="font-semibold text-white">
            {formatCost(option.cost)}
          </span>
        </div>

        <div className="pt-2 border-t border-primary-800/30">
          <div className="flex items-center justify-between text-sm">
            <span className="text-primary-300">Distance: {distance} km</span>
            <span className="text-cyan-400 font-medium group-hover:text-cyan-300 transition-colors duration-300">
              View Details →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};