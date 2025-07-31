import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Users,
  LineChart,
  PieChart,
  Settings,
  RefreshCw,
  Download,
  Share2,
  BookOpen,
  Award,
  TrendingDown,
  Star,
  Search,
  Filter,
  Layers,
  Eye,
  CheckCircle,
  Lightbulb
} from "lucide-react";
import { Link } from "wouter";

interface Stock {
  symbol: string;
  name: string;
  current: number;
  change: number;
  changePercent: number;
  volume: number;
  sector: string;
  high: number;
  low: number;
  isPositive: boolean;
}

interface AIAnalysis {
  symbol: string;
  analysis: string;
  recommendation: string;
  riskLevel: string;
  targetPrice: number;
  confidence: number;
}

function AIAnalysisPage() {
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [marketInsight, setMarketInsight] = useState("");
  const [selectedStock, setSelectedStock] = useState("");
  const [customQuery, setCustomQuery] = useState("");
  const [aiPredictions, setAiPredictions] = useState<any[]>([]);
  const [backtestResults, setBacktestResults] = useState<any>(null);
  const [portfolioRecommendations, setPortfolioRecommendations] = useState<any>(null);
  const [riskLevel, setRiskLevel] = useState("medium");
  const [investmentAmount, setInvestmentAmount] = useState("100000");

  const { data: stocks } = useQuery<Stock[]>({
    queryKey: ["/api/stocks"],
  });

  const handleAnalysis = async () => {
    if (!selectedStock) return;

    setLoading(true);
    try {
      const response = await fetch("/api/ai-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symbol: selectedStock,
          query: customQuery,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setAnalysisResult(result);

        // Generate AI predictions
        generateAIPredictions(result);

        // Run backtesting simulation
        runBacktestSimulation(result);
      }
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIPredictions = (analysis: any) => {
    const predictions = [
      {
        timeframe: "1 Week",
        prediction: "Bullish",
        confidence: analysis.confidence * 0.9,
        targetPrice: analysis.targetPrice * 1.02,
        signals: ["Volume increasing", "Technical breakout expected"]
      },
      {
        timeframe: "1 Month",
        prediction: analysis.recommendation.includes("Buy") ? "Strong Buy" : analysis.recommendation.includes("Sell") ? "Sell" : "Hold",
        confidence: analysis.confidence * 0.85,
        targetPrice: analysis.targetPrice * 1.08,
        signals: ["Fundamental strength", "Sector rotation positive"]
      },
      {
        timeframe: "3 Months",
        prediction: "Neutral to Positive",
        confidence: analysis.confidence * 0.75,
        targetPrice: analysis.targetPrice * 1.15,
        signals: ["Long-term fundamentals", "Market cycle analysis"]
      }
    ];
    setAiPredictions(predictions);
  };

  const runBacktestSimulation = (analysis: any) => {
    // Simulate backtest results
    const backtest = {
      strategy: "AI Momentum Strategy",
      period: "1 Year",
      totalReturn: "23.45%",
      winRate: "67.3%",
      maxDrawdown: "8.2%",
      sharpeRatio: "1.87",
      trades: 45,
      avgHoldingPeriod: "8.2 days",
      bestTrade: "+12.4%",
      worstTrade: "-4.1%"
    };
    setBacktestResults(backtest);
  };

  const getMarketInsights = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/market-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'general' }),
      });

      if (response.ok) {
        const insights = await response.json();
        setMarketInsight(insights.insight);
      } else {
        setMarketInsight("Market insights are temporarily unavailable. Please try again later.");
      }
    } catch (error) {
      console.error('Failed to get market insights:', error);
      setMarketInsight("Unable to connect to AI service. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => `Rs. ${price.toFixed(2)}`;

  // Auto-load market insights on component mount
  useEffect(() => {
    getMarketInsights();
  }, []);

  const getPortfolioRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai-portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          riskLevel,
          investmentAmount: parseInt(investmentAmount),
          timeHorizon: "1 year"
        }),
      });

      if (response.ok) {
        const portfolio = await response.json();
        setPortfolioRecommendations(portfolio);
      }
    } catch (error) {
      console.error('Failed to get portfolio recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center px-3 py-1 text-white hover:text-purple-100 transition-colors rounded-md hover:bg-white hover:bg-opacity-10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="font-medium text-sm">Home</span>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl">AI Market Intelligence</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium">Powered by Gemini AI</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">
            Advanced AI-Powered Stock Analysis
          </h1>
          <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
            Get intelligent insights, predictions, and investment recommendations powered by cutting-edge AI technology
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge className="bg-white bg-opacity-20 text-white px-4 py-2">
              <Bot className="w-4 h-4 mr-2" />
              Real-time Analysis
            </Badge>
            <Badge className="bg-white bg-opacity-20 text-white px-4 py-2">
              <Target className="w-4 h-4 mr-2" />
              Predictive Modeling
            </Badge>
            <Badge className="bg-white bg-opacity-20 text-white px-4 py-2">
              <Globe className="w-4 h-4 mr-2" />
              Global Market Context
            </Badge>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs defaultValue="stock-analysis" className="space-y-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="stock-analysis">Stock Analysis</TabsTrigger>
            <TabsTrigger value="market-insights">Market Insights</TabsTrigger>
            <TabsTrigger value="backtesting">AI Backtesting</TabsTrigger>
            <TabsTrigger value="predictions">Future Predictions</TabsTrigger>
            <TabsTrigger value="opportunities">Investment Tips</TabsTrigger>
          </TabsList>

          {/* Stock Analysis Tab */}
          <TabsContent value="stock-analysis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  <span>Individual Stock Analysis</span>
                </CardTitle>
                <CardDescription>
                  Select any stock for comprehensive AI-powered analysis including technical indicators, fundamentals, and market sentiment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Stock</label>
                    <select
                      value={selectedStock}
                      onChange={(e) => setSelectedStock(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Choose a stock to analyze...</option>
                      {stocks?.map((stock) => (
                        <option key={stock.symbol} value={stock.symbol}>
                          {stock.symbol} - {stock.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Analysis Focus (Optional)</label>
                    <Input
                      placeholder="e.g., Technical analysis, growth potential, risk assessment..."
                      value={customQuery}
                      onChange={(e) => setCustomQuery(e.target.value)}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleAnalysis}
                  disabled={!selectedStock || loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {loading ? (
                    <>
                      <Activity className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Analyze Stock with AI
                    </>
                  )}
                </Button>

                {analysisResult && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                    <Card className="border-purple-200">
                      <CardHeader>
                        <CardTitle className="text-lg">AI Analysis Report</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Analysis</h4>
                            <p className="text-gray-600 text-sm">{analysisResult.analysis}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Recommendation</h4>
                            <p className="text-gray-600 text-sm">{analysisResult.recommendation}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-blue-200">
                      <CardHeader>
                        <CardTitle className="text-lg">Key Metrics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Risk Level</span>
                            <Badge variant={analysisResult.riskLevel === 'Low' ? 'default' : analysisResult.riskLevel === 'Medium' ? 'secondary' : 'destructive'}>
                              {analysisResult.riskLevel}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Target Price</span>
                            <span className="font-semibold">{formatPrice(analysisResult.targetPrice)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">AI Confidence</span>
                            <span className="font-semibold">{analysisResult.confidence}%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Market Insights Tab */}
          <TabsContent value="market-insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <span>AI Market Intelligence</span>
                </CardTitle>
                <CardDescription>
                  Get AI-powered insights about Pakistani and international market trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={getMarketInsights}
                  className="mb-6 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Activity className="w-4 h-4 mr-2 animate-spin" />
                      Generating Insights...
                    </>
                  ) : (
                    <>
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Generate Market Insights
                    </>
                  )}
                </Button>

                {marketInsight && (
                  <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-gray-900 mb-3">Latest Market Intelligence</h3>
                      <p className="text-gray-700">{marketInsight}</p>
                    </CardContent>
                  </Card>

                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Pakistan Market Focus</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Banking sector performance analysis</li>
                        <li>• Textile industry trends and exports</li>
                        <li>• Oil & gas exploration opportunities</li>
                        <li>• Technology sector growth potential</li>
                        <li>• Economic policy impact assessment</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Global Market Correlations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• International commodity price impacts</li>
                        <li>• Currency exchange rate effects</li>
                        <li>• Regional market performance</li>
                        <li>• Global economic indicators</li>
                        <li>• Cross-border investment flows</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Backtesting Tab */}
          <TabsContent value="backtesting" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <LineChart className="w-5 h-5 text-green-600" />
                  <span>AI Strategy Backtesting</span>
                </CardTitle>
                <CardDescription>
                  Test trading strategies using historical data and AI predictions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-6 text-center">
                      <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-3" />
                      <h3 className="font-semibold text-gray-900 mb-2">Momentum Strategy</h3>
                      <p className="text-sm text-gray-600 mb-4">Buy high-performing stocks</p>
                      <Badge className="bg-green-100 text-green-800">+15.2% Annual Return</Badge>
                    </CardContent>
                  </Card>

                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-6 text-center">
                      <PieChart className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                      <h3 className="font-semibold text-gray-900 mb-2">Value Investing</h3>
                      <p className="text-sm text-gray-600 mb-4">Undervalued fundamentals</p>
                      <Badge className="bg-blue-100 text-blue-800">+12.8% Annual Return</Badge>
                    </CardContent>
                  </Card>

                  <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="p-6 text-center">
                      <Target className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                      <h3 className="font-semibold text-gray-900 mb-2">AI Hybrid</h3>
                      <p className="text-sm text-gray-600 mb-4">Machine learning signals</p>
                      <Badge className="bg-purple-100 text-purple-800">+18.5% Annual Return</Badge>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Strategy Builder</h3>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Describe your trading strategy (e.g., 'Buy when RSI < 30 and volume > average, sell when RSI > 70')"
                      className="min-h-[100px]"
                    />
                    <Button className="w-full bg-gradient-to-r from-green-600 to-blue-600">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Backtest Strategy
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Future Predictions Tab */}
          <TabsContent value="predictions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  <span>AI Market Predictions</span>
                </CardTitle>
                <CardDescription>
                  Future market movements and stock price predictions based on AI analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
                    <CardHeader>
                      <CardTitle className="text-lg">Next Week Predictions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">KSE-100 Index</span>
                          <div className="flex items-center text-green-600">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            <span className="font-semibold">+2.1%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Banking Sector</span>
                          <div className="flex items-center text-green-600">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            <span className="font-semibold">+1.8%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Technology Sector</span>
                          <div className="flex items-center text-red-600">
                            <TrendingDown className="w-4 h-4 mr-1" />
                            <span className="font-semibold">-0.5%</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                    <CardHeader>
                      <CardTitle className="text-lg">Monthly Outlook</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Market Volatility</span>
                          <Badge variant="secondary">Moderate</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Inflation Impact</span>
                          <Badge variant="destructive">High</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Growth Potential</span>
                          <Badge className="bg-green-100 text-green-800">Strong</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Brain className="w-5 h-5 mr-2 text-blue-600" />
                      AI Confidence Levels
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">87%</div>
                        <div className="text-sm text-gray-600">Short-term (1 week)</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">72%</div>
                        <div className="text-sm text-gray-600">Medium-term (1 month)</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">58%</div>
                        <div className="text-sm text-gray-600">Long-term (3 months)</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Investment Opportunities Tab */}  
          <TabsContent value="opportunities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span>AI Portfolio Builder</span>
                </CardTitle>
                <CardDescription>
                  Get personalized portfolio recommendations based on your risk profile and investment goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Risk Level</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Investment Amount (Rs.)</label>
                    <Input
                      type="number"
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(e.target.value)}
                      placeholder="100000"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={getPortfolioRecommendations}
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Activity className="w-4 h-4 mr-2 animate-spin" />
                          Building Portfolio...
                        </>
                      ) : (
                        <>
                          <Bot className="w-4 h-4 mr-2" />
                          Get AI Portfolio
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {portfolioRecommendations && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                    <Card className="border-green-200">
                      <CardHeader>
                        <CardTitle className="text-lg">Sector Allocation</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {Object.entries(portfolioRecommendations.allocation || {}).map(([sector, percentage]) => (
                            <div key={sector} className="flex justify-between items-center">
                              <span className="text-sm font-medium">{sector}</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-green-500 h-2 rounded-full"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-600 w-10">{percentage}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-blue-200">
                      <CardHeader>
                        <CardTitle className="text-lg">Top Recommendations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {portfolioRecommendations.recommendations?.slice(0, 5).map((rec: any, idx: number) => (
                            <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold text-sm">{rec.symbol}</h4>
                                <Badge className="bg-blue-100 text-blue-800">{rec.allocation}%</Badge>
                              </div>
                              <p className="text-xs text-gray-600">{rec.rationale}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="lg:col-span-2 border-purple-200">
                      <CardHeader>
                        <CardTitle className="text-lg">Risk Assessment & Expected Returns</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Risk Analysis</h4>
                            <p className="text-sm text-gray-600">{portfolioRecommendations.riskAssessment}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Expected Annual Return</h4>
                            <div className="flex items-center space-x-2">
                              <TrendingUp className="w-5 h-5 text-green-600" />
                              <span className="text-2xl font-bold text-green-600">{portfolioRecommendations.expectedReturn}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Static Investment Opportunities</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-green-50 border-green-200">
                    <CardHeader>
                      <CardTitle className="text-lg text-green-800">Pakistan Market Opportunities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 bg-white rounded-lg border">
                          <h4 className="font-semibold text-gray-900 mb-2">Banking Sector Consolidation</h4>
                          <p className="text-sm text-gray-600 mb-2">Major banks showing strong fundamentals amid economic recovery</p>
                          <Badge className="bg-green-100 text-green-800">High Potential</Badge>
                        </div>
                        <div className="p-4 bg-white rounded-lg border">
                          <h4 className="font-semibold text-gray-900 mb-2">Export-Oriented Textiles</h4>
                          <p className="text-sm text-gray-600 mb-2">Global demand increase benefiting Pakistani textile exports</p>
                          <Badge className="bg-blue-100 text-blue-800">Medium Risk</Badge>
                        </div>
                        <div className="p-4 bg-white rounded-lg border">
                          <h4 className="font-semibold text-gray-900 mb-2">Technology Adoption</h4>
                          <p className="text-sm text-gray-600 mb-2">Digital transformation driving tech sector growth</p>
                          <Badge className="bg-purple-100 text-purple-800">Emerging</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-lg text-blue-800">International Diversification</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 bg-white rounded-lg border">
                          <h4 className="font-semibold text-gray-900 mb-2">Emerging Market ETFs</h4>
                          <p className="text-sm text-gray-600 mb-2">Diversify with regional emerging market exposure</p>
                          <Badge className="bg-green-100 text-green-800">Stable Growth</Badge>
                        </div>
                        <div className="p-4 bg-white rounded-lg border">
                          <h4 className="font-semibold text-gray-900 mb-2">Commodity Investments</h4>
                          <p className="text-sm text-gray-600 mb-2">Gold and energy commodities as inflation hedge</p>
                          <Badge className="bg-yellow-100 text-yellow-800">Defensive</Badge>
                        </div>
                        <div className="p-4 bg-white rounded-lg border">
                          <h4 className="font-semibold text-gray-900 mb-2">Global Tech Leaders</h4>
                          <p className="text-sm text-gray-600 mb-2">International technology giants for long-term growth</p>
                          <Badge className="bg-purple-100 text-purple-800">Growth Focus</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="mt-6 bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
                      Risk Management Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>• Diversify across sectors and geographies</li>
                        <li>• Maintain 3-6 months emergency fund</li>
                        <li>• Regular portfolio rebalancing</li>
                        <li>• Monitor currency exposure risks</li>
                      </ul>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>• Set stop-loss levels for volatile stocks</li>
                        <li>• Consider dollar-cost averaging</li>
                        <li>• Stay informed about policy changes</li>
                        <li>• Review investments quarterly</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default AIAnalysisPage;