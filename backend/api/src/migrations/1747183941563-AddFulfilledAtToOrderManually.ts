import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFulfilledAtToOrderManually1747183941563
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Column "fulfilledAt" already exists, so we skip adding it.
    // await queryRunner.query('ALTER TABLE "orders" ADD "fulfilledAt" TIMESTAMP');
    // We can add a log here if needed, or simply let the migration run "empty"
    // to get it recorded in the migrations table.
    console.log(
      'Skipping ADD COLUMN "fulfilledAt" to "orders" as it already exists. Marking migration as run.',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "orders" DROP COLUMN "fulfilledAt"');
  }
}
