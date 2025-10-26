import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePaymentMethodsTable1747180706858
  implements MigrationInterface
{
  name = 'CreatePaymentMethodsTable1747180706858';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "payment_methods" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "type" character varying(50) NOT NULL,
                "paymentGatewayToken" character varying(255),
                "cardBrand" character varying(100),
                "last4" character varying(4),
                "expiryMonth" integer,
                "expiryYear" integer,
                "isDefault" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "metadata" jsonb,
                "userId" uuid NOT NULL,
                "storeId" uuid NOT NULL,
                "billingAddressId" uuid,
                CONSTRAINT "PK_payment_method_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_payment_method_user_store" ON "payment_methods" ("userId", "storeId")
        `);
    await queryRunner.query(`
            ALTER TABLE "payment_methods"
            ADD CONSTRAINT "FK_payment_method_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "payment_methods"
            ADD CONSTRAINT "FK_payment_method_store" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "payment_methods"
            ADD CONSTRAINT "FK_payment_method_billing_address" FOREIGN KEY ("billingAddressId") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "payment_methods" DROP CONSTRAINT "FK_payment_method_billing_address"
        `);
    await queryRunner.query(`
            ALTER TABLE "payment_methods" DROP CONSTRAINT "FK_payment_method_store"
        `);
    await queryRunner.query(`
            ALTER TABLE "payment_methods" DROP CONSTRAINT "FK_payment_method_user"
        `);
    await queryRunner.query(`
            DROP INDEX IF EXISTS "public"."IDX_payment_method_user_store"
        `);
    await queryRunner.query(`
            DROP TABLE IF EXISTS "payment_methods"
        `);
  }
}
