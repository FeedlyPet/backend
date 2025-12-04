import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';
import * as crypto from 'crypto';

export class AddMqttPasswordToDevices1763690000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'devices',
      new TableColumn({
        name: 'mqtt_password_hash',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );

    const devices = await queryRunner.query('SELECT id FROM devices');
    for (const device of devices) {
      const password = crypto.randomBytes(32).toString('base64').slice(0, 32);
      const hash = crypto.createHash('sha256').update(password).digest('hex');
      await queryRunner.query(
        'UPDATE devices SET mqtt_password_hash = $1 WHERE id = $2',
        [hash, device.id],
      );
    }

    await queryRunner.query(
      'ALTER TABLE devices ALTER COLUMN mqtt_password_hash SET NOT NULL',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('devices', 'mqtt_password_hash');
  }
}