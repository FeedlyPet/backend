import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEmailLogs1763680000000 implements MigrationInterface {
    name = 'AddEmailLogs1763680000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "email_type_enum" AS ENUM (
                'password_reset',
                'email_verification',
                'welcome',
                'low_food_alert',
                'weekly_digest'
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "email_logs" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid,
                "recipient" character varying(255) NOT NULL,
                "email_type" "email_type_enum" NOT NULL,
                "subject" character varying(500) NOT NULL,
                "sent_successfully" boolean NOT NULL DEFAULT true,
                "error_message" text,
                "sent_at" timestamp with time zone NOT NULL DEFAULT now(),
                CONSTRAINT "PK_email_logs" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            ALTER TABLE "email_logs"
            ADD CONSTRAINT "FK_email_logs_user"
            FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_email_logs_recipient" ON "email_logs" ("recipient")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_email_logs_sent_at" ON "email_logs" ("sent_at")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_email_logs_email_type" ON "email_logs" ("email_type")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_email_logs_user_id" ON "email_logs" ("user_id")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_email_logs_user_id"`);
        await queryRunner.query(`DROP INDEX "IDX_email_logs_email_type"`);
        await queryRunner.query(`DROP INDEX "IDX_email_logs_sent_at"`);
        await queryRunner.query(`DROP INDEX "IDX_email_logs_recipient"`);

        await queryRunner.query(`ALTER TABLE "email_logs" DROP CONSTRAINT "FK_email_logs_user"`);

        await queryRunner.query(`DROP TABLE "email_logs"`);

        await queryRunner.query(`DROP TYPE "email_type_enum"`);
    }
}