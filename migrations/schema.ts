import { pgTable, serial, integer, timestamp, unique, text, jsonb, real, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const marketSummaries = pgTable("market_summaries", {
	id: serial().primaryKey().notNull(),
	totalStocks: integer("total_stocks").notNull(),
	gainers: integer().notNull(),
	losers: integer().notNull(),
	unchanged: integer().notNull(),
	totalVolume: integer("total_volume").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const sectors = pgTable("sectors", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	code: text().notNull(),
	volume: integer().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("sectors_code_unique").on(table.code),
]);

export const stockTimeSeries = pgTable("stock_time_series", {
	id: serial().primaryKey().notNull(),
	symbol: text().notNull(),
	interval: text().notNull(),
	data: jsonb().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const stocks = pgTable("stocks", {
	id: serial().primaryKey().notNull(),
	symbol: text().notNull(),
	name: text().notNull(),
	sector: text().notNull(),
	ldcp: real().notNull(),
	open: real().notNull(),
	high: real().notNull(),
	low: real().notNull(),
	current: real().notNull(),
	change: real().notNull(),
	changePercent: real("change_percent").notNull(),
	volume: integer().notNull(),
	isPositive: boolean("is_positive").notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("stocks_symbol_unique").on(table.symbol),
]);

export const companies = pgTable("companies", {
	id: serial().primaryKey().notNull(),
	symbol: text().notNull(),
	name: text().notNull(),
	sector: text(),
	description: text(),
	website: text(),
	phone: text(),
	address: text(),
	ceo: text(),
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
	lastUpdated: timestamp("last_updated", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("companies_symbol_unique").on(table.symbol),
]);
