import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Activity, BarChart3, Brain, Zap, Bot, Target, DollarSign, Globe, Newspaper, ChevronRight, Play } from "lucide-react";
import { useWebSocket } from "@/hooks/use-websocket";
import type { StockData, MarketSummary } from "@shared/schema";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, LineChart, Line, BarChart, Bar } from "recharts";
import NewsSection from "@/components/news-section";

export default function Homepage() {
  const { stocks, marketSummary } = useWebSocket();

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

      {/* News Section */}
      <NewsSection />
    </div>
  );
}