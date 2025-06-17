import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLogoUrlToStoreEntity1748388035052 implements MigrationInterface {
    name = 'AddLogoUrlToStoreEntity1748388035052';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stores" ADD "logoUrl" character varying(2048)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "logoUrl"`);
    }

}
