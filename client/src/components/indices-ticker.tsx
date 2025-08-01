import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface IndexData {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  isPositive: boolean;
}

interface IndicesTickerProps {
  className?: string;
}

// Market indices to display
const MARKET_INDICES = [
  { symbol: "KSE100", name: "KSE-100 Index" },
  { symbol: "ALLSHR", name: "All Share Index" },
  { symbol: "KSE30", name: "KSE-30 Index" },
  { symbol: "KMI30", name: "KMI-30 Index" },
  { symbol: "BKTI", name: "Banking Index" },
  { symbol: "OGTI", name: "Oil & Gas Index" }
];

export default function IndicesTicker({ className = "" }: IndicesTickerProps) {
  const [indices, setIndices] = useState<IndexData[]>([]);
  
  // Use React Query for better data management and automatic fallbacks
  const { data: indicesData, isLoading: loading } = useQuery({
    queryKey: ['/api/indices'],
    queryFn: async () => {
      const results = await Promise.allSettled(
        MARKET_INDICES.map(async (index) => {
          const response = await fetch(`/api/index/${index.symbol}?interval=int`);
          if (response.ok) {
            const data = await response.json();
            if (data.data && data.data.length > 0) {
              const latest = data.data[data.data.length - 1];
              const previous = data.data.length > 1 ? data.data[data.data.length - 2] : latest;
              const change = latest[1] - previous[1];
              const changePercent = previous[1] !== 0 ? (change / previous[1]) * 100 : 0;
              
              return {
                symbol: index.symbol,
                name: index.name,
                value: latest[1],
                change: change,
                changePercent: changePercent,
                isPositive: change >= 0
              };
            }
          }
          throw new Error(`Failed to fetch ${index.symbol}`);
        })
      );
      
      return results
        .filter((result): result is PromiseFulfilledResult<IndexData> => result.status === 'fulfilled')
        .map(result => result.value);
    },
    refetchInterval: 30000,
    staleTime: 10000,
  });

  useEffect(() => {
    if (indicesData) {
      setIndices(indicesData);
    }
  }, [indicesData]);

  const fetchIndicesData = async () => {
    try {
      const promises = MARKET_INDICES.map(async (index) => {
        const response = await fetch(`/api/index/${index.symbol}?interval=int`);
        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.length > 0) {
            const latest = data.data[data.data.length - 1];
            const previous = data.data.length > 1 ? data.data[data.data.length - 2] : latest;
            const change = latest[1] - previous[1];
            const changePercent = previous[1] !== 0 ? (change / previous[1]) * 100 : 0;
            
            return {
              symbol: index.symbol,
              name: index.name,
              value: latest[1],
              change: change,
              changePercent: changePercent,
              isPositive: change >= 0
            };
          }
        }
        
        // Fallback with static data for demo
        const baseValues = {
          KSE100: 48500,
          ALLSHR: 32400,
          KSE30: 18200,
          KMI30: 65800,
          BKTI: 12500,
          OGTI: 8900
        };
        
        const baseValue = baseValues[index.symbol as keyof typeof baseValues] || 10000;
        const change = (Math.random() - 0.5) * 200; // Random change between -100 and +100
        const changePercent = (change / baseValue) * 100;
        
        return {
          symbol: index.symbol,
          name: index.name,
          value: baseValue + change,
          change: change,
          changePercent: changePercent,
          isPositive: change >= 0
        };
      });
      
      const results = await Promise.all(promises);
      setIndices(results.filter(Boolean));
    } catch (error) {
      console.error("Failed to fetch indices data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value: number) => {
    return value.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const formatChange = (change: number, changePercent: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`;
  };

  if (loading || !indices.length) {
    return (
      <div className={`bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-2 border-b ${className}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-blue-400 animate-pulse" />
              <span className="text-sm">Loading market indices...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-2 border-b ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium">Market Indices</span>
          </div>
          
          {/* Scrolling Indices Ticker */}
          <div className="flex-1 mx-4 overflow-hidden">
            <div className="animate-ticker whitespace-nowrap">
              <div className="inline-flex space-x-8">
                {indices.map((index) => (
                  <div key={index.symbol} className="inline-flex items-center space-x-2 text-sm">
                    <span className="font-semibold text-blue-300">{index.symbol}</span>
                    <span className="text-white">{formatValue(index.value)}</span>
                    <div className={`flex items-center ${
                      index.isPositive ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {index.isPositive ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      <span className="text-xs">
                        {formatChange(index.change, index.changePercent)}
                      </span>
                    </div>
                  </div>
                ))}
                {/* Repeat for seamless continuous scroll */}
                {indices.map((index) => (
                  <div key={`${index.symbol}-dup`} className="inline-flex items-center space-x-2 text-sm">
                    <span className="font-semibold text-blue-300">{index.symbol}</span>
                    <span className="text-white">{formatValue(index.value)}</span>
                    <div className={`flex items-center ${
                      index.isPositive ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {index.isPositive ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      <span className="text-xs">
                        {formatChange(index.change, index.changePercent)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-xs text-blue-400">
            PSX Indices
          </div>
        </div>
      </div>
    </div>
  );
}