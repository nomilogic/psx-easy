import { eq, desc, and, sql } from "drizzle-orm";
import { db, supabase } from "./db";
import {
  stocks as stocksTable,
  marketSummaries as marketSummariesTable,
  sectors as sectorsTable,
  stockTimeSeries as stockTimeSeriesTable,
  companies as companiesTable,
  insertStockSchema,
  insertMarketSummarySchema,
  insertSectorSchema,
  insertStockTimeSeriesSchema,
  insertCompanySchema,
  type StockData,
  type SectorData,
  type MarketSummary,
  type CompanyData,
  type ChartTimeInterval,
  type SystemStatus,
  type PerformersData,
  type StockTimeSeries,
} from "@shared/schema";
import { PSXService } from "./services/psx-service";
import {
  type StockData as LegacyStockData,
  type SectorData as LegacySectorData,
  type PerformersData as LegacyPerformersData,
  type ChartTimeInterval as LegacyChartTimeInterval,
  type SystemStatus as LegacySystemStatus,
  type MarketSummary as LegacyMarketSummary,
  type CompanyData as LegacyCompanyData,
  stocks as legacyStocks,
  marketSummaries as legacyMarketSummaries,
  sectors as legacySectors,
  stockTimeSeries as legacyStockTimeSeries,
  companies as legacyCompanies,
  type InsertStock as LegacyInsertStock,
  type InsertMarketSummary as LegacyInsertMarketSummary,
  type InsertSector as LegacyInsertSector,
  type InsertStockTimeSeries as LegacyInsertStockTimeSeries,
  type InsertCompany as LegacyInsertCompany,
} from "@shared/schema";

export interface IStorage {
  // Market data methods
  getMarketData(): Promise<StockData[]>;
  setMarketData(data: StockData[]): Promise<void>;
  getMarketSummary(): Promise<LegacyMarketSummary | null>;
  setMarketSummary(summary: LegacyMarketSummary): Promise<void>;

  // Stock methods
  getStock(symbol: string): Promise<StockData | null>;
  getStockTimeSeries(
    symbol: string,
    interval: ChartTimeInterval,
  ): Promise<any | null>;
  setStockTimeSeries(
    symbol: string,
    interval: ChartTimeInterval,
    data: any,
  ): Promise<void>;

  // Sector methods
  getSectors(): Promise<SectorData[]>;
  setSectors(sectorsData: SectorData[]): Promise<void>;

  // Performer methods
  getPerformers(): Promise<PerformersData | null>;
  setPerformers(performers: PerformersData): Promise<void>;

