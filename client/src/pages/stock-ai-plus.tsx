
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
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
  RefreshCw
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
  const [activeTab, setActiveTab] = useState("overview");

  // Load the pre-analyzed stock data from JSON
  const [stockAnalysisData, setStockAnalysisData] = useState<StockData[]>([]);

  useEffect(() => {
    // Load the stock analysis data from the JSON file
    fetch('/api/stock-analysis-data')
      .then(res => res.json())
      .then(data => {
        if (data.stocks) {
          setStockAnalysisData(data.stocks);
          if (data.stocks.length > 0) {
            setSelectedStock(data.stocks[0]);
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
              }
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

  const renderDynamicSection = (title: string, data: any, icon: React.ReactNode) => {
    if (!data || typeof data !== 'object') return null;

    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(data).map(([key, value], index) => {
              if (value === null || value === undefined) return null;
              
              const displayKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).replace(/_/g, ' ');
              
              if (typeof value === 'object' && !Array.isArray(value)) {
                return (
                  <div key={key} className="p-3 bg-muted/50 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">{displayKey}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      {Object.entries(value).map(([subKey, subValue]) => (
                        <div key={subKey} className="flex justify-between">
                          <span className="text-muted-foreground">{subKey.replace(/_/g, ' ')}:</span>
                          <span className="font-medium">
                            {typeof subValue === 'number' ? 
                              (subKey.includes('percent') ? formatPercent(subValue) : 
                               subKey.includes('price') || subKey.includes('amount') ? formatCurrency(subValue) :
                               subValue.toLocaleString()) : 
                              String(subValue)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              if (Array.isArray(value)) {
                return (
                  <div key={key} className="p-3 bg-muted/50 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">{displayKey}</h4>
                    <div className="space-y-1">
                      {value.slice(0, 5).map((item, idx) => (
                        <div key={idx} className="text-xs p-2 bg-background rounded border">
                          {typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item)}
                        </div>
                      ))}
                      {value.length > 5 && (
                        <div className="text-xs text-muted-foreground">...and {value.length - 5} more items</div>
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <div key={key} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">{displayKey}</span>
                  <span className="text-sm font-medium">
                    {typeof value === 'number' ? 
                      (key.includes('percent') ? formatPercent(value) : 
                       key.includes('price') || key.includes('amount') ? formatCurrency(value) :
                       value.toLocaleString()) : 
                      String(value)}
                  </span>
                </div>
              );
            })}
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
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <Link href="/ai-analysis-new">
                <Button variant="ghost" size="sm" className="mb-2 hover:bg-blue-100 dark:hover:bg-blue-900/50">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to AI Analysis
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Stock AI+
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300">
                    Advanced AI-powered comprehensive stock analysis
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </div>
        </div>

        {/* Stock Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Select Stock for Comprehensive Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by ticker or company name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
              {filteredStocks.map((stock) => (
                <Button
                  key={stock.ticker}
                  variant={selectedStock?.ticker === stock.ticker ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedStock(stock)}
                  className="justify-start text-left"
                >
                  <div>
                    <div className="font-semibold">{stock.ticker}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {stock.company_name?.substring(0, 20)}...
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stock Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                  {selectedStock.ticker?.substring(0, 3) || 'STK'}
                </div>
                <div>
                  <h2 className="text-3xl font-bold">{selectedStock.ticker}</h2>
                  <p className="text-lg text-muted-foreground">{selectedStock.company_name}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant="outline">{selectedStock.sector}</Badge>
                    <Badge variant="outline">{selectedStock.exchange}</Badge>
                    <Badge variant="outline">{selectedStock.country}</Badge>
                    {selectedStock.website && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={selectedStock.website} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Website
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                {selectedStock.ai_insights?.ai_rating && (
                  <Badge variant={getRatingBadgeVariant(selectedStock.ai_insights.ai_rating)} className="text-lg px-4 py-2 mb-2">
                    {selectedStock.ai_insights.ai_rating}
                  </Badge>
                )}
                {selectedStock.ai_insights?.investment_type && (
                  <p className="text-sm text-muted-foreground">
                    Investment Type: {selectedStock.ai_insights.investment_type}
                  </p>
                )}
              </div>
            </div>

            {/* Key Metrics Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-lg">
                <p className="text-sm text-muted-foreground">Current Price</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(selectedStock.historical?.price?.end_price)}
                </p>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg">
                <p className="text-sm text-muted-foreground">Change</p>
                <p className={`text-2xl font-bold ${selectedStock.historical?.price?.change_percent && selectedStock.historical.price.change_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercent(selectedStock.historical?.price?.change_percent)}
                </p>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950 dark:to-violet-950 rounded-lg">
                <p className="text-sm text-muted-foreground">52W High</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(selectedStock.historical?.price?.["52_week_high"])}
                </p>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 rounded-lg">
                <p className="text-sm text-muted-foreground">Market Cap</p>
                <p className="text-2xl font-bold text-orange-600">
                  {selectedStock.historical?.market_cap ? 
                    `${selectedStock.historical.market_cap.end?.toLocaleString()} ${selectedStock.historical.market_cap.unit}` : 
                    'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Analysis Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white rounded-lg text-xs">
              <Eye className="w-3 h-3 mr-1" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="historical" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-lg text-xs">
              <BarChart3 className="w-3 h-3 mr-1" />
              Historical
            </TabsTrigger>
            <TabsTrigger value="forecast" className="data-[state=active]:bg-green-500 data-[state=active]:text-white rounded-lg text-xs">
              <Target className="w-3 h-3 mr-1" />
              Forecast
            </TabsTrigger>
            <TabsTrigger value="technical" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-lg text-xs">
              <LineChart className="w-3 h-3 mr-1" />
              Technical
            </TabsTrigger>
            <TabsTrigger value="ai-insights" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white rounded-lg text-xs">
              <Brain className="w-3 h-3 mr-1" />
              AI Insights
            </TabsTrigger>
            <TabsTrigger value="sentiment" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white rounded-lg text-xs">
              <Star className="w-3 h-3 mr-1" />
              Sentiment
            </TabsTrigger>
            <TabsTrigger value="risks" className="data-[state=active]:bg-red-500 data-[state=active]:text-white rounded-lg text-xs">
              <Shield className="w-3 h-3 mr-1" />
              Risks
            </TabsTrigger>
            <TabsTrigger value="metadata" className="data-[state=active]:bg-gray-500 data-[state=active]:text-white rounded-lg text-xs">
              <Info className="w-3 h-3 mr-1" />
              Meta
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {selectedStock.historical?.price && renderDynamicSection(
                "Price Data", 
                selectedStock.historical.price, 
                <DollarSign className="w-5 h-5 text-blue-600" />
              )}
              
              {selectedStock.historical?.market_cap && renderDynamicSection(
                "Market Capitalization", 
                selectedStock.historical.market_cap, 
                <Building className="w-5 h-5 text-green-600" />
              )}
            </div>

            {selectedStock.historical?.notable_trends && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    Notable Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedStock.historical.notable_trends.map((trend, index) => (
                      <div key={index} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg border">
                        <p className="text-sm font-medium flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 mt-0.5 text-purple-600 flex-shrink-0" />
                          {trend}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedStock.watchlist_tags && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-600" />
                    Watchlist Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {selectedStock.watchlist_tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Historical Tab */}
          <TabsContent value="historical" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {selectedStock.historical?.financials && renderDynamicSection(
                "Financial Data", 
                selectedStock.historical.financials, 
                <BarChart3 className="w-5 h-5 text-blue-600" />
              )}
              
              {selectedStock.historical?.dividends && renderDynamicSection(
                "Dividend Information", 
                selectedStock.historical.dividends, 
                <Percent className="w-5 h-5 text-green-600" />
              )}
            </div>

            {selectedStock.historical?.news && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Newspaper className="w-5 h-5 text-indigo-600" />
                    Recent News & Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {selectedStock.historical.news.map((newsItem, index) => (
                      <div key={index} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-sm">{newsItem.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              newsItem.impact === "Positive" ? "default" :
                              newsItem.impact === "Negative" ? "destructive" : "secondary"
                            }>
                              {newsItem.impact}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{newsItem.date}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{newsItem.summary}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Forecast Tab */}
          <TabsContent value="forecast" className="space-y-6">
            {selectedStock.forecast?.expected_price_range && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-600" />
                    Price Forecast
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-xl mb-6">
                    <p className="text-sm text-muted-foreground mb-2">Expected Price Target</p>
                    <p className="text-4xl font-bold text-green-600 mb-4">
                      {formatCurrency(selectedStock.forecast.expected_price_range.expected_average)}
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Low Estimate</p>
                        <p className="font-semibold text-red-600">
                          {formatCurrency(selectedStock.forecast.expected_price_range.low)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">High Estimate</p>
                        <p className="font-semibold text-green-600">
                          {formatCurrency(selectedStock.forecast.expected_price_range.high)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Upside Potential</p>
                      <p className="text-xl font-bold text-green-600">
                        {formatPercent(selectedStock.forecast.upside_percent)}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Confidence Level</p>
                      <p className="text-xl font-bold">{safeValue(selectedStock.forecast.confidence_level)}</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">EPS Estimate</p>
                      <p className="text-xl font-bold">{safeValue(selectedStock.forecast.EPS_estimate)}</p>
                    </div>
                  </div>

                  {selectedStock.forecast.forecast_notes && (
                    <Alert className="mt-4">
                      <Lightbulb className="w-4 h-4" />
                      <AlertDescription>
                        <strong>Forecast Notes:</strong> {selectedStock.forecast.forecast_notes}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {selectedStock.forecast && renderDynamicSection(
                "Additional Forecast Data", 
                Object.fromEntries(
                  Object.entries(selectedStock.forecast).filter(([key]) => 
                    !['expected_price_range', 'upside_percent', 'confidence_level', 'forecast_notes'].includes(key)
                  )
                ), 
                <Calendar className="w-5 h-5 text-orange-600" />
              )}
            </div>
          </TabsContent>

          {/* Technical Tab */}
          <TabsContent value="technical" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {selectedStock.technical_indicators && renderDynamicSection(
                "Technical Indicators", 
                selectedStock.technical_indicators, 
                <Activity className="w-5 h-5 text-blue-600" />
              )}
              
              {selectedStock.pattern_analysis && renderDynamicSection(
                "Pattern Analysis", 
                selectedStock.pattern_analysis, 
                <PieChart className="w-5 h-5 text-purple-600" />
              )}
            </div>

            {selectedStock.technical_indicators?.rsi && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="w-5 h-5 text-orange-600" />
                    RSI Indicator
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">RSI Value</span>
                      <Badge variant={
                        selectedStock.technical_indicators.rsi > 70 ? "destructive" :
                        selectedStock.technical_indicators.rsi < 30 ? "default" : "secondary"
                      }>
                        {selectedStock.technical_indicators.rsi > 70 ? "Overbought" :
                         selectedStock.technical_indicators.rsi < 30 ? "Oversold" : "Neutral"}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Oversold (30)</span>
                        <span className="font-bold">{selectedStock.technical_indicators.rsi}</span>
                        <span>Overbought (70)</span>
                      </div>
                      <Progress value={selectedStock.technical_indicators.rsi} className="h-3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="ai-insights" className="space-y-6">
            {selectedStock.ai_insights?.trend_summary && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    AI Trend Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-xl">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {selectedStock.ai_insights.trend_summary}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {selectedStock.ai_insights?.short_term_analysis && renderDynamicSection(
                "Short-term Analysis", 
                selectedStock.ai_insights.short_term_analysis, 
                <Clock className="w-5 h-5 text-blue-600" />
              )}
              
              {selectedStock.ai_insights?.long_term_analysis && renderDynamicSection(
                "Long-term Analysis", 
                selectedStock.ai_insights.long_term_analysis, 
                <Calendar className="w-5 h-5 text-green-600" />
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {selectedStock.ai_insights?.key_growth_drivers && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      Growth Drivers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {selectedStock.ai_insights.key_growth_drivers.map((driver, index) => (
                        <li key={index} className="flex items-start gap-2 p-2 bg-green-50 dark:bg-green-950 rounded-lg">
                          <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                          <span className="text-sm">{driver}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {selectedStock.ai_insights?.potential_risks && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      Potential Risks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {selectedStock.ai_insights.potential_risks.map((risk, index) => (
                        <li key={index} className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-950 rounded-lg">
                          <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                          <span className="text-sm">{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Sentiment Tab */}
          <TabsContent value="sentiment" className="space-y-6">
            {selectedStock.analyst_sentiment && renderDynamicSection(
              "Analyst Sentiment", 
              selectedStock.analyst_sentiment, 
              <Users className="w-5 h-5 text-indigo-600" />
            )}

            {selectedStock.alerts && selectedStock.alerts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-600" />
                    Active Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedStock.alerts.map((alert, index) => (
                      <Alert key={index}>
                        <AlertTriangle className="w-4 h-4" />
                        <AlertDescription>
                          <strong>{alert.type}:</strong> {alert.message}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Risks Tab */}
          <TabsContent value="risks" className="space-y-6">
            {selectedStock.global_exposure && renderDynamicSection(
              "Global Risk Exposure", 
              selectedStock.global_exposure, 
              <Globe className="w-5 h-5 text-red-600" />
            )}

            {selectedStock.global_exposure?.exports_percent !== undefined && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-orange-600" />
                    Export Exposure Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Export Exposure</span>
                        <span className="font-bold">{selectedStock.global_exposure.exports_percent}%</span>
                      </div>
                      <Progress value={selectedStock.global_exposure.exports_percent} className="h-3" />
                    </div>
                    
                    {selectedStock.global_exposure.currency_risk && (
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="font-medium">Currency Risk</span>
                        <Badge variant={
                          selectedStock.global_exposure.currency_risk === "High" ? "destructive" :
                          selectedStock.global_exposure.currency_risk === "Medium" ? "default" : "secondary"
                        }>
                          {selectedStock.global_exposure.currency_risk}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Metadata Tab */}
          <TabsContent value="metadata" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {selectedStock.period && renderDynamicSection(
                "Analysis Period", 
                selectedStock.period, 
                <Calendar className="w-5 h-5 text-blue-600" />
              )}
              
              {selectedStock.metadata && renderDynamicSection(
                "Analysis Metadata", 
                selectedStock.metadata, 
                <Info className="w-5 h-5 text-gray-600" />
              )}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  Complete Data Structure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-auto">
                  <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
                    {JSON.stringify(selectedStock, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default StockAIPlus;
