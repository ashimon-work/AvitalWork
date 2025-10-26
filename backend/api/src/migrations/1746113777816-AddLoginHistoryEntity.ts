import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLoginHistoryEntity1746113777816 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "login_history" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "login_time" TIMESTAMP NOT NULL DEFAULT now(),
                "ip_address" character varying,
                "device_info" character varying,
                "location" character varying,
                CONSTRAINT "PK_a81151311221f1111111111111111111" PRIMARY KEY ("id")
            );
        `);

    await queryRunner.query(`
            ALTER TABLE "login_history" ADD CONSTRAINT "FK_user_login_history" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "login_history" DROP CONSTRAINT "FK_user_login_history";
        `);

    await queryRunner.query(`
            DROP TABLE "login_history";
        `);
  }
}
