import Knex from 'knex';
import { up } from '../db/migrations/20240506210104_init_db';
import { seed } from '../db/seeds/init';
let knex: Knex.Knex | null = null;

export async function init(
  filename: string = './data/db.sqlite3',
  runMigrations = false,
  runSeeds = false
) {
  knex = Knex({
    client: 'sqlite3', // or 'better-sqlite3'
    connection: {
      filename
    },
    useNullAsDefault: true
  });
  const exists = await knex.schema.hasTable('pokemon');
  if (!exists) {
    if (!runMigrations) {
      console.error('Run migrations first.');
      process.exit(1);
    }
    console.debug('Running migrations');
    await up(knex as Knex.Knex);
  }
  const pokemon = await (knex as Knex.Knex)('pokemon').first();
  if (!pokemon) {
    if (runSeeds) {
      console.debug('Running seeds');
      await seed(knex as Knex.Knex);
    } else {
      console.log(
        "Pokemon database seems to be empty. This could be an indication you're doing something wrong, or that you haven't ran npm run seeds yet"
      );
    }
  }

  return knex;
}

export const instance = (): Knex.Knex | null => knex;
