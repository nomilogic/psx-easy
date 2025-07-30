
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ExternalLink, TrendingUp, Globe, DollarSign, Brain, BarChart3 } from "lucide-react";

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
  const newsItems: NewsItem[] = [
    {
      id: '1',
      title: 'PSX Index Hits New High Amid Banking Sector Rally',
      summary: 'Pakistan Stock Exchange benchmark index gains 2.3% as major banks report strong quarterly earnings',
      category: 'Market',
      time: '2 hours ago',
      impact: 'high',
      source: 'Business Recorder',
      imageUrl: '/api/placeholder/300/200'
    },
    {
      id: '2',
      title: 'Technology Stocks Lead Market Performance',
      summary: 'TRG and other tech companies surge following positive earnings announcements and AI integration plans',
      category: 'Technology',
      time: '4 hours ago',
      impact: 'medium',
      source: 'Dawn Business',
    },
    {
      id: '3',
      title: 'SBP Maintains Policy Rate at 15%',
      summary: 'Central bank keeps interest rates unchanged, citing inflation concerns and economic stability',
      category: 'Economy',
      time: '6 hours ago',
      impact: 'high',
      source: 'The News',
    },
    {
      id: '4',
      title: 'Textile Exports Show Strong Growth',
      summary: 'Pakistan textile sector reports 12% increase in exports, boosting related stock prices',
      category: 'Sector',
      time: '8 hours ago',
      impact: 'medium',
      source: 'Express Tribune',
    },
    {
      id: '5',
      title: 'Oil & Gas Exploration Gains Momentum',
      summary: 'New discoveries and higher global oil prices drive energy sector stocks higher',
      category: 'Energy',
      time: '1 day ago',
      impact: 'medium',
      source: 'Daily Times',
    }
  ];

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
                    {newsItems[0].time}
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3">{newsItems[0].title}</h3>
                <p className="text-blue-100 text-lg leading-relaxed mb-4">
                  {newsItems[0].summary}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getCategoryIcon(newsItems[0].category)}
                    <span className="ml-2 font-medium">{newsItems[0].category}</span>
                  </div>
                  <Button variant="secondary" size="sm" className="bg-white/20 text-white hover:bg-white/30 border-white/30">
                    Read More <ExternalLink className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Recent News Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {newsItems.slice(1, 5).map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow duration-200 border-gray-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getImpactColor(item.impact)}>
                        {item.impact.toUpperCase()} IMPACT
                      </Badge>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {item.time}
                      </div>
                    </div>
                    <CardTitle className="text-lg leading-tight hover:text-blue-600 cursor-pointer">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                      {item.summary}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        {getCategoryIcon(item.category)}
                        <span className="ml-1">{item.category}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                        Read <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
