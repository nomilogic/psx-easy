CREATE TABLE "companies" (
	"id" serial PRIMARY KEY NOT NULL,
	"symbol" text NOT NULL,
	"name" text NOT NULL,
	"sector" text,
	"description" text,
	"website" text,
	"phone" text,
	"address" text,
	"ceo" text,
	"market_cap" real,
	"shares_outstanding" integer,
	"pe_ratio" real,
	"pb_ratio" real,
	"dividend_yield" real,
	"eps_ratio" real,
	"book_value" real,
	"high_52_week" real,
	"low_52_week" real,
	"face_value" real,
	"lot_size" integer,
	"isin_code" text,
	"registrar" text,
	"auditor" text,
	"fiscal_year_end" text,
	"key_people" jsonb,
	"business_description" text,
	"last_updated" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "companies_symbol_unique" UNIQUE("symbol")
);
--> statement-breakpoint
CREATE TABLE "market_summaries" (
	"id" serial PRIMARY KEY NOT NULL,
	"total_stocks" integer NOT NULL,
	"gainers" integer NOT NULL,
	"losers" integer NOT NULL,
	"unchanged" integer NOT NULL,
	"total_volume" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sectors" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"volume" integer NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sectors_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "stock_time_series" (
	"id" serial PRIMARY KEY NOT NULL,
	"symbol" text NOT NULL,
	"interval" text NOT NULL,
	"data" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"symbol" text NOT NULL,
	"name" text NOT NULL,
	"sector" text NOT NULL,
	"ldcp" real NOT NULL,
	"open" real NOT NULL,
	"high" real NOT NULL,
	"low" real NOT NULL,
	"current" real NOT NULL,
	"change" real NOT NULL,
	"change_percent" real NOT NULL,
	"volume" integer NOT NULL,
	"is_positive" boolean NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "stocks_symbol_unique" UNIQUE("symbol")
);
