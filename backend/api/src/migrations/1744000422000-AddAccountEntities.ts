import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAccountEntities1744000422000 implements MigrationInterface {
  name = 'AddAccountEntities1744000422000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create addresses table
    await queryRunner.query(`
            CREATE TABLE "addresses" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "fullName" character varying(100) NOT NULL,
                "street1" character varying(255) NOT NULL,
                "street2" character varying(255),
                "city" character varying(100) NOT NULL,
                "state" character varying(100) NOT NULL,
                "postalCode" character varying(20) NOT NULL,
                "country" character varying(100) NOT NULL,
                "phoneNumber" character varying(20),
                "isDefaultShipping" boolean NOT NULL DEFAULT false,
                "isDefaultBilling" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "userId" uuid NOT NULL,
                CONSTRAINT "PK_addresses_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD CONSTRAINT "FK_addresses_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // Create orders table
    await queryRunner.query(
      `CREATE TYPE "public"."orders_status_enum" AS ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'failed')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."orders_paymentstatus_enum" AS ENUM('pending', 'paid', 'failed', 'refunded')`,
    );
    await queryRunner.query(`
            CREATE TABLE "orders" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "orderReference" character varying NOT NULL,
                "userId" uuid NOT NULL,
                "storeId" uuid NOT NULL,
                "orderDate" TIMESTAMP NOT NULL DEFAULT now(),
                "status" "public"."orders_status_enum" NOT NULL DEFAULT 'pending',
                "totalAmount" numeric(10, 2) NOT NULL,
                "subtotal" numeric(10, 2) NOT NULL DEFAULT '0',
                "shippingCost" numeric(10, 2) NOT NULL DEFAULT '0',
                "taxAmount" numeric(10, 2) NOT NULL DEFAULT '0',
                "shippingAddressId" uuid,
                "shippingMethod" character varying(100),
                "paymentStatus" "public"."orders_paymentstatus_enum" NOT NULL DEFAULT 'pending',
                "trackingNumber" character varying(100),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_orders_orderReference" UNIQUE ("orderReference"),
                CONSTRAINT "PK_orders_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_orders_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_orders_storeId" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_orders_shippingAddressId" FOREIGN KEY ("shippingAddressId") REFERENCES "addresses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    // Create order_items table
    await queryRunner.query(`
            CREATE TABLE "order_items" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "orderId" uuid NOT NULL,
                "productId" uuid NOT NULL,
                "quantity" integer NOT NULL,
                "pricePerUnit" numeric(10, 2) NOT NULL,
                "productName" character varying(255) NOT NULL,
                "variantDetails" jsonb,
                CONSTRAINT "PK_order_items_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_order_items_orderId" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_order_items_productId" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );

    // Create wishlists table
    await queryRunner.query(`
            CREATE TABLE "wishlists" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" uuid NOT NULL,
                "storeId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_wishlists_user_store" UNIQUE ("userId", "storeId"),
                CONSTRAINT "PK_wishlists_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(
      `ALTER TABLE "wishlists" ADD CONSTRAINT "FK_wishlists_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlists" ADD CONSTRAINT "FK_wishlists_storeId" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // Create wishlist_items table
    await queryRunner.query(`
            CREATE TABLE "wishlist_items" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "wishlistId" uuid NOT NULL,
                "productId" uuid NOT NULL,
                "addedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_wishlist_items_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(
      `ALTER TABLE "wishlist_items" ADD CONSTRAINT "FK_wishlist_items_wishlistId" FOREIGN KEY ("wishlistId") REFERENCES "wishlists"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlist_items" ADD CONSTRAINT "FK_wishlist_items_productId" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // Add relations to users table (already done via decorators, but good practice to ensure FKs exist if needed)
    // Note: TypeORM handles adding columns for relations implicitly, but FK constraints are explicit.
    // We already added the @OneToMany decorators, which don't directly create DB constraints.
    // The @ManyToOne sides in AddressEntity, OrderEntity, WishlistEntity created the FKs.
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop constraints and tables in reverse order of creation

    // wishlist_items
    await queryRunner.query(
      `ALTER TABLE "wishlist_items" DROP CONSTRAINT "FK_wishlist_items_productId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlist_items" DROP CONSTRAINT "FK_wishlist_items_wishlistId"`,
    );
    await queryRunner.query(`DROP TABLE "wishlist_items"`);

    // wishlists
    await queryRunner.query(
      `ALTER TABLE "wishlists" DROP CONSTRAINT "FK_wishlists_storeId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlists" DROP CONSTRAINT "FK_wishlists_userId"`,
    );
    await queryRunner.query(`DROP TABLE "wishlists"`);

    // order_items
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_order_items_productId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_order_items_orderId"`,
    );
    await queryRunner.query(`DROP TABLE "order_items"`);

    // orders
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_orders_shippingAddressId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_orders_storeId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_orders_userId"`,
    );
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TYPE "public"."orders_paymentstatus_enum"`);
    await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);

    // addresses
    await queryRunner.query(
      `ALTER TABLE "addresses" DROP CONSTRAINT "FK_addresses_userId"`,
    );
    await queryRunner.query(`DROP TABLE "addresses"`);
  }
}
