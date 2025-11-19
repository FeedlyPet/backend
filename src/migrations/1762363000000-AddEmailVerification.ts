import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEmailVerification1762363000000 implements MigrationInterface {
    name = 'AddEmailVerification1762363000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD COLUMN "is_email_verified" boolean NOT NULL DEFAULT false,
            ADD COLUMN "email_verified_at" timestamp with time zone
        `);

        await queryRunner.query(`
            CREATE TABLE "email_verifications" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "token_hash" character varying(255) NOT NULL,
                "expires_at" timestamp with time zone NOT NULL,
                "is_used" boolean NOT NULL DEFAULT false,
                "created_at" timestamp with time zone NOT NULL DEFAULT now(),
                CONSTRAINT "PK_email_verifications" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            ALTER TABLE "email_verifications"
            ADD CONSTRAINT "FK_email_verifications_user"
            FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_email_verifications_user_id" ON "email_verifications" ("user_id")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_email_verifications_is_used" ON "email_verifications" ("is_used")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_email_verifications_is_used"`);
        await queryRunner.query(`DROP INDEX "IDX_email_verifications_user_id"`);

        await queryRunner.query(`ALTER TABLE "email_verifications" DROP CONSTRAINT "FK_email_verifications_user"`);

        await queryRunner.query(`DROP TABLE "email_verifications"`);

        await queryRunner.query(`
            ALTER TABLE "users"
            DROP COLUMN "email_verified_at",
            DROP COLUMN "is_email_verified"
        `);
    }
}
