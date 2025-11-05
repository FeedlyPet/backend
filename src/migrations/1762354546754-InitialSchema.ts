import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1762354546754 implements MigrationInterface {
    name = 'InitialSchema1762354546754'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."feeding_events_type_enum" AS ENUM('automatic', 'manual')`);
        await queryRunner.query(`CREATE TABLE "feeding_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "device_id" uuid NOT NULL, "pet_id" uuid, "schedule_id" uuid, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "portion_size" integer NOT NULL, "type" "public"."feeding_events_type_enum" NOT NULL, "success" boolean NOT NULL DEFAULT true, "error_message" text, "photo_url" character varying(500), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_17f75d1c9f7ff6de5fd067d26b2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "schedules" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "device_id" uuid NOT NULL, "feeding_time" TIME NOT NULL, "portion_size" integer NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "days_of_week" text array NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_7e33fc2ea755a5765e3564e66dd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "food_levels" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "device_id" uuid NOT NULL, "level" integer NOT NULL, "estimated_days_left" integer, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_646bfaf8d9dec5f529507d4ac43" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."notifications_type_enum" AS ENUM('FEEDING_SUCCESS', 'FEEDING_FAILED', 'LOW_FOOD_LEVEL', 'DEVICE_OFFLINE', 'DEVICE_ONLINE')`);
        await queryRunner.query(`CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "device_id" uuid, "type" "public"."notifications_type_enum" NOT NULL, "title" character varying(200) NOT NULL, "message" text NOT NULL, "is_read" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "devices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "pet_id" uuid, "device_id" character varying(100) NOT NULL, "name" character varying(100) NOT NULL, "location" character varying(200), "is_online" boolean NOT NULL DEFAULT false, "last_seen" TIMESTAMP WITH TIME ZONE, "firmware_version" character varying(20), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_2667f40edb344d6f274a0d42b6f" UNIQUE ("device_id"), CONSTRAINT "PK_b1514758245c12daf43486dd1f0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."pets_species_enum" AS ENUM('cat', 'dog', 'other')`);
        await queryRunner.query(`CREATE TABLE "pets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "name" character varying(100) NOT NULL, "species" "public"."pets_species_enum" NOT NULL, "weight" numeric(5,2) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_d01e9e7b4ada753c826720bee8b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "notification_settings" ("user_id" uuid NOT NULL, "feeding_success" boolean NOT NULL DEFAULT true, "feeding_failed" boolean NOT NULL DEFAULT true, "low_food_level" boolean NOT NULL DEFAULT true, "device_status" boolean NOT NULL DEFAULT true, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_91a7ffebe8b406c4470845d4781" PRIMARY KEY ("user_id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(255) NOT NULL, "password_hash" character varying(255) NOT NULL, "name" character varying(100) NOT NULL, "timezone" character varying(50) NOT NULL DEFAULT 'UTC', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "feeding_events" ADD CONSTRAINT "FK_4733999aa1af92e23464b23e0fe" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "feeding_events" ADD CONSTRAINT "FK_1654e6e4a30393591e1de226129" FOREIGN KEY ("pet_id") REFERENCES "pets"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "feeding_events" ADD CONSTRAINT "FK_c39f2d5bf15136b9f5959b19429" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "schedules" ADD CONSTRAINT "FK_249663b434d4a5303673c34edaa" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "food_levels" ADD CONSTRAINT "FK_5eba9a8fa75a65aca1b9b082178" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_9a8a82462cab47c73d25f49261f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_49291f4397a09af4eae014d7d07" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "devices" ADD CONSTRAINT "FK_5e9bee993b4ce35c3606cda194c" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "devices" ADD CONSTRAINT "FK_bd378ace1af20893f64035a07f2" FOREIGN KEY ("pet_id") REFERENCES "pets"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pets" ADD CONSTRAINT "FK_4ddf2615c9d24b5be6d26830b4b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notification_settings" ADD CONSTRAINT "FK_91a7ffebe8b406c4470845d4781" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification_settings" DROP CONSTRAINT "FK_91a7ffebe8b406c4470845d4781"`);
        await queryRunner.query(`ALTER TABLE "pets" DROP CONSTRAINT "FK_4ddf2615c9d24b5be6d26830b4b"`);
        await queryRunner.query(`ALTER TABLE "devices" DROP CONSTRAINT "FK_bd378ace1af20893f64035a07f2"`);
        await queryRunner.query(`ALTER TABLE "devices" DROP CONSTRAINT "FK_5e9bee993b4ce35c3606cda194c"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_49291f4397a09af4eae014d7d07"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_9a8a82462cab47c73d25f49261f"`);
        await queryRunner.query(`ALTER TABLE "food_levels" DROP CONSTRAINT "FK_5eba9a8fa75a65aca1b9b082178"`);
        await queryRunner.query(`ALTER TABLE "schedules" DROP CONSTRAINT "FK_249663b434d4a5303673c34edaa"`);
        await queryRunner.query(`ALTER TABLE "feeding_events" DROP CONSTRAINT "FK_c39f2d5bf15136b9f5959b19429"`);
        await queryRunner.query(`ALTER TABLE "feeding_events" DROP CONSTRAINT "FK_1654e6e4a30393591e1de226129"`);
        await queryRunner.query(`ALTER TABLE "feeding_events" DROP CONSTRAINT "FK_4733999aa1af92e23464b23e0fe"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "notification_settings"`);
        await queryRunner.query(`DROP TABLE "pets"`);
        await queryRunner.query(`DROP TYPE "public"."pets_species_enum"`);
        await queryRunner.query(`DROP TABLE "devices"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
        await queryRunner.query(`DROP TABLE "food_levels"`);
        await queryRunner.query(`DROP TABLE "schedules"`);
        await queryRunner.query(`DROP TABLE "feeding_events"`);
        await queryRunner.query(`DROP TYPE "public"."feeding_events_type_enum"`);
    }

}
