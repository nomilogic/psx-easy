import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, ExternalLink, TrendingUp, Globe, DollarSign, Brain, BarChart3, Newspaper, RefreshCw } from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  time: string;
  impact: 'high' | 'medium' | 'low';
  source: string;
  imageUrl?: string;
}

export default function NewsSection() {
  const { data: newsData, isLoading: newsLoading, refetch: refetchNews } = useQuery({
    queryKey: ["/api/news"],
    queryFn: async () => {
      const response = await fetch("/api/news?category=business&country=pk");
      if (!response.ok) throw new Error('Failed to fetch news');
      return response.json();
    },
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  const news = newsData?.news || [];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'market': return <TrendingUp className="w-4 h-4" />;
      case 'technology': return <Globe className="w-4 h-4" />;
      case 'economy': return <DollarSign className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Latest Market News</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay informed with real-time market updates, economic insights, and sector analysis 
            powered by our AI news aggregation system.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Featured News */}
          <div className="lg:col-span-2">
            <Card className="mb-6 overflow-hidden border-blue-200 shadow-lg">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                <div className="flex items-center mb-4">
                  <Badge className="bg-white/20 text-white border-white/30 mr-3">
                    Featured
                  </Badge>
                  <div className="flex items-center text-blue-100">
                    <Clock className="w-4 h-4 mr-1" />
                    {news.length > 0 ? new Date(news[0].publishedAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      }) : 'Loading...'}
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3">{news.length > 0 ? news[0].title : 'Loading...'}</h3>
                <p className="text-blue-100 text-lg leading-relaxed mb-4">
                  {news.length > 0 ? news[0].description : 'Loading...'}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {news.length > 0 ? getCategoryIcon(news[0].category) : <Globe className="w-4 h-4" />}
                    <span className="ml-2 font-medium">{news.length > 0 ? news[0].category : 'Loading...'}</span>
                  </div>
                  <Button variant="secondary" size="sm" className="bg-white/20 text-white hover:bg-white/30 border-white/30">
                    Read More <ExternalLink className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Recent News Grid */}
            {newsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
              {news.slice(1, 5).map((article, index) => (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={`${getImpactColor(article.impact)} text-xs font-medium`}>
                      {article.impact} impact
                    </Badge>
                    <div className="flex items-center text-gray-500 text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(article.publishedAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                  <CardTitle className="text-lg group-hover:text-blue-600 transition-colors line-clamp-2">
                    {article.title}
                  </CardTitle>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    {getCategoryIcon(article.category)}
                    <span className="capitalize">{article.category}</span>
                    <span>•</span>
                    <span>{article.source}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 line-clamp-3 leading-relaxed">
                    {article.description}
                  </CardDescription>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto mt-3 text-blue-600 hover:text-blue-800 font-medium"
                    asChild
                  >
                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                      Read more
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
              ))}
            </div>
          )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Market Alerts */}
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-lg text-orange-800 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Market Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-white rounded-lg border border-orange-200">
                  <p className="font-medium text-orange-800 text-sm">High Volume Alert</p>
                  <p className="text-orange-700 text-xs">TRG trading volume up 340% today</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-orange-200">
                  <p className="font-medium text-orange-800 text-sm">Price Movement</p>
                  <p className="text-orange-700 text-xs">Banking sector up 2.8% in last hour</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-orange-200">
                  <p className="font-medium text-orange-800 text-sm">Economic Indicator</p>
                  <p className="text-orange-700 text-xs">Inflation data release pending</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start text-left">
                  <Brain className="w-4 h-4 mr-2" />
                  AI Market Sentiment
                </Button>
                <Button variant="outline" className="w-full justify-start text-left">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Sector Performance
                </Button>
                <Button variant="outline" className="w-full justify-start text-left">
                  <Globe className="w-4 h-4 mr-2" />
                  Global Markets
                </Button>
                <Button variant="outline" className="w-full justify-start text-left">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Currency Rates
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
```This code integrates a real news API to display market news, enhancing the original static content.
<replit_final_file>
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, ExternalLink, TrendingUp, Globe, DollarSign, Brain, BarChart3, Newspaper, RefreshCw } from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  time: string;
  impact: 'high' | 'medium' | 'low';
  source: string;
  imageUrl?: string;
}

export default function NewsSection() {
  const { data: newsData, isLoading: newsLoading, refetch: refetchNews } = useQuery({
    queryKey: ["/api/news"],
    queryFn: async () => {
      const response = await fetch("/api/news?category=business&country=pk");
      if (!response.ok) throw new Error('Failed to fetch news');
      return response.json();
    },
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  const news = newsData?.news || [];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'market': return <TrendingUp className="w-4 h-4" />;
      case 'technology': return <Globe className="w-4 h-4" />;
      case 'economy': return <DollarSign className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Latest Market News</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay informed with real-time market updates, economic insights, and sector analysis 
            powered by our AI news aggregation system.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Featured News */}
          <div className="lg:col-span-2">
            <Card className="mb-6 overflow-hidden border-blue-200 shadow-lg">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                <div className="flex items-center mb-4">
                  <Badge className="bg-white/20 text-white border-white/30 mr-3">
                    Featured
                  </Badge>
                  <div className="flex items-center text-blue-100">
                    <Clock className="w-4 h-4 mr-1" />
                    {news.length > 0 ? new Date(news[0].publishedAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      }) : 'Loading...'}
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3">{news.length > 0 ? news[0].title : 'Loading...'}</h3>
                <p className="text-blue-100 text-lg leading-relaxed mb-4">
                  {news.length > 0 ? news[0].description : 'Loading...'}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {news.length > 0 ? getCategoryIcon(news[0].category) : <Globe className="w-4 h-4" />}
                    <span className="ml-2 font-medium">{news.length > 0 ? news[0].category : 'Loading...'}</span>
                  </div>
                  <Button variant="secondary" size="sm" className="bg-white/20 text-white hover:bg-white/30 border-white/30">
                    Read More <ExternalLink className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Recent News Grid */}
            {newsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
              {news.slice(1, 5).map((article, index) => (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={`${getImpactColor(article.impact)} text-xs font-medium`}>
                      {article.impact} impact
                    </Badge>
                    <div className="flex items-center text-gray-500 text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(article.publishedAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                  <CardTitle className="text-lg group-hover:text-blue-600 transition-colors line-clamp-2">
                    {article.title}
                  </CardTitle>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    {getCategoryIcon(article.category)}
                    <span className="capitalize">{article.category}</span>
                    <span>•</span>
                    <span>{article.source}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 line-clamp-3 leading-relaxed">
                    {article.description}
                  </CardDescription>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto mt-3 text-blue-600 hover:text-blue-800 font-medium"
                    asChild
                  >
                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                      Read more
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
              ))}
            </div>
          )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Market Alerts */}
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-lg text-orange-800 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Market Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-white rounded-lg border border-orange-200">
                  <p className="font-medium text-orange-800 text-sm">High Volume Alert</p>
                  <p className="text-orange-700 text-xs">TRG trading volume up 340% today</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-orange-200">
                  <p className="font-medium text-orange-800 text-sm">Price Movement</p>
                  <p className="text-orange-700 text-xs">Banking sector up 2.8% in last hour</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-orange-200">
                  <p className="font-medium text-orange-800 text-sm">Economic Indicator</p>
                  <p className="text-orange-700 text-xs">Inflation data release pending</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start text-left">
                  <Brain className="w-4 h-4 mr-2" />
                  AI Market Sentiment
                </Button>
                <Button variant="outline" className="w-full justify-start text-left">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Sector Performance
                </Button>
                <Button variant="outline" className="w-full justify-start text-left">
                  <Globe className="w-4 h-4 mr-2" />
                  Global Markets
                </Button>
                <Button variant="outline" className="w-full justify-start text-left">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Currency Rates
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}