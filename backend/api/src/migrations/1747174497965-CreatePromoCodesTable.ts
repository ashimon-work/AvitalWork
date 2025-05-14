import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePromoCodesTable1747174497965 implements MigrationInterface {
    name = 'CreatePromoCodesTable1747174497965'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "login_history" DROP CONSTRAINT "FK_user_login_history"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "login_history" ADD CONSTRAINT "FK_user_login_history" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
