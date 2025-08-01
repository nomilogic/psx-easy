import React from "react";
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
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Users,
  Building,
  Percent,
  Eye,
  Star,
  Shield,
  Calendar,
  Filter,
  Search,
  Bookmark,
  Share2,
  Download,
  RefreshCw,
  PieChart,
  LineChart,
} from "lucide-react";
import { useWebSocket } from "@/hooks/use-websocket";
import { useMarketWebSocket } from "@/hooks/useMarketWebSocket";
import type { StockData, MarketSummary } from "@shared/schema";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  LineChart as RechartsLineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
} from "recharts";
import NewsSection from "@/components/news-section";
import HeaderTicker from "@/components/header-ticker";
import IndicesTicker from "@/components/indices-ticker";
import MarketDataTable from "@/components/market-data-table";
import { SimpleMarketStatus } from "@/components/SimpleMarketStatus";
const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function Homepage() {
  const { marketData: stocks, marketSummary, isConnected } = useWebSocket();
  const { marketStatus, lastUpdate, isConnected: marketConnected } = useMarketWebSocket();

  const { data: performersData } = useQuery({
    queryKey: ["/api/performers"],
    refetchInterval: 30000,
  });

  const { data: sectorsData } = useQuery({
    queryKey: ["/api/sectors"],
    refetchInterval: 30000,
  });

  const { data: aiInsights, refetch: refetchInsights } = useQuery({
    queryKey: ["/api/market-insights"],
    queryFn: async () => {
      const response = await fetch("/api/market-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "market_overview" }),
      });
      return response.json();
    },
    refetchInterval: 300000,
    enabled: false,
  });

  // Generate compact chart data
  const compactChartData = React.useMemo(() => {
    if (!stocks || stocks.length === 0) {
      return Array.from({ length: 12 }, (_, i) => ({
        name: `H${i + 1}`,
        value: 48000 + Math.random() * 8000,
        change: (Math.random() - 0.5) * 10,
      }));
    }

    return stocks.slice(0, 12).map((stock, index) => ({
      name: stock.symbol.substring(0, 4),
      value: stock.current,
      change: stock.changePercent,
      volume: stock.volume,
    }));
  }, [stocks]);

  const sectorChartData = React.useMemo(() => {
    return (
      (sectorsData as any[])?.slice(0, 6).map((sector: any) => ({
        name: sector.name.split(" ")[0],
        volume: sector.volume,
        percentage: Math.random() * 100,
        code: sector.code,
      })) || [
        { name: "BANKS", volume: 45000000, percentage: 24, code: "0807" },
        { name: "TECH", volume: 38000000, percentage: 19, code: "0828" },
        { name: "CEMENT", volume: 32000000, percentage: 16, code: "0804" },
        { name: "OIL", volume: 28000000, percentage: 14, code: "0825" },
        { name: "TEXTILE", volume: 24000000, percentage: 12, code: "0830" },
        { name: "POWER", volume: 20000000, percentage: 10, code: "0824" },
      ]
    );
  }, [sectorsData]);

  const formatCurrency = (amount: number) => `Rs. ${amount.toLocaleString()}`;
  const formatPercent = (percent: number) => `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Market Indices Ticker */}
      <IndicesTicker />
      {/* Stock Ticker */}
      <HeaderTicker stocks={stocks || []} />

      {/* Compact Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 text-white py-12">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2">
              <div className="flex items-center mb-4">
                <Brain className="w-12 h-12 mr-3 text-white" />
                <div>
                  <h1 className="text-4xl font-bold mb-1">PAISX</h1>
                  <p className="text-blue-200 text-lg">Pakistan AI Stock Exchange</p>
                </div>
              </div>
              <p className="text-lg mb-6 opacity-95 leading-relaxed">
                AI-powered trading platform with real-time analysis and intelligent insights for Pakistan Stock Exchange
              </p>
              <div className="flex gap-3">
                <Button size="sm" className="bg-white text-blue-600 hover:bg-blue-50">
                  <Play className="w-4 h-4 mr-2" />
                  Start Trading
                </Button>
                <Button size="sm" variant="outline" className="border-white text-white hover:bg-white/10">
                  <Brain className="w-4 h-4 mr-2" />
                  AI Analysis
                </Button>
              </div>
            </div>

            {/* Market Status Indicator */}
            <Card className="bg-white/15 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-4">
                <SimpleMarketStatus />
                <div className="grid grid-cols-2 gap-3 text-sm mt-4">
                  <div>
                    <p className="text-blue-200 text-xs">Total Stocks</p>
                    <p className="text-xl font-bold">{marketSummary?.totalStocks || stocks?.length || "476"}</p>
                  </div>
                  <div>
                    <p className="text-blue-200 text-xs">Volume</p>
                    <p className="text-xl font-bold">
                      {marketSummary?.totalVolume ? (marketSummary.totalVolume / 1000000).toFixed(1) + "M" : "245M"}
                    </p>
                  </div>
                  <div>
                    <p className="text-blue-200 text-xs">Gainers</p>
                    <p className="text-lg font-bold text-green-300">{marketSummary?.gainers || "156"}</p>
                  </div>
                  <div>
                    <p className="text-blue-200 text-xs">Decliners</p>
                    <p className="text-lg font-bold text-red-300">{marketSummary?.losers || "142"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Compact Dashboard Grid */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

            {/* KSE-100 Index Card - Compact */}
            <Card className="lg:col-span-2 border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                      KSE-100 Index
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-2xl font-bold">52,847.32</span>
                      <Badge className="bg-green-100 text-green-800">+2.3%</Badge>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p>High: 53,200</p>
                    <p>Low: 52,100</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-24">
                  <AreaChart width={400} height={96} data={compactChartData.slice(0, 8)}>
                    <Area type="monotone" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} strokeWidth={2} />
                  </AreaChart>
                </div>
              </CardContent>
            </Card>

            {/* Market Stats Grid */}
            <div className="grid grid-cols-1 gap-4">
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active Stocks</p>
                      <p className="text-xl font-bold">{stocks?.length || 483}</p>
                    </div>
                    <Activity className="w-6 h-6 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Daily Volume</p>
                      <p className="text-xl font-bold">245M</p>
                    </div>
                    <DollarSign className="w-6 h-6 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sector Performance - Compact */}
            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <PieChart className="w-5 h-5 mr-2 text-orange-600" />
                  Top Sectors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sectorChartData.slice(0, 4).map((sector, idx) => (
                    <div key={sector.name} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: CHART_COLORS[idx] }}
                        />
                        <span className="text-sm font-medium">{sector.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold">{sector.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Data Tables Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Top Gainers - Compact Table */}
            <Card className="border-2 border-green-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center text-green-700">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Top Gainers
                  </CardTitle>
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stocks?.filter(s => s.isPositive).slice(0, 6).map((stock, idx) => (
                    <div key={stock.symbol} className="flex items-center justify-between p-2 hover:bg-green-50 rounded transition-colors">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{stock.symbol}</p>
                          <p className="text-xs text-gray-500">{formatCurrency(stock.current)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          {formatPercent(stock.changePercent)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Losers - Compact Table */}
            <Card className="border-2 border-red-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center text-red-700">
                    <TrendingDown className="w-5 h-5 mr-2" />
                    Top Losers
                  </CardTitle>
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stocks?.filter(s => !s.isPositive).slice(0, 6).map((stock, idx) => (
                    <div key={stock.symbol} className="flex items-center justify-between p-2 hover:bg-red-50 rounded transition-colors">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{stock.symbol}</p>
                          <p className="text-xs text-gray-500">{formatCurrency(stock.current)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-red-100 text-red-800 text-xs">
                          {formatPercent(stock.changePercent)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Compact AI Analysis Section */}
          <Card className="mt-6 border-2 border-blue-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Brain className="w-6 h-6 mr-3 text-blue-600" />
                  <div>
                    <CardTitle className="text-xl">AI Market Intelligence</CardTitle>
                    <CardDescription>Real-time analysis powered by machine learning</CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => refetchInsights()} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Bot className="w-4 h-4 mr-2" />
                    Full Analysis
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {aiInsights?.insight ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-green-50 border-green-200 col-span-1">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-800">Market Sentiment</p>
                          <p className="text-xl font-bold text-green-900">Bullish</p>
                          <p className="text-xs text-green-600">+2.3% avg change</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <div className="col-span-2">
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4">
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700 leading-relaxed">
                          {aiInsights.insight.substring(0, 200)}...
                        </p>
                        <div className="flex gap-2 mt-3">
                          <Badge variant="outline" className="text-xs">
                            <Target className="w-3 h-3 mr-1" />
                            High Confidence
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            Updated 5 min ago
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">AI analysis ready to generate insights</p>
                  <Button onClick={() => refetchInsights()} className="bg-blue-600 hover:bg-blue-700">
                    <Bot className="w-4 h-4 mr-2" />
                    Generate Analysis
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Compact Live Data Table */}
          <Card className="mt-6">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-blue-600" />
                  Live Market Data
                  <Badge variant="secondary" className={`ml-2 ${isConnected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {isConnected ? "Live" : "Offline"}
                  </Badge>
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {stocks && stocks.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-xs">
                        <th className="text-left py-2 font-semibold">Symbol</th>
                        <th className="text-left py-2 font-semibold">Company</th>
                        <th className="text-right py-2 font-semibold">Price</th>
                        <th className="text-right py-2 font-semibold">Change</th>
                        <th className="text-right py-2 font-semibold">Volume</th>
                        <th className="text-center py-2 font-semibold">Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stocks.slice(0, 12).map((stock) => (
                        <tr key={stock.symbol} className="border-b border-gray-100 hover:bg-gray-50 text-xs">
                          <td className="py-2">
                            <span className="font-bold text-blue-600">{stock.symbol}</span>
                          </td>
                          <td className="py-2 text-gray-900 max-w-32 truncate">
                            {stock.name}
                          </td>
                          <td className="py-2 text-right font-mono">
                            {formatCurrency(stock.current)}
                          </td>
                          <td className="py-2 text-right">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${stock.isPositive ? "border-green-500 text-green-700 bg-green-50" : "border-red-500 text-red-700 bg-red-50"}`}
                            >
                              {formatPercent(stock.changePercent)}
                            </Badge>
                          </td>
                          <td className="py-2 text-right font-mono text-gray-600">
                            {(stock.volume / 1000).toFixed(0)}K
                          </td>
                          <td className="py-2 text-center">
                            {stock.isPositive ? 
                              <ArrowUpRight className="w-4 h-4 text-green-500 mx-auto" /> : 
                              <ArrowDownRight className="w-4 h-4 text-red-500 mx-auto" />
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-4 text-center">
                    <Button variant="outline" asChild>
                      <a href="/api">View All Stocks ({stocks.length})</a>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading market data...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Compact AI Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <Brain className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Smart Analysis</h3>
                    <p className="text-xs text-gray-600">AI-powered insights</p>
                  </div>
                </div>
                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                  <a href="/ai-analysis">
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Try Now
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 hover:border-purple-400 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <Bot className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Auto Trading</h3>
                    <p className="text-xs text-gray-600">Intelligent algorithms</p>
                  </div>
                </div>
                <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
                  <Zap className="w-4 h-4 mr-2" />
                  Coming Soon
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 hover:border-green-400 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <Target className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Portfolio Builder</h3>
                    <p className="text-xs text-gray-600">Risk optimization</p>
                  </div>
                </div>
                <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Optimize
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* News Section */}
      <NewsSection />
    </div>
  );
}