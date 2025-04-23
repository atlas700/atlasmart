ALTER TABLE "product_item" RENAME COLUMN "colorId" TO "colorIds";--> statement-breakpoint
ALTER TABLE "product_item" DROP CONSTRAINT "product_item_colorId_color_id_fk";
--> statement-breakpoint
ALTER TABLE "product_item" ADD CONSTRAINT "product_item_colorIds_color_id_fk" FOREIGN KEY ("colorIds") REFERENCES "public"."color"("id") ON DELETE cascade ON UPDATE no action;