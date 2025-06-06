import React, { useEffect, useState } from 'react';
import { MapPin, Zap } from 'lucide-react';
import { SearchForm } from './components/SearchForm';
import { RouteComparison } from './components/RouteComparison';
import { useRouteData } from './hooks/useRouteData';
import { RouteRequest } from './types';

function App() {
  const { data, loading, error, fetchRoutes, clearData } = useRouteData();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navBase =
    'fixed top-6 left-1/2 z-40 flex flex-col items-center justify-center will-change-transform transition-all duration-[600ms] ease-[cubic-bezier(0.77,0,0.175,1)] -translate-x-1/2';
  const navShape =
    'rounded-full shadow-glass shadow-neo backdrop-blur-glass bg-glass/80 border border-primary-800/40';
  const navSize = scrolled
    ? 'w-64 h-16 px-6 py-2'
    : 'w-96 h-24 px-10 py-4';
  const navSquish = scrolled ? 'scale-95' : 'scale-100';

  const handleSearch = (request: RouteRequest) => {
    fetchRoutes(request);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-900 via-secondary-800 to-primary-900 font-urbanist">
      {/* Circular Centered Navbar */}
      <nav
        className={`
          ${navBase} ${navShape} ${navSize} ${navSquish}
          flex-row gap-4 items-center justify-center
        `}
        style={{
          boxShadow:
            '0 8px 32px 0 rgba(0,0,0,0.25), 0 1.5px 8px 0 rgba(36,40,48,0.18)',
          backdropFilter: 'blur(16px)',
          transition: 'all 0.6s cubic-bezier(0.77,0,0.175,1)',
          willChange: 'transform',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 p-3 bg-primary-700/30 rounded-full shadow-neo-inset">
            <MapPin className="w-7 h-7 text-primary-400 drop-shadow-glow" />
            <Zap className="w-5 h-5 text-yellow-400 drop-shadow-glow" />
          </div>
          <div className="flex flex-col items-start justify-center">
            <span className="text-2xl font-bold text-white tracking-tight drop-shadow-glow leading-none">
              RouteGenie
            </span>
            {!scrolled && (
              <span className="text-xs text-primary-200 font-medium mt-1">
                Smart transportation comparison
              </span>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-12 pt-40">
        <div className="space-y-12">
          {/* Hero Section */}
          <section className="relative text-center mb-12">
            <div className="absolute inset-0 flex justify-center items-center pointer-events-none select-none">
              <div className="w-2/3 h-48 bg-primary-700/20 blur-3xl rounded-full mx-auto" />
            </div>
            <h2 className="relative text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight drop-shadow-glow">
              Compare Routes,{' '}
              <span className="bg-gradient-to-r from-primary-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent animate-gradient-x">Make Smart Choices</span>
            </h2>
            <p className="relative text-xl text-primary-200 max-w-2xl mx-auto font-medium">
              Get real-time comparisons of transportation options including time, cost, and environmental impact to make informed travel decisions.
            </p>
          </section>

          {/* Search Form */}
          <section className="max-w-2xl mx-auto">
            <div className="bg-glass/80 backdrop-blur-glass rounded-3xl shadow-glass border border-primary-900/30 p-8">
              <SearchForm onSearch={handleSearch} loading={loading} />
            </div>
          </section>

          {/* Results */}
          {(data || loading || error) && (
            <section className="mt-12">
              <RouteComparison data={data} loading={loading} error={error} />
            </section>
          )}

          {/* Features Section */}
          {!data && !loading && (
            <section className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-glass/70 backdrop-blur-glass rounded-2xl shadow-neo p-8 flex flex-col items-center hover:scale-[1.03] transition-transform">
                <div className="w-14 h-14 flex items-center justify-center bg-primary-700/40 rounded-xl mb-4 shadow-neo-inset">
                  <MapPin className="w-8 h-8 text-primary-300 drop-shadow-glow" />
                </div>
                <h3 className="font-semibold text-xl text-white mb-2 tracking-tight">Real-time Routes</h3>
                <p className="text-primary-200 text-center font-medium">
                  Get accurate travel times and routes based on current traffic conditions.
                </p>
              </div>
              <div className="bg-glass/70 backdrop-blur-glass rounded-2xl shadow-neo p-8 flex flex-col items-center hover:scale-[1.03] transition-transform">
                <div className="w-14 h-14 flex items-center justify-center bg-yellow-700/40 rounded-xl mb-4 shadow-neo-inset">
                  <Zap className="w-8 h-8 text-yellow-300 drop-shadow-glow" />
                </div>
                <h3 className="font-semibold text-xl text-white mb-2 tracking-tight">Cost Comparison</h3>
                <p className="text-primary-200 text-center font-medium">
                  Compare costs across different transportation modes to find the best value.
                </p>
              </div>
              <div className="bg-glass/70 backdrop-blur-glass rounded-2xl shadow-neo p-8 flex flex-col items-center hover:scale-[1.03] transition-transform">
                <div className="w-14 h-14 flex items-center justify-center bg-green-700/40 rounded-xl mb-4 shadow-neo-inset">
                  <span className="w-8 h-8 flex items-center justify-center text-green-300 text-3xl drop-shadow-glow">🌱</span>
                </div>
                <h3 className="font-semibold text-xl text-white mb-2 tracking-tight">Eco-Friendly Options</h3>
                <p className="text-primary-200 text-center font-medium">
                  Make environmentally conscious choices with carbon footprint indicators.
                </p>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-glass/80 backdrop-blur-glass border-t border-secondary-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
          <div className="text-center text-primary-300 font-medium">
            <p>&copy; 2025 RouteGenie. Making transportation decisions smarter.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;