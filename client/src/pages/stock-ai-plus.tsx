
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  Brain,
  Zap,
  Bot,
  Target,
  DollarSign,
  Globe,
  Newspaper,
  ChevronRight,
  Play,
  Lightbulb,
  Clock,
  Users,
  Building,
  Percent,
  Eye,
  Star,
  Shield,
  Calendar,
  RefreshCw,
  PieChart,
  LineChart,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useWebSocket } from "@/hooks/use-websocket";

const formatCurrency = (amount: number) => `PKR ${amount.toLocaleString()}`;
const formatPercent = (percent: number) =>
  `${percent >= 0 ? "+" : ""}${percent.toFixed(2)}%`;

const CHART_COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4",
  "#F97316", "#84CC16", "#EC4899", "#6366F1", "#14B8A6", "#F43F5E"
];

interface StockAnalysisData {
  stocks: Array<{
    ticker: string;
    company_name: string;
    exchange: string;
    sector: string;
    country: string;
    currency: string;
    historical: {
      price: {
        start_price: number;
        end_price: number;
        change_percent: number;
        52_week_high: number;
        52_week_low: number;
        volatility_weekly_percent: string;
      };
      market_cap: {
        start: number;
        end: number;
        unit: string;
        change_percent: number;
      };
      financials: {
        revenue: Record<string, number>;
        net_income: Record<string, number>;
        EPS: Record<string, number>;
        margins: {
          net_profit_margin: number;
          gross_profit_margin: number;
        };
        ratios?: {
          ROE_percent: number;
          ROIC_percent: number;
          debt_to_equity: number;
          current_ratio: number;
          P_E: number;
          P_B: number;
          P_S: number;
        };
      };
      dividends: {
        annual_yield_percent: number;
        payouts: Array<{
          date: string;
          amount_percent: number;
        }>;
      };
      news: Array<{
        date: string;
        title: string;
        impact: string;
        summary: string;
      }>;
      notable_trends: string[];
    };
    forecast: {
      expected_price_range: {
        low: number;
        high: number;
        expected_average: number;
      };
      EPS_estimate: number;
      revenue_estimate: number;
      net_income_estimate: number;
      price_target: number;
      upside_percent: number;
      confidence_level: string;
    };
    technical_indicators: {
      rsi: number;
      moving_averages: {
        "50_day": number;
        "200_day": number;
      };
      macd: string;
      bollinger_bands: string;
      volume_average_30d: number;
      adx: number;
    };
    pattern_analysis: {
      detected_patterns: Array<{
        type: string;
        status: string;
        implication: string;
      }>;
    };
    analyst_sentiment: {
      recommendation: string;
      price_target_range: {
        low: number;
        average: number;
        high: number;
      };
      analysts_count: number;
      summary: string;
    };
    ai_insights: {
      trend_summary: string;
      short_term_analysis: {
        bias: string;
        support_levels: number[];
        resistance_levels: number[];
        volatility: string;
        momentum: string;
      };
      long_term_analysis: {
        trend: string;
        valuation: string;
        sector_performance: string;
        macro_impact: string;
        fundamental_strength: string;
      };
      key_growth_drivers: string[];
      potential_risks: string[];
      ai_rating: string;
      investment_type: string;
    };
    watchlist_tags: string[];
    alerts: Array<{
      type: string;
      condition: string;
      message: string;
    }>;
  }>;
}

