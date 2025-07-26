import { 
  type StockData, 
  type SectorData, 
  type PerformersData,
  type ChartTimeInterval,
  type SystemStatus,
  type MarketSummary as LegacyMarketSummary,
  stocks,
  marketSummaries,
  sectors,
  stockTimeSeries,
  type InsertStock,
  type InsertMarketSummary,
  type InsertSector,
  type InsertStockTimeSeries
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Market data methods
  getMarketData(): Promise<StockData[]>;
  setMarketData(data: StockData[]): Promise<void>;
  getMarketSummary(): Promise<LegacyMarketSummary | null>;
  setMarketSummary(summary: LegacyMarketSummary): Promise<void>;
  
  // Stock methods
  getStock(symbol: string): Promise<StockData | null>;
  getStockTimeSeries(symbol: string, interval: ChartTimeInterval): Promise<any | null>;
  setStockTimeSeries(symbol: string, interval: ChartTimeInterval, data: any): Promise<void>;
  
  // Sector methods
  getSectors(): Promise<SectorData[]>;
  setSectors(sectorsData: SectorData[]): Promise<void>;
  
  // Performer methods
  getPerformers(): Promise<PerformersData | null>;
  setPerformers(performers: PerformersData): Promise<void>;
  
  // System status
  getSystemStatus(): Promise<SystemStatus>;
  updateSystemStatus(status: Partial<SystemStatus>): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  private performers: PerformersData | null = null;
  private systemStatus: SystemStatus = {
    uptime: "99.9%",
    avgResponse: "45ms",
    memoryUsage: "2.3GB",
    apiCallsPerMin: 0,
    connectedClients: 0
  };

  async getMarketData(): Promise<StockData[]> {
    const result = await db.select().from(stocks);
    return result.map(stock => ({
      symbol: stock.symbol,
      name: stock.name,
      sector: stock.sector,
      ldcp: stock.ldcp,
      open: stock.open,
      high: stock.high,
      low: stock.low,
      current: stock.current,
      change: stock.change,
      changePercent: stock.changePercent,
      volume: stock.volume,
      isPositive: stock.isPositive,
    }));
  }

  async setMarketData(data: StockData[]): Promise<void> {
    if (data.length === 0) return;
    
    try {
      // Use transaction to ensure atomicity
      await db.transaction(async (tx) => {
        // Delete existing data
        await tx.delete(stocks);
        
        // Insert new data
        const insertData: InsertStock[] = data.map(stock => ({
          symbol: stock.symbol,
          name: stock.name,
          sector: stock.sector,
          ldcp: stock.ldcp,
          open: stock.open,
          high: stock.high,
          low: stock.low,
          current: stock.current,
          change: stock.change,
          changePercent: stock.changePercent,
          volume: stock.volume,
          isPositive: stock.isPositive,
        }));
        
        // Insert in batches to avoid memory issues
        const batchSize = 100;
        for (let i = 0; i < insertData.length; i += batchSize) {
          const batch = insertData.slice(i, i + batchSize);
          await tx.insert(stocks).values(batch);
        }
      });
    } catch (error) {
      console.error('Error updating market data:', error);
      throw error;
    }
  }

  async getMarketSummary(): Promise<LegacyMarketSummary | null> {
    const result = await db.select().from(marketSummaries).orderBy(desc(marketSummaries.createdAt)).limit(1);
    if (result.length === 0) return null;
    
    const summary = result[0];
    return {
      totalStocks: summary.totalStocks,
      gainers: summary.gainers,
      losers: summary.losers,
      unchanged: summary.unchanged,
      totalVolume: summary.totalVolume,
    } as LegacyMarketSummary;
  }

  async setMarketSummary(summary: LegacyMarketSummary): Promise<void> {
    const insertData: InsertMarketSummary = {
      totalStocks: summary.totalStocks,
      gainers: summary.gainers,
      losers: summary.losers,
      unchanged: summary.unchanged,
      totalVolume: summary.totalVolume,
    };
    
    await db.insert(marketSummaries).values(insertData);
  }

  async getStock(symbol: string): Promise<StockData | null> {
    const result = await db.select().from(stocks).where(eq(stocks.symbol, symbol));
    if (result.length === 0) return null;
    
    const stock = result[0];
    return {
      symbol: stock.symbol,
      name: stock.name,
      sector: stock.sector,
      ldcp: stock.ldcp,
      open: stock.open,
      high: stock.high,
      low: stock.low,
      current: stock.current,
      change: stock.change,
      changePercent: stock.changePercent,
      volume: stock.volume,
      isPositive: stock.isPositive,
    };
  }

  async getStockTimeSeries(symbol: string, interval: ChartTimeInterval): Promise<any | null> {
    const result = await db.select().from(stockTimeSeries)
      .where(eq(stockTimeSeries.symbol, symbol))
      .orderBy(desc(stockTimeSeries.updatedAt))
      .limit(1);
    
    if (result.length === 0) return null;
    return result[0].data;
  }

  async setStockTimeSeries(symbol: string, interval: ChartTimeInterval, data: any): Promise<void> {
    // Delete existing time series for this symbol and interval
    await db.delete(stockTimeSeries)
      .where(eq(stockTimeSeries.symbol, symbol));
    
    const insertData: InsertStockTimeSeries = {
      symbol,
      interval,
      data,
    };
    
    await db.insert(stockTimeSeries).values(insertData);
  }

  async getSectors(): Promise<SectorData[]> {
    const result = await db.select().from(sectors);
    return result.map(sector => ({
      name: sector.name,
      code: sector.code,
      volume: sector.volume,
    }));
  }

  async setSectors(sectorsData: SectorData[]): Promise<void> {
    // Delete existing data
    await db.delete(sectors);
    
    // Insert new data
    if (sectorsData.length > 0) {
      const insertData: InsertSector[] = sectorsData.map(sector => ({
        name: sector.name,
        code: sector.code,
        volume: sector.volume,
      }));
      
      await db.insert(sectors).values(insertData);
    }
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

export const storage = new DatabaseStorage();
