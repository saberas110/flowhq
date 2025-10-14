import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DATABASE_HOST!,
    port: parseInt(process.env.DATABASE_PORT!, 10),
    username: process.env.DATABASE_USERNAME!,
    password: process.env.DATABASE_PASSWORD!,
    database: process.env.DATABASE_NAME!,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: process.env.APP_ENV === 'development',
    logging: process.env.APP_ENV === 'development',
    // ssl:
    //   process.env.APP_ENV === 'production'
    //     ? { rejectUnauthorized: false }
    //     : false,
    ssl: false,
  }),
);
