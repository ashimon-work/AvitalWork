import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from "typeorm";

export class CreateNotificationEntity1747182728800 implements MigrationInterface {
    name = 'CreateNotificationEntity1747182728800';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`); // Ensure uuid-ossp extension is available for uuid_generate_v4()
        await queryRunner.createTable(
            new Table({
                name: "notifications",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        default: "uuid_generate_v4()",
                    },
                    {
                        name: "userId",
                        type: "uuid",
                        comment: "ID of the user (manager) this notification is for",
                    },
                    {
                        name: "type",
                        type: "enum",
                        enum: ['NEW_ORDER', 'LOW_STOCK', 'SYSTEM_ALERT', 'ORDER_STATUS_UPDATE', 'NEW_CUSTOMER_REVIEW'],
                        comment: "Type of the notification",
                    },
                    {
                        name: "title",
                        type: "varchar",
                        length: "255",
                        comment: "Brief title of the notification",
                    },
                    {
                        name: "message",
                        type: "text",
                        comment: "Detailed message of the notification",
                    },
                    {
                        name: "isRead",
                        type: "boolean",
                        default: false,
                        comment: "Indicates if the notification has been read",
                    },
                    {
                        name: "createdAt",
                        type: "timestamp with time zone",
                        default: "CURRENT_TIMESTAMP",
                        comment: "Timestamp when the notification was created",
                    },
                    {
                        name: "readAt",
                        type: "timestamp with time zone",
                        isNullable: true,
                        comment: "Timestamp when the notification was read",
                    },
                    {
                        name: "link",
                        type: "varchar",
                        length: "512",
                        isNullable: true,
                        comment: "Optional link related to the notification (e.g., to an order or product)",
                    },
                    {
                        name: "severity",
                        type: "enum",
                        enum: ['info', 'warning', 'error', 'success'],
                        default: "'info'",
                        comment: "Severity level of the notification",
                    },
                    // Optional storeId column if notifications are store-specific
                    // {
                    //     name: "storeId",
                    //     type: "uuid",
                    //     isNullable: true,
                    //     comment: "ID of the store this notification pertains to, if applicable",
                    // },
                ],
            }),
            true, // true to create foreign keys, indices, etc.
        );

        await queryRunner.createIndex(
            "notifications",
            new TableIndex({ name: "IDX_notifications_userId", columnNames: ["userId"] }),
        );

        // Optional: Add foreign key constraint to users table if it exists and you want to enforce it
        // Ensure 'users' table and 'id' column exist and match type.
        // await queryRunner.createForeignKey(
        //     "notifications",
        //     new TableForeignKey({
        //         columnNames: ["userId"],
        //         referencedColumnNames: ["id"],
        //         referencedTableName: "users", // or your actual user table name
        //         onDelete: "CASCADE", // Or "SET NULL" or "RESTRICT"
        //     }),
        // );

        // Optional: Index for storeId if added
        // await queryRunner.createIndex(
        //     "notifications",
        //     new TableIndex({ name: "IDX_notifications_storeId", columnNames: ["storeId"] }),
        // );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // await queryRunner.dropForeignKey("notifications", "FK_notifications_userId_users"); // Adjust FK name if used
        await queryRunner.dropIndex("notifications", "IDX_notifications_userId");
        // await queryRunner.dropIndex("notifications", "IDX_notifications_storeId"); // If storeId index was created
        await queryRunner.dropTable("notifications");
    }
}
