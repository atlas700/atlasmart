ALTER TABLE "available_item" RENAME COLUMN "numInStock" TO "numInStocks";--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "emailVerified" timestamp with time zone;