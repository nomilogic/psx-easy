import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  ExternalLink
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

function Homepage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [topStocks, setTopStocks] = useState<Stock[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: marketData } = useQuery<MarketData>({
    queryKey: ["/api/market-overview"],
  });

  const { data: stocks } = useQuery<Stock[]>({
    queryKey: ["/api/stocks"],
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
    // PSX trading hours: 9:15 AM to 3:30 PM, Monday to Friday
    return day >= 1 && day <= 5 && hours >= 9 && hours < 16;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Navigation */}
      <nav className="bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg">
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
                <Link href="#markets" className="hover:text-green-200 transition-colors">Markets</Link>
                <Link href="#stocks" className="hover:text-green-200 transition-colors">Stocks</Link>
                <Link href="#news" className="hover:text-green-200 transition-colors">News</Link>
                <Link href="#education" className="hover:text-green-200 transition-colors">Education</Link>
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
              <Link href="/api">
                <Button variant="outline" size="sm" className="text-white border-white hover:bg-white hover:text-green-600">
                  API Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-green-600 via-blue-600 to-green-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h1 className="text-5xl font-bold leading-tight mb-4">
                  Pakistan's Premier
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-white">
                    Stock Exchange
                  </span>
                </h1>
                <p className="text-xl text-green-100 leading-relaxed">
                  Access real-time market data, comprehensive stock analysis, and professional trading tools 
                  for the Pakistan Stock Exchange. Your gateway to Pakistani capital markets.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 shadow-lg">
                  <Play className="w-5 h-5 mr-2" />
                  Start Trading
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  View Markets
                </Button>
              </div>
              
              <div className="flex items-center space-x-8 text-sm">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-green-300" />
                  <span>SECP Regulated</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-yellow-300" />
                  <span>Real-time Data</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-blue-300" />
                  <span>Global Access</span>
                </div>
              </div>
            </div>
            
            {/* Market Summary Card */}
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">KSE-100 Index</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-3xl font-bold">75,924.67</span>
                  <div className="flex items-center text-green-300">
                    <TrendingUp className="w-5 h-5 mr-1" />
                    <span>+1.23%</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-300">Volume</p>
                  <p className="font-semibold">{marketData?.totalVolume ? formatVolume(marketData.totalVolume) : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-300">Market Cap</p>
                  <p className="font-semibold">
                    Rs. {marketData?.totalMarketCap ? (marketData.totalMarketCap / 1000000000).toFixed(1) + 'B' : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-300">Advances</p>
                  <p className="font-semibold text-green-300">{marketData?.advancingStocks || 0}</p>
                </div>
                <div>
                  <p className="text-gray-300">Declines</p>
                  <p className="font-semibold text-red-300">{marketData?.decliningStocks || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Market Data Table Section */}
      <section id="market-data" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Live Market Data</h2>
            <p className="text-gray-600 text-lg">Real-time stock prices updated every 30 seconds</p>
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
                      <th className="text-right py-4 px-6 font-semibold text-gray-900">Volume</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Sector</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stocks || []).slice(0, 10).map((stock, index) => (
                      <tr key={stock.symbol} className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => window.location.href = `/stock/${stock.symbol}`}>
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
                          <div className={`flex items-center justify-end ${stock.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {stock.isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                            <span className="font-semibold">{stock.changePercent.toFixed(2)}%</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="text-sm text-gray-600">{formatVolume(stock.volume)}</div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge variant="outline" className="text-xs">{stock.sector.substring(0, 15)}...</Badge>
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
                View All {stocks?.length || 0} Stocks
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* AI-Powered Analysis Section */}
      <section className="py-16 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">AI-Powered Market Intelligence</h2>
            </div>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Leverage advanced artificial intelligence to analyze market trends, predict stock movements, 
              and discover investment opportunities in Pakistan Stock Exchange
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Stock Analysis</h3>
                <p className="text-gray-600 mb-4">AI-driven analysis of individual stocks with technical indicators, fundamentals, and market sentiment</p>
                <Badge className="bg-purple-100 text-purple-800">Powered by Gemini AI</Badge>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Predictive Insights</h3>
                <p className="text-gray-600 mb-4">Machine learning models predict price movements and identify emerging market trends</p>
                <Badge className="bg-blue-100 text-blue-800">Real-time Predictions</Badge>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Portfolio Optimization</h3>
                <p className="text-gray-600 mb-4">AI recommendations for portfolio diversification and risk management strategies</p>
                <Badge className="bg-green-100 text-green-800">Risk Assessment</Badge>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center">
            <Link href="/ai-analysis">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                <Activity className="w-5 h-5 mr-2" />
                Explore AI Analysis Dashboard
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Top Gainers Section */}
      <section id="stocks" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Today's Top Performers</h2>
            <p className="text-gray-600 text-lg">Leading stocks driving the market today</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topStocks.map((stock, index) => (
              <Link key={stock.symbol} href={`/stock/${stock.symbol}`}>
                <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-l-4 border-l-green-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{stock.symbol}</h3>
                        <p className="text-sm text-gray-600 truncate max-w-[200px]">{stock.name}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        #{index + 1}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-gray-900">
                          {formatPrice(stock.current)}
                        </span>
                        <div className="flex items-center text-green-600">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          <span className="font-semibold">+{stock.changePercent.toFixed(2)}%</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Volume: {formatVolume(stock.volume)}</span>
                        <span>Sector: {stock.sector}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link href="/api">
              <Button variant="outline" size="lg">
                View All Stocks
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Market Features Section */}
      <section id="markets" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Comprehensive Market Access</h2>
            <p className="text-gray-600 text-lg">Everything you need to trade and invest in Pakistani markets</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Data</h3>
              <p className="text-gray-600">Live stock prices, market indices, and trading volumes updated every second</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <PieChart className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Market Analysis</h3>
              <p className="text-gray-600">Comprehensive analysis tools with technical indicators and charts</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Company Profiles</h3>
              <p className="text-gray-600">Detailed company information, financials, and corporate announcements</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Portfolio Tracking</h3>
              <p className="text-gray-600">Track your investments and monitor portfolio performance in real-time</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Search Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Find Any Stock Instantly</h2>
          <p className="text-gray-600 text-lg mb-8">Search from over 500+ listed companies on Pakistan Stock Exchange</p>
          
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search stocks by symbol or company name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 text-lg rounded-full border-2 border-gray-200 focus:border-green-500"
            />
          </div>
          
          <div className="mt-6">
            <Link href="/api">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                Access Full Market Data
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* News & Education Section */}
      <section id="news" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Market News */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Latest Market News</h2>
              <div className="space-y-4">
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Calendar className="w-5 h-5 text-green-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">KSE-100 Reaches New High Amid Economic Recovery</h3>
                        <p className="text-gray-600 text-sm mb-3">Pakistan's benchmark index surged to record levels as investor confidence grows...</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">2 hours ago</span>
                          <Button variant="ghost" size="sm">
                            Read More
                            <ExternalLink className="w-3 h-3 ml-1" />
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
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Banking Sector Shows Strong Growth</h3>
                        <p className="text-gray-600 text-sm mb-3">Major banks report impressive quarterly results driving sector performance...</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">4 hours ago</span>
                          <Button variant="ghost" size="sm">
                            Read More
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Education */}
            <div id="education">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Investor Education</h2>
              <div className="space-y-4">
                <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <h3 className="font-semibold text-gray-900">Getting Started with PSX</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">Learn the basics of stock market investing in Pakistan</p>
                    <Button variant="outline" size="sm">Start Learning</Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <DollarSign className="w-5 h-5 text-green-500" />
                      <h3 className="font-semibold text-gray-900">Investment Strategies</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">Discover proven investment approaches for Pakistani markets</p>
                    <Button variant="outline" size="sm">Explore Strategies</Button>
                  </CardContent>
                </Card>
              </div>
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
                Pakistan's premier stock exchange platform providing real-time market data and comprehensive trading tools.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Markets</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/api" className="hover:text-white">Live Stocks</Link></li>
                <li><Link href="/api" className="hover:text-white">Market Overview</Link></li>
                <li><Link href="/api" className="hover:text-white">Sector Analysis</Link></li>
                <li><Link href="/api" className="hover:text-white">Top Performers</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/api" className="hover:text-white">API Access</Link></li>
                <li><Link href="/api" className="hover:text-white">Real-time Data</Link></li>
                <li><Link href="/api" className="hover:text-white">Portfolio Tracking</Link></li>
                <li><Link href="/api" className="hover:text-white">Market Alerts</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Status Page</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 PSX Exchange. All rights reserved. Powered by Pakistan Stock Exchange data.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Homepage;