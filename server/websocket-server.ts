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
    // Subscribe to stock table changes
    this.supabaseSubscription = supabase
      .channel('stocks_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stocks'
        },
        (payload) => {
          this.broadcastToClients({
            type: 'stock_update',
            data: payload,
            timestamp: new Date().toISOString()
          });
        }
      )
      .subscribe();

    console.log('🔄 Supabase real-time subscription active');
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
        // Get latest market data from database (no external fetching)
        const marketData = await this.storage.getMarketData();
        const marketSummary = await this.storage.getMarketSummary();

        // Broadcast to all connected clients
        this.broadcastToClients({
          type: 'market_update',
          data: {
            stocks: marketData.slice(0, 100), // Send top 100 for performance
            summary: marketSummary
          },
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('Error updating market data:', error);
      }
    }, 30000);

    console.log('📊 Market data updates started (30s interval)');
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