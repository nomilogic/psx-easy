
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowUp, ArrowDown, TrendingUp, TrendingDown, Building2, Globe, Phone, MapPin, User, Calendar, DollarSign, BarChart3, PieChart, FileText, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

import type { StockData, CompanyData } from "@shared/schema";

export default function StockDetail() {
  const { symbol } = useParams<{ symbol: string }>();
  const [activeAnnouncementTab, setActiveAnnouncementTab] = useState<string>("");
  const [announcementPage, setAnnouncementPage] = useState<{[key: string]: number}>({});
  const [payoutsPage, setPayoutsPage] = useState(1);
  
  const ITEMS_PER_PAGE = 5;

  const { data: stock, isLoading: stockLoading } = useQuery({
    queryKey: ['/api/stocks'],
    enabled: !!symbol,
  });

  const { data: company, isLoading: companyLoading } = useQuery({
    queryKey: ['/api/company', symbol],
    enabled: !!symbol,
  });

  const stockData = (stock as StockData[])?.find((s: StockData) => s.symbol === symbol?.toUpperCase());
  const companyData = company as CompanyData;

  // Set default active tab when announcements data loads
  if (companyData?.announcements && activeAnnouncementTab === "") {
    const categories = Object.keys(companyData.announcements);
    if (categories.length > 0) {
      setActiveAnnouncementTab(categories[0]);
    }
  }

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

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1000000000) {
      return `₨${(marketCap / 1000000000).toFixed(2)}B`;
    }
    if (marketCap >= 1000000) {
      return `₨${(marketCap / 1000000).toFixed(2)}M`;
    }
    return `₨${marketCap.toFixed(2)}`;
  };

  const formatNumber = (number: number) => {
    if (number >= 1000000000) {
      return `${(number / 1000000000).toFixed(2)}B`;
    }
    if (number >= 1000000) {
      return `${(number / 1000000).toFixed(2)}M`;
    }
    if (number >= 1000) {
      return `${(number / 1000).toFixed(2)}K`;
    }
    return number.toFixed(2);
  };

  const formatPercentage = (value: number | null) => {
    if (value === null || value === undefined) {
      return 'N/A';
    }
    return `${value.toFixed(2)}%`;
  };

  const formatRatio = (value: number | null) => {
    if (value === null || value === undefined) {
      return 'N/A';
    }
    return value.toFixed(2);
  };

  // Pagination helper functions
  const getPaginatedData = <T,>(data: T[], page: number, itemsPerPage: number = ITEMS_PER_PAGE): T[] => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = (totalItems: number, itemsPerPage: number = ITEMS_PER_PAGE): number => {
    return Math.ceil(totalItems / itemsPerPage);
  };

  const PaginationControls = ({ 
    currentPage, 
    totalPages, 
    onPageChange, 
    className = "" 
  }: { 
    currentPage: number; 
    totalPages: number; 
    onPageChange: (page: number) => void;
    className?: string;
  }) => {
    if (totalPages <= 1) return null;

    return (
      <div className={`flex items-center justify-center space-x-2 mt-4 ${className}`}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <span className="text-sm text-slate-600">
          Page {currentPage} of {totalPages}
        </span>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  if (stockLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading stock details...</p>
        </div>
      </div>
    );
  }

  if (!stockData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Stock Not Found</h1>
          <p className="text-slate-600 mb-6">The stock symbol "{symbol}" was not found.</p>
          <Link href="/" className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="flex items-center px-3 py-1 text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
              <div className="h-6 w-px bg-slate-300"></div>
              <h1 className="text-xl font-bold text-slate-900">{stockData.symbol}</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stock Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{stockData.name}</h2>
              <p className="text-slate-600">{stockData.sector}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-slate-900 font-mono mb-1">
                {formatPrice(stockData.current)}
              </div>
              <div className={`flex items-center justify-end space-x-1 ${
                stockData.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {stockData.isPositive ? (
                  <TrendingUp className="w-5 h-5" />
                ) : (
                  <TrendingDown className="w-5 h-5" />
                )}
                <span className="text-lg font-semibold font-mono">
                  {formatChange(stockData.change, stockData.changePercent)}
                </span>
              </div>
            </div>
          </div>

          {/* Price Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-500 mb-1">Open</p>
              <p className="text-lg font-semibold font-mono">{formatPrice(stockData.open)}</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-500 mb-1">High</p>
              <p className="text-lg font-semibold font-mono text-green-600">{formatPrice(stockData.high)}</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-500 mb-1">Low</p>
              <p className="text-lg font-semibold font-mono text-red-600">{formatPrice(stockData.low)}</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-500 mb-1">Volume</p>
              <p className="text-lg font-semibold font-mono">{formatVolume(stockData.volume)}</p>
            </div>
          </div>
        </div>

        {/* Company Information */}
        {companyData && !companyLoading && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Company Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-3">
                {companyData.description && (
                  <div>
                    <h4 className="font-medium text-slate-900 mb-1">Description</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">{companyData.description}</p>
                  </div>
                )}

                {companyData.website && (
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-slate-400" />
                    <a 
                      href={companyData.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {companyData.website}
                    </a>
                  </div>
                )}

                {companyData.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">{companyData.phone}</span>
                  </div>
                )}

                {companyData.address && (
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                    <span className="text-slate-600 text-sm">{companyData.address}</span>
                  </div>
                )}

                {companyData.ceo && (
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">CEO: {companyData.ceo}</span>
                  </div>
                )}
              </div>

              {/* Financial Metrics */}
              <div className="space-y-3">
                <h4 className="font-medium text-slate-900 mb-3 flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Key Metrics
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  {companyData.marketCap && (
                    <div className="p-2.5 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500">Market Cap</p>
                      <p className="font-semibold">{formatMarketCap(companyData.marketCap)}</p>
                    </div>
                  )}

                  {companyData.sharesOutstanding && (
                    <div className="p-2.5 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500">Shares Outstanding</p>
                      <p className="font-semibold">{formatNumber(companyData.sharesOutstanding)}</p>
                    </div>
                  )}

                  {companyData.freeFloat && (
                    <div className="p-2.5 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500">Free Float</p>
                      <p className="font-semibold">{formatPercentage(companyData.freeFloat)}</p>
                    </div>
                  )}

                  {companyData.peRatio && (
                    <div className="p-2.5 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500">P/E Ratio</p>
                      <p className="font-semibold">{companyData.peRatio.toFixed(2)}</p>
                    </div>
                  )}

                  {companyData.pbRatio && (
                    <div className="p-2.5 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500">P/B Ratio</p>
                      <p className="font-semibold">{companyData.pbRatio.toFixed(2)}</p>
                    </div>
                  )}

                  {companyData.dividendYield && (
                    <div className="p-2.5 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500">Dividend Yield</p>
                      <p className="font-semibold">{companyData.dividendYield.toFixed(2)}%</p>
                    </div>
                  )}

                  {companyData.epsRatio && (
                    <div className="p-2.5 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500">EPS</p>
                      <p className="font-semibold">₨{companyData.epsRatio.toFixed(2)}</p>
                    </div>
                  )}

                  {companyData.bookValue && (
                    <div className="p-2.5 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500">Book Value</p>
                      <p className="font-semibold">₨{companyData.bookValue.toFixed(2)}</p>
                    </div>
                  )}
                </div>

                {(companyData.high52Week || companyData.low52Week) && (
                  <div className="mt-3">
                    <h5 className="font-medium text-slate-900 mb-2">52-Week Range</h5>
                    <div className="flex space-x-3">
                      {companyData.low52Week && (
                        <div className="p-2.5 bg-red-50 rounded-lg flex-1">
                          <p className="text-xs text-red-600">52W Low</p>
                          <p className="font-semibold text-red-700">{formatPrice(companyData.low52Week)}</p>
                        </div>
                      )}
                      {companyData.high52Week && (
                        <div className="p-2.5 bg-green-50 rounded-lg flex-1">
                          <p className="text-xs text-green-600">52W High</p>
                          <p className="font-semibold text-green-700">{formatPrice(companyData.high52Week)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Key People */}
            {companyData.keyPeople && Array.isArray(companyData.keyPeople) && companyData.keyPeople.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-200">
                <h4 className="font-medium text-slate-900 mb-3 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Key People
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {companyData.keyPeople.map((person: any, index: number) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                      <User className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="font-medium text-slate-900">{person.name}</p>
                        <p className="text-sm text-slate-600">{person.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Equity Profile Section - Moved here after Key People */}
            {companyData.equityProfile && companyData.equityProfile.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-200">
                <h4 className="font-medium text-slate-900 mb-3 flex items-center">
                  <PieChart className="w-4 h-4 mr-2" />
                  Equity Profile
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 px-3 font-medium text-slate-900 text-sm">Year</th>
                        <th className="text-right py-2 px-3 font-medium text-slate-900 text-sm">Market Cap</th>
                        <th className="text-right py-2 px-3 font-medium text-slate-900 text-sm">Shares Outstanding</th>
                        <th className="text-right py-2 px-3 font-medium text-slate-900 text-sm">Free Float %</th>
                        <th className="text-right py-2 px-3 font-medium text-slate-900 text-sm">Book Value</th>
                        <th className="text-right py-2 px-3 font-medium text-slate-900 text-sm">P/B Ratio</th>
                        <th className="text-right py-2 px-3 font-medium text-slate-900 text-sm">Dividend Yield</th>
                        <th className="text-right py-2 px-3 font-medium text-slate-900 text-sm">EPS</th>
                        <th className="text-right py-2 px-3 font-medium text-slate-900 text-sm">P/E Ratio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {companyData.equityProfile.map((profile, index) => (
                        <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-2 px-3 font-medium text-slate-900 text-sm">{profile.year}</td>
                          <td className="py-2 px-3 text-right text-slate-700 text-sm">
                            {profile.marketCap ? `₨${formatNumber(profile.marketCap)}` : 'N/A'}
                          </td>
                          <td className="py-2 px-3 text-right text-slate-700 text-sm">
                            {formatNumber(profile.sharesOutstanding)}
                          </td>
                          <td className="py-2 px-3 text-right text-slate-700 text-sm">
                            {formatPercentage(profile.freeFloat)}
                          </td>
                          <td className="py-2 px-3 text-right text-slate-700 text-sm">
                            {profile.bookValue ? `₨${formatRatio(profile.bookValue)}` : 'N/A'}
                          </td>
                          <td className="py-2 px-3 text-right text-slate-700 text-sm">
                            {formatRatio(profile.priceToBook)}
                          </td>
                          <td className="py-2 px-3 text-right text-slate-700 text-sm">
                            {formatPercentage(profile.dividendYield)}
                          </td>
                          <td className="py-2 px-3 text-right text-slate-700 text-sm">
                            {profile.earningsPerShare ? `₨${formatRatio(profile.earningsPerShare)}` : 'N/A'}
                          </td>
                          <td className="py-2 px-3 text-right text-slate-700 text-sm">
                            {formatRatio(profile.priceEarningsRatio)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Financial Performance Section */}
        {companyData?.financialData && companyData.financialData.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Financial Performance
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3 font-medium text-slate-900 text-sm">Year</th>
                    <th className="text-right py-2 px-3 font-medium text-slate-900 text-sm">Sales</th>
                    <th className="text-right py-2 px-3 font-medium text-slate-900 text-sm">Profit After Tax</th>
                    <th className="text-right py-2 px-3 font-medium text-slate-900 text-sm">EPS</th>
                  </tr>
                </thead>
                <tbody>
                  {companyData.financialData.map((financial, index) => (
                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-2 px-3 font-medium text-slate-900 text-sm">{financial.year}</td>
                      <td className="py-2 px-3 text-right text-slate-700 text-sm">
                        {financial.sales ? `₨${formatNumber(financial.sales)}` : 'N/A'}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-700 text-sm">
                        {financial.profitAfterTax ? `₨${formatNumber(financial.profitAfterTax)}` : 'N/A'}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-700 text-sm">
                        {financial.eps ? `₨${formatRatio(financial.eps)}` : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Financial Ratios Section */}
        {companyData?.ratiosData && companyData.ratiosData.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Financial Ratios
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3 font-medium text-slate-900 text-sm">Year</th>
                    <th className="text-right py-2 px-3 font-medium text-slate-900 text-sm">Gross Profit Margin</th>
                    <th className="text-right py-2 px-3 font-medium text-slate-900 text-sm">Net Profit Margin</th>
                    <th className="text-right py-2 px-3 font-medium text-slate-900 text-sm">EPS Growth</th>
                    <th className="text-right py-2 px-3 font-medium text-slate-900 text-sm">PEG Ratio</th>
                  </tr>
                </thead>
                <tbody>
                  {companyData.ratiosData.map((ratios, index) => (
                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-2 px-3 font-medium text-slate-900 text-sm">{ratios.year}</td>
                      <td className="py-2 px-3 text-right text-slate-700 text-sm">
                        {formatPercentage(ratios.grossProfitMargin)}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-700 text-sm">
                        {formatPercentage(ratios.netProfitMargin)}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-700 text-sm">
                        {formatPercentage(ratios.epsGrowth)}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-700 text-sm">
                        {formatRatio(ratios.peg)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Payouts Data Section */}
        {companyData?.payoutsData && companyData.payoutsData.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Dividend Payouts
            </h3>
            
            <div className="space-y-3">
              {getPaginatedData(companyData.payoutsData, payoutsPage).map((payout, index) => (
                <div key={index} className="border border-slate-200 rounded-lg p-3 hover:bg-slate-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">Date</p>
                      <p className="text-sm text-slate-600">{payout.date}</p>
                    </div>
                    {payout.financialResults && (
                      <div>
                        <p className="text-sm font-medium text-slate-900">Financial Results</p>
                        <p className="text-sm text-slate-600">{payout.financialResults}</p>
                      </div>
                    )}
                    {payout.details && (
                      <div>
                        <p className="text-sm font-medium text-slate-900">Details</p>
                        <p className="text-sm text-slate-600">{payout.details}</p>
                      </div>
                    )}
                    {payout.bookClosure && (
                      <div>
                        <p className="text-sm font-medium text-slate-900">Book Closure</p>
                        <p className="text-sm text-slate-600">{payout.bookClosure}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <PaginationControls
              currentPage={payoutsPage}
              totalPages={getTotalPages(companyData.payoutsData.length)}
              onPageChange={setPayoutsPage}
            />
          </div>
        )}

        {/* Announcements Section with Tabs */}
        {companyData?.announcements && typeof companyData.announcements === 'object' && Object.keys(companyData.announcements).length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Company Announcements
            </h3>

            {/* Tab Navigation */}
            <div className="border-b border-slate-200 mb-4">
              <nav className="flex space-x-6 overflow-x-auto">
                {Object.keys(companyData.announcements).map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveAnnouncementTab(category)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeAnnouncementTab === category
                        ? 'border-primary text-primary'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {category.replace(/_/g, ' ').toUpperCase()}
                    <span className="ml-2 text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                      {(companyData.announcements as any)[category]?.length || 0}
                    </span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            {activeAnnouncementTab && (companyData.announcements as any)[activeAnnouncementTab] && (
              <div>
                <div className="space-y-3">
                  {getPaginatedData(
                    (companyData.announcements as any)[activeAnnouncementTab],
                    announcementPage[activeAnnouncementTab] || 1
                  ).map((announcement: any, index: number) => (
                    <div key={index} className="border border-slate-200 rounded-lg p-3 hover:bg-slate-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900 mb-1">{announcement.title}</h4>
                          <p className="text-sm text-slate-500 mb-2">{announcement.date}</p>
                        </div>
                        {announcement.document && (
                          <a
                            href={announcement.document}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors ml-4"
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            View Document
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <PaginationControls
                  currentPage={announcementPage[activeAnnouncementTab] || 1}
                  totalPages={getTotalPages((companyData.announcements as any)[activeAnnouncementTab]?.length || 0)}
                  onPageChange={(page) => setAnnouncementPage({
                    ...announcementPage,
                    [activeAnnouncementTab]: page
                  })}
                />
              </div>
            )}
          </div>
        )}

        {/* Company Description */}
        {companyData?.businessDescription && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Business Description</h3>
            <p className="text-slate-600 leading-relaxed">
              {companyData.businessDescription}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
