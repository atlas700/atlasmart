ALTER TABLE "product_item" DROP CONSTRAINT "product_item_colorIds_color_id_fk";
--> statement-breakpoint
ALTER TABLE "product_item" ALTER COLUMN "colorIds" SET DATA TYPE uuid[];--> statement-breakpoint
ALTER TABLE "product_item" ALTER COLUMN "colorIds" DROP NOT NULL;