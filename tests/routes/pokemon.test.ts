import { FastifyInstance } from 'fastify';
import { init as initDb } from '../../src/db';
import { start as startServer } from '../../src/server';
import { Knex } from 'knex';
//import { pokemon } from '../../data/pokemon.json';
import suggested from '../../data/mock/suggested.json';
import grassPokemonSortedByWeightAsc from '../../data/mock/grass-pokemon-sorted-by-weight-asc.json';
import mockBulbasaur from '../../data/mock/bulbasaur.json';
const mockIvysaur = {
  id: 2,
  pokedexNumber: '002',
  name: 'Ivysaur',
  img: 'http://www.serebii.net/pokemongo/pokemon/002.png',
  type: ['Grass', 'Poison'],
  height: '0.99 m',
  weight: '13 kg',
  candy: 'Bulbasaur Candy',
  candyCount: 100,
  egg: 'Not in Eggs',
  spawnChance: 0.042,
  avgSpawns: 4.2,
  spawnTime: '07:00',
  multipliers: [1.2, 1.6],
  weaknesses: ['Fire', 'Ice', 'Flying', 'Psychic'],
  prevEvolution: [
    {
      num: '001',
      name: 'Bulbasaur'
    }
  ],
  nextEvolution: [
    {
      num: '003',
      name: 'Venusaur'
    }
  ]
};
const mockVenusaur = {
  id: 3,
  pokedexNumber: '003',
  name: 'Venusaur',
  img: 'http://www.serebii.net/pokemongo/pokemon/003.png',
  type: ['Grass', 'Poison'],
  height: '2.01 m',
  weight: '100 kg',
  candy: 'Bulbasaur Candy',
  candyCount: null,
  egg: 'Not in Eggs',
  spawnChance: 0.017,
  avgSpawns: 1.7,
  spawnTime: '11:30',
  multipliers: null,
  weaknesses: ['Fire', 'Ice', 'Flying', 'Psychic'],
  prevEvolution: [
    {
      num: '001',
      name: 'Bulbasaur'
    },
    {
      num: '002',
      name: 'Ivysaur'
    }
  ],
  nextEvolution: null
};
const mockPokemon = [mockBulbasaur, mockIvysaur, mockVenusaur];

describe('GET /pokemon', () => {
  let app: FastifyInstance;
  let knex: Knex;
  beforeAll(async () => {
    // TODO: Should maybe decrease the size of the test db, but for now this is fine.
    // Tests to take a bit of time to prepare though.
    knex = await initDb('./data/test.sqlite3', true, true);
    app = await startServer({
      port: 8512
    });
  }, 10000);
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
    expect(json[0]).toEqual(mockBulbasaur);
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
    expect(json).toEqual(grassPokemonSortedByWeightAsc);
  });
  it('GET /pokemon?name=sa - should not return any pokemon if the name is shorter than 2 characters.', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/pokemon?name=sa'
    });
    expect(response.statusCode).not.toBe(200);
    console.log('response', response.statusCode);
  });
  it('GET /pokemon?name=saur - should return pokemon filtered by name', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/pokemon?name=saur'
    });
    expect(response.statusCode).toBe(200);
    const json = await response.json();
    expect(json).toHaveLength(3);
    expect(json).toEqual(mockPokemon);
  });

  it('GET /pokemon/:id should return the pokemon and its evolutions', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/pokemon/1'
    });
    expect(response.statusCode).toBe(200);
    const json = await response.json();
    expect(json).toEqual(mockPokemon);
  });
  it('GET /pokemon/:id/suggest', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/pokemon/1/suggest'
    });
    expect(response.statusCode).toBe(200);
    const json = await response.json();
    expect(json).toEqual(suggested);
  });
});
