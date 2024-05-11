import { FastifyInstance, FastifyPluginOptions, FastifyRequest } from 'fastify';
import { createPokemon, getPokemons, type Pokemon } from '../clients/pokemon';
import { pokemonSchema, pokemonWithoutIdSchema } from '../schemas';

type FastifyRequestGet = FastifyRequest<{
  Querystring: {
    name: Array<string>;
    type: Array<string>;
    sorting: Array<string>;
    sortDirection: 'asc' | 'desc';
  };
}>;

type FastifyRequestPost = FastifyRequest<{
  Body: Pokemon;
}>;

export default function (
  f: FastifyInstance,
  opts: FastifyPluginOptions,
  next: () => void
) {
  f.get(
    '/pokemon',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            name: {
              description:
                'Name of the pokemon to search for. Comma separated values.',
              type: 'array',
              items: { type: 'string', minLength: 3 },
              collectionFormat: 'csv'
            },
            type: {
              description:
                'Types of the pokemon to sort by. Comma separated values.',
              type: 'array',
              items: { type: 'string' },
              collectionFormat: 'csv'
            },
            sorting: {
              description:
                'Columns to sort by. Most columns should work fine. Comma separated values.',
              type: 'array',
              items: { type: 'string' },
              collectionFormat: 'csv'
            },
            sortDirection: {
              type: 'string',
              enum: ['asc', 'desc']
            }
          }
        },
        response: {
          200: { type: 'array', items: pokemonSchema }
        }
      }
    },
    async (request: FastifyRequestGet) => {
      const filters = {
        name: request.query.name ? request.query.name[0].split(',') : [],
        type: request.query.type ? request.query.type[0].split(',') : []
      };
      const sorting = {
        sortKeys: request.query.sorting
          ? request.query.sorting[0].split(',')
          : ['id'],
        sortDirection: request.query.sortDirection
          ? request.query.sortDirection
          : 'asc'
      };
      const pokemons = await getPokemons(filters, sorting);
      return pokemons;
    }
  );
  f.post(
    '/pokemon',
    {
      schema: {
        body: pokemonWithoutIdSchema,
        response: {
          200: pokemonSchema
        }
      }
    },
    async (request: FastifyRequestPost) => {
      const pokemon = await createPokemon(request.body);
      return pokemon;
    }
  );
  next();
}
