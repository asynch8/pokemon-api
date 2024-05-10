import { start as startServer } from './server';
import { init as initDb } from './db';
import config from './config';
export const start = async () => {
  await initDb(config.dbLocation, config.migrate, config.seed);
  console.log('Database is ready');
  const server = await startServer({ port: config.port, host: config.host });
  console.log('Server is ready, listening on', server.addresses());
};
start();
