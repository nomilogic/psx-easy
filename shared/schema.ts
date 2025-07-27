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
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Zod Schemas
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
  // Additional fields that can be extracted
  registrar?: string;
  auditor?: string;
  fiscalYearEnd?: string;
  keyPeople?: Array<{name: string, role: string}>;
  businessDescription?: string;
}
