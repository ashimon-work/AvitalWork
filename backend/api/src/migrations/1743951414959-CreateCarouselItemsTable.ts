import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCarouselItemsTable1743951414959
  implements MigrationInterface
{
  name = 'CreateCarouselItemsTable1743951414959';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "carousel_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "imageUrl" character varying NOT NULL, "altText" character varying NOT NULL, "linkUrl" character varying, "storeId" uuid NOT NULL, CONSTRAINT "PK_8637c120a5351777635ffeb3e14" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "carousel_items" ADD CONSTRAINT "FK_d3dba372f078eb51aa35981cef9" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "carousel_items" DROP CONSTRAINT "FK_d3dba372f078eb51aa35981cef9"`,
    );
    await queryRunner.query(`DROP TABLE "carousel_items"`);
  }
}
