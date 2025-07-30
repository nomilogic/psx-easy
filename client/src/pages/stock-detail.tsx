import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowUp, ArrowDown, TrendingUp, TrendingDown, Building2, Globe, Phone, MapPin, User, Calendar, DollarSign, BarChart3, PieChart } from "lucide-react";

import type { StockData, CompanyData } from "@shared/schema";

export default function StockDetail() {
  const { symbol } = useParams<{ symbol: string }>();

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
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
            <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Company Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Basic Info */}
              <div className="space-y-4">
                {companyData.description && (
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">Description</h4>
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
              <div className="space-y-4">
                <h4 className="font-medium text-slate-900 mb-4 flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Financial Metrics
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  {companyData.marketCap && (
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500">Market Cap</p>
                      <p className="font-semibold">{formatMarketCap(companyData.marketCap)}</p>
                    </div>
                  )}

                  {companyData.peRatio && (
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500">P/E Ratio</p>
                      <p className="font-semibold">{companyData.peRatio.toFixed(2)}</p>
                    </div>
                  )}

                  {companyData.pbRatio && (
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500">P/B Ratio</p>
                      <p className="font-semibold">{companyData.pbRatio.toFixed(2)}</p>
                    </div>
                  )}

                  {companyData.dividendYield && (
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500">Dividend Yield</p>
                      <p className="font-semibold">{companyData.dividendYield.toFixed(2)}%</p>
                    </div>
                  )}

                  {companyData.epsRatio && (
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500">EPS</p>
                      <p className="font-semibold">₨{companyData.epsRatio.toFixed(2)}</p>
                    </div>
                  )}

                  {companyData.bookValue && (
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500">Book Value</p>
                      <p className="font-semibold">₨{companyData.bookValue.toFixed(2)}</p>
                    </div>
                  )}
                </div>

                {(companyData.high52Week || companyData.low52Week) && (
                  <div className="mt-4">
                    <h5 className="font-medium text-slate-900 mb-2">52-Week Range</h5>
                    <div className="flex space-x-4">
                      {companyData.low52Week && (
                        <div className="p-3 bg-red-50 rounded-lg flex-1">
                          <p className="text-xs text-red-600">52W Low</p>
                          <p className="font-semibold text-red-700">{formatPrice(companyData.low52Week)}</p>
                        </div>
                      )}
                      {companyData.high52Week && (
                        <div className="p-3 bg-green-50 rounded-lg flex-1">
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
              <div className="mt-8 pt-6 border-t border-slate-200">
                <h4 className="font-medium text-slate-900 mb-4">Key People</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* Announcements */}
            {companyData.announcements && typeof companyData.announcements === 'object' && Object.keys(companyData.announcements).length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-200">
                <h4 className="font-medium text-slate-900 mb-4">Recent Announcements</h4>
                <div className="space-y-4">
                  {Object.entries(companyData.announcements as any).map(([category, announcements]: [string, any]) => (
                    <div key={category} className="bg-slate-50 rounded-lg p-4">
                      <h5 className="font-medium text-slate-900 mb-3 capitalize">{category}</h5>
                      <div className="space-y-2">
                        {Array.isArray(announcements) && announcements.slice(0, 5).map((announcement: any, index: number) => (
                          <div key={index} className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm text-slate-700">{announcement.title}</p>
                              <p className="text-xs text-slate-500 mt-1">{announcement.date}</p>
                            </div>
                            {announcement.documentUrl && (
                              <a 
                                href={announcement.documentUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline text-xs ml-4"
                              >
                                View
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Equity Profile Section */}
        {companyData.equityProfile && companyData.equityProfile.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Equity Profile
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200 dark:border-gray-700">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="border border-gray-200 dark:border-gray-700 p-3 text-left font-medium">Year</th>
                    <th className="border border-gray-200 dark:border-gray-700 p-3 text-left font-medium">Market Cap</th>
                    <th className="border border-gray-200 dark:border-gray-700 p-3 text-left font-medium">Shares Outstanding</th>
                    <th className="border border-gray-200 dark:border-gray-700 p-3 text-left font-medium">Free Float %</th>
                    <th className="border border-gray-200 dark:border-gray-700 p-3 text-left font-medium">Book Value</th>
                    <th className="border border-gray-200 dark:border-gray-700 p-3 text-left font-medium">P/B Ratio</th>
                    <th className="border border-gray-200 dark:border-gray-700 p-3 text-left font-medium">Dividend Yield</th>
                    <th className="border border-gray-200 dark:border-gray-700 p-3 text-left font-medium">EPS</th>
                    <th className="border border-gray-200 dark:border-gray-700 p-3 text-left font-medium">P/E Ratio</th>
                  </tr>
                </thead>
                <tbody>
                  {companyData.equityProfile.map((profile, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="border border-gray-200 dark:border-gray-700 p-3 font-medium">{profile.year}</td>
                      <td className="border border-gray-200 dark:border-gray-700 p-3">
                        {profile.marketCap ? `₨${formatNumber(profile.marketCap)}` : 'N/A'}
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 p-3">
                        {formatNumber(profile.sharesOutstanding)}
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 p-3">
                        {formatPercentage(profile.freeFloat)}
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 p-3">
                        {profile.bookValue ? `₨${formatRatio(profile.bookValue)}` : 'N/A'}
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 p-3">
                        {formatRatio(profile.priceToBook)}
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 p-3">
                        {formatPercentage(profile.dividendYield)}
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 p-3">
                        {profile.earningsPerShare ? `₨${formatRatio(profile.earningsPerShare)}` : 'N/A'}
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 p-3">
                        {formatRatio(profile.priceEarningsRatio)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Financial Ratios Section */}
        {companyData.ratiosData && companyData.ratiosData.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Financial Ratios
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200 dark:border-gray-700">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="border border-gray-200 dark:border-gray-700 p-3 text-left font-medium">Year</th>
                    <th className="border border-gray-200 dark:border-gray-700 p-3 text-left font-medium">Gross Profit Margin</th>
                    <th className="border border-gray-200 dark:border-gray-700 p-3 text-left font-medium">Net Profit Margin</th>
                    <th className="border border-gray-200 dark:border-gray-700 p-3 text-left font-medium">EPS Growth</th>
                    <th className="border border-gray-200 dark:border-gray-700 p-3 text-left font-medium">PEG Ratio</th>
                  </tr>
                </thead>
                <tbody>
                  {companyData.ratiosData.map((ratios, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="border border-gray-200 dark:border-gray-700 p-3 font-medium">{ratios.year}</td>
                      <td className="border border-gray-200 dark:border-gray-700 p-3">
                        {formatPercentage(ratios.grossProfitMargin)}
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 p-3">
                        {formatPercentage(ratios.netProfitMargin)}
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 p-3">
                        {formatPercentage(ratios.epsGrowth)}
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 p-3">
                        {formatRatio(ratios.peg)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Financial Data Section */}
        {companyData.financialData && companyData.financialData.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial Performance
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200 dark:border-gray-700">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="border border-gray-200 dark:border-gray-700 p-3 text-left font-medium">Year</th>
                    <th className="border border-gray-200 dark:border-gray-700 p-3 text-left font-medium">Sales</th>
                    <th className="border border-gray-200 dark:border-gray-700 p-3 text-left font-medium">Profit After Tax</th>
                    <th className="border border-gray-200 dark:border-gray-700 p-3 text-left font-medium">EPS</th>
                  </tr>
                </thead>
                <tbody>
                  {companyData.financialData.map((financial, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="border border-gray-200 dark:border-gray-700 p-3 font-medium">{financial.year}</td>
                      <td className="border border-gray-200 dark:border-gray-700 p-3">
                        {financial.sales ? `₨${formatNumber(financial.sales)}` : 'N/A'}
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 p-3">
                        {financial.profitAfterTax ? `₨${formatNumber(financial.profitAfterTax)}` : 'N/A'}
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 p-3">
                        {financial.eps ? `₨${formatRatio(financial.eps)}` : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Company Description */}
        {companyData.description && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">About {companyData.name}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {companyData.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}