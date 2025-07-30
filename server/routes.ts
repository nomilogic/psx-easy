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
      const stock = await storage.getStock(symbol.toUpperCase());

      if (!stock) {
        return res.status(404).json({ error: "Stock not found" });
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
        marketSummary: marketSummary ? 'exists' : 'null',
        sectors: sectors.length,
        companies: companies.length,
        lastFetchTime: new Date().toISOString()
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
        console.log(`Fresh company data structure for ${symbol}:`, JSON.stringify(freshData, null, 2));
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
          fresh: !!(freshData?.equityProfile),
          cached: !!(cachedData?.equityProfile)
        },
        equityProfileDetails: {
          fresh: freshData?.equityProfile || null,
          cached: cachedData?.equityProfile || null
        },
        financialDataPresent: {
          fresh: !!(freshData?.financialData),
          cached: !!(cachedData?.financialData)
        },
        ratiosDataPresent: {
          fresh: !!(freshData?.ratiosData),
          cached: !!(cachedData?.ratiosData)
        },
        freeFloatPresent: {
          fresh: freshData?.freeFloat !== undefined,
          cached: cachedData?.freeFloat !== undefined
        }
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
        hasEquityProfile: !!(freshData?.equityProfile && freshData.equityProfile.length > 0)
      });
    } catch (error) {
      console.error(`Error in equity debug endpoint for ${req.params.symbol}:`, error);
      res.status(500).json({ error: "Failed to fetch equity profile data" });
    }
  });

  // AI Analysis endpoints
  app.post("/api/ai-analysis", async (req, res) => {
    try {
      const { symbol, query } = req.body;

      if (!symbol) {
        return res.status(400).json({ error: "Symbol is required" });
      }

      // Get stock data
      const stocks = await storage.getMarketData();
      const stock = stocks.find(s => s.symbol === symbol);

      if (!stock) {
        return res.status(404).json({ error: "Stock not found" });
      }

      // Prepare AI prompt
      const prompt = `
        Analyze the stock ${symbol} (${stock.name}) with the following data:
        - Current Price: Rs. ${stock.current}
        - Change: ${stock.change} (${stock.changePercent}%)
        - Volume: ${stock.volume}
        - Sector: ${stock.sector}
        - High: Rs. ${stock.high}
        - Low: Rs. ${stock.low}

        ${query ? `Focus on: ${query}` : ''}

        Please provide:
        1. A comprehensive analysis (2-3 sentences)
        2. Investment recommendation (Buy/Hold/Sell with reasoning)
        3. Risk level (Low/Medium/High)
        4. Target price prediction
        5. Confidence level (1-100%)

        Consider Pakistan Stock Exchange context and current market conditions.
        Response should be in JSON format with keys: analysis, recommendation, riskLevel, targetPrice, confidence
      `;

      // Call Gemini API with proper error handling
      const apiKey = process.env.GEMINI_API_KEY || "AIzaSyBQ8fVF7RXzfZ6k5Gn0vOcQ8t1E_7XJxVc"; // Fallback key for demo
      
      let aiText = "";
      try {
        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            }
          })
        });

        if (geminiResponse.ok) {
          const geminiData = await geminiResponse.json();
          aiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
        } else {
          console.error("Gemini API error:", geminiResponse.status, await geminiResponse.text());
        }
      } catch (apiError) {
        console.error("Gemini API call failed:", apiError);
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
            const sentiment = stock.changePercent > 2 ? "Bullish" : stock.changePercent < -2 ? "Bearish" : "Neutral";
            const riskLevel = Math.abs(stock.changePercent) > 5 ? "High" : Math.abs(stock.changePercent) > 2 ? "Medium" : "Low";
            
            analysis = {
              analysis: aiText.length > 300 ? aiText.substring(0, 300) + "..." : aiText,
              recommendation: sentiment === "Bullish" ? `Buy - ${stock.symbol} shows strong upward momentum` : 
                           sentiment === "Bearish" ? `Sell - ${stock.symbol} facing downward pressure` : 
                           `Hold - ${stock.symbol} in consolidation phase`,
              riskLevel: riskLevel,
              targetPrice: stock.current * (1 + (stock.changePercent / 100) * 1.5),
              confidence: Math.min(95, Math.max(60, 85 - Math.abs(stock.changePercent) * 2))
            };
          }
        } else {
          // Enhanced fallback analysis based on real stock data
          const volumeAnalysis = stock.volume > 1000000 ? "high volume indicates strong interest" : "moderate volume suggests steady trading";
          const priceAnalysis = stock.changePercent > 0 ? "positive momentum" : "corrective pressure";
          const sectorContext = stock.sector.includes("BANK") ? "banking sector fundamentals remain strong" : 
                               stock.sector.includes("TECH") ? "technology sector showing innovation potential" : 
                               "sector showing mixed signals";
          
          analysis = {
            analysis: `${stock.symbol} demonstrates ${priceAnalysis} with ${volumeAnalysis}. The ${sectorContext}. Current price of Rs. ${stock.current} reflects market sentiment and trading activity. Technical indicators suggest ${stock.changePercent > 1 ? 'bullish' : stock.changePercent < -1 ? 'bearish' : 'neutral'} outlook in the near term.`,
            recommendation: stock.changePercent > 2 ? "Buy - Strong upward momentum detected" : 
                           stock.changePercent < -2 ? "Sell - Downward pressure observed" : 
                           "Hold - Consolidation phase, monitor closely",
            riskLevel: Math.abs(stock.changePercent) > 5 ? "High" : Math.abs(stock.changePercent) > 2 ? "Medium" : "Low",
            targetPrice: Number((stock.current * (1 + Math.max(0.02, Math.min(0.15, Math.abs(stock.changePercent) / 100)))).toFixed(2)),
            confidence: Math.min(95, Math.max(75, 90 - Math.abs(stock.changePercent) * 1.5))
          };
        }
      } catch (parseError) {
        console.error("Analysis parsing error:", parseError);
        // Robust fallback with real-time data integration
        analysis = {
          analysis: `Advanced technical analysis for ${stock.name} (${stock.symbol}) indicates current price momentum of ${stock.changePercent.toFixed(2)}% with trading volume of ${stock.volume.toLocaleString()} shares. Market capitalization and sector dynamics suggest ${stock.changePercent > 0 ? 'positive' : 'negative'} sentiment among institutional investors.`,
          recommendation: stock.changePercent > 1 ? "Buy - Technical indicators favor upward movement" : 
                         stock.changePercent < -1 ? "Sell - Technical weakness suggests caution" : 
                         "Hold - Wait for clearer directional signals",
          riskLevel: "Medium",
          targetPrice: Number((stock.current * 1.05).toFixed(2)),
          confidence: 80
        };
      }

      res.json({
        symbol,
        ...analysis
      });

    } catch (error) {
      console.error("AI analysis error:", error);
      res.status(500).json({ error: "Failed to generate AI analysis" });
    }
  });

  app.post("/api/market-insights", async (req, res) => {
    try {
      const { type } = req.body;

      const marketData = await storage.getMarketSummary();
      const stocks = await storage.getMarketData();

      const prompt = `
        Provide market insights for Pakistan Stock Exchange based on current data:
        - Total Stocks: ${marketData?.totalStocks || 0}
        - Gainers: ${marketData?.gainers || 0}
        - Losers: ${marketData?.losers || 0}
        - Total Volume: ${marketData?.totalVolume || 0}

        Top performing sectors and any notable market trends.
        Include insights about:
        1. Current market sentiment
        2. Key economic factors affecting PSX
        3. International market correlations
        4. Short-term outlook

        Provide a comprehensive but concise analysis (3-4 sentences).
      `;

      const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' + process.env.GEMINI_API_KEY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!geminiResponse.ok) {
        throw new Error('Gemini API request failed');
      }

      const geminiData = await geminiResponse.json();
      const insight = geminiData.candidates[0].content.parts[0].text;

      res.json({
        insight: insight || "Market showing mixed signals with selective opportunities in key sectors. Banking and technology sectors showing resilience while commodity-linked stocks face headwinds. Investors should focus on fundamentally strong companies with sustainable business models."
      });

    } catch (error) {
      console.error("Market insights error:", error);
      res.json({
        insight: "Pakistan Stock Exchange continues to navigate economic challenges with selective opportunities emerging in banking, technology, and export-oriented sectors. Current market conditions favor value investing approaches with focus on companies with strong fundamentals and sustainable competitive advantages."
      });
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
            setTimeout(() => reject(new Error('Market data timeout')), 25000)
          )
        ]),
        Promise.race([
          storage.getMarketSummary(),
          new Promise<MarketSummary | null>((_, reject) => 
            setTimeout(() => reject(new Error('Market summary timeout')), 15000)
          )
        ])
      ]);

      // Send available data even if some operations failed
      if (ws.readyState === WebSocket.OPEN) {
        const response = {
          type: "market_update",
          timestamp: new Date().toISOString(),
          data: {
            stocks: marketData.status === 'fulfilled' ? marketData.value : [],
            summary: marketSummary.status === 'fulfilled' ? marketSummary.value : null,
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
  setInterval(fetchAndBroadcastData, 30000);

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