import { sql, type MigrateUpArgs, type MigrateDownArgs } from "@payloadcms/db-postgres";

/** Stripe attempts are technical reservations, never orders until payment settles. */
export async function up({ db }: MigrateUpArgs) {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS checkout_reservations (
      reference text PRIMARY KEY,
      snapshot jsonb NOT NULL,
      expires_at timestamptz NOT NULL
    );
    CREATE INDEX IF NOT EXISTS checkout_reservations_expires_idx ON checkout_reservations (expires_at);
  `);
}

export async function down({ db }: MigrateDownArgs) {
  await db.execute(sql`DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM checkout_reservations) THEN
      RAISE EXCEPTION 'Settle active checkout reservations before rolling back';
    END IF;
  END $$;
  DROP TABLE checkout_reservations;`);
}
