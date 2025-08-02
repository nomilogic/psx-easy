import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Target, 
  BarChart3, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Star,
  Globe,
  Building,
  DollarSign,
  ArrowUpDown,
  Zap,
  Brain,
  LineChart,
  PieChart,
  Info
} from "lucide-react";

interface StockAnalysis {
  stock: {
    ticker: string;
    company_name: string;
    exchange: string;
    sector: string;
    country: string;
    currency: string;
    website: string;
    logo_url: string;
  };
  when_was_this_analysis_generated: string;
  what_is_the_current_trend: "Bullish" | "Bearish" | "Neutral";
  what_are_the_latest_prices_and_chart_data: {
    latest_close: number;
    "52_week_high": number;
    "52_week_low": number;
    daily_high: number;
    daily_low: number;
    volume: number;
  };
  what_are_the_technical_indicators_saying: {
    rsi: {
      value: number;
      interpretation: "Overbought" | "Oversold" | "Neutral";
    };
    macd: {
      line: number;
      signal: number;
      histogram: number;
      trend: "Bullish" | "Bearish" | "Neutral";
    };
    moving_averages: {
      "20_day": number;
      "50_day": number;
      "200_day": number;
      signal: "Golden Cross" | "Death Cross" | "Neutral";
    };
    bollinger_bands: {
      upper: number;
      lower: number;
      status: "Above Upper" | "Below Lower" | "Within Range";
    };
  };
  what_patterns_have_been_detected: Array<{
    pattern: string;
    confidence: "High" | "Moderate" | "Low";
    signal: "Bullish" | "Bearish" | "Neutral";
    detected_from: string;
    to: string;
  }>;
  what_is_the_short_term_outlook: {
    bias: "Bullish" | "Bearish" | "Neutral";
    momentum: "Rising" | "Falling" | "Flat";
    support_levels: number[];
    resistance_levels: number[];
    volatility: "Low" | "Medium" | "High";
    investment_window_days: number;
  };
  what_is_the_long_term_outlook: {
    trend: "Uptrend" | "Downtrend" | "Sideways";
    valuation: "Undervalued" | "Overvalued" | "Fairly Priced";
    macro_sentiment: "Positive" | "Negative" | "Neutral";
    industry_position: "Outperforming" | "Underperforming" | "Average";
    holding_period_months: number;
  };
  what_do_ai_models_predict_for_future: {
    forecast_range: {
      low: number;
      expected: number;
      high: number;
    };
    ai_rating: "Strong Buy" | "Buy" | "Hold" | "Sell" | "Strong Sell";
    confidence: number;
    investment_type: "Growth" | "Value" | "Dividend" | "Balanced" | "Speculative";
    potential_risks: string[];
    growth_drivers: string[];
  };
  how_has_the_stock_performed_in_past_2_years: {
    price_change_percent: number;
    volatility_30d_avg: number;
    market_cap_growth: string;
    dividend_yield_avg: string;
    key_news_events: Array<{
      date: string;
      title: string;
      impact: "Strong Positive" | "Positive" | "Neutral" | "Negative" | "Strong Negative";
    }>;
    notable_trends: Array<{
      type: "Recovery" | "Bull Run" | "Bear Run" | "Sideways";
      from: string;
      to: string;
      description: string;
    }>;
  };
  what_are_the_analysts_saying: {
    analyst_sentiment: "Buy" | "Hold" | "Sell";
    target_range: {
      low: number;
      avg: number;
      high: number;
    };
    analysts_covered: number;
    summary: string;
  };
  are_there_any_alerts_or_watch_tags: {
    tags: string[];
    alerts: Array<{
      type: string;
      triggered_on: string;
      description: string;
    }>;
  };
  is_this_stock_exposed_to_global_risks: {
    exports_percent: number;
    currency_risk: "High" | "Moderate" | "Low";
    foreign_ownership: string[];
    geo_dependency: string[];
  };
  meta: {
    source: string;
    model_version: string;
    schema_version: string;
    generated_on: string;
    language: string;
  };
}

