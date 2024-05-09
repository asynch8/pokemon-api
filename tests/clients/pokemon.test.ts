// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as db from '../../src/db';
import knex from 'knex';
import {
  createTracker,
  MockClient,
  RawQuery,
  type Tracker
} from 'knex-mock-client';
const knexClient = knex({ client: MockClient });
jest.mock('../../src/db', () => ({
  instance: jest.fn(() => {
    return knexClient;
  })
}));

import * as pokemonClient from '../../src/clients/pokemon';
import bulbasaur from '../../data/mock/bulbasaur.json';
import ivysaur from '../../data/mock/ivysaur.json';
import venusaur from '../../data/mock/venusaur.json';
const dbBulbarsaur = pokemonClient.PokemonToPokemonDb(bulbasaur);
const dbIvysaur = pokemonClient.PokemonToPokemonDb(ivysaur);
const dbVenusaur = pokemonClient.PokemonToPokemonDb(venusaur);

describe('Test client logic', () => {
  let tracker: Tracker;

  beforeAll(async () => {
    tracker = createTracker(knexClient);
  });
  afterEach(async () => {
    tracker.reset();
  });
  afterAll(async () => {
    jest.clearAllMocks();
  });
  it('getPokemonById - should return pokemon by id, without evolutions', async () => {
    tracker.on.select('pokemon').response([dbBulbarsaur]);
    const result = await pokemonClient.getPokemonById(1, false);
    expect(result).toEqual([bulbasaur]);
  });
  // TODO: Write test for deep evolution tree
  it('getPokemonById - should return pokemon by id, with evolutions', async () => {
    tracker.on
      .select(({ bindings }: RawQuery) => {
        return JSON.stringify(bindings) === JSON.stringify([1, 1]);
      })
      .response([dbBulbarsaur]);
    tracker.on
      .select(({ sql }: RawQuery) => {
        return sql.includes('order by');
      })
      .response([dbIvysaur, dbVenusaur]);
    const result = await pokemonClient.getPokemonById(1);
    expect(result).toEqual([
      bulbasaur,
      ivysaur,
      // There is a null value being converted to 0 here.
      pokemonClient.PokemonDbToPokemon(dbVenusaur)
    ]);
  });
});
