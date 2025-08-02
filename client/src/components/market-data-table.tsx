
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

const MAJOR_INDICES = [
  "KSE100", "ALLSHR", "KSE30", "KMI30", "BKTI", "OGTI", 
  "KMIALLSHR", "PSXDIV20", "UPP9", "NITPGI", "NBPPGI", 
  "MZNPI", "JSMFI", "ACI", "JSGBKTI", "MII30", "HBLTTI", "KSE100PR"
];

export default function MarketDataTable({ stocks: initialStocks }: MarketDataTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>('volume');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [indexFilter, setIndexFilter] = useState<string>("ALL");
  const [sectorFilter, setSectorFilter] = useState<string>("ALL");
  const [, setLocation] = useLocation();

  const { isConnected, lastMessage } = useWebSocket();

  // Fetch filtered stocks from API based on current filters
  const { data: filteredData, isLoading: apiLoading, refetch } = useQuery({
    queryKey: ['/api/stocks', indexFilter, sectorFilter, searchTerm, currentPage, pageSize, sortKey, sortDirection],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (indexFilter !== "ALL") {
        // Use the index-specific API endpoint
        const response = await fetch(`/api/stocks/${indexFilter}?limit=${pageSize}&offset=${(currentPage - 1) * pageSize}`);
        if (!response.ok) throw new Error('Failed to fetch index stocks');
        return response.json();
      } else {
        // Use the general stocks API with filters
        params.set('page', currentPage.toString());
        params.set('limit', pageSize.toString());
        if (sectorFilter !== "ALL") params.set('sector', sectorFilter);
        if (searchTerm.trim()) params.set('search', searchTerm.trim());
        
        const response = await fetch(`/api/stocks?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch stocks');
        return response.json();
      }
    },
    enabled: true,
    refetchInterval: isConnected ? 60000 : 30000,
    staleTime: 10000,
    retry: 3,
  });

  // Fetch available sectors for the dropdown
  const { data: sectorsData } = useQuery({
    queryKey: ["/api/sectors"],
    queryFn: async () => {
      const response = await fetch('/api/sectors');
      if (!response.ok) throw new Error('Failed to fetch sectors');
      return response.json();
    },
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  const stocks = filteredData?.stocks || [];
  const totalStocks = filteredData?.total || 0;
  const totalPages = Math.ceil(totalStocks / pageSize);

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
    const safeChange = change || 0;
    const safeChangePercent = changePercent || 0;
    return `${sign}${safeChange.toFixed(2)} (${sign}${safeChangePercent.toFixed(1)}%)`;
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

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, indexFilter, sectorFilter]);

  // Trigger refetch when filters change
  useEffect(() => {
    refetch();
  }, [indexFilter, sectorFilter, searchTerm, currentPage, pageSize, sortKey, sortDirection, refetch]);

  if (apiLoading && stocks.length === 0) {
    return (
      <section id="stocks" className="mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-lg font-semibold text-slate-900">Market Data Table</h3>
            <p className="text-sm text-slate-600">Loading filtered data...</p>
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Market Data Table</h3>
              <p className="text-sm text-slate-600">
                {indexFilter !== "ALL" ? `${indexFilter} Stocks` : sectorFilter !== "ALL" ? `${sectorFilter} Sector` : "All Stocks"} • 
                {searchTerm ? ` Search: "${searchTerm}" • ` : " "}
                {totalStocks} total stocks • Page {currentPage} of {totalPages}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Show:</span>
              <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
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
                <button 
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  ×
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              
              {/* Index Filter */}
              <Select value={indexFilter} onValueChange={setIndexFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Index" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Indices</SelectItem>
                  {MAJOR_INDICES.map((index) => (
                    <SelectItem key={index} value={index}>
                      {index}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sector Filter */}
              <Select value={sectorFilter} onValueChange={setSectorFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Sectors</SelectItem>
                  {sectorsData?.map((sector: any) => (
                    <SelectItem key={sector.name} value={sector.name}>
                      {sector.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              {(indexFilter !== "ALL" || sectorFilter !== "ALL" || searchTerm) && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setIndexFilter("ALL");
                    setSectorFilter("ALL");
                    setSearchTerm("");
                  }}
                >
                  Clear
                </Button>
              )}
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
              {stocks.map((stock: any) => (
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
                          {stock.listedIn.slice(0, 2).map((index: string) => (
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
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalStocks)} of {totalStocks} stocks
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
