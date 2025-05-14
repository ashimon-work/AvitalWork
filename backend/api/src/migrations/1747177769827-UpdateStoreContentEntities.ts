import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateStoreContentEntities1747177769827 implements MigrationInterface {
    name = 'UpdateStoreContentEntities1747177769827'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "about_content" ADD "imageUrl" character varying`);
        await queryRunner.query(`ALTER TABLE "testimonials" ADD "date" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "testimonials" ADD "rating" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "testimonials" DROP COLUMN "rating"`);
        await queryRunner.query(`ALTER TABLE "testimonials" DROP COLUMN "date"`);
        await queryRunner.query(`ALTER TABLE "about_content" DROP COLUMN "imageUrl"`);
    }

}
