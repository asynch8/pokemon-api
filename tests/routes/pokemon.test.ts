import { FastifyInstance } from 'fastify';
import { init as initDb } from '../../src/db';
import { start as startServer } from '../../src/server';
import { Knex } from 'knex';
//import { pokemon } from '../../data/pokemon.json';
import suggested from '../../data/mock/suggested.json';
import {
  PokemonToPokemonDb,
  PokemonDbToPokemon
} from '../../src/clients/pokemon';
import grassPokemonSortedByWeightAsc from '../../data/mock/grass-pokemon-sorted-by-weight-asc.json';
import mockBulbasaur from '../../data/mock/bulbasaur.json';
import mockVenusaur from '../../data/mock/venusaur.json';
import mockIvysaur from '../../data/mock/ivysaur.json';
const mockPokemon = [mockBulbasaur, mockIvysaur, mockVenusaur];

describe('Pokemon routes', () => {
  let app: FastifyInstance;
  let knex: Knex;
  beforeAll(async () => {
    // TODO: Should maybe decrease the size of the test db, but for now this is fine.
    // Tests to take a bit of time to prepare though.
    knex = await initDb(':memory:', true, true);
    app = await startServer({
      host: 'localhost',
      port: 8512
    });
  }, 15000);
  afterAll(async () => {
    await knex.destroy().catch(console.error);
    await app.close().catch(console.error);
  });
  it('GET /pokemon - should return all pokemon', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/pokemon'
    });
    expect(response.statusCode).toBe(200);
    const json = await response.json();
    expect(json).toHaveLength(151);
    const eq = PokemonDbToPokemon(
      PokemonToPokemonDb({ ...mockBulbasaur, id: 1 })
    );
    expect(json[0]).toEqual(eq);
  });
  it('GET /pokemon?type=grass - should return pokemon filtered by type', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/pokemon?type=grass'
    });
    expect(response.statusCode).toBe(200);
    const json = await response.json();
    expect(json).toHaveLength(14);
  });
  it('GET /pokemon?type=grass&sorting=weight - should return pokemon filtered by type and sorted by weight', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/pokemon?type=grass&sorting=weight'
    });
    expect(response.statusCode).toBe(200);
    const json = await response.json();
    expect(json).toHaveLength(14);
    expect(json).toEqual(
      grassPokemonSortedByWeightAsc.map((p) =>
        PokemonDbToPokemon(PokemonToPokemonDb(p))
      )
    );
  });
  it('GET /pokemon?name=sa - should not return any pokemon if the name is shorter than 2 characters.', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/pokemon?name=sa'
    });
    expect(response.statusCode).toBe(400);
  });
  it('GET /pokemon?name=saur - should return pokemon filtered by name', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/pokemon?name=saur'
    });
    expect(response.statusCode).toBe(200);
    const json = await response.json();
    expect(json).toHaveLength(3);
    expect(json).toEqual(
      mockPokemon.map((p, index) =>
        PokemonDbToPokemon(PokemonToPokemonDb({ ...p, id: index + 1 }))
      )
    );
  });

  it('GET /pokemon/:id should return the pokemon and its evolutions', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/pokemon/1'
    });
    expect(response.statusCode).toBe(200);
    const json = await response.json();
    expect(json).toEqual(
      mockPokemon.map((p, index) =>
        PokemonDbToPokemon(PokemonToPokemonDb({ ...p, id: index + 1 }))
      )
    );
  });
  it('GET /pokemon/:id/suggest', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/pokemon/1/suggest'
    });
    expect(response.statusCode).toBe(200);
    const json = await response.json();
    expect(json).toEqual(
      suggested.map((p) => PokemonDbToPokemon(PokemonToPokemonDb(p)))
    );
  });
  it('POST /pokemon - should create a new pokemon', async () => {
    const mockCreate = {
      name: 'saursaur',
      pokedexNumber: '152',
      img: 'test',
      type: ['Test'],
      height: '1 m',
      weight: '1 kg',
      candy: 'Test Candy',
      candyCount: 1,
      egg: 'Test Egg',
      spawnChance: 0.1,
      avgSpawns: 1,
      spawnTime: '12:00',
      weaknesses: ['Test'],
      multipliers: [1],
      prevEvolution: [{ num: '001', name: 'Bulbasaur' }],
      nextEvolution: [{ num: '003', name: 'Venusaur' }]
    };
    const createPokemon = await app.inject({
      method: 'POST',
      url: '/pokemon',
      payload: mockCreate
    });
    expect(createPokemon.statusCode).toBe(200);
    const json = await createPokemon.json();
    expect(json).toEqual({ id: 152, ...mockCreate });
    const pkmnResponse = await app.inject({
      method: 'GET',
      url: '/pokemon?name=saur'
    });
    const createdPokemons = pkmnResponse.json();
    expect(createdPokemons).toHaveLength(4);
  });
});
