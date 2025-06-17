import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsFeaturedInMarketplace1750044406397 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD IF NOT EXISTS "isFeaturedInMarketplace" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "categories" ADD IF NOT EXISTS "isFeaturedInMarketplace" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "stores" ADD IF NOT EXISTS "isFeaturedInMarketplace" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "isFeaturedInMarketplace"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "isFeaturedInMarketplace"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "isFeaturedInMarketplace"`);
    }

}
