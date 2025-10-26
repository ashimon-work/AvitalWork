import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNewsletterSubscriptionTableManually1747180309606
  implements MigrationInterface
{
  name = 'CreateNewsletterSubscriptionTableManually1747180309606';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "newsletter_subscriptions" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying NOT NULL,
                "isActive" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "source" character varying,
                CONSTRAINT "UQ_newsletter_email" UNIQUE ("email"),
                CONSTRAINT "PK_newsletter_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_newsletter_email" ON "newsletter_subscriptions" ("email")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX IF EXISTS "public"."IDX_newsletter_email"
        `);
    await queryRunner.query(`
            DROP TABLE IF EXISTS "newsletter_subscriptions"
        `);
  }
}
