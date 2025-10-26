import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveStateFromAddresses1744001400000
  implements MigrationInterface
{
  name = 'RemoveStateFromAddresses1744001400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remove the 'state' column from the 'addresses' table
    await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "state"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add the 'state' column back if reverting
    // Note: Data will be lost if reverted after dropping.
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD "state" character varying(100) NOT NULL`,
    );
  }
}
