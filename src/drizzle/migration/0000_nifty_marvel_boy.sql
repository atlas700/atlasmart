CREATE TYPE "public"."order_status" AS ENUM('PROCESSING', 'CONFIRMED', 'FAILED', 'READYFORSHIPPING', 'SHIPPED', 'OUTFORDELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNREQUESTED', 'RETURNING', 'RETURNED', 'REFUNDED');--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('PENDING', 'REVIEWING', 'APPROVED', 'DECLINED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."request_statuses" AS ENUM('REVIEWING', 'APPROVED', 'DECLINED');--> statement-breakpoint
CREATE TYPE "public"."store_status" AS ENUM('PENDING', 'REVIEWING', 'APPROVED', 'DECLINED', 'CLOSED');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('USER', 'ADMIN', 'SELLER');--> statement-breakpoint
CREATE TABLE "available_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"numInStocks" integer NOT NULL,
	"currentPrice" numeric NOT NULL,
	"originalPrice" numeric NOT NULL,
	"sizeId" uuid NOT NULL,
	"productId" uuid NOT NULL,
	"productItemId" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "banner" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"image" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"storeId" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cart" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cart_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"cartId" uuid NOT NULL,
	"productId" uuid NOT NULL,
	"productItemId" uuid NOT NULL,
	"availableItemId" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cart_item_unique" UNIQUE("availableItemId","productItemId","productId","cartId")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"storeId" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "color" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"value" text NOT NULL,
	"storeId" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"trackingId" text,
	"address" text,
	"paymentIntentId" text,
	"status" "order_status" DEFAULT 'PROCESSING' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "order_trackingId_unique" UNIQUE("trackingId"),
	CONSTRAINT "order_paymentIntentId_unique" UNIQUE("paymentIntentId")
);
--> statement-breakpoint
CREATE TABLE "order_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quantity" integer NOT NULL,
	"readyToBeShipped" boolean DEFAULT false NOT NULL,
	"orderId" uuid NOT NULL,
	"storeId" uuid NOT NULL,
	"productId" uuid NOT NULL,
	"productItemId" uuid NOT NULL,
	"availableItemId" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"status" "product_status" DEFAULT 'PENDING' NOT NULL,
	"statusFeedback" text DEFAULT 'Your product has been submitted for approval',
	"userId" uuid NOT NULL,
	"storeId" uuid NOT NULL,
	"categoryId" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"images" text[] NOT NULL,
	"discount" numeric DEFAULT 0 NOT NULL,
	"productId" uuid NOT NULL,
	"colorIds" uuid[],
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "return_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"orderItemId" uuid NOT NULL,
	"returnRequestId" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "return_request" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reason" text NOT NULL,
	"status" "request_statuses" DEFAULT 'REVIEWING' NOT NULL,
	"orderId" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"value" integer NOT NULL,
	"reason" text NOT NULL,
	"comment" text NOT NULL,
	"helpful" text[] DEFAULT '{}' NOT NULL,
	"productId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"storeId" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sizes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"value" text NOT NULL,
	"storeId" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"email" text NOT NULL,
	"emailVerified" timestamp with time zone,
	"country" text NOT NULL,
	"postCode" text NOT NULL,
	"logo" text,
	"status" "store_status" DEFAULT 'APPROVED' NOT NULL,
	"statusFeedback" text DEFAULT 'Your store has been approved. You can now create and manage products.',
	"userId" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "store_email_unique" UNIQUE("email","userId")
);
--> statement-breakpoint
CREATE TABLE "store_verification_token" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "store_verification_token_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerkUserId" text NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"role" "user_role" DEFAULT 'USER' NOT NULL,
	"imageUrl" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerkUserId_unique" UNIQUE("clerkUserId")
);
--> statement-breakpoint
ALTER TABLE "available_item" ADD CONSTRAINT "available_item_sizeId_sizes_id_fk" FOREIGN KEY ("sizeId") REFERENCES "public"."sizes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "available_item" ADD CONSTRAINT "available_item_productId_product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "available_item" ADD CONSTRAINT "available_item_productItemId_product_item_id_fk" FOREIGN KEY ("productItemId") REFERENCES "public"."product_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "banner" ADD CONSTRAINT "banner_storeId_stores_id_fk" FOREIGN KEY ("storeId") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart" ADD CONSTRAINT "cart_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_cartId_cart_id_fk" FOREIGN KEY ("cartId") REFERENCES "public"."cart"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_productId_product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_productItemId_product_item_id_fk" FOREIGN KEY ("productItemId") REFERENCES "public"."product_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_availableItemId_available_item_id_fk" FOREIGN KEY ("availableItemId") REFERENCES "public"."available_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_storeId_stores_id_fk" FOREIGN KEY ("storeId") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "color" ADD CONSTRAINT "color_storeId_stores_id_fk" FOREIGN KEY ("storeId") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_orderId_order_id_fk" FOREIGN KEY ("orderId") REFERENCES "public"."order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_storeId_stores_id_fk" FOREIGN KEY ("storeId") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_productId_product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_productItemId_product_item_id_fk" FOREIGN KEY ("productItemId") REFERENCES "public"."product_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_availableItemId_available_item_id_fk" FOREIGN KEY ("availableItemId") REFERENCES "public"."available_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_storeId_stores_id_fk" FOREIGN KEY ("storeId") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_categoryId_categories_id_fk" FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_item" ADD CONSTRAINT "product_item_productId_product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "return_item" ADD CONSTRAINT "return_item_orderItemId_order_item_id_fk" FOREIGN KEY ("orderItemId") REFERENCES "public"."order_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "return_item" ADD CONSTRAINT "return_item_returnRequestId_return_request_id_fk" FOREIGN KEY ("returnRequestId") REFERENCES "public"."return_request"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "return_request" ADD CONSTRAINT "return_request_orderId_order_id_fk" FOREIGN KEY ("orderId") REFERENCES "public"."order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_productId_product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_storeId_stores_id_fk" FOREIGN KEY ("storeId") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sizes" ADD CONSTRAINT "sizes_storeId_stores_id_fk" FOREIGN KEY ("storeId") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stores" ADD CONSTRAINT "stores_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "size_id_idx" ON "available_item" USING btree ("sizeId");--> statement-breakpoint
CREATE INDEX "product_id_idx" ON "available_item" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "product_item_id_idx" ON "available_item" USING btree ("productItemId");--> statement-breakpoint
CREATE INDEX "store_id_idx" ON "banner" USING btree ("storeId");--> statement-breakpoint
CREATE INDEX "cart_user_id_index" ON "cart" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "category_name_idx" ON "categories" USING btree ("name");--> statement-breakpoint
CREATE INDEX "category_store_id_idx" ON "categories" USING btree ("storeId");--> statement-breakpoint
CREATE INDEX "color_name_idx" ON "color" USING btree ("name");--> statement-breakpoint
CREATE INDEX "color_store_id_idx" ON "color" USING btree ("storeId");--> statement-breakpoint
CREATE INDEX "order_user_id_index" ON "order" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "order_tracking_id_index" ON "order" USING btree ("trackingId");--> statement-breakpoint
CREATE INDEX "order_item_order_id_index" ON "order_item" USING btree ("orderId");--> statement-breakpoint
CREATE INDEX "order_item_store_id_index" ON "order_item" USING btree ("storeId");--> statement-breakpoint
CREATE INDEX "order_item_product_id_index" ON "order_item" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "order_item_product_item_id_index" ON "order_item" USING btree ("productItemId");--> statement-breakpoint
CREATE INDEX "order_item_available_item_id_index" ON "order_item" USING btree ("availableItemId");--> statement-breakpoint
CREATE INDEX "product_user_id_idx" ON "product" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "product_store_id_idx" ON "product" USING btree ("storeId");--> statement-breakpoint
CREATE INDEX "product_category_id_idx" ON "product" USING btree ("categoryId");--> statement-breakpoint
CREATE INDEX "product_name_idx" ON "product" USING btree ("name");--> statement-breakpoint
CREATE INDEX "product_status_idx" ON "product" USING btree ("status");--> statement-breakpoint
CREATE INDEX "return_item_order_item_id_idx" ON "return_item" USING btree ("orderItemId");--> statement-breakpoint
CREATE INDEX "return_item_return_request_id_idx" ON "return_item" USING btree ("returnRequestId");--> statement-breakpoint
CREATE INDEX "return_request_order_id_idx" ON "return_request" USING btree ("orderId");--> statement-breakpoint
CREATE INDEX "review_product_id_index" ON "review" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "review_user_id_index" ON "review" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "review_store_id_index" ON "review" USING btree ("storeId");--> statement-breakpoint
CREATE INDEX "size_store_id_index" ON "sizes" USING btree ("storeId");--> statement-breakpoint
CREATE INDEX "size_name_index" ON "sizes" USING btree ("name");--> statement-breakpoint
CREATE INDEX "store_user_id_idx" ON "stores" USING btree ("userId");