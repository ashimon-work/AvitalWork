import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTranzilaIntegration1749436522371 implements MigrationInterface {
    name = 'AddTranzilaIntegration1749436522371'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "tranzilaTransactionId" character varying(100)`);
        await queryRunner.query(`COMMENT ON COLUMN "orders"."tranzilaTransactionId" IS 'Tranzila transaction/confirmation ID'`);
        await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "paymentErrorMessage" text`);
        await queryRunner.query(`COMMENT ON COLUMN "orders"."paymentErrorMessage" IS 'Payment error message if payment failed'`);
        
        // Update PaymentStatus enum to include 'completed'
        await queryRunner.query(`ALTER TYPE "public"."orders_paymentstatus_enum" RENAME TO "orders_paymentstatus_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."orders_paymentstatus_enum" AS ENUM('pending', 'paid', 'completed', 'failed', 'refunded')`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "paymentStatus" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "paymentStatus" TYPE "public"."orders_paymentstatus_enum" USING "paymentStatus"::"text"::"public"."orders_paymentstatus_enum"`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "paymentStatus" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."orders_paymentstatus_enum_old"`);

        // Create credit_cards table if it doesn't exist
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "credit_cards" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "token" character varying(255) NOT NULL,
                "lastFour" character varying(4),
                "expdate" character varying(4),
                "isDefault" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "userId" uuid,
                CONSTRAINT "PK_credit_cards" PRIMARY KEY ("id")
            )
        `);

        // Create tranzila_documents table if it doesn't exist
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "tranzila_documents" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "transactionId" character varying(100),
                "tranzilaDocumentId" integer NOT NULL,
                "tranzilaDocumentNumber" integer NOT NULL,
                "tranzilaRetrievalKey" character varying(255) NOT NULL,
                "metadata" jsonb,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "orderId" uuid,
                CONSTRAINT "PK_tranzila_documents" PRIMARY KEY ("id")
            )
        `);

        // Add foreign key constraints if they don't exist
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_credit_cards_user') THEN
                    ALTER TABLE "credit_cards" 
                    ADD CONSTRAINT "FK_credit_cards_user" 
                    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
                END IF;
            END $$;
        `);

        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_tranzila_documents_order') THEN
                    ALTER TABLE "tranzila_documents" 
                    ADD CONSTRAINT "FK_tranzila_documents_order" 
                    FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE;
                END IF;
            END $$;
        `);

        // Add indexes for better performance
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_credit_cards_userId" ON "credit_cards" ("userId")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_tranzila_documents_orderId" ON "tranzila_documents" ("orderId")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_tranzila_documents_transactionId" ON "tranzila_documents" ("transactionId")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_orders_tranzilaTransactionId" ON "orders" ("tranzilaTransactionId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove indexes
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orders_tranzilaTransactionId"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tranzila_documents_transactionId"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tranzila_documents_orderId"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_credit_cards_userId"`);

        // Remove foreign key constraints
        await queryRunner.query(`ALTER TABLE "tranzila_documents" DROP CONSTRAINT IF EXISTS "FK_tranzila_documents_order"`);
        await queryRunner.query(`ALTER TABLE "credit_cards" DROP CONSTRAINT IF EXISTS "FK_credit_cards_user"`);

        // Drop tables
        await queryRunner.query(`DROP TABLE IF EXISTS "tranzila_documents"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "credit_cards"`);

        // Revert enum changes
        await queryRunner.query(`CREATE TYPE "public"."orders_paymentstatus_enum_old" AS ENUM('pending', 'paid', 'failed', 'refunded')`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "paymentStatus" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "paymentStatus" TYPE "public"."orders_paymentstatus_enum_old" USING "paymentStatus"::"text"::"public"."orders_paymentstatus_enum_old"`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "paymentStatus" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."orders_paymentstatus_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."orders_paymentstatus_enum_old" RENAME TO "orders_paymentstatus_enum"`);

        // Remove added columns from orders
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "paymentErrorMessage"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "tranzilaTransactionId"`);
    }
}
