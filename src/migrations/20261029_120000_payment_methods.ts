import { sql, type MigrateUpArgs, type MigrateDownArgs } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs) {
  await db.execute(sql`
    ALTER TYPE "public"."enum_orders_status" ADD VALUE IF NOT EXISTS 'cod_pending';
    ALTER TYPE "public"."enum_orders_status" ADD VALUE IF NOT EXISTS 'cancelled';
    CREATE TYPE "public"."enum_orders_payment_method" AS ENUM ('card', 'cod');
    ALTER TABLE orders ADD COLUMN payment_method "public"."enum_orders_payment_method" DEFAULT 'card';
    ALTER TABLE orders ADD COLUMN checkout_details jsonb;
    ALTER TABLE orders ADD COLUMN cod_collected_at timestamptz;
  `);
}

export async function down({ db }: MigrateDownArgs) {
  // Preserve billing snapshots and COD history rather than silently deleting them.
  await db.execute(sql`DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM orders WHERE checkout_details IS NOT NULL OR payment_method = 'cod' OR status::text IN ('cod_pending', 'cancelled')) THEN
      RAISE EXCEPTION 'Cannot roll back orders with billing or COD history';
    END IF;
  END $$;
  ALTER TABLE orders DROP COLUMN checkout_details, DROP COLUMN payment_method, DROP COLUMN cod_collected_at;
  DROP TYPE "public"."enum_orders_payment_method";`);
  // The additive status values are intentionally retained; older app versions ignore them.
}
