import { Knex } from 'knex';
import { instance } from '../db';

export interface Pokemon {
  id: number;
  pokedexNumber: string;
  name: string;
  img: string;
  type: string[];
  height: string;
  weight: string;
  candy: string;
  candyCount: number;
  egg: string;
  spawnChance: number;
  avgSpawns: number;
  spawnTime: string;
  multipliers: number[];
  weaknesses: string[];
  prevEvolution: Evolution[];
  nextEvolution: Evolution[];
}
export interface Evolution {
  num: string;
  name: string;
}

export const PokemonDbToPokemon = (p: PokemonDb): Pokemon => ({
  id: p.id,
  pokedexNumber: p.num,
  name: p.name,
  img: p.img,
  type: JSON.parse(p.type),
  height: `${p.height} m`,
  weight: `${p.weight} kg`,
  candy: p.candy,
  candyCount: p.candy_count,
  egg: p.egg ? `${p.egg} km` : 'Not in Eggs',
  spawnChance: p.spawn_chance,
  avgSpawns: p.avg_spawns,
  spawnTime: p.spawn_time,
  weaknesses: JSON.parse(p.weaknesses),
  prevEvolution: JSON.parse(p.prev_evolution),
  nextEvolution: JSON.parse(p.next_evolution),
  multipliers: JSON.parse(p.multipliers)
});

interface PokemonDb {
  id: number;
  // Opted for not making the num the actual db ID,
  // as the pokedex might have different pokedex numbers in different games.
  num: string;
  name: string;
  img: string;
  type: string;
  height: number;
  weight: number;
  candy: string;
  candy_count: number;
  egg: number;
  spawn_chance: number;
  avg_spawns: number;
  spawn_time: string;
  multipliers: string;
  weaknesses: string;
  prev_evolution: string;
  next_evolution: string;
}

/**
 * getPokemons - Fetches pokemons based off of filters and sorting.
 * @param filter
 * @param sorting
 * @returns Pokemon[]
 */
export async function getPokemons(
  filter: {
    name?: string[];
    id?: number[];
    type?: string[];
  } = {},
  sorting: {
    sortKeys: string[];
    sortDirection: 'asc' | 'desc';
  } = {
    sortKeys: ['id'],
    sortDirection: 'asc'
  }
): Promise<Pokemon[]> {
  const knex = await (instance() as Knex);
  const query = knex.select('*').from('pokemon');
  if (filter) {
    if (filter.id) {
      if (!Array.isArray(filter.id)) {
        // probably best to simply remove this
        query.where('id', filter.id);
      } else {
        query.whereIn('id', filter.id);
      }
    }
    if (filter.type) {
      if (Array.isArray(filter.type)) {
        for (const type of filter.type) {
          if (type === filter.type[0]) {
            query.where('type', 'like', `%${type}%`);
          } else {
            query.orWhere('type', 'like', `%${type}%`);
          }
        }
      } else {
        query.where('type', 'like', `%${filter.type}%`);
      }
    }
    if (filter.name) {
      for (const name of filter.name) {
        if (name === filter.name[0]) {
          query.where('name', 'like', `%${name}%`);
        } else {
          query.orWhere('name', 'like', `%${name}%`);
        }
      }
    }
  }
  if (sorting) {
    query.orderBy(
      sorting.sortKeys.map((key, i) => ({
        column: key,
        ...(i === 0 ? { order: sorting.sortDirection } : {})
      }))
    );
  }
  const stored = (await query).map(PokemonDbToPokemon);
  return stored;
}

/**
 * getWeakPokemon - Fetches pokemon that are:
 * - 1. Weak against a type of the pokemon with the given id
 * - 2. Does not have a type that is strong against the pokemon with the given id
 * @param id
 * @returns
 */
export async function getWeakPokemon(id: number): Promise<Pokemon[]> {
  const knex = await (instance() as Knex);
  console.log(id);
  const stored: Pokemon = PokemonDbToPokemon(
    await knex.select('*').from('pokemon').where('id', id).first()
  );
  const params: string[] = [];
  const notTypes = stored.weaknesses
    .map((weakness) => {
      params.push(`%${weakness}%`);
      return `type NOT LIKE ?`;
    })
    .join(' AND ');
  const weaknesses = stored.type
    .map((type) => {
      params.push(`%${type}%`);
      return `weaknesses LIKE ?`;
    })
    .join(' OR ');
  const query = knex
    .select('*')
    .from('pokemon')
    .whereRaw(
      `(${notTypes}) 
        AND 
        (${weaknesses})`,
      params
    );
  console.log(
    `(${notTypes}) 
    AND 
    (${weaknesses})`,
    params
  );
  return (await query).map(PokemonDbToPokemon);
}

/**
 * getPokemonById - Fetches a pokemon by its id
 * @param id Id of the pokemon to fetch
 * @param includeEvolutions Includes the evolutions of the pokemon if true. Defaults to true
 * @returns Pokemon[] | null
 */