export default function AIAnalysisComprehensive() {
  const [searchSymbol, setSearchSymbol] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState("");

  // Fetch available symbols
  const { data: symbols = [] } = useQuery({
    queryKey: ["/api/symbols"],
    select: (data: any[]) => data.slice(0, 50) // Limit for performance
  });

  // AI Stock Analysis mutation
  const analysisMutation = useMutation({
    mutationFn: async (symbol: string): Promise<StockAnalysis> => {
      const response = await fetch(`/api/ai-stock-analysis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, format: "json" })
      });
      
      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }
      
      return response.json();
    }
  });

  const handleAnalyze = (symbol: string) => {
    setSelectedSymbol(symbol);
    analysisMutation.mutate(symbol);
  };

  const filteredSymbols = symbols.filter((s: any) =>
    s.symbol.toLowerCase().includes(searchSymbol.toLowerCase()) ||
    s.name?.toLowerCase().includes(searchSymbol.toLowerCase())
  );

  const analysis = analysisMutation.data;
  const isLoading = analysisMutation.isPending;
  const error = analysisMutation.error;

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "Bullish": case "Buy": case "Strong Buy": return "text-green-600 dark:text-green-400";
      case "Bearish": case "Sell": case "Strong Sell": return "text-red-600 dark:text-red-400";
      default: return "text-yellow-600 dark:text-yellow-400";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "Bullish": case "Buy": case "Strong Buy": return <TrendingUp className="w-4 h-4" />;
      case "Bearish": case "Sell": case "Strong Sell": return <TrendingDown className="w-4 h-4" />;
      default: return <ArrowUpDown className="w-4 h-4" />;
    }
  };

  const getRatingBadgeVariant = (rating: string) => {
    switch (rating) {
      case "Strong Buy": case "Buy": return "default";
      case "Strong Sell": case "Sell": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Comprehensive AI Stock Analysis
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Get detailed AI-powered analysis of PSX stocks with real-time data, technical indicators, predictions, and investment recommendations.
        </p>
      </div>

      {/* Stock Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Select Stock for Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search by symbol or company name..."
                value={searchSymbol}
                onChange={(e) => setSearchSymbol(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-48 overflow-y-auto">
            {filteredSymbols.slice(0, 24).map((symbol: any) => (
              <Button
                key={symbol.symbol}
                variant={selectedSymbol === symbol.symbol ? "default" : "outline"}
                size="sm"
                onClick={() => handleAnalyze(symbol.symbol)}
                className="justify-start"
                disabled={isLoading}
              >
                {symbol.symbol}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Brain className="w-12 h-12 mx-auto animate-pulse text-blue-600" />
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Analyzing {selectedSymbol}...</h3>
                <p className="text-muted-foreground">
                  AI is processing real-time market data, technical indicators, and generating comprehensive insights
                </p>
                <Progress value={60} className="w-64 mx-auto" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Alert className="border-red-200 bg-red-50 dark:bg-red-950">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to analyze {selectedSymbol}. {error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                    {analysis.stock.ticker.substring(0, 2)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{analysis.stock.ticker}</h2>
                    <p className="text-muted-foreground">{analysis.stock.company_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{analysis.stock.sector}</Badge>
                      <Badge variant="outline">{analysis.stock.exchange}</Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`flex items-center gap-2 ${getTrendColor(analysis.what_is_the_current_trend)}`}>
                    {getTrendIcon(analysis.what_is_the_current_trend)}
                    <span className="text-lg font-semibold">{analysis.what_is_the_current_trend}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Generated: {analysis.when_was_this_analysis_generated}
                  </p>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Current Price</p>
                  <p className="text-xl font-bold">Rs. {analysis.what_are_the_latest_prices_and_chart_data.latest_close.toFixed(2)}</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">AI Rating</p>
                  <Badge variant={getRatingBadgeVariant(analysis.what_do_ai_models_predict_for_future.ai_rating)} className="text-sm">
                    {analysis.what_do_ai_models_predict_for_future.ai_rating}
                  </Badge>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Confidence</p>
                  <p className="text-xl font-bold">{(analysis.what_do_ai_models_predict_for_future.confidence * 100).toFixed(0)}%</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Investment Type</p>
                  <p className="text-sm font-medium">{analysis.what_do_ai_models_predict_for_future.investment_type}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Analysis Tabs */}
          <Tabs defaultValue="technical" className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="technical" className="flex items-center gap-1">
                <LineChart className="w-4 h-4" />
                Technical
              </TabsTrigger>
              <TabsTrigger value="outlook" className="flex items-center gap-1">
                <Target className="w-4 h-4" />
                Outlook
              </TabsTrigger>
              <TabsTrigger value="predictions" className="flex items-center gap-1">
                <Brain className="w-4 h-4" />
                AI Forecast
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center gap-1">
                <BarChart3 className="w-4 h-4" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="analysts" className="flex items-center gap-1">
                <Star className="w-4 h-4" />
                Analysts
              </TabsTrigger>
              <TabsTrigger value="alerts" className="flex items-center gap-1">
                <Zap className="w-4 h-4" />
                Alerts
              </TabsTrigger>
              <TabsTrigger value="risks" className="flex items-center gap-1">
                <Globe className="w-4 h-4" />
                Risks
              </TabsTrigger>
            </TabsList>

            {/* Technical Analysis */}
            <TabsContent value="technical" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Price Data */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Latest Prices & Chart Data
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Latest Close</p>
                        <p className="text-lg font-semibold">Rs. {analysis.what_are_the_latest_prices_and_chart_data.latest_close.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Volume</p>
                        <p className="text-lg font-semibold">{analysis.what_are_the_latest_prices_and_chart_data.volume.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Daily High</p>
                        <p className="text-lg font-semibold text-green-600">Rs. {analysis.what_are_the_latest_prices_and_chart_data.daily_high.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Daily Low</p>
                        <p className="text-lg font-semibold text-red-600">Rs. {analysis.what_are_the_latest_prices_and_chart_data.daily_low.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">52W High</p>
                        <p className="text-lg font-semibold">Rs. {analysis.what_are_the_latest_prices_and_chart_data["52_week_high"].toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">52W Low</p>
                        <p className="text-lg font-semibold">Rs. {analysis.what_are_the_latest_prices_and_chart_data["52_week_low"].toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Technical Indicators */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Technical Indicators
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* RSI */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">RSI</span>
                        <Badge variant={
                          analysis.what_are_the_technical_indicators_saying.rsi.interpretation === "Overbought" ? "destructive" :
                          analysis.what_are_the_technical_indicators_saying.rsi.interpretation === "Oversold" ? "default" : "secondary"
                        }>
                          {analysis.what_are_the_technical_indicators_saying.rsi.interpretation}
                        </Badge>
                      </div>
                      <Progress value={analysis.what_are_the_technical_indicators_saying.rsi.value} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">{analysis.what_are_the_technical_indicators_saying.rsi.value}</p>
                    </div>

                    {/* MACD */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">MACD</span>
                        <Badge variant={
                          analysis.what_are_the_technical_indicators_saying.macd.trend === "Bullish" ? "default" :
                          analysis.what_are_the_technical_indicators_saying.macd.trend === "Bearish" ? "destructive" : "secondary"
                        }>
                          {analysis.what_are_the_technical_indicators_saying.macd.trend}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">Line</p>
                          <p className="font-medium">{analysis.what_are_the_technical_indicators_saying.macd.line.toFixed(3)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Signal</p>
                          <p className="font-medium">{analysis.what_are_the_technical_indicators_saying.macd.signal.toFixed(3)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Histogram</p>
                          <p className="font-medium">{analysis.what_are_the_technical_indicators_saying.macd.histogram.toFixed(3)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Moving Averages */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Moving Averages</span>
                        <Badge variant={
                          analysis.what_are_the_technical_indicators_saying.moving_averages.signal === "Golden Cross" ? "default" :
                          analysis.what_are_the_technical_indicators_saying.moving_averages.signal === "Death Cross" ? "destructive" : "secondary"
                        }>
                          {analysis.what_are_the_technical_indicators_saying.moving_averages.signal}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">20-day</p>
                          <p className="font-medium">Rs. {analysis.what_are_the_technical_indicators_saying.moving_averages["20_day"].toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">50-day</p>
                          <p className="font-medium">Rs. {analysis.what_are_the_technical_indicators_saying.moving_averages["50_day"].toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">200-day</p>
                          <p className="font-medium">Rs. {analysis.what_are_the_technical_indicators_saying.moving_averages["200_day"].toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Bollinger Bands */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Bollinger Bands</span>
                        <Badge variant="outline">{analysis.what_are_the_technical_indicators_saying.bollinger_bands.status}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">Upper</p>
                          <p className="font-medium">Rs. {analysis.what_are_the_technical_indicators_saying.bollinger_bands.upper.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Lower</p>
                          <p className="font-medium">Rs. {analysis.what_are_the_technical_indicators_saying.bollinger_bands.lower.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Patterns Detected */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Patterns Detected
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {analysis.what_patterns_have_been_detected.map((pattern, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{pattern.pattern}</h4>
                          <Badge variant={
                            pattern.signal === "Bullish" ? "default" :
                            pattern.signal === "Bearish" ? "destructive" : "secondary"
                          }>
                            {pattern.signal}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>Confidence: {pattern.confidence}</p>
                          <p>Period: {pattern.detected_from} to {pattern.to}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Outlook */}
            <TabsContent value="outlook" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Short Term */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Short Term Outlook ({analysis.what_is_the_short_term_outlook.investment_window_days} days)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Bias</p>
                        <div className={`flex items-center gap-2 ${getTrendColor(analysis.what_is_the_short_term_outlook.bias)}`}>
                          {getTrendIcon(analysis.what_is_the_short_term_outlook.bias)}
                          <span className="font-semibold">{analysis.what_is_the_short_term_outlook.bias}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Momentum</p>
                        <p className="font-semibold">{analysis.what_is_the_short_term_outlook.momentum}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Volatility</p>
                        <Badge variant={
                          analysis.what_is_the_short_term_outlook.volatility === "High" ? "destructive" :
                          analysis.what_is_the_short_term_outlook.volatility === "Medium" ? "default" : "secondary"
                        }>
                          {analysis.what_is_the_short_term_outlook.volatility}
                        </Badge>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Support Levels</p>
                      <div className="flex gap-2">
                        {analysis.what_is_the_short_term_outlook.support_levels.map((level, index) => (
                          <Badge key={index} variant="outline" className="text-green-600">
                            Rs. {level.toFixed(2)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Resistance Levels</p>
                      <div className="flex gap-2">
                        {analysis.what_is_the_short_term_outlook.resistance_levels.map((level, index) => (
                          <Badge key={index} variant="outline" className="text-red-600">
                            Rs. {level.toFixed(2)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Long Term */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Long Term Outlook ({analysis.what_is_the_long_term_outlook.holding_period_months} months)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Trend</p>
                        <p className="font-semibold">{analysis.what_is_the_long_term_outlook.trend}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Valuation</p>
                        <Badge variant={
                          analysis.what_is_the_long_term_outlook.valuation === "Undervalued" ? "default" :
                          analysis.what_is_the_long_term_outlook.valuation === "Overvalued" ? "destructive" : "secondary"
                        }>
                          {analysis.what_is_the_long_term_outlook.valuation}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Macro Sentiment</p>
                        <p className="font-semibold">{analysis.what_is_the_long_term_outlook.macro_sentiment}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Industry Position</p>
                        <p className="font-semibold">{analysis.what_is_the_long_term_outlook.industry_position}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* AI Predictions */}
            <TabsContent value="predictions" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Forecast */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      AI Price Forecast
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg">
                      <p className="text-sm text-muted-foreground">Expected Price</p>
                      <p className="text-3xl font-bold text-blue-600">
                        Rs. {analysis.what_do_ai_models_predict_for_future.forecast_range.expected.toFixed(2)}
                      </p>
                      <div className="flex justify-between text-sm mt-2">
                        <span className="text-red-600">
                          Low: Rs. {analysis.what_do_ai_models_predict_for_future.forecast_range.low.toFixed(2)}
                        </span>
                        <span className="text-green-600">
                          High: Rs. {analysis.what_do_ai_models_predict_for_future.forecast_range.high.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm text-muted-foreground">AI Rating</p>
                        <Badge variant={getRatingBadgeVariant(analysis.what_do_ai_models_predict_for_future.ai_rating)} className="text-sm">
                          {analysis.what_do_ai_models_predict_for_future.ai_rating}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Confidence</p>
                        <div className="flex items-center gap-2">
                          <Progress value={analysis.what_do_ai_models_predict_for_future.confidence * 100} className="flex-1 h-2" />
                          <span className="text-sm font-medium">{(analysis.what_do_ai_models_predict_for_future.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">Investment Type</p>
                        <Badge variant="outline">{analysis.what_do_ai_models_predict_for_future.investment_type}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Growth Drivers & Risks */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="w-5 h-5" />
                      Drivers & Risks
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-green-600 mb-2">Growth Drivers</h4>
                      <ul className="space-y-1">
                        {analysis.what_do_ai_models_predict_for_future.growth_drivers.map((driver, index) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0"></span>
                            {driver}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="text-sm font-medium text-red-600 mb-2">Potential Risks</h4>
                      <ul className="space-y-1">
                        {analysis.what_do_ai_models_predict_for_future.potential_risks.map((risk, index) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0"></span>
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Performance */}
            <TabsContent value="performance" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Historical Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      2-Year Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Price Change</p>
                        <p className={`text-lg font-bold ${analysis.how_has_the_stock_performed_in_past_2_years.price_change_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {analysis.how_has_the_stock_performed_in_past_2_years.price_change_percent >= 0 ? '+' : ''}{analysis.how_has_the_stock_performed_in_past_2_years.price_change_percent.toFixed(2)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Volatility (30d avg)</p>
                        <p className="text-lg font-bold">{analysis.how_has_the_stock_performed_in_past_2_years.volatility_30d_avg.toFixed(2)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Market Cap Growth</p>
                        <p className="text-lg font-bold">{analysis.how_has_the_stock_performed_in_past_2_years.market_cap_growth}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Dividend Yield</p>
                        <p className="text-lg font-bold">{analysis.how_has_the_stock_performed_in_past_2_years.dividend_yield_avg}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Notable Trends */}
                <Card>
                  <CardHeader>
                    <CardTitle>Notable Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysis.how_has_the_stock_performed_in_past_2_years.notable_trends.map((trend, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant={
                              trend.type === "Bull Run" || trend.type === "Recovery" ? "default" :
                              trend.type === "Bear Run" ? "destructive" : "secondary"
                            }>
                              {trend.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {trend.from} - {trend.to}
                            </span>
                          </div>
                          <p className="text-sm">{trend.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Key News Events */}
              <Card>
                <CardHeader>
                  <CardTitle>Key News Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.how_has_the_stock_performed_in_past_2_years.key_news_events.map((event, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                        <Badge variant={
                          event.impact.includes("Positive") ? "default" :
                          event.impact.includes("Negative") ? "destructive" : "secondary"
                        }>
                          {event.impact}
                        </Badge>
                        <div className="flex-1">
                          <p className="font-medium">{event.title}</p>
                          <p className="text-xs text-muted-foreground">{event.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analysts */}
            <TabsContent value="analysts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Analyst Coverage ({analysis.what_are_the_analysts_saying.analysts_covered} analysts)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Consensus</p>
                      <Badge variant={getRatingBadgeVariant(analysis.what_are_the_analysts_saying.analyst_sentiment)} className="text-lg px-4 py-2">
                        {analysis.what_are_the_analysts_saying.analyst_sentiment}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Price Targets</p>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm">Low:</span>
                          <span className="font-medium">Rs. {analysis.what_are_the_analysts_saying.target_range.low.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Average:</span>
                          <span className="font-medium">Rs. {analysis.what_are_the_analysts_saying.target_range.avg.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">High:</span>
                          <span className="font-medium">Rs. {analysis.what_are_the_analysts_saying.target_range.high.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Summary</p>
                    <p className="text-sm leading-relaxed">{analysis.what_are_the_analysts_saying.summary}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Alerts */}
            <TabsContent value="alerts" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Tags */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Watch Tags
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {analysis.are_there_any_alerts_or_watch_tags.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Active Alerts */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Active Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysis.are_there_any_alerts_or_watch_tags.alerts.map((alert, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant="outline">{alert.type}</Badge>
                            <span className="text-xs text-muted-foreground">{alert.triggered_on}</span>
                          </div>
                          <p className="text-sm">{alert.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Global Risks */}
            <TabsContent value="risks" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Global Risk Exposure
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Export Exposure</p>
                      <div className="flex items-center gap-2">
                        <Progress value={analysis.is_this_stock_exposed_to_global_risks.exports_percent} className="flex-1" />
                        <span className="text-sm font-medium">{analysis.is_this_stock_exposed_to_global_risks.exports_percent}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Currency Risk</p>
                      <Badge variant={
                        analysis.is_this_stock_exposed_to_global_risks.currency_risk === "High" ? "destructive" :
                        analysis.is_this_stock_exposed_to_global_risks.currency_risk === "Moderate" ? "default" : "secondary"
                      }>
                        {analysis.is_this_stock_exposed_to_global_risks.currency_risk}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Foreign Ownership</p>
                      <div className="flex flex-wrap gap-1">
                        {analysis.is_this_stock_exposed_to_global_risks.foreign_ownership.map((owner, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {owner}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Geographic Dependencies</p>
                      <div className="flex flex-wrap gap-1">
                        {analysis.is_this_stock_exposed_to_global_risks.geo_dependency.map((dep, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {dep}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Analysis Metadata */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Analysis Metadata
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Source</p>
                      <p className="font-medium">{analysis.meta.source}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Model Version</p>
                      <p className="font-medium">{analysis.meta.model_version}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Schema Version</p>
                      <p className="font-medium">{analysis.meta.schema_version}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Generated On</p>
                      <p className="font-medium">{analysis.meta.generated_on}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Language</p>
                      <p className="font-medium">{analysis.meta.language.toUpperCase()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}