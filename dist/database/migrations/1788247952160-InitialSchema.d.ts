import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class InitialSchema1788247952160 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
