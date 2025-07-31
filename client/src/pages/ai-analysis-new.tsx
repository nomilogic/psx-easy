
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
  Globe,
  ChevronRight,
  Activity,
  Shield,
  Zap,
  PieChart,
  RefreshCw,
  TrendingDown,
  Star,
  Eye,
  CheckCircle,
  Lightbulb,
  Loader2,
  Download,
  Share2,
  Bookmark,
  Filter,
  Search
} from "lucide-react";
import { Link } from "wouter";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ResponsiveContainer, PieChart as RechartsPieChart, Cell, BarChart, Bar, XAxis, YAxis, LineChart, Line, AreaChart, Area } from 'recharts';

interface Stock {
  symbol: string;
  name: string;
  currentPrice: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
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

const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

function AIAnalysisPage() {
  const [activeTab, setActiveTab] = useState("insights");
  const [selectedStock, setSelectedStock] = useState("");
  const [riskLevel, setRiskLevel] = useState("medium");
  const [investmentAmount, setInvestmentAmount] = useState("100000");
  const [timeframe, setTimeframe] = useState("1month");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [marketInsights, setMarketInsights] = useState<MarketInsight | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const { data: stocks } = useQuery<Stock[]>({
    queryKey: ["/api/stocks"],
  });

  const filteredStocks = stocks?.filter(stock => 
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Auto-load market insights on component mount
  useEffect(() => {
    fetchMarketInsights();
  }, []);

  const fetchMarketInsights = async () => {
    try {
      const response = await fetch("/api/market-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          type: "comprehensive",
          format: "html" // Request HTML format
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
      const symbols = selectedStock && selectedStock !== "all" ? [selectedStock] : [];
      const response = await fetch("/api/ai-predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbols, timeframe, format: "html" })
      });
      if (response.ok) {
        const data = await response.json();
        setPredictions(data.predictions || []);
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
          timeHorizon: "1 year",
          format: "html"
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
    if (!selectedStock || selectedStock === "all" || loading) return;
    setLoading(true);
    try {
      const response = await fetch("/api/ai-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          symbol: selectedStock,
          format: "html" // Request HTML format
        })
      });
      if (response.ok) {
        const data = await response.json();
        setAnalysisResult(data);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="space-y-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="mb-4 hover:bg-blue-100 dark:hover:bg-blue-900/50">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    AI Market Intelligence
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
                    Advanced AI-powered analysis for Pakistan Stock Exchange with real-time insights and predictive analytics
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchMarketInsights} variant="outline" size="sm" className="border-blue-200 hover:bg-blue-50">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" className="border-green-200 hover:bg-green-50">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-1">
            <TabsTrigger value="insights" className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-lg">
              <Lightbulb className="w-4 h-4" />
              Market Insights
            </TabsTrigger>
            <TabsTrigger value="predictions" className="flex items-center gap-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white rounded-lg">
              <Target className="w-4 h-4" />
              AI Predictions
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-2 data-[state=active]:bg-green-500 data-[state=active]:text-white rounded-lg">
              <PieChart className="w-4 h-4" />
              Portfolio Builder
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-lg">
              <BarChart3 className="w-4 h-4" />
              Stock Analysis
            </TabsTrigger>
          </TabsList>

          {/* Enhanced Market Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <Card className="border-2 border-blue-200 dark:border-blue-800 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-t-lg">
                <CardTitle className="flex items-center text-2xl">
                  <Bot className="w-6 h-6 mr-3 text-blue-600" />
                  Comprehensive Market Analysis
                  <Badge className="ml-auto bg-blue-100 text-blue-800 border-blue-200">Live Data</Badge>
                </CardTitle>
                <CardDescription className="text-lg">
                  AI-powered insights based on real-time PSX data with advanced analytics
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                {marketInsights ? (
                  <div className="space-y-8">
                    {/* Enhanced Market Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 border-green-200 hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-green-700 dark:text-green-300">Active Stocks</p>
                              <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-2">
                                {marketInsights.marketData.totalStocks}
                              </p>
                              <p className="text-xs text-green-600 mt-1">Currently Trading</p>
                            </div>
                            <div className="p-3 bg-green-100 dark:bg-green-800/30 rounded-full">
                              <Activity className="w-8 h-8 text-green-600" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-800/20 border-blue-200 hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Market Change</p>
                              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">
                                {formatPercent(parseFloat(marketInsights.marketData.avgChange || "0"))}
                              </p>
                              <p className="text-xs text-blue-600 mt-1">Average Movement</p>
                            </div>
                            <div className="p-3 bg-blue-100 dark:bg-blue-800/30 rounded-full">
                              <TrendingUp className="w-8 h-8 text-blue-600" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-800/20 border-purple-200 hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Total Volume</p>
                              <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-2">
                                {((marketInsights.marketData.totalVolume || 0) / 1000000).toFixed(1)}M
                              </p>
                              <p className="text-xs text-purple-600 mt-1">Shares Traded</p>
                            </div>
                            <div className="p-3 bg-purple-100 dark:bg-purple-800/30 rounded-full">
                              <BarChart3 className="w-8 h-8 text-purple-600" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-800/20 border-orange-200 hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Top Performers</p>
                              <p className="text-3xl font-bold text-orange-900 dark:text-orange-100 mt-2">
                                {marketInsights.marketData.topGainers?.length || 0}
                              </p>
                              <p className="text-xs text-orange-600 mt-1">Gaining Stocks</p>
                            </div>
                            <div className="p-3 bg-orange-100 dark:bg-orange-800/30 rounded-full">
                              <Star className="w-8 h-8 text-orange-600" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Enhanced AI Analysis with HTML Rendering */}
                    <Card className="border-2 border-gradient-to-r from-yellow-200 to-orange-200">
                      <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
                        <CardTitle className="flex items-center text-xl">
                          <Sparkles className="w-6 h-6 mr-3 text-yellow-600" />
                          AI Market Intelligence Report
                          <Badge className="ml-auto bg-yellow-100 text-yellow-800">Enhanced Analysis</Badge>
                        </CardTitle>
                        <CardDescription>
                          Advanced AI analysis with specific stock recommendations and market predictions
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-8">
                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-xl p-6">
                          {marketInsights.insight.includes('<') ? 
                            renderHTMLContent(marketInsights.insight) : 
                            (
                              <div className="prose prose-lg max-w-none dark:prose-invert">
                                {marketInsights.insight.split('\n').map((paragraph, idx) => (
                                  paragraph.trim() && (
                                    <p key={idx} className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                                      {paragraph.trim()}
                                    </p>
                                  )
                                ))}
                              </div>
                            )
                          }
                        </div>
                      </CardContent>
                    </Card>

                    {/* Enhanced Top Performers with Better Styling */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <Card className="border-2 border-green-200 hover:border-green-300 transition-all duration-300">
                        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                          <CardTitle className="flex items-center text-green-700 dark:text-green-400">
                            <TrendingUp className="w-5 h-5 mr-2" />
                            Top Gainers Today
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            {marketInsights.marketData.topGainers?.slice(0, 5).map((stock, idx) => (
                              <div key={stock.symbol} className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors duration-200 border border-green-100">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                    {idx + 1}
                                  </div>
                                  <div>
                                    <p className="font-bold text-gray-900 dark:text-white">{stock.symbol}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {stock.name?.substring(0, 25)}...
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-green-600 text-lg">{formatPercent(stock.changePercent)}</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {formatCurrency(stock.currentPrice)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-2 border-red-200 hover:border-red-300 transition-all duration-300">
                        <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50">
                          <CardTitle className="flex items-center text-red-700 dark:text-red-400">
                            <TrendingDown className="w-5 h-5 mr-2" />
                            Top Losers Today
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            {marketInsights.marketData.topLosers?.slice(0, 5).map((stock, idx) => (
                              <div key={stock.symbol} className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200 border border-red-100">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                    {idx + 1}
                                  </div>
                                  <div>
                                    <p className="font-bold text-gray-900 dark:text-white">{stock.symbol}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {stock.name?.substring(0, 25)}...
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-red-600 text-lg">{formatPercent(stock.changePercent)}</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {formatCurrency(stock.currentPrice)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="animate-spin">
                      <Brain className="w-12 h-12 text-blue-600 mb-4" />
                    </div>
                    <p className="text-lg font-medium text-gray-600">Generating comprehensive market analysis...</p>
                    <p className="text-sm text-gray-500 mt-2">Analyzing real-time data from Pakistan Stock Exchange</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced AI Predictions Tab */}
          <TabsContent value="predictions" className="space-y-6">
            <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50">
                <CardTitle className="flex items-center text-2xl">
                  <Target className="w-6 h-6 mr-3 text-purple-600" />
                  AI Future Predictions
                  <Badge className="ml-auto bg-purple-100 text-purple-800">Machine Learning</Badge>
                </CardTitle>
                <CardDescription className="text-lg">
                  Advanced ML-powered price forecasts with confidence intervals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Search & Select Stock</label>
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
                      <SelectTrigger className="bg-white border-purple-200">
                        <SelectValue placeholder="All top performers" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Top Performers</SelectItem>
                        {filteredStocks?.slice(0, 20).map((stock) => (
                          stock.symbol && stock.symbol.trim() ? (
                            <SelectItem key={stock.symbol} value={stock.symbol}>
                              {stock.symbol} - {stock.name?.substring(0, 30)}
                            </SelectItem>
                          ) : null
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Prediction Timeframe</label>
                    <Select value={timeframe} onValueChange={setTimeframe}>
                      <SelectTrigger className="bg-white border-purple-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1week">1 Week Forecast</SelectItem>
                        <SelectItem value="1month">1 Month Forecast</SelectItem>
                        <SelectItem value="3months">3 Months Forecast</SelectItem>
                        <SelectItem value="6months">6 Months Forecast</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={fetchPredictions} 
                      disabled={loading} 
                      className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 shadow-lg"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                      Generate AI Predictions
                    </Button>
                  </div>
                </div>

                {predictions.length > 0 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {predictions.map((prediction, idx) => (
                        <Card key={prediction.symbol} className="border-l-4 border-l-purple-500 hover:shadow-xl transition-all duration-300 bg-white">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-xl text-purple-900">{prediction.symbol}</CardTitle>
                                <CardDescription className="text-gray-600">{prediction.name}</CardDescription>
                              </div>
                              <div className="text-right">
                                <Badge 
                                  variant={prediction.risk === "Low" ? "default" : prediction.risk === "Medium" ? "secondary" : "destructive"}
                                  className="mb-2"
                                >
                                  {prediction.confidence}% Confidence
                                </Badge>
                                <p className="text-xs text-gray-500">{timeframe} forecast</p>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="bg-purple-50 rounded-lg p-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Current Price</span>
                                  <p className="font-bold text-lg">{formatCurrency(prediction.currentPrice)}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600">Predicted Range</span>
                                  <p className="font-bold text-lg text-purple-600">
                                    {formatCurrency(prediction.predictedLow)} - {formatCurrency(prediction.predictedHigh)}
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <span className="text-sm font-medium text-gray-700 block mb-2">Key Factors</span>
                              <div className="space-y-1">
                                {prediction.factors.slice(0, 3).map((factor, i) => (
                                  <p key={i} className="text-xs text-gray-600 flex items-start">
                                    <ChevronRight className="w-3 h-3 mr-1 mt-0.5 text-purple-500" />
                                    {factor}
                                  </p>
                                ))}
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between pt-2">
                              <Badge 
                                variant="outline" 
                                className={`${
                                  prediction.risk === "Low" ? "border-green-500 text-green-700 bg-green-50" :
                                  prediction.risk === "Medium" ? "border-yellow-500 text-yellow-700 bg-yellow-50" :
                                  "border-red-500 text-red-700 bg-red-50"
                                }`}
                              >
                                {prediction.risk} Risk
                              </Badge>
                              <Button variant="ghost" size="sm" className="text-purple-600 hover:bg-purple-50">
                                <Eye className="w-4 h-4 mr-1" />
                                Details
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced Portfolio Builder Tab */}
          <TabsContent value="portfolio" className="space-y-6">
            <Card className="bg-white/90 backdrop-blur-sm border-2 border-green-200">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="flex items-center text-2xl">
                  <PieChart className="w-6 h-6 mr-3 text-green-600" />
                  AI Portfolio Builder
                  <Badge className="ml-auto bg-green-100 text-green-800">Smart Allocation</Badge>
                </CardTitle>
                <CardDescription className="text-lg">
                  Personalized investment recommendations with risk-adjusted returns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Risk Profile</label>
                    <Select value={riskLevel} onValueChange={setRiskLevel}>
                      <SelectTrigger className="bg-white border-green-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">🛡️ Conservative (Low Risk)</SelectItem>
                        <SelectItem value="medium">⚖️ Balanced (Medium Risk)</SelectItem>
                        <SelectItem value="high">🚀 Aggressive (High Risk)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Investment Amount (PKR)</label>
                    <Input
                      type="number"
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(e.target.value)}
                      placeholder="100000"
                      className="bg-white border-green-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Investment Horizon</label>
                    <Select defaultValue="1year">
                      <SelectTrigger className="bg-white border-green-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6months">6 Months</SelectItem>
                        <SelectItem value="1year">1 Year</SelectItem>
                        <SelectItem value="3years">3 Years</SelectItem>
                        <SelectItem value="5years">5+ Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={fetchPortfolio} 
                      disabled={loading} 
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Shield className="w-4 h-4 mr-2" />}
                      Build Smart Portfolio
                    </Button>
                  </div>
                </div>

                {portfolio && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Enhanced Sector Allocation Chart */}
                      <Card className="border-2 border-green-200">
                        <CardHeader>
                          <CardTitle className="text-xl flex items-center">
                            <PieChart className="w-5 h-5 mr-2 text-green-600" />
                            Sector Allocation
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-64 mb-6">
                            <ResponsiveContainer width="100%" height="100%">
                              <RechartsPieChart>
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <RechartsPieChart
                                  data={Object.entries(portfolio.allocation).map(([sector, percent]) => ({ 
                                    name: sector, 
                                    value: percent 
                                  }))}
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={80}
                                  dataKey="value"
                                >
                                  {Object.entries(portfolio.allocation).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                  ))}
                                </RechartsPieChart>
                              </RechartsPieChart>
                            </ResponsiveContainer>
                          </div>
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
                                <span className="font-bold text-green-600">{percent}%</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Enhanced Portfolio Summary */}
                      <Card className="border-2 border-green-200">
                        <CardHeader>
                          <CardTitle className="text-xl flex items-center">
                            <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                            Portfolio Summary
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-green-50 rounded-xl">
                              <p className="text-sm text-green-700">Expected Return</p>
                              <p className="text-2xl font-bold text-green-800">{portfolio.expectedReturn}</p>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-xl">
                              <p className="text-sm text-blue-700">Investment</p>
                              <p className="text-2xl font-bold text-blue-800">
                                {formatCurrency(parseInt(investmentAmount))}
                              </p>
                            </div>
                          </div>
                          
                          <Alert className="border-green-200 bg-green-50">
                            <Shield className="w-4 h-4" />
                            <AlertDescription className="text-green-800">
                              {portfolio.riskAssessment.includes('<') ? 
                                renderHTMLContent(portfolio.riskAssessment) : 
                                portfolio.riskAssessment
                              }
                            </AlertDescription>
                          </Alert>

                          <div className="flex gap-2">
                            <Button variant="outline" className="flex-1 border-green-200 text-green-700 hover:bg-green-50">
                              <Bookmark className="w-4 h-4 mr-2" />
                              Save Portfolio
                            </Button>
                            <Button variant="outline" className="flex-1 border-green-200 text-green-700 hover:bg-green-50">
                              <Share2 className="w-4 h-4 mr-2" />
                              Share
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Enhanced Stock Recommendations */}
                    <Card className="border-2 border-green-200">
                      <CardHeader>
                        <CardTitle className="text-xl flex items-center">
                          <Star className="w-5 h-5 mr-2 text-green-600" />
                          Recommended Stocks
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {portfolio.recommendations.map((stock, idx) => (
                            <div key={stock.symbol} className="p-6 border-2 border-green-100 rounded-xl hover:border-green-300 transition-all duration-300 bg-white hover:shadow-lg">
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-lg text-gray-900">{stock.symbol}</h3>
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                  {stock.allocation}%
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-3 font-medium">{stock.name}</p>
                              <p className="text-xs text-gray-500 leading-relaxed">
                                {stock.rationale.includes('<') ? 
                                  renderHTMLContent(stock.rationale) : 
                                  stock.rationale
                                }
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced Stock Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <Card className="bg-white/90 backdrop-blur-sm border-2 border-orange-200">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
                <CardTitle className="flex items-center text-2xl">
                  <BarChart3 className="w-6 h-6 mr-3 text-orange-600" />
                  Individual Stock Analysis
                  <Badge className="ml-auto bg-orange-100 text-orange-800">Deep Dive</Badge>
                </CardTitle>
                <CardDescription className="text-lg">
                  Comprehensive AI analysis with technical and fundamental insights
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Search & Select Stock</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search stocks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-orange-200"
                      />
                    </div>
                    <Select value={selectedStock} onValueChange={setSelectedStock}>
                      <SelectTrigger className="bg-white border-orange-200">
                        <SelectValue placeholder="Choose a stock to analyze" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredStocks?.slice(0, 50).map((stock) => (
                          stock.symbol && stock.symbol.trim() ? (
                            <SelectItem key={stock.symbol} value={stock.symbol}>
                              {stock.symbol} - {stock.name?.substring(0, 40)}
                            </SelectItem>
                          ) : null
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={analyzeStock} 
                      disabled={!selectedStock || selectedStock === "all" || loading} 
                      className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-lg"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                      Analyze Stock
                    </Button>
                  </div>
                </div>

                {analysisResult && (
                  <Card className="border-l-4 border-l-orange-500 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
                      <CardTitle className="flex items-center justify-between text-xl">
                        <span className="flex items-center">
                          <BarChart3 className="w-5 h-5 mr-2 text-orange-600" />
                          Analysis for {analysisResult.symbol}
                        </span>
                        <Badge 
                          variant={analysisResult.recommendation?.includes("BUY") ? "default" : 
                                  analysisResult.recommendation?.includes("SELL") ? "destructive" : "secondary"}
                          className="text-lg px-4 py-1"
                        >
                          {analysisResult.recommendation?.split(' ')[0] || 'HOLD'}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 p-8">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-blue-700">Target Price</p>
                              <p className="text-3xl font-bold text-blue-900 mt-2">
                                {formatCurrency(analysisResult.targetPrice)}
                              </p>
                            </div>
                            <Target className="w-8 h-8 text-blue-600" />
                          </div>
                        </div>
                        <div className="p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-purple-700">AI Confidence</p>
                              <p className="text-3xl font-bold text-purple-900 mt-2">
                                {analysisResult.confidence}%
                              </p>
                            </div>
                            <Brain className="w-8 h-8 text-purple-600" />
                          </div>
                        </div>
                        <div className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-orange-700">Risk Level</p>
                              <p className="text-3xl font-bold text-orange-900 mt-2">
                                {analysisResult.riskLevel}
                              </p>
                            </div>
                            <AlertTriangle className="w-8 h-8 text-orange-600" />
                          </div>
                        </div>
                      </div>
                      
                      <Card className="border-2 border-gray-200">
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Lightbulb className="w-5 h-5 mr-2 text-yellow-600" />
                            AI Analysis Report
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6">
                            {analysisResult.analysis?.includes('<') ? 
                              renderHTMLContent(analysisResult.analysis) : 
                              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
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
