import { z } from "zod";
import {
  pgTable,
  serial,
  text,
  real,
  integer,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

// Database Tables
export const stocks = pgTable("stocks", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull().unique(),
  name: text("name").notNull(),
  sector: text("sector").notNull(),
  ldcp: real("ldcp").notNull(),
  open: real("open").notNull(),
  high: real("high").notNull(),
  low: real("low").notNull(),
  current: real("current").notNull(),
  change: real("change").notNull(),
  changePercent: real("change_percent").notNull(),
  volume: integer("volume").notNull(),
  isPositive: boolean("is_positive").notNull(),
  // Additional fields from Arif Habib API
  bidPrice: real("bid_price"),
  bidVolume: integer("bid_volume"),
  askPrice: real("ask_price"),
  askVolume: integer("ask_volume"),
  high52Week: real("high_52_week"),
  low52Week: real("low_52_week"),
  marketCap: real("market_cap"),
  shares: real("shares"),
  freeFloat: real("free_float"),
  upperCap: real("upper_cap"),
  lowerCap: real("lower_cap"),
  haircut: real("haircut"),
  beta: real("beta"),
  listedIn: jsonb("listed_in"),
  pivotPoints: jsonb("pivot_points"),
  returns: jsonb("returns"),
  lastTradeDate: text("last_trade_date"),
  type: integer("type"),
  status: integer("status"),
  lastDayCloseVolume: integer("last_day_close_volume"),
  etf: jsonb("etf"),
  xb: boolean("xb"),
  xd: boolean("xd"),
  xr: boolean("xr"),
  sd: boolean("sd"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const marketSummaries = pgTable("market_summaries", {
  id: serial("id").primaryKey(),
  totalStocks: integer("total_stocks").notNull(),
  gainers: integer("gainers").notNull(),
  losers: integer("losers").notNull(),
  unchanged: integer("unchanged").notNull(),
  totalVolume: integer("total_volume").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sectors = pgTable("sectors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  volume: integer("volume").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const stockTimeSeries = pgTable("stock_time_series", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  interval: text("interval").notNull(),
  data: jsonb("data").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull().unique(),
  name: text("name").notNull(),
  sector: text("sector"),
  description: text("description"),
  website: text("website"),
  phone: text("phone"),
  address: text("address"),
  ceo: text("ceo"),
  marketCap: real("market_cap"),
  sharesOutstanding: integer("shares_outstanding"),
  peRatio: real("pe_ratio"),
  pbRatio: real("pb_ratio"),
  dividendYield: real("dividend_yield"),
  epsRatio: real("eps_ratio"),
  bookValue: real("book_value"),
  high52Week: real("high_52_week"),
  low52Week: real("low_52_week"),
  faceValue: real("face_value"),
  lotSize: integer("lot_size"),
  isinCode: text("isin_code"),
  registrar: text("registrar"),
  auditor: text("auditor"),
  fiscalYearEnd: text("fiscal_year_end"),
  keyPeople: jsonb("key_people"),
  businessDescription: text("business_description"),
  payoutRatio: real("payout_ratio"),
  retentionRatio: real("retention_ratio"),
  freeFloat: real("free_float"),
  financialData: jsonb("financial_data"),
  ratiosData: jsonb("ratios_data"),
  equityProfile: jsonb("equity_profile"),
  payoutsData: jsonb("payouts_data"),
  announcements: jsonb("announcements"),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Create Zod schemas for validation
export const insertStockSchema = createInsertSchema(stocks).omit({
  id: true,
  updatedAt: true,
});

export const insertMarketSummarySchema = createInsertSchema(
  marketSummaries,
).omit({
  id: true,
  createdAt: true,
});

export const insertSectorSchema = createInsertSchema(sectors).omit({
  id: true,
  updatedAt: true,
});

export const insertStockTimeSeriesSchema = createInsertSchema(
  stockTimeSeries,
).omit({
  id: true,
  updatedAt: true,
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  lastUpdated: true,
  createdAt: true,
});

// Types
export type Stock = typeof stocks.$inferSelect;
export type InsertStock = z.infer<typeof insertStockSchema>;

export type InsertMarketSummary = z.infer<typeof insertMarketSummarySchema>;
export type Sector = typeof sectors.$inferSelect;
export type InsertSector = z.infer<typeof insertSectorSchema>;

export type InsertStockTimeSeries = z.infer<typeof insertStockTimeSeriesSchema>;

export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;

// Legacy interfaces for compatibility
export interface StockData {
  symbol: string;
  name: string;
  sector: string;
  ldcp: number; // Last day closing price
  open: number;
  high: number;
  low: number;
  current: number; // Current price
  change: number;
  changePercent: number;
  volume: number;
  isPositive: boolean;
  // Additional fields from various APIs
  bidPrice?: number;
  bidVolume?: number;
  askPrice?: number;
  askVolume?: number;
  high52Week?: number;
  low52Week?: number;
  marketCap?: number;
  shares?: number;
  freeFloat?: number;
  beta?: number;
  listedIn?: string[];
  pivotPoints?: {
    pp: number;
    r1: number;
    r2: number;
    r3: number;
    s1: number;
    s2: number;
    s3: number;
  };
  returns?: {
    "1m": number;
    "1w": number;
    "1y": number;
    "3m": number;
    "6m": number;
  };
  lastUpdated?: string;
  lastTradeTime?: string;
  lastTradePrice?: number;
  lastTradeVolume?: number;
  value?: number;
  trades?: number;
}

export interface MarketSummary {
  totalStocks: number;
  gainers: number;
  losers: number;
  unchanged: number;
  totalVolume: number;
}

export interface ChartDataPoint {
  date: string;
  price: number;
  volume: number;
  timestamp: number;
}

export interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockTimeSeriesData {
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

export interface SectorData {
  name: string;
  code: string;
  volume: number;
}

export interface PerformerStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  isPositive: boolean;
}

export interface PerformersData {
  active: PerformerStock[];
  advancers: PerformerStock[];
  decliners: PerformerStock[];
}

export type ChartTimeInterval =
  | "1min"
  | "5min"
  | "15min"
  | "30min"
  | "1hour"
  | "1day"
  | "1week"
  | "1month"
  | "1year";

export interface WebSocketMessage {
  type: "market_update" | "stock_update" | "sector_update";
  timestamp: string;
  data: any;
}

export interface SystemStatus {
  uptime: string;
  avgResponse: string;
  memoryUsage: string;
  apiCallsPerMin: number;
  connectedClients: number;
}

export interface CompanyData {
  symbol: string;
  name: string;
  sector?: string;
  description?: string;
  website?: string;
  phone?: string;
  address?: string;
  ceo?: string;
  marketCap?: number;
  sharesOutstanding?: number;
  peRatio?: number;
  pbRatio?: number;
  dividendYield?: number;
  epsRatio?: number;
  bookValue?: number;
  high52Week?: number;
  low52Week?: number;
  faceValue?: number;
  lotSize?: number;
  isinCode?: string;
  registrar?: string;
  auditor?: string;
  fiscalYearEnd?: string;
  keyPeople?: Array<{ name: string; role: string }>;
  businessDescription?: string;

  // Additional Financial Ratios
  roa?: number; // Return on Assets
  roe?: number; // Return on Equity
  currentRatio?: number;
  quickRatio?: number;
  cashRatio?: number;
  debtToEquity?: number;
  debtRatio?: number;
  equityRatio?: number;
  grossProfitMargin?: number;
  netProfitMargin?: number;
  operatingMargin?: number;
  assetTurnover?: number;
  interestCoverage?: number;
  workingCapital?: number;
  priceToSales?: number;
  priceToCashFlow?: number;
  enterpriseValue?: number;
  evToEbitda?: number;
  beta?: number;
  sales?: number;

  // Free Float Information
  freeFloat?: number;

  // Dividend and Payout Information
  payoutRatio?: number;
  retentionRatio?: number;
  dividendHistory?: Array<{
    year: string;
    dividendPerShare: number;
    payoutRatio?: number;
  }>;

  // Comprehensive Financial Data
  financialData?: {
    annual?: Array<{
      label: string;
      sales?: number;
      profitAfterTax?: number;
      eps?: number;
    }>;
    quarterly?: Array<{
      label: string;
      sales?: number;
      profitAfterTax?: number;
      eps?: number;
    }>;
  };

  // Company Announcements by Category
  announcements?: {
    [category: string]: Array<{
      date: string;
      title: string;
      description?: string;
      url?: string;
      isImportant?: boolean;
      document?: string;
    }>;
  };

  // Payouts (Dividends, Bonus, Rights)
  payouts?: Array<{
    date: string;
    type: string; // "Dividend", "Bonus", "Right"
    amount?: number;
    percentage?: number;
    description: string;
    recordDate?: string;
    paymentDate?: string;
  }>;

  // Comprehensive Ratios Data
  ratiosData?: Array<{
    year: string;
    grossProfitMargin?: number;
    netProfitMargin?: number;
    epsGrowth?: number;
    peg?: number;
  }>;

  // Comprehensive Payouts Data
  payoutsData?: Array<{
    date: string;
    financialResults?: string;
    details?: string;
    bookClosure?: string;
  }>;

  // Comprehensive Equity Profile (Multi-year data)
  equityProfile?: Array<{
    year: string;
    marketCap?: number;
    sharesOutstanding?: number;
    freeFloat?: number;
    freeFloatPercentage?: number;
    bookValue?: number;
    priceToBook?: number;
    dividendPerShare?: number;
    dividendYield?: number;
    earningsPerShare?: number;
    priceEarningsRatio?: number;
    faceValue?: number;
    lotSize?: number;
  }>;
}