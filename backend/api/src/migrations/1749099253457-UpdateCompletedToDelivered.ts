import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateCompletedToDelivered1749099253457
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update existing orders with 'completed' status to 'delivered'
    await queryRunner.query(`
            UPDATE orders 
            SET status = 'delivered' 
            WHERE status = 'completed'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert: Update orders with 'delivered' status back to 'completed'
    // Note: This assumes all 'delivered' orders were originally 'completed'
    await queryRunner.query(`
            UPDATE orders 
            SET status = 'completed' 
            WHERE status = 'delivered'
        `);
  }
}
