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
import LiveStockTicker from "@/components/live-stock-ticker";

export default function StockDetail() {
  const { symbol } = useParams<{ symbol: string }>();
  const [activeTab, setActiveTab] = useState<string>("profile");
  const [activeAnnouncementTab, setActiveAnnouncementTab] =
    useState<string>("");
  const [announcementPage, setAnnouncementPage] = useState<{
    [key: string]: number;
  }>({});
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
        inline: "nearest",
      });
    }
  };

  const ITEMS_PER_PAGE = 10;

  const { data: stock, isLoading: stockLoading } = useQuery({
    queryKey: ["/api/stock", symbol],
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
        {
          label: (currentYear - 3).toString(),
          sales: 2400000000,
          profitAfterTax: 360000000,
          eps: 15.75,
        },
        {
          label: (currentYear - 2).toString(),
          sales: 2650000000,
          profitAfterTax: 398000000,
          eps: 17.42,
        },
        {
          label: (currentYear - 1).toString(),
          sales: 2890000000,
          profitAfterTax: 435000000,
          eps: 19.08,
        },
        {
          label: currentYear.toString(),
          sales: 3120000000,
          profitAfterTax: 468000000,
          eps: 20.52,
        },
      ],
      quarterly: [
        {
          label: "Q1 2024",
          sales: 780000000,
          profitAfterTax: 117000000,
          eps: 5.13,
        },
        {
          label: "Q2 2024",
          sales: 820000000,
          profitAfterTax: 123000000,
          eps: 5.39,
        },
        {
          label: "Q3 2024",
          sales: 760000000,
          profitAfterTax: 114000000,
          eps: 4.99,
        },
        {
          label: "Q4 2024",
          sales: 760000000,
          profitAfterTax: 114000000,
          eps: 4.99,
        },
      ],
    };
  };

  const generateSampleRatios = () => {
    const currentYear = new Date().getFullYear();
    return [
      {
        year: (currentYear - 3).toString(),
        grossProfitMargin: 22.5,
        netProfitMargin: 15.0,
        epsGrowth: 8.2,
        peg: 1.85,
      },
      {
        year: (currentYear - 2).toString(),
        grossProfitMargin: 23.1,
        netProfitMargin: 15.3,
        epsGrowth: 10.6,
        peg: 1.72,
      },
      {
        year: (currentYear - 1).toString(),
        grossProfitMargin: 23.8,
        netProfitMargin: 15.7,
        epsGrowth: 9.5,
        peg: 1.58,
      },
      {
        year: currentYear.toString(),
        grossProfitMargin: 24.2,
        netProfitMargin: 16.1,
        epsGrowth: 7.5,
        peg: 1.65,
      },
    ];
  };

  const generateSamplePayouts = () => {
    return [
      {
        date: "2024-03-15",
        financialResults: "Interim Results for period ended March 31, 2024",
        details: "Cash Dividend Rs. 2.50 per share",
        bookClosure: "April 20-25, 2024",
      },
      {
        date: "2023-12-20",
        financialResults: "Annual Results for year ended December 31, 2023",
        details: "Final Cash Dividend Rs. 3.00 per share",
        bookClosure: "January 15-20, 2024",
      },
      {
        date: "2023-09-15",
        financialResults: "Interim Results for period ended September 30, 2023",
        details: "Interim Cash Dividend Rs. 2.00 per share",
        bookClosure: "October 25-30, 2023",
      },
      {
        date: "2023-06-15",
        financialResults: "Interim Results for period ended June 30, 2023",
        details: "Interim Cash Dividend Rs. 1.75 per share",
        bookClosure: "July 20-25, 2023",
      },
    ];
  };

  const generateSampleAnnouncements = () => {
    return {
      "Financial Results": [
        {
          date: "2024-11-15",
          title: "Quarterly Results for period ended September 30, 2024",
          document: "QR-Q3-2024.pdf",
        },
        {
          date: "2024-08-14",
          title: "Half Yearly Results for period ended June 30, 2024",
          document: "HY-2024.pdf",
        },
        {
          date: "2024-05-15",
          title: "Quarterly Results for period ended March 31, 2024",
          document: "QR-Q1-2024.pdf",
        },
        {
          date: "2024-02-28",
          title: "Annual Results for year ended December 31, 2023",
          document: "AR-2023.pdf",
        },
      ],
      General: [
        {
          date: "2024-10-22",
          title: "Notice of Board Meeting",
          document: "BM-Notice-Oct2024.pdf",
        },
        {
          date: "2024-09-18",
          title: "Change in Shareholding",
          document: "CS-Sept2024.pdf",
        },
        {
          date: "2024-08-05",
          title: "Acquisition of Business",
          document: "AB-Aug2024.pdf",
        },
      ],
      Corporate: [
        {
          date: "2024-07-12",
          title: "Right Issue of Ordinary Shares",
          document: "RI-July2024.pdf",
        },
        {
          date: "2024-04-20",
          title: "Bonus Issue Announcement",
          document: "BI-Apr2024.pdf",
        },
      ],
    };
  };

  // Pagination helper functions
  const getPaginatedData = <T,>(
    data: T[],
    page: number,
    itemsPerPage: number = ITEMS_PER_PAGE,
  ): T[] => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = (
    totalItems: number,
    itemsPerPage: number = ITEMS_PER_PAGE,
  ): number => {
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
      <div
        className={`flex items-center justify-center space-x-2 mt-4 ${className}`}
      >
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
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            Stock Not Found
          </h1>
          <p className="text-slate-600 mb-6">
            The stock symbol "{symbol}" was not found.
          </p>
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
  const sampleFinancials =
    companyData?.financialData || generateSampleFinancials();
  const sampleRatios = companyData?.ratiosData || generateSampleRatios();
  const samplePayouts = companyData?.payoutsData || generateSamplePayouts();
  const sampleAnnouncements =
    companyData?.announcements || generateSampleAnnouncements();

  const tabs = [
    {
      id: "profile",
      label: "Company Profile",
      icon: Building2,
      color: "from-green-600 to-green-700",
    },
    {
      id: "equity",
      label: "Equity Profile",
      icon: PieChart,
      color: "from-blue-600 to-blue-700",
    },
    {
      id: "announcements",
      label: "Announcements",
      icon: FileText,
      color: "from-green-600 to-green-700",
    },
    {
      id: "financials",
      label: "Financials",
      icon: BarChart3,
      color: "from-blue-600 to-blue-700",
    },
    {
      id: "ratios",
      label: "Ratios",
      icon: Target,
      color: "from-green-600 to-green-700",
    },
    {
      id: "payouts",
      label: "Payouts",
      icon: DollarSign,
      color: "from-blue-600 to-blue-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Stock Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {stockData.symbol}
                </h1>
                <span className="text-lg text-gray-600">{stockData.name}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                  {stockData.sector}
                </span>
              </div>
            </div>

            <div className="mt-3 lg:mt-0 text-right">
              <div className="text-3xl font-bold text-gray-900 mb-1 font-mono">
                {formatPrice(stockData.current)}
              </div>
              <div
                className={`flex items-center justify-end space-x-2 ${
                  stockData.isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {stockData.isPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="text-sm font-semibold font-mono">
                  {formatChange(stockData.change, stockData.changePercent)}
                </span>
              </div>
            </div>
          </div>

          {/* Compact Price Summary Grid */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            {[
              { label: "BID", value: formatPrice(stockData.current - 0.5) },
              { label: "ASK", value: formatPrice(stockData.current + 0.5) },
              { label: "OPEN", value: formatPrice(stockData.open) },
              { label: "HIGH", value: formatPrice(stockData.high) },
              { label: "LOW", value: formatPrice(stockData.low) },
              { label: "VOLUME", value: formatVolume(stockData.volume) },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-gray-50 p-3 rounded-lg text-center"
              >
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                  {item.label}
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compact Sticky Tabs Navigation with Back Button */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center px-3 py-1 text-white hover:text-green-100 transition-colors rounded-md hover:bg-white hover:bg-opacity-10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="font-medium text-sm">PSX Dashboard</span>
              </Link>

              <nav className="flex space-x-1 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => scrollToSection(tab.id)}
                    className={`flex items-center space-x-2 py-2 px-3 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? "bg-white bg-opacity-20 text-white"
                        : "text-white hover:bg-white hover:bg-opacity-10"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
            <div className="text-sm font-medium">Pakistan Stock Exchange</div>
          </div>
        </div>
      </div>

      {/* Compact Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Company Profile Section */}
        <section id="profile" className="scroll-mt-16">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Compact Section Header */}
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4">
              <h2 className="text-lg font-bold flex items-center">
                <Building2 className="w-5 h-5 mr-2" />
                Company Profile
              </h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Company Details - Left Column */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Company Information
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {companyData?.description ||
                        `${stockData.name} is a leading company in the ${stockData.sector} sector, providing innovative solutions and services to customers across Pakistan.`}
                    </p>
                  </div>

                  {/* Company Details */}
                  <div className="space-y-2">
                    <div className="flex justify-between p-2 bg-gray-50 rounded">
                      <span className="text-gray-600 text-sm">Sector</span>
                      <span className="font-medium text-sm">
                        {stockData.sector}
                      </span>
                    </div>
                    {companyData?.registrar && (
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="text-gray-600 text-sm">Registrar</span>
                        <span className="font-medium text-sm">
                          {companyData.registrar}
                        </span>
                      </div>
                    )}
                    {companyData?.auditor && (
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="text-gray-600 text-sm">Auditor</span>
                        <span className="font-medium text-sm">
                          {companyData.auditor}
                        </span>
                      </div>
                    )}
                    {companyData?.fiscalYearEnd && (
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="text-gray-600 text-sm">
                          Fiscal Year End
                        </span>
                        <span className="font-medium text-sm">
                          {companyData.fiscalYearEnd}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact & Key People - Right Column */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Contact Information
                    </h3>
                    <div className="space-y-2">
                      {companyData?.website && (
                        <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                          <Globe className="w-4 h-4 text-blue-600" />
                          <a
                            href={companyData.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            {companyData.website}
                          </a>
                        </div>
                      )}

                      {companyData?.phone && (
                        <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                          <Phone className="w-4 h-4 text-green-600" />
                          <span className="text-gray-900 text-sm">
                            {companyData.phone}
                          </span>
                        </div>
                      )}

                      {companyData?.address && (
                        <div className="flex items-start space-x-2 p-2 bg-gray-50 rounded">
                          <MapPin className="w-4 h-4 text-red-600 mt-0.5" />
                          <span className="text-gray-900 text-sm">
                            {companyData.address}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Key People */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Key People
                    </h3>
                    <div className="space-y-2">
                      {companyData?.ceo && (
                        <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded">
                          <User className="w-4 h-4 text-blue-600" />
                          <div>
                            <p className="font-medium text-sm text-gray-900">
                              {companyData.ceo}
                            </p>
                            <p className="text-xs text-blue-600">CEO</p>
                          </div>
                        </div>
                      )}

                      {companyData?.keyPeople?.map((person, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 p-2 bg-gray-50 rounded"
                        >
                          <User className="w-4 h-4 text-gray-600" />
                          <div>
                            <p className="font-medium text-sm text-gray-900">
                              {person.name}
                            </p>
                            <p className="text-xs text-gray-600">
                              {person.role}
                            </p>
                          </div>
                        </div>
                      )) || (
                        <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                          <Briefcase className="w-4 h-4 text-gray-600" />
                          <div>
                            <p className="font-medium text-sm text-gray-900">
                              Management Team
                            </p>
                            <p className="text-xs text-gray-600">
                              Executive Leadership
                            </p>
                          </div>
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
        <section id="equity" className="scroll-mt-16">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-4">
              <h2 className="text-lg font-bold flex items-center">
                <PieChart className="w-5 h-5 mr-2" />
                Equity Profile
              </h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  {
                    label: "Market Cap",
                    value: companyData?.marketCap
                      ? formatMarketCap(companyData.marketCap)
                      : "Rs. 2,441,292.50",
                  },
                  {
                    label: "Shares Outstanding",
                    value: companyData?.sharesOutstanding
                      ? formatNumber(companyData.sharesOutstanding)
                      : "194,435,600",
                  },
                  {
                    label: "Free Float",
                    value: companyData?.freeFloat
                      ? formatPercentage(companyData.freeFloat)
                      : "25.99%",
                  },
                  {
                    label: "P/E Ratio",
                    value: companyData?.peRatio
                      ? formatRatio(companyData.peRatio)
                      : "16.27",
                  },
                ].map((metric, index) => (
                  <div
                    key={index}
                    className="bg-green-50 p-4 rounded-lg text-center"
                  >
                    <p className="text-xs text-gray-600 mb-1 uppercase tracking-wide">
                      {metric.label}
                    </p>
                    <p className="text-lg font-bold text-green-600">
                      {metric.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  {
                    label: "Book Value",
                    value: companyData?.bookValue
                      ? formatPrice(companyData.bookValue)
                      : "Rs. 45.23",
                  },
                  {
                    label: "Face Value",
                    value: companyData?.faceValue
                      ? formatPrice(companyData.faceValue)
                      : "Rs. 10.00",
                  },
                  {
                    label: "Lot Size",
                    value: companyData?.lotSize
                      ? companyData.lotSize.toLocaleString()
                      : "500",
                  },
                  {
                    label: "EPS",
                    value: companyData?.epsRatio
                      ? formatPrice(companyData.epsRatio)
                      : "Rs. 7.85",
                  },
                  {
                    label: "Dividend Yield",
                    value: companyData?.dividendYield
                      ? formatPercentage(companyData.dividendYield)
                      : "4.50%",
                  },
                  {
                    label: "52W Range",
                    value: `${formatPrice(stockData.high)} / ${formatPrice(stockData.low)}`,
                  },
                ].map((metric, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1 uppercase tracking-wide">
                      {metric.label}
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {metric.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Announcements Section */}
        <section id="announcements" className="scroll-mt-16">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4">
              <h2 className="text-lg font-bold flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Announcements
              </h2>
            </div>

            <div className="p-6">
              {/* Compact Announcement Categories */}
              <div className="mb-6">
                <nav className="flex flex-wrap gap-2">
                  {Object.keys(sampleAnnouncements).map((category) => (
                    <button
                      key={category}
                      onClick={() => setActiveAnnouncementTab(category)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                        activeAnnouncementTab === category
                          ? "bg-green-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-600"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Compact Announcements List */}
              {activeAnnouncementTab &&
                (sampleAnnouncements as any)[activeAnnouncementTab] && (
                  <div className="space-y-3">
                    {(sampleAnnouncements as any)[activeAnnouncementTab]
                      .slice(0, 5)
                      .map((announcement: any, index: number) => (
                        <div
                          key={index}
                          className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                                  {announcement.date}
                                </span>
                                <span className="text-sm font-semibold text-gray-900">
                                  {announcement.title}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600">
                                {announcement.document}
                              </p>
                            </div>
                            <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-xs">
                              <Download className="w-3 h-3" />
                              <span>Download</span>
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}

              {/* Pagination for Announcements */}
              {activeAnnouncementTab &&
                (sampleAnnouncements as any)[activeAnnouncementTab] &&
                (sampleAnnouncements as any)[activeAnnouncementTab].length >
                  5 && (
                  <div className="mt-4 flex justify-center">
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300">
                        Previous
                      </button>
                      <span className="text-sm text-gray-600">
                        1 of{" "}
                        {Math.ceil(
                          (sampleAnnouncements as any)[activeAnnouncementTab]
                            .length / 5,
                        )}
                      </span>
                      <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300">
                        Next
                      </button>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </section>

        {/* Financials Section */}
        <section id="financials" className="scroll-mt-16">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-4">
              <h2 className="text-lg font-bold flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Financials
              </h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Annual Financials */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3">
                  Annual Financials
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-green-600 text-white">
                        <th className="px-3 py-2 text-left">Year</th>
                        <th className="px-3 py-2 text-right">Sales</th>
                        <th className="px-3 py-2 text-right">Profit</th>
                        <th className="px-3 py-2 text-right">EPS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sampleFinancials.annual?.map((item, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="px-3 py-2 font-medium">
                            {item.label}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {item.sales
                              ? `Rs. ${formatNumber(item.sales)}`
                              : "-"}
                          </td>
                          <td
                            className={`px-3 py-2 text-right ${
                              (item.profitAfterTax ?? 0) < 0
                                ? "text-red-600"
                                : ""
                            }`}
                          >
                            {item.profitAfterTax
                              ? `Rs. ${formatNumber(item.profitAfterTax)}`
                              : "-"}
                          </td>
                          <td className="px-3 py-2 text-right">
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
                <h3 className="text-base font-semibold text-gray-900 mb-3">
                  Quarterly Financials
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-blue-600 text-white">
                        <th className="px-3 py-2 text-left">Quarter</th>
                        <th className="px-3 py-2 text-right">Sales</th>
                        <th className="px-3 py-2 text-right">Profit</th>
                        <th className="px-3 py-2 text-right">EPS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sampleFinancials.quarterly?.map((item, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="px-3 py-2 font-medium">
                            {item.label}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {item.sales
                              ? `Rs. ${formatNumber(item.sales)}`
                              : "-"}
                          </td>
                          <td
                            className={`px-3 py-2 text-right ${
                              (item.profitAfterTax ?? 0) < 0
                                ? "text-red-600"
                                : ""
                            }`}
                          >
                            {item.profitAfterTax
                              ? `Rs. ${formatNumber(item.profitAfterTax)}`
                              : "-"}
                          </td>
                          <td className="px-3 py-2 text-right">
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
        </section>

        {/* Ratios Section */}
        <section id="ratios" className="scroll-mt-16">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4">
              <h2 className="text-lg font-bold flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Financial Ratios
              </h2>
            </div>

            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-green-600 text-white">
                      <th className="px-3 py-2 text-left">Year</th>
                      <th className="px-3 py-2 text-right">Gross Margin (%)</th>
                      <th className="px-3 py-2 text-right">Net Margin (%)</th>
                      <th className="px-3 py-2 text-right">EPS Growth (%)</th>
                      <th className="px-3 py-2 text-right">PEG Ratio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleRatios.map((item, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium">{item.year}</td>
                        <td className="px-3 py-2 text-right">
                          {item.grossProfitMargin?.toFixed(1) || "-"}%
                        </td>
                        <td className="px-3 py-2 text-right">
                          {item.netProfitMargin?.toFixed(1) || "-"}%
                        </td>
                        <td
                          className={`px-3 py-2 text-right ${
                            (item.epsGrowth ?? 0) < 0
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {item.epsGrowth?.toFixed(1) || "-"}%
                        </td>
                        <td className="px-3 py-2 text-right">
                          {item.peg?.toFixed(2) || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Payouts Section */}
        <section id="payouts" className="scroll-mt-16">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-4">
              <h2 className="text-lg font-bold flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Payouts & Dividends
              </h2>
            </div>

            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-blue-600 text-white">
                      <th className="px-3 py-2 text-left">Date</th>
                      <th className="px-3 py-2 text-left">Financial Results</th>
                      <th className="px-3 py-2 text-left">Details</th>
                      <th className="px-3 py-2 text-left">Book Closure</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getPaginatedData(samplePayouts, payoutsPage).map(
                      (item, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="px-3 py-2 font-medium">{item.date}</td>
                          <td className="px-3 py-2">{item.financialResults}</td>
                          <td className="px-3 py-2 font-medium text-blue-600">
                            {item.details}
                          </td>
                          <td className="px-3 py-2">{item.bookClosure}</td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>

              <PaginationControls
                currentPage={payoutsPage}
                totalPages={getTotalPages(samplePayouts.length)}
                onPageChange={setPayoutsPage}
                className="mt-4"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
