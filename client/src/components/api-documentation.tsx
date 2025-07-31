
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Code, 
  Database, 
  Zap, 
  Shield, 
  Globe, 
  Brain,
  BarChart3,
  TrendingUp,
  PieChart,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  Copy,
  ExternalLink
} from "lucide-react";

export default function APIDocumentation() {
  const endpoints = {
    market: [
      {
        method: "GET",
        path: "/api/market/overview",
        description: "Get comprehensive market summary with key metrics",
        response: "MarketSummary object with gainers, losers, volume, and indices",
        example: `{
  "totalVolume": 125000000,
  "gainers": 85,
  "losers": 45,
  "unchanged": 15
}`
      },
      {
        method: "GET",
        path: "/api/stocks",
        description: "Retrieve all actively traded stocks with real-time prices",
        response: "Array of stock objects with current prices and changes",
        example: `[{
  "symbol": "TRG",
  "name": "The Resource Group",
  "currentPrice": 45.50,
  "changePercent": 2.34,
  "volume": 1250000
}]`
      },
      {
        method: "GET",
        path: "/api/stock/:symbol",
        description: "Get detailed information for a specific stock",
        response: "Detailed stock object with historical data",
        example: `{
  "symbol": "TRG",
  "high": 46.00,
  "low": 44.20,
  "openPrice": 44.80,
  "previousClose": 44.46
}`
      },
      {
        method: "GET",
        path: "/api/sectors",
        description: "Get sector-wise performance and volume data",
        response: "Array of sector objects with performance metrics",
        example: `[{
  "name": "COMMERCIAL BANKS",
  "volume": 115146277,
  "change": 1.25
}]`
      }
    ],
    ai: [
      {
        method: "POST",
        path: "/api/ai-analysis",
        description: "Get AI-powered analysis for individual stocks",
        body: `{
  "symbol": "TRG",
  "format": "html"
}`,
        response: "Comprehensive AI analysis with recommendations",
        example: `{
  "analysis": "<h3>Technical Analysis</h3><p>Strong momentum...</p>",
  "recommendation": "BUY - Strong upward trajectory",
  "targetPrice": 52.50,
  "confidence": 85
}`
      },
      {
        method: "POST",
        path: "/api/market-insights",
        description: "Generate comprehensive market analysis using AI",
        body: `{
  "type": "comprehensive",
  "format": "html"
}`,
        response: "Detailed market insights with HTML formatting",
        example: `{
  "insight": "<h2>Market Overview</h2><p>Today's trading...</p>",
  "marketData": {...}
}`
      },
      {
        method: "POST",
        path: "/api/ai-predictions",
        description: "Get AI-powered price predictions for stocks",
        body: `{
  "symbols": ["TRG", "LUCKY"],
  "timeframe": "1month"
}`,
        response: "Array of predictions with confidence intervals",
        example: `{
  "predictions": [{
    "symbol": "TRG",
    "predictedLow": 48.00,
    "predictedHigh": 55.00,
    "confidence": 78
  }]
}`
      },
      {
        method: "POST",
        path: "/api/ai-portfolio",
        description: "Build optimized portfolio using AI recommendations",
        body: `{
  "riskLevel": "medium",
  "investmentAmount": 100000
}`,
        response: "Portfolio allocation and stock recommendations",
        example: `{
  "allocation": {
    "Banking": 30,
    "Technology": 25,
    "Oil & Gas": 20
  },
  "expectedReturn": "12-18%"
}`
      }
    ],
    news: [
      {
        method: "GET",
        path: "/api/news",
        description: "Get latest financial news and market updates",
        params: "?category=business&country=pk",
        response: "Array of news articles with market impact analysis",
        example: `{
  "news": [{
    "title": "Banking Sector Shows Strong Performance",
    "impact": "high",
    "publishedAt": "2024-01-15T10:30:00Z"
  }]
}`
      }
    ],
    company: [
      {
        method: "GET",
        path: "/api/company/:symbol",
        description: "Get detailed company information and financials",
        response: "Complete company profile with financial data",
        example: `{
  "symbol": "TRG",
  "name": "The Resource Group",
  "sector": "Technology",
  "marketCap": 12500000000,
  "financialData": {...}
}`
      }
    ]
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">API Documentation</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive REST API for Pakistan Stock Exchange data with AI-powered analytics
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-6 bg-white border border-gray-200 rounded-xl p-1">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="market" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Market Data
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              AI Analytics
            </TabsTrigger>
            <TabsTrigger value="news" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              News
            </TabsTrigger>
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Company
            </TabsTrigger>
            <TabsTrigger value="auth" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Authentication
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="border-2 border-blue-200">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="text-2xl flex items-center">
                  <Globe className="w-6 h-6 mr-3 text-blue-600" />
                  PSX API Overview
                </CardTitle>
                <CardDescription className="text-lg">
                  Real-time financial data and AI-powered analytics for Pakistan Stock Exchange
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
                    <Database className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <h3 className="font-bold text-lg text-green-900">Real-time Data</h3>
                    <p className="text-green-700">Live stock prices and market data</p>
                  </div>
                  <div className="text-center p-6 bg-purple-50 rounded-xl border border-purple-200">
                    <Brain className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                    <h3 className="font-bold text-lg text-purple-900">AI Analytics</h3>
                    <p className="text-purple-700">Machine learning insights</p>
                  </div>
                  <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-200">
                    <Clock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="font-bold text-lg text-blue-900">24/7 Availability</h3>
                    <p className="text-blue-700">Always accessible API</p>
                  </div>
                  <div className="text-center p-6 bg-orange-50 rounded-xl border border-orange-200">
                    <Shield className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                    <h3 className="font-bold text-lg text-orange-900">Secure & Reliable</h3>
                    <p className="text-orange-700">Enterprise-grade security</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Base URL</h3>
                  <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
                    <code className="text-blue-600 font-mono">https://your-domain.replit.dev/api</code>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard('https://your-domain.replit.dev/api')}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                        Response Format
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">All responses are in JSON format with proper HTTP status codes.</p>
                      <div className="bg-gray-100 p-4 rounded-lg">
                        <code className="text-sm text-gray-800">
                          {`{
  "data": {...},
  "timestamp": "2024-01-15T10:30:00Z",
  "status": "success"
}`}
                        </code>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
                        Rate Limits
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">API requests are limited to ensure fair usage.</p>
                      <ul className="text-sm text-gray-700 space-y-2">
                        <li>• 1000 requests per hour for market data</li>
                        <li>• 100 requests per hour for AI endpoints</li>
                        <li>• WebSocket connections for real-time updates</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Market Data Endpoints */}
          <TabsContent value="market" className="space-y-6">
            <Card className="border-2 border-green-200">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="text-2xl flex items-center">
                  <BarChart3 className="w-6 h-6 mr-3 text-green-600" />
                  Market Data Endpoints
                </CardTitle>
                <CardDescription>
                  Real-time stock prices, market overview, and sector performance
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">
                  {endpoints.market.map((endpoint, index) => (
                    <Card key={index} className="border border-gray-200">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Badge variant={endpoint.method === 'GET' ? 'default' : 'secondary'}>
                              {endpoint.method}
                            </Badge>
                            <code className="text-blue-600 font-mono text-lg">{endpoint.path}</code>
                          </div>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                        <CardDescription className="text-base">{endpoint.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Response</h4>
                            <p className="text-gray-600 text-sm mb-3">{endpoint.response}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Example Response</h4>
                            <div className="bg-gray-100 p-4 rounded-lg">
                              <pre className="text-xs text-gray-800 overflow-x-auto">
                                {endpoint.example}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Analytics Endpoints */}
          <TabsContent value="ai" className="space-y-6">
            <Card className="border-2 border-purple-200">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50">
                <CardTitle className="text-2xl flex items-center">
                  <Brain className="w-6 h-6 mr-3 text-purple-600" />
                  AI Analytics Endpoints
                </CardTitle>
                <CardDescription>
                  Advanced machine learning powered analysis and predictions
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">
                  {endpoints.ai.map((endpoint, index) => (
                    <Card key={index} className="border border-gray-200">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Badge variant="destructive">
                              {endpoint.method}
                            </Badge>
                            <code className="text-purple-600 font-mono text-lg">{endpoint.path}</code>
                          </div>
                          <Badge className="bg-purple-100 text-purple-800">AI Powered</Badge>
                        </div>
                        <CardDescription className="text-base">{endpoint.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Request Body</h4>
                            <div className="bg-gray-100 p-4 rounded-lg">
                              <pre className="text-xs text-gray-800">
                                {endpoint.body}
                              </pre>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Response</h4>
                            <p className="text-gray-600 text-sm">{endpoint.response}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Example</h4>
                            <div className="bg-gray-100 p-4 rounded-lg">
                              <pre className="text-xs text-gray-800 overflow-x-auto">
                                {endpoint.example}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* News Endpoints */}
          <TabsContent value="news" className="space-y-6">
            <Card className="border-2 border-blue-200">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                <CardTitle className="text-2xl flex items-center">
                  <Activity className="w-6 h-6 mr-3 text-blue-600" />
                  News & Updates
                </CardTitle>
                <CardDescription>
                  Financial news aggregation with market impact analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">
                  {endpoints.news.map((endpoint, index) => (
                    <Card key={index} className="border border-gray-200">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Badge variant="default">
                              {endpoint.method}
                            </Badge>
                            <code className="text-blue-600 font-mono text-lg">{endpoint.path}</code>
                          </div>
                          <Badge className="bg-blue-100 text-blue-800">Real-time</Badge>
                        </div>
                        <CardDescription className="text-base">{endpoint.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Parameters</h4>
                            <p className="text-gray-600 text-sm mb-3">{endpoint.params}</p>
                            <h4 className="font-semibold text-gray-900 mb-2">Response</h4>
                            <p className="text-gray-600 text-sm">{endpoint.response}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Example Response</h4>
                            <div className="bg-gray-100 p-4 rounded-lg">
                              <pre className="text-xs text-gray-800 overflow-x-auto">
                                {endpoint.example}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Company Endpoints */}
          <TabsContent value="company" className="space-y-6">
            <Card className="border-2 border-orange-200">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
                <CardTitle className="text-2xl flex items-center">
                  <Database className="w-6 h-6 mr-3 text-orange-600" />
                  Company Information
                </CardTitle>
                <CardDescription>
                  Detailed company profiles, financials, and equity information
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">
                  {endpoints.company.map((endpoint, index) => (
                    <Card key={index} className="border border-gray-200">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Badge variant="default">
                              GET
                            </Badge>
                            <code className="text-orange-600 font-mono text-lg">{endpoint.path}</code>
                          </div>
                          <Badge className="bg-orange-100 text-orange-800">Detailed</Badge>
                        </div>
                        <CardDescription className="text-base">{endpoint.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Response</h4>
                            <p className="text-gray-600 text-sm">{endpoint.response}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Example Response</h4>
                            <div className="bg-gray-100 p-4 rounded-lg">
                              <pre className="text-xs text-gray-800 overflow-x-auto">
                                {endpoint.example}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Authentication */}
          <TabsContent value="auth" className="space-y-6">
            <Card className="border-2 border-red-200">
              <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50">
                <CardTitle className="text-2xl flex items-center">
                  <Shield className="w-6 h-6 mr-3 text-red-600" />
                  Authentication & Security
                </CardTitle>
                <CardDescription>
                  API authentication methods and security best practices
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Zap className="w-5 h-5 mr-2 text-blue-600" />
                        API Key Authentication
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">Include your API key in the request headers:</p>
                      <div className="bg-gray-100 p-4 rounded-lg">
                        <code className="text-sm text-gray-800">
                          {`Authorization: Bearer YOUR_API_KEY
Content-Type: application/json`}
                        </code>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Shield className="w-5 h-5 mr-2 text-green-600" />
                        Rate Limiting
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">API usage is monitored and limited:</p>
                      <ul className="text-sm text-gray-700 space-y-2">
                        <li>• Standard: 1000 req/hour</li>
                        <li>• AI endpoints: 100 req/hour</li>
                        <li>• WebSocket: Unlimited</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <Card className="mt-8">
                  <CardHeader>
                    <CardTitle>WebSocket Connection</CardTitle>
                    <CardDescription>Real-time data streaming for live updates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <code className="text-sm text-gray-800">
                        {`const ws = new WebSocket('wss://your-domain.replit.dev/ws');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle real-time market updates
};`}
                      </code>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
