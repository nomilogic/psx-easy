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
  Loader2
} from "lucide-react";
import { Link } from "wouter";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ResponsiveContainer, PieChart as RechartsPieChart, Cell, BarChart, Bar, XAxis, YAxis, LineChart, Line } from 'recharts';

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
  
  const [marketInsights, setMarketInsights] = useState<MarketInsight | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const { data: stocks } = useQuery<Stock[]>({
    queryKey: ["/api/stocks"],
  });

  // Auto-load market insights on component mount
  useEffect(() => {
    fetchMarketInsights();
  }, []);

  const fetchMarketInsights = async () => {
    try {
      const response = await fetch("/api/market-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "comprehensive" })
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
      const symbols = selectedStock ? [selectedStock] : [];
      const response = await fetch("/api/ai-predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbols, timeframe })
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
    if (!selectedStock || loading) return;
    setLoading(true);
    try {
      const response = await fetch("/api/ai-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: selectedStock })
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/">
                <Button variant="ghost" size="sm" className="mb-4">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                <Brain className="w-10 h-10 mr-3 text-blue-600" />
                AI Market Analysis
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Real-time AI-powered insights for Pakistan Stock Exchange
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchMarketInsights} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Market Insights
            </TabsTrigger>
            <TabsTrigger value="predictions" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              AI Predictions
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Portfolio Builder
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Stock Analysis
            </TabsTrigger>
          </TabsList>

          {/* Market Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <Card className="border-2 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Bot className="w-6 h-6 mr-3 text-blue-600" />
                  Comprehensive Market Analysis
                </CardTitle>
                <CardDescription>
                  AI-powered insights based on real-time PSX data
                </CardDescription>
              </CardHeader>
              <CardContent>
                {marketInsights ? (
                  <div className="space-y-6">
                    {/* Market Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-green-700 dark:text-green-300">Total Stocks</p>
                              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                                {marketInsights.marketData.totalStocks}
                              </p>
                            </div>
                            <Activity className="w-8 h-8 text-green-600" />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-blue-700 dark:text-blue-300">Avg Change</p>
                              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                {formatPercent(parseFloat(marketInsights.marketData.avgChange || "0"))}
                              </p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-blue-600" />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-purple-700 dark:text-purple-300">Total Volume</p>
                              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                                {((marketInsights.marketData.totalVolume || 0) / 1000000).toFixed(1)}M
                              </p>
                            </div>
                            <BarChart3 className="w-8 h-8 text-purple-600" />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-orange-700 dark:text-orange-300">Top Gainers</p>
                              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                                {marketInsights.marketData.topGainers?.length || 0}
                              </p>
                            </div>
                            <Star className="w-8 h-8 text-orange-600" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* AI Analysis */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Sparkles className="w-5 h-5 mr-2 text-yellow-600" />
                          AI Market Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          {marketInsights.insight.split('\n').map((paragraph, idx) => (
                            paragraph.trim() && (
                              <p key={idx} className="mb-3 text-gray-700 dark:text-gray-300">
                                {paragraph.trim()}
                              </p>
                            )
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Top Performers */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center text-green-700 dark:text-green-400">
                            <TrendingUp className="w-5 h-5 mr-2" />
                            Top Gainers
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {marketInsights.marketData.topGainers?.slice(0, 5).map((stock, idx) => (
                              <div key={stock.symbol} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <div>
                                  <p className="font-semibold text-gray-900 dark:text-white">{stock.symbol}</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {stock.name?.substring(0, 25)}...
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-green-600">{formatPercent(stock.changePercent)}</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {formatCurrency(stock.currentPrice)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center text-red-700 dark:text-red-400">
                            <TrendingDown className="w-5 h-5 mr-2" />
                            Top Losers
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {marketInsights.marketData.topLosers?.slice(0, 5).map((stock, idx) => (
                              <div key={stock.symbol} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <div>
                                  <p className="font-semibold text-gray-900 dark:text-white">{stock.symbol}</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {stock.name?.substring(0, 25)}...
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-red-600">{formatPercent(stock.changePercent)}</p>
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
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin mr-3" />
                    <p>Loading comprehensive market analysis...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Predictions Tab */}
          <TabsContent value="predictions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-6 h-6 mr-3 text-purple-600" />
                  AI Future Predictions
                </CardTitle>
                <CardDescription>
                  Machine learning-powered price forecasts based on real market data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">Select Stock (Optional)</label>
                    <Select value={selectedStock} onValueChange={setSelectedStock}>
                      <SelectTrigger>
                        <SelectValue placeholder="All top performers" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Top Performers</SelectItem>
                        {stocks?.slice(0, 20).map((stock) => (
                          <SelectItem key={stock.symbol} value={stock.symbol}>
                            {stock.symbol} - {stock.name?.substring(0, 30)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">Timeframe</label>
                    <Select value={timeframe} onValueChange={setTimeframe}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1week">1 Week</SelectItem>
                        <SelectItem value="1month">1 Month</SelectItem>
                        <SelectItem value="3months">3 Months</SelectItem>
                        <SelectItem value="6months">6 Months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={fetchPredictions} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    Generate Predictions
                  </Button>
                </div>

                {predictions.length > 0 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {predictions.map((prediction, idx) => (
                        <Card key={prediction.symbol} className="border-l-4 border-l-purple-500">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-lg">{prediction.symbol}</CardTitle>
                                <CardDescription>{prediction.name}</CardDescription>
                              </div>
                              <Badge variant={prediction.risk === "Low" ? "default" : prediction.risk === "Medium" ? "secondary" : "destructive"}>
                                {prediction.confidence}% Confidence
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Current Price</span>
                              <span className="font-semibold">{formatCurrency(prediction.currentPrice)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Predicted Range</span>
                              <span className="font-semibold text-purple-600">
                                {formatCurrency(prediction.predictedLow)} - {formatCurrency(prediction.predictedHigh)}
                              </span>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600 dark:text-gray-400 block mb-1">Key Factors</span>
                              <div className="space-y-1">
                                {prediction.factors.slice(0, 2).map((factor, i) => (
                                  <p key={i} className="text-xs text-gray-700 dark:text-gray-300">• {factor}</p>
                                ))}
                              </div>
                            </div>
                            <Badge variant="outline" className={`w-full justify-center ${
                              prediction.risk === "Low" ? "border-green-500 text-green-700" :
                              prediction.risk === "Medium" ? "border-yellow-500 text-yellow-700" :
                              "border-red-500 text-red-700"
                            }`}>
                              {prediction.risk} Risk
                            </Badge>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Portfolio Builder Tab */}
          <TabsContent value="portfolio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="w-6 h-6 mr-3 text-green-600" />
                  AI Portfolio Builder
                </CardTitle>
                <CardDescription>
                  Get personalized investment recommendations based on real market data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Risk Level</label>
                    <Select value={riskLevel} onValueChange={setRiskLevel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Conservative (Low Risk)</SelectItem>
                        <SelectItem value="medium">Balanced (Medium Risk)</SelectItem>
                        <SelectItem value="high">Aggressive (High Risk)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Investment Amount (PKR)</label>
                    <Input
                      type="number"
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(e.target.value)}
                      placeholder="100000"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={fetchPortfolio} disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                      Build Portfolio
                    </Button>
                  </div>
                </div>

                {portfolio && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Sector Allocation Chart */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Sector Allocation</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ChartContainer config={{}} className="h-64">
                            <ResponsiveContainer>
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
                          </ChartContainer>
                          <div className="mt-4 space-y-2">
                            {Object.entries(portfolio.allocation).map(([sector, percent], idx) => (
                              <div key={sector} className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div 
                                    className="w-3 h-3 rounded-full mr-2" 
                                    style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                                  />
                                  <span className="text-sm">{sector}</span>
                                </div>
                                <span className="text-sm font-semibold">{percent}%</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Portfolio Summary */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Portfolio Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-green-700 dark:text-green-300">Expected Return</span>
                              <span className="font-bold text-green-800 dark:text-green-200">{portfolio.expectedReturn}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-green-700 dark:text-green-300">Investment Amount</span>
                              <span className="font-bold text-green-800 dark:text-green-200">
                                {formatCurrency(parseInt(investmentAmount))}
                              </span>
                            </div>
                          </div>
                          
                          <Alert>
                            <Shield className="w-4 h-4" />
                            <AlertDescription>
                              {portfolio.riskAssessment}
                            </AlertDescription>
                          </Alert>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Stock Recommendations */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Recommended Stocks</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {portfolio.recommendations.map((stock, idx) => (
                            <div key={stock.symbol} className="p-4 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold">{stock.symbol}</h3>
                                <Badge variant="secondary">{stock.allocation}%</Badge>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{stock.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-500">{stock.rationale}</p>
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

          {/* Stock Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-6 h-6 mr-3 text-blue-600" />
                  Individual Stock Analysis
                </CardTitle>
                <CardDescription>
                  Deep AI analysis of specific stocks with real market data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">Select Stock</label>
                    <Select value={selectedStock} onValueChange={setSelectedStock}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a stock to analyze" />
                      </SelectTrigger>
                      <SelectContent>
                        {stocks?.slice(0, 50).map((stock) => (
                          <SelectItem key={stock.symbol} value={stock.symbol}>
                            {stock.symbol} - {stock.name?.substring(0, 40)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={analyzeStock} disabled={!selectedStock || loading} className="bg-blue-600 hover:bg-blue-700">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                    Analyze Stock
                  </Button>
                </div>

                {analysisResult && (
                  <Card className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Analysis for {analysisResult.symbol}</span>
                        <Badge variant={analysisResult.recommendation === "BUY" ? "default" : 
                                      analysisResult.recommendation === "SELL" ? "destructive" : "secondary"}>
                          {analysisResult.recommendation}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-blue-700 dark:text-blue-300">Target Price</span>
                            <span className="font-bold text-blue-900 dark:text-blue-100">
                              {formatCurrency(analysisResult.targetPrice)}
                            </span>
                          </div>
                        </div>
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-purple-700 dark:text-purple-300">Confidence</span>
                            <span className="font-bold text-purple-900 dark:text-purple-100">
                              {analysisResult.confidence}%
                            </span>
                          </div>
                        </div>
                        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-orange-700 dark:text-orange-300">Risk Level</span>
                            <span className="font-bold text-orange-900 dark:text-orange-100">
                              {analysisResult.riskLevel}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <h4>AI Analysis</h4>
                        <p className="text-gray-700 dark:text-gray-300">{analysisResult.analysis}</p>
                      </div>
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