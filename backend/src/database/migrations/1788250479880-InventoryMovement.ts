import { MigrationInterface, QueryRunner } from 'typeorm';

export class InventoryMovement1788250479880 implements MigrationInterface {
  name = 'InventoryMovement1788250479880';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."inventory_movements_type_enum" AS ENUM('ADD', 'DEDUCT', 'RESERVE', 'RELEASE', 'ADJUST')`,
    );
    await queryRunner.query(
      `CREATE TABLE "inventory_movements" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "product_id" uuid NOT NULL, "quantity" integer NOT NULL, "type" "public"."inventory_movements_type_enum" NOT NULL, "reference_id" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d7597827c1dcffae889db3ab873" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_movements" ADD CONSTRAINT "FK_5c3bec1682252c36fa161587738" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "inventory_movements" DROP CONSTRAINT "FK_5c3bec1682252c36fa161587738"`,
    );
    await queryRunner.query(`DROP TABLE "inventory_movements"`);
    await queryRunner.query(
      `DROP TYPE "public"."inventory_movements_type_enum"`,
    );
  }
}
