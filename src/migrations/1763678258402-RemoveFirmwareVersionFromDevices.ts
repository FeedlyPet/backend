import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveFirmwareVersionFromDevices1763678258402 implements MigrationInterface {
    name = 'RemoveFirmwareVersionFromDevices1763678258402'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "email_verifications" DROP CONSTRAINT "FK_email_verifications_user"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_email_verifications_user_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_email_verifications_is_used"`);
        await queryRunner.query(`ALTER TABLE "devices" DROP COLUMN "firmware_version"`);
        await queryRunner.query(`ALTER TABLE "email_verifications" ADD CONSTRAINT "FK_c4f1838323ae1dff5aa00148915" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "email_verifications" DROP CONSTRAINT "FK_c4f1838323ae1dff5aa00148915"`);
        await queryRunner.query(`ALTER TABLE "devices" ADD "firmware_version" character varying(20)`);
        await queryRunner.query(`CREATE INDEX "IDX_email_verifications_is_used" ON "email_verifications" ("is_used") `);
        await queryRunner.query(`CREATE INDEX "IDX_email_verifications_user_id" ON "email_verifications" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "email_verifications" ADD CONSTRAINT "FK_email_verifications_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}