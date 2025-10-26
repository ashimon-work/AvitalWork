import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCartEntities1745868500915 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "carts" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "userId" uuid,
                "storeId" uuid,
                CONSTRAINT "PK_f51b55ecac220f6112cb81b6b0f" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "cart_items" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "quantity" integer NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "cartId" uuid,
                "productId" uuid,
                CONSTRAINT "PK_0b282f6c5130b930130e4b3111f" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "carts" ADD CONSTRAINT "FK_75832b2b2222222222222222222" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "carts" ADD CONSTRAINT "FK_85832b2b2222222222222222222" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "cart_items" ADD CONSTRAINT "FK_95832b2b2222222222222222222" FOREIGN KEY ("cartId") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "cart_items" ADD CONSTRAINT "FK_105832b2b222222222222222222" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "cart_items" DROP CONSTRAINT "FK_105832b2b222222222222222222"
        `);
    await queryRunner.query(`
            ALTER TABLE "cart_items" DROP CONSTRAINT "FK_95832b2b2222222222222222222"
        `);
    await queryRunner.query(`
            ALTER TABLE "carts" DROP CONSTRAINT "FK_85832b2b2222222222222222222"
        `);
    await queryRunner.query(`
            ALTER TABLE "carts" DROP CONSTRAINT "FK_75832b2b2222222222222222222"
        `);
    await queryRunner.query(`
            DROP TABLE "cart_items"
        `);
    await queryRunner.query(`
            DROP TABLE "carts"
        `);
  }
}
