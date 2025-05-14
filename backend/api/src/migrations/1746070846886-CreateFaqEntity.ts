import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFaqEntity1746070846886 implements MigrationInterface {
    name = 'CreateFaqEntity1746070846886'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "faq" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "question" text NOT NULL, "answer" text NOT NULL, "storeId" uuid, CONSTRAINT "PK_d6f5a52b1a96dd8d0591f9fbc47" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "faq" ADD CONSTRAINT "FK_af76d35aab6e89a584b72cc14e3" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "faq" DROP CONSTRAINT "FK_af76d35aab6e89a584b72cc14e3"`);
        await queryRunner.query(`DROP TABLE "faq"`);
    }

}