export default function StockAIPlus() {
  const [selectedStock, setSelectedStock] = useState<string>("OGDC");
  const [selectedTab, setSelectedTab] = useState("overview");
  const { marketData: liveStocks } = useWebSocket();

  const { data: stockAnalysis, isLoading } = useQuery<StockAnalysisData>({
    queryKey: ["/api/stock-analysis"],
    queryFn: async () => {
      const response = await fetch("/server/stockAnalysis.json");
      if (!response.ok) {
        throw new Error("Failed to fetch stock analysis");
      }
      return response.json();
    },
    refetchInterval: 60000,
  });

  const currentStock = stockAnalysis?.stocks?.find(
    (stock) => stock.ticker === selectedStock
  );

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case "positive": return "text-green-600 bg-green-100";
      case "negative": return "text-red-600 bg-red-100";
      default: return "text-blue-600 bg-blue-100";
    }
  };

  const getBiasColor = (bias: string) => {
    switch (bias.toLowerCase()) {
      case "bullish": return "text-green-600 bg-green-100 border-green-300";
      case "bearish": return "text-red-600 bg-red-100 border-red-300";
      default: return "text-blue-600 bg-blue-100 border-blue-300";
    }
  };

  const getRatingColor = (rating: string) => {
    if (rating.includes("A")) return "text-green-600 bg-green-100";
    if (rating.includes("B")) return "text-blue-600 bg-blue-100";
    if (rating.includes("C")) return "text-orange-600 bg-orange-100";
    return "text-gray-600 bg-gray-100";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xl text-gray-600">Loading Stock AI+ Analysis...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <Brain className="w-16 h-16 mr-4 text-white" />
              <div>
                <h1 className="text-5xl font-bold mb-2">Stock AI+</h1>
                <p className="text-2xl text-blue-200">Advanced AI-Powered Stock Analysis</p>
              </div>
            </div>
            <p className="text-xl opacity-95 leading-relaxed max-w-3xl mx-auto">
              Comprehensive AI-driven analysis with real-time insights, technical indicators, 
              and predictive analytics for Pakistan Stock Exchange
            </p>
          </div>

          {/* Stock Selector */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="flex gap-4 flex-wrap justify-center">
                {stockAnalysis?.stocks?.map((stock) => (
                  <Button
                    key={stock.ticker}
                    variant={selectedStock === stock.ticker ? "secondary" : "outline"}
                    size="lg"
                    onClick={() => setSelectedStock(stock.ticker)}
                    className={`${
                      selectedStock === stock.ticker
                        ? "bg-white text-blue-600 hover:bg-blue-50"
                        : "border-white text-white hover:bg-white/20"
                    } text-lg px-8 py-3`}
                  >
                    <Building className="w-5 h-5 mr-2" />
                    {stock.ticker}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {currentStock && (
          <>
            {/* Stock Header */}
            <Card className="mb-8 border-2 border-blue-200 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 pb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-4xl font-bold text-gray-900 mb-2">
                      {currentStock.company_name}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-lg">
                      <Badge variant="outline" className="text-lg px-4 py-2">
                        {currentStock.ticker}
                      </Badge>
                      <Badge variant="outline" className="text-lg px-4 py-2">
                        {currentStock.exchange}
                      </Badge>
                      <Badge variant="outline" className="text-lg px-4 py-2">
                        {currentStock.sector}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-gray-900 mb-2">
                      {formatCurrency(currentStock.historical.price.end_price)}
                    </p>
                    <Badge
                      className={`text-lg px-4 py-2 ${
                        currentStock.historical.price.change_percent >= 0
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {currentStock.historical.price.change_percent >= 0 ? (
                        <TrendingUp className="w-5 h-5 mr-2" />
                      ) : (
                        <TrendingDown className="w-5 h-5 mr-2" />
                      )}
                      {formatPercent(currentStock.historical.price.change_percent)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Enhanced Tabs */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="grid w-full grid-cols-6 mb-8 bg-white shadow-lg p-2 rounded-2xl">
                <TabsTrigger value="overview" className="text-lg py-3">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="financials" className="text-lg py-3">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Financials
                </TabsTrigger>
                <TabsTrigger value="technical" className="text-lg py-3">
                  <Activity className="w-5 h-5 mr-2" />
                  Technical
                </TabsTrigger>
                <TabsTrigger value="ai-insights" className="text-lg py-3">
                  <Brain className="w-5 h-5 mr-2" />
                  AI Insights
                </TabsTrigger>
                <TabsTrigger value="news" className="text-lg py-3">
                  <Newspaper className="w-5 h-5 mr-2" />
                  News
                </TabsTrigger>
                <TabsTrigger value="forecast" className="text-lg py-3">
                  <Target className="w-5 h-5 mr-2" />
                  Forecast
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card className="border-2 border-green-200 shadow-xl">
                    <CardContent className="p-6 bg-gradient-to-br from-green-50 to-emerald-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-medium text-green-700 mb-2">52W High</p>
                          <p className="text-3xl font-bold text-green-900">
                            {formatCurrency(currentStock.historical.price["52_week_high"])}
                          </p>
                        </div>
                        <TrendingUp className="w-12 h-12 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-red-200 shadow-xl">
                    <CardContent className="p-6 bg-gradient-to-br from-red-50 to-rose-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-medium text-red-700 mb-2">52W Low</p>
                          <p className="text-3xl font-bold text-red-900">
                            {formatCurrency(currentStock.historical.price["52_week_low"])}
                          </p>
                        </div>
                        <TrendingDown className="w-12 h-12 text-red-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-blue-200 shadow-xl">
                    <CardContent className="p-6 bg-gradient-to-br from-blue-50 to-cyan-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-medium text-blue-700 mb-2">Market Cap</p>
                          <p className="text-3xl font-bold text-blue-900">
                            {currentStock.historical.market_cap.end}M
                          </p>
                        </div>
                        <Building className="w-12 h-12 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-purple-200 shadow-xl">
                    <CardContent className="p-6 bg-gradient-to-br from-purple-50 to-violet-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-medium text-purple-700 mb-2">Volatility</p>
                          <p className="text-3xl font-bold text-purple-900">
                            {currentStock.historical.price.volatility_weekly_percent}%
                          </p>
                        </div>
                        <Activity className="w-12 h-12 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Performance Metrics */}
                <Card className="border-2 border-orange-200 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
                    <CardTitle className="text-2xl flex items-center">
                      <BarChart3 className="w-8 h-8 mr-3 text-orange-600" />
                      Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-4">
                        <h4 className="text-xl font-bold text-gray-900">Price Performance</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                            <span className="text-lg font-medium">Current Price</span>
                            <span className="text-xl font-bold text-blue-600">
                              {formatCurrency(currentStock.historical.price.end_price)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                            <span className="text-lg font-medium">YTD Change</span>
                            <Badge className="text-lg px-4 py-2 bg-green-100 text-green-800">
                              {formatPercent(currentStock.historical.price.change_percent)}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl">
                            <span className="text-lg font-medium">Market Cap Change</span>
                            <Badge className="text-lg px-4 py-2 bg-purple-100 text-purple-800">
                              {formatPercent(currentStock.historical.market_cap.change_percent)}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-xl font-bold text-gray-900">Dividend Info</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
                            <span className="text-lg font-medium">Annual Yield</span>
                            <span className="text-xl font-bold text-orange-600">
                              {currentStock.historical.dividends.annual_yield_percent}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl">
                            <span className="text-lg font-medium">Total Payouts</span>
                            <span className="text-xl font-bold text-pink-600">
                              {currentStock.historical.dividends.payouts.length}
                            </span>
                          </div>
                          {currentStock.historical.dividends.payouts.length > 0 && (
                            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl">
                              <span className="text-lg font-medium">Last Payout</span>
                              <span className="text-xl font-bold text-indigo-600">
                                {currentStock.historical.dividends.payouts[0].amount_percent}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-xl font-bold text-gray-900">Watchlist & Tags</h4>
                        <div className="flex flex-wrap gap-3">
                          {currentStock.watchlist_tags.map((tag, index) => (
                            <Badge
                              key={index}
                              style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                              className="text-white text-lg px-4 py-2"
                            >
                              <Star className="w-4 h-4 mr-2" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Financials Tab */}
              <TabsContent value="financials" className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="border-2 border-green-200 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                      <CardTitle className="text-2xl flex items-center">
                        <DollarSign className="w-8 h-8 mr-3 text-green-600" />
                        Revenue & Earnings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        {Object.entries(currentStock.historical.financials.revenue).map(([year, revenue]) => (
                          <div key={year} className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-xl font-bold text-green-800">{year}</span>
                              <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">Revenue</Badge>
                            </div>
                            <p className="text-3xl font-bold text-green-900 mb-2">
                              {formatCurrency(revenue)}
                            </p>
                            <p className="text-lg text-green-700">
                              Net Income: {formatCurrency(currentStock.historical.financials.net_income[year] || 0)}
                            </p>
                            <p className="text-lg text-green-700">
                              EPS: {currentStock.historical.financials.EPS[year]?.toFixed(2) || 'N/A'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-blue-200 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                      <CardTitle className="text-2xl flex items-center">
                        <Percent className="w-8 h-8 mr-3 text-blue-600" />
                        Margins & Ratios
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                          <h4 className="text-xl font-bold text-blue-800 mb-4">Profitability Margins</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-medium">Net Profit Margin</span>
                              <Badge className={`text-lg px-4 py-2 ${
                                currentStock.historical.financials.margins.net_profit_margin >= 0
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}>
                                {formatPercent(currentStock.historical.financials.margins.net_profit_margin)}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-medium">Gross Profit Margin</span>
                              <Badge className="bg-blue-100 text-blue-800 text-lg px-4 py-2">
                                {formatPercent(currentStock.historical.financials.margins.gross_profit_margin)}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {currentStock.historical.financials.ratios && (
                          <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl">
                            <h4 className="text-xl font-bold text-purple-800 mb-4">Key Ratios</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="text-center p-3 bg-white rounded-lg shadow">
                                <p className="text-lg font-medium text-gray-700">ROE</p>
                                <p className="text-2xl font-bold text-purple-600">
                                  {currentStock.historical.financials.ratios.ROE_percent.toFixed(1)}%
                                </p>
                              </div>
                              <div className="text-center p-3 bg-white rounded-lg shadow">
                                <p className="text-lg font-medium text-gray-700">P/E</p>
                                <p className="text-2xl font-bold text-purple-600">
                                  {currentStock.historical.financials.ratios.P_E.toFixed(1)}
                                </p>
                              </div>
                              <div className="text-center p-3 bg-white rounded-lg shadow">
                                <p className="text-lg font-medium text-gray-700">P/B</p>
                                <p className="text-2xl font-bold text-purple-600">
                                  {currentStock.historical.financials.ratios.P_B.toFixed(2)}
                                </p>
                              </div>
                              <div className="text-center p-3 bg-white rounded-lg shadow">
                                <p className="text-lg font-medium text-gray-700">D/E</p>
                                <p className="text-2xl font-bold text-purple-600">
                                  {currentStock.historical.financials.ratios.debt_to_equity.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Technical Tab */}
              <TabsContent value="technical" className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="border-2 border-orange-200 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
                      <CardTitle className="text-xl flex items-center">
                        <Activity className="w-6 h-6 mr-2 text-orange-600" />
                        Key Indicators
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
                          <p className="text-lg font-medium text-orange-700 mb-2">RSI</p>
                          <div className="flex items-center justify-between">
                            <p className="text-3xl font-bold text-orange-900">
                              {currentStock.technical_indicators.rsi.toFixed(1)}
                            </p>
                            <Badge className={`text-lg px-4 py-2 ${
                              currentStock.technical_indicators.rsi > 70
                                ? "bg-red-100 text-red-800"
                                : currentStock.technical_indicators.rsi < 30
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {currentStock.technical_indicators.rsi > 70
                                ? "Overbought"
                                : currentStock.technical_indicators.rsi < 30
                                ? "Oversold"
                                : "Neutral"}
                            </Badge>
                          </div>
                          <Progress
                            value={currentStock.technical_indicators.rsi}
                            className="mt-3 h-3"
                          />
                        </div>

                        <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                          <p className="text-lg font-medium text-blue-700 mb-2">ADX</p>
                          <p className="text-3xl font-bold text-blue-900 mb-2">
                            {currentStock.technical_indicators.adx.toFixed(1)}
                          </p>
                          <Badge className={`text-lg px-4 py-2 ${
                            currentStock.technical_indicators.adx > 25
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {currentStock.technical_indicators.adx > 25 ? "Strong Trend" : "Weak Trend"}
                          </Badge>
                        </div>

                        <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl">
                          <p className="text-lg font-medium text-purple-700 mb-2">MACD</p>
                          <Badge className="text-lg px-4 py-2 bg-purple-100 text-purple-800">
                            {currentStock.technical_indicators.macd}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-blue-200 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                      <CardTitle className="text-xl flex items-center">
                        <LineChart className="w-6 h-6 mr-2 text-blue-600" />
                        Moving Averages
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                          <p className="text-lg font-medium text-blue-700 mb-2">50-Day MA</p>
                          <p className="text-3xl font-bold text-blue-900">
                            {formatCurrency(currentStock.technical_indicators.moving_averages["50_day"])}
                          </p>
                          <div className="flex items-center mt-2">
                            {currentStock.historical.price.end_price > currentStock.technical_indicators.moving_averages["50_day"] ? (
                              <ArrowUp className="w-5 h-5 text-green-600 mr-2" />
                            ) : (
                              <ArrowDown className="w-5 h-5 text-red-600 mr-2" />
                            )}
                            <span className={`text-lg ${
                              currentStock.historical.price.end_price > currentStock.technical_indicators.moving_averages["50_day"]
                                ? "text-green-600"
                                : "text-red-600"
                            }`}>
                              {currentStock.historical.price.end_price > currentStock.technical_indicators.moving_averages["50_day"]
                                ? "Above MA"
                                : "Below MA"}
                            </span>
                          </div>
                        </div>

                        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                          <p className="text-lg font-medium text-purple-700 mb-2">200-Day MA</p>
                          <p className="text-3xl font-bold text-purple-900">
                            {formatCurrency(currentStock.technical_indicators.moving_averages["200_day"])}
                          </p>
                          <div className="flex items-center mt-2">
                            {currentStock.historical.price.end_price > currentStock.technical_indicators.moving_averages["200_day"] ? (
                              <ArrowUp className="w-5 h-5 text-green-600 mr-2" />
                            ) : (
                              <ArrowDown className="w-5 h-5 text-red-600 mr-2" />
                            )}
                            <span className={`text-lg ${
                              currentStock.historical.price.end_price > currentStock.technical_indicators.moving_averages["200_day"]
                                ? "text-green-600"
                                : "text-red-600"
                            }`}>
                              {currentStock.historical.price.end_price > currentStock.technical_indicators.moving_averages["200_day"]
                                ? "Above MA"
                                : "Below MA"}
                            </span>
                          </div>
                        </div>

                        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                          <p className="text-lg font-medium text-green-700 mb-2">30D Avg Volume</p>
                          <p className="text-3xl font-bold text-green-900">
                            {(currentStock.technical_indicators.volume_average_30d / 1000000).toFixed(1)}M
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-green-200 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                      <CardTitle className="text-xl flex items-center">
                        <Target className="w-6 h-6 mr-2 text-green-600" />
                        Pattern Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {currentStock.pattern_analysis.detected_patterns.map((pattern, index) => (
                          <div key={index} className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border border-green-200">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-lg font-bold text-green-800">{pattern.type}</h4>
                              <Badge className={`text-lg px-4 py-2 ${
                                pattern.status === "Confirmed"
                                  ? "bg-green-100 text-green-800"
                                  : pattern.status === "Forming"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}>
                                {pattern.status}
                              </Badge>
                            </div>
                            <p className="text-lg text-green-700 mb-2">
                              <strong>Status:</strong> {pattern.status}
                            </p>
                            <p className="text-lg text-green-700">
                              <strong>Implication:</strong> {pattern.implication}
                            </p>
                          </div>
                        ))}

                        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                          <p className="text-lg font-medium text-blue-700 mb-2">Bollinger Bands</p>
                          <p className="text-lg text-blue-900">
                            {currentStock.technical_indicators.bollinger_bands}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* AI Insights Tab */}
              <TabsContent value="ai-insights" className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="border-2 border-purple-200 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50">
                      <CardTitle className="text-2xl flex items-center">
                        <Bot className="w-8 h-8 mr-3 text-purple-600" />
                        AI Analysis Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl">
                          <h4 className="text-xl font-bold text-purple-800 mb-3">Overall Rating</h4>
                          <div className="flex items-center justify-between">
                            <Badge className={`text-2xl px-6 py-3 ${getRatingColor(currentStock.ai_insights.ai_rating)}`}>
                              {currentStock.ai_insights.ai_rating}
                            </Badge>
                            <Badge className="text-lg px-4 py-2 bg-indigo-100 text-indigo-800">
                              {currentStock.ai_insights.investment_type}
                            </Badge>
                          </div>
                        </div>

                        <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                          <h4 className="text-xl font-bold text-blue-800 mb-3">Trend Summary</h4>
                          <p className="text-lg text-blue-700 leading-relaxed">
                            {currentStock.ai_insights.trend_summary}
                          </p>
                        </div>

                        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                          <h4 className="text-xl font-bold text-green-800 mb-4">Short-term Analysis</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-medium">Bias:</span>
                              <Badge className={`text-lg px-4 py-2 border-2 ${getBiasColor(currentStock.ai_insights.short_term_analysis.bias)}`}>
                                {currentStock.ai_insights.short_term_analysis.bias}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-medium">Volatility:</span>
                              <Badge className="text-lg px-4 py-2 bg-orange-100 text-orange-800">
                                {currentStock.ai_insights.short_term_analysis.volatility}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-medium">Momentum:</span>
                              <Badge className="text-lg px-4 py-2 bg-blue-100 text-blue-800">
                                {currentStock.ai_insights.short_term_analysis.momentum}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-indigo-200 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
                      <CardTitle className="text-2xl flex items-center">
                        <Target className="w-8 h-8 mr-3 text-indigo-600" />
                        Support & Resistance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                          <h4 className="text-xl font-bold text-green-800 mb-4">Support Levels</h4>
                          <div className="grid grid-cols-2 gap-3">
                            {currentStock.ai_insights.short_term_analysis.support_levels.map((level, index) => (
                              <div key={index} className="text-center p-3 bg-white rounded-lg shadow border-2 border-green-200">
                                <p className="text-lg font-bold text-green-900">
                                  {formatCurrency(level)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl">
                          <h4 className="text-xl font-bold text-red-800 mb-4">Resistance Levels</h4>
                          <div className="grid grid-cols-2 gap-3">
                            {currentStock.ai_insights.short_term_analysis.resistance_levels.map((level, index) => (
                              <div key={index} className="text-center p-3 bg-white rounded-lg shadow border-2 border-red-200">
                                <p className="text-lg font-bold text-red-900">
                                  {formatCurrency(level)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Growth Drivers & Risks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="border-2 border-green-200 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                      <CardTitle className="text-2xl flex items-center">
                        <TrendingUp className="w-8 h-8 mr-3 text-green-600" />
                        Growth Drivers
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {currentStock.ai_insights.key_growth_drivers.map((driver, index) => (
                          <div key={index} className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-l-4 border-green-500">
                            <div className="flex items-start">
                              <CheckCircle className="w-8 h-8 text-green-600 mr-3 mt-1 flex-shrink-0" />
                              <p className="text-lg text-green-800 leading-relaxed font-medium">
                                {driver}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-red-200 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-red-50 to-rose-50">
                      <CardTitle className="text-2xl flex items-center">
                        <AlertTriangle className="w-8 h-8 mr-3 text-red-600" />
                        Potential Risks
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {currentStock.ai_insights.potential_risks.map((risk, index) => (
                          <div key={index} className="p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border-l-4 border-red-500">
                            <div className="flex items-start">
                              <XCircle className="w-8 h-8 text-red-600 mr-3 mt-1 flex-shrink-0" />
                              <p className="text-lg text-red-800 leading-relaxed font-medium">
                                {risk}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Long-term Analysis */}
                <Card className="border-2 border-blue-200 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                    <CardTitle className="text-2xl flex items-center">
                      <Calendar className="w-8 h-8 mr-3 text-blue-600" />
                      Long-term Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                          <h4 className="text-xl font-bold text-blue-800 mb-3">Market Trend</h4>
                          <p className="text-lg text-blue-700 leading-relaxed">
                            {currentStock.ai_insights.long_term_analysis.trend}
                          </p>
                        </div>
                        <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl">
                          <h4 className="text-xl font-bold text-purple-800 mb-3">Valuation</h4>
                          <p className="text-lg text-purple-700 leading-relaxed">
                            {currentStock.ai_insights.long_term_analysis.valuation}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                          <h4 className="text-xl font-bold text-green-800 mb-3">Sector Performance</h4>
                          <p className="text-lg text-green-700 leading-relaxed">
                            {currentStock.ai_insights.long_term_analysis.sector_performance}
                          </p>
                        </div>
                        <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl">
                          <h4 className="text-xl font-bold text-orange-800 mb-3">Macro Impact</h4>
                          <p className="text-lg text-orange-700 leading-relaxed">
                            {currentStock.ai_insights.long_term_analysis.macro_impact}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* News Tab */}
              <TabsContent value="news" className="space-y-6">
                <Card className="border-2 border-blue-200 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                    <CardTitle className="text-2xl flex items-center">
                      <Newspaper className="w-8 h-8 mr-3 text-blue-600" />
                      Latest News & Developments
                      <Badge className="ml-auto bg-blue-100 text-blue-800 text-lg px-4 py-2">
                        {currentStock.historical.news.length} Articles
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      {currentStock.historical.news.map((article, index) => (
                        <div key={index} className="p-6 bg-gradient-to-r from-white to-blue-50 rounded-xl border border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 mb-2 leading-relaxed">
                                {article.title}
                              </h3>
                              <div className="flex items-center gap-4 mb-3">
                                <Badge className={`text-lg px-4 py-2 ${getImpactColor(article.impact)}`}>
                                  {article.impact === "Positive" && <TrendingUp className="w-4 h-4 mr-2" />}
                                  {article.impact === "Negative" && <TrendingDown className="w-4 h-4 mr-2" />}
                                  {article.impact === "Neutral" && <Minus className="w-4 h-4 mr-2" />}
                                  {article.impact}
                                </Badge>
                                <Badge variant="outline" className="text-lg px-4 py-2">
                                  <Calendar className="w-4 h-4 mr-2" />
                                  {new Date(article.date).toLocaleDateString()}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <p className="text-lg text-gray-700 leading-relaxed mb-4">
                            {article.summary}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Notable Trends */}
                <Card className="border-2 border-purple-200 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50">
                    <CardTitle className="text-2xl flex items-center">
                      <TrendingUp className="w-8 h-8 mr-3 text-purple-600" />
                      Notable Market Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="space-y-4">
                      {currentStock.historical.notable_trends.map((trend, index) => (
                        <div key={index} className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border-l-4 border-purple-500">
                          <div className="flex items-start">
                            <Info className="w-8 h-8 text-purple-600 mr-3 mt-1 flex-shrink-0" />
                            <p className="text-lg text-purple-800 leading-relaxed font-medium">
                              {trend}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Forecast Tab */}
              <TabsContent value="forecast" className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="border-2 border-green-200 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                      <CardTitle className="text-2xl flex items-center">
                        <Target className="w-8 h-8 mr-3 text-green-600" />
                        Price Forecast
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-100 rounded-xl border-2 border-green-300">
                          <p className="text-lg font-medium text-green-700 mb-2">Target Price</p>
                          <p className="text-4xl font-bold text-green-900 mb-3">
                            {formatCurrency(currentStock.forecast.price_target)}
                          </p>
                          <Badge className={`text-xl px-6 py-3 ${
                            currentStock.forecast.upside_percent >= 0
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {currentStock.forecast.upside_percent >= 0 ? "+" : ""}
                            {currentStock.forecast.upside_percent.toFixed(1)}% Upside
                          </Badge>
                        </div>

                        <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                          <h4 className="text-xl font-bold text-blue-800 mb-4">Price Range</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-medium">Low</span>
                              <span className="text-xl font-bold text-red-600">
                                {formatCurrency(currentStock.forecast.expected_price_range.low)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-medium">Average</span>
                              <span className="text-xl font-bold text-blue-600">
                                {formatCurrency(currentStock.forecast.expected_price_range.expected_average)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-medium">High</span>
                              <span className="text-xl font-bold text-green-600">
                                {formatCurrency(currentStock.forecast.expected_price_range.high)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl">
                          <h4 className="text-xl font-bold text-purple-800 mb-3">Confidence Level</h4>
                          <Badge className="text-xl px-6 py-3 bg-purple-100 text-purple-800">
                            {currentStock.forecast.confidence_level}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-blue-200 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                      <CardTitle className="text-2xl flex items-center">
                        <BarChart3 className="w-8 h-8 mr-3 text-blue-600" />
                        Financial Estimates
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                          <h4 className="text-xl font-bold text-green-800 mb-4">Revenue Estimate</h4>
                          <p className="text-3xl font-bold text-green-900">
                            {formatCurrency(currentStock.forecast.revenue_estimate)}
                          </p>
                        </div>

                        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                          <h4 className="text-xl font-bold text-blue-800 mb-4">Net Income Estimate</h4>
                          <p className={`text-3xl font-bold ${
                            currentStock.forecast.net_income_estimate >= 0
                              ? "text-green-900"
                              : "text-red-900"
                          }`}>
                            {formatCurrency(currentStock.forecast.net_income_estimate)}
                          </p>
                        </div>

                        <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl">
                          <h4 className="text-xl font-bold text-purple-800 mb-4">EPS Estimate</h4>
                          <p className={`text-3xl font-bold ${
                            currentStock.forecast.EPS_estimate >= 0
                              ? "text-green-900"
                              : "text-red-900"
                          }`}>
                            {currentStock.forecast.EPS_estimate.toFixed(2)}
                          </p>
                        </div>

                        {currentStock.forecast.dividends_expected.length > 0 && (
                          <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl">
                            <h4 className="text-xl font-bold text-orange-800 mb-4">Expected Dividends</h4>
                            <div className="space-y-2">
                              {currentStock.forecast.dividends_expected.map((dividend, index) => (
                                <div key={index} className="flex justify-between items-center">
                                  <span className="text-lg font-medium">
                                    {new Date(dividend.expected_date).toLocaleDateString()}
                                  </span>
                                  <Badge className="text-lg px-4 py-2 bg-orange-100 text-orange-800">
                                    {dividend.expected_percent}%
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Analyst Sentiment */}
                <Card className="border-2 border-yellow-200 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
                    <CardTitle className="text-2xl flex items-center">
                      <Users className="w-8 h-8 mr-3 text-yellow-600" />
                      Analyst Sentiment
                      <Badge className="ml-auto bg-yellow-100 text-yellow-800 text-lg px-4 py-2">
                        {currentStock.analyst_sentiment.analysts_count} Analysts
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="text-center p-6 bg-gradient-to-r from-yellow-50 to-orange-100 rounded-xl border-2 border-yellow-300">
                          <p className="text-lg font-medium text-yellow-700 mb-2">Recommendation</p>
                          <Badge className="text-2xl px-6 py-3 bg-yellow-100 text-yellow-800">
                            {currentStock.analyst_sentiment.recommendation}
                          </Badge>
                        </div>

                        <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl">
                          <h4 className="text-xl font-bold text-gray-800 mb-4">Analyst Summary</h4>
                          <p className="text-lg text-gray-700 leading-relaxed">
                            {currentStock.analyst_sentiment.summary}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-xl font-bold text-gray-800">Price Targets</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl">
                            <span className="text-lg font-medium">Low Target</span>
                            <span className="text-xl font-bold text-red-600">
                              {formatCurrency(currentStock.analyst_sentiment.price_target_range.low)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                            <span className="text-lg font-medium">Average Target</span>
                            <span className="text-xl font-bold text-blue-600">
                              {formatCurrency(currentStock.analyst_sentiment.price_target_range.average)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                            <span className="text-lg font-medium">High Target</span>
                            <span className="text-xl font-bold text-green-600">
                              {formatCurrency(currentStock.analyst_sentiment.price_target_range.high)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Forecast Notes */}
                <Card className="border-2 border-indigo-200 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
                    <CardTitle className="text-2xl flex items-center">
                      <Lightbulb className="w-8 h-8 mr-3 text-indigo-600" />
                      Forecast Notes & Assumptions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-l-4 border-indigo-500">
                      <p className="text-lg text-indigo-800 leading-relaxed font-medium">
                        {currentStock.forecast.forecast_notes}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Alerts Section */}
            {currentStock.alerts.length > 0 && (
              <Card className="border-2 border-yellow-200 shadow-xl mt-8">
                <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
                  <CardTitle className="text-2xl flex items-center">
                    <AlertTriangle className="w-8 h-8 mr-3 text-yellow-600" />
                    Active Alerts
                    <Badge className="ml-auto bg-yellow-100 text-yellow-800 text-lg px-4 py-2">
                      {currentStock.alerts.length} Alert{currentStock.alerts.length !== 1 ? 's' : ''}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-4">
                    {currentStock.alerts.map((alert, index) => (
                      <div key={index} className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-xl font-bold text-yellow-800 mb-2">{alert.type}</h4>
                            <p className="text-lg text-yellow-700">
                              <strong>Condition:</strong> {alert.condition}
                            </p>
                          </div>
                          <Badge className="text-lg px-4 py-2 bg-yellow-100 text-yellow-800">
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Active
                          </Badge>
                        </div>
                        <p className="text-lg text-yellow-700 mt-3">
                          <strong>Message:</strong> {alert.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
