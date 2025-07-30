import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Activity, BarChart3, Brain, Zap, Bot, Target, DollarSign, Globe, Newspaper, ChevronRight, Play, Lightbulb } from "lucide-react";
import { useWebSocket } from "@/hooks/use-websocket";
import type { StockData, MarketSummary } from "@shared/schema";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, LineChart, Line, BarChart, Bar } from "recharts";
import NewsSection from "@/components/news-section";

export default function Homepage() {
  const { stocks, marketSummary, isConnected } = useWebSocket();

  const { data: performersData } = useQuery({
    queryKey: ['/api/performers'],
    refetchInterval: 30000,
  });

  const { data: sectorsData } = useQuery({
    queryKey: ['/api/sectors'],
    refetchInterval: 30000,
  });

  const { data: aiInsights, refetch: refetchInsights } = useQuery({
    queryKey: ['/api/market-insights'],
    queryFn: async () => {
      const response = await fetch('/api/market-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'market_overview' })
      });
      return response.json();
    },
    refetchInterval: 300000, // 5 minutes
  });

  // Generate chart data from real stocks data
  const chartData = React.useMemo(() => {
    if (!stocks || stocks.length === 0) {
      return [
        { name: 'Jan', value: 48000, change: 2.1 },
        { name: 'Feb', value: 49200, change: 2.5 },
        { name: 'Mar', value: 47800, change: -2.8 },
        { name: 'Apr', value: 51200, change: 7.1 },
        { name: 'May', value: 52800, change: 3.1 },
        { name: 'Jun', value: 54500, change: 3.2 },
      ];
    }

    const topStocks = stocks.slice(0, 6);
    return topStocks.map((stock, index) => ({
      name: stock.symbol,
      value: stock.current,
      change: stock.changePercent,
      volume: stock.volume
    }));
  }, [stocks]);

  const sectorChartData = React.useMemo(() => {
    return sectorsData?.slice(0, 5).map(sector => ({
      name: sector.name.split(' ')[0],
      volume: sector.volume,
      code: sector.code
    })) || [
      { name: 'BANKS', volume: 45000000, code: '0807' },
      { name: 'TECH', volume: 38000000, code: '0828' },
      { name: 'CEMENT', volume: 32000000, code: '0804' },
      { name: 'OIL', volume: 28000000, code: '0825' },
      { name: 'TEXTILE', volume: 24000000, code: '0830' }
    ];
  }, [sectorsData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section - PAISX Branding */}
      <section className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-6">
                <Brain className="w-16 h-16 mr-4 text-emerald-300" />
                <div>
                  <h1 className="text-6xl font-bold mb-2 bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
                    PAISX
                  </h1>
                  <p className="text-emerald-200 text-xl font-medium">Pakistan AI Stock Exchange</p>
                </div>
              </div>
              <p className="text-xl mb-8 leading-relaxed opacity-95">
                The first AI-powered stock exchange platform in Pakistan. Experience next-generation 
                trading with real-time market analysis, intelligent portfolio management, and 
                automated trading strategies powered by advanced machine learning.
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3">
                  <Play className="w-5 h-5 mr-2" />
                  Start Trading Now
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-semibold px-8 py-3">
                  <Brain className="w-5 h-5 mr-2" />
                  AI Analysis
                </Button>
              </div>
              <div className="flex items-center space-x-8 text-sm opacity-90">
                <div className="flex items-center">
                  <Zap className="w-4 h-4 mr-2 text-emerald-300" />
                  Real-time Data
                </div>
                <div className="flex items-center">
                  <Bot className="w-4 h-4 mr-2 text-emerald-300" />
                  AI Powered
                </div>
                <div className="flex items-center">
                  <Target className="w-4 h-4 mr-2 text-emerald-300" />
                  Smart Trading
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Live Market Status</h3>
                    <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30">
                      Live
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-emerald-200 text-sm">Total Stocks</p>
                      <p className="text-2xl font-bold">{marketSummary?.totalStocks || '476'}</p>
                    </div>
                    <div>
                      <p className="text-emerald-200 text-sm">Total Volume</p>
                      <p className="text-2xl font-bold">
                        {marketSummary?.totalVolume ? (marketSummary.totalVolume / 1000000).toFixed(1) + 'M' : '245.6M'}
                      </p>
                    </div>
                    <div>
                      <p className="text-emerald-200 text-sm">Gainers</p>
                      <p className="text-2xl font-bold text-emerald-300">{marketSummary?.gainers || '156'}</p>
                    </div>
                    <div>
                      <p className="text-emerald-200 text-sm">Decliners</p>
                      <p className="text-2xl font-bold text-red-300">{marketSummary?.losers || '142'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Market Data Analytics */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Real-Time Market Analytics</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced AI-powered market analysis with live data visualization and sector performance tracking
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Live Market Chart */}
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <span>KSE-100 Index Performance</span>
                </CardTitle>
                <CardDescription>Real-time market index tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="rgb(59 130 246)" 
                        fill="rgb(59 130 246 / 0.1)" 
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Sector Performance */}
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  <span>Top Performing Sectors</span>
                </CardTitle>
                <CardDescription>Volume-based sector analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sectorChartData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar 
                        dataKey="volume" 
                        fill="rgb(34 197 94)" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Market Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="text-center p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stocks?.length || '476'}</h3>
              <p className="text-gray-600">Listed Companies</p>
            </Card>

            <Card className="text-center p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{marketSummary?.gainers || '156'}</h3>
              <p className="text-gray-600">Gainers Today</p>
            </Card>

            <Card className="text-center p-6">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{marketSummary?.losers || '142'}</h3>
              <p className="text-gray-600">Decliners Today</p>
            </Card>

            <Card className="text-center p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {marketSummary?.totalVolume ? (marketSummary.totalVolume / 1000000).toFixed(1) + 'M' : '245.6M'}
              </h3>
              <p className="text-gray-600">Trading Volume</p>
            </Card>
          </div>

          {/* Live Stock Table */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <span>Live Stock Data</span>
                </div>
                <Badge variant="secondary" className={`${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {isConnected ? 'Live' : 'Disconnected'}
                </Badge>
              </CardTitle>
              <CardDescription>Real-time stock prices updated every 30 seconds</CardDescription>
            </CardHeader>
            <CardContent>
              {stocks && stocks.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Symbol</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Company</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900">Price</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900">Change</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900">Volume</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stocks.slice(0, 10).map((stock) => (
                        <tr key={stock.symbol} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <span className="font-bold text-blue-600">{stock.symbol}</span>
                          </td>
                          <td className="py-3 px-4 text-gray-900">{stock.name}</td>
                          <td className="py-3 px-4 text-right font-mono">Rs. {stock.current.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              stock.isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {stock.isPositive ? (
                                <TrendingUp className="w-3 h-3 mr-1" />
                              ) : (
                                <TrendingDown className="w-3 h-3 mr-1" />
                              )}
                              {stock.changePercent.toFixed(2)}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-gray-600">
                            {stock.volume.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-4 text-center">
                    <Button variant="outline" asChild>
                      <a href="/api">View Full Market Data</a>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading market data...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* AI-Powered Features */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">AI-Powered Trading Intelligence</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of trading with our advanced AI analysis and automated insights
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="p-6 border-2 border-blue-200 hover:border-blue-400 transition-colors">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Analysis</h3>
              <p className="text-gray-600 mb-4">
                AI-powered stock analysis providing deep insights into market trends and investment opportunities.
              </p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                <a href="/ai-analysis">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Try AI Analysis
                </a>
              </Button>
            </Card>

            <Card className="p-6 border-2 border-purple-200 hover:border-purple-400 transition-colors">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Bot className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Automated Trading</h3>
              <p className="text-gray-600 mb-4">
                Intelligent trading algorithms that execute trades based on real-time market analysis and predictions.
              </p>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                <Zap className="w-4 h-4 mr-2" />
                Coming Soon
              </Button>
            </Card>

            <Card className="p-6 border-2 border-green-200 hover:border-green-400 transition-colors">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Portfolio Optimization</h3>
              <p className="text-gray-600 mb-4">
                AI-driven portfolio recommendations to maximize returns while minimizing risk exposure.
              </p>
              <Button className="w-full bg-green-600 hover:bg-green-700">
                <BarChart3 className="w-4 h-4 mr-2" />
                Optimize Portfolio
              </Button>
            </Card>
          </div>

          {/* AI Insights Card */}
          {aiInsights && (
            <Card className="mt-12 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-indigo-600" />
                  <span>Latest AI Market Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{aiInsights.insight}</p>
                <div className="mt-4">
                  <Button variant="outline" onClick={() => refetchInsights()}>
                    <Bot className="w-4 h-4 mr-2" />
                    Refresh Insights
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* News Section */}
      <NewsSection />
    </div>
  );
}