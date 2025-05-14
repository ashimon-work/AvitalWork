import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPromoFieldsToCart1747176131263 implements MigrationInterface {
    name = 'AddPromoFieldsToCart1747176131263'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "carts" ADD "appliedPromoCode" character varying`);
        await queryRunner.query(`ALTER TABLE "carts" ADD "discountAmount" numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "carts" ADD "subtotal" numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "carts" ADD "grandTotal" numeric(10,2)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "carts" DROP COLUMN "grandTotal"`);
        await queryRunner.query(`ALTER TABLE "carts" DROP COLUMN "subtotal"`);
        await queryRunner.query(`ALTER TABLE "carts" DROP COLUMN "discountAmount"`);
        await queryRunner.query(`ALTER TABLE "carts" DROP COLUMN "appliedPromoCode"`);
    }

}
