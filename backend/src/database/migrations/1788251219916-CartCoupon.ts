import { MigrationInterface, QueryRunner } from 'typeorm';

export class CartCoupon1788251219916 implements MigrationInterface {
  name = 'CartCoupon1788251219916';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "carts" ADD "coupon_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "carts" ADD CONSTRAINT "FK_f1f73556b14ea09a1c7182a7fba" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "carts" DROP CONSTRAINT "FK_f1f73556b14ea09a1c7182a7fba"`,
    );
    await queryRunner.query(`ALTER TABLE "carts" DROP COLUMN "coupon_id"`);
  }
}
