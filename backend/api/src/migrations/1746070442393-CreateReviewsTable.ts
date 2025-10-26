import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReviewsTable1746070442393 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "reviews" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "rating" integer NOT NULL,
                "comment" text,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "productId" uuid,
                "userId" uuid,
                "storeId" uuid,
                CONSTRAINT "PK_238b6388253955a5224e3204a37" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "reviews" ADD CONSTRAINT "FK_338b6388253955a5224e3204a37" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "reviews" ADD CONSTRAINT "FK_438b6388253955a5224e3204a37" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "reviews" ADD CONSTRAINT "FK_538b6388253955a5224e3204a37" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "reviews" DROP CONSTRAINT "FK_538b6388253955a5224e3204a37"
        `);
    await queryRunner.query(`
            ALTER TABLE "reviews" DROP CONSTRAINT "FK_438b6388253955a5224e3204a37"
        `);
    await queryRunner.query(`
            ALTER TABLE "reviews" DROP CONSTRAINT "FK_338b6388253955a5224e3204a37"
        `);
    await queryRunner.query(`
            DROP TABLE "reviews"
        `);
  }
}
