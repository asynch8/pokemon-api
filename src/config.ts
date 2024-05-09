import dotenv from 'dotenv';
dotenv.config();
interface Config {
  port: number;
  dbLocation: string;
  seed: boolean;
  migrate: boolean;
}
const config: Config = {
  port: process.env.PORT ? Number(process.env.PORT) : 8080,
  seed: process.env.SEED?.toLocaleLowerCase() === 'true',
  migrate: process.env.MIGRATE?.toLowerCase() === 'true',
  dbLocation: process.env.DB_LOCATION ?? './data/db.sqlite3'
};
export default config;
