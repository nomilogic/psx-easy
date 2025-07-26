import fetch from "node-fetch";
import * as cheerio from "cheerio";
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
  "https://corsproxy.io/?",
  "https://cors-anywhere.herokuapp.com/",
  "https://api.allorigins.win/raw?url=",
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
    isJson: boolean = true
  ): Promise<T> {
    if (!url) {
      throw new Error("URL is null or undefined");
    }

    for (const proxy of CORS_PROXIES) {
      try {
        const response = await fetch(`${proxy}${encodeURIComponent(url)}`, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            Accept:
              "application/json,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          },
          timeout: 10000,
        });

        if (!response) {
          throw new Error("No response from server");
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = isJson ? await response.json() : await response.text();

        if (!data) {
          throw new Error("No data in response");
        }

        return data;
      } catch (error) {
        console.warn(`Attempt with proxy ${proxy} failed:`, error);
        continue;
      }
    }
    throw new Error("All proxy attempts failed");
  }

  private static symbolsCache: { [symbolId: string]: Symbol } | null = null;
  private static symbolsCacheTimestamp: number | null = null;

  private static async fetchSymbols(): Promise<void> {
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
        false
      );
      const symbols = JSON.parse(response) as Symbol[];
      this.symbolsCache = symbols.reduce(
        (acc: { [symbolId: string]: Symbol }, symbol) => {
          acc[symbol.symbol] = symbol;
          return acc;
        },
        {}
      );
      this.symbolsCacheTimestamp = now;
    } catch (error) {
      console.error("Error fetching symbols:", error);
    }
  }
  
  static async fetchMarketData(): Promise<StockData[] | undefined> {
    console.log("Attempting to fetch market data from PSX...");
    
    // Due to CORS restrictions in the current environment, use mock data
    // In production, you would provide proper API keys and use real PSX endpoints
    try {
      await this.fetchSymbols(); // Call fetchSymbols first
      const html = await this.fetchWithRetry<string>(this.API_URL, false);
      const stockData = this.parseHTMLData(html);
      
      if (stockData && stockData.length > 0) {
        stockData.forEach((stock) => {
          const symbol =
            this.symbolsCache !== null && this.symbolsCache[stock.symbol]
              ? this.symbolsCache[stock.symbol]
              : {
                  symbol: stock.symbol,
                  name: "",
                  sectorName: "",
                  isETF: false,
                  isDebt: false,
                };
          if (symbol && symbol.name && symbol.name !== "") {
            stock.name = symbol.name;
          } else {
            stock.name = `${stock.symbol} Limited`;
          }
          stock.sector = (symbol && symbol.sectorName) || stock.sector;
        });
        return stockData;
      }
    } catch (error) {
      console.log("External PSX service unavailable, using demonstration data");
    }
    
    // Return mock data for demonstration purposes
    return this.getMockData();
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
    interval: ChartTimeInterval = "1day"
  ): Promise<StockTimeSeriesData> {
    try {
      const isEod = ["1day", "1week", "1month", "1year"].includes(interval);
      const url = isEod ? this.EOD_URL : this.TIMESERIES_URL;

      const jsonData = await this.fetchWithRetry<any>(`${url}/${symbol}`);
      let chartData = this.parseJSONChartData(
        jsonData,
        symbol,
        isEod ? "1day" : "1min"
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
        this.TOP_SECTORS_URL
      );
      return sectors;
    } catch (error) {
      console.log("External sectors service unavailable, using demonstration data");
      return [
        { name: "BANKS", code: "BANK", volume: Math.floor(Math.random() * 10000000) },
        { name: "CEMENT", code: "CEMENT", volume: Math.floor(Math.random() * 8000000) },
        { name: "OIL & GAS", code: "OILGAS", volume: Math.floor(Math.random() * 12000000) },
        { name: "TEXTILE", code: "TEXTILE", volume: Math.floor(Math.random() * 6000000) },
        { name: "CHEMICAL", code: "CHEMICAL", volume: Math.floor(Math.random() * 4000000) },
        { name: "PHARMA", code: "PHARMA", volume: Math.floor(Math.random() * 3000000) },
        { name: "TELECOM", code: "TELECOM", volume: Math.floor(Math.random() * 5000000) },
      ];
    }
  }

  static async fetchPerformers(): Promise<PerformersData> {
    try {
      const html = await this.fetchWithRetry<string>(
        this.PERFORMERS_URL,
        false
      );

      return this.parsePerformersHTML(html);
    } catch (error) {
      console.log("External performers service unavailable, using demonstration data");
      return this.getMockPerformersData();
    }
  }

  static async fetchHistoricalData(
    symbol: string,
    month: number,
    year: number
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
    if (!html || html.trim() === '') {
      return [];
    }

    try {
      const $ = cheerio.load(html);
      const stocks: StockData[] = [];

      $("tr").each((_: any, row: any) => {
        const cells = $(row).find("td");
        if (cells.length > 6) {
          const symbol = $(cells[0]).find("strong").text().trim();
          const name = $(cells[0]).find("a").attr("title") || "";
          const sector = $(cells[1]).text().trim();
          const ldcp = parseFloat($(cells[2]).attr("data-order") || "0");
          const open = parseFloat($(cells[3]).attr("data-order") || "0");
          const high = parseFloat($(cells[4]).attr("data-order") || "0");
          const low = parseFloat($(cells[5]).attr("data-order") || "0");
          const current = parseFloat($(cells[6]).attr("data-order") || "0");
          const change = parseFloat($(cells[7]).attr("data-order") || "0");
          const changePercent = parseFloat($(cells[8]).attr("data-order") || "0");
          const volume = parseInt($(cells[9]).attr("data-order") || "0", 10);
          const isPositive = change >= 0;

          if (symbol) {
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

      return stocks;
    } catch (error) {
      console.error("Error parsing HTML data:", error);
      return [];
    }
  }

  private static parseJSONChartData(
    data: any,
    symbol: string,
    interval: string
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
    interval: ChartTimeInterval
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
          /([-+]?[0-9,.]+)\s*\(([-+]?[0-9,.]+)%\)/
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

    return data;
  }

  private static getMockTimeSeriesData(
    symbol: string,
    interval: ChartTimeInterval
  ): StockTimeSeriesData {
    return {
      symbol,
      name: `${symbol} name Limited`,
      sector: "ALLSHR",
      currentPrice: 100 + Math.random() * 50,
      change: (Math.random() - 0.5) * 10,
      changePercent: (Math.random() - 0.5) * 5,
      volume: Math.floor(Math.random() * 1000000),
      marketCap: Math.random() * 1000000000,
      peRatio: 5 + Math.random() * 20,
      dividendYield: Math.random() * 10,
      high52Week: 150 + Math.random() * 100,
      low52Week: 50 + Math.random() * 50,
      chartData: this.generateMockChartData(interval),
      historicalData: this.generateMockHistoricalData(),
    };
  }

  private static generateMockChartData(
    interval: ChartTimeInterval
  ): ChartDataPoint[] {
    const now = Date.now();
    const data: ChartDataPoint[] = [];
    let intervalMs = 60000; // 1 minute in ms

    switch (interval) {
      case "5min":
        intervalMs = 5 * 60000;
        break;
      case "15min":
        intervalMs = 15 * 60000;
        break;
      case "30min":
        intervalMs = 30 * 60000;
        break;
      case "1hour":
        intervalMs = 60 * 60000;
        break;
      case "1day":
        intervalMs = 24 * 60 * 60000;
        break;
      case "1week":
        intervalMs = 7 * 24 * 60 * 60000;
        break;
      case "1month":
        intervalMs = 30 * 24 * 60 * 60000;
        break;
      case "1year":
        intervalMs = 365 * 24 * 60 * 60000;
        break;
    }

    let price = 100 + Math.random() * 50;

    for (let i = 0; i < 100; i++) {
      const timestamp = now - i * intervalMs;
      const change = (Math.random() - 0.5) * 2;
      price = Math.max(1, price + change);

      data.unshift({
        date: new Date(timestamp).toISOString(),
        price: parseFloat(price.toFixed(2)),
        volume: Math.floor(Math.random() * 10000),
        timestamp,
      });
    }

    return data;
  }

  private static generateMockHistoricalData(): HistoricalDataPoint[] {
    const data: HistoricalDataPoint[] = [];
    const now = new Date();
    let price = 100 + Math.random() * 50;

    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);

      const open = price;
      const change = (Math.random() - 0.5) * 5;
      const close = Math.max(1, open + change);
      const high = Math.max(open, close) + Math.random() * 2;
      const low = Math.min(open, close) - Math.random() * 2;

      data.push({
        date: date.toISOString().split("T")[0],
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume: Math.floor(Math.random() * 1000000),
      });

      price = close;
    }

    return data;
  }

  private static getMockData(): StockData[] {
    const sectors = ["BANKS", "CEMENT", "OIL & GAS", "TEXTILE", "CHEMICAL", "PHARMA", "TELECOM"];
    const symbols = [
      "HBL", "UBL", "MCB", "NBP", "BAFL", "ABL", "BAHL", "BOP",
      "LUCK", "MLCF", "DGKC", "CHCC", "FCCL", "ACPL", "THCCL",
      "PSO", "HASCOL", "APL", "OGDC", "PPL", "MARI", "MPCL",
      "APTM", "GATM", "KTML", "MTL", "SITC", "UNITY", "GUL",
      "SEARL", "FFC", "EFERT", "FATIMA", "ENGRO", "LUCK",
      "GSK", "ABBOTT", "PHARM", "HIL", "PTC", "NCPL"
    ];

    return symbols.map((symbol, index) => {
      const sector = sectors[Math.floor(Math.random() * sectors.length)];
      const basePrice = 50 + Math.random() * 200;
      const change = (Math.random() - 0.5) * 10;
      const current = basePrice + change;
      const changePercent = (change / basePrice) * 100;

      return {
        symbol,
        name: `${symbol} Limited`,
        sector,
        ldcp: basePrice,
        open: basePrice + (Math.random() - 0.5) * 5,
        high: current + Math.random() * 5,
        low: current - Math.random() * 5,
        current: parseFloat(current.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2)),
        volume: Math.floor(Math.random() * 10000000),
        isPositive: change >= 0,
      };
    });
  }

  private static getMockPerformersData(): PerformersData {
    const mockStocks = this.getMockData();
    const active = mockStocks.slice(0, 10).sort((a, b) => b.volume - a.volume);
    const advancers = mockStocks.filter(s => s.isPositive).slice(0, 10).sort((a, b) => b.changePercent - a.changePercent);
    const decliners = mockStocks.filter(s => !s.isPositive).slice(0, 10).sort((a, b) => a.changePercent - b.changePercent);

    return {
      active: active.map(stock => ({
        symbol: stock.symbol,
        name: stock.name,
        price: stock.current,
        change: stock.change,
        changePercent: stock.changePercent,
        volume: stock.volume,
        isPositive: stock.isPositive
      })),
      advancers: advancers.map(stock => ({
        symbol: stock.symbol,
        name: stock.name,
        price: stock.current,
        change: stock.change,
        changePercent: stock.changePercent,
        volume: stock.volume,
        isPositive: stock.isPositive
      })),
      decliners: decliners.map(stock => ({
        symbol: stock.symbol,
        name: stock.name,
        price: stock.current,
        change: stock.change,
        changePercent: stock.changePercent,
        volume: stock.volume,
        isPositive: stock.isPositive
      }))
    };
  }
}
