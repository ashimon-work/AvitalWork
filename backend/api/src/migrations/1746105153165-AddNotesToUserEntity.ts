import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNotesToUserEntity1746105153165 implements MigrationInterface {
    name = 'AddNotesToUserEntity1746105153165'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "notes" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "notes"`);
    }

}
