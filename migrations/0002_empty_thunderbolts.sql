ALTER TABLE "companies" ALTER COLUMN "shares_outstanding" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "companies" ALTER COLUMN "working_capital" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "companies" ALTER COLUMN "enterprise_value" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "market_summaries" ALTER COLUMN "total_volume" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "sectors" ALTER COLUMN "volume" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "stocks" ALTER COLUMN "volume" SET DATA TYPE bigint;