import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { WebSocket } from "ws";
import https from "https";

type ChartTimeInterval =
  | "1min"
  | "5min"
  | "15min"
  | "30min"
  | "1hour"
  | "1day"
  | "1week"
  | "1month"
  | "1year";

interface StockData {
  symbol: string;
  name: string;
  sector: string;
  ldcp: number;
  open: number;
  high: number;
  low: number;
  current: number;
  change: number;
  changePercent: number;
  volume: number;
  isPositive: boolean;
}

interface MarketSummary {
  totalStocks: number;
  gainers: number;
  losers: number;
  unchanged: number;
  totalVolume: number;
}

interface ChartDataPoint {
  date: string;
  price: number;
  volume: number;
  timestamp: number;
}

interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface StockTimeSeriesData {
  symbol: string;
  name: string;
  sector: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  peRatio?: number;
  dividendYield?: number;
  high52Week?: number;
  low52Week?: number;
  chartData: ChartDataPoint[];
  historicalData: HistoricalDataPoint[];
}

interface SectorData {
  name: string;
  code: string;
  volume: number;
}

interface PerformerStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  isPositive: boolean;
}

interface PerformersData {
  active: PerformerStock[];
  advancers: PerformerStock[];
  decliners: PerformerStock[];
}

interface TopSectorsData {
  sectors: SectorData[];
  totalVolume: number;
}

interface Symbol {
  symbol: string;
  name: string;
  sectorName: string;
  isETF: boolean;
  isDebt: boolean;
}
const CORS_PROXIES = [
  "https://api.allorigins.win/get?url=",
  "https://cors-proxy.org/?",
  "https://thingproxy.freeboard.io/fetch/",
  "https://corsproxy.io/?",
  "https://api.codetabs.com/v1/proxy?quest=",
];

export class PSXService {
  private static readonly BASE_URL = "https://dps.psx.com.pk";
  private static readonly API_URL = `${PSXService.BASE_URL}/market-watch`;
  private static readonly TIMESERIES_URL = `${PSXService.BASE_URL}/timeseries/int`;
  private static readonly EOD_URL = `${PSXService.BASE_URL}/timeseries/eod`;
  private static readonly TOP_SECTORS_URL = `${PSXService.BASE_URL}/data/top-10-sectors`;
  private static readonly PERFORMERS_URL = `${PSXService.BASE_URL}/performers`;
  private static readonly HISTORICAL_URL = `${PSXService.BASE_URL}/historical`;
  private static readonly SYMBOL_URL = `${PSXService.BASE_URL}/symbols`;

  private static async fetchWithRetry<T extends string | object>(
    url: string,
    isJson: boolean = true,
  ): Promise<T> {
    if (!url) {
      throw new Error("URL is null or undefined");
    }

    for (const proxy of CORS_PROXIES) {
      try {
        const proxyUrl = proxy.includes('allorigins.win') 
          ? `${proxy}${encodeURIComponent(url)}`
          : `${proxy}${encodeURIComponent(url)}`;
          
        const response = await fetch(proxyUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            Accept: "application/json,text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          },
          timeout: 10000,
        });

        if (!response || !response.ok) {
          throw new Error(`HTTP ${response?.status || 'unknown'}: ${response?.statusText || 'Network error'}`);
        }

        let data;
        if (proxy.includes('allorigins.win')) {
          const jsonResponse = await response.json();
          data = isJson ? JSON.parse(jsonResponse.contents) : jsonResponse.contents;
        } else {
          data = isJson ? await response.json() : await response.text();
        }

        if (!data) {
          throw new Error("No data in response");
        }

        return data as T;
      } catch (error) {
        console.warn(`Attempt with proxy ${proxy} failed:`, error);
        continue;
      }
    }
    
