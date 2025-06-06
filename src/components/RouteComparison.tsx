import React, { useState, useMemo } from 'react';
import { AlertCircle, Route } from 'lucide-react';
import { RouteResponse, SortOption, TransportOption } from '../types';
import { TransportCard } from './TransportCard';
import { SortControls } from './SortControls';
import { SkeletonCard } from './SkeletonCard';

interface RouteComparisonProps {
  data: RouteResponse | null;
  loading: boolean;
  error: string | null;
}

export const RouteComparison: React.FC<RouteComparisonProps> = ({ data, loading, error }) => {
  const [sortBy, setSortBy] = useState<SortOption>('time');

  const sortedRoutes = useMemo(() => {
    if (!data?.routes) return [];

    const routes = [...data.routes];
    
    switch (sortBy) {
      case 'time':
        return routes.sort((a, b) => a.duration - b.duration);
      case 'cost':
        return routes.sort((a, b) => {
          const avgCostA = (a.cost.min + a.cost.max) / 2;
          const avgCostB = (b.cost.min + b.cost.max) / 2;
          return avgCostA - avgCostB;
        });
      case 'environmental':
        const impactOrder = { low: 0, medium: 1, high: 2 };
        return routes.sort((a, b) => impactOrder[a.carbonImpact] - impactOrder[b.carbonImpact]);
      default:
        return routes;
    }
  }, [data?.routes, sortBy]);

  if (error) {
    return (
      <div className="bg-red-900/60 border border-red-700 rounded-xl p-6 text-white shadow-glass">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-300" />
          <div>
            <h3 className="font-semibold text-red-100 font-urbanist">Error Loading Routes</h3>
            <p className="text-red-200 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary-700/40 rounded-xl shadow-neo-inset">
            <Route className="w-7 h-7 text-primary-300 drop-shadow-glow" />
          </div>
          <h2 className="text-2xl font-bold text-white font-urbanist tracking-tight drop-shadow-glow">
            Comparing Routes...
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary-700/40 rounded-xl shadow-neo-inset">
          <Route className="w-7 h-7 text-primary-300 drop-shadow-glow" />
        </div>
        <h2 className="text-2xl font-bold text-white font-urbanist tracking-tight drop-shadow-glow">
          Route Comparison
        </h2>
      </div>
      <SortControls currentSort={sortBy} onSortChange={setSortBy} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sortedRoutes.map((route, index) => (
          <div
            key={`${route.mode}-${index}`}
            className="transform transition-all duration-300 ease-in-out"
            style={{
              animationDelay: `${index * 100}ms`,
            }}
          >
            <TransportCard 
              option={route} 
              distance={data.distance}
            />
          </div>
        ))}
      </div>
      <div className="bg-glass/80 backdrop-blur-glass rounded-xl p-4 mt-6 text-primary-200 text-center font-urbanist">
        * Prices and times are estimates and may vary based on current conditions.
      </div>
    </div>
  );
};