import { start as startServer } from './server';
import { init as initDb } from './db';
import config from './config';
export const start = () =>
  initDb(config.dbLocation, config.migrate, config.seed).then(async () => {
    console.log('Database is ready');
    await startServer({ port: config.port });
    console.log('Server is ready');
  });
start();
