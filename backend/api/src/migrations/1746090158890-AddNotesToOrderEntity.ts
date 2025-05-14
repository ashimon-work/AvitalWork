import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNotesToOrderEntity1746090158890 implements MigrationInterface {
    name = 'AddNotesToOrderEntity1746090158890'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD "notes" text array NOT NULL DEFAULT '{}'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "notes"`);
    }

}
