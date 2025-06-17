import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGuestSessionIdToCart1750171363821 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "carts" ADD IF NOT EXISTS "guest_session_id" uuid`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_GUEST_SESSION_ID" ON "carts" ("guest_session_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_GUEST_SESSION_ID"`);
        await queryRunner.query(`ALTER TABLE "carts" DROP COLUMN IF EXISTS "guest_session_id"`);
    }

}
