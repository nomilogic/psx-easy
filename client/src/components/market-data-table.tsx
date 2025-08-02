
import { ArrowUp, ArrowDown, Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import type { StockData } from "@shared/schema";
import { useWebSocket } from "@/hooks/use-websocket";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";

interface MarketDataTableProps {
  stocks: StockData[];
}

type SortKey = 'symbol' | 'name' | 'current' | 'high' | 'low' | 'change' | 'volume';
type SortDirection = 'asc' | 'desc';

export default function MarketDataTable({ stocks: initialStocks }: MarketDataTableProps) {
  const [stocks, setStocks] = useState<StockData[]>(initialStocks || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>('volume');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [indexFilter, setIndexFilter] = useState<string>("ALL");
  const [, setLocation] = useLocation();

  const { isConnected, lastMessage } = useWebSocket();

  // API fallback when WebSocket is not working
  const { data: apiData, isLoading: apiLoading } = useQuery({
    queryKey: ['/api/stocks'],
    queryFn: async () => {
      const response = await fetch('/api/stocks');
      if (!response.ok) {
        throw new Error('Failed to fetch stocks');
      }
      return response.json();
    },
    enabled: true, // Always try to fetch data
    refetchInterval: isConnected ? 60000 : 30000, // Slower refresh when WebSocket is active
    staleTime: 10000,
    retry: 3,
  });

  // Initialize stocks with props data or empty array
  useEffect(() => {
    if (initialStocks && initialStocks.length > 0) {
      setStocks(initialStocks);
    }
  }, [initialStocks]);

  // Use API data when WebSocket is not connected or no stocks available
  useEffect(() => {
    if ((!isConnected || stocks.length === 0) && apiData?.stocks && Array.isArray(apiData.stocks)) {
      setStocks(apiData.stocks);
    }
  }, [isConnected, apiData, stocks.length]);
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

  // Get the count of available stocks for each index
  const getIndexStockCount = (indexName: string) => {
    if (!Array.isArray(stocks)) return 0;
    return stocks.filter(stock => 
      stock.listedIn && Array.isArray(stock.listedIn) && stock.listedIn.includes(indexName)
    ).length;
  };

  // Get all available indices from the stock data
  const availableIndices = useMemo(() => {
    if (!Array.isArray(stocks)) return [];

    const indicesSet = new Set<string>();
    stocks.forEach(stock => {
      if (stock.listedIn && Array.isArray(stock.listedIn)) {
        stock.listedIn.forEach(index => indicesSet.add(index));
      }
    });

    return Array.from(indicesSet).sort();
  }, [stocks]);

  const filteredAndSortedStocks = useMemo(() => {
    // Ensure stocks is an array before processing
    if (!Array.isArray(stocks)) {
      return [];
    }

    let filtered = stocks;

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = stocks.filter(stock => 
        stock.symbol.toLowerCase().includes(searchLower) ||
        stock.name.toLowerCase().includes(searchLower) ||
        stock.sector.toLowerCase().includes(searchLower)
      );
    }

    // Apply index filter based on listed_in data from Arif Habib API
    if (indexFilter !== "ALL") {
      filtered = filtered.filter(stock => 
        stock.listedIn && Array.isArray(stock.listedIn) && stock.listedIn.includes(indexFilter)
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
  }, [stocks, searchTerm, sortKey, sortDirection, indexFilter]);

  const paginatedStocks = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedStocks.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedStocks, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredAndSortedStocks.length / pageSize);

  // Reset to first page when search term changes
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, pageSize]);

  useEffect(() => {
    if (lastMessage && lastMessage.type === 'stock_update' && lastMessage.data) {
      try {
        const data = lastMessage.data;
        if (data.type === 'stocks' && Array.isArray(data.data)) {
          setStocks(data.data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    }
  }, [lastMessage]);

  if ((!Array.isArray(stocks) || stocks.length === 0) && apiLoading) {
    return (
      <section id="stocks" className="mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-lg font-semibold text-slate-900">Market Data Table</h3>
            <p className="text-sm text-slate-600">
              {isConnected ? "Live via WebSocket" : "Loading from API..."}
            </p>
          </div>

          <div className="p-8 text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading stock data...</p>
          </div>
        </div>
      </section>
    );
  }

  // Show empty state if no data after loading
  if (!Array.isArray(stocks) || stocks.length === 0) {
    return (
      <section id="stocks" className="mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-lg font-semibold text-slate-900">Market Data Table</h3>
            <p className="text-sm text-slate-600">No market data available</p>
          </div>

          <div className="p-8 text-center">
            <p className="text-slate-600">Unable to load stock data. Please try refreshing the page.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="stocks" className="mb-8">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Market Data Table</h3>
              <p className="text-sm text-slate-600">
                {isConnected ? "Live via WebSocket" : "API fallback"} • Auto-refreshing every 30 seconds • {searchTerm ? `${filteredAndSortedStocks.length} of ${stocks.length}` : stocks.length} stocks
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Show:</span>
              <select 
                value={pageSize} 
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="border border-slate-300 rounded-md px-2 py-1 text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
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

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <Select value={indexFilter} onValueChange={setIndexFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by index" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Stocks ({stocks.length})</SelectItem>
                  {availableIndices.map((index) => {
                    const count = getIndexStockCount(index);
                    return count > 0 ? (
                      <SelectItem key={index} value={index}>
                        {index} ({count} stocks)
                      </SelectItem>
                    ) : null;
                  })}
                </SelectContent>
              </Select>
            </div>
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
              {paginatedStocks.map((stock) => (
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
                    <div className="flex gap-1 mt-1">
                      {stock.sectorCode && (
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          {stock.sectorCode}
                        </Badge>
                      )}
                      {stock.listedIn && Array.isArray(stock.listedIn) && stock.listedIn.length > 0 && (
                        <>
                          {stock.listedIn.slice(0, 2).map((index) => (
                            <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                              {index}
                            </Badge>
                          ))}
                          {stock.listedIn.length > 2 && (
                            <Badge variant="outline" className="text-xs px-1 py-0">
                              +{stock.listedIn.length - 2}
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <div className="text-sm text-slate-700">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredAndSortedStocks.length)} of {filteredAndSortedStocks.length} stocks
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <div className="flex items-center space-x-1">
                {/* Show first page */}
                {currentPage > 3 && (
                  <>
                    <Button
                      variant={currentPage === 1 ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                    >
                      1
                    </Button>
                    {currentPage > 4 && <span className="text-slate-400">...</span>}
                  </>
                )}

                {/* Show pages around current page */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages, currentPage - 2 + i));
                  if (pageNum < 1 || pageNum > totalPages) return null;
                  if (currentPage <= 3) {
                    const page = i + 1;
                    if (page > totalPages) return null;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    );
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                {/* Show last page */}
                {currentPage < totalPages - 2 && (
                  <>
                    {currentPage < totalPages - 3 && <span className="text-slate-400">...</span>}
                    <Button
                      variant={currentPage === totalPages ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
