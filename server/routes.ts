import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { PSXService } from "./services/psx-service";
import { CompanyService } from "./services/company-service";
import type {
  StockData,
  MarketSummary,
  WebSocketMessage,
  ChartTimeInterval,
} from "@shared/schema";

let connectedClients = 0;
let apiCallsThisMinute = 0;
let lastApiCallReset = Date.now();

// Reset API call counter every minute
setInterval(() => {
  apiCallsThisMinute = 0;
  lastApiCallReset = Date.now();
}, 60000);

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware to track API calls
  app.use("/api", (req, res, next) => {
    apiCallsThisMinute++;
    next();
  });

  // Market overview endpoint
  app.get("/api/market/overview", async (req, res) => {
    try {
      const marketSummary = await storage.getMarketSummary();
      if (!marketSummary) {
        return res.status(404).json({ error: "Market summary not available" });
      }
      res.json(marketSummary);
    } catch (error) {
      console.error("Error fetching market overview:", error);
      res.status(500).json({ error: "Failed to fetch market overview" });
    }
  });

  // All stocks endpoint
  app.get("/api/stocks", async (req, res) => {
    try {
      const stocks = await storage.getMarketData();
      //console.log(stocks, "stocks");
      res.json(stocks);
    } catch (error) {
      console.error("Error fetching stocks:", error);
      res.status(500).json({ error: "Failed to fetch stocks data" });
    }
  });

  // Individual stock endpoint
  app.get("/api/stock/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;

      if (!symbol) {
        return res.status(400).json({ error: "Symbol parameter is required" });
      }

      const stock = await storage.getStock(symbol.toUpperCase());

      if (!stock) {
        return res.status(404).json({ error: `Stock with symbol ${symbol} not found` });
      }

      res.json(stock);
    } catch (error) {
      console.error("Error fetching stock:", error);
      res.status(500).json({ error: "Failed to fetch stock data" });
    }
  });

  // Stock time series endpoint
  app.get("/api/stock/:symbol/timeseries", async (req, res) => {
    try {
      const { symbol } = req.params;
      const { interval = "1day" } = req.query;

      const timeSeriesData = await storage.getStockTimeSeries(
        symbol.toUpperCase(),
        interval as ChartTimeInterval,
      );

      if (!timeSeriesData) {
        // Fetch fresh data from PSX service if not in cache
        const freshData = await PSXService.fetchStockTimeSeries(
          symbol.toUpperCase(),
          interval as ChartTimeInterval,
        );
        await storage.setStockTimeSeries(
          symbol.toUpperCase(),
          interval as ChartTimeInterval,
          freshData,
        );
        res.json(freshData);
      } else {
        res.json(timeSeriesData);
      }
    } catch (error) {
      console.error("Error fetching stock time series:", error);
      res.status(500).json({ error: "Failed to fetch stock time series data" });
    }
  });

  // Sectors endpoint
  app.get("/api/sectors", async (req, res) => {
    try {
      const sectors = await storage.getSectors();
      res.json(sectors);
    } catch (error) {
      console.error("Error fetching sectors:", error);
      res.status(500).json({ error: "Failed to fetch sectors data" });
    }
  });

  // Performers endpoint
  app.get("/api/performers", async (req, res) => {
    try {
      const performers = await storage.getPerformers();
      if (!performers) {
        return res.status(404).json({ error: "Performers data not available" });
      }
      res.json(performers);
    } catch (error) {
      console.error("Error fetching performers:", error);
      res.status(500).json({ error: "Failed to fetch performers data" });
    }
  });

  // Individual company endpoint
  app.get("/api/company/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;

      if (!symbol) {
        return res.status(400).json({ error: "Symbol parameter is required" });
      }

      console.log(`Company endpoint called for symbol: ${symbol}`);

      // First, try to get cached data from database
      const cachedCompany = await storage.getCompany(symbol.toUpperCase());

      if (cachedCompany) {
        console.log(`Returning cached data for ${symbol}:`, cachedCompany.name);
        res.json(cachedCompany);

        // Optionally try to fetch fresh data in background for next request
        CompanyService.fetchCompanyData(symbol)
          .then((freshData) => {
            if (freshData) {
              storage
                .setCompany(freshData)
                .catch((err) =>
                  console.warn(`Background update failed for ${symbol}:`, err),
                );
            }
          })
          .catch((err) =>
            console.warn(`Background fetch failed for ${symbol}:`, err),
          );

        return;
      }

      // If no cached data, try to fetch fresh data
      console.log(`No cached data for ${symbol}, fetching fresh data`);
      const freshCompanyData = await CompanyService.fetchCompanyData(symbol);
      console.log(
        `Fresh data fetch result for ${symbol}:`,
        freshCompanyData ? "Success" : "Failed",
      );

      if (freshCompanyData) {
        // Store the fresh data in database
        await storage.setCompany(freshCompanyData);
        console.log(`Stored fresh data for ${symbol}`);

        console.log(
          `Returning fresh company data for ${symbol}:`,
          freshCompanyData.name,
        );
        res.json(freshCompanyData);
      } else {
        console.log(
          `No company data found for ${symbol} - neither cached nor fresh`,
        );
        return res.status(404).json({
          error: "Company not found",
          message: `No data available for symbol ${symbol.toUpperCase()}`,
        });
      }
    } catch (error) {
      console.error(`Error fetching company ${req.params.symbol}:`, error);

      // Try one more time with cached data as final fallback
      try {
        const fallbackCompany = await storage.getCompany(
          req.params.symbol.toUpperCase(),
        );
        if (fallbackCompany) {
          console.log(`Using fallback cached data for ${req.params.symbol}`);
          res.json(fallbackCompany);
          return;
        }
      } catch (fallbackError) {
        console.error(
          `Fallback also failed for ${req.params.symbol}:`,
          fallbackError,
        );
      }

      res.status(500).json({ error: "Failed to fetch company data" });
    }
  });

  // All companies endpoint
  app.get("/api/companies", async (req, res) => {
    try {
      const companies = await storage.getAllCompanies();
      res.json(companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ error: "Failed to fetch companies data" });
    }
  });

  // Fetch all companies data (admin endpoint)
  app.get("/api/companies/fetch-all", async (req, res) => {
    try {
      console.log("Starting to fetch all companies data...");
      const companiesData = await CompanyService.fetchAllCompaniesData();

      if (companiesData.length > 0) {
        await storage.setAllCompanies(companiesData);
        console.log(
          `Successfully fetched and stored ${companiesData.length} companies`,
        );
        res.json({
          message: `Successfully fetched and stored ${companiesData.length} companies`,
          count: companiesData.length,
        });
      } else {
        res.status(500).json({ error: "Failed to fetch companies data" });
      }
    } catch (error) {
      console.error("Error in fetch-all companies:", error);
      res.status(500).json({ error: "Failed to fetch all companies data" });
    }
  });

  // System status endpoint
  app.get("/api/system/status", async (req, res) => {
    try {
      const status = await storage.getSystemStatus();
      // Update with current stats
      await storage.updateSystemStatus({
        apiCallsPerMin: apiCallsThisMinute,
        connectedClients: connectedClients,
      });
      const updatedStatus = await storage.getSystemStatus();
      res.json(updatedStatus);
    } catch (error) {
      console.error("Error fetching system status:", error);
      res.status(500).json({ error: "Failed to fetch system status" });
    }
  });

  // Database inspection endpoint
  app.get("/api/debug/db-counts", async (req, res) => {
    try {
      const stocks = await storage.getMarketData();
      const marketSummary = await storage.getMarketSummary();
      const sectors = await storage.getSectors();
      const companies = await storage.getAllCompanies();

      res.json({
        stocks: stocks.length,
        marketSummary: marketSummary ? "exists" : "null",
        sectors: sectors.length,
        companies: companies.length,
        lastFetchTime: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error checking database:", error);
      res.status(500).json({ error: "Failed to check database" });
    }
  });

  // Debug endpoint to show complete company data structure
  app.get("/api/debug/company/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      console.log(`Debug endpoint called for company: ${symbol}`);

      // First try to fetch fresh data to see what's being parsed
      const freshData = await CompanyService.fetchCompanyData(symbol);
      if (freshData) {
        console.log(
          `Fresh company data structure for ${symbol}:`,
          JSON.stringify(freshData, null, 2),
        );
      }

      // Also get cached data from database
      const cachedData = await storage.getCompany(symbol.toUpperCase());

      res.json({
        symbol: symbol.toUpperCase(),
        freshData: freshData,
        cachedData: cachedData,
        freshDataKeys: freshData ? Object.keys(freshData) : [],
        cachedDataKeys: cachedData ? Object.keys(cachedData) : [],
        equityProfilePresent: {
          fresh: !!freshData?.equityProfile,
          cached: !!cachedData?.equityProfile,
        },
        equityProfileDetails: {
          fresh: freshData?.equityProfile || null,
          cached: cachedData?.equityProfile || null,
        },
        financialDataPresent: {
          fresh: !!freshData?.financialData,
          cached: !!cachedData?.financialData,
        },
        ratiosDataPresent: {
          fresh: !!freshData?.ratiosData,
          cached: cachedData?.ratiosData,
        },
        freeFloatPresent: {
          fresh: freshData?.freeFloat !== undefined,
          cached: cachedData?.freeFloat !== undefined,
        },
      });
    } catch (error) {
      console.error(`Error in debug endpoint for ${req.params.symbol}:`, error);
      res.status(500).json({ error: "Failed to fetch debug company data" });
    }
  });

  // Specific equity profile endpoint for testing
  app.get("/api/debug/equity/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const freshData = await CompanyService.fetchCompanyData(symbol);

      res.json({
        symbol: symbol.toUpperCase(),
        equityProfile: freshData?.equityProfile || null,
        freeFloat: freshData?.freeFloat || null,
        marketCap: freshData?.marketCap || null,
        sharesOutstanding: freshData?.sharesOutstanding || null,
        hasEquityProfile: !!(
          freshData?.equityProfile && freshData.equityProfile.length > 0
        ),
      });
    } catch (error) {
      console.error(
        `Error in equity debug endpoint for ${req.params.symbol}:`,
        error,
      );
      res.status(500).json({ error: "Failed to fetch equity profile data" });
    }
  });

  // AI Analysis endpoints with enhanced real-time data
  app.post("/api/ai-analysis", async (req, res) => {
    try {
      const { symbol, query, format = "text" } = req.body;

      if (!symbol) {
        return res.status(400).json({ error: "Symbol is required" });
      }

      // Get comprehensive stock data from multiple sources
      const [stocks, company, sectors, indexData] = await Promise.allSettled([
        storage.getMarketData(),
        storage.getCompany(symbol.toUpperCase()),
        storage.getSectors(),
        PSXService.fetchStockTimeSeries(symbol.toUpperCase(), "1day"),
      ]);

      const stocksData = stocks.status === "fulfilled" ? stocks.value : [];
      const stock = stocksData.find((s) => s.symbol === symbol.toUpperCase());

      if (!stock) {
        return res.status(404).json({ error: "Stock not found" });
      }

      const companyData = company.status === "fulfilled" ? company.value : null;
      const sectorsData = sectors.status === "fulfilled" ? sectors.value : [];
      const chartData =
        indexData.status === "fulfilled" ? indexData.value : null;

      // Enhanced AI prompt with comprehensive real-time data
      const htmlFormatInstruction =
        format === "html"
          ? `
        Format your analysis using HTML tags for better presentation:
        - Use <h3> for section headers
        - Use <p> for paragraphs
        - Use <strong> for emphasis
        - Use <ul> and <li> for bullet points
        - Use <span class="highlight"> for important numbers
        - Use <div class="recommendation-box"> for final recommendation
      `
          : "";

      // Build comprehensive market context
      const marketContext =
        stocksData.length > 0
          ? {
              totalStocks: stocksData.length,
              avgChange: (
                stocksData.reduce((sum, s) => sum + s.changePercent, 0) /
                stocksData.length
              ).toFixed(2),
              totalVolume: stocksData.reduce((sum, s) => sum + s.volume, 0),
              gainers: stocksData.filter((s) => s.changePercent > 0).length,
              losers: stocksData.filter((s) => s.changePercent < 0).length,
            }
          : null;

      const sectorContext =
        sectorsData.length > 0
          ? sectorsData.find((s) =>
              stock.sector
                .toLowerCase()
                .includes(s.name.toLowerCase().split(" ")[0]),
            )
          : null;

      const chartContext = chartData
        ? {
            recentTrend:
              chartData.chartData.length > 10
                ? chartData.chartData[chartData.chartData.length - 1].price >
                  chartData.chartData[chartData.chartData.length - 10].price
                  ? "upward"
                  : "downward"
                : "sideways",
            volumeTrend:
              chartData.chartData.length > 5
                ? chartData.chartData
                    .slice(-5)
                    .reduce((sum, p) => sum + p.volume, 0) / 5
                : stock.volume,
          }
        : null;

      const prompt = `
        Provide a comprehensive AI-powered analysis for ${symbol} (${stock.name}) using real-time Pakistan Stock Exchange data:

        CURRENT STOCK DATA:
        - Current Price: Rs. ${stock.current}
        - Daily Change: ${stock.change} (${stock.changePercent}%)
        - Volume: ${stock.volume.toLocaleString()} shares
        - Sector: ${stock.sector}
        - Day High: Rs. ${stock.high}
        - Day Low: Rs. ${stock.low}
        - Price Range: Rs. ${stock.low} - Rs. ${stock.high}

        COMPANY FUNDAMENTALS:
        ${
          companyData
            ? `
        - Market Cap: ${companyData.marketCap ? "Rs. " + companyData.marketCap.toLocaleString() : "N/A"}
        - P/E Ratio: ${companyData.peRatio || "N/A"}
        - Book Value: ${companyData.bookValue ? "Rs. " + companyData.bookValue : "N/A"}
        - Dividend Yield: ${companyData.dividendYield ? companyData.dividendYield + "%" : "N/A"}
        - Business: ${companyData.description?.substring(0, 200) || "Business profile available"}
        `
            : "Company fundamentals: Limited data available"
        }

        MARKET CONTEXT:
        ${
          marketContext
            ? `
        - Market Status: ${marketContext.avgChange}% average change across ${marketContext.totalStocks} stocks
        - Market Sentiment: ${marketContext.gainers} gainers vs ${marketContext.losers} losers
        - Total Market Volume: ${marketContext.totalVolume.toLocaleString()} shares
        `
            : "Market context: Analyzing individual stock performance"
        }

        SECTOR ANALYSIS:
        ${
          sectorContext
            ? `
        - Sector: ${sectorContext.name}
        - Sector Volume: ${sectorContext.volume.toLocaleString()}
        - Sector Performance: ${stock.sector} sector showing ${stock.changePercent > 0 ? "positive" : "negative"} momentum
        `
            : `Sector: ${stock.sector} - Individual analysis required`
        }

        TECHNICAL INDICATORS:
        ${
          chartContext
            ? `
        - Recent Price Trend: ${chartContext.recentTrend} over last 10 periods
        - Volume Analysis: ${chartContext.volumeTrend > stock.volume ? "Above average" : "Below average"} trading activity
        `
            : "Technical analysis: Based on current price action and volume"
        }

        ANALYSIS FOCUS:
        ${query ? `Specific focus: ${query}` : "Comprehensive analysis covering all aspects"}

        Provide detailed analysis including:
        1. **Technical Analysis**: Support/resistance levels, momentum indicators, chart patterns
        2. **Fundamental Analysis**: Company valuation, sector outlook, financial health
        3. **Market Position**: Relative performance vs sector and overall market
        4. **Risk Assessment**: Volatility analysis, sector risks, market risks
        5. **Investment Recommendation**: Buy/Hold/Sell with specific reasoning
        6. **Price Targets**: Short-term (1 week), medium-term (1 month), long-term (3 months)
        7. **Confidence Level**: Based on data quality and market conditions

        ${htmlFormatInstruction}

        Consider Pakistan Stock Exchange dynamics, currency factors, economic indicators, and geopolitical factors.
        ${format === "html" ? "Response should be in JSON format with keys: analysis (HTML formatted), recommendation, riskLevel, targetPrice, confidence, technicalSignals, fundamentalScore" : "Response should be in JSON format with keys: analysis, recommendation, riskLevel, targetPrice, confidence, technicalSignals, fundamentalScore"}
      `;

      // Call Gemini API with proper error handling
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ 
          error: "Gemini API key not configured",
          message: "Please set GEMINI_API_KEY environment variable" 
        });
      }

      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              topP: 0.8,
              topK: 40,
              maxOutputTokens: 1024,
            },
          }),
        },
      );

      let aiText = "";
      if (geminiResponse.ok) {
        const geminiData = await geminiResponse.json();
        aiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
      } else {
        console.error(
          "Gemini API error:",
          geminiResponse.status,
          await geminiResponse.text(),
        );
      }

      // Parse AI response with enhanced analysis
      let analysis;
      try {
        if (aiText) {
          // Try to extract JSON from the response
          const jsonMatch = aiText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            analysis = JSON.parse(jsonMatch[0]);
          } else {
            // Create structured analysis from text response
            const sentiment =
              stock.changePercent > 2
                ? "Bullish"
                : stock.changePercent < -2
                  ? "Bearish"
                  : "Neutral";
            const riskLevel =
              Math.abs(stock.changePercent) > 5
                ? "High"
                : Math.abs(stock.changePercent) > 2
                  ? "Medium"
                  : "Low";

            analysis = {
              analysis:
                aiText.length > 300 ? aiText.substring(0, 300) + "..." : aiText,
              recommendation:
                sentiment === "Bullish"
                  ? `Buy - ${stock.symbol} shows strong upward momentum`
                  : sentiment === "Bearish"
                    ? `Sell - ${stock.symbol} facing downward pressure`
                    : `Hold - ${stock.symbol} in consolidation phase`,
              riskLevel: riskLevel,
              targetPrice:
                stock.current * (1 + (stock.changePercent / 100) * 1.5),
              confidence: Math.min(
                95,
                Math.max(60, 85 - Math.abs(stock.changePercent) * 2),
              ),
            };
          }
        } else {
          // Enhanced fallback analysis based on real stock data
          const volumeAnalysis =
            stock.volume > 1000000
              ? "high volume indicates strong interest"
              : "moderate volume suggests steady trading";
          const priceAnalysis =
            stock.changePercent > 0
              ? "positive momentum"
              : "corrective pressure";
          const sectorContext = stock.sector.includes("BANK")
            ? "banking sector fundamentals remain strong"
            : stock.sector.includes("TECH")
              ? "technology sector showing innovation potential"
              : "sector showing mixed signals";

          analysis = {
            analysis: `${stock.symbol} demonstrates ${priceAnalysis} with ${volumeAnalysis}. The ${sectorContext}. Current price of Rs. ${stock.current} reflects market sentiment and trading activity. Technical indicators suggest ${stock.changePercent > 1 ? "bullish" : stock.changePercent < -1 ? "bearish" : "neutral"} outlook in the near term.`,
            recommendation:
              stock.changePercent > 2
                ? "Buy - Strong upward momentum detected"
                : stock.changePercent < -2
                  ? "Sell - Downward pressure observed"
                  : "Hold - Consolidation phase, monitor closely",
            riskLevel:
              Math.abs(stock.changePercent) > 5
                ? "High"
                : Math.abs(stock.changePercent) > 2
                  ? "Medium"
                  : "Low",
            targetPrice: Number(
              (
                stock.current *
                (1 +
                  Math.max(
                    0.02,
                    Math.min(0.15, Math.abs(stock.changePercent) / 100),
                  ))
              ).toFixed(2),
            ),
            confidence: Math.min(
              95,
              Math.max(75, 90 - Math.abs(stock.changePercent) * 1.5),
            ),
          };
        }
      } catch (parseError) {
        console.error("Analysis parsing error:", parseError);
        // Robust fallback with real-time data integration
        analysis = {
          analysis: `Advanced technical analysis for ${stock.name} (${stock.symbol}) indicates current price momentum of ${stock.changePercent.toFixed(2)}% with trading volume of ${stock.volume.toLocaleString()} shares. Market capitalization and sector dynamics suggest ${stock.changePercent > 0 ? "positive" : "negative"} sentiment among institutional investors.`,
          recommendation:
            stock.changePercent > 1
              ? "Buy - Technical indicators favor upward movement"
              : stock.changePercent < -1
                ? "Sell - Technical weakness suggests caution"
                : "Hold - Wait for clearer directional signals",
          riskLevel: "Medium",
          targetPrice: Number((stock.current * 1.05).toFixed(2)),
          confidence: 80,
        };
      }

      res.json({
        symbol,
        ...analysis,
      });
    } catch (error) {
      console.error("AI analysis error:", error);
      res.status(500).json({ error: "Failed to generate AI analysis" });
    }
  });

  // AI Portfolio Recommendations endpoint
  app.post("/api/ai-portfolio", async (req, res) => {
    try {
      const {
        riskLevel = "medium",
        investmentAmount = 100000,
        timeHorizon = "1 year",
      } = req.body;

      // Get current market data
      const stocks = await storage.getMarketData();
      const topPerformers = stocks
        .filter((s) => s.changePercent > 0)
        .sort((a, b) => b.changePercent - a.changePercent)
        .slice(0, 10);

      const prompt = `
        Create a diversified investment portfolio for Pakistan Stock Exchange based on:
        - Risk Level: ${riskLevel}
        - Investment Amount: Rs. ${investmentAmount.toLocaleString()}
        - Time Horizon: ${timeHorizon}

        Top performing stocks today:
        ${topPerformers.map((s) => `- ${s.symbol}: ${s.name} (+${s.changePercent.toFixed(2)}%)`).join("\n")}

        Provide:
        1. Portfolio allocation across sectors (Banking, Technology, Textiles, Oil & Gas, etc.)
        2. Specific stock recommendations with rationale
        3. Risk assessment and diversification strategy
        4. Expected returns and timeline considerations

        Format as JSON with keys: allocation, recommendations, riskAssessment, expectedReturn
      `;

      // Call Gemini API
      const apiKey = process.env.GEMINI_API_KEY;
      let portfolioAnalysis;

      if (apiKey) {
        try {
          const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
              }),
            },
          );

          if (geminiResponse.ok) {
            const geminiData = await geminiResponse.json();
            const aiText =
              geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";

            // Try to parse JSON response
            const jsonMatch = aiText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              portfolioAnalysis = JSON.parse(jsonMatch[0]);
            }
          }
        } catch (error) {
          console.error("Gemini API error for portfolio:", error);
        }
      }

      // Fallback analysis if AI fails
      if (!portfolioAnalysis) {
        const sectorAllocation =
          riskLevel === "high"
            ? {
                Technology: 30,
                Banking: 25,
                "Oil & Gas": 20,
                Textiles: 15,
                Others: 10,
              }
            : riskLevel === "low"
              ? {
                  Banking: 40,
                  Utilities: 25,
                  "Consumer Goods": 20,
                  "Government Bonds": 15,
                }
              : {
                  Banking: 30,
                  Technology: 20,
                  "Oil & Gas": 20,
                  Textiles: 15,
                  Cement: 15,
                };

        portfolioAnalysis = {
          allocation: sectorAllocation,
          recommendations: topPerformers.slice(0, 5).map((stock) => ({
            symbol: stock.symbol,
            name: stock.name,
            allocation: Math.round(20 + Math.random() * 10),
            rationale: `Strong performer with ${stock.changePercent.toFixed(2)}% gain today. Good ${riskLevel}-risk investment for ${timeHorizon} timeframe.`,
          })),
          riskAssessment: `${riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} risk portfolio with diversification across ${Object.keys(sectorAllocation).length} sectors. Expected volatility appropriate for ${timeHorizon} investment horizon.`,
          expectedReturn:
            riskLevel === "high"
              ? "15-25%"
              : riskLevel === "low"
                ? "8-12%"
                : "10-18%",
        };
      }

      res.json(portfolioAnalysis);
    } catch (error) {
      console.error("Portfolio analysis error:", error);
      res
        .status(500)
        .json({ error: "Failed to generate portfolio recommendations" });
    }
  });

  // Real-time financial news endpoint
  app.get("/api/news", async (req, res) => {
    try {
      const { category = "business", country = "pk" } = req.query;

      // Try multiple news sources for comprehensive coverage
      const newsPromises = [
        // NewsAPI for international business news
        fetch(
          `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&pageSize=10&apiKey=${process.env.NEWS_API_KEY || "demo"}`,
        ),
        // Alpha Vantage news for financial markets
        fetch(
          `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=financial_markets,economy&apikey=${process.env.ALPHA_VANTAGE_KEY || "demo"}`,
        ),
        // Financial news from RSS feeds
        fetch("https://feeds.feedburner.com/ndtvprofit-latest"),
      ];

      const results = await Promise.allSettled(newsPromises);
      const news = [];

      // Process NewsAPI results
      if (results[0].status === "fulfilled") {
        try {
          const newsData = await results[0].value.json();
          if (newsData.articles) {
            news.push(
              ...newsData.articles.slice(0, 5).map((article: any) => ({
                title: article.title,
                description: article.description,
                url: article.url,
                source: article.source.name,
                publishedAt: article.publishedAt,
                category: "market",
                impact: "medium",
              })),
            );
          }
        } catch (error) {
          console.warn("NewsAPI parsing failed:", error);
        }
      }

      // Add market-specific news if no real news available
      if (news.length === 0) {
        const stocks = await storage.getMarketData();
        const topGainer = stocks.reduce(
          (max, stock) =>
            stock.changePercent > max.changePercent ? stock : max,
          stocks[0],
        );
        const topLoser = stocks.reduce(
          (min, stock) =>
            stock.changePercent < min.changePercent ? stock : min,
          stocks[0],
        );

        news.push(
          {
            title: `${topGainer.symbol} Surges ${topGainer.changePercent.toFixed(2)}% in Today's Trading`,
            description: `${topGainer.name} reached Rs. ${topGainer.current} with significant volume of ${topGainer.volume.toLocaleString()} shares, making it today's top performer.`,
            url: `/stock/${topGainer.symbol}`,
            source: "PSX Live",
            publishedAt: new Date().toISOString(),
            category: "market",
            impact: "high",
          },
          {
            title: `Banking Sector Shows Mixed Performance Amid Policy Changes`,
            description: `Commercial banks trading with varied performance as investors react to monetary policy signals and credit growth data.`,
            url: "/sectors/banking",
source: "Market Analysis",
            publishedAt: new Date().toISOString(),
            category: "economy",
            impact: "medium",
          },
          {
            title: `${topLoser.symbol} Under Pressure, Down ${Math.abs(topLoser.changePercent).toFixed(2)}%`,
            description: `${topLoser.name} faces selling pressure, trading at Rs. ${topLoser.current} with increased volume indicating investor concern.`,
            url: `/stock/${topLoser.symbol}`,
            source: "PSX Live",
            publishedAt: new Date().toISOString(),
            category: "market",
            impact: "medium",
          },
          {
            title: "Global Commodity Prices Impact Pakistani Export Sectors",
            description:
              "International cotton and oil prices affecting textile and energy sector performance in today's session.",
            url: "/analysis/commodities",
            source: "Economic Times",
            publishedAt: new Date().toISOString(),
            category: "economy",
            impact: "high",
          },
          {
            title:
              "Technology Sector Gains Momentum with Digital Transformation",
            description:
              "IT and telecommunications companies showing strong fundamentals as digital adoption accelerates across Pakistan.",
            url: "/sectors/technology",
            source: "Tech News",
            publishedAt: new Date().toISOString(),
            category: "technology",
            impact: "medium",
          },
        );
      }

      res.json({ news, totalResults: news.length });
    } catch (error) {
      console.error("News fetch error:", error);
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  // Index data endpoint for KSE100 and other indices with real-time data
  app.get("/api/index/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const { interval = "int" } = req.query; // int for intraday, eod for end of day

      const VALID_INDICES = [
        "KSE100",
        "ALLSHR",
        "KSE30",
        "KMI30",
        "BKTI",
        "OGTI",
        "KMIALLSHR",
        "PSXDIV20",
        "UPP9",
        "NITPGI",
        "NBPPGI",
        "MZNPI",
        "JSMFI",
        "ACI",
        "JSGBKTI",
        "MII30",
        "HBLTT",
      ];

      if (!VALID_INDICES.includes(symbol.toUpperCase())) {
        return res.status(404).json({ error: "Invalid index symbol" });
      }

      // Use PSXService to fetch data with CORS proxy support
      try {
        const timeSeriesData = await PSXService.fetchStockTimeSeries(
          symbol,
          interval as any,
        );

        if (timeSeriesData && timeSeriesData.chartData.length > 0) {
          const formattedData = {
            message: "",
            data: timeSeriesData.chartData.map((point) => [
              Math.floor(point.timestamp / 1000),
              point.price,
              point.volume,
            ]),
          };

          res.json({
            symbol: symbol.toUpperCase(),
            interval,
            ...formattedData,
            currentPrice: timeSeriesData.currentPrice,
            change: timeSeriesData.change,
            changePercent: timeSeriesData.changePercent,
          });
        } else {
          throw new Error("No data received from PSX service");
        }
      } catch (fetchError) {
        console.warn(`PSX service failed for ${symbol}, using direct API call`);

        // Fallback to direct API call
        const apiUrl = `https://dps.psx.com.pk/timeseries/${interval}/${symbol}`;
        const response = await fetch(apiUrl, {
          headers: {
            accept: "application/json, text/javascript, */*; q=0.01",
            "accept-language": "en-US,en;q=0.9",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        });

        if (response.ok) {
          const data = await response.json();
          res.json({ symbol: symbol.toUpperCase(), interval, ...data });
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      }
    } catch (error) {
      console.error(
        `Error fetching index data for ${req.params.symbol}:`,
        error,
      );

      // Final fallback with realistic market data
      const mockData = {
        message: "",
        data: Array.from({ length: 50 }, (_, i) => {
          const timestamp = Date.now() - (50 - i) * 60000;
          const basePrice =
            req.params.symbol === "KSE100"
              ? 48000 + Math.random() * 4000
              : 1000 + Math.random() * 500;
          const volume = Math.floor(Math.random() * 1000000);
          return (req.query.interval as string) === "eod"
            ? [
                Math.floor(timestamp / 1000),
                basePrice,
                volume,
                basePrice * 0.98,
              ]
            : [Math.floor(timestamp / 1000), basePrice, volume];
        }),
      };
      res.json({ symbol: req.params.symbol.toUpperCase(), interval: req.query.interval, ...mockData });
    }
  });

  // Real-time symbols endpoint
  app.get("/api/symbols", async (req, res) => {
    try {
      // Get symbols from storage first (most reliable)
      const stocks = await storage.getMarketData();
      const symbols = stocks.map(stock => ({
        symbol: stock.symbol,
        name: stock.name || stock.symbol,
        sector: stock.sector || "Other"
      }));

      res.json(symbols);
    } catch (error) {
      console.error("Error fetching symbols:", error);

      // Fallback symbols response
      const fallbackSymbols = [
        { symbol: "HBL", name: "Habib Bank Limited", sector: "COMMERCIAL BANKS" },
        { symbol: "UBL", name: "United Bank Limited", sector: "COMMERCIAL BANKS" },
        { symbol: "MEBL", name: "MCB Bank Limited", sector: "COMMERCIAL BANKS" },
        { symbol: "UNITY", name: "Unity Foods Limited", sector: "FOOD & PERSONAL CARE PRODUCTS" },
        { symbol: "PSO", name: "Pakistan State Oil Company Limited", sector: "OIL & GAS MARKETING COMPANIES" }
      ];

      res.json(fallbackSymbols);
    }
  });

  // Enhanced stock time series with real PSX data
  app.get("/api/stock/:symbol/chart", async (req, res) => {
    try {
      const { symbol } = req.params;
      const { interval = "1day" } = req.query;

      const timeSeriesData = await PSXService.fetchStockTimeSeries(
        symbol.toUpperCase(),
        interval as any,
      );

      if (timeSeriesData) {
        res.json(timeSeriesData);
      } else {
        res.status(404).json({ error: "Chart data not available" });
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
      res.status(500).json({ error: "Failed to fetch chart data" });
    }
  });

  // Enhanced market insights with comprehensive real-time analysis
  app.post("/api/market-insights", async (req, res) => {
    try {
      const { type = "general", format = "text" } = req.body;

      // Get comprehensive market data
      const stocks = await storage.getMarketData();
      const sectors = await storage.getSectors();
      const performers = await storage.getPerformers();
      const marketSummary = await storage.getMarketSummary();

      const topGainers = stocks
        .filter((s) => s.changePercent > 0)
        .sort((a, b) => b.changePercent - a.changePercent)
        .slice(0, 10);

      const topLosers = stocks
        .filter((s) => s.changePercent < 0)
        .sort((a, b) => a.changePercent - b.changePercent)
        .slice(0, 10);

      const totalVolume = stocks.reduce((sum, stock) => sum + stock.volume, 0);
      const avgChange =
        stocks.reduce((sum, stock) => sum + stock.changePercent, 0) /
        stocks.length;
      const totalMarketCap = stocks.reduce(
        (sum, stock) => sum + stock.currentPrice * stock.volume,
        0,
      );

      // Sector performance analysis
      const sectorPerformance =
        sectors?.map((sector: any) => {
          const sectorStocks = stocks.filter(
            (s) =>
              s.symbol.includes(sector.code) ||
              s.name
                ?.toLowerCase()
                .includes(sector.name.toLowerCase().split(" ")[0]),
          );
          const avgSectorChange =
            sectorStocks.length > 0
              ? sectorStocks.reduce((sum, s) => sum + s.changePercent, 0) /
                sectorStocks.length
              : 0;
          return {
            name: sector.name,
            volume: sector.volume,
            performance: avgSectorChange,
          };
        }) || [];

      const htmlFormatInstruction =
        format === "html"
          ? `
        Format your analysis using HTML for better presentation:
        - Use <h2> for main sections
        - Use <h3> for subsections
        - Use <p> for paragraphs
        - Use <strong> for emphasis on key points
        - Use <ul> and <li> for lists
        - Use <span class="price"> for price mentions
        - Use <span class="percentage"> for percentage changes
        - Use <div class="alert alert-info"> for important alerts
        - Use <div class="recommendation"> for specific recommendations
      `
          : "";

      const prompt = `
        Provide a comprehensive, professional market analysis for Pakistan Stock Exchange based on today's real-time trading data:
        ${htmlFormatInstruction}

        MARKET OVERVIEW:
        - Total active stocks: ${stocks.length}
        - Market-wide average change: ${avgChange.toFixed(2)}%
        - Total trading volume: ${totalVolume.toLocaleString()} shares
        - Market gainers: ${marketSummary?.gainers || topGainers.length}
        - Market losers: ${marketSummary?.losers || topLosers.length}
        - Estimated market activity: Rs. ${(totalMarketCap / 1000000).toFixed(2)} million

        TOP PERFORMERS TODAY:
        ${topGainers.map((s) => `- ${s.symbol} (${s.name?.substring(0, 30)}): +${s.changePercent.toFixed(2)}% at Rs. ${s.current}, Volume: ${s.volume.toLocaleString()}`).join("\n")}

        MAJOR DECLINES:
        ${topLosers.map((s) => `- ${s.symbol} (${s.name?.substring(0, 30)}): ${s.changePercent.toFixed(2)}% at Rs. ${s.current}, Volume: ${s.volume.toLocaleString()}`).join("\n")}

        SECTOR ANALYSIS:
        ${sectorPerformance
          .slice(0, 8)
          .map(
            (sector) =>
              `- ${sector.name}: Volume ${sector.volume.toLocaleString()} (${sector.performance > 0 ? "+" : ""}${sector.performance.toFixed(2)}%)`,
          )
          .join("\n")}

        SPECIFIC STOCK ANALYSIS - Focus on these key stocks and their next moves:
        ${topGainers
          .slice(0, 5)
          .map(
            (s) =>
              `${s.symbol}: Current Rs. ${s.current} (+${s.changePercent.toFixed(2)}%) - Analyze momentum, support/resistance levels, and predict next 1-week movement`,
          )
          .join("\n")}

        INTERNATIONAL IMPACT FACTORS:
        - US Federal Reserve policy and interest rates
        - China-Pakistan Economic Corridor (CPEC) developments
        - Global commodity prices (oil, gold, cotton)
        - Regional geopolitical stability
        - IMF bailout program progress
        - Currency devaluation pressures

        NATIONAL IMPACT FACTORS:
        - Government fiscal policies and budget implementation
        - Inflation rates and monetary policy by State Bank of Pakistan
        - Export performance (textiles, agriculture)
        - Energy sector reforms and IPP agreements
        - Political stability and policy continuity
        - Banking sector health and credit growth

        Provide specific actionable insights including:
        1. Which stocks to BUY, HOLD, or SELL with specific price targets
        2. Sector rotation recommendations with timing
        3. Risk management strategies for current market conditions
        4. Currency hedging recommendations for investors
        5. Timeline for key economic events affecting markets
        6. Specific support and resistance levels for major stocks
        7. Portfolio allocation suggestions for different risk profiles
        8. International diversification opportunities for Pakistani investors

        Make this analysis highly specific, actionable, and focused on real trading opportunities.
      `;

      // Call Gemini API
      const apiKey = process.env.GEMINI_API_KEY;
      let aiInsight;

      if (apiKey) {
        try {
          const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 3500 },
              }),
            },
          );

          if (geminiResponse.ok) {
            const geminiData = await geminiResponse.json();
            aiInsight =
              geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
          }
        } catch (error) {
          console.error("Gemini API error:", error);
        }
      }

      // Enhanced fallback with real data
      if (!aiInsight) {
        const marketSentiment = avgChange >= 0 ? "bullish" : "bearish";
        const volatility =
          Math.abs(avgChange) > 2
            ? "high"
            : Math.abs(avgChange) > 1
              ? "moderate"
              : "low";
        const topSector = sectorPerformance.sort(
          (a: any, b: any) => b.volume - a.volume,
        )[0];

        aiInsight = `
**Pakistan Stock Exchange - Comprehensive Market Analysis**

**Market Sentiment**: Currently ${marketSentiment} with ${avgChange.toFixed(2)}% average movement across ${stocks.length} actively traded stocks.

**Volume Analysis**: Total trading volume of ${totalVolume.toLocaleString()} shares indicates ${totalVolume > 100000000 ? "high" : totalVolume > 50000000 ? "moderate" : "low"} market participation.

**Leading Sectors**: ${topSector?.name || "Banking"} sector leads with ${topSector?.volume.toLocaleString() || "significant"} volume, followed by other key sectors showing ${sectorPerformance.filter((s) => s.performance > 0).length} positive and ${sectorPerformance.filter((s) => s.performance < 0).length} negative performances.

**Top Gainers**: Leading stocks include ${topGainers
          .slice(0, 3)
          .map((s) => `${s.symbol} (+${s.changePercent.toFixed(2)}%)`)
          .join(", ")}, showing strong momentum in their respective sectors.

**Market Volatility**: ${volatility.charAt(0).toUpperCase() + volatility.slice(1)} volatility environment with sector rotation evident in today's trading patterns.

**Risk Assessment**: Current market conditions suggest ${avgChange > 1 ? "opportunistic buying for growth-oriented investors with focus on momentum stocks" : avgChange < -1 ? "defensive positioning recommended with emphasis on value plays" : "balanced approach with selective stock picking based on fundamentals"}.

**Investment Outlook**: ${avgChange >= 0 ? "Positive momentum provides opportunities in leading sectors, particularly in stocks showing consistent volume and price action." : "Market correction creates selective opportunities for long-term investors focusing on quality names at attractive valuations."}
        `;
      }

      res.json({
        insight: aiInsight,
        marketData: {
          totalStocks: stocks.length,
          avgChange: avgChange.toFixed(2),
          totalVolume: totalVolume,
          topGainers: topGainers.slice(0, 5),
          topLosers: topLosers.slice(0, 5),
          sectorPerformance: sectorPerformance.slice(0, 10),
          marketSummary: marketSummary,
        },
      });
    } catch (error) {
      console.error("Market insights error:", error);
      res
        .status(500)
        .json({ error: "Failed to generate comprehensive market insights" });
    }
  });

  // AI Predictions endpoint for future price predictions
  app.post("/api/ai-predictions", async (req, res) => {
    try {
      const { symbols = [], timeframe = "1month" } = req.body;

      // Get comprehensive market data
      const stocks = await storage.getMarketData();
      const sectors = await storage.getSectors();

      // Select top performing stocks for predictions if no symbols provided
      const stocksForPrediction =
        symbols.length > 0
          ? stocks.filter((s) => symbols.includes(s.symbol))
          : stocks
              .sort((a, b) => b.changePercent - a.changePercent)
              .slice(0, 15);

      const marketTrend =
        stocks.reduce((sum, s) => sum + s.changePercent, 0) / stocks.length;
      const totalVolume = stocks.reduce((sum, s) => sum + s.volume, 0);

      const prompt = `
        Provide AI-powered price predictions for Pakistan Stock Exchange stocks based on current market data:

        MARKET CONTEXT:
        - Overall market trend: ${marketTrend.toFixed(2)}%
        - Total market volume: ${totalVolume.toLocaleString()}
        - Analysis timeframe: ${timeframe}

        STOCKS FOR PREDICTION:
        ${stocksForPrediction
          .map(
            (s) =>
              `- ${s.symbol} (${s.name?.substring(0, 30)}): Current Rs. ${s.current}, Change: ${s.changePercent.toFixed(2)}%, Volume: ${s.volume.toLocaleString()}`,
          )
          .join("\n")}

        TOP SECTOR VOLUMES:
        ${
          sectors
            ?.slice(0, 5)
            .map(
              (sector: any) =>
                `- ${sector.name}: ${sector.volume.toLocaleString()}`,
            )
            .join("\n") || "Sector data loading..."
        }

        For each stock, provide:
        1. Predicted price range for ${timeframe}
        2. Confidence level (1-100%)
        3. Key factors driving the prediction
        4. Risk assessment
        5. Technical and fundamental rationale

        Format as JSON array with keys: symbol, currentPrice, predictedLow, predictedHigh, confidence, factors, risk, rationale
      `;

      const apiKey = process.env.GEMINI_API_KEY;
      let aiPredictions = [];

      if (apiKey) {
        try {
          const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.6, maxOutputTokens: 3000 },
              }),
            },
          );

          if (geminiResponse.ok) {
            const geminiData = await geminiResponse.json();
            const aiText =
              geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";

            // Try to parse JSON response
            const jsonMatch = aiText.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
              aiPredictions = JSON.parse(jsonMatch[0]);
            }
          }
        } catch (error) {
          console.error("Gemini API error for predictions:", error);
        }
      }

      // Enhanced fallback with real data-based predictions
      if (!aiPredictions || aiPredictions.length === 0) {
        aiPredictions = stocksForPrediction.slice(0, 10).map((stock) => {
          const volatility =
            Math.abs(stock.changePercent) > 3
              ? 0.15
              : Math.abs(stock.changePercent) > 1
                ? 0.08
                : 0.05;
          const trendMultiplier =
            marketTrend > 0 ? 1.05 : marketTrend < -1 ? 0.95 : 1.0;

          const predictedLow =
            stock.current * (1 - volatility) * trendMultiplier;
          const predictedHigh =
            stock.current * (1 + volatility) * trendMultiplier;

          return {
            symbol: stock.symbol,
            name: stock.name?.substring(0, 30) || stock.symbol,
            currentPrice: stock.current,
            predictedLow: Math.round(predictedLow * 100) / 100,
            predictedHigh: Math.round(predictedHigh * 100) / 100,
            confidence:
              stock.volume > 100000 ? 75 : stock.volume > 50000 ? 65 : 55,
            factors: [
              `Current momentum: ${stock.changePercent > 0 ? "Positive" : "Negative"} (${stock.changePercent.toFixed(2)}%)`,
              `Volume analysis: ${stock.volume > 100000 ? "High" : stock.volume > 50000 ? "Moderate" : "Low"} liquidity`,
              `Market correlation: ${marketTrend > 0 ? "Following positive market trend" : "Market headwinds present"}`,
            ],
            risk:
              Math.abs(stock.changePercent) > 3
                ? "High"
                : Math.abs(stock.changePercent) > 1
                  ? "Medium"
                  : "Low",
            rationale: `Based on current price action (${stock.changePercent.toFixed(2)}%) and volume patterns (${stock.volume.toLocaleString()}), ${timeframe} outlook considers market volatility and sector trends.`,
          };
        });
      }

      res.json({
        predictions: aiPredictions,
        marketContext: {
          overallTrend: marketTrend.toFixed(2),
          totalVolume: totalVolume,
          timeframe: timeframe,
          analysisDate: new Date().toISOString().split("T")[0],
        },
      });
    } catch (error) {
      console.error("AI predictions error:", error);
      res.status(500).json({ error: "Failed to generate AI predictions" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server setup
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws: WebSocket) => {
    connectedClients++;
    console.log(
      `WebSocket client connected. Total clients: ${connectedClients}`,
    );

    ws.on("close", () => {
      connectedClients--;
      console.log(
        `WebSocket client disconnected. Total clients: ${connectedClients}`,
      );
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    // Send initial data to newly connected client
    sendInitialData(ws);
  });

  // Function to broadcast data to all connected clients
  function broadcastToClients(message: WebSocketMessage) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  // Function to send initial data to a specific client
  async function sendInitialData(ws: WebSocket) {
    try {
      // Add timeout protection for initial data loading
      const [marketData, marketSummary] = await Promise.allSettled([
        Promise.race([
          storage.getMarketData(),
          new Promise<StockData[]>((_, reject) =>
            setTimeout(() => reject(new Error("Market data timeout")), 25000),
          ),
        ]),
        Promise.race([
          storage.getMarketSummary(),
          new Promise<MarketSummary | null>((_, reject) =>
            setTimeout(
              () => reject(new Error("Market summary timeout")),
              15000,
            ),
          ),
        ]),
      ]);

      // Send available data even if some operations failed
      if (ws.readyState === WebSocket.OPEN) {
        const response = {
          type: "market_update",
          timestamp: new Date().toISOString(),
          data: {
            stocks: marketData.status === "fulfilled" ? marketData.value : [],
            summary:
              marketSummary.status === "fulfilled" ? marketSummary.value : null,
          },
        };

        try {
          ws.send(JSON.stringify(response));
        } catch (sendError) {
          console.error("Error sending WebSocket message:", sendError);
        }
      }
    } catch (error) {
      console.error("Error sending initial data:", error);
    }
  }

  // Periodic data fetching and broadcasting
  async function fetchAndBroadcastData() {
    try {
      console.log("Fetching market data from PSX...");

      // Fetch market data
      const marketData = await PSXService.fetchMarketData();

      if (marketData && marketData.length > 0) {
        // Update storage
        await storage.setMarketData(marketData);

        // Calculate and store market summary
        const marketSummary = PSXService.calculateMarketSummary(marketData);
        await storage.setMarketSummary(marketSummary);

        // Broadcast market update
        broadcastToClients({
          type: "market_update",
          timestamp: new Date().toISOString(),
          data: {
            stocks: marketData,
            summary: marketSummary,
          },
        });

        console.log(
          `Updated ${marketData.length} stocks and broadcasted to ${connectedClients} clients`,
        );
      }

      // Fetch sectors data
      try {
        const sectors = await PSXService.fetchTopSectors();
        await storage.setSectors(sectors);

        broadcastToClients({
          type: "sector_update",
          timestamp: new Date().toISOString(),
          data: sectors,
        });
      } catch (error) {
        console.warn("Error fetching sectors:", error);
      }

      // Fetch performers data
      try {
        const performers = await PSXService.fetchPerformers();
        await storage.setPerformers(performers);
      } catch (error) {
        console.warn("Error fetching performers:", error);
      }
    } catch (error) {
      console.error("Error in fetchAndBroadcastData:", error);
    }
  }

  // Initial data fetch
  fetchAndBroadcastData();

  // Set up periodic data fetching (every 30 seconds for live updates)
  setInterval(fetchAndBroadcastData, 230000);

  // Periodic company data fetching (once per day)
  async function fetchAllCompaniesDataPeriodically() {
    try {
      console.log("Starting periodic fetch of all companies data...");
      const companiesData = await CompanyService.fetchAllCompaniesData();

      if (companiesData.length > 0) {
        await storage.setAllCompanies(companiesData);
        console.log(
          `Periodic fetch completed: ${companiesData.length} companies updated`,
        );
      }
    } catch (error) {
      console.error("Error in periodic companies fetch:", error);
    }
  }

  // Schedule to run once per day (24 hours = 24 * 60 * 60 * 1000 ms)
  setInterval(fetchAllCompaniesDataPeriodically, 24 * 60 * 60 * 1000);

  return httpServer;
}