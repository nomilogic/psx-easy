import fetch from "node-fetch";
import type { StockData, MarketSummary } from "@shared/schema";

interface ArifHabibStockData {
  date: string;
  symbol: string;
  name: string;
  sector: string;
  type: number;
  status: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ldcp: number;
  change: number;
  ldcv: number;
  change_percent: number;
  bid_price: number;
  bid_volume: number;
  ask_price: number;
  ask_volume: number;
  high52: number;
  low52: number;
  ucap: number;
  lcap: number;
  shares: number;
  free_float: number;
  market_cap: number;
  listed_in: string[];
  haircut: number;
  pivot_points: {
    pp: number;
    r1: number;
    r2: number;
    r3: number;
    s1: number;
    s2: number;
    s3: number;
  };
  beta: number;
  etf: any;
  xb: boolean;
  xd: boolean;
  xr: boolean;
  sd: boolean;
  returns: {
    "1m": number;
    "1w": number;
    "1y": number;
    "3m": number;
    "6m": number;
  };
  sector_code: string;
}

interface ArifHabibResponse {
  status: string;
  message: string;
  data: ArifHabibStockData[];
}

export class ArifHabibService {
  private static readonly API_URL =
    "https://www.arifhabibltd.com/api/market/stocks";

  static async fetchMarketData(): Promise<StockData[] | undefined> {
    try {
      console.log("Fetching market data from Arif Habib API...");

      const response = await fetch(this.API_URL, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Accept: "application/json",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const jsonData: ArifHabibResponse = await response.json();

      if (
        jsonData.status !== "ok" ||
        !jsonData.data ||
        !Array.isArray(jsonData.data)
      ) {
        throw new Error("Invalid response format from Arif Habib API");
      }

      console.log(
        `Successfully fetched ${jsonData.data.length} stocks from Arif Habib API`,
      );

      // Convert Arif Habib format to our StockData format
      const stockData: StockData[] = jsonData.data.map((stock) => ({
        symbol: stock.symbol,
        name: stock.name,
        sector: this.mapSectorCode(stock.sector),
        ldcp: stock.ldcp,
        open: stock.open,
        high: stock.high,
        low: stock.low,
        current: stock.close,
        change: stock.change,
        changePercent: stock.change_percent * 100, // Convert to percentage
        volume: stock.volume,
        isPositive: stock.change >= 0,
        // Additional fields from Arif Habib API
        bidPrice: stock.bid_price,
        bidVolume: stock.bid_volume,
        askPrice: stock.ask_price,
        askVolume: stock.ask_volume,
        high52Week: stock.high52,
        low52Week: stock.low52,
        marketCap: stock.market_cap,
        shares: stock.shares,
        freeFloat: stock.free_float,
        upperCap: stock.ucap,
        lowerCap: stock.lcap,
        haircut: stock.haircut,
        beta: stock.beta,
        listedIn: this.parseListedIn(stock.listed_in),
        sectorCode: stock.sector_code,
        pivotPoints: stock.pivot_points,
        returns: stock.returns,
        lastTradeDate: stock.date,
        type: stock.type,
        status: stock.status,
        lastDayCloseVolume: stock.ldcv,
        etf: stock.etf,
        xb: stock.xb,
        xd: stock.xd,
        xr: stock.xr,
        sd: stock.sd,
        lastUpdated: stock.date,
      }));

      return stockData;
    } catch (error) {
      console.error("Error fetching from Arif Habib API:", error);
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

  private static mapSectorCode(sectorCode: string): string {
    const sectorMap: { [key: string]: string } = {
      "0801": "AUTOMOBILE ASSEMBLER",
      "0802": "AUTOMOBILE PARTS & ACCESSORIES",
      "0803": "CABLE & ELECTRICAL GOODS",
      "0804": "CEMENT",
      "0805": "CHEMICAL",
      "0806": "CLOSE - END MUTUAL FUND",
      "0807": "COMMERCIAL BANKS",
      "0808": "ENGINEERING",
      "0809": "FERTILIZER",
      "0810": "FOOD & PERSONAL CARE PRODUCTS",
      "0811": "GLASS & CERAMICS",
      "0812": "INSURANCE",
      "0813": "INV. BANKS / INV. COS. / SECURITIES COS.",
      "0814": "JUTE",
      "0815": "LEASING COMPANIES",
      "0816": "LEATHER & TANNERIES",
      "0818": "MISCELLANEOUS",
      "0819": "MODARABAS",
      "0820": "OIL & GAS EXPLORATION COMPANIES",
      "0821": "OIL & GAS MARKETING COMPANIES",
      "0822": "PAPER & BOARD",
      "0823": "PHARMACEUTICALS",
      "0824": "POWER GENERATION & DISTRIBUTION",
      "0825": "REFINERY",
      "0826": "SUGAR & ALLIED INDUSTRIES",
      "0827": "SYNTHETIC & RAYON",
      "0828": "TECHNOLOGY & COMMUNICATION",
      "0829": "TEXTILE COMPOSITE",
      "0830": "TEXTILE SPINNING",
      "0831": "TEXTILE WEAVING",
      "0832": "TOBACCO",
      "0833": "TRANSPORT",
      "0834": "VANASPATI & ALLIED INDUSTRIES",
      "0835": "WOOLLEN",
      "0836": "REAL ESTATE INVESTMENT TRUST",
      "0837": "EXCHANGE TRADED FUNDS",
      "0838": "PROPERTY",
      "0036": "BILL AND BONDS",
      "0040": "FUTURE CONTRACTS",
      "0041": "STOCK INDEX FUTURE CONTRACTS",
    };

    return sectorMap[sectorCode] || sectorCode;
  }

  private static parseListedIn(listedIn: string[]): string[] {
    return listedIn || [];
  }
}
