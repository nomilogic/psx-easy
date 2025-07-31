import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import type { StockData } from "@shared/schema";
import { useWebSocket } from "@/hooks/use-websocket";

interface HeaderTickerProps {
  stocks: StockData[];
}

export default function HeaderTicker({ stocks: initialStocks }: HeaderTickerProps) {
  const [stocks, setStocks] = useState<StockData[]>(initialStocks || []);
  const { isConnected, lastMessage } = useWebSocket();

  // Update stocks when WebSocket data changes
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'stock_update' && lastMessage.data) {
      setStocks(lastMessage.data);
    }
  }, [lastMessage]);

  // Initialize stocks with props data
  useEffect(() => {
    if (initialStocks && initialStocks.length > 0) {
      setStocks(initialStocks);
    }
  }, [initialStocks]);

  const formatPrice = (price: number) => {
    return `₨${price.toFixed(2)}`;
  };

  const formatChange = (change: number, changePercent: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(1)}%)`;
  };

  // Get top 10 stocks by volume for ticker
  const tickerStocks = stocks
    .filter(stock => stock.volume > 0)
    .sort((a, b) => (b.volume || 0) - (a.volume || 0))
    .slice(0, 10);

  if (!tickerStocks.length) {
    return (
      <div className="bg-slate-900 text-white py-2 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-yellow-400 animate-pulse" />
              <span className="text-sm">Loading market data...</span>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white py-2 border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium">Live Market</span>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
          </div>
          
          {/* Scrolling Ticker */}
          <div className="flex-1 mx-4 overflow-hidden">
            <div className="animate-ticker whitespace-nowrap">
              <div className="inline-flex space-x-8">
                {tickerStocks.map((stock, index) => (
                  <div key={`${stock.symbol}-${index}`} className="inline-flex items-center space-x-2 text-sm">
                    <span className="font-semibold text-blue-300">{stock.symbol}</span>
                    <span className="text-white">{formatPrice(stock.current || 0)}</span>
                    <div className={`flex items-center ${
                      (stock.change || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {(stock.change || 0) >= 0 ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      <span className="text-xs">
                        {formatChange(stock.change || 0, stock.changePercent || 0)}
                      </span>
                    </div>
                  </div>
                ))}
                {/* Repeat for continuous scroll */}
                {tickerStocks.map((stock, index) => (
                  <div key={`${stock.symbol}-repeat-${index}`} className="inline-flex items-center space-x-2 text-sm">
                    <span className="font-semibold text-blue-300">{stock.symbol}</span>
                    <span className="text-white">{formatPrice(stock.current || 0)}</span>
                    <div className={`flex items-center ${
                      (stock.change || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {(stock.change || 0) >= 0 ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      <span className="text-xs">
                        {formatChange(stock.change || 0, stock.changePercent || 0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-400">
            PSX Live Data
          </div>
        </div>
      </div>
    </div>
  );
}