export async function getPokemonById(
  id: number,
  includeEvolutions = true
): Promise<Pokemon[] | null> {
  const knex = await (instance() as Knex);
  const stored: Pokemon = PokemonDbToPokemon(
    await knex.select('*').from('pokemon').where('id', id).first()
  );

  // TODO: Could probably be optimized to a single query together with the stored query,
  // but for now it's fine.
  const evolutions = includeEvolutions
    ? await getPokemons({
        id: [
          ...(Array.isArray(stored.prevEvolution)
            ? stored.prevEvolution.map((e: Evolution) => Number(e.num))
            : []),
          ...(Array.isArray(stored.nextEvolution)
            ? stored.nextEvolution.map((e: Evolution) => Number(e.num))
            : [])
        ]
      })
    : [];

  return [
    stored,
    ...evolutions // I had two approaches in mind for including it in the return data.
    // Either I replace the properties with the actual pokemon data
    // or I keep it as is and return the pokemon in an array.
    // I opted for the latter approach as then I won't have to change the Pokemon type specifically for this function.
  ];
}

export async function addPokemonEvolutions(
  pokedexNumber: string,
  newPrevEvolution: Evolution[] = [],
  newNextEvolution: Evolution[] = []
): Promise<Pokemon> {
  const knex = await (instance() as Knex);
  const dbPokemon = await knex
    .select('*')
    .from('pokemon')
    .where('num', pokedexNumber)
    .first();
  console.log(dbPokemon);
  const pokemon = PokemonDbToPokemon(dbPokemon);
  console.log(pokemon);
  const update: { next_evolution: Evolution[]; prev_evolution: Evolution[] } = {
    next_evolution: pokemon.nextEvolution ?? [],
    prev_evolution: pokemon.prevEvolution ?? []
  };

  if (newPrevEvolution.length > 0) {
    update['prev_evolution'] =
      update['prev_evolution'].concat(newPrevEvolution);
  }
  if (newNextEvolution.length > 0) {
    update['next_evolution'] =
      update['next_evolution'].concat(newNextEvolution);
  }
  await knex('pokemon')
    .where('num', pokedexNumber)
    .update({
      next_evolution: JSON.stringify(update.next_evolution),
      prev_evolution: JSON.stringify(update.prev_evolution)
    });
  // TODO: Return the fetched pokemon instead of making another query.
  // This is a bit redundant, but not a big deal and at least gives me a garantuee
  // that only the changes sucessfully saved to the database are returned.
  return PokemonDbToPokemon(
    await knex.select('*').from('pokemon').where('num', pokedexNumber).first()
  );
}

/**
 * createPokemon - Creates a pokemon
 * @param pokemon Pokemon to create
 * @returns Pokemon
 */
export async function createPokemon(pokemon: Pokemon): Promise<Pokemon> {
  const knex = await (instance() as Knex);
  const prevEvolution = pokemon.prevEvolution;
  const nextEvolution = pokemon.nextEvolution;
  const createPokemon = {
    num: pokemon.pokedexNumber,
    name: pokemon.name,
    img: pokemon.img,
    type: JSON.stringify(pokemon.type),
    height: Number(pokemon.height.split(' ')[0]),
    weight: Number(pokemon.weight.split(' ')[0]),
    candy: pokemon.candy,
    candy_count: pokemon.candyCount,
    egg: Number(pokemon.egg.split(' ')[0]),
    spawn_chance: pokemon.spawnChance,
    avg_spawns: pokemon.avgSpawns,
    spawn_time: pokemon.spawnTime,
    multipliers: JSON.stringify(pokemon.multipliers),
    weaknesses: JSON.stringify(pokemon.weaknesses),
    prev_evolution: JSON.stringify(pokemon.prevEvolution),
    next_evolution: JSON.stringify(pokemon.nextEvolution)
  };
  const [id] = await knex('pokemon').insert(createPokemon);
  const evolution: Evolution = {
    num: createPokemon.num,
    name: createPokemon.name
  };
  // TODO: This logic should technically be rewritten
  // Right now, I think this code should work, but if the user starts making wacky
  // evolution journeys, then it might not fit the requirement.
  // So, if one of the previous evolutions does not contain all of the previous evolutions

  // EDIT: This should now work. check has been added.
  if (prevEvolution.length > 0) {
    for (let i = 0; i < prevEvolution.length; i++) {
      const pEvolution = prevEvolution[i];
      const prevEvPokemon: Pokemon = PokemonDbToPokemon(
        await knex
          .select('*')
          .from('pokemon')
          .where('num', pEvolution.num)
          .first()
      );
      prevEvPokemon.prevEvolution.forEach((element) => {
        if (!prevEvolution.find((e) => e.num === element.num)) {
          prevEvolution.push(element);
        }
      });
      await addPokemonEvolutions(pEvolution.num, [], [evolution]);
    }
  }
  if (nextEvolution.length > 0) {
    for (let i = 0; i < nextEvolution.length; i++) {
      const nEvolution = nextEvolution[i];
      const nextEvPokemon: Pokemon = PokemonDbToPokemon(
        await knex
          .select('*')
          .from('pokemon')
          .where('num', nEvolution.num)
          .first()
      );
      nextEvPokemon.prevEvolution.forEach((element) => {
        if (!prevEvolution.find((e) => e.num === element.num)) {
          prevEvolution.push(element);
        }
      });
      await addPokemonEvolutions(nEvolution.num, [], [evolution]);
    }
    for (const nEvolution of nextEvolution) {
      await addPokemonEvolutions(nEvolution.num, [evolution], []);
    }
  }
  return { ...pokemon, id };
}