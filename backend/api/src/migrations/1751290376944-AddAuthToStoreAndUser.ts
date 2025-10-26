import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuthToStoreAndUser1751290376944 implements MigrationInterface {
  name = 'AddAuthToStoreAndUser1751290376944';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "stores" ADD "authorizedPhoneNumbers" text`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "roles"`);
    await queryRunner.query(
      `CREATE TYPE "public"."users_roles_enum" AS ENUM('customer', 'manager', 'admin')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "roles" "public"."users_roles_enum" array NOT NULL DEFAULT '{customer}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "roles"`);
    await queryRunner.query(`DROP TYPE "public"."users_roles_enum"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "roles" text NOT NULL DEFAULT 'customer'`,
    );
    await queryRunner.query(
      `ALTER TABLE "stores" DROP COLUMN "authorizedPhoneNumbers"`,
    );
  }
}
