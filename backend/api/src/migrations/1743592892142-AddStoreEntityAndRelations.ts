import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStoreEntityAndRelations1743592892142
  implements MigrationInterface
{
  name = 'AddStoreEntityAndRelations1743592892142';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "stores" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "slug" character varying NOT NULL, "description" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_a205ca5a37fa5e10005f003aaf3" UNIQUE ("name"), CONSTRAINT "UQ_790b2968701a6ff5ff383237765" UNIQUE ("slug"), CONSTRAINT "PK_7aa6e7d71fa7acdd7ca43d7c9cb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_a205ca5a37fa5e10005f003aaf" ON "stores" ("name") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_790b2968701a6ff5ff38323776" ON "stores" ("slug") `,
    );
    // Step 1a: Insert the default store record first to satisfy FK constraints later
    const defaultStoreId = '11111111-1111-1111-1111-111111111111'; // Use valid UUID from seed.ts
    const defaultStoreName = 'Default Store (Migration)'; // Give it a name
    const defaultStoreSlug = 'default-store-migration'; // Give it a slug
    await queryRunner.query(
      `INSERT INTO "stores" ("id", "name", "slug", "createdAt", "updatedAt") VALUES ($1, $2, $3, NOW(), NOW()) ON CONFLICT ("id") DO NOTHING`,
      [defaultStoreId, defaultStoreName, defaultStoreSlug],
    );

    // Step 1b: Add columns allowing NULL initially
    await queryRunner.query(`ALTER TABLE "categories" ADD "storeId" uuid NULL`);
    await queryRunner.query(`ALTER TABLE "products" ADD "storeId" uuid NULL`);

    // Step 2: Update existing rows with the default storeId
    await queryRunner.query(
      `UPDATE "categories" SET "storeId" = $1 WHERE "storeId" IS NULL`,
      [defaultStoreId],
    );
    await queryRunner.query(
      `UPDATE "products" SET "storeId" = $1 WHERE "storeId" IS NULL`,
      [defaultStoreId],
    );

    // Step 3: Alter columns to be NOT NULL
    await queryRunner.query(
      `ALTER TABLE "categories" ALTER COLUMN "storeId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "storeId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "FK_fa6ba3528de12e174b163c09fdd" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_782da5e50e94b763eb63225d69d" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_782da5e50e94b763eb63225d69d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "FK_fa6ba3528de12e174b163c09fdd"`,
    );
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "storeId"`);
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "storeId"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_790b2968701a6ff5ff38323776"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a205ca5a37fa5e10005f003aaf"`,
    );
    await queryRunner.query(`DROP TABLE "stores"`);
  }
}
