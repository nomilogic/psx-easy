import { Building, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import type { MarketSummary } from "@shared/schema";

interface MarketOverviewProps {
  summary: MarketSummary | null;
}

export default function MarketOverview({ summary }: MarketOverviewProps) {
  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    }
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
  };

  if (!summary) {
    return (
      <section id="overview" className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Market Overview</h2>
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span>Loading market data...</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 bg-slate-200 rounded w-20 mb-2"></div>
                  <div className="h-8 bg-slate-200 rounded w-16"></div>
                </div>
                <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="overview" className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Market Overview</h2>
        <div className="flex items-center space-x-2 text-sm text-slate-600">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <span>Real-time updates</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Stocks</p>
              <p className="text-2xl font-bold text-slate-900 font-mono">{summary.totalStocks}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <Building className="text-primary text-xl" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Gainers</p>
              <p className="text-2xl font-bold text-secondary font-mono">{summary.gainers}</p>
            </div>
            <div className="p-3 bg-secondary/10 rounded-lg">
              <TrendingUp className="text-secondary text-xl" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Losers</p>
              <p className="text-2xl font-bold text-accent font-mono">{summary.losers}</p>
            </div>
            <div className="p-3 bg-accent/10 rounded-lg">
              <TrendingDown className="text-accent text-xl" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Volume</p>
              <p className="text-2xl font-bold text-slate-900 font-mono">{formatVolume(summary.totalVolume)}</p>
            </div>
            <div className="p-3 bg-warning/10 rounded-lg">
              <BarChart3 className="text-warning text-xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
