import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateStoreContentEntities1746079365341 implements MigrationInterface {
    name = 'CreateStoreContentEntities1746079365341'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "about_content" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "content" text NOT NULL, "storeId" uuid, CONSTRAINT "PK_3086a6ad374a54bd39deecfdecf" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "testimonials" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "author" character varying NOT NULL, "quote" text NOT NULL, "storeId" uuid, CONSTRAINT "PK_63b03c608bd258f115a0a4a1060" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "about_content" ADD CONSTRAINT "FK_d5405758db6336f866026619b5a" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "testimonials" ADD CONSTRAINT "FK_36beb957e9d61669656cde84e20" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "testimonials" DROP CONSTRAINT "FK_36beb957e9d61669656cde84e20"`);
        await queryRunner.query(`ALTER TABLE "about_content" DROP CONSTRAINT "FK_d5405758db6336f866026619b5a"`);
        await queryRunner.query(`DROP TABLE "testimonials"`);
        await queryRunner.query(`DROP TABLE "about_content"`);
    }

}
