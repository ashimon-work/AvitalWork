import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateShippingMethodsTableManually1748137450944 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create the table IF IT DOES NOT EXIST to make it idempotent
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "shipping_methods" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "description" text,
                "cost" numeric(10,2) NOT NULL,
                "estimatedDeliveryDays" integer,
                "isActive" boolean NOT NULL DEFAULT true,
                "storeId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "PK_shipping_methods_id" PRIMARY KEY ("id")
            )
        `);

        // Add foreign key constraint if it doesn't exist
        // Check if foreign key exists before creating
        const table = await queryRunner.getTable("shipping_methods");
        if (table) { // Ensure table exists before trying to access its foreignKeys
            const foreignKeyExists = table.foreignKeys.some(
                (fk) => fk.columnNames.indexOf("storeId") !== -1 && fk.referencedTableName === "stores"
            );

            if (!foreignKeyExists) {
                await queryRunner.createForeignKey(
                    "shipping_methods",
                    new TableForeignKey({
                        columnNames: ["storeId"],
                        referencedColumnNames: ["id"],
                        referencedTableName: "stores",
                        onDelete: "CASCADE",
                    }),
                );
            }
        } else {
            // This case should ideally not be reached if CREATE TABLE IF NOT EXISTS worked.
            // But as a fallback, attempt to create the foreign key directly.
            // This might fail if the table truly doesn't exist, but it's better than doing nothing.
             await queryRunner.createForeignKey(
                "shipping_methods", // This will fail if table doesn't exist, but it's a last resort.
                new TableForeignKey({
                    columnNames: ["storeId"],
                    referencedColumnNames: ["id"],
                    referencedTableName: "stores",
                    onDelete: "CASCADE",
                }),
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("shipping_methods");
        if (table) {
            const foreignKey = table.foreignKeys.find(
                (fk) => fk.columnNames.indexOf("storeId") !== -1,
            );
            if (foreignKey) {
                await queryRunner.dropForeignKey("shipping_methods", foreignKey);
            }
            await queryRunner.dropTable("shipping_methods");
        }
    }

}
