import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config } from 'dotenv';
import { DataSourceOptions } from "typeorm";
config();

export const typeOrmConfig: TypeOrmModuleOptions & DataSourceOptions = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER || 'feedlypet',
    password: process.env.DB_PASSWORD || 'feedlypet_password',
    database: process.env.DB_NAME || 'feedlypet_db',
    entities: ['src/common/entities/*.ts'],
    migrations: ['dist/migrations/*.js'],
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
};
