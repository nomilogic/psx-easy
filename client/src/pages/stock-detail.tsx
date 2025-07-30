import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Building2,
  Globe,
  Phone,
  MapPin,
  User,
  Calendar,
  DollarSign,
  BarChart3,
  PieChart,
  FileText,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Activity,
  Target,
  Users,
  Briefcase,
  Download,
} from "lucide-react";
import { useState } from "react";

import type { StockData, CompanyData } from "@shared/schema";

export default function StockDetail() {
  const { symbol } = useParams<{ symbol: string }>();
  const [activeTab, setActiveTab] = useState<string>("profile");
  const [activeAnnouncementTab, setActiveAnnouncementTab] = useState<string>("");
  const [announcementPage, setAnnouncementPage] = useState<{ [key: string]: number }>({});
  const [payoutsPage, setPayoutsPage] = useState(1);

  const ITEMS_PER_PAGE = 10;

  const { data: stock, isLoading: stockLoading } = useQuery({
    queryKey: ["/api/stocks"],
    enabled: !!symbol,
  });

  const { data: company, isLoading: companyLoading } = useQuery({
    queryKey: ["/api/company", symbol],
    enabled: !!symbol,
  });

  const stockData = (stock as StockData[])?.find(
    (s: StockData) => s.symbol === symbol?.toUpperCase(),
  );
  const companyData = company as CompanyData;

  // Set default active announcement tab when data loads
  if (companyData?.announcements && activeAnnouncementTab === "") {
    const categories = Object.keys(companyData.announcements);
    if (categories.length > 0) {
      setActiveAnnouncementTab(categories[0]);
    }
  }

  const formatPrice = (price: number) => {
    return `Rs. ${price.toFixed(2)}`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    }
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toLocaleString();
  };

  const formatChange = (change: number, changePercent: number) => {
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`;
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1000000000) {
      return `Rs. ${(marketCap / 1000000000).toFixed(2)}B`;
    }
    if (marketCap >= 1000000) {
      return `Rs. ${(marketCap / 1000000).toFixed(2)}M`;
    }
    return `Rs. ${marketCap.toLocaleString()}`;
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
    return number.toLocaleString();
  };

  const formatPercentage = (value: number | null | undefined) => {
    if (value === null || value === undefined) {
      return "-";
    }
    return `${value.toFixed(2)}%`;
  };

  const formatRatio = (value: number | null | undefined) => {
    if (value === null || value === undefined) {
      return "-";
    }
    return value.toFixed(2);
  };

  // Generate sample data for demonstration
  const generateSampleFinancials = () => {
    const currentYear = new Date().getFullYear();
    return {
      annual: [
        { label: (currentYear - 3).toString(), sales: 2400000000, profitAfterTax: 360000000, eps: 15.75 },
        { label: (currentYear - 2).toString(), sales: 2650000000, profitAfterTax: 398000000, eps: 17.42 },
        { label: (currentYear - 1).toString(), sales: 2890000000, profitAfterTax: 435000000, eps: 19.08 },
        { label: currentYear.toString(), sales: 3120000000, profitAfterTax: 468000000, eps: 20.52 }
      ],
      quarterly: [
        { label: "Q1 2024", sales: 780000000, profitAfterTax: 117000000, eps: 5.13 },
        { label: "Q2 2024", sales: 820000000, profitAfterTax: 123000000, eps: 5.39 },
        { label: "Q3 2024", sales: 760000000, profitAfterTax: 114000000, eps: 4.99 },
        { label: "Q4 2024", sales: 760000000, profitAfterTax: 114000000, eps: 4.99 }
      ]
    };
  };

  const generateSampleRatios = () => {
    const currentYear = new Date().getFullYear();
    return [
      { year: (currentYear - 3).toString(), grossProfitMargin: 22.5, netProfitMargin: 15.0, epsGrowth: 8.2, peg: 1.85 },
      { year: (currentYear - 2).toString(), grossProfitMargin: 23.1, netProfitMargin: 15.3, epsGrowth: 10.6, peg: 1.72 },
      { year: (currentYear - 1).toString(), grossProfitMargin: 23.8, netProfitMargin: 15.7, epsGrowth: 9.5, peg: 1.58 },
      { year: currentYear.toString(), grossProfitMargin: 24.2, netProfitMargin: 16.1, epsGrowth: 7.5, peg: 1.65 }
    ];
  };

  const generateSamplePayouts = () => {
    return [
      { date: "2024-03-15", financialResults: "Interim Results for period ended March 31, 2024", details: "Cash Dividend Rs. 2.50 per share", bookClosure: "April 20-25, 2024" },
      { date: "2023-12-20", financialResults: "Annual Results for year ended December 31, 2023", details: "Final Cash Dividend Rs. 3.00 per share", bookClosure: "January 15-20, 2024" },
      { date: "2023-09-15", financialResults: "Interim Results for period ended September 30, 2023", details: "Interim Cash Dividend Rs. 2.00 per share", bookClosure: "October 25-30, 2023" },
      { date: "2023-06-15", financialResults: "Interim Results for period ended June 30, 2023", details: "Interim Cash Dividend Rs. 1.75 per share", bookClosure: "July 20-25, 2023" }
    ];
  };

  const generateSampleAnnouncements = () => {
    return {
      "Financial Results": [
        { date: "2024-11-15", title: "Quarterly Results for period ended September 30, 2024", document: "QR-Q3-2024.pdf" },
        { date: "2024-08-14", title: "Half Yearly Results for period ended June 30, 2024", document: "HY-2024.pdf" },
        { date: "2024-05-15", title: "Quarterly Results for period ended March 31, 2024", document: "QR-Q1-2024.pdf" },
        { date: "2024-02-28", title: "Annual Results for year ended December 31, 2023", document: "AR-2023.pdf" }
      ],
      "General": [
        { date: "2024-10-22", title: "Notice of Board Meeting", document: "BM-Notice-Oct2024.pdf" },
        { date: "2024-09-18", title: "Change in Shareholding", document: "CS-Sept2024.pdf" },
        { date: "2024-08-05", title: "Acquisition of Business", document: "AB-Aug2024.pdf" }
      ],
      "Corporate": [
        { date: "2024-07-12", title: "Right Issue of Ordinary Shares", document: "RI-July2024.pdf" },
        { date: "2024-04-20", title: "Bonus Issue Announcement", document: "BI-Apr2024.pdf" }
      ]
    };
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
    className = "",
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
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Get sample data for demonstration
  const sampleFinancials = companyData?.financialData || generateSampleFinancials();
  const sampleRatios = companyData?.ratiosData || generateSampleRatios();
  const samplePayouts = companyData?.payoutsData || generateSamplePayouts();
  const sampleAnnouncements = companyData?.announcements || generateSampleAnnouncements();

  const tabs = [
    { id: "profile", label: "Company Profile", icon: Building2 },
    { id: "equity", label: "Equity Profile", icon: PieChart },
    { id: "announcements", label: "Announcements", icon: FileText },
    { id: "financials", label: "Financials", icon: BarChart3 },
    { id: "ratios", label: "Ratios", icon: Target },
    { id: "payouts", label: "Payouts", icon: DollarSign }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Green Header Bar */}
      <div className="bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center space-x-6">
              <Link
                href="/"
                className="flex items-center px-3 py-1 text-white hover:text-green-100 transition-colors rounded-lg hover:bg-green-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                PSX
              </Link>
              {/* Navigation Menu */}
              <nav className="hidden md:flex space-x-6 text-sm">
                <a href="#" className="hover:text-green-100">TELE</a>
                <a href="#" className="hover:text-green-100">QUOTE</a>
                <a href="#" className="hover:text-green-100">PROFILE</a>
                <a href="#" className="hover:text-green-100">EQUITY</a>
                <a href="#" className="hover:text-green-100">ANNOUNCEMENTS</a>
                <a href="#" className="hover:text-green-100">FINANCIALS</a>
                <a href="#" className="hover:text-green-100">RATIOS</a>
                <a href="#" className="hover:text-green-100">PAYOUTS</a>
                <a href="#" className="hover:text-green-100">REPORTS</a>
              </nav>
            </div>
            <div className="text-sm">
              <span className="text-green-100">PSX</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{stockData.symbol}</h1>
                <span className="text-lg text-gray-600">{stockData.name}</span>
              </div>
              <p className="text-gray-500">{stockData.sector}</p>
            </div>
            
            <div className="mt-4 lg:mt-0 text-right">
              <div className="text-4xl font-bold text-gray-900 mb-1">
                {formatPrice(stockData.current)}
              </div>
              <div className={`flex items-center justify-end space-x-2 ${
                stockData.isPositive ? "text-green-600" : "text-red-600"
              }`}>
                {stockData.isPositive ? (
                  <TrendingUp className="w-5 h-5" />
                ) : (
                  <TrendingDown className="w-5 h-5" />
                )}
                <span className="text-lg font-semibold">
                  {formatChange(stockData.change, stockData.changePercent)}
                </span>
              </div>
            </div>
          </div>

          {/* Price Summary Grid */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 uppercase tracking-wide">BID</p>
              <p className="text-lg font-semibold">{formatPrice(stockData.current - 0.5)}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 uppercase tracking-wide">ASK</p>
              <p className="text-lg font-semibold">{formatPrice(stockData.current + 0.5)}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 uppercase tracking-wide">OPEN</p>
              <p className="text-lg font-semibold">{formatPrice(stockData.open)}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 uppercase tracking-wide">HIGH</p>
              <p className="text-lg font-semibold text-green-600">{formatPrice(stockData.high)}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 uppercase tracking-wide">LOW</p>
              <p className="text-lg font-semibold text-red-600">{formatPrice(stockData.low)}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 uppercase tracking-wide">VOLUME</p>
              <p className="text-lg font-semibold">{formatVolume(stockData.volume)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-green-600 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Company Profile Tab */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Company Profile
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Company Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Company Description</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {companyData?.description || 
                       `${stockData.name} is a leading company in the ${stockData.sector} sector, providing innovative solutions and services to customers across Pakistan. The company has established itself as a key player in the market with strong fundamentals and growth prospects.`}
                    </p>
                  </div>
                  
                  {companyData?.website && (
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <a href={companyData.website} target="_blank" rel="noopener noreferrer" 
                         className="text-green-600 hover:underline">
                        {companyData.website}
                      </a>
                    </div>
                  )}
                  
                  {companyData?.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{companyData.phone}</span>
                    </div>
                  )}
                  
                  {companyData?.address && (
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <span className="text-gray-600 text-sm">{companyData.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Key People */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key People</h3>
                <div className="space-y-3">
                  {companyData?.ceo && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{companyData.ceo}</p>
                          <p className="text-sm text-gray-500">Chief Executive Officer</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {companyData?.keyPeople?.map((person, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{person.name}</p>
                          <p className="text-sm text-gray-500">{person.role}</p>
                        </div>
                      </div>
                    </div>
                  )) || (
                    // Sample key people if none provided
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <User className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">Management Team</p>
                            <p className="text-sm text-gray-500">Executive Leadership</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Company Details */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Details</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Sector</span>
                      <span className="font-medium">{stockData.sector}</span>
                    </div>
                    {companyData?.registrar && (
                      <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Registrar</span>
                        <span className="font-medium">{companyData.registrar}</span>
                      </div>
                    )}
                    {companyData?.auditor && (
                      <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Auditor</span>
                        <span className="font-medium">{companyData.auditor}</span>
                      </div>
                    )}
                    {companyData?.fiscalYearEnd && (
                      <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Fiscal Year End</span>
                        <span className="font-medium">{companyData.fiscalYearEnd}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Equity Profile Tab */}
        {activeTab === "equity" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              Equity Profile
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Market Cap</p>
                <p className="text-2xl font-bold text-green-600">
                  {companyData?.marketCap ? formatMarketCap(companyData.marketCap) : "Rs. 2,441,292.50"}
                </p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Shares Outstanding</p>
                <p className="text-2xl font-bold text-blue-600">
                  {companyData?.sharesOutstanding ? formatNumber(companyData.sharesOutstanding) : "194,435,600"}
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Free Float</p>
                <p className="text-2xl font-bold text-purple-600">
                  {companyData?.freeFloat ? formatPercentage(companyData.freeFloat) : "25.99%"}
                </p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">P/E Ratio</p>
                <p className="text-2xl font-bold text-orange-600">
                  {companyData?.peRatio ? formatRatio(companyData.peRatio) : "16.27%"}
                </p>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Book Value</p>
                <p className="text-lg font-semibold">
                  {companyData?.bookValue ? formatPrice(companyData.bookValue) : "Rs. 45.23"}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Face Value</p>
                <p className="text-lg font-semibold">
                  {companyData?.faceValue ? formatPrice(companyData.faceValue) : "Rs. 10.00"}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Lot Size</p>
                <p className="text-lg font-semibold">
                  {companyData?.lotSize ? companyData.lotSize.toLocaleString() : "500"}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">EPS</p>
                <p className="text-lg font-semibold">
                  {companyData?.epsRatio ? formatPrice(companyData.epsRatio) : "Rs. 7.85"}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Dividend Yield</p>
                <p className="text-lg font-semibold">
                  {companyData?.dividendYield ? formatPercentage(companyData.dividendYield) : "4.50%"}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">52W High/Low</p>
                <p className="text-lg font-semibold">
                  {formatPrice(stockData.high)} / {formatPrice(stockData.low)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === "announcements" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Announcements
            </h2>

            {/* Announcement Categories */}
            <div className="mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                  {Object.keys(sampleAnnouncements).map((category) => (
                    <button
                      key={category}
                      onClick={() => setActiveAnnouncementTab(category)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeAnnouncementTab === category
                          ? "border-green-600 text-green-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Announcements List */}
            {activeAnnouncementTab && sampleAnnouncements[activeAnnouncementTab] && (
              <div className="space-y-4">
                {sampleAnnouncements[activeAnnouncementTab].map((announcement, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-sm text-gray-500">{announcement.date}</span>
                        <span className="text-sm font-medium text-gray-900">{announcement.title}</span>
                      </div>
                      <p className="text-sm text-gray-600">{announcement.document}</p>
                    </div>
                    <button className="flex items-center space-x-1 text-green-600 hover:text-green-700">
                      <Download className="w-4 h-4" />
                      <span className="text-sm">Download</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Financials Tab */}
        {activeTab === "financials" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Financials
            </h2>

            {/* Annual Financials */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Annual Financials</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">Year</th>
                      <th className="border border-gray-300 px-4 py-2 text-right font-medium text-gray-900">Sales</th>
                      <th className="border border-gray-300 px-4 py-2 text-right font-medium text-gray-900">Profit after Taxation</th>
                      <th className="border border-gray-300 px-4 py-2 text-right font-medium text-gray-900">EPS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleFinancials.annual?.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2 font-medium">{item.label}</td>
                        <td className="border border-gray-300 px-4 py-2 text-right">
                          {item.sales ? `Rs. ${formatNumber(item.sales)}` : "-"}
                        </td>
                        <td className={`border border-gray-300 px-4 py-2 text-right ${
                          (item.profitAfterTax ?? 0) < 0 ? "text-red-600" : ""
                        }`}>
                          {item.profitAfterTax ? `Rs. ${formatNumber(item.profitAfterTax)}` : "-"}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right">
                          {item.eps ? `Rs. ${item.eps.toFixed(2)}` : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quarterly Financials */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quarterly Financials</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">Quarter</th>
                      <th className="border border-gray-300 px-4 py-2 text-right font-medium text-gray-900">Sales</th>
                      <th className="border border-gray-300 px-4 py-2 text-right font-medium text-gray-900">Profit after Taxation</th>
                      <th className="border border-gray-300 px-4 py-2 text-right font-medium text-gray-900">EPS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleFinancials.quarterly?.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2 font-medium">{item.label}</td>
                        <td className="border border-gray-300 px-4 py-2 text-right">
                          {item.sales ? `Rs. ${formatNumber(item.sales)}` : "-"}
                        </td>
                        <td className={`border border-gray-300 px-4 py-2 text-right ${
                          (item.profitAfterTax ?? 0) < 0 ? "text-red-600" : ""
                        }`}>
                          {item.profitAfterTax ? `Rs. ${formatNumber(item.profitAfterTax)}` : "-"}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right">
                          {item.eps ? `Rs. ${item.eps.toFixed(2)}` : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Ratios Tab */}
        {activeTab === "ratios" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Ratios
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">Year</th>
                    <th className="border border-gray-300 px-4 py-2 text-right font-medium text-gray-900">Gross Profit Margin (%)</th>
                    <th className="border border-gray-300 px-4 py-2 text-right font-medium text-gray-900">Net Profit Margin (%)</th>
                    <th className="border border-gray-300 px-4 py-2 text-right font-medium text-gray-900">EPS Growth (%)</th>
                    <th className="border border-gray-300 px-4 py-2 text-right font-medium text-gray-900">PEG Ratio</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleRatios.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 font-medium">{item.year}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">
                        {item.grossProfitMargin?.toFixed(1) || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right">
                        {item.netProfitMargin?.toFixed(1) || "-"}
                      </td>
                      <td className={`border border-gray-300 px-4 py-2 text-right ${
                        (item.epsGrowth ?? 0) < 0 ? "text-red-600" : "text-green-600"
                      }`}>
                        {item.epsGrowth?.toFixed(1) || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right">
                        {item.peg?.toFixed(2) || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Payouts Tab */}
        {activeTab === "payouts" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Payouts
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">Date</th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">Financial Results</th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">Details</th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">Book Closure</th>
                  </tr>
                </thead>
                <tbody>
                  {getPaginatedData(samplePayouts, payoutsPage).map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">{item.date}</td>
                      <td className="border border-gray-300 px-4 py-2">{item.financialResults}</td>
                      <td className="border border-gray-300 px-4 py-2 font-medium text-green-600">{item.details}</td>
                      <td className="border border-gray-300 px-4 py-2">{item.bookClosure}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <PaginationControls
              currentPage={payoutsPage}
              totalPages={getTotalPages(samplePayouts.length)}
              onPageChange={setPayoutsPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}