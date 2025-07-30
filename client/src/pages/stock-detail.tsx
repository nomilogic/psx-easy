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
  Hash,
} from "lucide-react";
import { useState, useEffect } from "react";

import type { StockData, CompanyData } from "@shared/schema";

export default function StockDetail() {
  const { symbol } = useParams<{ symbol: string }>();
  const [activeTab, setActiveTab] = useState<string>("profile");
  const [activeAnnouncementTab, setActiveAnnouncementTab] = useState<string>("");
  const [announcementPage, setAnnouncementPage] = useState<{ [key: string]: number }>({});
  const [payoutsPage, setPayoutsPage] = useState(1);
  const [scrollY, setScrollY] = useState(0);

  // Parallax effect
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    setActiveTab(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: "smooth", 
        block: "start",
        inline: "nearest" 
      });
    }
  };

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
    { id: "profile", label: "Company Profile", icon: Building2, color: "from-blue-500 to-blue-600" },
    { id: "equity", label: "Equity Profile", icon: PieChart, color: "from-purple-500 to-purple-600" },
    { id: "announcements", label: "Announcements", icon: FileText, color: "from-orange-500 to-orange-600" },
    { id: "financials", label: "Financials", icon: BarChart3, color: "from-green-500 to-green-600" },
    { id: "ratios", label: "Ratios", icon: Target, color: "from-red-500 to-red-600" },
    { id: "payouts", label: "Payouts", icon: DollarSign, color: "from-indigo-500 to-indigo-600" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Enhanced Header with Parallax */}
      <div 
        className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white shadow-xl relative overflow-hidden"
        style={{
          transform: `translateY(${scrollY * 0.5}px)`,
        }}
      >
        {/* Header Background Pattern */}
        <div className="absolute inset-0 bg-black bg-opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 0%, transparent 50%)`
          }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link
                href="/"
                className="flex items-center px-4 py-2 text-white hover:text-green-100 transition-all duration-300 rounded-lg hover:bg-white hover:bg-opacity-10 backdrop-blur-sm"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span className="font-semibold">PSX Dashboard</span>
              </Link>
              
              {/* Enhanced Navigation Menu */}
              <nav className="hidden lg:flex space-x-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => scrollToSection(tab.id)}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white hover:text-green-100 transition-all duration-300 rounded-lg hover:bg-white hover:bg-opacity-10 backdrop-blur-sm"
                  >
                    <Hash className="w-3 h-3" />
                    <span>{tab.label.toUpperCase()}</span>
                  </button>
                ))}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-emerald-100 font-medium">Pakistan Stock Exchange</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stock Header Section */}
      <div className="bg-white shadow-lg border-b border-gray-200 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-white to-purple-50 opacity-50"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div className="space-y-2">
              <div className="flex items-center space-x-4 mb-3">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {stockData.symbol}
                </h1>
                <div className="h-8 w-px bg-gray-300"></div>
                <span className="text-xl text-gray-600 font-medium">{stockData.name}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {stockData.sector}
                </span>
                <span className="text-sm text-gray-500">Pakistan Stock Exchange</span>
              </div>
            </div>
            
            <div className="mt-6 lg:mt-0 text-right">
              <div className="text-5xl font-bold text-gray-900 mb-2 font-mono">
                {formatPrice(stockData.current)}
              </div>
              <div className={`flex items-center justify-end space-x-3 ${
                stockData.isPositive ? "text-emerald-600" : "text-red-600"
              }`}>
                <div className={`p-2 rounded-full ${
                  stockData.isPositive ? "bg-emerald-100" : "bg-red-100"
                }`}>
                  {stockData.isPositive ? (
                    <TrendingUp className="w-6 h-6" />
                  ) : (
                    <TrendingDown className="w-6 h-6" />
                  )}
                </div>
                <span className="text-xl font-semibold font-mono">
                  {formatChange(stockData.change, stockData.changePercent)}
                </span>
              </div>
            </div>
          </div>

          {/* Enhanced Price Summary Grid */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {[
              { label: "BID", value: formatPrice(stockData.current - 0.5), color: "from-blue-500 to-blue-600" },
              { label: "ASK", value: formatPrice(stockData.current + 0.5), color: "from-purple-500 to-purple-600" },
              { label: "OPEN", value: formatPrice(stockData.open), color: "from-gray-500 to-gray-600" },
              { label: "HIGH", value: formatPrice(stockData.high), color: "from-emerald-500 to-emerald-600" },
              { label: "LOW", value: formatPrice(stockData.low), color: "from-red-500 to-red-600" },
              { label: "VOLUME", value: formatVolume(stockData.volume), color: "from-orange-500 to-orange-600" },
            ].map((item, index) => (
              <div key={index} className="relative group">
                <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl`}></div>
                <div className="relative bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 text-center">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{item.label}</p>
                  <p className={`text-lg font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Sticky Tabs Navigation */}
      <div className="sticky top-0 z-40 bg-white shadow-lg border-b border-gray-200 backdrop-blur-sm bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-2 overflow-x-auto py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => scrollToSection(tab.id)}
                className={`flex items-center space-x-3 py-3 px-6 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-300 group relative overflow-hidden ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-lg transform scale-105`
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {activeTab === tab.id && (
                  <div className="absolute inset-0 bg-white bg-opacity-20 animate-pulse"></div>
                )}
                <tab.icon className={`w-5 h-5 transition-transform duration-300 ${
                  activeTab === tab.id ? "scale-110" : "group-hover:scale-105"
                }`} />
                <span className="font-semibold">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Enhanced Tab Content with Smooth Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Company Profile Section */}
        <section id="profile" className="scroll-mt-24">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Section Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
              <h2 className="text-2xl font-bold flex items-center">
                <Building2 className="w-6 h-6 mr-3" />
                Company Profile
              </h2>
              <p className="text-blue-100 mt-2">Comprehensive company information and business details</p>
            </div>
            
            <div className="p-8">
            
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Company Description */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                      About the Company
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {companyData?.description || 
                       `${stockData.name} is a leading company in the ${stockData.sector} sector, providing innovative solutions and services to customers across Pakistan. The company has established itself as a key player in the market with strong fundamentals and growth prospects.`}
                    </p>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {companyData?.website && (
                      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Globe className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Website</p>
                            <a href={companyData.website} target="_blank" rel="noopener noreferrer" 
                               className="text-blue-600 hover:text-blue-700 font-medium">
                              {companyData.website}
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {companyData?.phone && (
                      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Phone className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="text-gray-900 font-medium">{companyData.phone}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {companyData?.address && (
                      <div className="md:col-span-2 bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-red-100 rounded-lg">
                            <MapPin className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Address</p>
                            <p className="text-gray-900 font-medium">{companyData.address}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Key People & Company Details */}
                <div className="space-y-6">
                  {/* Key People */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center">
                        <Users className="w-5 h-5 mr-2 text-purple-600" />
                        Key People
                      </h3>
                    </div>
                    <div className="p-6 space-y-4">
                      {companyData?.ceo && (
                        <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                          <div className="p-2 bg-purple-100 rounded-full">
                            <User className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{companyData.ceo}</p>
                            <p className="text-sm text-purple-600">Chief Executive Officer</p>
                          </div>
                        </div>
                      )}
                      
                      {companyData?.keyPeople?.map((person, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="p-2 bg-gray-100 rounded-full">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{person.name}</p>
                            <p className="text-sm text-gray-600">{person.role}</p>
                          </div>
                        </div>
                      )) || (
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="p-2 bg-gray-100 rounded-full">
                            <Briefcase className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">Management Team</p>
                            <p className="text-sm text-gray-600">Executive Leadership</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Company Details */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-orange-600" />
                        Company Details
                      </h3>
                    </div>
                    <div className="p-6 space-y-3">
                      <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                        <span className="text-gray-700 font-medium">Sector</span>
                        <span className="font-bold text-orange-600">{stockData.sector}</span>
                      </div>
                      {companyData?.registrar && (
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700 font-medium">Registrar</span>
                          <span className="font-semibold text-gray-900">{companyData.registrar}</span>
                        </div>
                      )}
                      {companyData?.auditor && (
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700 font-medium">Auditor</span>
                          <span className="font-semibold text-gray-900">{companyData.auditor}</span>
                        </div>
                      )}
                      {companyData?.fiscalYearEnd && (
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700 font-medium">Fiscal Year End</span>
                          <span className="font-semibold text-gray-900">{companyData.fiscalYearEnd}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Equity Profile Section */}
        <section id="equity" className="scroll-mt-24">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6">
              <h2 className="text-2xl font-bold flex items-center">
                <PieChart className="w-6 h-6 mr-3" />
                Equity Profile
              </h2>
              <p className="text-purple-100 mt-2">Market capitalization and equity structure analysis</p>
            </div>
            
            <div className="p-8">
            
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {[
                  { 
                    label: "Market Cap", 
                    value: companyData?.marketCap ? formatMarketCap(companyData.marketCap) : "Rs. 2,441,292.50",
                    color: "from-emerald-500 to-emerald-600",
                    bg: "bg-emerald-50"
                  },
                  { 
                    label: "Shares Outstanding", 
                    value: companyData?.sharesOutstanding ? formatNumber(companyData.sharesOutstanding) : "194,435,600",
                    color: "from-blue-500 to-blue-600",
                    bg: "bg-blue-50"
                  },
                  { 
                    label: "Free Float", 
                    value: companyData?.freeFloat ? formatPercentage(companyData.freeFloat) : "25.99%",
                    color: "from-purple-500 to-purple-600",
                    bg: "bg-purple-50"
                  },
                  { 
                    label: "P/E Ratio", 
                    value: companyData?.peRatio ? formatRatio(companyData.peRatio) : "16.27",
                    color: "from-orange-500 to-orange-600",
                    bg: "bg-orange-50"
                  }
                ].map((metric, index) => (
                  <div key={index} className="relative group">
                    <div className={`absolute inset-0 bg-gradient-to-r ${metric.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl`}></div>
                    <div className={`relative ${metric.bg} p-6 rounded-2xl border-2 border-white shadow-lg hover:shadow-xl transition-all duration-300 text-center group-hover:transform group-hover:scale-105`}>
                      <p className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">{metric.label}</p>
                      <p className={`text-3xl font-bold bg-gradient-to-r ${metric.color} bg-clip-text text-transparent`}>
                        {metric.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Additional Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { label: "Book Value", value: companyData?.bookValue ? formatPrice(companyData.bookValue) : "Rs. 45.23", icon: "📊" },
                  { label: "Face Value", value: companyData?.faceValue ? formatPrice(companyData.faceValue) : "Rs. 10.00", icon: "💰" },
                  { label: "Lot Size", value: companyData?.lotSize ? companyData.lotSize.toLocaleString() : "500", icon: "📦" },
                  { label: "EPS", value: companyData?.epsRatio ? formatPrice(companyData.epsRatio) : "Rs. 7.85", icon: "💎" },
                  { label: "Dividend Yield", value: companyData?.dividendYield ? formatPercentage(companyData.dividendYield) : "4.50%", icon: "🎯" },
                  { label: "52W Range", value: `${formatPrice(stockData.high)} / ${formatPrice(stockData.low)}`, icon: "📈" }
                ].map((metric, index) => (
                  <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">{metric.label}</p>
                      <span className="text-lg">{metric.icon}</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                      {metric.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Announcements Section */}
        <section id="announcements" className="scroll-mt-24">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6">
              <h2 className="text-2xl font-bold flex items-center">
                <FileText className="w-6 h-6 mr-3" />
                Announcements
              </h2>
              <p className="text-orange-100 mt-2">Latest company announcements and regulatory filings</p>
            </div>
            
            <div className="p-8">

              {/* Enhanced Announcement Categories */}
              <div className="mb-8">
                <nav className="flex flex-wrap gap-2">
                  {Object.keys(sampleAnnouncements).map((category) => (
                    <button
                      key={category}
                      onClick={() => setActiveAnnouncementTab(category)}
                      className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                        activeAnnouncementTab === category
                          ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg transform scale-105"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-orange-600"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Enhanced Announcements List */}
              {activeAnnouncementTab && sampleAnnouncements[activeAnnouncementTab] && (
                <div className="space-y-4">
                  {sampleAnnouncements[activeAnnouncementTab].map((announcement, index) => (
                    <div key={index} className="bg-gradient-to-r from-white to-orange-50 border border-orange-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 group">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-3">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
                              {announcement.date}
                            </span>
                            <span className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                              {announcement.title}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <p className="text-sm text-gray-600 font-medium">{announcement.document}</p>
                          </div>
                        </div>
                        <button className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-sm hover:shadow-md">
                          <Download className="w-4 h-4" />
                          <span className="text-sm font-semibold">Download</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Financials Section */}
        <section id="financials" className="scroll-mt-24">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6">
              <h2 className="text-2xl font-bold flex items-center">
                <BarChart3 className="w-6 h-6 mr-3" />
                Financials
              </h2>
              <p className="text-green-100 mt-2">Annual and quarterly financial performance data</p>
            </div>
            
            <div className="p-8">

              {/* Annual Financials */}
              <div className="mb-10">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-green-600" />
                  Annual Financials
                </h3>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl overflow-hidden border border-green-200">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                          <th className="px-6 py-4 text-left font-bold">Year</th>
                          <th className="px-6 py-4 text-right font-bold">Sales</th>
                          <th className="px-6 py-4 text-right font-bold">Profit after Taxation</th>
                          <th className="px-6 py-4 text-right font-bold">EPS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sampleFinancials.annual?.map((item, index) => (
                          <tr key={index} className="hover:bg-green-100 transition-colors border-b border-green-200">
                            <td className="px-6 py-4 font-bold text-gray-900">{item.label}</td>
                            <td className="px-6 py-4 text-right font-semibold text-gray-700">
                              {item.sales ? `Rs. ${formatNumber(item.sales)}` : "-"}
                            </td>
                            <td className={`px-6 py-4 text-right font-semibold ${
                              (item.profitAfterTax ?? 0) < 0 ? "text-red-600" : "text-gray-700"
                            }`}>
                              {item.profitAfterTax ? `Rs. ${formatNumber(item.profitAfterTax)}` : "-"}
                            </td>
                            <td className="px-6 py-4 text-right font-semibold text-gray-700">
                              {item.eps ? `Rs. ${item.eps.toFixed(2)}` : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Quarterly Financials */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-blue-600" />
                  Quarterly Financials
                </h3>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl overflow-hidden border border-blue-200">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                          <th className="px-6 py-4 text-left font-bold">Quarter</th>
                          <th className="px-6 py-4 text-right font-bold">Sales</th>
                          <th className="px-6 py-4 text-right font-bold">Profit after Taxation</th>
                          <th className="px-6 py-4 text-right font-bold">EPS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sampleFinancials.quarterly?.map((item, index) => (
                          <tr key={index} className="hover:bg-blue-100 transition-colors border-b border-blue-200">
                            <td className="px-6 py-4 font-bold text-gray-900">{item.label}</td>
                            <td className="px-6 py-4 text-right font-semibold text-gray-700">
                              {item.sales ? `Rs. ${formatNumber(item.sales)}` : "-"}
                            </td>
                            <td className={`px-6 py-4 text-right font-semibold ${
                              (item.profitAfterTax ?? 0) < 0 ? "text-red-600" : "text-gray-700"
                            }`}>
                              {item.profitAfterTax ? `Rs. ${formatNumber(item.profitAfterTax)}` : "-"}
                            </td>
                            <td className="px-6 py-4 text-right font-semibold text-gray-700">
                              {item.eps ? `Rs. ${item.eps.toFixed(2)}` : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ratios Section */}
        <section id="ratios" className="scroll-mt-24">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6">
              <h2 className="text-2xl font-bold flex items-center">
                <Target className="w-6 h-6 mr-3" />
                Financial Ratios
              </h2>
              <p className="text-red-100 mt-2">Key financial ratios and performance metrics</p>
            </div>
            
            <div className="p-8">
              <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl overflow-hidden border border-red-200">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                        <th className="px-6 py-4 text-left font-bold">Year</th>
                        <th className="px-6 py-4 text-right font-bold">Gross Profit Margin (%)</th>
                        <th className="px-6 py-4 text-right font-bold">Net Profit Margin (%)</th>
                        <th className="px-6 py-4 text-right font-bold">EPS Growth (%)</th>
                        <th className="px-6 py-4 text-right font-bold">PEG Ratio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sampleRatios.map((item, index) => (
                        <tr key={index} className="hover:bg-red-100 transition-colors border-b border-red-200">
                          <td className="px-6 py-4 font-bold text-gray-900">{item.year}</td>
                          <td className="px-6 py-4 text-right font-semibold text-gray-700">
                            {item.grossProfitMargin?.toFixed(1) || "-"}%
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-gray-700">
                            {item.netProfitMargin?.toFixed(1) || "-"}%
                          </td>
                          <td className={`px-6 py-4 text-right font-semibold ${
                            (item.epsGrowth ?? 0) < 0 ? "text-red-600" : "text-emerald-600"
                          }`}>
                            {item.epsGrowth?.toFixed(1) || "-"}%
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-gray-700">
                            {item.peg?.toFixed(2) || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Payouts Section */}
        <section id="payouts" className="scroll-mt-24">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-6">
              <h2 className="text-2xl font-bold flex items-center">
                <DollarSign className="w-6 h-6 mr-3" />
                Payouts & Dividends
              </h2>
              <p className="text-indigo-100 mt-2">Dividend history and shareholder payouts</p>
            </div>
            
            <div className="p-8">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl overflow-hidden border border-indigo-200">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
                        <th className="px-6 py-4 text-left font-bold">Date</th>
                        <th className="px-6 py-4 text-left font-bold">Financial Results</th>
                        <th className="px-6 py-4 text-left font-bold">Details</th>
                        <th className="px-6 py-4 text-left font-bold">Book Closure</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getPaginatedData(samplePayouts, payoutsPage).map((item, index) => (
                        <tr key={index} className="hover:bg-indigo-100 transition-colors border-b border-indigo-200">
                          <td className="px-6 py-4 font-bold text-gray-900">{item.date}</td>
                          <td className="px-6 py-4 text-gray-700">{item.financialResults}</td>
                          <td className="px-6 py-4 font-bold text-indigo-600">{item.details}</td>
                          <td className="px-6 py-4 text-gray-700">{item.bookClosure}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <PaginationControls
                currentPage={payoutsPage}
                totalPages={getTotalPages(samplePayouts.length)}
                onPageChange={setPayoutsPage}
                className="mt-8"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}