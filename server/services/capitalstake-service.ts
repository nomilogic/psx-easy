
import { WebSocket } from "ws";
import type { StockData, MarketSummary } from "@shared/schema";

interface CapitalStakeTickData {
  t: string; // type: "tick"
  d: {
    m: string; // market: "REG"
    st: string; // session type: "OPN"
    s: string; // symbol
    t: number; // timestamp
    o: number; // open
    h: number; // high
    l: number; // low
    c: number; // close/current
    v: number; // volume
    ldcp: number; // last day closing price
    ch: number; // change
    pch: number; // percentage change
    bp: number; // bid price
    bv: number; // bid volume
    ap: number; // ask price
    av: number; // ask volume
    val: number; // value
    tr: number; // trades
    lt: {
      t: number; // last trade time
      x: number; // last trade price
      v: number; // last trade volume
    };
  };
}

export class CapitalStakeService {
  private static instance: CapitalStakeService;
  private ws: WebSocket | null = null;
  private subscribers: Set<(data: StockData[]) => void> = new Set();
  private stocksData: Map<string, StockData> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 5000;
  private isConnecting = false;

  private constructor() {}

  static getInstance(): CapitalStakeService {
    if (!this.instance) {
      this.instance = new CapitalStakeService();
    }
    return this.instance;
  }

  connect(): void {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;
    console.log('Connecting to CapitalStake WebSocket...');

    try {
      this.ws = new WebSocket('wss://market.capitalstake.com/stream');

      this.ws.onopen = () => {
        console.log('✅ Connected to CapitalStake WebSocket');
        this.reconnectAttempts = 0;
        this.isConnecting = false;
      };

      this.ws.onmessage = (event) => {
        try {
          const message: CapitalStakeTickData = JSON.parse(event.data);
          if (message.t === 'tick') {
            this.processTickData(message);
          }
        } catch (error) {
          console.error('Error parsing CapitalStake message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('❌ CapitalStake WebSocket disconnected');
        this.isConnecting = false;
        this.ws = null;
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('CapitalStake WebSocket error:', error);
        this.isConnecting = false;
      };

    } catch (error) {
      console.error('Failed to connect to CapitalStake WebSocket:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached for CapitalStake');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect to CapitalStake in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  private processTickData(message: CapitalStakeTickData): void {
    const { d } = message;
    
    // Convert CapitalStake format to our StockData format
    const stockData: StockData = {
      symbol: d.s,
      name: `${d.s} Limited`, // We'll need to map this properly later
      sector: "Unknown", // We'll need to map this from another source
      ldcp: d.ldcp,
      open: d.o,
      high: d.h,
      low: d.l,
      current: d.c,
      change: d.ch,
      changePercent: d.pch * 100, // Convert to percentage
      volume: d.v,
      isPositive: d.ch >= 0,
      lastTradeTime: new Date(d.lt.t * 1000).toISOString(),
      lastTradePrice: d.lt.x,
      lastTradeVolume: d.lt.v,
      bidPrice: d.bp,
      bidVolume: d.bv,
      askPrice: d.ap,
      askVolume: d.av,
      value: d.val,
      trades: d.tr
    };

    // Update our stocks data map
    this.stocksData.set(d.s, stockData);

    // Broadcast to all subscribers
    const allStocks = Array.from(this.stocksData.values());
    this.subscribers.forEach(callback => {
      try {
        callback(allStocks);
      } catch (error) {
        console.error('Error in subscriber callback:', error);
      }
    });
  }

  subscribe(callback: (data: StockData[]) => void): () => void {
    this.subscribers.add(callback);
    
    // Send current data immediately if available
    if (this.stocksData.size > 0) {
      callback(Array.from(this.stocksData.values()));
    }

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  getStocksData(): StockData[] {
    return Array.from(this.stocksData.values());
  }

  calculateMarketSummary(): MarketSummary {
    const stocks = this.getStocksData();
    const gainers = stocks.filter(stock => stock.change > 0).length;
    const losers = stocks.filter(stock => stock.change < 0).length;
    const unchanged = stocks.filter(stock => stock.change === 0).length;
    const totalVolume = stocks.reduce((sum, stock) => sum + (stock.volume || 0), 0);

    return {
      totalStocks: stocks.length,
      gainers,
      losers,
      unchanged,
      totalVolume
    };
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscribers.clear();
    this.stocksData.clear();
    this.reconnectAttempts = 0;
    this.isConnecting = false;
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}
