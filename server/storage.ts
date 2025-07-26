import { 
  type StockData, 
  type MarketSummary, 
  type SectorData, 
  type PerformersData,
  type StockTimeSeriesData,
  type ChartTimeInterval,
  type SystemStatus
} from "@shared/schema";

export interface IStorage {
  // Market data methods
  getMarketData(): Promise<StockData[]>;
  setMarketData(data: StockData[]): Promise<void>;
  getMarketSummary(): Promise<MarketSummary | null>;
  setMarketSummary(summary: MarketSummary): Promise<void>;
  
  // Stock methods
  getStock(symbol: string): Promise<StockData | null>;
  getStockTimeSeries(symbol: string, interval: ChartTimeInterval): Promise<StockTimeSeriesData | null>;
  setStockTimeSeries(symbol: string, interval: ChartTimeInterval, data: StockTimeSeriesData): Promise<void>;
  
  // Sector methods
  getSectors(): Promise<SectorData[]>;
  setSectors(sectors: SectorData[]): Promise<void>;
  
  // Performer methods
  getPerformers(): Promise<PerformersData | null>;
  setPerformers(performers: PerformersData): Promise<void>;
  
  // System status
  getSystemStatus(): Promise<SystemStatus>;
  updateSystemStatus(status: Partial<SystemStatus>): Promise<void>;
}

export class MemStorage implements IStorage {
  private marketData: StockData[] = [];
  private marketSummary: MarketSummary | null = null;
  private sectors: SectorData[] = [];
  private performers: PerformersData | null = null;
  private stockTimeSeriesCache: Map<string, StockTimeSeriesData> = new Map();
  private systemStatus: SystemStatus = {
    uptime: "99.9%",
    avgResponse: "45ms",
    memoryUsage: "2.3GB",
    apiCallsPerMin: 0,
    connectedClients: 0
  };

  async getMarketData(): Promise<StockData[]> {
    return this.marketData;
  }

  async setMarketData(data: StockData[]): Promise<void> {
    this.marketData = data;
  }

  async getMarketSummary(): Promise<MarketSummary | null> {
    return this.marketSummary;
  }

  async setMarketSummary(summary: MarketSummary): Promise<void> {
    this.marketSummary = summary;
  }

  async getStock(symbol: string): Promise<StockData | null> {
    return this.marketData.find(stock => stock.symbol === symbol) || null;
  }

  async getStockTimeSeries(symbol: string, interval: ChartTimeInterval): Promise<StockTimeSeriesData | null> {
    const key = `${symbol}-${interval}`;
    return this.stockTimeSeriesCache.get(key) || null;
  }

  async setStockTimeSeries(symbol: string, interval: ChartTimeInterval, data: StockTimeSeriesData): Promise<void> {
    const key = `${symbol}-${interval}`;
    this.stockTimeSeriesCache.set(key, data);
  }

  async getSectors(): Promise<SectorData[]> {
    return this.sectors;
  }

  async setSectors(sectors: SectorData[]): Promise<void> {
    this.sectors = sectors;
  }

  async getPerformers(): Promise<PerformersData | null> {
    return this.performers;
  }

  async setPerformers(performers: PerformersData): Promise<void> {
    this.performers = performers;
  }

  async getSystemStatus(): Promise<SystemStatus> {
    return this.systemStatus;
  }

  async updateSystemStatus(status: Partial<SystemStatus>): Promise<void> {
    this.systemStatus = { ...this.systemStatus, ...status };
  }
}

export const storage = new MemStorage();
