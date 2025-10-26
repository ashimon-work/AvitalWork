import { MigrationInterface, QueryRunner } from 'typeorm';

export class HandleGuestSessionIdIndex1751285671681
  implements MigrationInterface
{
  name = 'HandleGuestSessionIdIndex1751285671681';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_GUEST_SESSION_ID"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_GUEST_SESSION_ID" ON "carts" ("guest_session_id") `,
    );
  }
}
