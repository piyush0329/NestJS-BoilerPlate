import * as dotenv from 'dotenv';
import { SnakeNamingStrategy } from './src/snake-naming.strategy';
import './src/boilerplate.polyfill';

if (!(module as any).hot /* for webpack HMR */) {
    process.env.NODE_ENV = process.env.NODE_ENV || 'development';
}

dotenv.config({
    path: `.${process.env.NODE_ENV}.env`,
});

// Replace \\n with \n to support multiline strings in AWS
for (const envName of Object.keys(process.env)) {
    process.env[envName] = process.env[envName].replace(/\\n/g, '\n');
}

module.exports = {
    type: 'postgres', // mysql,postgres
    host: process.env.POSTGRES_HOST,
    port: +process.env.POSTGRES_PORT,
    username: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
    synchronize: true,
    namingStrategy: new SnakeNamingStrategy(),
    entities: [
        'src/modules/**/*.entity{.ts,.js}',
    ],
    migrations: [
        'src/migrations/*{.ts,.js}',
    ],
};