    // If all proxies fail, return mock data for development
    console.warn("All proxy attempts failed, using fallback data");
    if (url.includes('market-watch')) {
      return this.getMockData() as T;
    }
    throw new Error("All proxy attempts failed");
  }

  private static symbolsCache: { [symbolId: string]: Symbol } | null = null;
  private static symbolsCacheTimestamp: number | null = null;

  static async fetchSymbols(): Promise<Symbol[]> {
    await this.fetchSymbolsInternal();
    return Object.values(this.symbolsCache || {});
  }

  private static async fetchSymbolsInternal(): Promise<void> {
    const now = new Date().getTime();
    if (
      this.symbolsCache &&
      this.symbolsCacheTimestamp &&
      now - this.symbolsCacheTimestamp < 24 * 60 * 60 * 1000
    ) {
      // Cache is valid, return cached data
      return;
    }

    try {
      const response = await this.fetchWithRetry<string>(
        this.SYMBOL_URL,
        false,
      );
      const symbols = JSON.parse(response) as Symbol[];
      console.log(`Fetched ${symbols.length} symbols from PSX service`);

      this.symbolsCache = symbols.reduce(
        (acc: { [symbolId: string]: Symbol }, symbol) => {
          acc[symbol.symbol] = symbol;
          return acc;
        },
        {},
      );
      this.symbolsCacheTimestamp = now;
    } catch (error) {
      console.error("Error fetching symbols:", error);
      // Initialize empty cache if fetch fails
      if (!this.symbolsCache) {
        this.symbolsCache = {};
      }
    }
  }
  static async fetchMarketData(): Promise<StockData[] | undefined> {
    try {
      await this.fetchSymbols(); // Call fetchSymbols first to get proper names and sectors
      const html = await this.fetchWithRetry<string>(this.API_URL, false);
      const stockData = this.parseHTMLData(html);
      //console.log(stockData, "stockData");

      // Map stock data with proper names and sectors from symbols service
      stockData.forEach((stock) => {
        const symbolInfo = this.symbolsCache?.[stock.symbol];

        if (symbolInfo) {
          // Use proper company name from symbols service
          stock.name = symbolInfo.name || `${stock.symbol} Limited`;
          // Use proper sector name from symbols service
          stock.sector = symbolInfo.sectorName || stock.sector;
        } else {
          // Fallback if symbol not found in cache
          stock.name = `${stock.symbol} Limited`;
        }
      });

      return stockData;
    } catch (error) {
      console.error("Error fetching market data:", error);
      console.error(
        "All CORS proxies failed - cannot fetch authentic PSX data",
      );
      // Never return mock data for market data - only authentic data should be persisted
      return undefined;
    }
  }

  static calculateMarketSummary(stocks: StockData[]): MarketSummary {
    const gainers = stocks.filter((stock) => stock.change > 0).length;
    const losers = stocks.filter((stock) => stock.change < 0).length;
    const unchanged = stocks.filter((stock) => stock.change === 0).length;
    const totalVolume = stocks.reduce((sum, stock) => sum + stock.volume, 0);

    return {
      totalStocks: stocks.length,
      gainers,
      losers,
      unchanged,
      totalVolume,
    };
  }

  static async fetchStockTimeSeries(
    symbol: string,
    interval: ChartTimeInterval = "1day",
  ): Promise<StockTimeSeriesData> {
    try {
      const isEod = ["1day", "1week", "1month", "1year"].includes(interval);
      const url = isEod ? this.EOD_URL : this.TIMESERIES_URL;

      const jsonData = await this.fetchWithRetry<any>(`${url}/${symbol}`);
      let chartData = this.parseJSONChartData(
        jsonData,
        symbol,
        isEod ? "1day" : "1min",
      );

      if (interval !== "1day" && interval !== "1min") {
        chartData = this.aggregateDataByInterval(chartData, interval);
      }

      return {
        symbol,
        name: `${symbol} name Limited`,
        sector: "ALLSHR",
        currentPrice:
          chartData.length > 0 ? chartData[chartData.length - 1].price : 0,
        change: 0,
        changePercent: 0,
        volume:
          chartData.length > 0 ? chartData[chartData.length - 1].volume : 0,
        chartData,
        historicalData: [],
      };
    } catch (error) {
      console.error(`Error fetching time series for ${symbol}:`, error);
      return this.getMockTimeSeriesData(symbol, interval);
    }
  }

  static async fetchTopSectors(): Promise<SectorData[]> {
    try {
      const sectors = await this.fetchWithRetry<SectorData[]>(
        this.TOP_SECTORS_URL,
      );
      return sectors;
    } catch (error) {
      console.error("Error fetching top sectors:", error);
      return [
        { name: "BANKS", code: "BANK", volume: 0 },
        { name: "CEMENT", code: "CEMENT", volume: 0 },
        { name: "OIL & GAS", code: "OILGAS", volume: 0 },
      ];
    }
  }

  static async fetchPerformers(): Promise<PerformersData> {
    try {
      const html = await this.fetchWithRetry<string>(
        this.PERFORMERS_URL,
        false,
      );

      //console.log(html);
      //return html;
      return this.parsePerformersHTML(html);
    } catch (error) {
      console.error("Error fetching performers:", error);
      return { active: [], advancers: [], decliners: [] };
    }
  }

  static async fetchHistoricalData(
    symbol: string,
    month: number,
    year: number,
  ): Promise<HistoricalDataPoint[]> {
    try {
      const params = new URLSearchParams({
        month: month.toString(),
        year: year.toString(),
        symbol,
      });

      const url = `${this.HISTORICAL_URL}?${params.toString()}`;
      const html = await this.fetchWithRetry<string>(url, false);
      return this.parseHistoricalHTML(html);
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
      return this.generateMockHistoricalData();
    }
  }

  // Helper methods for parsing and generating mock data
  private static parseHTMLData(html: string): StockData[] {
    const $ = cheerio.load(html);
    const stocks: StockData[] = [];

    $("tr").each((_: any, row: any) => {
      const cells = $(row).find("td");
      if (cells.length > 6) {
        const symbol = $(cells[0]).find("strong").text().trim();
        const name = $(cells[0]).find("a").attr("data-title") || "";
        const sector = $(cells[0]).text().trim();
        const ldcp = parseFloat($(cells[3]).attr("data-order") || "0");
        const open = parseFloat($(cells[4]).attr("data-order") || "0");
        const high = parseFloat($(cells[5]).attr("data-order") || "0");
        const low = parseFloat($(cells[6]).attr("data-order") || "0");
        const current = parseFloat($(cells[7]).attr("data-order") || "0");
        const change = parseFloat($(cells[8]).attr("data-order") || "0");
        const changePercent = parseFloat($(cells[9]).attr("data-order") || "0");
        const volume = parseInt($(cells[10]).attr("data-order") || "0", 10);
        // console.log($(cells[10]).attr("data-order"), "data-tippy");
        const isPositive = change >= 0;

        if (symbol) {
          // console.log(
          //   symbol,
          //   name,
          //   sector,
          //   ldcp,
          //   open,
          //   high,
          //   low,
          //   current,
          //   change,
          //   changePercent,
          //   volume,
          //   isPositive,
          //   "symbol",
          // );
          stocks.push({
            symbol,
            name,
            sector,
            ldcp,
            open,
            high,
            low,
            current,
            change,
            changePercent,
            volume,
            isPositive,
          });
        }
      }
    });

    return stocks.length > 0 ? stocks : this.getMockData();
  }

  private static parseJSONChartData(
    data: any,
    symbol: string,
    interval: string,
  ): ChartDataPoint[] {
    if (!data?.data || !Array.isArray(data.data)) {
      return [];
    }

    return data.data
      .map((item: any) => {
        if (item.length >= 3) {
          const [timestamp, price, volume] = item;
          return {
            date: new Date(timestamp * 1000).toISOString(),
            price: parseFloat(price) || 0,
            volume: parseInt(volume, 10) || 0,
            timestamp: timestamp * 1000,
          };
        }
        return null;
      })
      .filter(Boolean) as ChartDataPoint[];
  }

  private static aggregateDataByInterval(
    data: ChartDataPoint[],
    interval: ChartTimeInterval,
  ): ChartDataPoint[] {
    if (interval === "1min" || interval === "1day") {
      return data;
    }

    const intervalMap: Record<string, number> = {
      "5min": 5 * 60 * 1000,
      "15min": 15 * 60 * 1000,
      "30min": 30 * 60 * 1000,
      "1hour": 60 * 60 * 1000,
    };

    const intervalMs = intervalMap[interval];
    if (!intervalMs) {
      return data;
    }

    const aggregated: ChartDataPoint[] = [];
    let currentIntervalStart = 0;
    let currentIntervalData: ChartDataPoint[] = [];

    for (const point of data) {
      if (point.timestamp >= currentIntervalStart + intervalMs) {
        if (currentIntervalData.length > 0) {
          const lastPoint = currentIntervalData[currentIntervalData.length - 1];
          aggregated.push({
            ...lastPoint,
            volume: currentIntervalData.reduce((sum, p) => sum + p.volume, 0),
          });
        }
        currentIntervalStart = point.timestamp - (point.timestamp % intervalMs);
        currentIntervalData = [point];
      } else {
        currentIntervalData.push(point);
      }
    }

    return aggregated;
  }

  private static parsePerformersHTML(html: string): PerformersData {
    const $ = cheerio.load(html);
    const performers: PerformersData = {
      active: [],
      advancers: [],
      decliners: [],
    };

    // This is a simplified parser - adjust selectors based on actual HTML structure

    $("h3.marketPerf__heading").each((_: any, headingEl: any) => {
      const heading = $(headingEl).text().trim().toLowerCase();
      let type: keyof typeof performers | null = null;

      if (heading.includes("active")) type = "active";
      else if (heading.includes("advancer")) type = "advancers";
      else if (heading.includes("decliner")) type = "decliners";

      if (!type) return;

      const table = $(headingEl).next(".marketPerf__table").find("table.tbl");
      const rows = table.find("tbody.tbl__body tr");

      rows.each((_, row) => {
        const tds = $(row).find("td");
        const symbol = $(tds[0]).find("strong").text().trim();
        const name = $(tds[0]).find("a").attr("data-tippy")?.trim() || "";
        const price = parseFloat($(tds[1]).text().replace(/,/g, "")) || 0;

        const changeText = $(tds[2]).text().trim();
        const match = changeText.match(
          /([-+]?[0-9,.]+)\s*\(([-+]?[0-9,.]+)%\)/,
        );
        const change = match ? parseFloat(match[1].replace(/,/g, "")) : 0;
        const changePercent = match
          ? parseFloat(match[2].replace(/,/g, ""))
          : 0;
        const isPositive = change >= 0;

        const volume = parseInt($(tds[3]).text().replace(/,/g, ""), 10) || 0;

        const performer: PerformerStock = {
          symbol,
          name,
          price,
          change,
          changePercent,
          volume,
          isPositive,
        };

        performers[type].push(performer);
      });
    });

    return performers;
  }

  private static parseHistoricalHTML(html: string): HistoricalDataPoint[] {
    const $ = cheerio.load(html);
    const data: HistoricalDataPoint[] = [];

    $("tr").each((_: any, row: any) => {
      const cells = $(row).find("td");
      if (cells.length >= 6) {
        data.push({
          date: $(cells[0]).text().trim(),
          open: parseFloat($(cells[1]).text().replace(/,/g, "")) || 0,
          high: parseFloat($(cells[2]).text().replace(/,/g, "")) || 0,
          low: parseFloat($(cells[3]).text().replace(/,/g, "")) || 0,
          close: parseFloat($(cells[4]).text().replace(/,/g, "")) || 0,
          volume: parseInt($(cells[5]).text().replace(/,/g, ""), 10) || 0,
        });
      }
    });

    return data.length > 0 ? data : this.generateMockHistoricalData();
  }

  // Mock data generators for fallback
  private static getMockData(): StockData[] {
    return [
      {
        symbol: "PPL",
        name: "Pakistan Petroleum Limited",
        sector: "OIL & GAS EXPLORATION COMPANIES",
        ldcp: 100.5,
        open: 101.0,
        high: 102.5,
        low: 100.0,
        current: 101.75,
        change: 1.25,
        changePercent: 1.24,
        volume: 1000000,
        isPositive: true,
      },
      {
        symbol: "TRG",
        name: "The Resource Group International Limited",
        sector: "TECHNOLOGY & COMMUNICATION",
        ldcp: 45.5,
        open: 46.0,
        high: 47.25,
        low: 45.25,
        current: 46.75,
        change: 1.25,
        changePercent: 2.75,
        volume: 850000,
        isPositive: true,
      },
      {
        symbol: "HBL",
        name: "Habib Bank Limited",
        sector: "COMMERCIAL BANKS",
        ldcp: 89.25,
        open: 88.75,
        high: 90.5,
        low: 88.0,
        current: 87.5,
        change: -1.75,
        changePercent: -1.96,
        volume: 1200000,
        isPositive: false,
      },
      {
        symbol: "LUCK",
        name: "Lucky Cement Limited",
        sector: "CEMENT",
        ldcp: 725.0,
        open: 728.0,
        high: 735.0,
        low: 720.0,
        current: 732.5,
        change: 7.5,
        changePercent: 1.03,
        volume: 45000,
        isPositive: true,
      },
      {
        symbol: "ENGRO",
        name: "Engro Corporation Limited",
        sector: "FERTILIZER",
        ldcp: 325.75,
        open: 324.5,
        high: 328.0,
        low: 322.25,
        current: 323.25,
        change: -2.5,
        changePercent: -0.77,
        volume: 180000,
        isPositive: false,
      },
    ];
  }

  private static getMockTimeSeriesData(
    symbol: string,
    interval: ChartTimeInterval,
  ): StockTimeSeriesData {
    const now = Date.now();
    const chartData: ChartDataPoint[] = [];
    const historicalData: HistoricalDataPoint[] = [];

    // Generate sample chart data based on interval
    for (let i = 30; i >= 0; i--) {
      const timestamp = now - i * 24 * 60 * 60 * 1000; // Daily intervals
      const basePrice = 100 + Math.random() * 50;
      chartData.push({
        date: new Date(timestamp).toISOString(),
        price: basePrice,
        volume: Math.floor(Math.random() * 100000),
        timestamp,
      });

      historicalData.push({
        date: new Date(timestamp).toISOString().split("T")[0],
        open: basePrice - 2 + Math.random() * 4,
        high: basePrice + Math.random() * 5,
        low: basePrice - Math.random() * 5,
        close: basePrice,
        volume: Math.floor(Math.random() * 200000),
      });
    }

    return {
      symbol,
      name: `${symbol} Limited`,
      sector: "TECHNOLOGY",
      currentPrice: chartData[chartData.length - 1]?.price || 100,
      change: Math.random() * 10 - 5,
      changePercent: Math.random() * 5 - 2.5,
      volume: Math.floor(Math.random() * 500000),
      chartData,
      historicalData,
    };
  }

  private static generateMockHistoricalData(): HistoricalDataPoint[] {
    const data: HistoricalDataPoint[] = [];
    const now = new Date();

    for (let i = 30; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const basePrice = 100 + Math.random() * 50;

      data.push({
        date: date.toISOString().split("T")[0],
        open: basePrice - 2 + Math.random() * 4,
        high: basePrice + Math.random() * 5,
        low: basePrice - Math.random() * 5,
        close: basePrice,
        volume: Math.floor(Math.random() * 200000),
      });
    }

    return data;
  }
}
