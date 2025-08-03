import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Brain, 
  TrendingUp, 
  Target, 
  BarChart3, 
  ArrowLeft,
  Sparkles,
  Bot,
  AlertTriangle,
  DollarSign,
  Calendar,
  Clock,
  Percent,
  PieChart,
  RefreshCw,
  TrendingDown,
  Star,
  Eye,
  Lightbulb,
  Loader2,
  Download,
  Share2,
  Filter,
  Search,
  Activity,
  LineChart,
  Zap,
  Shield,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Users,
  Building
} from "lucide-react";
import { Link } from "wouter";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ResponsiveContainer, PieChart as RechartsPieChart, Cell, BarChart, Bar, XAxis, YAxis, LineChart as RechartsLineChart, Line, AreaChart, Area } from 'recharts';
import HeaderTicker from "@/components/header-ticker";
import IndicesTicker from "@/components/indices-ticker";
import { useWebSocket } from "@/hooks/use-websocket";

interface Stock {
  symbol: string;
  name: string;
  current: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  sector: string;
}

interface IndexData {
  symbol: string;
  interval: string;
  data: number[][];
  message: string;
}

interface MarketInsight {
  insight: string;
  marketData: {
    totalStocks: number;
    avgChange: string;
    totalVolume: number;
    topGainers: Stock[];
    topLosers: Stock[];
    sectorPerformance: any[];
  };
}

interface Prediction {
  symbol: string;
  name: string;
  currentPrice: number;
  predictedLow: number;
  predictedHigh: number;
  confidence: number;
  factors: string[];
  risk: string;
  rationale: string;
}

interface Portfolio {
  allocation: Record<string, number>;
  recommendations: any[];
  riskAssessment: string;
  expectedReturn: string;
}

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const MAJOR_INDICES = [
  { symbol: "KSE100", name: "KSE-100 Index" },
  { symbol: "ALLSHR", name: "All Share Index" },
  { symbol: "KSE30", name: "KSE-30 Index" },
  { symbol: "KMI30", name: "KMI-30 Index" },
  { symbol: "OGTI", name: "Oil & Gas Index" },
  { symbol: "BKTI", name: "Banking Index" }
];

function AIAnalysisPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedStock, setSelectedStock] = useState("");
  const [selectedIndex, setSelectedIndex] = useState("KSE100");
  const [riskLevel, setRiskLevel] = useState("medium");
  const [investmentAmount, setInvestmentAmount] = useState("100000");
  const [timeframe, setTimeframe] = useState("1month");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [marketInsights, setMarketInsights] = useState<MarketInsight | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [indexData, setIndexData] = useState<IndexData[]>([]);

  const { data: stocksData, isLoading: stocksLoading, error: stocksError } = useQuery<any>({
    queryKey: ["/api/stocks"],
  });

  // Ensure stocks is always an array - handle both direct array and nested structure
  const stocks = Array.isArray(stocksData) ? stocksData : 
                 (stocksData?.stocks && Array.isArray(stocksData.stocks)) ? stocksData.stocks : [];

  // Debug logging
  console.log('Stocks data:', { stocksData, stocks, length: stocks.length, loading: stocksLoading });

  const filteredStocks = stocks.filter((stock: any) => 
    stock.symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Show loading state only if actually loading
  if (stocksLoading && stocks.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading AI Analysis Tools...</p>
          </div>
        </div>
      </div>
    );
  }

  // Auto-load data on component mount
  useEffect(() => {
    fetchMarketInsights();
    fetchIndexData();
  }, []);

  const fetchIndexData = async () => {
    try {
      const promises = MAJOR_INDICES.map(async (index) => {
        const response = await fetch(`/api/index/${index.symbol}?interval=int`);
        if (response.ok) {
          return await response.json();
        }
        return null;
      });
      const results = await Promise.all(promises);
      setIndexData(results.filter(Boolean));
    } catch (error) {
      console.error("Failed to fetch index data:", error);
    }
  };

  const fetchMarketInsights = async () => {
    try {
      const response = await fetch("/api/market-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          type: "comprehensive",
          format: "html"
        })
      });
      if (response.ok) {
        const data = await response.json();
        setMarketInsights(data);
      }
    } catch (error) {
      console.error("Failed to fetch market insights:", error);
    }
  };

  const fetchPredictions = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const symbols = selectedStock && selectedStock !== "all" && selectedStock !== "no-stocks" ? [selectedStock] : [];
      const response = await fetch("/api/ai-predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbols, timeframe })
      });
      if (response.ok) {
        const data = await response.json();
        setPredictions(data.predictions || []);
      } else {
        console.error("Predictions API error:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Failed to fetch predictions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPortfolio = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await fetch("/api/ai-portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          riskLevel, 
          investmentAmount: parseInt(investmentAmount),
          timeHorizon: "1 year"
        })
      });
      if (response.ok) {
        const data = await response.json();
        setPortfolio(data);
      }
    } catch (error) {
      console.error("Failed to fetch portfolio:", error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeStock = async () => {
    if (!selectedStock || selectedStock === "all" || selectedStock === "no-stocks" || loading) return;
    setLoading(true);
    try {
      const response = await fetch("/api/ai-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          symbol: selectedStock,
          format: "html"
        })
      });
      if (response.ok) {
        const data = await response.json();
        setAnalysisResult(data);
      } else {
        console.error("Analysis API error:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Failed to analyze stock:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => `Rs. ${amount.toLocaleString()}`;
  const formatPercent = (percent: number) => `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;

  const renderHTMLContent = (htmlContent: string) => {
    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} className="prose prose-sm max-w-none dark:prose-invert prose-blue" />;
  };

  const getIndexChartData = (data: number[][]) => {
    return data.slice(-20).map((item, idx) => ({
      time: idx,
      price: item[1],
      volume: item[2]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
      <div className="container mx-auto px-4 py-6">
        {/* Compact Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <Link href="/">
                <Button variant="ghost" size="sm" className="mb-2 hover:bg-blue-100 dark:hover:bg-blue-900/50">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    AI Trading Intelligence
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300">
                    Advanced AI-powered analysis for Pakistan Stock Exchange
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchMarketInsights} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Stock Loading Status */}
        {stocksLoading && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
              <p className="text-blue-700">Loading stock data...</p>
            </div>
          </div>
        )}

        {stocksError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">Error loading stocks: {String(stocksError)}</p>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-1">
            <TabsTrigger value="dashboard" className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-lg text-sm">
              <Activity className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2 data-[state=active]:bg-green-500 data-[state=active]:text-white rounded-lg text-sm">
              <Lightbulb className="w-4 h-4" />
              Market AI
            </TabsTrigger>
            <TabsTrigger value="predictions" className="flex items-center gap-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white rounded-lg text-sm">
              <Target className="w-4 h-4" />
              Predictions
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-lg text-sm">
              <PieChart className="w-4 h-4" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2 data-[state=active]:bg-red-500 data-[state=active]:text-white rounded-lg text-sm">
              <BarChart3 className="w-4 h-4" />
              Stock AI
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Major Indices */}
              <Card className="lg:col-span-2 border-2 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <LineChart className="w-5 h-5 mr-2 text-blue-600" />
                    Major Indices Live Data
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {indexData.slice(0, 6).map((index, idx) => {
                      const latestData = index.data?.[index.data.length - 1];
                      const prevData = index.data?.[index.data.length - 2];
                      const change = latestData && prevData ? 
                        ((latestData[1] - prevData[1]) / prevData[1] * 100) : 0;

                      return (
                        <div key={index.symbol} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-gray-900">{index.symbol}</h3>
                            <Badge className={`${change >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} text-xs`}>
                              {formatPercent(change)}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold">
                              {latestData && latestData[1] ? latestData[1].toLocaleString() : 'Loading...'}
                            </span>
                            {change >= 0 ? 
                              <ArrowUpRight className="w-4 h-4 text-green-500" /> : 
                              <ArrowDownRight className="w-4 h-4 text-red-500" />
                            }
                          </div>
                          <div className="mt-2">
                            <div className="h-16">
                              {index.data && (
                                <ResponsiveContainer width="100%" height="100%">
                                  <AreaChart data={getIndexChartData(index.data)}>
                                    <Area 
                                      type="monotone" 
                                      dataKey="price" 
                                      stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                                      fill={CHART_COLORS[idx % CHART_COLORS.length]}
                                      fillOpacity={0.1}
                                      strokeWidth={2}
                                    />
                                  </AreaChart>
                                </ResponsiveContainer>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* AI Quick Tools */}
              <Card className="border-2 border-purple-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <Bot className="w-5 h-5 mr-2 text-purple-600" />
                    AI Quick Tools
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={fetchMarketInsights} 
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
                    size="sm"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Generate Market AI
                  </Button>
                  <Button 
                    onClick={fetchPredictions} 
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg"
                    size="sm"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    AI Predictions
                  </Button>
                  <Button 
                    onClick={fetchPortfolio} 
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg"
                    size="sm"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Build Portfolio
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Real-time Market Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active Stocks</p>
                      <p className="text-2xl font-bold">{stocks.length}</p>
                    </div>
                    <Activity className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Gainers</p>
                      <p className="text-2xl font-bold text-green-600">
                        {stocks.filter((s: any) => s.changePercent > 0).length}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-red-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Losers</p>
                      <p className="text-2xl font-bold text-red-600">
                        {stocks.filter((s: any) => s.changePercent < 0).length}
                      </p>
                    </div>
                    <TrendingDown className="w-8 h-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Volume</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {`${(stocks.reduce((sum: number, s: any) => sum + (s.volume || 0), 0) / 1000000).toFixed(0)}M`}
                      </p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Market Insights Tab */}
          <TabsContent value="insights" className="space-y-4">
            <Card className="border-2 border-green-200">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="flex items-center text-xl">
                  <Sparkles className="w-6 h-6 mr-3 text-green-600" />
                  AI Market Intelligence
                  <Badge className="ml-auto bg-green-100 text-green-800">Real-time</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {marketInsights ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                        <p className="text-sm text-blue-700">Total Stocks</p>
                        <p className="text-2xl font-bold text-blue-900">{marketInsights.marketData.totalStocks}</p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                        <p className="text-sm text-green-700">Avg Change</p>
                        <p className="text-2xl font-bold text-green-900">{marketInsights.marketData.avgChange}%</p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl">
                        <p className="text-sm text-purple-700">Volume</p>
                        <p className="text-2xl font-bold text-purple-900">
                          {((marketInsights.marketData.totalVolume || 0) / 1000000).toFixed(0)}M
                        </p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl">
                        <p className="text-sm text-orange-700">Top Gainers</p>
                        <p className="text-2xl font-bold text-orange-900">{marketInsights.marketData.topGainers?.length || 0}</p>
                      </div>
                    </div>

                    <Card>
                      <CardContent className="p-6">
                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6">
                          {marketInsights.insight.includes('<') ? 
                            renderHTMLContent(marketInsights.insight) : 
                            <p className="text-gray-700 leading-relaxed">{marketInsights.insight}</p>
                          }
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Brain className="w-12 h-12 text-green-600 mx-auto mb-4 animate-pulse" />
                    <p className="text-lg">Generating AI market insights...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Predictions Tab */}
          <TabsContent value="predictions" className="space-y-4">
            <Card className="border-2 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-6 h-6 mr-3 text-purple-600" />
                  AI Price Predictions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Stock Selection</label>
                    <Select value={selectedStock} onValueChange={setSelectedStock}>
                      <SelectTrigger>
                        <SelectValue placeholder="All top performers" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Top Performers</SelectItem>
                        {filteredStocks.length > 0 ? (
                          filteredStocks.slice(0, 50).map((stock: any) => (
                            <SelectItem key={stock.symbol} value={stock.symbol}>
                              {stock.symbol} - {stock.name?.substring(0, 30) || 'Unknown Company'}
                            </SelectItem>
                          ))
                        ) : stocksLoading ? (
                          <SelectItem value="loading" disabled>Loading stocks...</SelectItem>
                        ) : (
                          <SelectItem value="no-stocks" disabled>No stocks available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Timeframe</label>
                    <Select value={timeframe} onValueChange={setTimeframe}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1week">1 Week</SelectItem>
                        <SelectItem value="1month">1 Month</SelectItem>
                        <SelectItem value="3months">3 Months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={fetchPredictions} 
                      disabled={loading} 
                      className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                      Generate Predictions
                    </Button>
                  </div>
                </div>

                {predictions.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                    {predictions.map((prediction) => (
                      <Card key={prediction.symbol} className="border-l-4 border-l-purple-500">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg">{prediction.symbol}</CardTitle>
                              <CardDescription>{prediction.name}</CardDescription>
                            </div>
                            <Badge variant="outline">{prediction.confidence}%</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="bg-purple-50 rounded-lg p-3">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-gray-600">Current</span>
                                <p className="font-bold">{formatCurrency(prediction.currentPrice)}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Target Range</span>
                                <p className="font-bold text-purple-600">
                                  {formatCurrency(prediction.predictedLow)} - {formatCurrency(prediction.predictedHigh)}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div>
                            <span className="text-sm font-medium block mb-1">Risk Level</span>
                            <Badge 
                              variant="outline" 
                              className={`${
                                prediction.risk === "Low" ? "border-green-500 text-green-700" :
                                prediction.risk === "Medium" ? "border-yellow-500 text-yellow-700" :
                                "border-red-500 text-red-700"
                              }`}
                            >
                              {prediction.risk}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-4">
            <Card className="border-2 border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-6 h-6 mr-3 text-orange-600" />
                  AI Portfolio Builder
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium">Risk Level</label>
                    <Select value={riskLevel} onValueChange={setRiskLevel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">🛡️ Conservative</SelectItem>
                        <SelectItem value="medium">⚖️ Balanced</SelectItem>
                        <SelectItem value="high">🚀 Aggressive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Investment (PKR)</label>
                    <Input
                      type="number"
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(e.target.value)}
                      placeholder="100000"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Time Horizon</label>
                    <Select defaultValue="1year">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6months">6 Months</SelectItem>
                        <SelectItem value="1year">1 Year</SelectItem>
                        <SelectItem value="3years">3 Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={fetchPortfolio} 
                      disabled={loading} 
                      className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white"
                    >
                      {loading ? <Loader2 className="w-4 h-4 mr-2" /> : <Shield className="w-4 h-4 mr-2" />}
                      Build Portfolio
                    </Button>
                  </div>
                </div>

                {portfolio && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Sector Allocation</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {Object.entries(portfolio.allocation).map(([sector, percent], idx) => (
                            <div key={sector} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center">
                                <div 
                                  className="w-4 h-4 rounded-full mr-3" 
                                  style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                                />
                                <span className="font-medium">{sector}</span>
                              </div>
                              <span className="font-bold text-orange-600">{percent}%</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Portfolio Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-orange-50 rounded-xl">
                            <p className="text-sm text-orange-700">Expected Return</p>
                            <p className="text-xl font-bold text-orange-800">{portfolio.expectedReturn}</p>
                          </div>
                          <div className="p-3 bg-blue-50 rounded-xl">
                            <p className="text-sm text-blue-700">Investment</p>
                            <p className="text-xl font-bold text-blue-800">
                              {formatCurrency(parseInt(investmentAmount))}
                            </p>
                          </div>
                        </div>

                        <Alert className="border-orange-200 bg-orange-50">
                          <Shield className="w-4 h-4" />
                          <AlertDescription className="text-orange-800">
                            {portfolio.riskAssessment}
                          </AlertDescription>
                        </Alert>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stock Analysis Tab */}
          <TabsContent value="analysis" className="space-y-4">
            <Card className="border-2 border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-6 h-6 mr-3 text-red-600" />
                  Individual Stock AI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Search & Select Stock</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search stocks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={selectedStock} onValueChange={setSelectedStock}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Choose a stock to analyze" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredStocks.length > 0 ? (
                          filteredStocks.slice(0, 50).map((stock: any) => (
                            <SelectItem key={stock.symbol} value={stock.symbol}>
                              {stock.symbol} - {stock.name?.substring(0, 30) || 'Unknown Company'}
                            </SelectItem>
                          ))
                        ) : stocksLoading ? (
                          <SelectItem value="loading" disabled>Loading stocks...</SelectItem>
                        ) : (
                          <SelectItem value="no-stocks" disabled>No stocks available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={analyzeStock} 
                      disabled={!selectedStock || selectedStock === "all" || selectedStock === "no-stocks" || loading} 
                      className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                      Analyze Stock
                    </Button>
                  </div>
                </div>

                {analysisResult && (
                  <Card className="border-l-4 border-l-red-500">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        Analysis for {analysisResult.symbol}
                        <Badge 
                          variant={analysisResult.recommendation?.includes("BUY") ? "default" : 
                                  analysisResult.recommendation?.includes("SELL") ? "destructive" : "secondary"}
                        >
                          {analysisResult.recommendation?.split(' ')[0] || 'HOLD'}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-blue-50 rounded-xl">
                          <p className="text-sm text-blue-700">Target Price</p>
                          <p className="text-2xl font-bold text-blue-900">
                            {formatCurrency(analysisResult.targetPrice)}
                          </p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-xl">
                          <p className="text-sm text-purple-700">AI Confidence</p>
                          <p className="text-2xl font-bold text-purple-900">
                            {analysisResult.confidence}%
                          </p>
                        </div>
                        <div className="p-4 bg-orange-50 rounded-xl">
                          <p className="text-sm text-orange-700">Risk Level</p>
                          <p className="text-2xl font-bold text-orange-900">
                            {analysisResult.riskLevel}
                          </p>
                        </div>
                      </div>

                      <Card>
                        <CardContent className="p-6">
                          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6">
                            {analysisResult.analysis?.includes('<') ? 
                              renderHTMLContent(analysisResult.analysis) : 
                              <p className="text-gray-700 leading-relaxed">
                                {analysisResult.analysis}
                              </p>
                            }
                          </div>
                        </CardContent>
                      </Card>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default AIAnalysisPage;