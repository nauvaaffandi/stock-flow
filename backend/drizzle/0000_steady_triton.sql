CREATE TYPE "inventory"."stock_adjustment_reason" AS ENUM('OPNAME', 'DAMAGED', 'EXPIRED', 'LOST', 'OTHER');--> statement-breakpoint
CREATE TYPE "inventory"."stock_adjustment_status" AS ENUM('DRAFT', 'CONFIRMED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "inventory"."stock_movement_reference_type" AS ENUM('PURCHASE', 'TRANSACTION', 'ADJUSTMENT', 'OPENING_BALANCE');--> statement-breakpoint
CREATE TYPE "inventory"."stock_movement_type" AS ENUM('PURCHASE', 'SALE', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT', 'RETURN_SUPPLIER', 'RETURN_CUSTOMER', 'OPENING_BALANCE');--> statement-breakpoint
CREATE TYPE "procurement"."purchase_status" AS ENUM('DRAFT', 'CONFIRMED', 'RECEIVED', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "analytics"."sales_daily_summary" (
	"product_id" text NOT NULL,
	"total_quantity_sold" integer NOT NULL,
	"total_revenue" integer NOT NULL,
	"total_cost" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "catalog"."categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "catalog"."product_unit_prices" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"unit_id" text NOT NULL,
	"selling_price" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "catalog"."product_units" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"name" text NOT NULL,
	"conversion_factor" integer NOT NULL,
	"is_base_unit" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "catalog"."products" (
	"id" text PRIMARY KEY NOT NULL,
	"category_name" text,
	"name" text NOT NULL,
	"sku" text NOT NULL,
	"barcode" text NOT NULL,
	"base_unit" text NOT NULL,
	"cost_price" integer NOT NULL,
	"selling_price" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory"."stock_adjustment_items" (
	"id" text PRIMARY KEY NOT NULL,
	"adjustment_id" text NOT NULL,
	"product_id" text NOT NULL,
	"system_quantity" integer NOT NULL,
	"physical_quantity" integer NOT NULL,
	"difference" integer NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "inventory"."stock_adjustments" (
	"id" text PRIMARY KEY NOT NULL,
	"reference_number" text NOT NULL,
	"reason" "inventory"."stock_adjustment_reason" NOT NULL,
	"status" "inventory"."stock_adjustment_status" DEFAULT 'DRAFT' NOT NULL,
	"notes" text,
	"confirmed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory"."stock_movements" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"transaction_id" text,
	"type" "inventory"."stock_movement_type" NOT NULL,
	"quantity" integer NOT NULL,
	"reference_id" text,
	"reference_type" "inventory"."stock_movement_reference_type",
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory"."stock_snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"quantity" integer NOT NULL,
	"calculated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "procurement"."purchase_items" (
	"id" text PRIMARY KEY NOT NULL,
	"purchase_id" text NOT NULL,
	"product_id" text NOT NULL,
	"unit_name" text NOT NULL,
	"conversion_factor" integer NOT NULL,
	"quantity" integer NOT NULL,
	"quantity_in_base" integer NOT NULL,
	"unit_cost" integer NOT NULL,
	"subtotal" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "procurement"."purchases" (
	"id" text PRIMARY KEY NOT NULL,
	"supplier_code" text NOT NULL,
	"reference_number" text NOT NULL,
	"status" "procurement"."purchase_status" DEFAULT 'DRAFT' NOT NULL,
	"total_cost" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"received_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "procurement"."suppliers" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"phone" text,
	"address" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "suppliers_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "sales"."payment_methods" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales"."transaction_items" (
	"id" text PRIMARY KEY NOT NULL,
	"transaction_id" text NOT NULL,
	"product_id" text NOT NULL,
	"unit_name" text NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" integer NOT NULL,
	"unit_cost" integer NOT NULL,
	"sub_total" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales"."transaction_payments" (
	"id" text PRIMARY KEY NOT NULL,
	"transaction_id" text NOT NULL,
	"payment_method_id" text NOT NULL,
	"amount" integer NOT NULL,
	"referenceNumber" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales"."transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"transaction_number" text NOT NULL,
	"type" text NOT NULL,
	"total_amount" integer NOT NULL,
	"total_items" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system"."audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" text NOT NULL,
	"old_value" jsonb,
	"new_value" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "outbox"."outbox" (
	"id" serial PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"payload" jsonb NOT NULL,
	"status" text DEFAULT 'PENDING',
	"retry_count" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sent_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "catalog"."product_unit_prices" ADD CONSTRAINT "product_unit_prices_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "catalog"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."product_unit_prices" ADD CONSTRAINT "product_unit_prices_unit_id_product_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "catalog"."product_units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."product_units" ADD CONSTRAINT "product_units_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "catalog"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."products" ADD CONSTRAINT "products_category_name_categories_name_fk" FOREIGN KEY ("category_name") REFERENCES "catalog"."categories"("name") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory"."stock_adjustment_items" ADD CONSTRAINT "stock_adjustment_items_adjustment_id_stock_adjustments_id_fk" FOREIGN KEY ("adjustment_id") REFERENCES "inventory"."stock_adjustments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procurement"."purchase_items" ADD CONSTRAINT "purchase_items_purchase_id_purchases_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "procurement"."purchases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procurement"."purchases" ADD CONSTRAINT "purchases_supplier_code_suppliers_code_fk" FOREIGN KEY ("supplier_code") REFERENCES "procurement"."suppliers"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales"."transaction_items" ADD CONSTRAINT "transaction_items_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "sales"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales"."transaction_payments" ADD CONSTRAINT "transaction_payments_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "sales"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales"."transaction_payments" ADD CONSTRAINT "transaction_payments_payment_method_id_payment_methods_id_fk" FOREIGN KEY ("payment_method_id") REFERENCES "sales"."payment_methods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "analytics_total_revenue_idx" ON "analytics"."sales_daily_summary" USING btree ("total_revenue");--> statement-breakpoint
CREATE INDEX "analytics_total_qty_sold_idx" ON "analytics"."sales_daily_summary" USING btree ("total_quantity_sold");--> statement-breakpoint
CREATE INDEX "analytics_date_idx" ON "analytics"."sales_daily_summary" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "analytics_total_revenue_date_idx" ON "analytics"."sales_daily_summary" USING btree ("total_revenue","created_at");--> statement-breakpoint
CREATE INDEX "analytics_total_qty_sold_date_idx" ON "analytics"."sales_daily_summary" USING btree ("total_quantity_sold","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "product_unit_prices_unique_idx" ON "catalog"."product_unit_prices" USING btree ("product_id","unit_id");--> statement-breakpoint
CREATE INDEX "product_unit_prices_product_idx" ON "catalog"."product_unit_prices" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_unit_prices_unit_idx" ON "catalog"."product_unit_prices" USING btree ("unit_id");--> statement-breakpoint
CREATE INDEX "product_unit_prices_is_active_idx" ON "catalog"."product_unit_prices" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "product_units_product_idx" ON "catalog"."product_units" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_units_is_base_unit_idx" ON "catalog"."product_units" USING btree ("is_base_unit");--> statement-breakpoint
CREATE INDEX "product_units_name_idx" ON "catalog"."product_units" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "product_units_unique_product_idx" ON "catalog"."product_units" USING btree ("product_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "products_sku_unique" ON "catalog"."products" USING btree ("sku");--> statement-breakpoint
CREATE UNIQUE INDEX "products_barcode_idx" ON "catalog"."products" USING btree ("barcode");--> statement-breakpoint
CREATE UNIQUE INDEX "products_id_idx" ON "catalog"."products" USING btree ("id");--> statement-breakpoint
CREATE UNIQUE INDEX "products_name_idx" ON "catalog"."products" USING btree ("name");--> statement-breakpoint
CREATE INDEX "products_category_idx" ON "catalog"."products" USING btree ("category_name");--> statement-breakpoint
CREATE INDEX "products_base_unit_idx" ON "catalog"."products" USING btree ("base_unit");--> statement-breakpoint
CREATE INDEX "products_cost_price_idx" ON "catalog"."products" USING btree ("cost_price");--> statement-breakpoint
CREATE INDEX "products_selling_price_idx" ON "catalog"."products" USING btree ("selling_price");--> statement-breakpoint
CREATE INDEX "products_is_active_idx" ON "catalog"."products" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "products_created_at_idx" ON "catalog"."products" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "products_create_idx" ON "catalog"."products" USING btree ("id","name","barcode");--> statement-breakpoint
CREATE INDEX "stock_adjustment_items_adjustment_idx" ON "inventory"."stock_adjustment_items" USING btree ("adjustment_id");--> statement-breakpoint
CREATE INDEX "stock_adjustment_items_product_idx" ON "inventory"."stock_adjustment_items" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "stock_adjustments_reference_unique" ON "inventory"."stock_adjustments" USING btree ("reference_number");--> statement-breakpoint
CREATE INDEX "stock_adjustments_status_idx" ON "inventory"."stock_adjustments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "stock_adjustments_reason_idx" ON "inventory"."stock_adjustments" USING btree ("reason");--> statement-breakpoint
CREATE INDEX "stock_adjustments_created_idx" ON "inventory"."stock_adjustments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "stock_movements_product_idx" ON "inventory"."stock_movements" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "stock_movements_type_idx" ON "inventory"."stock_movements" USING btree ("type");--> statement-breakpoint
CREATE INDEX "stock_movements_created_idx" ON "inventory"."stock_movements" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "stock_movements_reference_idx" ON "inventory"."stock_movements" USING btree ("reference_type","reference_id");--> statement-breakpoint
CREATE INDEX "stock_snapshots_product_idx" ON "inventory"."stock_snapshots" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "stock_snapshots_calculated_idx" ON "inventory"."stock_snapshots" USING btree ("calculated_at");--> statement-breakpoint
CREATE INDEX "purchase_items_purchase_idx" ON "procurement"."purchase_items" USING btree ("purchase_id");--> statement-breakpoint
CREATE INDEX "purchase_items_product_idx" ON "procurement"."purchase_items" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "purchases_reference_unique" ON "procurement"."purchases" USING btree ("reference_number");--> statement-breakpoint
CREATE INDEX "purchases_supplier_idx" ON "procurement"."purchases" USING btree ("supplier_code");--> statement-breakpoint
CREATE INDEX "purchases_status_idx" ON "procurement"."purchases" USING btree ("status");--> statement-breakpoint
CREATE INDEX "purchases_created_idx" ON "procurement"."purchases" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "suppliers_name_idx" ON "procurement"."suppliers" USING btree ("name");--> statement-breakpoint
CREATE INDEX "suppliers_is_active_idx" ON "procurement"."suppliers" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "payment_methods_code_unique" ON "sales"."payment_methods" USING btree ("code");--> statement-breakpoint
CREATE INDEX "transaction_items_transaction_idx" ON "sales"."transaction_items" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "transaction_items_product_idx" ON "sales"."transaction_items" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "transaction_payments_transaction_idx" ON "sales"."transaction_payments" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "transaction_payments_method_idx" ON "sales"."transaction_payments" USING btree ("payment_method_id");--> statement-breakpoint
CREATE UNIQUE INDEX "transactions_number_unique" ON "sales"."transactions" USING btree ("transaction_number");--> statement-breakpoint
CREATE INDEX "transactions_type_idx" ON "sales"."transactions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "transactions_created_idx" ON "sales"."transactions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "audit_logs_entity_idx" ON "system"."audit_logs" USING btree ("entity");--> statement-breakpoint
CREATE INDEX "audit_logs_entity_id_idx" ON "system"."audit_logs" USING btree ("entity_id");--> statement-breakpoint
CREATE INDEX "audit_logs_created_idx" ON "system"."audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "outbox_id_idx" ON "outbox"."outbox" USING btree ("id");--> statement-breakpoint
CREATE INDEX "outbox_status_idx" ON "outbox"."outbox" USING btree ("status");