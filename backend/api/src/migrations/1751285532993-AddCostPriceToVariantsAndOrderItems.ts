import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCostPriceToVariantsAndOrderItems1751285532993
  implements MigrationInterface
{
  name = 'AddCostPriceToVariantsAndOrderItems1751285532993';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_variants" ADD "costPrice" numeric(10,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD "costPricePerUnit" numeric(10,2)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP COLUMN "costPricePerUnit"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variants" DROP COLUMN "costPrice"`,
    );
  }
}
