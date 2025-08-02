import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Target, 
  BarChart3, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Star,
  Globe,
  Building,
  DollarSign,
  ArrowUpDown,
  Zap,
  Brain,
  LineChart,
  PieChart,
  Info,
  Sparkles,
  Bot,
  Eye,
  ArrowLeft,
  Percent,
  Volume2,
  Shield,
  Lightbulb,
  Award,
  ExternalLink,
  ChevronRight,
  Users,
  Newspaper,
  BookOpen,
  Loader2,
  RefreshCw,
  Upload,
  Download,
  Edit3,
  Save,
  FileText,
  Database,
  Settings,
  BarChart2,
  TrendingUp as TrendIcon,
  Calculator,
  MousePointer,
  Layers,
  Package
} from "lucide-react";
import { Link } from "wouter";
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';

interface StockData {
  ticker: string;
  company_name: string;
  exchange: string;
  sector: string;
  country: string;
  currency: string;
  isin?: string;
  website?: string;
  logo_url?: string;
  period?: {
    historical_from: string;
    historical_to: string;
    forecast_to: string;
    last_updated: string;
  };
  charts?: {
    candlestick?: any;
    line_chart?: any;
    volume_chart?: any;
  };
  historical?: {
    price?: {
      start_price: number;
      end_price: number;
      change_percent: number;
      "52_week_high": number;
      "52_week_low": number;
      volatility_weekly_percent: string;
    };
    market_cap?: {
      start: number;
      end: number;
      unit: string;
      change_percent: number;
    };
    financials?: {
      revenue?: any;
      net_income?: any;
      EPS?: any;
      margins?: any;
      ratios?: any;
    };
    dividends?: {
      annual_yield_percent: number;
      payouts: any[];
    };
    news?: any[];
    notable_trends?: string[];
  };
  forecast?: {
    expected_price_range?: {
      low: number;
      high: number;
      expected_average: number;
    };
    EPS_estimate?: number;
    revenue_estimate?: number;
    net_income_estimate?: number;
    dividends_expected?: any[];
    price_target?: number;
    upside_percent?: number;
    confidence_level?: string;
    forecast_notes?: string;
  };
  technical_indicators?: {
    rsi?: number;
    moving_averages?: any;
    macd?: string;
    bollinger_bands?: string;
    volume_average_30d?: number;
    adx?: number;
  };
  pattern_analysis?: {
    detected_patterns?: any[];
  };
  analyst_sentiment?: {
    recommendation?: string;
    price_target_range?: any;
    analysts_count?: number;
    summary?: string;
  };
  ai_insights?: {
    trend_summary?: string;
    short_term_analysis?: any;
    long_term_analysis?: any;
    key_growth_drivers?: string[];
    potential_risks?: string[];
    ai_rating?: string;
    investment_type?: string;
  };
  watchlist_tags?: string[];
  alerts?: any[];
  global_exposure?: {
    exports_percent?: number;
    currency_risk?: string;
    international_investors?: string[];
    geo_dependency?: string[];
  };
  metadata?: {
    source?: string;
    model_version?: string;
    generated_on?: string;
    language?: string;
  };
}

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'];

