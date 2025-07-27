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
      console.log(`Company endpoint called for symbol: ${symbol} - fetching fresh data`);
      
      // Always fetch fresh data from the source
      const freshCompanyData = await CompanyService.fetchCompanyData(symbol);
      console.log(`Fresh data fetch result for ${symbol}:`, freshCompanyData ? 'Success' : 'Failed');
      
      if (freshCompanyData) {
        // Store the fresh data in database for backup/caching purposes
        await storage.setCompany(freshCompanyData);
        console.log(`Stored fresh data for ${symbol}`);
        
        console.log(`Returning fresh company data for ${symbol}:`, freshCompanyData.name);
        res.json(freshCompanyData);
      } else {
        console.log(`Failed to fetch fresh data for ${symbol}, trying database fallback`);
        
        // Fallback to database if fresh fetch fails
        const cachedCompany = await storage.getCompany(symbol.toUpperCase());
        
        if (cachedCompany) {
          console.log(`Returning cached data for ${symbol}:`, cachedCompany.name);
          res.json(cachedCompany);
        } else {
          console.log(`No company data found for ${symbol}`);
          return res.status(404).json({ error: "Company not found" });
        }
      }
    } catch (error) {
      console.error(`Error fetching company ${req.params.symbol}:`, error);
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
  app.post("/api/companies/fetch-all", async (req, res) => {
    try {
      console.log("Starting to fetch all companies data...");
      const companiesData = await CompanyService.fetchAllCompaniesData();
      
      if (companiesData.length > 0) {
        await storage.setAllCompanies(companiesData);
        console.log(`Successfully fetched and stored ${companiesData.length} companies`);
        res.json({ 
          message: `Successfully fetched and stored ${companiesData.length} companies`,
          count: companiesData.length 
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
      const marketData = await storage.getMarketData();
      const marketSummary = await storage.getMarketSummary();

      // if (ws.readyState === WebSocket.OPEN) {
      //   ws.send(
      //     JSON.stringify({
      //       type: "market_update",
      //       timestamp: new Date().toISOString(),
      //       data: {
      //         stocks: marketData,
      //         summary: marketSummary,
      //       },
      //     }),
      //   );
      // }
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

  // Set up periodic data fetching (every 5 minutes)
  setInterval(fetchAndBroadcastData, 300000);

  // Periodic company data fetching (once per day)
  async function fetchAllCompaniesDataPeriodically() {
    try {
      console.log("Starting periodic fetch of all companies data...");
      const companiesData = await CompanyService.fetchAllCompaniesData();
      
      if (companiesData.length > 0) {
        await storage.setAllCompanies(companiesData);
        console.log(`Periodic fetch completed: ${companiesData.length} companies updated`);
      }
    } catch (error) {
      console.error("Error in periodic companies fetch:", error);
    }
  }

  // Schedule to run once per day (24 hours = 24 * 60 * 60 * 1000 ms)
  setInterval(fetchAllCompaniesDataPeriodically, 24 * 60 * 60 * 1000);

  return httpServer;
}
