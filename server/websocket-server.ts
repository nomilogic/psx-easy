import { WebSocketServer, WebSocket } from "ws";
import { createServer } from "http";
import { MarketSchedule } from "./market-schedule";
import { DatabaseStorage } from "./storage";
import { supabase } from "./db";

export class MarketWebSocketServer {
  private wss: WebSocketServer | null = null;
  private server: any = null;
  private clients = new Set<WebSocket>();
  private storage: DatabaseStorage;
  private marketUpdateInterval: NodeJS.Timeout | null = null;
  private statusCheckInterval: NodeJS.Timeout | null = null;
  private supabaseSubscription: any = null;

  constructor() {
    this.storage = new DatabaseStorage();
  }

  async start(port: number = 8080) {
    // Only start if market is open or will open soon
    if (!this.shouldStartServer()) {
      console.log("🕒 Market is closed. WebSocket server will start when market opens.");
      this.scheduleNextStart();
      return;
    }

    // Create HTTP server for WebSocket
    this.server = createServer();
    this.wss = new WebSocketServer({ 
      server: this.server,
      path: '/market-ws'
    });

    this.setupWebSocketHandlers();
    this.setupSupabaseRealtime();
    
    this.server.listen(port, () => {
      console.log(`📡 Market WebSocket server running on port ${port}`);
      console.log(`🏛️ Market Status: ${MarketSchedule.isMarketOpen() ? 'OPEN' : 'CLOSED'}`);
    });

    // Start market data updates only during market hours
    this.startMarketUpdates();
    
    // Check market status every minute
    this.statusCheckInterval = setInterval(() => {
      this.checkMarketStatus();
    }, 60000);
  }

  private shouldStartServer(): boolean {
    const isOpen = MarketSchedule.isMarketOpen();
    const timeUntilOpen = MarketSchedule.getTimeUntilMarketOpen();
    
    // Start server if market is open or opens within 30 minutes
    return isOpen || (timeUntilOpen !== null && timeUntilOpen < 30 * 60 * 1000);
  }

  private setupWebSocketHandlers() {
    if (!this.wss) return;

    this.wss.on('connection', (ws: WebSocket) => {
      this.clients.add(ws);
      console.log(`📱 Client connected. Total: ${this.clients.size}`);

      // Send initial market status
      ws.send(JSON.stringify({
        type: 'market_status',
        data: MarketSchedule.getMarketStatus(),
        timestamp: new Date().toISOString()
      }));

      ws.on('close', () => {
        this.clients.delete(ws);
        console.log(`📱 Client disconnected. Total: ${this.clients.size}`);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });
    });
  }

