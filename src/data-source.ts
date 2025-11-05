import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { entities } from './common/entities';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'feedlypet',
  password: process.env.DB_PASSWORD || 'feedlypet_password',
  database: process.env.DB_NAME || 'feedlypet_db',
  entities: entities,
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});
