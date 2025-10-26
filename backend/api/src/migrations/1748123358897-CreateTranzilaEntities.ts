import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTranzilaEntities1748123358897 implements MigrationInterface {
  name = 'CreateTranzilaEntities1748123358897';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "credit_cards" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "token" character varying(255) NOT NULL, "lastFour" character varying(4), "expdate" character varying(4) NOT NULL, "isDefault" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "metadata" jsonb, "userId" uuid NOT NULL, CONSTRAINT "PK_7749b596e358703bb3dd8b45b7c" PRIMARY KEY ("id")); COMMENT ON COLUMN "credit_cards"."token" IS 'Tranzila token (TranzilaTK)'; COMMENT ON COLUMN "credit_cards"."lastFour" IS 'Last 4 digits of the card'; COMMENT ON COLUMN "credit_cards"."expdate" IS 'Card expiry date in MMYY format'; COMMENT ON COLUMN "credit_cards"."isDefault" IS 'Is this the default payment method for the user?'; COMMENT ON COLUMN "credit_cards"."metadata" IS 'Additional metadata'`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_316ec479135fbc369ccf229dd0" ON "credit_cards" ("userId") `,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "tranzila_documents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "transactionId" character varying, "tranzilaDocumentId" integer NOT NULL, "tranzilaDocumentNumber" integer NOT NULL, "tranzilaRetrievalKey" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "metadata" jsonb, "orderId" uuid, CONSTRAINT "PK_7e98406a45c31c9d16ee255cc4e" PRIMARY KEY ("id")); COMMENT ON COLUMN "tranzila_documents"."transactionId" IS 'Internal transaction/reference ID'; COMMENT ON COLUMN "tranzila_documents"."tranzilaDocumentId" IS 'Tranzila internal document ID'; COMMENT ON COLUMN "tranzila_documents"."tranzilaDocumentNumber" IS 'Official document number (invoice/receipt number)'; COMMENT ON COLUMN "tranzila_documents"."tranzilaRetrievalKey" IS 'Key to view/retrieve the document from Tranzila portal'; COMMENT ON COLUMN "tranzila_documents"."metadata" IS 'Additional metadata from Tranzila response'`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_253599a7deab789abbadbf3765" ON "tranzila_documents" ("transactionId") `,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_9d87487d16d04ff695ae0ddac9" ON "tranzila_documents" ("tranzilaDocumentId") `,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_1582a04e0ded58964cdac1b4bb" ON "tranzila_documents" ("tranzilaDocumentNumber") `,
    );

    // Add foreign key constraints only if they don't exist
    await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'FK_316ec479135fbc369ccf229dd0f'
                ) THEN
                    ALTER TABLE "credit_cards" ADD CONSTRAINT "FK_316ec479135fbc369ccf229dd0f" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
                END IF;
            END $$;
        `);

    await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'FK_c097f4cbf0e6e1b76ce0469e41c'
                ) THEN
                    ALTER TABLE "tranzila_documents" ADD CONSTRAINT "FK_c097f4cbf0e6e1b76ce0469e41c" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
                END IF;
            END $$;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tranzila_documents" DROP CONSTRAINT IF EXISTS "FK_c097f4cbf0e6e1b76ce0469e41c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "credit_cards" DROP CONSTRAINT IF EXISTS "FK_316ec479135fbc369ccf229dd0f"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_1582a04e0ded58964cdac1b4bb"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_9d87487d16d04ff695ae0ddac9"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_253599a7deab789abbadbf3765"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "tranzila_documents"`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_316ec479135fbc369ccf229dd0"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "credit_cards"`);
  }
}
