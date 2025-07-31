import { useState } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Newspaper } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ApiDocumentation() {
  const { toast } = useToast();
  const [testingEndpoint, setTestingEndpoint] = useState<string | null>(null);

  const endpoints = [
    {
      method: "GET",
      path: "/api/market/overview",
      description: "Get market overview including total stocks, gainers, losers, and volume data",
      example: {
        totalStocks: 562,
        gainers: 187,
        losers: 245,
        unchanged: 130,
        totalVolume: 24800000
      }
    },
    {
      method: "GET",
      path: "/api/stocks",
      description: "Get all stocks with current prices, changes, and volume data",
      example: [
        {
          symbol: "HBL",
          name: "Habib Bank Limited",
          sector: "BANKS",
          current: 132.50,
          change: 2.35,
          changePercent: 1.8,
          volume: 1200000
        }
      ]
    },
    {
      method: "GET",
      path: "/api/stock/{symbol}/timeseries",
      description: "Get time series data for a specific stock with chart points",
      queryParams: "interval: 1min | 5min | 15min | 30min | 1hour | 1day"
    },
    {
      method: "GET",
      path: "/api/sectors",
      description: "Get top performing sectors with volume data"
    },
    {
      method: "GET",
      path: "/api/performers",
      description: "Get most active stocks, top gainers, and top losers"
    }
  ];

  const testEndpoint = async (endpoint: string) => {
    setTestingEndpoint(endpoint);

    try {
      // Replace {symbol} with a sample symbol for testing
      const testUrl = endpoint.replace('{symbol}', 'HBL');
      const response = await fetch(testUrl);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      toast({
        title: "API Test Successful",
        description: `${endpoint} returned ${Array.isArray(data) ? data.length + ' items' : 'data successfully'}`,
      });
    } catch (error) {
      toast({
        title: "API Test Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setTestingEndpoint(null);
    }
  };

  return (
    <section id="api" className="mb-8">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-900">REST API Endpoints</h3>
          <p className="text-sm text-slate-600">Available endpoints for market data access</p>
        </div>

        <div className="p-6 space-y-6">
           <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Newspaper className="w-5 h-5 mr-2 text-green-600" />
                News API
              </CardTitle>
              <CardDescription>
                Real-time financial news and market updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Badge variant="secondary" className="mb-2">GET</Badge>
                  <code className="bg-gray-100 p-2 rounded block text-sm">
                    /api/news?category=business&country=pk
                  </code>
                  <p className="text-sm text-gray-600 mt-2">
                    Get latest financial news from multiple sources including NewsAPI, RSS feeds, and market analysis.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="w-5 h-5 mr-2 text-blue-600" />
                Market Data API
              </CardTitle>
              <CardDescription>
                Real-time and historical market data endpoints
              </CardDescription>
            </CardHeader>

          {endpoints.map((endpoint, index) => (
            <div key={index} className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary text-white">
                    {endpoint.method}
                  </span>
                  <code className="text-sm font-mono text-slate-900">{endpoint.path}</code>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => testEndpoint(endpoint.path)}
                  disabled={testingEndpoint === endpoint.path}
                  className="text-primary hover:text-primary/80"
                >
                  {testingEndpoint === endpoint.path ? (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-1" />
                  ) : (
                    <Play className="w-4 h-4 mr-1" />
                  )}
                  Test
                </Button>
              </div>
              <p className="text-sm text-slate-600 mb-3">{endpoint.description}</p>
              {endpoint.queryParams && (
                <div className="bg-slate-50 rounded-md p-3 mb-3">
                  <p className="text-xs font-medium text-slate-700 mb-2">Query Parameters:</p>
                  <p className="text-xs font-mono text-slate-600">{endpoint.queryParams}</p>
                </div>
              )}
              {endpoint.example && (
                <div className="bg-slate-50 rounded-md p-3">
                  <p className="text-xs font-medium text-slate-700 mb-2">Response Example:</p>
                  <pre className="text-xs font-mono text-slate-600 overflow-x-auto">
                    {JSON.stringify(endpoint.example, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}