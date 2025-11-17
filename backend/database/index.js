import knex from 'knex';
import config from '../knexfile.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const environment = process.env.NODE_ENV || 'development';
const db = knex(config[environment]);

export default db;

