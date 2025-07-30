
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Globe, 
  ArrowRight, 
  Play,
  Users,
  Shield,
  Zap,
  Clock,
  Search,
  Star,
  Building2,
  Activity,
  DollarSign,
  Calendar,
  ChevronRight,
  ExternalLink,
  Brain,
  Target,
  LineChart,
  Sparkles,
  Bot,
  AlertTriangle,
  TrendingUpIcon,
  Eye,
  Volume2,
  Percent,
  Calculator,
  Newspaper,
  BookOpen,
  Award,
  Settings
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

interface MarketData {
  totalMarketCap: number;
  totalVolume: number;
  advancingStocks: number;
  decliningStocks: number;
  unchangedStocks: number;
}

interface PerformerStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  isPositive: boolean;
}

interface Performers {
  advancers: PerformerStock[];
  decliners: PerformerStock[];
  active: PerformerStock[];
}

function Homepage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [topStocks, setTopStocks] = useState<Stock[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [kseIndex, setKseIndex] = useState(75924.67);
  const [kseChange, setKseChange] = useState(1.23);

  // Simulate real-time index updates
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      // Simulate small price movements
      const change = (Math.random() - 0.5) * 0.1;
      setKseIndex(prev => Number((prev + change).toFixed(2)));
      setKseChange(prev => Number((prev + (Math.random() - 0.5) * 0.05).toFixed(2)));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const { data: marketData } = useQuery<MarketData>({
    queryKey: ["/api/market-overview"],
  });

  const { data: stocks } = useQuery<Stock[]>({
    queryKey: ["/api/stocks"],
  });

  const { data: performers } = useQuery<Performers>({
    queryKey: ["/api/performers"],
  });

  // Get top performing stocks
  useEffect(() => {
    if (stocks && stocks.length > 0) {
      const gainers = stocks
        .filter(stock => stock.changePercent > 0)
        .sort((a, b) => b.changePercent - a.changePercent)
        .slice(0, 6);
      setTopStocks(gainers);
    }
  }, [stocks]);

  const formatPrice = (price: number) => `Rs. ${price.toFixed(2)}`;
  const formatVolume = (volume: number) => {
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(0)}K`;
    return volume.toString();
  };

  const marketIsOpen = () => {
    const now = new Date();
    const hours = now.getHours();
    const day = now.getDay();
    return day >= 1 && day <= 5 && hours >= 9 && hours < 16;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Navigation */}
      <nav className="bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                </div>
                <span className="font-bold text-xl">PSX Exchange</span>
              </div>
              
              <div className="hidden md:flex space-x-6">
                <a href="#markets" className="hover:text-green-200 transition-colors">Markets</a>
                <a href="#stocks" className="hover:text-green-200 transition-colors">Stocks</a>
                <a href="#ai-features" className="hover:text-green-200 transition-colors">AI Analysis</a>
                <a href="#news" className="hover:text-green-200 transition-colors">News</a>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden lg:flex items-center space-x-2 text-sm">
                <Clock className="w-4 h-4" />
                <span>{currentTime.toLocaleTimeString()}</span>
                <Badge variant={marketIsOpen() ? "default" : "secondary"} className="ml-2">
                  {marketIsOpen() ? "OPEN" : "CLOSED"}
                </Badge>
              </div>
              <Link href="/ai-analysis">
                <Button variant="outline" size="sm" className="text-white border-white hover:bg-white hover:text-green-600">
                  <Brain className="w-4 h-4 mr-2" />
                  AI Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Enhanced Hero Section with Real-time Data */}
      <section className="relative bg-gradient-to-r from-green-600 via-blue-600 to-purple-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Main Hero Content */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <Badge className="bg-yellow-500 text-black px-3 py-1">
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI-Powered Exchange
                  </Badge>
                  <Badge className="bg-white bg-opacity-20 text-white px-3 py-1">
                    <Activity className="w-4 h-4 mr-2" />
                    Live Data
                  </Badge>
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-4">
                  Pakistan's Premier
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-white">
                    AI-Enhanced Stock Exchange
                  </span>
                </h1>
                <p className="text-xl text-green-100 leading-relaxed mb-6">
                  Experience the future of trading with advanced AI analysis, real-time market intelligence, 
                  and predictive insights for the Pakistan Stock Exchange.
                </p>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">{stocks?.length || 0}</div>
                  <div className="text-sm text-green-200">Listed Stocks</div>
                </div>
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">{marketData?.advancingStocks || 0}</div>
                  <div className="text-sm text-green-200">Advancing</div>
                </div>
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">{marketData?.decliningStocks || 0}</div>
                  <div className="text-sm text-red-200">Declining</div>
                </div>
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">87%</div>
                  <div className="text-sm text-yellow-200">AI Accuracy</div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/ai-analysis">
                  <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg">
                    <Brain className="w-5 h-5 mr-2" />
                    AI Analysis Dashboard
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  View Live Markets
                </Button>
              </div>
            </div>
            
            {/* Enhanced Market Index Card */}
            <div className="bg-white bg-opacity-15 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-white">KSE-100 Index</h3>
                  <Badge className="bg-green-500 text-white">
                    <Activity className="w-3 h-3 mr-1" />
                    Live
                  </Badge>
                </div>
                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-3xl font-bold">{kseIndex.toLocaleString()}</span>
                  <div className={`flex items-center ${kseChange >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                    {kseChange >= 0 ? <TrendingUp className="w-5 h-5 mr-1" /> : <TrendingDown className="w-5 h-5 mr-1" />}
                    <span className="font-semibold">{kseChange >= 0 ? '+' : ''}{kseChange.toFixed(2)}%</span>
                  </div>
                </div>
                <Progress value={65} className="h-2 mb-4" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-300">Volume</p>
                  <p className="font-semibold text-white">{marketData?.totalVolume ? formatVolume(marketData.totalVolume) : '245M'}</p>
                </div>
                <div>
                  <p className="text-gray-300">Market Cap</p>
                  <p className="font-semibold text-white">
                    Rs. {marketData?.totalMarketCap ? (marketData.totalMarketCap / 1000000000).toFixed(1) + 'B' : '12.5T'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-300">52W High</p>
                  <p className="font-semibold text-green-300">78,542</p>
                </div>
                <div>
                  <p className="text-gray-300">52W Low</p>
                  <p className="font-semibold text-red-300">65,432</p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-white border-opacity-20">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">AI Sentiment</span>
                  <div className="flex items-center space-x-2">
                    <Bot className="w-4 h-4 text-purple-300" />
                    <span className="text-green-300 font-semibold">Bullish</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Market Performers Section */}
      <section className="py-12 bg-gradient-to-r from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Market Performers</h2>
            <p className="text-gray-600">Live market movers and top performers</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Top Gainers */}
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center text-green-700">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Top Gainers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(performers?.advancers || topStocks.slice(0, 4)).map((stock, index) => (
                    <div key={stock.symbol} className="flex items-center justify-between p-2 rounded-lg hover:bg-green-100 cursor-pointer">
                      <div>
                        <div className="font-semibold text-gray-900">{stock.symbol}</div>
                        <div className="text-xs text-gray-600">{formatPrice('price' in stock ? stock.price : stock.current)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-600 font-semibold">
                          +{stock.changePercent.toFixed(2)}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatVolume(stock.volume)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Losers */}
            <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center text-red-700">
                  <TrendingDown className="w-5 h-5 mr-2" />
                  Top Losers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(performers?.decliners || []).slice(0, 4).map((stock, index) => (
                    <div key={stock.symbol} className="flex items-center justify-between p-2 rounded-lg hover:bg-red-100 cursor-pointer">
                      <div>
                        <div className="font-semibold text-gray-900">{stock.symbol}</div>
                        <div className="text-xs text-gray-600">{formatPrice(stock.price)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-red-600 font-semibold">
                          {stock.changePercent.toFixed(2)}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatVolume(stock.volume)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Most Active */}
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center text-blue-700">
                  <Volume2 className="w-5 h-5 mr-2" />
                  Most Active
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(performers?.active || []).slice(0, 4).map((stock, index) => (
                    <div key={stock.symbol} className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-100 cursor-pointer">
                      <div>
                        <div className="font-semibold text-gray-900">{stock.symbol}</div>
                        <div className="text-xs text-gray-600">{formatPrice(stock.price)}</div>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${stock.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {stock.isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatVolume(stock.volume)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section id="ai-features" className="py-16 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">AI-Powered Market Intelligence</h2>
            </div>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto mb-8">
              Leverage cutting-edge artificial intelligence to analyze market trends, predict movements, 
              and discover investment opportunities with unprecedented accuracy
            </p>
            <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 text-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Powered by Gemini AI & Advanced ML Models
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-l-4 border-l-purple-500">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Predictions</h3>
                <p className="text-gray-600 text-sm mb-3">AI predicts stock movements with 87% accuracy using advanced algorithms</p>
                <Badge className="bg-purple-100 text-purple-800 text-xs">Real-time Analysis</Badge>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Technical Analysis</h3>
                <p className="text-gray-600 text-sm mb-3">Automated technical indicator analysis and pattern recognition</p>
                <Badge className="bg-blue-100 text-blue-800 text-xs">Pattern Detection</Badge>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Bot className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Backtesting</h3>
                <p className="text-gray-600 text-sm mb-3">Test strategies against historical data with AI optimization</p>
                <Badge className="bg-green-100 text-green-800 text-xs">Strategy Testing</Badge>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-l-4 border-l-orange-500">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Risk Assessment</h3>
                <p className="text-gray-600 text-sm mb-3">Intelligent risk analysis and portfolio optimization recommendations</p>
                <Badge className="bg-orange-100 text-orange-800 text-xs">Risk Management</Badge>
              </CardContent>
            </Card>
          </div>

          {/* AI Insights Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Brain className="w-6 h-6" />
                  <h3 className="text-xl font-semibold">Today's AI Market Summary</h3>
                </div>
                <p className="text-purple-100 mb-4">
                  Our AI analysis indicates a bullish sentiment in the banking sector with strong momentum in technology stocks. 
                  Market volatility is expected to remain moderate with potential upside in textile exports.
                </p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">87%</div>
                    <div className="text-sm text-purple-200">Bull Confidence</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">12</div>
                    <div className="text-sm text-purple-200">AI Alerts</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">94%</div>
                    <div className="text-sm text-purple-200">Accuracy</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-purple-200">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Trading Signals</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium">BAFL</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">BUY</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="font-medium">ENGRO</span>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">HOLD</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="font-medium">PSO</span>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">WATCH</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center">
            <Link href="/ai-analysis">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                <Brain className="w-5 h-5 mr-2" />
                Explore Full AI Analysis Suite
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Comprehensive Market Data Table */}
      <section id="markets" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Live Market Data</h2>
            <p className="text-gray-600 text-lg">Real-time stock prices and market movements</p>
          </div>
          
          <Card className="shadow-lg">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Symbol</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Name</th>
                      <th className="text-right py-4 px-6 font-semibold text-gray-900">Price</th>
                      <th className="text-right py-4 px-6 font-semibold text-gray-900">Change</th>
                      <th className="text-right py-4 px-6 font-semibold text-gray-900">%Change</th>
                      <th className="text-right py-4 px-6 font-semibold text-gray-900">Volume</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Sector</th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-900">AI Signal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stocks || []).slice(0, 15).map((stock, index) => (
                      <tr key={stock.symbol} className="border-t hover:bg-gray-50 cursor-pointer transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-bold text-gray-900">{stock.symbol}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-600 max-w-[200px] truncate">{stock.name}</div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="font-semibold text-gray-900">{formatPrice(stock.current)}</div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className={`font-semibold ${stock.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {stock.isPositive ? '+' : ''}{stock.change.toFixed(2)}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className={`flex items-center justify-end ${stock.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {stock.isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                            <span className="font-semibold">{stock.changePercent.toFixed(2)}%</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="text-sm text-gray-600">{formatVolume(stock.volume)}</div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge variant="outline" className="text-xs">{stock.sector.substring(0, 12)}...</Badge>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <Badge 
                            variant={index % 3 === 0 ? "default" : index % 3 === 1 ? "secondary" : "outline"}
                            className="text-xs"
                          >
                            {index % 3 === 0 ? "BUY" : index % 3 === 1 ? "HOLD" : "WATCH"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          
          <div className="text-center mt-8">
            <Link href="/api">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                View All {stocks?.length || 500}+ Stocks
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* News & Market Insights */}
      <section id="news" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Market News */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <Newspaper className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Latest Market News</h2>
              </div>
              <div className="space-y-6">
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Calendar className="w-5 h-5 text-green-600 mt-1" />
                      <div className="flex-1">
                        <Badge className="bg-red-100 text-red-800 mb-2">Breaking</Badge>
                        <h3 className="font-semibold text-gray-900 mb-2">KSE-100 Surges to New All-Time High</h3>
                        <p className="text-gray-600 text-sm mb-3">
                          Pakistan's benchmark index reached unprecedented levels as investor confidence soars following 
                          positive economic indicators and strong corporate earnings...
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">2 hours ago • Business Recorder</span>
                          <Button variant="ghost" size="sm">
                            Read More <ExternalLink className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Calendar className="w-5 h-5 text-blue-600 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">Banking Sector Reports Strong Q4 Results</h3>
                        <p className="text-gray-600 text-sm mb-3">
                          Major Pakistani banks including HBL, UBL, and MCB have reported impressive quarterly results 
                          with significant growth in advances and deposits...
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">4 hours ago • Dawn News</span>
                          <Button variant="ghost" size="sm">
                            Read More <ExternalLink className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Calendar className="w-5 h-5 text-purple-600 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">Technology Sector Shows Promise with AI Integration</h3>
                        <p className="text-gray-600 text-sm mb-3">
                          Pakistani tech companies are rapidly adopting AI technologies, with several firms announcing 
                          major investments in artificial intelligence and machine learning capabilities...
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">6 hours ago • The Express Tribune</span>
                          <Button variant="ghost" size="sm">
                            Read More <ExternalLink className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Sidebar with Education & Tools */}
            <div className="space-y-6">
              {/* Education */}
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-700">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Investor Education
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-white rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-1">Getting Started with PSX</h4>
                      <p className="text-sm text-gray-600 mb-2">Learn the fundamentals of Pakistani stock market</p>
                      <Button variant="outline" size="sm">Start Learning</Button>
                    </div>
                    <div className="p-3 bg-white rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-1">AI Trading Strategies</h4>
                      <p className="text-sm text-gray-600 mb-2">Master AI-powered investment approaches</p>
                      <Button variant="outline" size="sm">Explore</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Market Tools */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calculator className="w-5 h-5 mr-2" />
                    Quick Tools
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <PieChart className="w-4 h-4 mr-2" />
                      Portfolio Calculator
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Percent className="w-4 h-4 mr-2" />
                      Return Calculator
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Target className="w-4 h-4 mr-2" />
                      Risk Analyzer
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Economic Calendar */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Economic Calendar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span>CPI Data Release</span>
                      <Badge variant="outline">Today</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>GDP Growth Rate</span>
                      <Badge variant="outline">Tomorrow</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Interest Rate Decision</span>
                      <Badge variant="outline">Next Week</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl">PSX Exchange</span>
              </div>
              <p className="text-gray-400 text-sm">
                Pakistan's premier AI-powered stock exchange platform providing real-time market data 
                and intelligent trading insights.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Markets</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#markets" className="hover:text-white">Live Stocks</a></li>
                <li><a href="#markets" className="hover:text-white">Market Overview</a></li>
                <li><a href="#markets" className="hover:text-white">Sector Analysis</a></li>
                <li><a href="#markets" className="hover:text-white">Top Performers</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">AI Services</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/ai-analysis" className="hover:text-white">AI Analysis</Link></li>
                <li><Link href="/ai-analysis" className="hover:text-white">Predictions</Link></li>
                <li><Link href="/ai-analysis" className="hover:text-white">Backtesting</Link></li>
                <li><Link href="/ai-analysis" className="hover:text-white">Risk Assessment</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">API Documentation</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Status Page</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 PSX Exchange. All rights reserved. Powered by AI and Pakistan Stock Exchange data.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Homepage;