function StockAIPlus() {
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [customDataInput, setCustomDataInput] = useState("");
  const [dataSource, setDataSource] = useState<"json" | "custom">("json");

  // Load the pre-analyzed stock data from JSON
  const [stockAnalysisData, setStockAnalysisData] = useState<StockData[]>([]);

  // News data
  const { data: newsData } = useQuery({
    queryKey: ["/api/news"],
    refetchInterval: 300000, // 5 minutes
  });

  useEffect(() => {
    // Load the stock analysis data from the JSON file
    fetch('/api/stock-analysis-data')
      .then(res => res.json())
      .then(data => {
        if (data.stocks) {
          setStockAnalysisData(data.stocks);
          if (data.stocks.length > 0) {
            setSelectedStock(data.stocks[0]);
            setCustomDataInput(JSON.stringify(data.stocks[0], null, 2));
          }
        }
      })
      .catch(error => {
        console.error('Failed to load stock analysis data:', error);
        // Fallback: Create sample data structure for testing
        const sampleData: StockData[] = [
          {
            ticker: "SAMPLE",
            company_name: "Sample Company Limited",
            exchange: "PSX",
            sector: "Technology",
            country: "Pakistan",
            currency: "PKR",
            historical: {
              price: {
                start_price: 100,
                end_price: 150,
                change_percent: 50,
                "52_week_high": 160,
                "52_week_low": 90,
                volatility_weekly_percent: "3.2"
              },
              news: [
                {
                  date: "2025-08-01",
                  title: "Sample Company reports strong Q3 results",
                  impact: "Positive",
                  summary: "The company exceeded analyst expectations with revenue growth of 25%."
                }
              ]
            },
            ai_insights: {
              ai_rating: "A (Buy)",
              trend_summary: "Sample analysis data loaded for testing",
              investment_type: "Growth"
            }
          }
        ];
        setStockAnalysisData(sampleData);
        setSelectedStock(sampleData[0]);
        setCustomDataInput(JSON.stringify(sampleData[0], null, 2));
      });
  }, []);

  const filteredStocks = stockAnalysisData.filter(stock =>
    stock.ticker?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const safeValue = (value: any, fallback: string = 'N/A') => {
    return (value !== null && value !== undefined) ? value : fallback;
  };

  const safeNumber = (value: any, fallback: number = 0) => {
    return (typeof value === 'number' && !isNaN(value)) ? value : fallback;
  };

  const formatCurrency = (amount: any) => {
    const num = safeNumber(amount);
    return num === 0 ? 'N/A' : `Rs. ${num.toLocaleString()}`;
  };

  const formatPercent = (percent: any) => {
    const num = safeNumber(percent);
    return num === 0 ? 'N/A' : `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  const getTrendColor = (trend: string) => {
    const trendLower = trend?.toLowerCase() || '';
    if (trendLower.includes('bull') || trendLower.includes('buy') || trendLower.includes('positive')) {
      return "text-green-600 dark:text-green-400";
    }
    if (trendLower.includes('bear') || trendLower.includes('sell') || trendLower.includes('negative')) {
      return "text-red-600 dark:text-red-400";
    }
    return "text-yellow-600 dark:text-yellow-400";
  };

  const getRatingBadgeVariant = (rating: string) => {
    const ratingLower = rating?.toLowerCase() || '';
    if (ratingLower.includes('buy') || ratingLower.includes('a')) return "default";
    if (ratingLower.includes('sell') || ratingLower.includes('d')) return "destructive";
    return "secondary";
  };

  const handleCustomDataLoad = () => {
    try {
      const parsedData = JSON.parse(customDataInput);
      setSelectedStock(parsedData);
      setDataSource("custom");
    } catch (error) {
      alert("Invalid JSON format. Please check your input.");
    }
  };

  const exportCurrentData = () => {
    if (selectedStock) {
      const dataStr = JSON.stringify(selectedStock, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedStock.ticker}_analysis.json`;
      link.click();
    }
  };

  const renderCompactSection = (title: string, data: any, icon: React.ReactNode, colorClass: string = "border-gray-200") => {
    if (!data || typeof data !== 'object') return null;

    return (
      <Card className={`border-2 ${colorClass} hover:shadow-md transition-shadow`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {Object.entries(data).slice(0, 4).map(([key, value], index) => {
              if (value === null || value === undefined) return null;

              const displayKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).replace(/_/g, ' ');

              if (typeof value === 'object' && !Array.isArray(value)) {
                return (
                  <div key={key} className="text-xs">
                    <span className="font-medium text-gray-600">{displayKey}:</span>
                    <div className="ml-2 mt-1">
                      {Object.entries(value).slice(0, 2).map(([subKey, subValue]) => (
                        <div key={subKey} className="flex justify-between">
                          <span className="text-gray-500">{subKey.replace(/_/g, ' ')}:</span>
                          <span className="font-medium">
                            {typeof subValue === 'number' ? 
                              (subKey.includes('percent') ? formatPercent(subValue) : 
                               subKey.includes('price') || subKey.includes('amount') ? formatCurrency(subValue) :
                               subValue.toLocaleString()) : 
                              String(subValue).substring(0, 20)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              if (Array.isArray(value)) {
                return (
                  <div key={key} className="text-xs">
                    <span className="font-medium text-gray-600">{displayKey}:</span>
                    <div className="ml-2 text-gray-500">{value.length} items</div>
                  </div>
                );
              }

              return (
                <div key={key} className="flex justify-between items-center text-xs">
                  <span className="text-gray-600 font-medium">{displayKey}:</span>
                  <span className="font-semibold">
                    {typeof value === 'number' ? 
                      (key.includes('percent') ? formatPercent(value) : 
                       key.includes('price') || key.includes('amount') ? formatCurrency(value) :
                       value.toLocaleString()) : 
                      String(value).substring(0, 15)}
                  </span>
                </div>
              );
            })}
            {Object.keys(data).length > 4 && (
              <div className="text-xs text-gray-400">...and {Object.keys(data).length - 4} more fields</div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!selectedStock) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Loading Stock AI+ data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
      <div className="container mx-auto px-3 py-4 max-w-[1600px]">
        {/* Compact Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Link href="/ai-analysis-new">
                <Button variant="ghost" size="sm" className="mb-1 hover:bg-blue-100 dark:hover:bg-blue-900/50">
                  <ArrowLeft className="w-3 h-3 mr-1" /> Back
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Stock AI+ Compact
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Comprehensive AI analysis in compact view
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportCurrentData}>
                <Download className="w-3 h-3 mr-1" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={() => setEditMode(!editMode)}>
                <Edit3 className="w-3 h-3 mr-1" />
                {editMode ? 'View' : 'Edit'}
              </Button>
            </div>
          </div>
        </div>

        {/* Data Input Section */}
        {editMode && (
          <Card className="mb-4 border-2 border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="w-5 h-5 text-purple-600" />
                Data Input & Testing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Select value={dataSource} onValueChange={(value: "json" | "custom") => setDataSource(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON File Data</SelectItem>
                    <SelectItem value="custom">Custom JSON Input</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleCustomDataLoad} size="sm" disabled={dataSource !== "custom"}>
                  <Upload className="w-3 h-3 mr-1" />
                  Load Custom Data
                </Button>
              </div>

              {dataSource === "custom" && (
                <Textarea
                  value={customDataInput}
                  onChange={(e) => setCustomDataInput(e.target.value)}
                  placeholder="Paste your JSON data structure here..."
                  className="h-32 font-mono text-xs"
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* Stock Selection */}
        <Card className="mb-4 border-2 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="w-4 h-4" />
              Stock Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Search stocks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-24 overflow-y-auto">
              {filteredStocks.map((stock) => (
                <Button
                  key={stock.ticker}
                  variant={selectedStock?.ticker === stock.ticker ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedStock(stock)}
                  className="justify-start text-left text-xs h-12"
                >
                  <div>
                    <div className="font-semibold">{stock.ticker}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {stock.company_name?.substring(0, 15)}...
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stock Header Card */}
        <Card className="mb-4 border-2 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  {selectedStock.ticker?.substring(0, 3) || 'STK'}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedStock.ticker}</h2>
                  <p className="text-sm text-muted-foreground">{selectedStock.company_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">{selectedStock.sector}</Badge>
                    <Badge variant="outline" className="text-xs">{selectedStock.exchange}</Badge>
                    {selectedStock.ai_insights?.ai_rating && (
                      <Badge variant={getRatingBadgeVariant(selectedStock.ai_insights.ai_rating)} className="text-xs">
                        {selectedStock.ai_insights.ai_rating}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="text-center p-2 bg-blue-50 rounded">
                  <p className="text-blue-700">Current</p>
                  <p className="font-bold text-blue-900">
                    {formatCurrency(selectedStock.historical?.price?.end_price)}
                  </p>
                </div>
                <div className="text-center p-2 bg-green-50 rounded">
                  <p className="text-green-700">Change</p>
                  <p className={`font-bold ${selectedStock.historical?.price?.change_percent && selectedStock.historical.price.change_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercent(selectedStock.historical?.price?.change_percent)}
                  </p>
                </div>
                <div className="text-center p-2 bg-purple-50 rounded">
                  <p className="text-purple-700">52W High</p>
                  <p className="font-bold text-purple-900">
                    {formatCurrency(selectedStock.historical?.price?.["52_week_high"])}
                  </p>
                </div>
                <div className="text-center p-2 bg-orange-50 rounded">
                  <p className="text-orange-700">Volume</p>
                  <p className="font-bold text-orange-900">
                    {selectedStock.technical_indicators?.volume_average_30d ? 
                      `${(selectedStock.technical_indicators.volume_average_30d / 1000000).toFixed(1)}M` : 
                      'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid - All Components Visible */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">

          {/* Price Data */}
          {selectedStock.historical?.price && renderCompactSection(
            "Price Analysis", 
            selectedStock.historical.price, 
            <DollarSign className="w-4 h-4 text-blue-600" />,
            "border-blue-200"
          )}

          {/* Market Cap */}
          {selectedStock.historical?.market_cap && renderCompactSection(
            "Market Cap", 
            selectedStock.historical.market_cap, 
            <Building className="w-4 h-4 text-green-600" />,
            "border-green-200"
          )}

          {/* Technical Indicators */}
          {selectedStock.technical_indicators && renderCompactSection(
            "Technical Indicators", 
            selectedStock.technical_indicators, 
            <BarChart2 className="w-4 h-4 text-purple-600" />,
            "border-purple-200"
          )}

          {/* AI Insights */}
          {selectedStock.ai_insights && renderCompactSection(
            "AI Analysis", 
            selectedStock.ai_insights, 
            <Brain className="w-4 h-4 text-pink-600" />,
            "border-pink-200"
          )}

          {/* Forecast */}
          {selectedStock.forecast && renderCompactSection(
            "Forecast", 
            selectedStock.forecast, 
            <Target className="w-4 h-4 text-orange-600" />,
            "border-orange-200"
          )}

          {/* Financials */}
          {selectedStock.historical?.financials && renderCompactSection(
            "Financials", 
            selectedStock.historical.financials, 
            <Calculator className="w-4 h-4 text-indigo-600" />,
            "border-indigo-200"
          )}

          {/* Analyst Sentiment */}
          {selectedStock.analyst_sentiment && renderCompactSection(
            "Analyst Views", 
            selectedStock.analyst_sentiment, 
            <Users className="w-4 h-4 text-teal-600" />,
            "border-teal-200"
          )}

          {/* Global Exposure */}
          {selectedStock.global_exposure && renderCompactSection(
            "Global Exposure", 
            selectedStock.global_exposure, 
            <Globe className="w-4 h-4 text-red-600" />,
            "border-red-200"
          )}

          {/* Pattern Analysis */}
          {selectedStock.pattern_analysis && renderCompactSection(
            "Patterns", 
            selectedStock.pattern_analysis, 
            <TrendIcon className="w-4 h-4 text-yellow-600" />,
            "border-yellow-200"
          )}

          {/* Dividends */}
          {selectedStock.historical?.dividends && renderCompactSection(
            "Dividends", 
            selectedStock.historical.dividends, 
            <Percent className="w-4 h-4 text-emerald-600" />,
            "border-emerald-200"
          )}

          {/* Period Info */}
          {selectedStock.period && renderCompactSection(
            "Analysis Period", 
            selectedStock.period, 
            <Calendar className="w-4 h-4 text-slate-600" />,
            "border-slate-200"
          )}

          {/* Metadata */}
          {selectedStock.metadata && renderCompactSection(
            "Metadata", 
            selectedStock.metadata, 
            <Info className="w-4 h-4 text-gray-600" />,
            "border-gray-200"
          )}
        </div>

        {/* News Section */}
        {selectedStock.historical?.news && selectedStock.historical.news.length > 0 && (
          <Card className="mt-4 border-2 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-blue-600" />
                Recent News & Events
                <Badge variant="outline">{selectedStock.historical.news.length} items</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {selectedStock.historical.news.slice(0, 6).map((newsItem, index) => (
                  <div key={index} className="p-3 border rounded-lg hover:bg-blue-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm line-clamp-2">{newsItem.title}</h4>
                      <div className="flex flex-col items-end gap-1">
                        <Badge 
                          variant={
                            newsItem.impact === "Positive" ? "default" :
                            newsItem.impact === "Negative" ? "destructive" : "secondary"
                          }
                          className="text-xs"
                        >
                          {newsItem.impact}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{newsItem.date}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-3">{newsItem.summary}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notable Trends */}
        {selectedStock.historical?.notable_trends && (
          <Card className="mt-4 border-2 border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Notable Trends
                <Badge variant="outline">{selectedStock.historical.notable_trends.length} trends</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {selectedStock.historical.notable_trends.map((trend, index) => (
                  <div key={index} className="p-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded border">
                    <p className="text-sm font-medium flex items-start gap-2">
                      <ChevronRight className="w-3 h-3 mt-0.5 text-purple-600 flex-shrink-0" />
                      {trend}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Watchlist Tags */}
        {selectedStock.watchlist_tags && (
          <Card className="mt-4 border-2 border-yellow-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-600" />
                Investment Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {selectedStock.watchlist_tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alerts */}
        {selectedStock.alerts && selectedStock.alerts.length > 0 && (
          <Card className="mt-4 border-2 border-red-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Active Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {selectedStock.alerts.map((alert, index) => (
                  <Alert key={index} className="border-red-200">
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription className="text-sm">
                      <strong>{alert.type}:</strong> {alert.message}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Raw Data Preview */}
        {editMode && (
          <Card className="mt-4 border-2 border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" />
                Raw Data Structure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-64 overflow-auto">
                <pre className="text-xs bg-gray-50 p-3 rounded border font-mono">
                  {JSON.stringify(selectedStock, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default StockAIPlus;