  private setupSupabaseRealtime() {
    // Supabase real-time is ONE of multiple data sources, not the only one
    this.supabaseSubscription = supabase
      .channel('stocks_channel')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'stocks'
        },
        (payload) => {
          // Broadcast individual stock updates from Supabase real-time
          this.broadcastToClients({
            type: 'stock_update',
            source: 'supabase_realtime',
            data: {
              symbol: payload.new.symbol,
              current: payload.new.current,
              change: payload.new.change,
              changePercent: payload.new.change_percent,
              volume: payload.new.volume,
              isPositive: payload.new.is_positive
            },
            timestamp: new Date().toISOString()
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'stocks'
        },
        (payload) => {
          // Broadcast new stock additions from Supabase real-time
          this.broadcastToClients({
            type: 'new_stock',
            source: 'supabase_realtime',
            data: payload.new,
            timestamp: new Date().toISOString()
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'market_summaries'
        },
        (payload) => {
          // Broadcast market summary updates from Supabase real-time
          this.broadcastToClients({
            type: 'market_summary_update',
            source: 'supabase_realtime',
            data: payload.new,
            timestamp: new Date().toISOString()
          });
        }
      )
      .subscribe();

    console.log('🔄 Supabase real-time subscription active - ONE of multiple data sources');
  }

  private startMarketUpdates() {
    if (!MarketSchedule.isMarketOpen()) {
      console.log('🕒 Market closed - stopping updates');
      return;
    }

    // Multiple data source approach: API bridge + WebSocket + Supabase real-time
    this.marketUpdateInterval = setInterval(async () => {
      if (!MarketSchedule.isMarketOpen()) {
        console.log('🕒 Market closed - stopping updates');
        this.stopMarketUpdates();
        return;
      }

      try {
        // METHOD 1: Fetch fresh data via API bridge (Arif Habib + PSX fallback)
        const freshData = await this.storage.fetchFreshMarketData();
        
        if (freshData && freshData.length > 0) {
          // Broadcast fresh API data
          this.broadcastToClients({
            type: 'market_update',
            source: 'api_bridge',
            data: {
              stocks: freshData.slice(0, 50), // Top 50 by volume
              summary: await this.storage.getMarketSummary(),
              total: freshData.length
            },
            timestamp: new Date().toISOString()
          });

          // Broadcast KSE100 specifically from fresh data
          const kse100Stocks = freshData
            .filter(stock => stock.listedIn?.includes('KSE100') || freshData.indexOf(stock) < 100)
            .slice(0, 100);
          
          this.broadcastToClients({
            type: 'kse100_update',
            source: 'api_bridge',
            data: {
              stocks: kse100Stocks,
              index: "KSE100"
            },
            timestamp: new Date().toISOString()
          });
        }

        // METHOD 2: Get database-cached data as fallback
        const cachedStocks = await this.storage.getFilteredStocks({ limit: 50 });
        const cachedKSE100 = await this.storage.getFilteredStocksByIndex("KSE100", { limit: 100 });
        
        // Broadcast cached data with different source identifier
        this.broadcastToClients({
          type: 'market_update',
          source: 'database_cache',
          data: {
            stocks: cachedStocks,
            summary: await this.storage.getMarketSummary()
          },
          timestamp: new Date().toISOString()
        });

        // METHOD 3: Supabase real-time updates are handled separately in setupSupabaseRealtime()
        // No need to fetch here as they come via real-time subscriptions

        console.log('📊 Multi-source update completed: API bridge + Database cache + Supabase real-time');

      } catch (error) {
        console.error('Error in multi-source market data update:', error);
        
        // Final fallback: try to get any available data
        try {
          const fallbackStocks = await this.storage.getMarketData();
          this.broadcastToClients({
            type: 'market_update',
            source: 'fallback',
            data: {
              stocks: fallbackStocks.slice(0, 50),
              summary: await this.storage.getMarketSummary()
            },
            timestamp: new Date().toISOString()
          });
        } catch (fallbackError) {
          console.error('Even fallback failed:', fallbackError);
        }
      }
    }, 30000);

    console.log('📊 Multi-source market data updates started: API Bridge + WebSocket + Supabase Real-time');
  }

  private stopMarketUpdates() {
    if (this.marketUpdateInterval) {
      clearInterval(this.marketUpdateInterval);
      this.marketUpdateInterval = null;
      console.log('⏹️ Market data updates stopped');
    }
  }

  private checkMarketStatus() {
    const wasOpen = this.marketUpdateInterval !== null;
    const isOpen = MarketSchedule.isMarketOpen();

    if (isOpen && !wasOpen) {
      console.log('🔔 Market opened - starting updates');
      this.startMarketUpdates();
    } else if (!isOpen && wasOpen) {
      console.log('🔔 Market closed - stopping updates');
      this.stopMarketUpdates();
      
      // Schedule server shutdown after 5 minutes of market close
      setTimeout(() => {
        this.stop();
      }, 5 * 60 * 1000);
    }

    // Broadcast market status to all clients
    this.broadcastToClients({
      type: 'market_status',
      data: MarketSchedule.getMarketStatus(),
      timestamp: new Date().toISOString()
    });
  }

  private broadcastToClients(message: any) {
    const messageStr = JSON.stringify(message);
    
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      } else {
        this.clients.delete(client);
      }
    });
  }

  private scheduleNextStart() {
    const timeUntilOpen = MarketSchedule.getTimeUntilMarketOpen();
    
    if (timeUntilOpen) {
      console.log(`⏰ Next market open in ${Math.round(timeUntilOpen / (1000 * 60 * 60))} hours`);
      
      setTimeout(() => {
        this.start();
      }, timeUntilOpen);
    }
  }

  async stop() {
    console.log('🛑 Stopping Market WebSocket server...');

    this.stopMarketUpdates();

    if (this.statusCheckInterval) {
      clearInterval(this.statusCheckInterval);
    }

    if (this.supabaseSubscription) {
      await supabase.removeChannel(this.supabaseSubscription);
    }

    if (this.wss) {
      this.wss.close();
    }

    if (this.server) {
      this.server.close();
    }

    this.clients.clear();
    
    // Schedule next start
    this.scheduleNextStart();
  }
}