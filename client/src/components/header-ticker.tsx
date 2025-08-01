import { useState, useEffect, useMemo } from "react";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import type { StockData } from "@shared/schema";
import { useWebSocket } from "@/hooks/use-websocket";

interface HeaderTickerProps {
  stocks: StockData[];
}

// Market indices that should not appear in the stock ticker
const MARKET_INDICES = [
  "KSE100", "ALLSHR", "KSE30", "KMI30", "BKTI", "OGTI", 
  "KMIALLSHR", "PSXDIV20", "UPP9", "NITPGI", "NBPPGI", 
  "MZNPI", "JSMFI", "ACI", "JSGBKTI", "MII30", "HBLTTI", "KSE100PR"
];

export default function HeaderTicker({ stocks: initialStocks }: HeaderTickerProps) {
  const [currentStocks, setCurrentStocks] = useState<StockData[]>(initialStocks || []);
  const { isConnected, lastMessage } = useWebSocket();

  // Update stocks when WebSocket data changes, but prevent animation restart
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'stock_update' && lastMessage.data) {
      setCurrentStocks(prevStocks => {
        // Merge new data with existing, maintaining order to prevent animation restart
        const newStocks = lastMessage.data;
        const existingSymbols = new Set(prevStocks.map(s => s.symbol));
        
        // Update existing stocks and add new ones
        const updated = prevStocks.map((stock: StockData) => {
          const newStock = newStocks.find((s: StockData) => s.symbol === stock.symbol);
          return newStock || stock;
        });
        
        // Add completely new stocks
        const newUniqueStocks = newStocks.filter((stock: StockData) => !existingSymbols.has(stock.symbol));
        
        return [...updated, ...newUniqueStocks];
      });
    }
  }, [lastMessage]);

  // Initialize stocks with props data
  useEffect(() => {
    if (initialStocks && initialStocks.length > 0) {
      setCurrentStocks(initialStocks);
    }
  }, [initialStocks]);

  const formatPrice = (price: number) => {
    return `₨${price.toFixed(2)}`;
  };

  const formatChange = (change: number, changePercent: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(1)}%)`;
  };

  // Filter stocks with proper company names and exclude market indices
  const tickerStocks = useMemo(() => {
    console.log('HeaderTicker currentStocks:', currentStocks?.length || 0, 'items');
    
    if (!currentStocks || currentStocks.length === 0) {
      console.log('No stocks available for ticker');
      return [];
    }
    
    const filtered = currentStocks
      .filter(stock => {
        // Exclude market indices
        if (MARKET_INDICES.includes(stock.symbol)) return false;
        
        // Only include stocks with proper company names (not just symbol or generic names)
        const hasProperName = stock.name && 
          stock.name !== stock.symbol && 
          stock.name.length > 3 && 
          !stock.name.includes('Unknown') &&
          !stock.name.includes('index') &&
          !stock.name.includes('Index') &&
          stock.volume > 100; // Lower minimum volume filter
        
        return hasProperName;
      })
      .sort((a, b) => (b.volume || 0) - (a.volume || 0))
      .slice(0, 12); // Show top 12 stocks with proper names
    
    console.log('Filtered ticker stocks:', filtered.length, 'items');
    return filtered;
  }, [currentStocks]);

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
          
          {/* Scrolling Ticker - Stocks */}
          <div className="flex-1 mx-4 overflow-hidden">
            <div className="animate-ticker whitespace-nowrap">
              <div className="inline-flex space-x-8">
                {tickerStocks.map((stock) => (
                  <div key={stock.symbol} className="inline-flex items-center space-x-2 text-sm">
                    <span className="font-semibold text-blue-300">{stock.symbol}</span>
                    <span className="text-white text-xs">{stock.name?.substring(0, 25)}</span>
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
                {/* Repeat for seamless continuous scroll */}
                {tickerStocks.map((stock) => (
                  <div key={`${stock.symbol}-dup`} className="inline-flex items-center space-x-2 text-sm">
                    <span className="font-semibold text-blue-300">{stock.symbol}</span>
                    <span className="text-white text-xs">{stock.name?.substring(0, 25)}</span>
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