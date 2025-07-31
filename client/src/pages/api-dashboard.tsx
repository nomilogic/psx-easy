import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import LiveStockTicker from "@/components/live-stock-ticker";
import HeaderTicker from "@/components/header-ticker";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { TrendingUp, Search, BarChart3, Users, Server, Globe, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useWebSocket } from "@/hooks/use-websocket";
import MarketOverview from "@/components/market-overview";
import ApiDocumentation from "@/components/api-documentation";
import SystemStatus from "@/components/system-status";
import WebSocketInfo from "@/components/websocket-info";

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

interface MarketData {
  totalMarketCap: number;
  totalVolume: number;
  advancingStocks: number;
  decliningStocks: number;
  unchangedStocks: number;
}

function ApiDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const { marketData: liveStocks } = useWebSocket();

  const { data: marketData } = useQuery<MarketData>({
    queryKey: ["/api/market-overview"],
  });

  const { data: stocks } = useQuery<Stock[]>({
    queryKey: ["/api/stocks"],
  });

  const filteredStocks = stocks?.filter(stock =>
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Ticker */}
      <HeaderTicker stocks={liveStocks || []} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              <div className="flex items-center space-x-4">
                <Link
                  href="/"
                  className="flex items-center px-3 py-1 text-white hover:text-green-100 transition-colors rounded-md hover:bg-white hover:bg-opacity-10"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <span className="font-medium text-sm">Home</span>
                </Link>
                <div className="flex items-center space-x-2">
                  <Server className="w-5 h-5" />
                  <span className="font-bold text-lg">PAISX API Dashboard</span>
                </div>
              </div>
              <div className="text-sm font-medium">Pakistan AI Stock Exchange API</div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              PAISX API Dashboard
            </h1>
            <p className="text-gray-600 text-lg">
              Pakistan AI Stock Exchange - Real-time market data, AI-powered insights, and comprehensive APIs for developers and traders.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Stocks</p>
                    <p className="text-2xl font-bold text-green-600">{stocks?.length || 0}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Market Cap</p>
                    <p className="text-2xl font-bold text-blue-600">
                      Rs. {marketData?.totalMarketCap ? (marketData.totalMarketCap / 1000000).toFixed(1) + 'B' : 'N/A'}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Active Traders</p>
                    <p className="text-2xl font-bold text-green-600">12.5K+</p>
                  </div>
                  <Users className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">API Calls</p>
                    <p className="text-2xl font-bold text-blue-600">2.1M+</p>
                  </div>
                  <Globe className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Market Overview</TabsTrigger>
              <TabsTrigger value="stocks">Live Stocks</TabsTrigger>
              <TabsTrigger value="api">API Documentation</TabsTrigger>
              <TabsTrigger value="status">System Status</TabsTrigger>
              <TabsTrigger value="websocket">WebSocket</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <MarketOverview summary={null} />
            </TabsContent>

            <TabsContent value="stocks" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Live Stock Data</CardTitle>
                      <CardDescription>
                        Real-time stock prices and market movements
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Search className="w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search stocks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <LiveStockTicker stocks={liveStocks || []} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="api" className="space-y-6">
              <ApiDocumentation />
            </TabsContent>

            <TabsContent value="status" className="space-y-6">
              <SystemStatus />
            </TabsContent>

            <TabsContent value="websocket" className="space-y-6">
              <WebSocketInfo />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default ApiDashboard;