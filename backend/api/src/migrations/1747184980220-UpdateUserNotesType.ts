import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserNotesType1747184980220 implements MigrationInterface {
    name = 'UpdateUserNotesType1747184980220'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "notes"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "notes" jsonb DEFAULT '[]'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "notes"`);
        // Reverting to simple-array which is stored as text[] in postgres for TypeORM's simple-array
        await queryRunner.query(`ALTER TABLE "users" ADD "notes" text[]`);
    }

}
