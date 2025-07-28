import { ArrowUp, ArrowDown, Search, ChevronUp, ChevronDown } from "lucide-react";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import type { StockData } from "@shared/schema";

interface LiveStockTickerProps {
  stocks: StockData[];
}

type SortKey = 'symbol' | 'name' | 'current' | 'high' | 'low' | 'change' | 'volume';
type SortDirection = 'asc' | 'desc';

export default function LiveStockTicker({ stocks }: LiveStockTickerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>('volume');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [, setLocation] = useLocation();
  const formatPrice = (price: number) => {
    return `₨${price.toFixed(2)}`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    }
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
  };

  const formatChange = (change: number, changePercent: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(1)}%)`;
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const handleStockClick = (symbol: string) => {
    setLocation(`/stock/${symbol}`);
  };

  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4 inline-block ml-1" /> : 
      <ChevronDown className="w-4 h-4 inline-block ml-1" />;
  };

  const filteredAndSortedStocks = useMemo(() => {
    let filtered = stocks;
    
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = stocks.filter(stock => 
        stock.symbol.toLowerCase().includes(searchLower) ||
        stock.name.toLowerCase().includes(searchLower) ||
        stock.sector.toLowerCase().includes(searchLower)
      );
    }

    return filtered.sort((a, b) => {
      let aValue: any = a[sortKey];
      let bValue: any = b[sortKey];

      if (sortKey === 'symbol' || sortKey === 'name') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [stocks, searchTerm, sortKey, sortDirection]);

  if (stocks.length === 0) {
    return (
      <section id="stocks" className="mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-lg font-semibold text-slate-900">Live Stock Data</h3>
            <p className="text-sm text-slate-600">Real-time updates via WebSocket</p>
          </div>
          
          <div className="p-8 text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading stock data...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="stocks" className="mb-8">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Live Stock Data</h3>
              <p className="text-sm text-slate-600">Auto-refreshing every 30 seconds • {searchTerm ? `${filteredAndSortedStocks.length} of ${stocks.length}` : stocks.length} stocks</p>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search stocks by symbol, name, or sector..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              autoComplete="off"
            />
            {searchTerm && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-slate-500">
                {filteredAndSortedStocks.length} results
              </div>
            )}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('symbol')}
                >
                  Symbol {getSortIcon('symbol')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  Name {getSortIcon('name')}
                </th>
                <th 
                  className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('current')}
                >
                  Price {getSortIcon('current')}
                </th>
                <th 
                  className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('high')}
                >
                  High {getSortIcon('high')}
                </th>
                <th 
                  className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('low')}
                >
                  Low {getSortIcon('low')}
                </th>
                <th 
                  className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('change')}
                >
                  Change {getSortIcon('change')}
                </th>
                <th 
                  className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('volume')}
                >
                  Volume {getSortIcon('volume')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredAndSortedStocks.map((stock) => (
                <tr 
                  key={stock.symbol} 
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => handleStockClick(stock.symbol)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900 font-mono">{stock.symbol}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{stock.name}</div>
                    <div className="text-xs text-slate-500">{stock.sector}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-slate-900 font-mono">{formatPrice(stock.current)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-green-600 font-mono">{formatPrice(stock.high)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-red-600 font-mono">{formatPrice(stock.low)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end space-x-1">
                      {stock.isPositive ? (
                        <ArrowUp className="text-secondary text-xs" size={12} />
                      ) : (
                        <ArrowDown className="text-accent text-xs" size={12} />
                      )}
                      <span className={`text-sm font-mono font-medium ${
                        stock.isPositive ? 'text-secondary' : 'text-accent'
                      }`}>
                        {formatChange(stock.change, stock.changePercent)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-mono text-slate-900">{formatVolume(stock.volume)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
