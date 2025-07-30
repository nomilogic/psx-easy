import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import MarketOverview from "@/components/market-overview";
import LiveStockTicker from "@/components/live-stock-ticker";
import ApiDocumentation from "@/components/api-documentation";
import WebSocketInfo from "@/components/websocket-info";
import { useWebSocket } from "@/hooks/use-websocket";
import { ChartLine, Wifi, WifiOff } from "lucide-react";
import type { StockData, MarketSummary } from "@shared/schema";

export default function Dashboard() {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const { isConnected, marketData, marketSummary } = useWebSocket();

  // Initial data load - show immediately
  const { data: initialStocks } = useQuery<StockData[]>({
    queryKey: ['/api/stocks'],
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const { data: initialSummary } = useQuery<MarketSummary>({
    queryKey: ['/api/market/overview'],
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Use WebSocket data if available, otherwise use initial API data
  const stocks: StockData[] = marketData || initialStocks || [];
  const summary: MarketSummary | null = marketSummary || initialSummary || null;

  useEffect(() => {
    if (marketData || marketSummary) {
      setLastUpdate(new Date());
    }
  }, [marketData, marketSummary]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <ChartLine className="text-primary text-2xl" />
                <h1 className="text-xl font-bold text-slate-900">PSX Real-Time API</h1>
              </div>
              <nav className="hidden md:flex space-x-6">
                <a href="#overview" className="text-slate-600 hover:text-primary transition-colors">Market Overview</a>
                <a href="#stocks" className="text-slate-600 hover:text-primary transition-colors">Live Stocks</a>
                <a href="#api" className="text-slate-600 hover:text-primary transition-colors">API Endpoints</a>
                <a href="#websocket" className="text-slate-600 hover:text-primary transition-colors">WebSocket</a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                isConnected 
                  ? 'bg-success/10 text-success' 
                  : 'bg-danger/10 text-danger'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isConnected 
                    ? 'bg-success animate-pulse' 
                    : 'bg-danger'
                }`}></div>
                <span>{isConnected ? 'WebSocket Connected' : 'WebSocket Disconnected'}</span>
              </div>
              <div className="text-sm text-slate-600 font-mono">
                Last Update: {formatTime(lastUpdate)}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MarketOverview summary={summary} />
        <LiveStockTicker stocks={stocks} />
        <ApiDocumentation />
        <WebSocketInfo />
      </div>

      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-sm text-slate-600">
              PSX Real-Time API Dashboard - Built with Express.js & WebSocket
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Real-time market data powered by Pakistan Stock Exchange integration
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
