import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateReviewsEntity1746070293109 implements MigrationInterface {
    name = 'CreateReviewsEntity1746070293109'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "FK_95832b2b2222222222222222222"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "FK_105832b2b222222222222222222"`);
        await queryRunner.query(`ALTER TABLE "carts" DROP CONSTRAINT "FK_75832b2b2222222222222222222"`);
        await queryRunner.query(`ALTER TABLE "carts" DROP CONSTRAINT "FK_85832b2b2222222222222222222"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "carts" ADD CONSTRAINT "FK_85832b2b2222222222222222222" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "carts" ADD CONSTRAINT "FK_75832b2b2222222222222222222" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD CONSTRAINT "FK_105832b2b222222222222222222" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD CONSTRAINT "FK_95832b2b2222222222222222222" FOREIGN KEY ("cartId") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