  // Company methods
  getCompany(symbol: string): Promise<CompanyData | null>;
  setCompany(companyData: CompanyData): Promise<void>;
  getAllCompanies(): Promise<CompanyData[]>;
  setAllCompanies(companiesData: CompanyData[]): Promise<void>;

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
    connectedClients: 0,
  };

  async getMarketData(): Promise<StockData[]> {
    try {
      // First try to get from PSX service with timeout
      const psxData = await Promise.race([
        PSXService.fetchMarketData(),
        new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error('PSX service timeout')), 10000)
        )
      ]);
      
      if (psxData && psxData.length > 0) {
        console.log(`Got ${psxData.length} stocks from PSX service`);
        // Store in database for caching (non-blocking)
        this.setMarketData(psxData).catch(err => 
          console.warn("Background database update failed:", err)
        );
        return psxData;
      }
    } catch (error) {
      console.error(
        "PSX service failed, falling back to database data:",
        error,
      );
    }

    // Try database with timeout protection
    try {
      return await Promise.race([
        this.getMarketDataFromDatabase(),
        new Promise<StockData[]>((_, reject) => 
          setTimeout(() => reject(new Error('Database timeout')), 5000)
        )
      ]);
    } catch (dbError) {
      console.error("Database failed, trying Supabase direct query:", dbError);
      // Fallback to Supabase direct query
      return this.getMarketDataFromSupabase();
    }
  }

  private async getMarketDataFromDatabase(): Promise<StockData[]> {
    const stocks = await db
      .select()
      .from(stocksTable)
      .orderBy(desc(stocksTable.volume));
    return stocks;
  }

  private async getMarketDataFromSupabase(): Promise<StockData[]> {
    try {
      const { data, error } = await supabase
        .from("stocks")
        .select("*")
        .order("volume", { ascending: false });

      if (error) {
        console.error("Supabase query error:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Supabase fallback failed:", error);
      return [];
    }
  }

  async setMarketData(data: StockData[]): Promise<void> {
    if (data.length === 0) return;

    try {
      // Use much smaller batches and faster operations
      const batchSize = 20; // Reduced from 50 to 20
      
      // Skip delete operation to avoid locks, use upsert instead
      console.log(`Starting to upsert ${data.length} stocks in batches of ${batchSize}`);

      // Insert new data in smaller batches
      const insertData: LegacyInsertStock[] = data.map((stock) => ({
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

      // Process in smaller batches with shorter timeout and better error handling
      let successCount = 0;
      for (let i = 0; i < insertData.length; i += batchSize) {
        const batch = insertData.slice(i, i + batchSize);
        
        try {
          await Promise.race([
            this.insertBatchOptimized(batch),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Batch timeout')), 3000) // Reduced timeout
            )
          ]);
          
          successCount += batch.length;
          
          // Smaller delay between batches
          if (i + batchSize < insertData.length) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        } catch (batchError) {
          console.warn(`Batch ${i}-${i + batchSize} failed:`, batchError);
          // Try individual inserts for failed batch
          await this.insertIndividually(batch);
        }
      }
      
      console.log(`Successfully processed ${successCount}/${data.length} stocks`);
    } catch (error) {
      console.error("Error updating market data:", error);
      // Don't throw error to prevent cascading failures
    }
  }

  private async insertBatchOptimized(batch: LegacyInsertStock[]): Promise<void> {
    // Use single bulk insert with conflict resolution
    await db
      .insert(stocksTable)
      .values(batch)
      .onConflictDoUpdate({
        target: stocksTable.symbol,
        set: {
          name: sql.raw('EXCLUDED.name'),
          sector: sql.raw('EXCLUDED.sector'),
          ldcp: sql.raw('EXCLUDED.ldcp'),
          open: sql.raw('EXCLUDED.open'),
          high: sql.raw('EXCLUDED.high'),
          low: sql.raw('EXCLUDED.low'),
          current: sql.raw('EXCLUDED.current'),
          change: sql.raw('EXCLUDED.change'),
          changePercent: sql.raw('EXCLUDED.change_percent'),
          volume: sql.raw('EXCLUDED.volume'),
          isPositive: sql.raw('EXCLUDED.is_positive'),
          updatedAt: new Date(),
        },
      });
  }

  private async insertIndividually(batch: LegacyInsertStock[]): Promise<void> {
    // Fallback method for failed batches - insert one by one
    for (const stock of batch) {
      try {
        await Promise.race([
          db
            .insert(stocksTable)
            .values(stock)
            .onConflictDoUpdate({
              target: stocksTable.symbol,
              set: {
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
                updatedAt: new Date(),
              },
            }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Individual insert timeout')), 1000)
          )
        ]);
      } catch (error) {
        console.warn(`Failed to insert individual stock ${stock.symbol}:`, error);
      }
    }
  }

  async getMarketSummary(): Promise<LegacyMarketSummary | null> {
    try {
      const summaries = await db
        .select()
        .from(marketSummariesTable)
        .orderBy(desc(marketSummariesTable.createdAt))
        .limit(1);

      return summaries[0] || null;
    } catch (error) {
      console.error(
        "Database failed for market summary, trying Supabase:",
        error,
      );
      try {
        const { data, error: supabaseError } = await supabase
          .from("market_summaries")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1);

        if (supabaseError) {
          console.error("Supabase market summary error:", supabaseError);
          return null;
        }

        return data?.[0] || null;
      } catch (supabaseErr) {
        console.error(
          "Supabase fallback failed for market summary:",
          supabaseErr,
        );
        return null;
      }
    }
  }

  async setMarketSummary(summary: LegacyMarketSummary): Promise<void> {
    const insertData: LegacyInsertMarketSummary = {
      totalStocks: summary.totalStocks,
      gainers: summary.gainers,
      losers: summary.losers,
      unchanged: summary.unchanged,
      totalVolume: summary.totalVolume,
    };

    await db.insert(marketSummariesTable).values(insertData);
  }

  async getStock(symbol: string): Promise<StockData | null> {
    const result = await db
      .select()
      .from(stocksTable)
      .where(eq(stocksTable.symbol, symbol));
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

  async getStockTimeSeries(
    symbol: string,
    interval: ChartTimeInterval,
  ): Promise<any | null> {
    const result = await db
      .select()
      .from(stockTimeSeriesTable)
      .where(eq(stockTimeSeriesTable.symbol, symbol))
      .orderBy(desc(stockTimeSeriesTable.updatedAt))
      .limit(1);

    if (result.length === 0) return null;
    return result[0].data;
  }

  async setStockTimeSeries(
    symbol: string,
    interval: ChartTimeInterval,
    data: any,
  ): Promise<void> {
    // Delete existing time series for this symbol and interval
    await db
      .delete(stockTimeSeriesTable)
      .where(eq(stockTimeSeriesTable.symbol, symbol));

    const insertData: LegacyInsertStockTimeSeries = {
      symbol,
      interval,
      data,
    };

    await db.insert(stockTimeSeriesTable).values(insertData);
  }

  async getSectors(): Promise<SectorData[]> {
    const result = await db.select().from(sectorsTable);
    return result.map((sector) => ({
      name: sector.name,
      code: sector.code,
      volume: sector.volume,
    }));
  }

  async setSectors(sectorsData: SectorData[]): Promise<void> {
    // Delete existing data
    await db.delete(sectorsTable);

    // Insert new data
    if (sectorsData.length > 0) {
      const insertData: LegacyInsertSector[] = sectorsData.map((sector) => ({
        name: sector.name,
        code: sector.code,
        volume: sector.volume,
      }));

      await db.insert(sectorsTable).values(insertData);
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

  async getCompany(symbol: string): Promise<CompanyData | null> {
    const upperSymbol = symbol.toUpperCase();
    console.log(`Searching database for company: ${upperSymbol}`);

    const result = await db
      .select()
      .from(companiesTable)
      .where(eq(companiesTable.symbol, upperSymbol));

    console.log(
      `Database query result for ${upperSymbol}: ${result.length} records found`,
    );

    if (result.length === 0) return null;

    const company = result[0];
    console.log(
      `Found company in database: ${company.name} (${company.symbol})`,
    );

    return {
      symbol: company.symbol,
      name: company.name,
      sector: company.sector || undefined,
      description: company.description || undefined,
      website: company.website || undefined,
      phone: company.phone || undefined,
      address: company.address || undefined,
      ceo: company.ceo || undefined,
      marketCap: company.marketCap || undefined,
      sharesOutstanding: company.sharesOutstanding || undefined,
      peRatio: company.peRatio || undefined,
      pbRatio: company.pbRatio || undefined,
      dividendYield: company.dividendYield || undefined,
      epsRatio: company.epsRatio || undefined,
      bookValue: company.bookValue || undefined,
      high52Week: company.high52Week || undefined,
      low52Week: company.low52Week || undefined,
      faceValue: company.faceValue || undefined,
      lotSize: company.lotSize || undefined,
      isinCode: company.isinCode || undefined,
      registrar: company.registrar || undefined,
      auditor: company.auditor || undefined,
      fiscalYearEnd: company.fiscalYearEnd || undefined,
      keyPeople:
        (company.keyPeople as Array<{ name: string; role: string }>) ||
        undefined,
      businessDescription: company.businessDescription || undefined,
      freeFloat: company.freeFloat || undefined,
      payoutRatio: company.payoutRatio || undefined,
      retentionRatio: company.retentionRatio || undefined,
      financialData: company.financialData as any || undefined,
      ratiosData: company.ratiosData as any || undefined,
      equityProfile: company.equityProfile as any || undefined,
      payoutsData: company.payoutsData as any || undefined,
      // Include announcements data
      announcements:
        (company.announcements as {
          [category: string]: Array<{
            date: string;
            title: string;
            documentUrl?: string;
          }>;
        }) || undefined,
    };
  }

  async setCompany(companyData: CompanyData): Promise<void> {
    try {
      console.log(
        `Attempting to save/update company data for ${companyData.symbol} in database`,
      );

      const insertData: LegacyInsertCompany = {
        symbol: companyData.symbol.toUpperCase(),
        name: companyData.name,
        sector: companyData.sector || null,
        description: companyData.description || null,
        website: companyData.website || null,
        phone: companyData.phone || null,
        address: companyData.address || null,
        ceo: companyData.ceo || null,
        marketCap: companyData.marketCap || null,
        sharesOutstanding: companyData.sharesOutstanding || null,
        peRatio: companyData.peRatio || null,
        pbRatio: companyData.pbRatio || null,
        dividendYield: companyData.dividendYield || null,
        epsRatio: companyData.epsRatio || null,
        bookValue: companyData.bookValue || null,
        high52Week: companyData.high52Week || null,
        low52Week: companyData.low52Week || null,
        faceValue: companyData.faceValue || null,
        lotSize: companyData.lotSize || null,
        isinCode: companyData.isinCode || null,
        registrar: companyData.registrar || null,
        auditor: companyData.auditor || null,
        fiscalYearEnd: companyData.fiscalYearEnd || null,
        keyPeople: companyData.keyPeople || null,
        businessDescription: companyData.businessDescription || null,
        freeFloat: companyData.freeFloat || null,
        payoutRatio: companyData.payoutRatio || null,
        retentionRatio: companyData.retentionRatio || null,
        financialData: companyData.financialData || null,
        ratiosData: companyData.ratiosData || null,
        equityProfile: companyData.equityProfile || null,
        payoutsData: companyData.payoutsData || null,
        // Include announcements
        announcements: companyData.announcements || null,
      };

      // Use upsert logic - insert or update if exists
      const result = await db
        .insert(companiesTable)
        .values(insertData)
        .onConflictDoUpdate({
          target: companiesTable.symbol,
          set: {
            ...insertData,
            lastUpdated: new Date(),
          },
        })
        .returning({
          symbol: companiesTable.symbol,
          lastUpdated: companiesTable.lastUpdated,
        });

      console.log(
        `Successfully saved/updated company data for ${companyData.symbol}:`,
        result,
      );
    } catch (error) {
      console.error(
        `Error updating company data for ${companyData.symbol}:`,
        error,
      );
      throw error;
    }
  }

  async getAllCompanies(): Promise<CompanyData[]> {
    const result = await db.select().from(companiesTable);
    return result.map((company) => ({
      symbol: company.symbol,
      name: company.name,
      sector: company.sector || undefined,
      description: company.description || undefined,
      website: company.website || undefined,
      phone: company.phone || undefined,
      address: company.address || undefined,
      ceo: company.ceo || undefined,
      marketCap: company.marketCap || undefined,
      sharesOutstanding: company.sharesOutstanding || undefined,
      peRatio: company.peRatio || undefined,
      pbRatio: company.pbRatio || undefined,
      dividendYield: company.dividendYield || undefined,
      epsRatio: company.epsRatio || undefined,
      bookValue: company.bookValue || undefined,
      high52Week: company.high52Week || undefined,
      low52Week: company.low52Week || undefined,
      faceValue: company.faceValue || undefined,
      lotSize: company.lotSize || undefined,
      isinCode: company.isinCode || undefined,
      registrar: company.registrar || undefined,
      auditor: company.auditor || undefined,
      fiscalYearEnd: company.fiscalYearEnd || undefined,
      keyPeople:
        (company.keyPeople as Array<{ name: string; role: string }>) ||
        undefined,
      businessDescription: company.businessDescription || undefined,
    }));
  }

  async setAllCompanies(companiesData: CompanyData[]): Promise<void> {
    if (companiesData.length === 0) return;

    try {
      await db.transaction(async (tx) => {
        // Insert or update companies in batches
        const batchSize = 50;
        for (let i = 0; i < companiesData.length; i += batchSize) {
          const batch = companiesData.slice(i, i + batchSize);
          const insertData: LegacyInsertCompany[] = batch.map((company) => ({
            symbol: company.symbol.toUpperCase(),
            name: company.name,
            sector: company.sector || null,
            description: company.description || null,
            website: company.website || null,
            phone: company.phone || null,
            address: company.address || null,
            ceo: company.ceo || null,
            marketCap: company.marketCap || null,
            sharesOutstanding: company.sharesOutstanding || null,
            peRatio: company.peRatio || null,
            pbRatio: company.pbRatio || null,
            dividendYield: company.dividendYield || null,
            epsRatio: company.epsRatio || null,
            bookValue: company.bookValue || null,
            high52Week: company.high52Week || null,
            low52Week: company.low52Week || null,
            faceValue: company.faceValue || null,
            lotSize: company.lotSize || null,
            isinCode: company.isinCode || null,
            registrar: company.registrar || null,
            auditor: company.auditor || null,
            fiscalYearEnd: company.fiscalYearEnd || null,
            keyPeople: company.keyPeople || null,
            businessDescription: company.businessDescription || null,
          }));

          for (const company of insertData) {
            await tx
              .insert(companiesTable)
              .values(company)
              .onConflictDoUpdate({
                target: companiesTable.symbol,
                set: {
                  ...company,
                  lastUpdated: new Date(),
                },
              });
          }
        }
      });
    } catch (error) {
      console.error("Error updating companies data:", error);
      throw error;
    }
  }

  async updateSystemStatus(status: Partial<SystemStatus>): Promise<void> {
    this.systemStatus = { ...this.systemStatus, ...status };
  }
}

export const storage = new DatabaseStorage();
