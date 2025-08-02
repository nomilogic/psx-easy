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
    // Subscribe to stock table changes for real-time updates
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
          // Broadcast individual stock updates
          this.broadcastToClients({
            type: 'stock_update',
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
          // Broadcast new stock additions
          this.broadcastToClients({
            type: 'new_stock',
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
          // Broadcast market summary updates
          this.broadcastToClients({
            type: 'market_summary_update',
            data: payload.new,
            timestamp: new Date().toISOString()
          });
        }
      )
      .subscribe();

    console.log('🔄 Supabase real-time subscription active for live stock updates');
  }

  private startMarketUpdates() {
    if (!MarketSchedule.isMarketOpen()) {
      console.log('🕒 Market closed - stopping updates');
      return;
    }

    // Update market data every 30 seconds during market hours
    this.marketUpdateInterval = setInterval(async () => {
      if (!MarketSchedule.isMarketOpen()) {
        console.log('🕒 Market closed - stopping updates');
        this.stopMarketUpdates();
        return;
      }

      try {
        // Get KSE100 stocks for real-time updates
        const kse100Stocks = await this.storage.getFilteredStocksByIndex("KSE100", { limit: 100 });
        const marketSummary = await this.storage.getMarketSummary();

        // Broadcast KSE100 updates specifically
        this.broadcastToClients({
          type: 'kse100_update',
          data: {
            stocks: kse100Stocks,
            summary: marketSummary,
            index: "KSE100"
          },
          timestamp: new Date().toISOString()
        });

        // Also broadcast general market update with top movers
        const topStocks = await this.storage.getFilteredStocks({ limit: 50 });
        this.broadcastToClients({
          type: 'market_update',
          data: {
            stocks: topStocks,
            summary: marketSummary
          },
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('Error updating market data:', error);
      }
    }, 30000);

    console.log('📊 Market data updates started (30s interval) with KSE100 focus');
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